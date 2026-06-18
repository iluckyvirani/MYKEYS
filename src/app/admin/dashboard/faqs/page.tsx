"use client";

import { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FAQ_CATEGORIES, FAQ_CATEGORY_LABELS } from "@/lib/faq/constants";
import { FaqCategoryType, FaqFormData, FaqItem } from "@/types/faq";

const emptyForm: FaqFormData = {
  question: "",
  answer: "",
  category: "GENERAL",
  tags: [],
  sortOrder: 0,
  status: "ACTIVE",
  featured: false,
};

export default function AdminFaqsPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FaqFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await api.get(`/admin/faqs?${params.toString()}`);
      setFaqs(res.data?.data ?? []);
    } catch {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setTagsInput("");
    setModalOpen(true);
  };

  const openEdit = (faq: FaqItem) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags,
      sortOrder: faq.sortOrder,
      status: faq.status,
      featured: faq.featured,
    });
    setTagsInput(faq.tags.join(", "));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ title: "Question and answer are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editing) {
        await api.patch(`/admin/faqs/${editing.id}`, payload);
        toast({ title: "FAQ updated" });
      } else {
        await api.post("/admin/faqs", payload);
        toast({ title: "FAQ created" });
      }

      setModalOpen(false);
      await fetchFaqs();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save FAQ";
      toast({ title: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/faqs/${id}`);
      setDeleteConfirm(null);
      toast({ title: "FAQ deleted" });
      await fetchFaqs();
    } catch {
      toast({ title: "Failed to delete FAQ", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = faqs.filter((f) => f.status === "ACTIVE").length;
  const featuredCount = faqs.filter((f) => f.featured).length;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-green-600" />
              FAQs
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage questions shown on listing, rent, buy, service, and dashboard pages.
            </p>
          </div>
          <Button onClick={openCreate} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-1" /> Add FAQ
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-gray-500">Active</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{featuredCount}</p>
            <p className="text-sm text-gray-500">Featured</p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All categories</option>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-gray-400">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No FAQs found. Add your first one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Question</th>
                    <th className="text-left p-4 font-medium text-gray-600">Category</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">Order</th>
                    <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          {faq.featured && <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          <div>
                            <p className="font-medium text-gray-900">{faq.question}</p>
                            <p className="text-gray-500 line-clamp-1 mt-0.5">{faq.answer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{FAQ_CATEGORY_LABELS[faq.category]}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={faq.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                          {faq.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600">{faq.sortOrder}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(faq)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteConfirm(faq.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Where each category appears</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {FAQ_CATEGORIES.map((c) => (
              <li key={c.id}>
                <span className="font-medium text-gray-800">{c.label}:</span> {c.description}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editing ? "Edit FAQ" : "Add FAQ"}</h2>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Question *</label>
                <Input
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="How much does it cost to list?"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Answer *</label>
                <textarea
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm min-h-[120px]"
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Listing is free..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mt-1"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as FaqCategoryType })}
                  >
                    {FAQ_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Sort order</label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
                <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="booking, payment" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  Featured (preview sections)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.status === "ACTIVE"}
                    onChange={(e) => setForm({ ...form, status: e.target.checked ? "ACTIVE" : "INACTIVE" })}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </>
      )}

      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" aria-hidden />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Delete FAQ?</h3>
            <p className="text-gray-600 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={deleting}
                onClick={() => handleDelete(deleteConfirm)}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </>
      )}
    </AdminDashboardLayout>
  );
}
