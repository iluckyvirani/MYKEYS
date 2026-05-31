import { User } from "@prisma/client";
import { UserDTO, UserRole, UserStatus } from "@/types/auth";
import { prisma } from "@/lib/prisma";

/**
 * Read logged-in user from localStorage (handles both raw UserDTO and wrapped shapes)
 */
export function getStoredUserFromLocalStorage(): UserDTO | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserDTO | { data?: UserDTO };
    if (parsed && typeof parsed === "object" && "data" in parsed && parsed.data) {
      return parsed.data;
    }
    return parsed as UserDTO;
  } catch {
    return null;
  }
}

/**
 * Convert Prisma User model to UserDTO (exclude password)
 */
export async function toUserDTO(user: User): Promise<UserDTO> {
  // Fetch user roles from UserRoleAssignment
  const roleAssignments = await prisma.userRoleAssignment.findMany({
    where: { userId: user.id },
  });

  // Convert roles to strings (database returns string, ensure consistency)
  const roles = roleAssignments.map((ra) => ra.role as string);

  // If no roles found, default to USER
  if (roles.length === 0) {
    roles.push("USER");
  }

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    roles: roles,
    status: user.status as UserStatus,
    birthDate: user.birthDate,
    address: user.address,
    city: user.city,
    state: user.state,
    country: user.country,
    zipCode: user.zipCode,
    emergencyName: user.emergencyName,
    emergencyContact: user.emergencyContact,
    companyName: user.companyName,
    taxId: user.taxId,
    website: user.website,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Normalize role assignments to an ordered unique role list
 */
export function extractUserRolesFromAssignments(
  roleAssignments: { role: string }[]
): string[] {
  const ROLE_ORDER = ["USER", "OWNER", "SERVICE", "ADMIN"] as const;
  const roleSet = new Set(roleAssignments.map((r) => r.role));
  const ordered = ROLE_ORDER.filter((role) => roleSet.has(role));
  return ordered.length > 0 ? [...ordered] : ["USER"];
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
export function canAccessOwnerFeatures(user: UserDTO): boolean {
  return user.roles.some((r) => r === "OWNER") || user.roles.some((r) => r === "ADMIN");
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserDTO): boolean {
  return user.roles.some((r) => r === "ADMIN");
}

/**
 * Check if user has owner role
 */
export function hasOwnerRole(user: UserDTO): boolean {
  return user.roles.some((r) => r === "OWNER");
}

/**
 * Check if user has role
 */
export function hasRole(user: UserDTO, role: UserRole): boolean {
  return user.roles.includes(role);
}

/**
 * Check if user account is active
 */
export function isAccountActive(user: UserDTO): boolean {
  return user.status === "ACTIVE";
}
