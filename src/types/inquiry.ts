export type InquiryInput = {
  message: string;
  status?: InquiryStatus;
  priority?: "high" | "medium" | "low";
  type: "short_term" | "long_term" | "purchase";
  duration?: string;
  budget?: number;
  name: string;
  email: string;
  phone?: string;
  propertyId: string;
  userId?: string;
  assignedTo?: string;
};

export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESPONDED" | "CLOSED";
