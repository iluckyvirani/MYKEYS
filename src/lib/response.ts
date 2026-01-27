import { NextResponse } from "next/server";

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Success Response Helper
 * Returns standardized success response
 */
export function successResponse<T>(
  data: T,
  message: string = "Success",
  statusCode: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Error Response Helper
 * Returns standardized error response
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  errors?: Record<string, string[]>
): NextResponse {
  const response: ApiResponse = {
    success: false,
    message,
    ...(code && { code }),
    ...(errors && { errors }),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Paginated Response Helper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = "Success"
): NextResponse {
  const totalPages = Math.ceil(total / pageSize);

  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    message,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages,
    },
  };

  return NextResponse.json(response, { status: 200 });
}
