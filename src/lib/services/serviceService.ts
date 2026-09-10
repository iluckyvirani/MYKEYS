import { prisma } from '../prisma';

// ==================== Types ====================

export interface ServiceProviderInput {
  userId: string;
  bio?: string;
  category: string;
  categories?: string[]; // All selected category IDs
  subcategories: { id: string; name: string; category: string }[];
  serviceAreas: string[];
  specializations?: string[];
  certifications?: string[];
  instantBookingEnabled?: boolean;
  instantBookingPrice?: number;
}

export interface ServiceListingInput {
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  image?: string;
  status?: string;
}

export interface ServiceBookingInput {
  clientId: string;
  providerId: string;
  serviceListingId?: string;
  catalogServiceId?: string;
  service: string;
  category: string;
  subcategory?: string;
  serviceArea?: string;
  bookingType?: string;
  description?: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  location?: string;
  destinationLat?: number;
  destinationLng?: number;
  totalAmount: number;
  price?: number;
  commissionPercent?: number;
  commissionAmount?: number;
  providerEarnings?: number;
  stripePaymentIntentId?: string;
}

export interface ServiceRequestInput {
  clientId: string;
  providerId: string;
  serviceType: string;
  description?: string;
  location?: string;
  budget?: number;
  urgency?: string;
}

export interface ServiceReviewInput {
  bookingId: string;
  userId: string;
  providerId: string;
  rating: number;
  comment?: string;
}

export interface ServiceBookingFilter {
  providerId?: string;
  clientId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceRequestFilter {
  providerId?: string;
  clientId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceReviewFilter {
  providerId?: string;
  userId?: string;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EarningsFilter {
  providerId: string;
  period?: 'week' | 'month' | 'year' | 'all';
  fromDate?: Date;
  toDate?: Date;
}

// ==================== Helper to map enum strings ====================

function mapServiceCategory(cat: string) {
  const mapping: Record<string, string> = {
    'plumbing': 'PLUMBING',
    'cleaning': 'CLEANING',
    'ac-repair': 'AC_REPAIR',
    'electrical': 'ELECTRICAL',
    'painting': 'PAINTING',
    'carpentry': 'CARPENTRY',
    'appliance-repair': 'APPLIANCE_REPAIR',
    // also accept already-uppercase
    'PLUMBING': 'PLUMBING',
    'CLEANING': 'CLEANING',
    'AC_REPAIR': 'AC_REPAIR',
    'ELECTRICAL': 'ELECTRICAL',
    'PAINTING': 'PAINTING',
    'CARPENTRY': 'CARPENTRY',
    'APPLIANCE_REPAIR': 'APPLIANCE_REPAIR',
  };
  return mapping[cat] || 'PLUMBING';
}

function mapBookingStatus(status: string) {
  const mapping: Record<string, string> = {
    'pending': 'PENDING',
    'confirmed': 'CONFIRMED',
    'on-the-way': 'ON_THE_WAY',
    'in-progress': 'IN_PROGRESS',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
    'PENDING': 'PENDING',
    'CONFIRMED': 'CONFIRMED',
    'ON_THE_WAY': 'ON_THE_WAY',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
  };
  return mapping[status] || status;
}

function mapBookingStatusToFrontend(status: string): string {
  const mapping: Record<string, string> = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'ON_THE_WAY': 'on-the-way',
    'IN_PROGRESS': 'in-progress',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
  };
  return mapping[status] || String(status).toLowerCase().replace(/_/g, '-');
}

function mapRequestStatusToFrontend(status: string): string {
  const mapping: Record<string, string> = {
    'PENDING': 'pending',
    'ACCEPTED': 'accepted',
    'REJECTED': 'rejected',
  };
  return mapping[status] || status.toLowerCase();
}

function mapUrgencyToFrontend(urgency?: string | null): string {
  return (urgency || "MEDIUM").toLowerCase();
}

function mapPaymentStatusToFrontend(status: string): string {
  const mapping: Record<string, string> = {
    'PENDING': 'pending',
    'COMPLETED': 'completed',
    'FAILED': 'failed',
    'REFUNDED': 'refunded',
  };
  return mapping[status] || status.toLowerCase();
}

// ==================== Service ====================

export const serviceService = {
  // ======== SERVICE PROVIDER ========

  /**
   * Create or register a service provider profile
   */
  async createProvider(data: ServiceProviderInput) {
    // Check if already has a provider profile
    const existing = await prisma.serviceProvider.findUnique({
      where: { userId: data.userId },
    });
    if (existing) {
      throw new Error('User already has a service provider profile');
    }

    return prisma.serviceProvider.create({
      data: {
        userId: data.userId,
        bio: data.bio,
        category: data.category,
        categories: data.categories && data.categories.length > 0
          ? data.categories
          : [data.category],
        subcategories: data.subcategories as any,
        serviceAreas: data.serviceAreas as any,
        specializations: data.specializations as any,
        certifications: data.certifications as any,
        instantBookingEnabled: data.instantBookingEnabled ?? false,
        instantBookingPrice: data.instantBookingPrice,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            city: true,
            state: true,
          },
        },
      },
    });
  },

