import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { JWTPayload } from "@/lib/auth/jwt";
import { successResponse, errorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";
import {
  getTrackingSnapshot,
  pingProviderLocation,
  startEnRoute,
} from "@/lib/services/serviceTracking";

async function providerForUser(userId: string) {
  return prisma.serviceProvider.findUnique({
    where: { userId },
    select: { id: true },
  });
}

/**
 * GET /api/service/bookings/[id]/tracking
 * Live map snapshot for the client or the assigned professional.
 */
export const GET = withAuth<{ id: string }>(async (_req, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;
    const provider = await providerForUser(user.userId);
    const snapshot = await getTrackingSnapshot(id, {
      userId: user.userId,
      providerId: provider?.id,
    });
    return successResponse(snapshot, "Tracking retrieved");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load tracking";
    const code = message === "Unauthorized" ? 403 : message === "Booking not found" ? 404 : 400;
    return errorResponse(message, code);
  }
});

/**
 * POST /api/service/bookings/[id]/tracking
 * Provider starts sharing ("start") or sends a live GPS ping ("ping").
 */
export const POST = withAuth<{ id: string }>(async (req: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;
    const provider = await providerForUser(user.userId);
    if (!provider) return errorResponse("Service provider profile not found", 404);

    const body = await req.json().catch(() => ({}));
    const action = body.action === "start" ? "start" : "ping";
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const destLat = body.destinationLat != null ? Number(body.destinationLat) : undefined;
    const destLng = body.destinationLng != null ? Number(body.destinationLng) : undefined;

    const snapshot =
      action === "start"
        ? await startEnRoute(
            id,
            provider.id,
            { lat, lng },
            destLat != null && destLng != null ? { lat: destLat, lng: destLng } : null
          )
        : await pingProviderLocation(id, provider.id, { lat, lng });

    return successResponse(snapshot, action === "start" ? "Live location sharing started" : "Location updated");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update location";
    const code = message === "Unauthorized" ? 403 : 400;
    return errorResponse(message, code);
  }
});
