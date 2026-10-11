import type { Section, Category, Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

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