import {
  Building2,
  Clock,
  HelpCircle,
  Hotel,
  LucideIcon,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

export const CONTACT_DEPARTMENT_ICONS: { id: string; label: string }[] = [
  { id: "hotel", label: "Hotel" },
  { id: "clock", label: "Clock" },
  { id: "trending-up", label: "Trending Up" },
  { id: "shield", label: "Shield" },
  { id: "users", label: "Users" },
  { id: "building", label: "Building" },
  { id: "message-square", label: "Message" },
  { id: "phone", label: "Phone" },
  { id: "mail", label: "Mail" },
  { id: "help-circle", label: "Help" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  hotel: Hotel,
  clock: Clock,
  "trending-up": TrendingUp,
  shield: Shield,
  users: Users,
  building: Building2,
  "message-square": MessageSquare,
  phone: Phone,
  mail: Mail,
  "help-circle": HelpCircle,
};

export function getContactDepartmentIcon(icon: string, className = "w-5 h-5") {
  const Icon = ICON_MAP[icon] || HelpCircle;
  return <Icon className={className} />;
}
