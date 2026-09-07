// src/types/favorite.ts

/**
 * Favorite Types
 */

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export interface FavoriteWithProperty extends Favorite {
  property: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string | null;
    latitude: number | null;
    longitude: number | null;
    propertyType: string;
    listingType: string;
    rentalType: string | null;
    price: number;
    priceType: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number | null;
    guests: number;
    minStay: number;
    maxStay: number | null;
    status: string;
    isFeatured: boolean;
    images: PropertyImage[];
    amenities: PropertyAmenity[];
    reviews: {
      rating: number;
    }[];
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      avatar: string | null;
    };
  };
}

export interface PropertyImage {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  order: number;
}

export interface PropertyAmenity {
  id: string;
  amenity: {
    id: string;
    name: string;
    icon: string | null;
    category: string;
  };
}

export interface AddFavoriteRequest {
  propertyId: string;
}

export interface RemoveFavoriteRequest {
  propertyId: string;
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
  data?: Favorite | null;
}

export interface FavoritesListResponse {
  success: boolean;
  message: string;
  data?: {
    items: FavoriteWithProperty[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
}

export interface CheckFavoriteResponse {
  success: boolean;
  message: string;
  data?: {
    isFavorite: boolean;
    favoriteId: string | null;
  } | null;
}