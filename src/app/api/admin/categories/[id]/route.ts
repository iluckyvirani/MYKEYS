import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/categories/:id
 * Get a single category by ID
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const category = await prisma.serviceCategoryInfo.findUnique({
        where: { id },
      });

      if (!category) {
        return errorResponse("Category not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      return successResponse(category, "Category retrieved successfully");
    } catch (error) {
      console.error("Get category error:", error);
      return errorResponse(
        "Failed to retrieve category",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/categories/:id
 * Update a service category
 */
export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const body = await request.json();

      // Check if category exists
      const category = await prisma.serviceCategoryInfo.findUnique({
        where: { id },
      });

      if (!category) {
        return errorResponse("Category not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // If name is being updated, check for uniqueness
      if (body.name && body.name !== category.name) {
        const existing = await prisma.serviceCategoryInfo.findUnique({
          where: { name: body.name },
        });

        if (existing) {
          return errorResponse(
            "Category with this name already exists",
            400,
            ErrorCode.VALIDATION_ERROR
          );
        }
      }

      // Update category
      const updatedCategory = await prisma.serviceCategoryInfo.update({
        where: { id },
        data: {
          name: body.name !== undefined ? body.name : category.name,
          description: body.description !== undefined ? body.description : category.description,
          icon: body.icon !== undefined ? body.icon : category.icon,
          status: body.status !== undefined ? body.status : category.status,
          sortOrder: body.sortOrder !== undefined ? body.sortOrder : category.sortOrder,
        },
      });

      return successResponse(updatedCategory, "Category updated successfully");
    } catch (error) {
      console.error("Update category error:", error);
      return errorResponse(
        "Failed to update category",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * DELETE /api/admin/categories/:id
 * Delete a service category
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, _user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      // Check if category exists
      const category = await prisma.serviceCategoryInfo.findUnique({
        where: { id },
      });

      if (!category) {
        return errorResponse("Category not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // Delete category
      await prisma.serviceCategoryInfo.delete({
        where: { id },
      });

      return successResponse(null, "Category deleted successfully");
    } catch (error) {
      console.error("Delete category error:", error);
      return errorResponse(
        "Failed to delete category",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
