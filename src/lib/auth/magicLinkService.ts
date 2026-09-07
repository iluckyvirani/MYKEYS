import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/emailService";
import { generateTokenPair } from "@/lib/auth/jwt";
import { toUserDTO, primaryRoleFromAssignments } from "@/lib/auth/helpers";
import { hashOtp, maskEmail } from "@/lib/auth/otp";
import { getAppBaseUrl } from "@/lib/email/emailLayout";

const MAGIC_LINK_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAGIC_LINK_COOLDOWN_SECONDS = 60;

export function generateMagicLinkToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function detectDeviceFromUserAgent(ua: string | null | undefined): string {
  const s = String(ua || "").toLowerCase();
  if (!s) return "Unknown device";
  if (s.includes("iphone") || s.includes("ipad")) return "iOS";
  if (s.includes("android")) return "Android";
  if (s.includes("mac os") || s.includes("macintosh")) return "macOS";
  if (s.includes("windows")) return "Windows";
  if (s.includes("linux")) return "Linux";
  return "Unknown device";
}

export async function requestMagicLinkLogin(opts: {
  email: string;
  redirect?: string;
  requestMeta?: {
    requestedAt?: Date;
    timeZone?: string;
    device?: string;
  };
}) {
  const email = String(opts.email || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      status: true,
      magicLinkLastSentAt: true,
    },
  });

  // Always return a generic success shape to avoid email enumeration
  const generic = {
    sent: true as const,
    emailMasked: maskEmail(email),
    expiresInMinutes: 10,
  };

  if (!user) return generic;
  if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
    throw new Error("This account cannot sign in right now.");
  }
  if (user.status === "PENDING") {
    throw new Error("ACCOUNT_PENDING");
  }

  const elapsed = user.magicLinkLastSentAt
    ? Math.floor((Date.now() - user.magicLinkLastSentAt.getTime()) / 1000)
    : MAGIC_LINK_COOLDOWN_SECONDS;
  const cooldownLeft = Math.max(0, MAGIC_LINK_COOLDOWN_SECONDS - elapsed);
  if (cooldownLeft > 0) {
    throw new Error(
      `Please wait ${cooldownLeft}s before requesting another link.`
    );
  }

  const rawToken = generateMagicLinkToken();
  const now = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      magicLinkTokenHash: hashOtp(rawToken),
      magicLinkExpiresAt: new Date(now.getTime() + MAGIC_LINK_TTL_MS),
      magicLinkLastSentAt: now,
    },
  });

  const redirect =
    opts.redirect &&
    opts.redirect.startsWith("/") &&
    !opts.redirect.startsWith("//")
      ? opts.redirect
      : "/";
  const link = `${getAppBaseUrl()}/auth/magic-link?token=${encodeURIComponent(
    rawToken
  )}&redirect=${encodeURIComponent(redirect)}`;

  const requestedAt = opts.requestMeta?.requestedAt || now;
  await emailService.sendMagicLinkLoginEmail({
    to: user.email,
    firstName: user.firstName || "there",
    signInUrl: link,
    expiresInMinutes: 10,
    requestedAt,
    timeZone: opts.requestMeta?.timeZone || "Europe/London",
    device: opts.requestMeta?.device || "Unknown device",
  });

  return generic;
}

export async function consumeMagicLinkToken(rawToken: string) {
  const token = String(rawToken || "").trim();
  if (!token || token.length < 20) {
    throw new Error("Invalid or expired sign-in link.");
  }

  const tokenHash = hashOtp(token);
  const user = await prisma.user.findFirst({
    where: {
      magicLinkTokenHash: tokenHash,
      magicLinkExpiresAt: { gt: new Date() },
    },
    include: { roles: true },
  });

  if (!user) {
    throw new Error("Invalid or expired sign-in link.");
  }

  if (user.status === "SUSPENDED") {
    throw new Error("Your account has been suspended.");
  }
  if (user.status === "INACTIVE") {
    throw new Error("Your account is inactive.");
  }
  if (user.status === "PENDING") {
    throw new Error("ACCOUNT_PENDING");
  }

  // One-time use
  await prisma.user.update({
    where: { id: user.id },
    data: {
      magicLinkTokenHash: null,
      magicLinkExpiresAt: null,
      lastLoginAt: new Date(),
      emailVerified: true,
    },
  });

  const primaryRole = primaryRoleFromAssignments(user.roles);
  const { accessToken, refreshToken } = await generateTokenPair(
    user.id,
    user.email,
    primaryRole
  );
  const userDTO = await toUserDTO(user);

  return { user: userDTO, accessToken, refreshToken };
}
