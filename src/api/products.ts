import type { Product } from '../types';
import { API_URL } from './clients';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function getCsrfToken(): Promise<string> {
  let token = getCookie('csrftoken');
  if (!token) {
    const response = await fetch(`${API_URL}/auth/csrf/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Unable to initialize product upload.');
    const data = (await response.json()) as { csrfToken: string };
    token = getCookie('csrftoken') ?? data.csrfToken;
  }
  return token;
}

export async function saveProductApi(product: Product, imageFile?: File | null): Promise<Product> {
  const csrfToken = await getCsrfToken();
  const formData = new FormData();
  formData.set('name', product.name);
  formData.set('slug', product.slug);
  formData.set('category_id', product.category_id);
  formData.set('description', product.description);
  formData.set('price', String(product.price));
  formData.set('is_available', String(product.is_available));
  formData.set('is_featured', String(product.is_featured));
  formData.set('display_order', String(product.display_order));
  if (imageFile) formData.set('image', imageFile);

  const response = await fetch(
    `${API_URL}/products/manage/${product.id ? `${encodeURIComponent(product.id)}/` : ''}`,
    {
      method: product.id ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': csrfToken },
      body: formData,
    }
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | { detail?: string; [key: string]: unknown }
      | null;
    const firstError = data ? Object.values(data).flat()[0] : null;
    throw new Error(
      (typeof data?.detail === 'string' ? data.detail : undefined) ||
      (typeof firstError === 'string' ? firstError : undefined) ||
      `Unable to save product (${response.status}).`
    );
  }

  return (await response.json()) as Product;
}
