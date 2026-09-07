import { packageService } from "@/lib/packages/packageService";
import {
  feesFromAdminSettings,
  type ServiceCheckoutFees,
} from "@/lib/services/serviceCheckoutFees";

export async function loadServiceCheckoutFees(): Promise<ServiceCheckoutFees> {
  try {
    const settings = await packageService.getAdminSettings();
    return feesFromAdminSettings(settings);
  } catch (err) {
    console.warn("Service checkout fees unavailable, using defaults:", err);
    return feesFromAdminSettings(null);
  }
}
