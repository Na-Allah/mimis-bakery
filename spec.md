# Restaurant Ordering Platform — AI Build Specification

## 1. Document Purpose
The system is a restaurant menu and ordering platform built according to the spec:
- Single-restaurant platform
- Sections: Bakery, Food & Drinks, Meat Grill
- Categories and Products with NGN currency, availability toggle, and snapshot pricing
- Session cart with validation
- Checkout (Delivery / Pickup) with address conditional validation and duplicate prevention
- Human-readable order numbers (ORD-YYMMDD-XXXXX)
- Delivery orders can be assigned to a courier; customers see the assigned courier's name and phone as soon as a courier is assigned
- Customers open an order's live status directly from My Orders; order and WhatsApp status updates refresh in real time
- WhatsApp order notifications with provider abstraction, formatted receipt message, and failure resilience
- Admin portal for Sections, Categories, Products, Orders, WhatsApp logs, and Site Configuration
- Mobile-first responsive UI with Tailwind CSS
