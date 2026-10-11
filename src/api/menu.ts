import type { Section, Category, Product } from '../types';
import { API_URL } from './clients';

export interface MenuResponse {
  sections: Section[];
  categories: Category[];
  products: Product[];
}

export async function fetchMenu(): Promise<MenuResponse> {
  const res = await fetch(`${API_URL}/menu/`);
  if (!res.ok) throw new Error(`Failed to load menu (${res.status})`);
  return res.json();
}