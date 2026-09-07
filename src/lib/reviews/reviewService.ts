import { prisma } from '../prisma';
import { ReviewInput, ReviewFilter, OwnerResponseInput, PropertyRatingStats } from '@/types/review';
import { Prisma } from '@prisma/client';

export const reviewService = {
  /**
   * Create a new review
   */
  async create(data: ReviewInput) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate detailed ratings if provided
    const detailedRatings = [
      data.cleanlinessRating,
      data.communicationRating,
      data.accuracyRating,
      data.locationRating,
      data.valueRating,
    ];

    for (const rating of detailedRatings) {
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        throw new Error('All ratings must be between 1 and 5');
      }
    }

    // Check if user has already reviewed this property for this booking
    if (data.bookingId) {
      const existingReview = await prisma.review.findUnique({
        where: { bookingId: data.bookingId },
      });
      if (existingReview) {
        throw new Error('You have already reviewed this booking');
      }
    }

    // Check if booking exists and is completed
    let isVerified = false;
    if (data.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.guestId !== data.userId) {
        throw new Error('You can only review your own bookings');
      }

      if (booking.status === 'COMPLETED' || booking.status === 'CHECKED_OUT') {
        isVerified = true;
      }
    }

    return prisma.review.create({
      data: {
        ...data,
        isVerified,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        booking: true,
      },
    });
  },

  /**
   * Get all reviews with filtering and pagination
   */
  async getAll(filters: ReviewFilter = {}) {
    const {
      propertyId,
      userId,
      bookingId,
      minRating,
      maxRating,
      isVerified,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.ReviewWhereInput = {};

    if (propertyId) where.propertyId = propertyId;
    if (userId) where.userId = userId;
    if (bookingId) where.bookingId = bookingId;
    if (isVerified !== undefined) (where as any).isVerified = isVerified;
    if (minRating || maxRating) {
      where.rating = {};
      if (minRating) where.rating.gte = minRating;
      if (maxRating) where.rating.lte = maxRating;
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          booking: {
            select: {
              id: true,
              checkIn: true,
              checkOut: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get reviews by property ID
   */
  async getByPropertyId(propertyId: string, filters: ReviewFilter = {}) {
    return this.getAll({ ...filters, propertyId });
  },

  /**
   * Get reviews by user ID
   */
  async getByUserId(userId: string, filters: ReviewFilter = {}) {
    return this.getAll({ ...filters, userId });
  },

  /**
   * Get a single review by ID
   */
  async getById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        booking: true,
      },
    });
  },

  /**
   * Update a review (user can only update their own review)
   */
  async update(id: string, data: Partial<ReviewInput>, userId: string) {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('You can only update your own reviews');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    return prisma.review.update({
      where: { id },
      data,
      include: {
        property: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        booking: true,
      },
    });
  },

  /**
   * Owner responds to a review
   */
  async addOwnerResponse(id: string, responseData: OwnerResponseInput, ownerId: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.property.ownerId !== ownerId) {
      throw new Error('You can only respond to reviews of your own properties');
    }

    return prisma.review.update({
      where: { id },
      data: {
        response: responseData.response,
        respondedAt: new Date(),
      },
      include: {
        property: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  },

  /**
   * Delete a review
   */
  async delete(id: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    return prisma.review.delete({
      where: { id },
    });
  },

  /**
   * Mark review as helpful
   */
  async markHelpful(id: string) {
    return prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      } as any, // Type assertion until migration is applied
    });
  },

  /**
   * Report review as inappropriate
   */
  async reportReview(id: string) {
    return prisma.review.update({
      where: { id },
      data: {
        reportCount: {
          increment: 1,
        },
      } as any, // Type assertion until migration is applied
    });
  },

  /**
   * Get property rating statistics
   */
  async getPropertyStats(propertyId: string): Promise<PropertyRatingStats> {
    const reviews = await prisma.review.findMany({
      where: { propertyId },
      select: {
        rating: true,
        cleanlinessRating: true,
        communicationRating: true,
        accuracyRating: true,
        locationRating: true,
        valueRating: true,
      },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calculate rating distribution
    const ratingDistribution = {
      1: reviews.filter((r) => r.rating === 1).length,
      2: reviews.filter((r) => r.rating === 2).length,
      3: reviews.filter((r) => r.rating === 3).length,
      4: reviews.filter((r) => r.rating === 4).length,
      5: reviews.filter((r) => r.rating === 5).length,
    };

    // Calculate detailed ratings if available
    const detailedRatings: PropertyRatingStats['detailedRatings'] = {
      cleanliness: 0,
      communication: 0,
      accuracy: 0,
      location: 0,
      value: 0,
    };

    let detailedCount = 0;
    for (const review of reviews) {
      if (review.cleanlinessRating) {
        detailedRatings.cleanliness += review.cleanlinessRating;
        detailedCount++;
      }
      if (review.communicationRating) {
        detailedRatings.communication += review.communicationRating;
      }
      if (review.accuracyRating) {
        detailedRatings.accuracy += review.accuracyRating;
      }
      if (review.locationRating) {
        detailedRatings.location += review.locationRating;
      }
      if (review.valueRating) {
        detailedRatings.value += review.valueRating;
      }
    }

    if (detailedCount > 0) {
      detailedRatings.cleanliness /= detailedCount;
      detailedRatings.communication /= detailedCount;
      detailedRatings.accuracy /= detailedCount;
      detailedRatings.location /= detailedCount;
      detailedRatings.value /= detailedCount;
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      ratingDistribution,
      detailedRatings: detailedCount > 0 ? detailedRatings : undefined,
    };
  },

  /**
   * Check if user can review a property (has completed booking)
   */
  async canUserReview(userId: string, propertyId: string): Promise<boolean> {
    const booking = await prisma.booking.findFirst({
      where: {
        guestId: userId,
        propertyId,
        status: {
          in: ['COMPLETED', 'CHECKED_OUT'],
        },
        review: null, // No review created yet
      },
    });

    return booking !== null;
  },
};
