import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export interface UpgradeOption {
  canUpgrade: boolean;
  availablePackages: Array<{
    id: string;
    tier: string;
    name: string;
    price: number;
    propertyLimit: number;
  }>;
}

export const usePackageUpgrade = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkUpgradeOptions = useCallback(async (): Promise<UpgradeOption | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<UpgradeOption>("/owner/packages/upgrade-options");
      return response.data || null;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to check upgrade options";
      setError(message);
      console.error("Upgrade check error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const hasAvailableUpgrades = useCallback(async (): Promise<boolean> => {
    const options = await checkUpgradeOptions();
    return options?.canUpgrade ?? false;
  }, [checkUpgradeOptions]);

  return {
    checkUpgradeOptions,
    hasAvailableUpgrades,
    loading,
    error,
  };
};

export const usePackageUsage = () => {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/owner/packages/usage");
      if (response.data) {
        setUsage(response.data);
        return response.data;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch package usage";
      setError(message);
      console.error("Usage fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isNearLimit = useCallback((resource: "properties" | "featured" | "storage" | "leads"): boolean => {
    if (!usage) return false;

    switch (resource) {
      case "properties":
        return usage.properties.percentage >= 80;
      case "featured":
        return usage.featured.percentage >= 80;
      case "storage":
        return usage.storage.percentage >= 80;
      case "leads":
        return usage.leads.dailyPercentage >= 80 || usage.leads.totalPercentage >= 80;
      default:
        return false;
    }
  }, [usage]);

  const canCreateProperty = useCallback((): boolean => {
    if (!usage) return false;
    return usage.properties.percentage < 100;
  }, [usage]);

  const canMakeFeatured = useCallback((): boolean => {
    if (!usage) return false;
    return usage.featured.percentage < 100;
  }, [usage]);

  const canCaptureLeads = useCallback((): boolean => {
    if (!usage) return false;
    return usage.leads.dailyPercentage < 100;
  }, [usage]);

  const getRemainingResources = useCallback(
    (resource: "properties" | "featured" | "storage" | "leads"): number => {
      if (!usage) return 0;

      switch (resource) {
        case "properties":
          return usage.properties.limit - usage.properties.used;
        case "featured":
          return usage.featured.limit - usage.featured.used;
        case "storage":
          return usage.storage.limitGB - usage.storage.usedGB;
        case "leads":
          return usage.leads.dailyLimit - usage.leads.usedToday;
        default:
          return 0;
      }
    },
    [usage]
  );

  return {
    usage,
    loading,
    error,
    fetchUsage,
    isNearLimit,
    canCreateProperty,
    canMakeFeatured,
    canCaptureLeads,
    getRemainingResources,
  };
};
