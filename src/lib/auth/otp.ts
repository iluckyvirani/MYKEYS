import crypto from "crypto";
import {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/lib/auth/otpConstants";

export {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/lib/auth/otpConstants";

export function generateOtpCode(length = OTP_LENGTH): string {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(length, "0");
}

export function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

export function otpExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export function secondsUntilResend(
  lastSentAt: Date | null | undefined,
  now = new Date()
): number {
  if (!lastSentAt) return 0;
  const elapsed = Math.floor((now.getTime() - lastSentAt.getTime()) / 1000);
  return Math.max(0, OTP_RESEND_COOLDOWN_SECONDS - elapsed);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0] || "*"}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}
