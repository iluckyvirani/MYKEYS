import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { FaqCategory } from "@prisma/client";
import { VALID_FAQ_CATEGORIES } from "@/lib/faq/constants";

/**
 * GET /api/faqs
 * Public FAQ list — filter by category, featured, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const categories = categoryParam
      ? categoryParam
          .split(",")
          .map((c) => c.trim().toUpperCase())
          .filter((c): c is FaqCategory =>
            VALID_FAQ_CATEGORIES.includes(c as (typeof VALID_FAQ_CATEGORIES)[number])
          )
      : undefined;

    const faqs = await prisma.faq.findMany({
      where: {
        status: "ACTIVE",
        ...(categories?.length ? { category: { in: categories } } : {}),
        ...(featured ? { featured: true } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      ...(limit && limit > 0 ? { take: limit } : {}),
    });

    return successResponse(faqs, "FAQs retrieved successfully");
  } catch (error) {
    console.error("Get FAQs error:", error);
    return errorResponse("Failed to retrieve FAQs", 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}
