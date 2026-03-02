import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/categories
 * Get all service categories for admin
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "50");
      const skip = (page - 1) * pageSize;

      // Filters
      const search = searchParams.get("search");
      const status = searchParams.get("status");

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status && status !== "ALL") {
        where.status = status.toLowerCase();
      }

      // Get categories with pagination
      const [categories, total] = await Promise.all([
        prisma.serviceCategoryInfo.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        }),
        prisma.serviceCategoryInfo.count({ where }),
      ]);

      return paginatedResponse(
        categories,
        total,
        page,
        pageSize,
        "Categories retrieved successfully"
      );
    } catch (error) {
      console.error("Get categories error:", error);
      return errorResponse(
        "Failed to retrieve categories",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * POST /api/admin/categories
 * Create a new service category
 */
export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();

      const { name, description, status, icon } = body;

      if (!name) {
        return errorResponse(
          "Name is required",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Check if category with same name exists
      const existing = await prisma.serviceCategoryInfo.findUnique({
        where: { name },
      });

      if (existing) {
        return errorResponse(
          "Category with this name already exists",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Get the highest sort order
      const lastCategory = await prisma.serviceCategoryInfo.findFirst({
        orderBy: { sortOrder: "desc" },
      });

      const category = await prisma.serviceCategoryInfo.create({
        data: {
          name,
          description: description || null,
          icon: icon || null,
          status: status || "active",
          sortOrder: (lastCategory?.sortOrder || 0) + 1,
        },
      });

      return successResponse(category, "Category created successfully", 201);
    } catch (error) {
      console.error("Create category error:", error);
      return errorResponse(
        "Failed to create category",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
