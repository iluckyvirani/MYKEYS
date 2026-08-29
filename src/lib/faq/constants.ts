import {
  Building2,
  HelpCircle,
  Hotel,
  Key,
  ListChecks,
  TrendingUp,
  User,
  Wrench,
} from "lucide-react";
import { FaqCategoryType } from "@/types/faq";

export const FAQ_CATEGORIES: {
  id: FaqCategoryType;
  label: string;
  description: string;
}[] = [
  { id: "GENERAL", label: "General", description: "Contact page and all topics" },
  { id: "LISTING", label: "Listing", description: "How listing works page" },
  { id: "OWNER", label: "Owners", description: "Home page and owner dashboard" },
  { id: "AGENT", label: "Agents", description: "Agent dashboard" },
  { id: "USER", label: "Guests & Users", description: "Home page and user dashboard" },
  { id: "SHORT_RENT", label: "Short Rent", description: "Short rent page" },
  { id: "LONG_RENT", label: "Long Rent", description: "Long rent page" },
  { id: "BUY", label: "Buy", description: "Buy properties page" },
  { id: "SERVICE", label: "Services", description: "Services page and service dashboard" },
];

export const FAQ_CATEGORY_LABELS: Record<FaqCategoryType, string> = Object.fromEntries(
  FAQ_CATEGORIES.map((c) => [c.id, c.label])
) as Record<FaqCategoryType, string>;

export function getFaqCategoryIcon(category: FaqCategoryType) {
  switch (category) {
    case "SHORT_RENT":
      return Hotel;
    case "LONG_RENT":
      return Building2;
    case "BUY":
      return TrendingUp;
    case "OWNER":
      return Key;
    case "AGENT":
      return Building2;
    case "USER":
      return User;
    case "SERVICE":
      return Wrench;
    case "LISTING":
      return ListChecks;
    default:
      return HelpCircle;
  }
}

export function getFaqCategoryColor(category: FaqCategoryType) {
  switch (category) {
    case "SHORT_RENT":
      return "bg-green-100 text-green-600";
    case "LONG_RENT":
      return "bg-blue-100 text-blue-600";
    case "BUY":
      return "bg-purple-100 text-purple-600";
    case "OWNER":
      return "bg-emerald-100 text-emerald-600";
    case "USER":
      return "bg-sky-100 text-sky-600";
    case "SERVICE":
      return "bg-orange-100 text-orange-600";
    case "LISTING":
      return "bg-teal-100 text-teal-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export const VALID_FAQ_CATEGORIES = FAQ_CATEGORIES.map((c) => c.id);
