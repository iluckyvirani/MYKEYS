import { SignJWT, jwtVerify } from "jose";

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ||
    "your-super-secret-refresh-key-change-in-production"
);

const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string; // Changed from UserRole enum to string
  type: "access" | "refresh";
}

/**
 * Generate Access Token
 * Short-lived token for API access
 */
export async function generateAccessToken(
  userId: string,
  email: string,
  role: string
): Promise<string> {
  const token = await new SignJWT({
    userId,
    email,
    role,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer("mykeys-platform")
    .setAudience("mykeys-users")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Generate Refresh Token
 * Long-lived token for refreshing access tokens
 */
export async function generateRefreshToken(
  userId: string,
  email: string,
  role: string
): Promise<string> {
  const token = await new SignJWT({
    userId,
    email,
    role,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer("mykeys-platform")
    .setAudience("mykeys-users")
    .sign(JWT_REFRESH_SECRET);

  return token;
}

/**
 * Verify Access Token
 */
export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "mykeys-platform",
      audience: "mykeys-users",
    });

    if (payload.type !== "access") {
      return null;
    }

    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Verify Refresh Token
 */
export async function verifyRefreshToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
      issuer: "mykeys-platform",
      audience: "mykeys-users",
    });

    if (payload.type !== "refresh") {
      return null;
    }

    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return null;
  }
}

/**
 * Generate both tokens at once
 */
export async function generateTokenPair(
  userId: string,
  email: string,
  role: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(userId, email, role),
    generateRefreshToken(userId, email, role),
  ]);

  return { accessToken, refreshToken };
}
