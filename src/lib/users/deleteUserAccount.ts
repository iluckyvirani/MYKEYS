import { prisma } from "@/lib/prisma";

/**
 * Permanently delete a user and all data that blocks FK constraints.
 * Prisma schema does not cascade every relation, so we clean up explicitly.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const propertyIds = (
      await tx.property.findMany({
        where: { ownerId: userId },
        select: { id: true },
      })
    ).map((p) => p.id);

    const guestBookingIds = (
      await tx.booking.findMany({
        where: { guestId: userId },
        select: { id: true },
      })
    ).map((b) => b.id);

    const ownerBookingIds = (
      await tx.booking.findMany({
        where: { ownerId: userId },
        select: { id: true },
      })
    ).map((b) => b.id);

    const propertyBookingIds = propertyIds.length
      ? (
          await tx.booking.findMany({
            where: { propertyId: { in: propertyIds } },
            select: { id: true },
          })
        ).map((b) => b.id)
      : [];

    const allBookingIds = [
      ...new Set([...guestBookingIds, ...ownerBookingIds, ...propertyBookingIds]),
    ];

    const serviceProvider = await tx.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (serviceProvider) {
      const providerId = serviceProvider.id;

      const providerBookingIds = (
        await tx.serviceBooking.findMany({
          where: { providerId },
          select: { id: true },
        })
      ).map((b) => b.id);

      const clientBookingIds = (
        await tx.serviceBooking.findMany({
          where: { clientId: userId },
          select: { id: true },
        })
      ).map((b) => b.id);

      const serviceBookingIds = [...new Set([...providerBookingIds, ...clientBookingIds])];

      if (serviceBookingIds.length) {
        await tx.serviceReview.deleteMany({
          where: { bookingId: { in: serviceBookingIds } },
        });
        await tx.serviceBooking.deleteMany({
          where: { id: { in: serviceBookingIds } },
        });
      }

      await tx.serviceReview.deleteMany({
        where: { OR: [{ userId }, { providerId }] },
      });

      await tx.serviceRequest.deleteMany({
        where: { OR: [{ clientId: userId }, { providerId }] },
      });

      await tx.serviceProvider.delete({
        where: { id: providerId },
      });
    } else {
      const clientBookingIds = (
        await tx.serviceBooking.findMany({
          where: { clientId: userId },
          select: { id: true },
        })
      ).map((b) => b.id);

      if (clientBookingIds.length) {
        await tx.serviceReview.deleteMany({
          where: { bookingId: { in: clientBookingIds } },
        });
        await tx.serviceBooking.deleteMany({
          where: { id: { in: clientBookingIds } },
        });
      }

      await tx.serviceReview.deleteMany({ where: { userId } });
      await tx.serviceRequest.deleteMany({ where: { clientId: userId } });
    }

    await tx.inquiryReminder.deleteMany({ where: { createdById: userId } });
    await tx.inquiryMessage.deleteMany({ where: { senderId: userId } });

    if (propertyIds.length) {
      await tx.inquiry.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await tx.adCampaign.deleteMany({ where: { propertyId: { in: propertyIds } } });
    }

    await tx.inquiry.deleteMany({ where: { userId } });

    if (allBookingIds.length) {
      await tx.review.deleteMany({ where: { bookingId: { in: allBookingIds } } });
      await tx.payment.deleteMany({ where: { bookingId: { in: allBookingIds } } });
      await tx.booking.deleteMany({ where: { id: { in: allBookingIds } } });
    }

    await tx.review.deleteMany({ where: { userId } });

    const ownerPackageIds = (
      await tx.ownerPackage.findMany({
        where: { ownerId: userId },
        select: { id: true },
      })
    ).map((p) => p.id);

    if (ownerPackageIds.length) {
      await tx.ownerPackage.updateMany({
        where: { id: { in: ownerPackageIds } },
        data: { lastPaymentId: null },
      });
      await tx.payment.deleteMany({
        where: { OR: [{ packageId: { in: ownerPackageIds } }, { userId }] },
      });
      await tx.ownerPackage.deleteMany({ where: { id: { in: ownerPackageIds } } });
    } else {
      await tx.payment.deleteMany({ where: { userId } });
    }

    await tx.adCampaign.deleteMany({ where: { ownerId: userId } });
    await tx.report.deleteMany({ where: { ownerId: userId } });

    if (propertyIds.length) {
      await tx.property.deleteMany({ where: { id: { in: propertyIds } } });
    }

    await tx.user.delete({ where: { id: userId } });
  });
}
