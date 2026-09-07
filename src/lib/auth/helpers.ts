import { User } from "@prisma/client";
import { UserDTO, UserRole, UserStatus } from "@/types/auth";
import { prisma } from "@/lib/prisma";

/** Scalar + roles only — never select UK bank columns (they may not be migrated yet). */
export const authUserSelect = {
  id: true,
  email: true,
  phone: true,
  password: true,
  firstName: true,
  lastName: true,
  avatar: true,
  status: true,
  authProvider: true,
  googleId: true,
  birthDate: true,
  gender: true,
  address: true,
  city: true,
  state: true,
  country: true,
  zipCode: true,
  emergencyName: true,
  emergencyContact: true,
  companyName: true,
  taxId: true,
  website: true,
  listingSellerType: true,
  agentLogo: true,
  stripeCustomerId: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  roles: true,
} as const;

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
    gender: user.gender,
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
    listingSellerType:
      user.listingSellerType === "AGENT" ||
      user.listingSellerType === "PROPERTY_OWNER"
        ? user.listingSellerType
        : null,
    agentLogo: user.agentLogo,
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
  const ROLE_ORDER = ["USER", "OWNER", "AGENT", "SERVICE", "ADMIN"] as const;
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
 * Pick JWT primary role from role assignments (highest privilege wins).
 */
export function primaryRoleFromAssignments(
  roles: { role: string }[] | string[] | undefined
): string {
  const roleSet = new Set(
    (roles ?? []).map((r) => (typeof r === "string" ? r : r.role))
  );
  if (roleSet.has("ADMIN")) return "ADMIN";
  if (roleSet.has("OWNER")) return "OWNER";
  if (roleSet.has("AGENT")) return "AGENT";
  if (roleSet.has("SERVICE")) return "SERVICE";
  return "USER";
}

/**
 * Check if user can access owner features
 */
export function canAccessOwnerFeatures(user: UserDTO): boolean {
  return (
    user.roles.some((r) => r === "OWNER" || r === "AGENT") ||
    user.roles.some((r) => r === "ADMIN")
  );
}

/**
 * Check if user can access agent features
 */
export function canAccessAgentFeatures(user: UserDTO): boolean {
  return user.roles.some((r) => r === "AGENT") || user.roles.some((r) => r === "ADMIN");
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
 * Check if user has agent role
 */
export function hasAgentRole(user: UserDTO): boolean {
  return user.roles.some((r) => r === "AGENT");
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
