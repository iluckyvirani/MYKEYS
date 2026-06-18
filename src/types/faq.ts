export type FaqCategoryType =
  | "LISTING"
  | "OWNER"
  | "USER"
  | "SHORT_RENT"
  | "LONG_RENT"
  | "BUY"
  | "SERVICE"
  | "GENERAL";

export type FaqStatusType = "ACTIVE" | "INACTIVE";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategoryType;
  tags: string[];
  sortOrder: number;
  status: FaqStatusType;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqFormData {
  question: string;
  answer: string;
  category: FaqCategoryType;
  tags: string[];
  sortOrder: number;
  status: FaqStatusType;
  featured: boolean;
}
