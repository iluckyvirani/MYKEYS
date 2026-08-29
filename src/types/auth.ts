// import { UserRole, UserStatus } from "@prisma/client";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING"
}

export enum UserRole {
  USER = "USER",
  OWNER = "OWNER",
  AGENT = "AGENT",
  SERVICE = "SERVICE",
  ADMIN = "ADMIN"
}

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
  roles: string[];
  status: UserStatus;

  // Personal Information
  birthDate: string | null;
  gender: string | null;

  // Address Information
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;

  // Emergency Contact
  emergencyName: string | null;
  emergencyContact: string | null;

  // Owner specific
  companyName: string | null;
  taxId: string | null;
  website: string | null;
  listingSellerType: "AGENT" | "PROPERTY_OWNER" | null;
  agentLogo: string | null;

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
  companyName?: string;
  website?: string;
}

/**
 * Become Owner Request
 */
export interface BecomeOwnerRequest {
  companyName?: string;
  taxId?: string;
  website?: string;
}

/**
 * Become Owner Response
 */
export interface BecomeOwnerResponse {
  success: boolean;
  message: string;
  data: RegisterData;
}

// resgster response 
export interface RegisterData {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

/**
 * Register Response
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: RegisterData;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Data (inside data)
export interface LoginData {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}


/**
 * Login Response
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
}

/**
 * Get profile Response
 */

export interface MeResponse {
  data: UserDTO;
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
  birthDate?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  emergencyName?: string;
  emergencyContact?: string;
  companyName?: string;
  taxId?: string;
  website?: string;
  listingSellerType?: "AGENT" | "PROPERTY_OWNER" | "";
  agentLogo?: string;
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
