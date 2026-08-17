"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Wrench, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CatalogItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  commissionPercent: number;
  isOffered: boolean;
  category?: { id: string; name: string };
};

export default function ServiceManagementPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/service/catalog");
      setItems(res.data?.data ?? []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load catalog",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleOffer = async (item: CatalogItem) => {
    setTogglingId(item.id);
    try {
      await api.post("/service/offers", {
        catalogServiceId: item.id,
        offer: !item.isOffered,
      });
      setItems((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, isOffered: !s.isOffered } : s))
      );
      toast({
        title: item.isOffered ? "Stopped offering" : "Now offering",
        description: item.name,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update offer",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const offeredCount = items.filter((i) => i.isOffered).length;

  return (
    <DashboardLayout defaultRole="service">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-green-600" />
            Services I Provide
          </h1>
          <p className="text-gray-600 mt-1">
            Toggle the MYKEYS catalog services you can deliver in your categories.
            Prices are set by admin — you do not enter pricing.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Offering {offeredCount} of {items.length} available services
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="border border-dashed rounded-xl p-10 text-center text-gray-500 bg-white">
            No catalog services in your registered categories yet. Ask admin to add services,
            or update your categories in Profile.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
              const commission = (item.price * item.commissionPercent) / 100;
              const youEarn = item.price - commission;
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-5 flex flex-col gap-3 ${
                    item.isOffered ? "border-green-300 ring-1 ring-green-100" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className="mb-2 bg-gray-100 text-gray-700">
                        {item.category?.name ?? "Service"}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <Switch
                      checked={item.isOffered}
                      disabled={togglingId === item.id}
                      onCheckedChange={() => toggleOffer(item)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 pt-2 border-t">
                    <span>
                      Tenant pays <strong>£{item.price.toFixed(2)}</strong>
                    </span>
                    <span>
                      You earn ~<strong>£{youEarn.toFixed(2)}</strong>
                    </span>
                    <span className="text-gray-400">{item.commissionPercent}% platform</span>
                  </div>
                  {item.isOffered && (
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Visible to customers booking this service
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
