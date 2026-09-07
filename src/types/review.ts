export type ReviewInput = {
  rating: number; // 1-5
  comment?: string;
  propertyId: string;
  userId: string;
  bookingId?: string;
  
  // Optional detailed ratings
  cleanlinessRating?: number;
  communicationRating?: number;
  accuracyRating?: number;
  locationRating?: number;
  valueRating?: number;
};

export type ReviewResponse = ReviewInput & {
  id: string;
  response?: string;
  isVerified: boolean;
  helpfulCount: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
};

export type ReviewFilter = {
  propertyId?: string;
  userId?: string;
  bookingId?: string;
  minRating?: number;
  maxRating?: number;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'createdAt' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
};

export type OwnerResponseInput = {
  response: string;
};

export type PropertyRatingStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  detailedRatings?: {
    cleanliness: number;
    communication: number;
    accuracy: number;
    location: number;
    value: number;
  };
};
