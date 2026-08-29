import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/agents
 * Estate agents for admin dashboard
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "10");
      const skip = (page - 1) * pageSize;
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
      const status = searchParams.get("status");
      const search = searchParams.get("search");

      const where: any = {
        roles: { some: { role: "AGENT" } },
      };

      if (status && status !== "ALL") where.status = status;

      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { companyName: { contains: search, mode: "insensitive" } },
        ];
      }

      const orderBy: any = {};
      if (sortBy === "name") orderBy.firstName = sortOrder;
      else if (sortBy === "email") orderBy.email = sortOrder;
      else orderBy.createdAt = sortOrder;

      const [agents, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
            status: true,
            createdAt: true,
            _count: { select: { properties: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      const items = agents.map((a) => ({
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        companyName: a.companyName,
        status: a.status,
        createdAt: a.createdAt,
        totalProperties: a._count.properties,
      }));

      return paginatedResponse(items, page, pageSize, total, "Agents retrieved successfully");
    } catch (error) {
      console.error("Get agents error:", error);
      return errorResponse("Failed to retrieve agents", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: ["ADMIN"] }
);
