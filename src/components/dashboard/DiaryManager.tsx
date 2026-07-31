"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

export type DiaryRole = "user" | "owner" | "service";

type DiaryTask = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: string;
  reminderSentAt: string | null;
};

const emptyForm = {
  title: "",
  description: "",
  priority: "MEDIUM" as DiaryTask["priority"],
  status: "PENDING" as DiaryTask["status"],
  dueDate: new Date().toISOString().slice(0, 10),
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-amber-50 text-amber-800",
  HIGH: "bg-red-50 text-red-700",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function DiaryManager() {
  const [tasks, setTasks] = useState<DiaryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = filterStatus ? `?status=${filterStatus}` : "";
      const res = await api.get(`/diary${qs}`);
      if (res.data?.success) {
        setTasks(res.data.data.tasks || []);
      } else {
        setError("Failed to load diary.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load diary.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const open = tasks.filter(
      (t) => t.status === "PENDING" || t.status === "IN_PROGRESS"
    ).length;
    const done = tasks.filter((t) => t.status === "COMPLETED").length;
    const high = tasks.filter(
      (t) =>
        t.priority === "HIGH" &&
        (t.status === "PENDING" || t.status === "IN_PROGRESS")
    ).length;
    return { open, done, high, total: tasks.length };
  }, [tasks]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const openEdit = (task: DiaryTask) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.slice(0, 10),
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate,
      };
      if (editingId) {
        await api.patch(`/diary/${editingId}`, payload);
      } else {
        await api.post("/diary", payload);
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save diary item");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this diary item?")) return;
    try {
      await api.delete(`/diary/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const markDone = async (task: DiaryTask) => {
    try {
      await api.patch(`/diary/${task.id}`, { status: "COMPLETED" });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#339390]" />
            Diary
          </h1>
          <p className="text-gray-600 mt-1">
            To-do list with priority, status, and due-date reminders (email +
            notification)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#339390] text-white text-sm font-medium rounded-[5px] hover:bg-[#2a7a78]"
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[5px] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open", value: stats.open },
          { label: "Completed", value: stats.done },
          { label: "High priority", value: stats.high },
          { label: "Total shown", value: stats.total },
        ].map((card) => (
          <div key={card.label} className="bg-white border rounded-[5px] p-4">
            <div className="text-xs text-gray-500 mb-1">{card.label}</div>
            <div className="text-xl font-bold text-gray-900">
              {loading ? "—" : card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-[5px] p-4 flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 mr-2">Filter:</span>
        {[
          ["", "All"],
          ["PENDING", "Pending"],
          ["IN_PROGRESS", "In progress"],
          ["COMPLETED", "Completed"],
          ["CANCELLED", "Cancelled"],
        ].map(([value, label]) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => setFilterStatus(value)}
            className={`px-3 py-1.5 text-sm rounded-[5px] border ${
              filterStatus === value
                ? "bg-[#339390] text-white border-[#339390]"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="bg-white border rounded-[5px] p-5 space-y-4"
        >
          <h2 className="font-semibold text-gray-900">
            {editingId ? "Edit diary item" : "New diary item"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
                placeholder="What do you need to do?"
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
                placeholder="Optional details"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as DiaryTask["priority"],
                  }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as DiaryTask["status"],
                  }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due date
              </label>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="w-full border rounded-[5px] px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                On this date you get an email and a notification reminder.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-[#339390] text-white text-sm font-medium rounded-[5px] hover:bg-[#2a7a78] disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Save"}
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

      <div className="bg-white border rounded-[5px] overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">Your list</h2>
        </div>
        {loading ? (
          <div className="p-10 animate-pulse h-40 bg-gray-50" />
        ) : tasks.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">
            No diary items yet. Add your first to-do.
          </p>
        ) : (
          <ul className="divide-y">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="px-4 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${priorityStyles[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${statusStyles[task.status]}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-1">
                      {task.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Due{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {task.reminderSentAt ? " · Reminder sent" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {task.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => markDone(task)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Mark completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(task)}
                    className="p-1.5 text-gray-500 hover:text-[#339390] hover:bg-teal-50 rounded"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(task.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
