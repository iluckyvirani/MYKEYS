import { CONTACT_DEPARTMENT_ICONS } from "@/lib/contact/departmentIcons";

const VALID_ICONS = CONTACT_DEPARTMENT_ICONS.map((i) => i.id);

export function parseDepartmentBody(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const icon =
    typeof body.icon === "string" && VALID_ICONS.includes(body.icon)
      ? body.icon
      : "help-circle";
  const sortOrder =
    typeof body.sortOrder === "number" ? body.sortOrder : parseInt(String(body.sortOrder || 0), 10);
  const isActive = body.isActive !== false && body.isActive !== "false";

  if (!name) return { error: "Name is required" } as const;
  if (!email || !email.includes("@")) return { error: "Valid email is required" } as const;
  if (!phone) return { error: "Phone is required" } as const;
  if (!description) return { error: "Description is required" } as const;

  return {
    data: {
      name,
      email,
      phone,
      description,
      icon,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isActive,
    },
  } as const;
}
