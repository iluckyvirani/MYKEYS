import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { JWTPayload } from "@/lib/auth/jwt";

export const GET = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          booking: {
            select: {
              id: true,
              checkIn: true,
              checkOut: true,
              property: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          package: {
            select: {
              id: true,
              package: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        return errorResponse("Payment not found", 404);
      }

      return successResponse(payment, "Payment details retrieved");
    } catch (error) {
      console.error("Error fetching payment:", error);
      return errorResponse("Failed to fetch payment", 500);
    }
  },
  { roles: ["ADMIN"] }
);

export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;
      const body = await request.json();
      const { status, metadata } = body;

      const payment = await prisma.payment.update({
        where: { id },
        data: {
          ...(status && { status: status.toUpperCase() }),
          ...(metadata && { metadata }),
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
      });

      return successResponse(payment, "Payment updated successfully");
    } catch (error) {
      console.error("Error updating payment:", error);
      return errorResponse("Failed to update payment", 500);
    }
  },
  { roles: ["ADMIN"] }
);
