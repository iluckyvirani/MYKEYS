import { NextRequest } from "next/server";
import { getHighestBidForZip, getAdminSettings } from "@/lib/bids/bidService";
import { successResponse } from "@/lib/response";

/**
 * GET /api/bids/highest?zipCode=SW1A
 * Returns the current highest active bid for a zip code.
 * Public endpoint — used by the bid placement form.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zipCode = searchParams.get("zipCode") ?? "";
  const [highest, settings] = await Promise.all([
    getHighestBidForZip(zipCode),
    getAdminSettings(),
  ]);
  return successResponse({ highest, settings }, "Bid info retrieved");
}
