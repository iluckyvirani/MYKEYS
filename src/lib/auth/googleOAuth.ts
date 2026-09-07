import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { generateTokenPair } from "@/lib/auth/jwt";
import { toUserDTO, primaryRoleFromAssignments } from "@/lib/auth/helpers";
import { emailService } from "@/lib/email/emailService";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    clientId,
    clientSecret,
    appUrl,
    redirectUri: `${appUrl}/api/auth/google/callback`,
    configured: Boolean(clientId && clientSecret),
  };
}

function stateSecret() {
  return (
    process.env.JWT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    "google-oauth-state"
  );
}

function signStatePayload(payload: string) {
  const sig = createHash("sha256")
    .update(`${payload}.${stateSecret()}`)
    .digest("hex");
  return `${payload}.${sig}`;
}

function verifyStatePayload(state: string): string | null {
  const lastDot = state.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = state.slice(0, lastDot);
  const sig = state.slice(lastDot + 1);
  const expected = createHash("sha256")
    .update(`${payload}.${stateSecret()}`)
    .digest("hex");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return payload;
}

export function buildGoogleAuthUrl(opts?: { redirect?: string }) {
  const { clientId, redirectUri, configured } = getGoogleOAuthConfig();
  if (!configured) {
    throw new Error("Google Sign-In is not configured");
  }

  const redirect = sanitizeRedirect(opts?.redirect || "/");
  const nonce = randomBytes(16).toString("hex");
  const payload = Buffer.from(
    JSON.stringify({ redirect, nonce, ts: Date.now() }),
    "utf8"
  ).toString("base64url");
  const state = signStatePayload(payload);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function parseGoogleOAuthState(state: string | null): {
  redirect: string;
} | null {
  if (!state) return null;
  const payload = verifyStatePayload(state);
  if (!payload) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { redirect?: string; ts?: number };
    if (!parsed.ts || Date.now() - parsed.ts > 15 * 60 * 1000) return null;
    return { redirect: sanitizeRedirect(parsed.redirect || "/") };
  } catch {
    return null;
  }
}

export function sanitizeRedirect(path: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

type GoogleTokenResponse = {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
};

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("Google token exchange failed:", text);
    throw new Error("Failed to exchange Google authorization code");
  }

  const tokens = (await tokenRes.json()) as GoogleTokenResponse;

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!profileRes.ok) {
    const text = await profileRes.text();
    console.error("Google userinfo failed:", text);
    throw new Error("Failed to fetch Google profile");
  }

  const profile = (await profileRes.json()) as GoogleUserInfo;
  if (!profile.sub || !profile.email) {
    throw new Error("Google profile missing email");
  }
  if (profile.email_verified === false) {
    throw new Error("Google email is not verified");
  }

  return profile;
}

function splitName(profile: GoogleUserInfo) {
  const first =
    profile.given_name?.trim() ||
    profile.name?.trim()?.split(/\s+/)[0] ||
    "User";
  const last =
    profile.family_name?.trim() ||
    profile.name?.trim()?.split(/\s+/).slice(1).join(" ") ||
    "";
  return { firstName: first, lastName: last || " " };
}

/**
 * Find or create MYKEYS user from Google profile, then issue JWT pair.
 */
export async function loginOrRegisterWithGoogle(profile: GoogleUserInfo) {
  const email = profile.email.trim().toLowerCase();
  const { firstName, lastName } = splitName(profile);

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: profile.sub }, { email }],
    },
    include: { roles: true },
  });

  let isNew = false;

  if (!user) {
    isNew = true;
    user = await prisma.user.create({
      data: {
        email,
        password: null,
        firstName,
        lastName,
        avatar: profile.picture || null,
        status: "ACTIVE",
        emailVerified: true,
        authProvider: "GOOGLE",
        googleId: profile.sub,
        lastLoginAt: new Date(),
        roles: {
          create: { role: "USER" },
        },
      },
      include: { roles: true },
    });

    void emailService.sendWelcomeEmail(email, firstName).catch((err) => {
      console.error("Welcome email after Google signup failed:", err);
    });
  } else {
    if (user.status === "SUSPENDED") {
      throw new Error("ACCOUNT_SUSPENDED");
    }
    if (user.status === "INACTIVE") {
      throw new Error("ACCOUNT_INACTIVE");
    }

    const updates: {
      googleId?: string;
      authProvider?: string;
      emailVerified?: boolean;
      status?: "ACTIVE";
      avatar?: string;
      lastLoginAt: Date;
      firstName?: string;
      lastName?: string;
    } = {
      lastLoginAt: new Date(),
    };

    if (!user.googleId) updates.googleId = profile.sub;
    if (user.authProvider === "EMAIL") updates.authProvider = "BOTH";
    else if (!user.authProvider) updates.authProvider = "GOOGLE";

    if (!user.emailVerified) updates.emailVerified = true;
    if (user.status === "PENDING") updates.status = "ACTIVE";
    if (!user.avatar && profile.picture) updates.avatar = profile.picture;
    if ((!user.firstName || user.firstName === "User") && firstName) {
      updates.firstName = firstName;
    }
    if ((!user.lastName || !user.lastName.trim()) && lastName.trim()) {
      updates.lastName = lastName;
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      include: { roles: true },
    });

    const hasRole = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id },
    });
    if (!hasRole) {
      await prisma.userRoleAssignment.create({
        data: { userId: user.id, role: "USER" },
      });
      user = await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { roles: true },
      });
    }
  }

  const primaryRole = primaryRoleFromAssignments(user.roles);
  const { accessToken, refreshToken } = await generateTokenPair(
    user.id,
    user.email,
    primaryRole
  );
  const userDTO = await toUserDTO(user);

  return { user: userDTO, accessToken, refreshToken, isNew };
}
