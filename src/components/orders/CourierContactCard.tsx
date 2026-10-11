import React from 'react';
import { Phone } from 'lucide-react';
import type { Order } from '../../types';
import { getCustomerCourierContact } from '../../utils/courierContact';

interface CourierContactCardProps {
  order: Pick<Order, 'order_type' | 'status' | 'courier_contact'>;
}

export const CourierContactCard: React.FC<CourierContactCardProps> = ({ order }) => {
  const contact = getCustomerCourierContact(order);
  if (!contact) return null;

  return (
    <section
      aria-label="Courier contact"
      className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-2"
    >
      <div>
        <h2 className="text-sm font-bold text-[#111827]">Your delivery courier</h2>
        <p className="text-xs text-[#475569]">
          Contact your rider if you need information about this delivery.
          <br />
          Courier: <span className="font-semibold text-[#111827]">{contact.name}</span>
        </p>
      </div>
      <a
        href={`tel:${contact.phone_number}`}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#C8102E] px-4 py-2 text-sm font-semibold text-white"
      >
        <Phone className="h-4 w-4" />
        Call courier · {contact.phone_number}
      </a>
    </section>
  );
};
