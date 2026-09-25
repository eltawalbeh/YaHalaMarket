import type { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u-001',
    email: 'admin@yahala.co',
    full_name: 'Ahmed Al-Rashidi',
    full_name_ar: 'أحمد الراشدي',
    role: 'super_admin',
    is_active: true,
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'u-002',
    email: 'sara@yahala.co',
    full_name: 'Sara Al-Otaibi',
    full_name_ar: 'سارة العتيبي',
    role: 'manager',
    is_active: true,
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-03-15T11:00:00Z',
  },
  {
    id: 'u-003',
    email: 'khalid@yahala.co',
    full_name: 'Khalid Mansour',
    full_name_ar: 'خالد منصور',
    role: 'staff',
    is_active: true,
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
];

export const mockCurrentUser = mockUsers[0];
