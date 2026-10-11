import assert from 'node:assert/strict';
import test from 'node:test';

import type { Order } from '../types';
import { getCustomerCourierContact } from './courierContact';

const contact = { name: 'Delivery Courier', phone_number: '+2348012345678' };

function order(
  orderType: Order['order_type'],
  courierContact: Order['courier_contact'] = contact,
): Pick<Order, 'order_type' | 'courier_contact'> {
  return {
    order_type: orderType,
    courier_contact: courierContact,
  };
}

test('shows courier contact when any delivery order has an assigned courier', () => {
  assert.deepEqual(getCustomerCourierContact(order('DELIVERY')), contact);
});

test('hides courier contact for pickup and unassigned orders', () => {
  assert.equal(getCustomerCourierContact(order('PICKUP')), null);
  assert.equal(getCustomerCourierContact(order('DELIVERY', null)), null);
});
