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

interface FavoriteFilters {
  search?: string;
  propertyType?: string; // 'short' | 'long' | 'buy'
  sortBy?: string;       // 'recent' | 'price_low' | 'price_high'
}

/**
 * Get user's favorite properties with pagination and optional filters
 */
export async function getUserFavorites(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  filters: FavoriteFilters = {}
): Promise<{ items: FavoriteWithProperty[]; total: number }> {
  const skip = (page - 1) * pageSize;

  // Build property where clause
  const propertyWhere: any = {};
  if (filters.search) {
    propertyWhere.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { city: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.propertyType === 'buy') {
    propertyWhere.listingType = 'BUY';
  } else if (filters.propertyType === 'short') {
    propertyWhere.listingType = 'RENT';
    propertyWhere.rentalType = 'SHORT_TERM';
  } else if (filters.propertyType === 'long') {
    propertyWhere.listingType = 'RENT';
    propertyWhere.rentalType = 'LONG_TERM';
  }

  const where: any = { userId };
  if (Object.keys(propertyWhere).length > 0) {
    where.property = propertyWhere;
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (filters.sortBy === 'price_low') orderBy = { property: { price: 'asc' } };
  else if (filters.sortBy === 'price_high') orderBy = { property: { price: 'desc' } };

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
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
      orderBy,
    }),
    prisma.favorite.count({ where }),
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