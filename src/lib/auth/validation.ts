import { z } from "zod";

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email must be at least 5 characters")
  .max(255, "Email must not exceed 255 characters")
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

/**
 * Phone validation schema (Indian format)
 */
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid phone number format")
  .optional();

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .trim();

/**
 * Register Request Validation
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: z.enum(["USER", "OWNER", "ADMIN"]).optional().default("USER"),
  // Owner-specific fields
  companyName: z.string().min(2).max(100).optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

/**
 * Login Request Validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Phone validation for profile updates (UK + international flexible)
 */
export const profilePhoneSchema = z
  .string()
  .max(20, "Phone must not exceed 20 characters")
  .regex(/^[\d\s+()-]*$/, "Invalid phone number format")
  .optional()
  .or(z.literal(""));

/**
 * Update Profile Validation
 */
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: profilePhoneSchema,
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  // Personal Information
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;
        const [y, m, d] = val.split("-").map(Number);
        const born = new Date(y, m - 1, d);
        if (Number.isNaN(born.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        born.setHours(0, 0, 0, 0);
        return born <= today;
      },
      { message: "Date of birth cannot be in the future" }
    )
    .refine(
      (val) => {
        if (!val) return true;
        const age = (() => {
          const [y, m, d] = val.split("-").map(Number);
          const born = new Date(y, m - 1, d);
          const today = new Date();
          let a = today.getFullYear() - born.getFullYear();
          const md = today.getMonth() - born.getMonth();
          if (md < 0 || (md === 0 && today.getDate() < born.getDate())) a -= 1;
          return a;
        })();
        return age >= 16;
      },
      { message: "You must be at least 16 years old" }
    ),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().or(z.literal("")),
  // Address Information
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  // Emergency Contact
  emergencyName: nameSchema.optional(),
  emergencyContact: profilePhoneSchema,
  // Owner-specific fields
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  companyName: z.string().min(2).max(100).optional().or(z.literal("")),
  taxId: z.string().max(50).optional().or(z.literal("")),
  listingSellerType: z.enum(["AGENT", "PROPERTY_OWNER"]).optional().or(z.literal("")),
  agentLogo: z.string().url("Invalid agent logo URL").optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.listingSellerType === "AGENT") {
    if (!data.phone || !String(data.phone).trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required for estate agents",
        path: ["phone"],
      });
    }
    if (!data.agentLogo || !String(data.agentLogo).trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agent logo is required for estate agents",
        path: ["agentLogo"],
      });
    }
    if (!data.companyName || !String(data.companyName).trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agency / company name is required for estate agents",
        path: ["companyName"],
      });
    }
  }
});

/**
 * Change Password Validation
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Forgot Password Validation
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset Password Validation
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Refresh Token Validation
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Generic validation helper
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return { success: false, errors };
}
