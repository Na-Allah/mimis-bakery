import type { Order, OrderStatus, OrderType } from '../types';
import { API_URL, getCsrfToken } from './clients';



async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    const first = Object.values(data)[0];
    return String(Array.isArray(first) ? first[0] : first);
  } catch {
    return `Request failed (${res.status})`;
  }
}


async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (method !== 'GET' && method !== 'HEAD') {
    const token = await getCsrfToken();
    if (token) headers.set('X-CSRFToken', token);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: OrderType;
  delivery_address?: string;
  customer_note?: string;
  items: { product_id: string; quantity: number }[];
}

export const createOrderApi = (payload: CreateOrderPayload, idempotencyKey: string) =>
  request<Order>('/orders/', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  });

export const fetchMyOrders = () => request<Order[]>('/orders/');

export const trackOrderApi = (orderNumber: string, token?: string) =>
  request<Order>(
    `/orders/track/${encodeURIComponent(orderNumber)}/${token ? `?token=${encodeURIComponent(token)}` : ''}`
  );

export const updateOrderStatusApi = (id: string, status: OrderStatus) =>
  request<Order>(`/orders/${id}/status/`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const fetchDeliveries = () => request<Order[]>('/orders/deliveries/');

export const courierAction = (id: string, action: 'pickup' | 'delivered') =>
  request<Order>(`/orders/${id}/courier/`, { method: 'POST', body: JSON.stringify({ action }) });