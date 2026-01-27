export type ReviewInput = {
  rating: number; // 1-5
  comment?: string;
  response?: string;
  propertyId: string;
  userId: string;
  bookingId?: string;
};