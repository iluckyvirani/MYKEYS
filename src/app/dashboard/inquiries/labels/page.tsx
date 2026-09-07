"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Tag, Pencil, Check, X, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

const DEFAULT_LABELS = [
  { name: "Viewing arranged",      color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500",     border: "border-blue-200" },
  { name: "Viewing completed",     color: "bg-green-100 text-green-700",   dot: "bg-green-500",    border: "border-green-200" },
  { name: "Suitable",              color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  { name: "Maybe",                 color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500",   border: "border-yellow-200" },
  { name: "Rejected",              color: "bg-red-100 text-red-700",        dot: "bg-red-500",      border: "border-red-200" },
  { name: "Waiting for paperwork", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500",   border: "border-purple-200" },
];

export default function ManageLabelsPage() {
  const [labels, setLabels] = useState(DEFAULT_LABELS.map(l => ({ ...l })));
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/inquiries?pageSize=200&tab=all");
        const items = res.data?.data?.items || [];
        const c: Record<string, number> = {};
        for (const l of DEFAULT_LABELS) c[l.name] = 0;
        for (const item of items) {
          if (item.userLabel && c[item.userLabel] !== undefined) c[item.userLabel]++;
        }
        setCounts(c);
      } catch {
        setCounts({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditValue(labels[i].name);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const saveEdit = (i: number) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === labels[i].name) { cancelEdit(); return; }
    setLabels(prev => {
      const updated = [...prev];
      // Move count to new name
      const oldName = updated[i].name;
      if (counts[oldName] !== undefined) {
        setCounts(c => ({ ...c, [trimmed]: c[oldName] || 0, [oldName]: 0 }));
      }
      updated[i] = { ...updated[i], name: trimmed };
      return updated;
    });
    cancelEdit();
  };

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-8">
        <Link href="/user/dashboard/inquiries" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Inquiries
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-100 rounded-lg">
            <Tag className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Labels</h1>
            <p className="text-gray-500 text-sm mt-0.5">Rename labels to match your workflow. Click a label to filter your inbox.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600" />
        </div>
      ) : (
        <div className="bg-white rounded-[5px] border shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider gap-4">
            <span>Label</span>
            <span className="text-right min-w-20">Threads</span>
            <span className="min-w-20 text-right">Actions</span>
          </div>

          <ul className="divide-y divide-gray-100">
            {labels.map((label, i) => {
              const count = counts[label.name] ?? 0;
              const isEditing = editingIndex === i;
              return (
                <li key={i} className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-4 gap-4 hover:bg-gray-50/60 transition-colors">
                  {/* Label */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 w-3 h-3 rounded-full ${label.dot}`} />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(i); if (e.key === "Escape") cancelEdit(); }}
                        className="flex-1 text-sm px-2.5 py-1 border border-green-400 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        maxLength={40}
                      />
                    ) : (
                      <Link
                        href={`/dashboard/inquiries?label=${encodeURIComponent(label.name)}`}
                        className={`text-sm px-2.5 py-1 rounded-full font-medium border ${label.color} ${label.border} hover:opacity-80 transition-opacity`}
                      >
                        {label.name}
                      </Link>
                    )}
                  </div>

                  {/* Thread count */}
                  <div className="flex items-center justify-end gap-1.5 min-w-20">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-300" />
                    <span className={`text-sm font-semibold ${count > 0 ? "text-gray-900" : "text-gray-400"}`}>{count}</span>
                    <span className="text-xs text-gray-400">{count === 1 ? "thread" : "threads"}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 min-w-20">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(i)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-[5px] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[5px] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(i)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-[5px] transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Rename
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
        <Tag className="w-3 h-3" />
        Renaming a label here updates it locally. Labels are applied per conversation in the chat window.
      </p>
    </DashboardLayout>
  );
}
