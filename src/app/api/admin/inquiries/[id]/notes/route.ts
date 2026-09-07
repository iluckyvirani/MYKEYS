import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/inquiries/[id]/notes
 * Get all notes for a specific inquiry
 * Roles: ADMIN only
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload, context?: { params: { id: string } }) => {
    try {
      const inquiryId = context?.params?.id;

      if (!inquiryId) {
        return errorResponse(
          "Inquiry ID is required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Verify inquiry exists
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
      });

      if (!inquiry) {
        return errorResponse(
          "Inquiry not found",
          404,
          ErrorCode.RESOURCE_NOT_FOUND
        );
      }

      // Fetch notes for this inquiry
      const notes = await prisma.inquiryNote.findMany({
        where: { inquiryId },
        orderBy: { createdAt: "desc" },
      });

      // Fetch user data for each note
      const userIds = [...new Set(notes.map(note => note.createdBy))];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      const userMap = new Map(users.map(u => [u.id, u]));

      // Transform notes to DTO format
      const noteDTOs = notes.map((note: any) => {
        const creator = userMap.get(note.createdBy);
        return {
          id: note.id,
          content: note.content,
          createdBy: creator
            ? `${creator.firstName} ${creator.lastName}`
            : "Admin",
          createdAt: note.createdAt,
        };
      });

      return successResponse(noteDTOs, "Notes retrieved successfully");
    } catch (error) {
      console.error("Get inquiry notes error:", error);
      return errorResponse(
        "Failed to retrieve notes",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
