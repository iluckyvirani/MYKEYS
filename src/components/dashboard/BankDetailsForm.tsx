"use client";

import { useEffect, useState } from "react";
import { Building2, Landmark } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMPTY_UK_BANK_DETAILS,
  formatUkAccountNumber,
  formatUkSortCode,
  normalizeUkBankDetails,
  type UkBankDetails,
  validateUkBankDetails,
} from "@/lib/bank/ukBankDetails";

export default function BankDetailsForm() {
  const [form, setForm] = useState<UkBankDetails>(EMPTY_UK_BANK_DETAILS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/auth/bank-details");
        const data = res.data?.data;
        if (data) setForm(normalizeUkBankDetails(data));
      } catch {
        setError("Could not load bank details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (field: keyof UkBankDetails, value: string) => {
    setError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const invalid = validateUkBankDetails(form);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put("/auth/bank-details", form);
      const data = res.data?.data;
      if (data) setForm(normalizeUkBankDetails(data));
      setSuccess("UK bank details saved.");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not save bank details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          <p className="text-sm text-gray-500 mt-1">
            Enter a UK bank account in London format. Sort code is 6 digits
            (00-00-00) and the account number is 8 digits. These details are
            required for payouts and refunds.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-[5px] bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-[5px] bg-green-50 border border-green-200 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Label htmlFor="bankAccountHolder">
            Account holder name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bankAccountHolder"
            className="mt-2"
            value={form.bankAccountHolder}
            onChange={(e) => update("bankAccountHolder", e.target.value)}
            placeholder="Name as shown on the bank account"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <Label htmlFor="bankSortCode">
            Sort code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bankSortCode"
            className="mt-2"
            value={form.bankSortCode}
            onChange={(e) => update("bankSortCode", formatUkSortCode(e.target.value))}
            placeholder="00-00-00"
            inputMode="numeric"
            autoComplete="off"
            required
          />
          <p className="text-xs text-gray-500 mt-1">UK format: 20-00-00</p>
        </div>

        <div>
          <Label htmlFor="bankAccountNumber">
            Account number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bankAccountNumber"
            className="mt-2"
            value={form.bankAccountNumber}
            onChange={(e) =>
              update("bankAccountNumber", formatUkAccountNumber(e.target.value))
            }
            placeholder="12345678"
            inputMode="numeric"
            autoComplete="off"
            required
          />
          <p className="text-xs text-gray-500 mt-1">8 digits, no spaces</p>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="bankName">Bank name</Label>
          <Input
            id="bankName"
            className="mt-2"
            value={form.bankName}
            onChange={(e) => update("bankName", e.target.value)}
            placeholder="e.g. Barclays, HSBC, Lloyds, NatWest"
          />
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
      >
        <Building2 className="w-4 h-4 mr-2" />
        {saving ? "Saving..." : "Save bank details"}
      </Button>
    </div>
  );
}
