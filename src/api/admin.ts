import type { Category, CourierOption, NotificationLog, Order, Section } from '../types';
import { API_URL, getCsrfToken } from './clients';

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  if (typeof data?.detail === 'string') return data.detail;
  if (data && typeof data === 'object') {
    const firstError = Object.values(data).flat()[0];
    if (typeof firstError === 'string') return firstError;
  }
  return `Request failed (${response.status}).`;
}

async function saveCatalogItem<T extends { id: string }>(
  path: string,
  item: T,
  payload: Record<string, string | number | boolean>,
  image?: File | null,
): Promise<T> {
  const token = await getCsrfToken();
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.set(key, String(value)));
  if (image) formData.set('image', image);

  const response = await fetch(`${API_URL}${path}${item.id ? `${item.id}/` : ''}`, {
    method: item.id ? 'PATCH' : 'POST',
    credentials: 'include',
    headers: token ? { 'X-CSRFToken': token } : {},
    body: formData,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<T>;
}

export function saveSectionApi(section: Section, image?: File | null): Promise<Section> {
  const { id, name, slug, description, is_active, display_order } = section;
  return saveCatalogItem('/sections/manage/', section, {
    name, slug, description, is_active, display_order,
  }, image);
}

export function saveCategoryApi(category: Category): Promise<Category> {
  const { id, section_id, name, slug, description, is_active, display_order } = category;
  return saveCatalogItem('/categories/manage/', category, {
    section_id, name, slug, description, is_active, display_order,
  });
}

async function deleteAdminResource(path: string, id: string): Promise<void> {
  const token = await getCsrfToken();
  const response = await fetch(`${API_URL}${path}${encodeURIComponent(id)}/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: token ? { 'X-CSRFToken': token } : {},
  });
  if (!response.ok) throw new Error(await parseError(response));
}

export const deleteProductApi = (id: string) => deleteAdminResource('/products/manage/', id);
export const deleteCategoryApi = (id: string) => deleteAdminResource('/categories/manage/', id);
export const deleteSectionApi = (id: string) => deleteAdminResource('/sections/manage/', id);
export const deleteCompletedOrderApi = (id: string) => deleteAdminResource('/admin/orders/', id);

export async function fetchAdminCouriers(): Promise<CourierOption[]> {
  const response = await fetch(`${API_URL}/admin/couriers/`, { credentials: 'include' });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<CourierOption[]>;
}

export async function assignOrderCourierApi(orderId: string, courierId: string | null): Promise<Order> {
  const token = await getCsrfToken();
  const response = await fetch(`${API_URL}/admin/orders/${encodeURIComponent(orderId)}/courier/`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-CSRFToken': token } : {}),
    },
    body: JSON.stringify({ courier_id: courierId }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<Order>;
}

export async function fetchAdminNotifications(): Promise<NotificationLog[]> {
  const response = await fetch(`${API_URL}/admin/notifications/`, { credentials: 'include' });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<NotificationLog[]>;
}

export async function retryAdminNotification(id: string): Promise<NotificationLog> {
  const token = await getCsrfToken();
  const response = await fetch(`${API_URL}/admin/notifications/${encodeURIComponent(id)}/retry/`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { 'X-CSRFToken': token } : {},
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<NotificationLog>;
}