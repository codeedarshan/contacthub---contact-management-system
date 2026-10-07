export type ContactCategory = 'Family' | 'Friends' | 'College' | 'Work' | 'Other';

export interface Contact {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  category: ContactCategory;
  notes: string;
  created_at: string;
  is_favorite?: boolean;
}

export type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

export type ActiveTab = 'app' | 'code' | 'presentation';
export type AppView = 'dashboard' | 'contacts' | 'add' | 'view';
