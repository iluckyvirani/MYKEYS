// src/lib/favorites/service.ts

import { prisma } from "@/lib/prisma";
import { Favorite, FavoriteWithProperty } from "@/types/favorite";

/**
 * Add a property to user's favorites
 */
export async function addFavorite(
  userId: string,
  propertyId: string
): Promise<Favorite> {
  // Check if property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existing) {
    throw new Error("Property already in favorites");
  }

  // Create favorite
  const favorite = await prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
  });

  // Increment property saves count
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      saves: {
        increment: 1,
      },
    },
  });

  return favorite;
}

/**
 * Remove a property from user's favorites
 */
export async function removeFavorite(
  userId: string,
  propertyId: string
): Promise<void> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (!favorite) {
    throw new Error("Favorite not found");
  }

  // Delete favorite
  await prisma.favorite.delete({
    where: {
      id: favorite.id,
    },
  });

  // Decrement property saves count
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      saves: {
        decrement: 1,
      },
    },
  });
}

/**
 * Get user's favorite properties with pagination
 */
export async function getUserFavorites(
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ items: FavoriteWithProperty[]; total: number }> {
  const skip = (page - 1) * pageSize;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      skip,
      take: pageSize,
      include: {
        property: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
            images: {
              orderBy: {
                order: "asc",
              },
            },
            amenities: {
              include: {
                amenity: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.favorite.count({
      where: { userId },
    }),
  ]);

  return { items: favorites, total };
}

/**
 * Check if a property is favorited by user
 */
export async function checkFavorite(
  userId: string,
  propertyId: string
): Promise<{ isFavorite: boolean; favoriteId: string | null }> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  return {
    isFavorite: !!favorite,
    favoriteId: favorite?.id || null,
  };
}

/**
 * Get favorite IDs for a user (useful for bulk checking)
 */
export async function getUserFavoritePropertyIds(
  userId: string
): Promise<string[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: {
      propertyId: true,
    },
  });

  return favorites.map((f: { propertyId: string }) => f.propertyId);
}

/**
 * Toggle favorite (add if not exists, remove if exists)
 */
export async function toggleFavorite(
  userId: string,
  propertyId: string
): Promise<{ action: "added" | "removed"; favorite: Favorite | null }> {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existing) {
    await removeFavorite(userId, propertyId);
    return { action: "removed", favorite: null };
  } else {
    const favorite = await addFavorite(userId, propertyId);
    return { action: "added", favorite };
  }
}