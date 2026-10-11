import type { CourierContact, Order } from '../types';

export function getCustomerCourierContact(
  order: Pick<Order, 'order_type' | 'courier_contact'>,
): CourierContact | null {
  if (order.order_type !== 'DELIVERY') return null;
  return order.courier_contact ?? null;
}