  /**
   * Get provider profile by userId
   */
  async getProviderByUserId(userId: string) {
    return prisma.serviceProvider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            city: true,
            state: true,
            createdAt: true,
          },
        },
        services: true,
      },
    });
  },

  /**
   * Update provider profile
   */
  async updateProvider(userId: string, data: Partial<ServiceProviderInput>) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });
    if (!provider) throw new Error('Service provider not found');

    const updateData: any = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.category) updateData.category = data.category;
    if (data.subcategories) updateData.subcategories = data.subcategories;
    if (data.serviceAreas) updateData.serviceAreas = data.serviceAreas;
    if (data.specializations !== undefined) updateData.specializations = data.specializations;
    if (data.certifications !== undefined) updateData.certifications = data.certifications;
    if (data.instantBookingEnabled !== undefined) updateData.instantBookingEnabled = data.instantBookingEnabled;
    if (data.instantBookingPrice !== undefined) updateData.instantBookingPrice = data.instantBookingPrice;

    return prisma.serviceProvider.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            city: true,
            state: true,
            createdAt: true,
          },
        },
        services: true,
      },
    });
  },

  // ======== SERVICE LISTINGS ========

  /**
   * Create a service listing
   */
  async createListing(providerId: string, data: ServiceListingInput) {
    return prisma.serviceListing.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        basePrice: data.basePrice,
        image: data.image,
        status: data.status || 'active',
        providerId,
      },
    });
  },

  /**
   * Get all listings for a provider
   */
  async getListings(providerId: string) {
    const listings = await prisma.serviceListing.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return listings.map((l: any) => ({
      id: l.id,
      name: l.name,
      category: l.category,
      description: l.description,
      basePrice: l.basePrice,
      rating: l.rating,
      reviews: l.reviews,
      status: l.status,
      image: l.image || '/api/placeholder/200/150',
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));
  },

  /**
   * Get a single listing
   */
  async getListingById(id: string) {
    return prisma.serviceListing.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Update a listing
   */
  async updateListing(id: string, providerId: string, data: Partial<ServiceListingInput>) {
    const listing = await prisma.serviceListing.findUnique({ where: { id } });
    if (!listing) throw new Error('Service listing not found');
    if (listing.providerId !== providerId) throw new Error('Unauthorized');

    return prisma.serviceListing.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  },

  /**
   * Delete a listing
   */
  async deleteListing(id: string, providerId: string) {
    const listing = await prisma.serviceListing.findUnique({ where: { id } });
    if (!listing) throw new Error('Service listing not found');
    if (listing.providerId !== providerId) throw new Error('Unauthorized');

    return prisma.serviceListing.delete({ where: { id } });
  },

  // ======== SERVICE BOOKINGS ========

  /**
   * Create a service booking
   */
  async createBooking(data: ServiceBookingInput) {
    const created = await prisma.serviceBooking.create({
      data: {
        service: data.service,
        category: data.category,
        subcategory: data.subcategory,
        serviceArea: data.serviceArea,
        bookingType: (data.bookingType === 'instant' ? 'INSTANT' : 'SCHEDULED') as any,
        description: data.description,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        location: data.location,
        ...(Number.isFinite(data.destinationLat) && Number.isFinite(data.destinationLng)
          ? { destinationLat: data.destinationLat, destinationLng: data.destinationLng }
          : {}),
        totalAmount: data.totalAmount,
        price: data.price ?? data.totalAmount,
        commissionPercent: data.commissionPercent,
        commissionAmount: data.commissionAmount,
        providerEarnings: data.providerEarnings,
        stripePaymentIntentId: data.stripePaymentIntentId,
        catalogServiceId: data.catalogServiceId,
        clientId: data.clientId,
        providerId: data.providerId,
        serviceListingId: data.serviceListingId,
        settleStatus: 'NOT_APPLICABLE',
      } as any,
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
        provider: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        catalogService: true,
      },
    });
    if (data.destinationLat != null && data.destinationLng != null) {
      const { persistBookingDestination } = await import("@/lib/services/serviceTracking");
      await persistBookingDestination(created.id, data.destinationLat, data.destinationLng);
    }
    return created;
  },

  /**
   * Get bookings with filters
   */
  async getBookings(filters: ServiceBookingFilter) {
    const {
      providerId,
      clientId,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Record<string, any> = {};
    if (providerId) where.providerId = providerId;
    if (clientId) where.clientId = clientId;
    if (status && status !== 'all') {
      where.status = mapBookingStatus(status) as any;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.serviceBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          provider: {
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          review: {
            select: { id: true, rating: true, comment: true, response: true },
          },
        },
      }),
      prisma.serviceBooking.count({ where }),
    ]);

    // Map to frontend shape
    const items = bookings.map((b: any) => ({
      id: b.id,
      clientName: `${b.client.firstName} ${b.client.lastName}`,
      clientPhone: b.client.phone || '',
      clientEmail: b.client.email,
      service: b.service,
      date: b.scheduledDate ? b.scheduledDate.toISOString().split('T')[0] : b.createdAt.toISOString().split('T')[0],
      time: b.scheduledTime || '',
      location: b.location || '',
      status: mapBookingStatusToFrontend(b.status),
      amount: b.totalAmount,
      description: b.description || '',
      paymentStatus: mapPaymentStatusToFrontend(b.paymentStatus),
      pendingAction: b.pendingAction,
      settleStatus: b.settleStatus,
      trackingActive: Boolean(b.trackingActive),
      destinationLat: b.destinationLat ?? null,
      destinationLng: b.destinationLng ?? null,
      reviewRating: b.review?.rating ?? null,
      reviewComment: b.review?.comment ?? null,
      reviewResponse: b.review?.response ?? null,
      createdAt: b.createdAt,
    }));

    return { items, total, page, limit };
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string) {
    const b = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        provider: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        review: true,
      },
    });
    if (!b) return null;

    return {
      id: b.id,
      clientName: `${b.client.firstName} ${b.client.lastName}`,
      clientPhone: b.client.phone || '',
      clientEmail: b.client.email,
      service: b.service,
      date: b.scheduledDate ? b.scheduledDate.toISOString().split('T')[0] : b.createdAt.toISOString().split('T')[0],
      time: b.scheduledTime || '',
      location: b.location || '',
      status: mapBookingStatusToFrontend(b.status),
      amount: b.totalAmount,
      description: b.description || '',
      paymentStatus: mapPaymentStatusToFrontend(b.paymentStatus),
      trackingActive: Boolean((b as { trackingActive?: boolean }).trackingActive),
      destinationLat: (b as { destinationLat?: number | null }).destinationLat ?? null,
      destinationLng: (b as { destinationLng?: number | null }).destinationLng ?? null,
      review: b.review,
      createdAt: b.createdAt,
    };
  },

  /**
   * Update booking status (non-terminal transitions only).
   * COMPLETED / CANCELLED must go through OTP verifyAction.
   */
  async updateBookingStatus(id: string, providerId: string, status: string) {
    const booking = await prisma.serviceBooking.findUnique({ where: { id } });
    if (!booking) throw new Error('Booking not found');
    if (booking.providerId !== providerId) throw new Error('Unauthorized');

    const mappedStatus = mapBookingStatus(status) as any;

    // Paid complete/cancel must use OTP. Unpaid decline can cancel directly.
    if (mappedStatus === 'COMPLETED') {
      throw new Error(
        'Complete requires tenant OTP confirmation. Use request-action instead.'
      );
    }
    if (mappedStatus === 'CANCELLED' && booking.paymentStatus === 'COMPLETED') {
      throw new Error(
        'Cancel after payment requires tenant OTP. Use request-action instead.'
      );
    }

    const updateData: any = { status: mappedStatus };
    if (mappedStatus === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.settleStatus = 'NOT_APPLICABLE';
    }

    return prisma.serviceBooking.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Provider requests COMPLETE or CANCEL — sends OTP to client email.
   */
  async requestBookingAction(
    id: string,
    providerId: string,
    action: 'COMPLETE' | 'CANCEL'
  ) {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, email: true, firstName: true } },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    if (!booking) throw new Error('Booking not found');
    if (booking.providerId !== providerId) throw new Error('Unauthorized');
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new Error('Booking is already finished');
    }
    if (action === 'COMPLETE' && booking.paymentStatus !== 'COMPLETED') {
      throw new Error('Booking must be paid before completion');
    }

    const { generateServiceActionOtp } = await import('@/lib/services/catalogService');
    const { otp, hash, expiresAt } = generateServiceActionOtp();

    await prisma.serviceBooking.update({
      where: { id },
      data: {
        pendingAction: action,
        actionOtpHash: hash,
        actionOtpExpiresAt: expiresAt,
      },
    });

    const { emailService } = await import('@/lib/email/emailService');
    try {
      await emailService.sendServiceActionOtpEmail({
        to: booking.client.email,
        firstName: booking.client.firstName,
        serviceName: booking.service,
        action,
        otp,
        providerName: `${booking.provider.user.firstName} ${booking.provider.user.lastName}`.trim(),
      });
    } catch (emailErr) {
      console.error("Service action OTP email failed:", emailErr);
      throw new Error(
        action === "CANCEL"
          ? "Could not send the cancel OTP email. Please try again."
          : "Could not send the completion OTP email. Please try again."
      );
    }

    try {
      const { notificationService } = await import(
        "@/lib/notifications/notificationService"
      );
      const {
        NotificationType,
        NotificationPriority,
        NotificationCategory,
      } = await import("@/types/notification");
      await notificationService.create({
        userId: booking.client.id,
        type: NotificationType.BOOKING,
        title:
          action === "CANCEL"
            ? "Confirm service cancellation"
            : "Confirm service completion",
        message:
          action === "CANCEL"
            ? `Your provider requested to cancel "${booking.service}". Enter the OTP we emailed you.`
            : `Your provider marked "${booking.service}" as done. Enter the OTP we emailed you.`,
        priority: NotificationPriority.HIGH,
        category: NotificationCategory.ACTION_REQUIRED,
        actionUrl: "/user/dashboard/service-bookings",
        data: { serviceBookingId: id, pendingAction: action },
      });
    } catch (notifyErr) {
      console.error("Service action OTP notification failed:", notifyErr);
    }

    return {
      pendingAction: action,
      expiresAt: expiresAt.toISOString(),
      clientEmailMasked: booking.client.email.replace(
        /(.{2}).+(@.+)/,
        '$1***$2'
      ),
    };
  },

  /**
   * Client verifies OTP → apply COMPLETE or CANCEL + settlement.
   */
  async verifyBookingActionOtp(id: string, clientId: string, otp: string) {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { select: { id: true, userId: true } },
      },
    });
    if (!booking) throw new Error('Booking not found');
    if (booking.clientId !== clientId) throw new Error('Unauthorized');
    if (!booking.pendingAction || !booking.actionOtpHash || !booking.actionOtpExpiresAt) {
      throw new Error('No pending action to verify');
    }
    if (booking.actionOtpExpiresAt.getTime() < Date.now()) {
      throw new Error('OTP expired. Ask the provider to request again.');
    }

    const { verifyServiceActionOtp } = await import('@/lib/services/catalogService');
    if (!verifyServiceActionOtp(otp, booking.actionOtpHash)) {
      throw new Error('Invalid OTP');
    }

    const action = booking.pendingAction;

    if (action === 'COMPLETE') {
      const earnings = booking.providerEarnings ?? booking.totalAmount;
      const updated = await prisma.serviceBooking.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          otpVerifiedAt: new Date(),
          pendingAction: null,
          actionOtpHash: null,
          actionOtpExpiresAt: null,
          trackingActive: false,
          settleStatus: 'PENDING',
          paymentStatus:
            booking.paymentStatus === 'COMPLETED' ? 'COMPLETED' : booking.paymentStatus,
          paidAmount:
            booking.paymentStatus === 'COMPLETED'
              ? booking.paidAmount || booking.totalAmount
              : booking.paidAmount,
        } as any,
      });

      const { stopTracking } = await import("@/lib/services/serviceTracking");
      await stopTracking(id);

      try {
        await prisma.serviceProvider.update({
          where: { id: booking.providerId },
          data: {
            completedBookings: { increment: 1 },
            totalEarnings: { increment: earnings },
          },
        });
      } catch (e) {
        console.error("Failed to increment provider stats after completion:", e);
      }

      try {
        const { settlementService } = await import('@/lib/services/settlementService');
        await settlementService.ensureServiceSettlement({
          serviceBookingId: id,
          beneficiaryUserId: booking.provider.userId,
          amount: earnings,
        });
      } catch (e) {
        console.error("Failed to create settlement after completion:", e);
      }

      const { notificationService } = await import(
        '@/lib/notifications/notificationService'
      );
      const {
        NotificationType,
        NotificationPriority,
        NotificationCategory,
      } = await import('@/types/notification');

      // Notify admins via any ADMIN role users — lightweight: use notification to provider + create admin notes via settle queue
      await notificationService
        .create({
          userId: booking.provider.userId,
          type: NotificationType.PROPERTY,
          title: 'Job completed — awaiting settle-up',
          message: `Client confirmed completion for "${booking.service}". Admin will settle £${earnings.toFixed(2)}.`,
          priority: NotificationPriority.NORMAL,
          category: NotificationCategory.INFORMATIONAL,
          actionUrl: '/service/dashboard/earnings',
        })
        .catch(() => undefined);

      // Notify all admins
      const admins = await prisma.userRoleAssignment.findMany({
        where: { role: 'ADMIN' },
        select: { userId: true },
      });
      for (const a of admins) {
        await notificationService
          .create({
            userId: a.userId,
            type: NotificationType.PAYMENT,
            title: 'Settle-up needed (service)',
            message: `Service job "${booking.service}" completed. Provider payout £${earnings.toFixed(2)} pending.`,
            priority: NotificationPriority.HIGH,
            category: NotificationCategory.ACTION_REQUIRED,
            actionUrl: '/admin/dashboard/settle-up',
            data: { serviceBookingId: id },
          })
          .catch(() => undefined);
      }

      return updated;
    }

    // CANCEL
    const updated = await prisma.serviceBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        otpVerifiedAt: new Date(),
        pendingAction: null,
        actionOtpHash: null,
        actionOtpExpiresAt: null,
        trackingActive: false,
        settleStatus: 'NOT_APPLICABLE',
      } as any,
    });

    const { stopTracking } = await import("@/lib/services/serviceTracking");
    await stopTracking(id);

    return updated;
  },

  async markBookingPaid(id: string, clientId: string, stripePaymentIntentId?: string) {
    const booking = await prisma.serviceBooking.findUnique({ where: { id } });
    if (!booking) throw new Error('Booking not found');
    if (booking.clientId !== clientId) throw new Error('Unauthorized');

    return prisma.serviceBooking.update({
      where: { id },
      data: {
        paymentStatus: 'COMPLETED',
        paidAmount: booking.totalAmount,
        status: booking.status === 'PENDING' ? 'CONFIRMED' : booking.status,
        ...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
      },
    });
  },

  // ======== SERVICE REQUESTS ========

  /**
   * Create a service request
   */
  async createRequest(data: ServiceRequestInput) {
    return prisma.serviceRequest.create({
      data: {
        serviceType: data.serviceType,
        description: data.description,
        location: data.location,
        budget: data.budget,
        urgency: (data.urgency?.toUpperCase() || 'MEDIUM') as any,
        clientId: data.clientId,
        providerId: data.providerId,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    });
  },

  /**
   * Get service requests with filters
   */
  async getRequests(filters: ServiceRequestFilter) {
    const {
      providerId,
      clientId,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Record<string, any> = {};
    if (providerId) where.providerId = providerId;
    if (clientId) where.clientId = clientId;
    if (status && status !== 'all') {
      where.status = status.toUpperCase() as any;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    const items = requests.map((r: any) => ({
      id: r.id,
      clientName: `${r.client.firstName} ${r.client.lastName}`,
      serviceType: r.serviceType,
      location: r.location || '',
      requestDate: r.createdAt.toISOString().split('T')[0],
      description: r.description || '',
      budget: r.budget || 0,
      status: mapRequestStatusToFrontend(r.status),
      urgency: mapUrgencyToFrontend(r.urgency),
    }));

    return { items, total, page, limit };
  },

  /**
   * Respond to a service request (accept / reject)
   */
  async respondToRequest(id: string, providerId: string, action: 'accept' | 'reject') {
    const request = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Service request not found');
    if (request.providerId !== providerId) throw new Error('Unauthorized');
    if (request.status !== 'PENDING') throw new Error('Request already responded to');

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: newStatus as any,
        respondedAt: new Date(),
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // If accepted, automatically create a booking from the request
    if (action === 'accept') {
      await prisma.serviceBooking.create({
        data: {
          service: request.serviceType,
          category: 'PLUMBING' as any, // default; can be refined
          description: request.description,
          location: request.location,
          totalAmount: request.budget || 0,
          clientId: request.clientId,
          providerId: request.providerId,
          status: 'CONFIRMED' as any,
        },
      });
    }

    return {
      id: updated.id,
      status: mapRequestStatusToFrontend(updated.status),
      respondedAt: updated.respondedAt,
    };
  },

  // ======== SERVICE REVIEWS ========

  /**
   * Create a service review
   */
  async createReview(data: ServiceReviewInput) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check booking exists
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: data.bookingId },
    });
    if (!booking) throw new Error('Booking not found');
    if (booking.clientId !== data.userId) throw new Error('You can only review your own bookings');

    // Check if already reviewed
    const existing = await prisma.serviceReview.findUnique({
      where: { bookingId: data.bookingId },
    });
    if (existing) throw new Error('This booking has already been reviewed');

    const review = await prisma.serviceReview.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        bookingId: data.bookingId,
        userId: data.userId,
        providerId: data.providerId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        booking: {
          select: { service: true },
        },
      },
    });

    // Update provider stats
    const stats = await prisma.serviceReview.aggregate({
      where: { providerId: data.providerId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.serviceProvider.update({
      where: { id: data.providerId },
      data: {
        rating: stats._avg.rating || 0,
        totalReviews: stats._count.id,
      },
    });

    // Also update listing stats if booking has a listing ref
    if (booking.serviceListingId) {
      const listingStats = await prisma.serviceReview.aggregate({
        where: {
          booking: {
            serviceListingId: booking.serviceListingId,
          },
        },
        _avg: { rating: true },
        _count: { id: true },
      });

      await prisma.serviceListing.update({
        where: { id: booking.serviceListingId },
        data: {
          rating: listingStats._avg.rating || 0,
          reviews: listingStats._count.id,
        },
      });
    }

    return review;
  },

  /**
   * Get reviews with filters
   */
  async getReviews(filters: ServiceReviewFilter) {
    const {
      providerId,
      userId,
      rating,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Record<string, any> = {};
    if (providerId) where.providerId = providerId;
    if (userId) where.userId = userId;
    if (rating) where.rating = rating;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.serviceReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          booking: {
            select: { service: true },
          },
        },
      }),
      prisma.serviceReview.count({ where }),
    ]);

    const items = reviews.map((r: any) => ({
      id: r.id,
      clientName: `${r.user.firstName} ${r.user.lastName}`,
      service: r.booking.service,
      rating: r.rating,
      review: r.comment || '',
      date: r.createdAt.toISOString().split('T')[0],
      helpful: r.helpfulCount,
      response: r.response,
    }));

    return { items, total, page, limit };
  },

  /**
   * Reply to a review
   */
  async replyToReview(reviewId: string, providerId: string, response: string) {
    const review = await prisma.serviceReview.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error('Review not found');
    if (review.providerId !== providerId) throw new Error('Unauthorized');

    return prisma.serviceReview.update({
      where: { id: reviewId },
      data: {
        response,
        respondedAt: new Date(),
      },
    });
  },

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string) {
    return prisma.serviceReview.update({
      where: { id: reviewId },
      data: {
        helpfulCount: { increment: 1 },
      },
    });
  },

  // ======== DASHBOARD & EARNINGS ========

  /**
   * Get dashboard stats for a service provider
   */
  async getDashboardStats(providerId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      provider,
      activeBookings,
      completedThisWeek,
      monthlyEarnings,
      weeklyEarnings,
      pendingRequests,
    ] = await Promise.all([
      prisma.serviceProvider.findUnique({
        where: { id: providerId },
        select: {
          rating: true,
          totalReviews: true,
          completedBookings: true,
          totalEarnings: true,
        },
      }),
      prisma.serviceBooking.count({
        where: {
          providerId,
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        },
      }),
      prisma.serviceBooking.count({
        where: {
          providerId,
          status: 'COMPLETED',
          completedAt: { gte: startOfWeek },
        },
      }),
      prisma.serviceBooking.aggregate({
        where: {
          providerId,
          status: 'COMPLETED',
          completedAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.serviceBooking.aggregate({
        where: {
          providerId,
          status: 'COMPLETED',
          completedAt: { gte: startOfWeek },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.serviceRequest.count({
        where: { providerId, status: 'PENDING' },
      }),
    ]);

    const thisMonthEarnings = monthlyEarnings._sum.totalAmount || 0;
    const thisWeekEarnings = weeklyEarnings._sum.totalAmount || 0;
    const thisMonthBookings = monthlyEarnings._count.id;

    // Pending payments (completed bookings with pending payment)
    const pendingPayments = await prisma.serviceBooking.aggregate({
      where: {
        providerId,
        status: 'COMPLETED',
        paymentStatus: 'PENDING',
      },
      _sum: { totalAmount: true },
    });

    return {
      activeBookings,
      totalEarnings: provider?.totalEarnings || 0,
      avgRating: provider?.rating || 0,
      totalReviews: provider?.totalReviews || 0,
      completedTasks: provider?.completedBookings || 0,
      pendingRequests,
      thisMonthEarnings,
      thisWeekEarnings,
      thisMonthBookings,
      completedThisWeek,
      pendingPayments: pendingPayments._sum.totalAmount || 0,
    };
  },

  /**
   * Get earnings data with charts
   */
  async getEarnings(filters: EarningsFilter) {
    const { providerId } = filters;
    const now = new Date();

    // Get all completed bookings for this provider
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const completedBookings = await prisma.serviceBooking.findMany({
      where: {
        providerId,
        status: 'COMPLETED',
        completedAt: { gte: startOfYear },
      },
      orderBy: { completedAt: 'asc' },
      select: {
        id: true,
        service: true,
        totalAmount: true,
        completedAt: true,
        paymentStatus: true,
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Weekly chart data (last 4 weeks)
    const weeklyChart: { week: string; earnings: number; bookings: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekBookings = completedBookings.filter((b: any) =>
        b.completedAt && b.completedAt >= weekStart && b.completedAt < weekEnd
      );
      const earnings = weekBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

      weeklyChart.push({
        week: `Week ${4 - i}`,
        earnings,
        bookings: weekBookings.length,
      });
    }

    // Monthly chart data (all months of this year up to current)
    const monthlyChart: { month: string; earnings: number }[] = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    for (let m = 0; m <= now.getMonth(); m++) {
      const monthStart = new Date(now.getFullYear(), m, 1);
      const monthEnd = new Date(now.getFullYear(), m + 1, 1);

      const monthBookings = completedBookings.filter((b: any) =>
        b.completedAt && b.completedAt >= monthStart && b.completedAt < monthEnd
      );
      const earnings = monthBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

      monthlyChart.push({
        month: months[m],
        earnings,
      });
    }

    // Recent transactions
    const recentBookings = await prisma.serviceBooking.findMany({
      where: {
        providerId,
        status: { in: ['COMPLETED', 'IN_PROGRESS', 'CONFIRMED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const transactions = recentBookings.map((b: any) => ({
      id: b.id,
      date: (b.completedAt || b.createdAt).toISOString().split('T')[0],
      description: `${b.service} - ${b.client.firstName} ${b.client.lastName}`,
      amount: b.totalAmount,
      status: mapPaymentStatusToFrontend(b.paymentStatus),
    }));

    // Summary stats
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisMonthBookings = completedBookings.filter((b: any) =>
      b.completedAt && b.completedAt >= startOfMonth
    );
    const thisWeekBookings = completedBookings.filter((b: any) =>
      b.completedAt && b.completedAt >= startOfWeek
    );

    const thisMonthEarnings = thisMonthBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);
    const thisWeekEarnings = thisWeekBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);
    const totalEarned = completedBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

    const pendingPayments = await prisma.serviceBooking.aggregate({
      where: {
        providerId,
        status: 'COMPLETED',
        paymentStatus: 'PENDING',
      },
      _sum: { totalAmount: true },
    });

    return {
      stats: {
        thisMonth: thisMonthEarnings,
        thisWeek: thisWeekEarnings,
        totalEarned,
        pending: pendingPayments._sum.totalAmount || 0,
        thisMonthBookings: thisMonthBookings.length,
        thisWeekBookings: thisWeekBookings.length,
      },
      weeklyChart,
      monthlyChart,
      transactions,
    };
  },

  // ======== PROFILE ========

  /**
   * Get service profile for the dashboard
   */
  async getProfile(userId: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            city: true,
            state: true,
            createdAt: true,
          },
        },
      },
    });

    if (!provider) throw new Error('Service provider profile not found');

    return {
      name: `${provider.user.firstName} ${provider.user.lastName}`,
      email: provider.user.email,
      phone: provider.user.phone || '',
      city: provider.user.city || '',
      state: provider.user.state || '',
      bio: provider.bio || '',
      specializations: (provider.specializations as string[]) || [],
      certifications: (provider.certifications as string[]) || [],
      joinDate: provider.user.createdAt.toISOString().split('T')[0],
      completedBookings: provider.completedBookings,
      rating: provider.rating,
      reviews: provider.totalReviews,
      avatar: provider.user.avatar,
      category: provider.category,
      categories: provider.categories || [],
      serviceAreas: (provider.serviceAreas as string[]) || [],
      documentVerified: provider.documentVerified,
      instantBookingEnabled: provider.instantBookingEnabled,
      instantBookingPrice: provider.instantBookingPrice,
    };
  },

  /**
   * Update service profile
   */
  async updateProfile(userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    bio?: string;
    category?: string;
    categories?: string[];
    specializations?: string[];
    certifications?: string[];
    serviceAreas?: string[];
    instantBookingEnabled?: boolean;
    instantBookingPrice?: number | null;
  }) {
    // Update user fields
    const userUpdate: any = {};
    if (data.name) {
      const parts = data.name.trim().split(' ');
      userUpdate.firstName = parts[0];
      userUpdate.lastName = parts.slice(1).join(' ') || '';
    }
    if (data.email !== undefined && data.email !== '') userUpdate.email = data.email;
    // Normalize empty string → null to avoid unique constraint violation on phone
    if (data.phone !== undefined) userUpdate.phone = data.phone.trim() || null;
    if (data.city !== undefined) userUpdate.city = data.city;
    if (data.state !== undefined) userUpdate.state = data.state;

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: userUpdate });
    }

    // Update provider fields
    const providerUpdate: any = {};
    if (data.bio !== undefined) providerUpdate.bio = data.bio;
    if (data.category !== undefined) providerUpdate.category = data.category;
    if (data.categories !== undefined && data.categories.length > 0) {
      providerUpdate.categories = data.categories;
      // keep primary category in sync with first selected
      if (!data.category) providerUpdate.category = data.categories[0];
    }
    if (data.specializations !== undefined) providerUpdate.specializations = data.specializations;
    if (data.certifications !== undefined) providerUpdate.certifications = data.certifications;
    if (data.serviceAreas !== undefined) providerUpdate.serviceAreas = data.serviceAreas;
    if (data.instantBookingEnabled !== undefined) providerUpdate.instantBookingEnabled = data.instantBookingEnabled;
    if (data.instantBookingPrice !== undefined) providerUpdate.instantBookingPrice = data.instantBookingPrice;

    if (Object.keys(providerUpdate).length > 0) {
      await prisma.serviceProvider.update({ where: { userId }, data: providerUpdate });
    }

    return this.getProfile(userId);
  },
};
