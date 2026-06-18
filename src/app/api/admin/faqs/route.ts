import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { FaqCategory, FaqStatus } from "@prisma/client";
import { parseFaqBody } from "@/lib/faq/parseFaqBody";

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search");
      const category = searchParams.get("category");
      const status = searchParams.get("status");

      const where: {
        OR?: Array<{ question?: { contains: string; mode: "insensitive" }; answer?: { contains: string; mode: "insensitive" } }>;
        category?: FaqCategory;
        status?: FaqStatus;
      } = {};

      if (search) {
        where.OR = [
          { question: { contains: search, mode: "insensitive" } },
          { answer: { contains: search, mode: "insensitive" } },
        ];
      }
      if (category && category !== "ALL") {
        where.category = category.toUpperCase() as FaqCategory;
      }
      if (status && status !== "ALL") {
        where.status = status.toUpperCase() as FaqStatus;
      }

      const faqs = await prisma.faq.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });

      return successResponse(faqs, "FAQs retrieved successfully");
    } catch (error) {
      console.error("Admin get FAQs error:", error);
      return errorResponse("Failed to retrieve FAQs", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const parsed = parseFaqBody(body);
      if ("error" in parsed && parsed.error) {
        return errorResponse(parsed.error, 400, ErrorCode.VALIDATION_ERROR);
      }

      const faq = await prisma.faq.create({ data: parsed.data });
      return successResponse(faq, "FAQ created successfully", 201);
    } catch (error) {
      console.error("Create FAQ error:", error);
      return errorResponse("Failed to create FAQ", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);
