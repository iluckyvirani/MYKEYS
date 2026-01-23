import { UserRole, UserStatus } from "@prisma/client";

/**
 * User Response DTO (Data Transfer Object)
 * Excludes sensitive information like password
 */
export interface UserDTO {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  companyName: string | null;
  taxId: string | null;
  bio: string | null;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * Register Request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: "USER" | "OWNER";
  companyName?: string;
  website?: string;
}

/**
 * Register Response
 */
export interface RegisterResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh Token Response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Update Profile Request
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  companyName?: string;
  taxId?: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Auth Context Type
 */
export interface AuthContext {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
