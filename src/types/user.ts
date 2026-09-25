export type UserRole = 'super_admin' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  full_name_ar: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
