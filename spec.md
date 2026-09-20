# Restaurant Ordering Platform — AI Build Specification

## 1. Document Purpose
The system is a restaurant menu and ordering platform built according to the spec:
- Single-restaurant platform
- Sections: Bakery, Food & Drinks, Meat Grill
- Categories and Products with NGN currency, availability toggle, and snapshot pricing
- Session cart with validation
- Checkout (Delivery / Pickup) with address conditional validation and duplicate prevention
- Human-readable order numbers (ORD-YYMMDD-XXXXX)
- WhatsApp order notifications with provider abstraction, formatted receipt message, and failure resilience
- Admin portal for Sections, Categories, Products, Orders, WhatsApp logs, and Site Configuration
- Mobile-first responsive UI with Tailwind CSS
