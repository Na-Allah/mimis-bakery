/**
 * Domain Models & Types for Restaurant Ordering Platform
 * Conforming strictly to spec.md
 */

export type OrderType = 'PICKUP' | 'DELIVERY';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type WhatsAppStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface Section {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  section_id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // Stored as exact numeric value (treated as Decimal)
  image: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // Snapshotted at order creation
  unit_price: number;   // Snapshotted at order creation
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string; // Format: ORD-YYMMDD-XXXXX
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: OrderType;
  delivery_address?: string;
  customer_note?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  whatsapp_status: WhatsAppStatus;
  whatsapp_message_id?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface NotificationLog {
  id: string;
  order_id: string;
  order_number: string;
  channel: 'WHATSAPP';
  status: WhatsAppStatus;
  provider_message_id?: string;
  attempts: number;
  last_error?: string;
  created_at: string;
  sent_at?: string;
  message_text: string;
}

export interface SiteConfiguration {
  restaurant_name: string;
  tagline: string;
  logo: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  description: string;
  opening_hours: string;
  currency_symbol: string;
  currency_code: string;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  default_delivery_fee: number;
}

export type ActiveView =
  | { type: 'home' }
  | { type: 'menu'; sectionSlug?: string; categorySlug?: string }
  | { type: 'product'; productSlug: string }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'order-success'; orderNumber: string }
  | { type: 'track-order'; orderNumber?: string }
  | { type: 'admin'; tab?: 'orders' | 'catalog' | 'notifications' | 'settings' };
