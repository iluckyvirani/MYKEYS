import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();
    const phone = String(body?.phone || "").trim();
    const inquiryType = String(body?.inquiryType || "general").trim();
    const propertyType = String(body?.propertyType || "").trim();
    const urgency = String(body?.urgency || "normal").trim();

    if (!name || !email || !subject || !message) {
      return errorResponse(
        "name, email, subject and message are required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const query = await prisma.contactQuery.create({
      data: {
        name,
        email,
        subject,
        message,
        phone: phone || null,
        inquiryType,
        propertyType: propertyType || null,
        urgency,
      },
    });

    return successResponse(query, "Contact query submitted successfully", 201);
  } catch (error) {
    console.error("Submit contact query error:", error);
    return errorResponse(
      "Failed to submit contact query",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
