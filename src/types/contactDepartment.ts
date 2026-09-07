export interface ContactDepartmentItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactDepartmentFormData {
  name: string;
  email: string;
  phone: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}
