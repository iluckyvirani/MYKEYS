export type AnalyticsPeriod = "1m" | "3m" | "6m" | "1y";

export interface OwnerAnalyticsData {
  updatedAt: string;
  periodMonths: number;
  stats: {
    totalBookings: number;
    bookingsChange: number;
    paidBookings: number;
    bookingRevenue: number;
    bookingRevenueChange: number;
    ownerEarnings: number;
    ownerEarningsChange: number;
    uniqueGuests: number;
    uniqueGuestsChange: number;
    repeatGuests: number;
    repeatGuestRate: number;
    occupancyRate: number;
    occupancyChange: number;
    avgRating: number;
    reviewCount: number;
    activeBoosts: number;
    boostSpend: number;
    packageSpend: number;
  };
  monthlyTrend: Array<{
    month: string;
    label: string;
    bookings: number;
    revenue: number;
    ownerEarnings: number;
    occupancy: number;
  }>;
  propertyPerformance: Array<{
    id: string;
    title: string;
    revenue: number;
    bookings: number;
    occupancy: number;
    rating: number;
  }>;
  bookingStatusBreakdown: Array<{ status: string; count: number }>;
  boostAnalytics: {
    totalBids: number;
    activeBids: number;
    totalSpend: number;
    recent: Array<{
      id: string;
      propertyTitle: string;
      zipCode: string;
      totalCost: number;
      status: string;
      daysRemaining: number;
    }>;
  };
  packageAnalytics: {
    current: {
      name: string;
      status: string;
      startDate: string;
      endDate: string;
      propertiesUsed: number;
      propertyLimit: number;
      price: number;
    } | null;
    totalSpent: number;
    historyCount: number;
  };
  keyMetrics: {
    avgBookingValue: number;
    avgLeadTimeDays: number;
    conversionRate: number;
    repeatGuestRate: number;
    reviewResponseRate: number;
    cancellationRate: number;
  };
}
