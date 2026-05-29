import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  pluginId?: string;
  badge?: 'pending';
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}
