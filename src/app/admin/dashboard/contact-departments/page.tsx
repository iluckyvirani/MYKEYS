"use client";

import { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CONTACT_DEPARTMENT_ICONS, getContactDepartmentIcon } from "@/lib/contact/departmentIcons";
import {
  ContactDepartmentFormData,
  ContactDepartmentItem,
} from "@/types/contactDepartment";

const emptyForm: ContactDepartmentFormData = {
  name: "",
  email: "",
  phone: "",
  description: "",
  icon: "help-circle",
  sortOrder: 0,
  isActive: true,
};

export default function AdminContactDepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<ContactDepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContactDepartmentItem | null>(null);
  const [form, setForm] = useState<ContactDepartmentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/contact-departments");
      setDepartments(res.data?.data ?? []);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (dept: ContactDepartmentItem) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      email: dept.email,
      phone: dept.phone,
      description: dept.description,
      icon: dept.icon,
      sortOrder: dept.sortOrder,
      isActive: dept.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/admin/contact-departments/${editing.id}`, form);
        toast({ title: "Department updated" });
      } else {
        await api.post("/admin/contact-departments", form);
        toast({ title: "Department created" });
      }
      setModalOpen(false);
      await fetchDepartments();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save department";
      toast({ title: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/contact-departments/${id}`);
      setDeleteConfirm(null);
      toast({ title: "Department deleted" });
      await fetchDepartments();
    } catch {
      toast({ title: "Failed to delete department", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-green-600" />
              Contact Departments
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage specialized department cards shown on the contact page.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add Department
          </Button>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-gray-400">Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No departments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Department</th>
                    <th className="text-left p-4 font-medium text-gray-600">Contact</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getContactDepartmentIcon(dept.icon)}
                          <div>
                            <p className="font-medium text-gray-900">{dept.name}</p>
                            <p className="text-gray-500 text-xs line-clamp-1">{dept.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        <p>{dept.email}</p>
                        <p>{dept.phone}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={dept.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                          {dept.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(dept)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => setDeleteConfirm(dept.id)}
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
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editing ? "Edit Department" : "Add Department"}</h2>
              <button type="button" onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone *</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm min-h-[80px]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <select
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mt-1"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  >
                    {CONTACT_DEPARTMENT_ICONS.map((icon) => (
                      <option key={icon.id} value={icon.id}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sort order</label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
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
            <h3 className="text-lg font-bold mb-2">Delete department?</h3>
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
