"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  Wallet,
  Receipt,
  Building2,
  CalendarDays,
} from "lucide-react";

type PropertyOption = {
  id: string;
  title: string;
  city: string;
  status: string;
};

type ExpenseRow = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  expenseDate: string;
  property: PropertyOption;
};

type Stats = {
  totalAmount: number;
  averageAmount: number;
  count: number;
  thisMonthAmount: number;
  thisMonthCount: number;
  byProperty: { propertyId: string; title: string; total: number; count: number }[];
};

const emptyForm = {
  propertyId: "",
  title: "",
  description: "",
  amount: "",
  expenseDate: new Date().toISOString().slice(0, 10),
};

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function OwnerExpenseManagementPage() {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filterPropertyId, setFilterPropertyId] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterPropertyId) params.set("propertyId", filterPropertyId);
      if (filterMonth) params.set("month", filterMonth);
      const qs = params.toString();
      const res = await api.get(`/owner/expenses${qs ? `?${qs}` : ""}`);
      if (res.data?.success) {
        setExpenses(res.data.data.expenses || []);
        setStats(res.data.data.stats || null);
        setProperties(res.data.data.properties || []);
      } else {
        setError("Failed to load expenses.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, [filterPropertyId, filterMonth]);

  useEffect(() => {
    load();
  }, [load]);

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 18; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      propertyId: filterPropertyId || "",
      expenseDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const openEdit = (expense: ExpenseRow) => {
    setEditingId(expense.id);
    setForm({
      propertyId: expense.property.id,
      title: expense.title,
      description: expense.description || "",
      amount: String(expense.amount),
      expenseDate: expense.expenseDate.slice(0, 10),
    });
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        propertyId: form.propertyId,
        title: form.title,
        description: form.description,
        amount: Number(form.amount),
        expenseDate: form.expenseDate,
      };

      if (editingId) {
        await api.patch(`/owner/expenses/${editingId}`, payload);
        setSuccess("Expense updated.");
      } else {
        await api.post("/owner/expenses", payload);
        setSuccess("Expense added.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await api.delete(`/owner/expenses/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete expense");
    }
  };

  return (
    <DashboardLayout defaultRole="agent">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600 mt-1">
            Track property costs by month and property
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#339390] text-white text-sm font-medium rounded-[5px] hover:bg-[#2a7a78]"
        >
          <Plus className="w-4 h-4" />
          Add expense
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[5px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-[5px] text-sm text-emerald-800">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white border rounded-[5px] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Property
          </label>
          <select
            value={filterPropertyId}
            onChange={(e) => setFilterPropertyId(e.target.value)}
            className="w-full border rounded-[5px] px-3 py-2 text-sm"
          >
            <option value="">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Month
          </label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full border rounded-[5px] px-3 py-2 text-sm"
          >
            <option value="">All months</option>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFilterMonth(currentMonthValue());
            }}
            className="px-3 py-2 text-sm border rounded-[5px] hover:bg-gray-50"
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterPropertyId("");
              setFilterMonth("");
            }}
            className="px-3 py-2 text-sm border rounded-[5px] hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-[5px] p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Wallet className="w-3.5 h-3.5" />
            Total expenses
          </div>
          <div className="text-xl font-bold text-gray-900">
            {loading ? "—" : formatCurrency(stats?.totalAmount || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.count || 0} record{(stats?.count || 0) === 1 ? "" : "s"}
          </div>
        </div>
        <div className="bg-white border rounded-[5px] p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {filterMonth ? "Selected month" : "This month"}
          </div>
          <div className="text-xl font-bold text-gray-900">
            {loading ? "—" : formatCurrency(stats?.thisMonthAmount || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.thisMonthCount || 0} expense
            {(stats?.thisMonthCount || 0) === 1 ? "" : "s"}
          </div>
        </div>
        <div className="bg-white border rounded-[5px] p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Receipt className="w-3.5 h-3.5" />
            Average expense
          </div>
          <div className="text-xl font-bold text-gray-900">
            {loading ? "—" : formatCurrency(stats?.averageAmount || 0)}
          </div>
        </div>
        <div className="bg-white border rounded-[5px] p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            Properties with costs
          </div>
          <div className="text-xl font-bold text-gray-900">
            {loading ? "—" : stats?.byProperty?.length || 0}
          </div>
        </div>
      </div>

      {/* By property breakdown */}
      {stats && stats.byProperty.length > 0 && (
        <div className="mb-6 bg-white border rounded-[5px] overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">By property</h2>
          </div>
          <div className="divide-y">
            {stats.byProperty.map((row) => (
              <button
                key={row.propertyId}
                type="button"
                onClick={() => setFilterPropertyId(row.propertyId)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {row.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {row.count} expense{row.count === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(row.total)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-6 bg-white border rounded-[5px] p-5 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">
            {editingId ? "Edit expense" : "Add expense"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property
              </label>
              <select
                required
                value={form.propertyId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, propertyId: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              >
                <option value="">Select property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {p.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Boiler repair"
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (£)
              </label>
              <input
                required
                type="number"
                min={0.01}
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                required
                type="date"
                value={form.expenseDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expenseDate: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-[#339390] text-white text-sm font-medium rounded-[5px] hover:bg-[#2a7a78] disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Save expense"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2.5 border text-sm rounded-[5px] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Expense list */}
      <div className="bg-white border rounded-[5px] overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {filterPropertyId
              ? `Expenses — ${
                  properties.find((p) => p.id === filterPropertyId)?.title ||
                  "Property"
                }`
              : "All expenses"}
          </h2>
          <span className="text-xs text-gray-500">
            {expenses.length} shown
          </span>
        </div>
        {loading ? (
          <div className="p-10 animate-pulse h-40 bg-gray-50" />
        ) : expenses.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">
            No expenses found. Add your first expense for a property.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(row.expenseDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setFilterPropertyId(row.property.id)}
                        className="font-medium text-[#339390] hover:underline text-left"
                      >
                        {row.property.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      {row.description || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="p-1.5 text-gray-500 hover:text-[#339390] hover:bg-teal-50 rounded"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
