import { FaqCategory, FaqStatus } from "@prisma/client";
import { VALID_FAQ_CATEGORIES } from "@/lib/faq/constants";

export function parseFaqBody(body: Record<string, unknown>) {
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  const category = typeof body.category === "string" ? body.category.toUpperCase() : "";
  const status =
    typeof body.status === "string" && ["ACTIVE", "INACTIVE"].includes(body.status.toUpperCase())
      ? (body.status.toUpperCase() as FaqStatus)
      : "ACTIVE";
  const sortOrder =
    typeof body.sortOrder === "number" ? body.sortOrder : parseInt(String(body.sortOrder || 0), 10);
  const featured = body.featured === true || body.featured === "true";
  const tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean)
    : typeof body.tags === "string"
      ? body.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

  if (!question) {
    return { error: "Question is required" } as const;
  }
  if (!answer) {
    return { error: "Answer is required" } as const;
  }
  if (!VALID_FAQ_CATEGORIES.includes(category as (typeof VALID_FAQ_CATEGORIES)[number])) {
    return { error: "Invalid category" } as const;
  }

  return {
    data: {
      question,
      answer,
      category: category as FaqCategory,
      tags,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      status,
      featured,
    },
  } as const;
}
