import { User } from "@prisma/client";
import { UserDTO } from "@/types/auth";

/**
 * Convert Prisma User model to UserDTO (exclude password)
 */
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    companyName: user.companyName,
    taxId: user.taxId,
    bio: user.bio,
    website: user.website,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Get user's full name
 */
export function getUserFullName(user: User | UserDTO): string {
  return `${user.firstName} ${user.lastName}`;
}

/**
 * Check if user can access owner features
 */
export function canAccessOwnerFeatures(user: User | UserDTO): boolean {
  return user.role === "OWNER" || user.role === "ADMIN";
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | UserDTO): boolean {
  return user.role === "ADMIN";
}

/**
 * Check if user account is active
 */
export function isAccountActive(user: User | UserDTO): boolean {
  return user.status === "ACTIVE";
}
