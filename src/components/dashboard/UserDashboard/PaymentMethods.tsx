"use client";

import { CreditCard, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SavePaymentMethodModal } from "@/components/payments/SavePaymentMethodModal";

type SavedMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export default function PaymentMethods() {
  const [methods, setMethods] = useState<SavedMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: SavedMethod[] }>(
        "/payments/saved-methods"
      );
      setMethods(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load saved cards";
      setError(msg);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this saved card?")) return;
    try {
      setRemovingId(id);
      await api.delete(`/payments/saved-methods/${id}`);
      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to remove card";
      alert(msg);
    } finally {
      setRemovingId(null);
    }
  };

  const formatBrand = (brand: string) =>
    brand.charAt(0).toUpperCase() + brand.slice(1);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Save your card for faster checkout. When you pay for a booking or package, you can tick
        &quot;Save my info for secure 1-click checkout&quot; in Stripe — or add a card here anytime.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading saved cards…
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[5px] text-sm text-red-700">
          {error}
        </div>
      ) : methods.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">No saved cards yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Add a card to use it on your next payment.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add card
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className="p-5 border rounded-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900">
                      {formatBrand(method.brand)} •••• {method.last4}
                    </h4>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 shrink-0"
                disabled={removingId === method.id}
                onClick={() => handleDelete(method.id)}
              >
                {removingId === method.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add another card
          </Button>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-sm text-gray-700 space-y-2">
        <p className="font-medium text-gray-900">Secure storage</p>
        <ul className="space-y-1.5 list-disc list-inside text-gray-600">
          <li>Card details are stored by Stripe, not on our servers</li>
          <li>Use saved cards at checkout or save a new card when you pay</li>
          <li>Remove any saved card at any time</li>
        </ul>
      </div>

      <SavePaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={fetchMethods}
      />
    </div>
  );
}
