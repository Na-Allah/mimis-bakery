# Restaurant Ordering Platform — React + Django AI Build Specification

## 1. Document Purpose

This is the authoritative implementation reference for an AI coding agent building the restaurant ordering platform.

The system is a **single-restaurant** platform with two deployable parts:

- **Backend:** Django + Django REST Framework (DRF) + PostgreSQL, exposing a JSON API
- **Frontend:** React + TypeScript single-page application (SPA) styled with Tailwind CSS

Supporting pieces:

- Django Admin for restaurant staff operations
- Optional Redis + Celery for asynchronous notifications
- WhatsApp Business/API integration for restaurant order notifications

The AI agent MUST prioritize, in this order:

1. Correct business behavior
2. Data integrity
3. Security
4. Mobile-first UX
5. Maintainability
6. Testability
7. Simple architecture over unnecessary abstraction

Do NOT introduce Next.js/SSR frameworks, GraphQL, microservices, or Redux-style global state libraries unless a later requirement explicitly asks for them. React Context + a small data-fetching layer is enough.

> **Change from the template-based spec:** the frontend is now a React SPA that talks to Django through a REST API. All business rules still live on the server. React is a presentation layer only.

---

## 2. Product Goal

Customers can:

1. Visit the website.
2. Browse the menu by section: Bakery, Food & Drinks, Meat Grill (and any sections admins add later).
3. View product details and prices.
4. Add products to a cart.
5. Change quantities or remove products.
6. Check out **without creating an account**.
7. Choose pickup or delivery.
8. Provide contact and delivery details.
9. Submit the order and see a confirmation.
10. Have the restaurant receive the order through WhatsApp.

Restaurant administrators can:

1. Log into Django Admin.
2. Manage sections, categories and products (including images, prices, availability, featured flag, ordering).
3. View orders and change order status.
4. See WhatsApp notification status and retry failed notifications.
5. Edit site configuration (restaurant name, contacts, currency, delivery/pickup settings, delivery fee).

---

## 3. Core Architectural Principles

1. **PostgreSQL is the source of truth.** WhatsApp is only a notification channel. A delivered (or failed) WhatsApp message is never proof that an order exists.
2. **The server is authoritative.** The browser may display prices, totals and availability, but the server recomputes and revalidates everything at checkout.
3. **React is a client, not a source of truth.** Cart contents in the browser are only `productId + quantity`.
4. **Notifications are secondary.** Order persistence succeeds independently from WhatsApp delivery.

Correct order flow:

```text
Customer (React SPA)
    |
    v
POST /api/orders/
    |
    v
DRF serializer validation
    |
    v
OrderService.create_order()
    |  - re-fetch products
    |  - validate availability + quantities
    |  - compute subtotal, delivery fee, total on the server
    v
transaction.atomic(): create Order + OrderItems
    |
    v
transaction.on_commit(): queue/send WhatsApp notification
    |
    v
Notification SENT or FAILED (order unaffected)
    |
    v
201 response with order_number -> React confirmation page
```

If WhatsApp fails:

- The order MUST remain in the database.
- The customer MUST still get the confirmation response.
- The failure MUST be logged and stored on the `Notification` record.
- The system MUST support retrying the notification.

---

## 4. Technology Requirements

### 4.1 Backend

- Python 3.x
- Django
- Django REST Framework
- PostgreSQL
- `django-cors-headers` (React dev server and production origin)
- `django-filter` (optional, only if filtering is actually needed)
- Authentication: keep the existing token/JWT approach already wired between the frontend `src/api/auth` module and the Django backend. Do not replace it without being asked.
- Django Admin
- Environment variables for all secrets (e.g. `django-environ` or `python-decouple`)

### 4.2 Frontend

- React (function components + hooks)
- TypeScript (strict mode)
- Vite
- React Router
- Tailwind CSS
- A small data-fetching layer: either `fetch` wrapped in `src/api/` modules or TanStack Query. Pick one and use it consistently.
- Form handling: plain controlled components or React Hook Form. Server validation errors MUST be displayed.
- Minimal dependencies (see Dependency Policy, section 76).

### 4.3 Infrastructure

```text
Internet
   |
   v
Nginx (HTTPS)
   |
   +---- /            -> React static build (dist/)
   |
   +---- /api/, /admin/, /static/ -> Gunicorn -> Django
                                          |
                                          +---- PostgreSQL
                                          +---- Redis/Celery (when enabled)
                                          +---- Object storage/CDN for media
```

The SPA and API should be served from the **same origin** in production where possible (Nginx routes `/api/` to Django). This avoids CORS and cookie complexity. CORS is still configured for local development (Vite on `localhost:5173`, Django on `localhost:8000`).

---

## 5. Non-Goals for V1

Do NOT implement unless explicitly requested:

- Customer loyalty, reviews, ratings, referrals
- Native mobile app
- Delivery-driver application
- Multi-restaurant support
- Microservices, GraphQL
- Next.js / server-side rendering
- Complex customer profiles
- Promotions engine, subscriptions, crypto payments
- Complex inventory management
- Online payment (unless explicitly required)

The architecture should leave room for these later.

---

## 6. Repository Structure

```text
restaurant-platform/
│
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── catalog/
│   │   ├── orders/
│   │   ├── notifications/
│   │   └── core/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── tests/
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   ├── manage.py
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/              # one module per API area (auth, catalog, orders, site)
│   │   ├── components/       # reusable UI components
│   │   ├── context/          # RestaurantContext, CartContext
│   │   ├── hooks/
│   │   ├── pages/            # route-level components
│   │   ├── types/            # shared TypeScript types
│   │   ├── utils/            # money formatting, validators
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── nginx/
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 7. Django Apps

| App | Responsibilities |
|---|---|
| `core` | `SiteConfiguration` model and public site-config endpoint. No order or catalog logic. |
| `catalog` | Sections, categories, products, images, availability, featured flag, menu ordering. |
| `orders` | Checkout, orders, order items, calculations, status transitions, cart validation. |
| `notifications` | WhatsApp provider, message builder, notification records, retries, provider errors. |
| `accounts` | Custom user model, authentication endpoints, staff roles. V1 does not require customer registration. |

---

## 8. Domain Model

```text
Restaurant (SiteConfiguration)
   |
   +-- Section
         |
         +-- Category
                |
                +-- Product
```

Initial sections: **Bakery**, **Food & Drinks**, **Meat Grill**. These MUST be database records, not hard-coded logic. Admins must be able to add sections later.

### 8.1 Identifiers

All models use **UUID primary keys**:

```python
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
```

Public URLs use **slugs** (catalog) or **order numbers + tracking tokens** (orders). Raw UUIDs are acceptable in API payloads for catalog entities, but never as the public order identifier.

---

## 9. Catalog Models

### 9.1 Section

Fields: `id`, `name`, `slug`, `description`, `image`, `is_active`, `display_order`, `created_at`, `updated_at`

- `name` required; `slug` unique
- `description`, `image` optional
- `is_active` defaults to `True`; `display_order` defaults to `0`
- Ordering: `display_order ASC, name ASC`

### 9.2 Category

Fields: `id`, `section` (FK), `name`, `slug`, `description`, `is_active`, `display_order`, `created_at`, `updated_at`

- Constraint: `unique(section, slug)`
- `on_delete=PROTECT` for the section relationship where historical integrity matters

### 9.3 Product

Fields: `id`, `category` (FK), `name`, `slug`, `description`, `price`, `image`, `is_available`, `is_featured`, `display_order`, `created_at`, `updated_at`

- `price = DecimalField(max_digits=12, decimal_places=2)` — never floats for money
- `is_available` defaults to `True`; `is_featured` defaults to `False`
- Slugs are stable and URL-safe
- Availability is controlled with `is_available`; do NOT delete products because they are temporarily unavailable

### 9.4 Seed Data

Idempotent seed command (`python manage.py seed_catalog`):

```text
Bakery:          Bread, Cakes, Pastries, Snacks
Food & Drinks:   Food, Shaka, Juice, Tea
Meat Grill:      Chicken, Beef, Goat, Grill Combos
```

Do not create fake products unless useful for local development. All seed records remain editable in Django Admin.

---

## 10. Product Rules

A product can be added to a new order only if:

```text
product exists
AND product.is_available == True
AND product.category.is_active == True
AND product.category.section.is_active == True
```

The server MUST revalidate this at checkout. Never trust the client.

---

## 11. Cart Architecture (React-side, server-validated)

The cart lives in the browser in a `CartContext`, persisted to `localStorage` so it survives refreshes.

Stored shape (IDs and quantities only):

```ts
type CartLine = { productId: string; quantity: number };
type CartState = { lines: CartLine[] };
```

The cart MUST NOT be trusted for product name, price or availability. To display the cart, React calls the server:

```text
POST /api/cart/validate/
{ "items": [{ "product_id": "<uuid>", "quantity": 2 }] }
```

The server returns current product data, line subtotals, any problems (unavailable/removed products), subtotal, and an estimated total. React renders this response.

### 11.1 Cart Rules

- Quantity: minimum `1`, maximum configurable (default `99`)
- Backend rejects zero, negative, non-integer quantities, unknown product IDs and unavailable products
- Cart operations (client-side): add, update quantity, increase, decrease, remove, clear
- If `/api/cart/validate/` reports a product as unavailable or missing, the UI shows a friendly message and offers to remove it
- Clear the cart only after a successful order response

---

## 12. Money Rules

- Server: Python `Decimal` / `DecimalField` only. Never `float(price)`.
- Never calculate totals from browser-submitted prices. The order creation endpoint ignores any price fields in the request.
- **JSON money values are strings** (e.g. `"5000.00"`) to avoid floating-point loss. In TypeScript, treat them as `string` and format for display only (use `Intl.NumberFormat` with the configured currency). If arithmetic is needed in the UI for display estimates, use integer minor units or a decimal library; the server total is always authoritative.

```text
item subtotal = unit_price × quantity
subtotal      = sum(item subtotals)
total         = subtotal + delivery_fee
```

---

## 13. Order Model

Fields: `id` (UUID), `order_number`, `tracking_token` (UUID, unguessable), `customer_name`, `customer_phone`, `customer_email`, `order_type`, `delivery_address`, `customer_note`, `subtotal`, `delivery_fee`, `total`, `status`, `idempotency_key`, `completed_at` (nullable), `whatsapp_status`, `whatsapp_message_id`, `created_at`, `updated_at`

- `order_type`: `PICKUP` | `DELIVERY`
- `delivery_address` required when `DELIVERY`; optional for `PICKUP`
- `order_number` unique, human-readable, e.g. `ORD-260915-00124` (prefix configurable). Safe to share with staff; stable for the order's lifetime.
- `idempotency_key` unique (nullable), used for duplicate-submission protection

### 13.1 OrderItem

Fields: `id`, `order`, `product` (FK, `PROTECT`/nullable), `product_name`, `unit_price`, `quantity`, `subtotal`, `created_at`

`product_name` and `unit_price` MUST be **snapshotted** at order creation so later price changes never alter historical orders.

```text
Order created:  Chicken = ₦5,000, quantity 2
Later:          Chicken = ₦6,000
Order still shows: Chicken × 2 = ₦10,000
```

Do not make `OrderItem` depend only on a product ID. Leave room for future `variant` and `selected_options`.

### 13.2 Order Status

Choices: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED` (default `PENDING`).

```text
PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED
Cancellation allowed from any pre-completion state.
```

Enforce valid transitions in `OrderService.change_order_status()`. Arbitrary invalid transitions MUST be rejected, including from Django Admin (override `save`/admin form validation to route through the service).

### 13.3 Completed-Order Cleanup

Completed orders are deleted automatically **one hour after completion**.

- Set `completed_at` when status changes to `COMPLETED`.
- A scheduled job (Celery beat task, or a management command run by cron if Celery is not enabled) deletes orders where `status = COMPLETED` and `completed_at <= now - 1 hour`. The delay is configurable (`COMPLETED_ORDER_RETENTION_MINUTES`, default `60`).
- Deletion removes the order and its items. Related `Notification` records are removed with them.
- Log each deletion batch (count only, no personal data).
- Note: this deliberately overrides the usual "keep historical orders" approach. Cancelled orders are NOT deleted by this job. If reporting or revenue history is needed later, export or aggregate before deletion.

---

## 14. Delivery

- V1 uses a configurable flat delivery fee (`SiteConfiguration.default_delivery_fee`).
- Pickup: `delivery_fee = 0`. Delivery: `delivery_fee = configured fee`.
- Deliveries are handled by couriers who are the restaurant's own staff. There is no courier app in V1; staff coordinate from the order details (address, phone, note) in Django Admin or the WhatsApp message. Optionally add a `Courier` staff group with view-only order access.
- Design so delivery zones, distance pricing and free-delivery thresholds can be added later without changing order item logic.

---

## 15. Site Configuration

`SiteConfiguration` is a singleton model in `core`.

Fields: `restaurant_name`, `logo`, `phone`, `whatsapp_number`, `email`, `address`, `description`, `opening_hours`, `currency`, `delivery_enabled`, `pickup_enabled`, `default_delivery_fee`

- Do not hard-code restaurant identity in React components.
- Served publicly (excluding private fields such as any API credentials) via `GET /api/site/`.
- The frontend's `RestaurantContext` loads this on app start. It replaces any local-storage site config.

---

## 16. REST API Specification

Base path: `/api/`. All responses are JSON. Use DRF serializers for validation and output. Use consistent error shapes.

### 16.1 Public Endpoints (no authentication)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/site/` | Site configuration |
| GET | `/api/menu/` | Active sections with active categories and available/visible products (single call for the menu browser) |
| GET | `/api/sections/` | List active sections |
| GET | `/api/sections/<section-slug>/` | Section with its categories |
| GET | `/api/sections/<section-slug>/categories/<category-slug>/products/` | Products in a category |
| GET | `/api/products/<product-slug>/` | Product detail |
| GET | `/api/products/featured/` | Featured products |
| POST | `/api/cart/validate/` | Validate and price a cart |
| POST | `/api/orders/` | Create an order (checkout) |
| GET | `/api/orders/<order-number>/?token=<tracking_token>` | Order details/tracking (token required) |

### 16.2 Authenticated Endpoints

Keep the existing auth module contract (`loginUser`, `registerUser`, `getCurrentUser`, `logoutUser`). Typical endpoints:

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/register/` | Register (only if enabled) |
| GET | `/api/auth/me/` | Current user |
| POST | `/api/auth/logout/` | Logout |

Staff-only endpoints (optional in V1, since Django Admin covers operations): order list, order status change, notification retry. If added, require `IsAdminUser` or a permission class tied to Django groups.

### 16.3 Example: Validate Cart

Request:

```json
{
  "items": [
    { "product_id": "6f1c9a4e-0000-0000-0000-000000000001", "quantity": 2 }
  ]
}
```

Response `200`:

```json
{
  "items": [
    {
      "product_id": "6f1c9a4e-0000-0000-0000-000000000001",
      "name": "Grilled Chicken",
      "unit_price": "5000.00",
      "quantity": 2,
      "subtotal": "10000.00",
      "is_available": true,
      "image": "https://.../grilled-chicken.webp"
    }
  ],
  "problems": [],
  "subtotal": "10000.00"
}
```

Unavailable or missing products appear in `problems` with a friendly `message` and the `product_id`.

### 16.4 Example: Create Order

Headers: `Idempotency-Key: <uuid generated per checkout attempt>`

Request:

```json
{
  "full_name": "John Doe",
  "phone": "08012345678",
  "email": "",
  "order_type": "DELIVERY",
  "delivery_address": "123 Example Street",
  "customer_note": "Please make the chicken spicy.",
  "items": [
    { "product_id": "6f1c9a4e-0000-0000-0000-000000000001", "quantity": 2 }
  ]
}
```

Any client-sent prices, totals or names are ignored.

Response `201`:

```json
{
  "order_number": "ORD-260915-00124",
  "tracking_token": "b2b8c3a1-0000-0000-0000-000000000009",
  "status": "PENDING",
  "order_type": "DELIVERY",
  "items": [
    { "product_name": "Grilled Chicken", "unit_price": "5000.00", "quantity": 2, "subtotal": "10000.00" }
  ],
  "subtotal": "10000.00",
  "delivery_fee": "2000.00",
  "total": "12000.00",
  "created_at": "2026-09-15T20:42:00Z"
}
```

Repeating the same `Idempotency-Key` returns the original order (`200` or `201` with the same body) instead of creating a duplicate.

### 16.5 Error Format

Validation errors (`400`) use DRF's field-keyed format, with a stable top-level wrapper:

```json
{
  "message": "Please correct the highlighted fields.",
  "errors": {
    "phone": ["Enter a valid phone number."],
    "delivery_address": ["Delivery address is required for delivery orders."]
  },
  "items": [
    { "product_id": "...", "message": "Sorry, Grilled Chicken is currently unavailable. Please remove it from your cart before placing the order." }
  ]
}
```

- Use a custom DRF exception handler to produce this shape consistently.
- `404` for unknown resources, `429` for throttled requests, `500` returns a generic message (no stack traces in production).

---

## 17. Checkout Rules

Fields: `full_name` (required), `phone` (required, validated for the restaurant's market, e.g. Nigerian formats), `email` (optional), `order_type` (`PICKUP`|`DELIVERY`, required), `delivery_address` (required for delivery), `customer_note` (optional).

Server-side order creation steps (`OrderService.create_order()`):

1. Validate customer data and order type (DRF serializer).
2. Validate delivery address when needed.
3. Check that the chosen order type is enabled in `SiteConfiguration`.
4. Re-fetch all products from the database.
5. Validate availability (section 10) and quantities.
6. Calculate prices on the server (item subtotals, subtotal, delivery fee, total).
7. Within `transaction.atomic()`: create `Order` and `OrderItem`s with snapshotted name/price.
8. Use `transaction.on_commit()` to create the `Notification` and queue/send WhatsApp.

Client-side validation is for convenience only and never replaces server validation.

### 17.1 Duplicate Submission Protection

Frontend:

- Generate an `Idempotency-Key` (`crypto.randomUUID()`) when the checkout form mounts or when a new attempt starts; reuse it on retries of the same attempt.
- Disable the submit button after the first click and show "Placing Order...".

Backend:

- Store `idempotency_key` on `Order` with a unique constraint.
- If a request arrives with an existing key, return the existing order.
- Handle the race of two simultaneous identical requests by catching `IntegrityError` and returning the existing order.

### 17.2 Order Confirmation

After a `201`, React navigates to `/checkout/success/<order-number>` (pass the tracking token via router state or query string) and shows:

```text
Order received!
Order number: ORD-260915-00124
Thank you for your order.
We have received your order and will process it shortly.
```

Do not show internal UUIDs. Clear the cart only after success.

---

## 18. Notifications and WhatsApp

### 18.1 Architecture

```text
OrderService
      |
      v
NotificationService
      |
      v
WhatsAppProvider (interface)
      |
      v
Concrete provider (WhatsApp Business/Cloud API)
```

Do not call the WhatsApp API from views or serializers.

```python
class WhatsAppProvider:
    def send_order_notification(self, order) -> "ProviderResult":
        ...
```

### 18.2 Notification Model

Fields: `id` (UUID), `order` (FK, cascade so cleanup removes them), `channel` (`WHATSAPP`), `status` (`PENDING`|`SENT`|`FAILED`), `provider_message_id`, `attempts`, `last_error`, `created_at`, `sent_at`, `updated_at`

### 18.3 Message Content

Must include: order number, customer name and phone, order type, each item (quantity, name, unit price, subtotal), subtotal, delivery fee, total, delivery address (if delivery), note (if any), creation time in the restaurant's timezone.

```text
🍽 NEW RESTAURANT ORDER

Order: ORD-260915-00124

Customer:
John Doe
080XXXXXXXX

Type:
Delivery

Items:
2 × Grilled Chicken — ₦10,000
1 × Pineapple Juice — ₦2,000

Subtotal: ₦12,000
Delivery: ₦2,000
TOTAL: ₦14,000

Address:
123 Example Street

Note:
Please make the chicken spicy.

Time:
15 Sep 2026, 21:42
```

The template may be adjusted to satisfy the chosen provider's template rules.

### 18.4 Failure Behavior

- Success: `Notification.status = SENT`, store `provider_message_id` and `sent_at`.
- Failure: `status = FAILED`, `last_error = provider error`, `attempts += 1`. The order stays valid and `PENDING`.
- Never roll back or delete an order because a notification failed.
- Retries: staff can retry from Django Admin (admin action) and/or a management command. With Celery, retry transient failures with backoff; do not retry permanent validation errors indefinitely.
- Production: prefer Celery + Redis. Synchronous sending (after commit) is acceptable in development or very low traffic.

---

## 19. Django Admin

Admin sections: Catalog (Sections, Categories, Products), Orders (Orders, Notifications), Core (Site Configuration).

**Products:** list columns Name, Category, Section, Price, Available, Featured, Updated; filters Section, Category, Available, Featured; search by name.

**Orders:** list columns Order #, Customer, Phone, Order Type, Total, Status, WhatsApp Status, Created; filters Today, Status, Order type, WhatsApp status; search by order number, customer name, phone. Order detail shows customer, contact, type, address, notes, inline items (read-only), totals, status, notification status, timestamps. Financial fields on existing orders are read-only.

**Notifications:** list with status filter; admin action "Retry selected notifications".

Use Django Groups/Permissions for roles when needed (Super Admin, Restaurant Manager, Order Staff, Catalog Staff, Courier). V1 may rely on the standard staff/superuser model.

---

## 20. Frontend Specification

### 20.1 Routes

```text
/                                   Homepage
/menu                               Full menu (MenuBrowser)
/menu/:sectionSlug                  Section
/menu/:sectionSlug/:categorySlug    Category
/menu/product/:productSlug          Product detail
/cart                               Cart
/checkout                           Checkout
/checkout/success/:orderNumber      Order success
/orders/:orderNumber                Order tracking (requires ?token=)
/login, /register                   Auth pages (if enabled)
*                                   Not found
```

Use React Router. Every route is deep-linkable and works on refresh (Nginx falls back to `index.html`).

### 20.2 State

- `RestaurantContext`: site configuration and menu data (sections → categories → products) loaded from the API (`/api/site/`, `/api/menu/`). Remove the local `storageService` for catalog, cart, orders and site config. Expose loading and error states.
- `CartContext`: `lines`, `addItem`, `updateQuantity`, `increase`, `decrease`, `removeItem`, `clear`, persisted to `localStorage`.
- Auth state: keep the existing `src/api/auth` flow.
- Server data should never be duplicated into forms of local truth. Orders are created only via the API.

### 20.3 TypeScript Types

Define in `src/types/`. IDs are UUID strings; money is a decimal string; timestamps are ISO 8601 strings.

```ts
export type Uuid = string;
export type Money = string; // e.g. "5000.00"

export interface Section {
  id: Uuid; name: string; slug: string; description: string;
  image: string | null; isActive: boolean; displayOrder: number;
}

export interface Category {
  id: Uuid; sectionId: Uuid; name: string; slug: string;
  description: string; isActive: boolean; displayOrder: number;
}

export interface Product {
  id: Uuid; categoryId: Uuid; name: string; slug: string; description: string;
  price: Money; image: string | null;
  isAvailable: boolean; isFeatured: boolean; displayOrder: number;
}

export type OrderType = "PICKUP" | "DELIVERY";
export type OrderStatus =
  | "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

export interface OrderItem {
  id: Uuid; productId: Uuid | null; productName: string;
  unitPrice: Money; quantity: number; subtotal: Money;
}

export interface Order {
  orderNumber: string; trackingToken: Uuid;
  customerName: string; customerPhone: string; customerEmail: string;
  orderType: OrderType; deliveryAddress: string; customerNote: string;
  items: OrderItem[]; subtotal: Money; deliveryFee: Money; total: Money;
  status: OrderStatus; createdAt: string;
}

export interface NotificationLog {
  id: Uuid; orderId: Uuid; channel: "WHATSAPP";
  status: "PENDING" | "SENT" | "FAILED";
  providerMessageId: string | null; attempts: number;
  lastError: string | null; createdAt: string; sentAt: string | null;
}

export interface SiteConfiguration {
  restaurantName: string; logo: string | null; phone: string;
  whatsappNumber: string; email: string; address: string;
  description: string; openingHours: string; currency: string;
  deliveryEnabled: boolean; pickupEnabled: boolean; defaultDeliveryFee: Money;
}

export interface User {
  id: Uuid; email: string; name: string; isStaff: boolean;
}
```

The API returns `snake_case`. Convert to `camelCase` in the `src/api/` layer (one mapping function per resource) so components only see the types above. Keep this mapping in one place.

### 20.4 Pages and Components

Homepage: navbar, hero with primary CTA **Order Now**, three visually distinct section cards, featured products, restaurant introduction, opening hours, contact information, footer.

Reusable components (`src/components/`): `Navbar`, `Footer`, `ProductCard`, `SectionCard`, `CategoryNav`, `MenuBrowser`, `CartItem`, `QuantitySelector`, `Button`, `Input`, `Alert`, `Modal`, `EmptyState`, `LoadingSpinner`, `CartIndicator`.

**ProductCard:** image, name, short description, price, availability state, add button. Available shows `+ Add`; unavailable shows `Unavailable` and cannot be added.

**Cart page:** product, quantity controls, unit price, subtotal, remove, plus subtotal, delivery fee (if applicable) and total, CTA `Proceed to Checkout`. Empty state: "Your cart is empty." with `Browse Menu`.

**Checkout page:** Contact Information, Order Type, Delivery Information (address shown/required only for delivery), Additional Notes, Order Summary, `Place Order` button (`Placing Order...` while submitting). Show server field errors next to the fields and item errors in an alert.

### 20.5 Loading, Error and Empty States

Every data-driven view MUST handle loading, error (with retry) and empty states: empty cart, no products in category, no featured products, menu failed to load, order not found.

### 20.6 Mobile-First and Accessibility

- Responsive navigation, large touch targets, readable prices, easy quantity controls, floating cart indicator, simple checkout, optimized images (lazy loading, correct sizes), no horizontal overflow.
- Semantic HTML, labelled inputs, keyboard navigation, visible focus states, alt text for meaningful images, real `<button>`s (never clickable `div`s), accessible error messages (`aria-describedby`, `role="alert"`), sufficient contrast, proper heading hierarchy.
- Move focus to the page heading (or error summary) on route change/failed submit.

### 20.7 SEO

A client-rendered SPA limits SEO. Mitigate pragmatically:

- Per-route `<title>` and meta description (e.g. `react-helmet-async`).
- Provide `robots.txt` and a `sitemap.xml` generated by Django (or at build time) from active sections, categories and products.
- Add JSON-LD `Restaurant` structured data on the homepage; `Product` structured data on product pages.
- Open Graph defaults in `index.html`.
- If search visibility later becomes a priority, consider prerendering key routes. Do not adopt Next.js without an explicit request.

---

## 21. Security Requirements

- HTTPS and secure cookies in production; security headers (HSTS, `X-Content-Type-Options`, etc.).
- Environment variables for all secrets. Never place secrets in Git, React source, `VITE_*` variables or seed data. Anything in a `VITE_*` variable is public.
- Authentication: follow the existing token/JWT approach. If cookie/session auth is used for the SPA, enforce CSRF protection on unsafe methods. If token auth is used, store tokens carefully and never log them.
- Public write endpoints (`/api/orders/`, `/api/cart/validate/`) MUST be rate-limited with DRF throttling. Consider a honeypot field or CAPTCHA if abuse appears.
- CORS: allow only known origins in production.
- Never trust the browser for: price, product name, subtotal, total, availability, order status.
- Customers must not be able to change order status, modify prices, view other customers' orders, access Django Admin or notification records.
- Order lookup requires the unguessable `tracking_token`; never expose `/orders/1/`-style lookups. Order tracking responses must not leak other customers' data.
- React escapes output by default. Never use `dangerouslySetInnerHTML` with user-supplied or admin-supplied content.
- Do not expose stack traces; log technical errors server-side.
- Privacy: collect only what is needed to fulfil the order; restrict access to customer data; never log passwords, API secrets, tokens or unnecessary personal information.

---

## 22. Backend Implementation Guidelines

- Business logic lives in services: `catalog/services.py`, `orders/services.py`, `notifications/services.py`. Views/viewsets stay thin: request → serializer → service → response.
- Use selectors for read-heavy queries (`get_active_sections()`, `get_category_products()`, `get_order_by_number()`).
- Recommended service API:
  - Orders: `validate_cart()`, `calculate_order_totals()`, `create_order()`, `change_order_status()`, `delete_expired_completed_orders()`
  - Notifications: `build_order_message()`, `send_order_notification()`, `retry_notification()`
- Use `select_related()` / `prefetch_related()` to avoid N+1 queries, e.g. the menu endpoint prefetches `categories__products` with active filters.
- Indexes: `Product.is_available`, `Product.is_featured`, `Product.slug` (unique), `Order.order_number` (unique), `Order.status`, `Order.created_at`, `Order.completed_at`, `Notification.status`. Don't add indexes blindly.
- Constraints: unique `order_number`, unique section slug, `unique(section, category slug)`, unique `idempotency_key`.
- Timestamps are timezone-aware; display customer-facing times in the restaurant's local timezone (format on the frontend with `Intl.DateTimeFormat` using the configured timezone, or return a formatted field).
- Currency is configurable (initially `NGN`, displayed as `₦5,000`). Store numeric values, never formatted strings.
- Product images: generate derivatives (thumbnail, card, detail); prefer modern formats (WebP/AVIF) where supported; production media on object storage/CDN. The API returns absolute image URLs.
- Don't hard-delete products referenced by orders; prefer `is_available=False`. (Because completed orders are cleaned up automatically, `OrderItem.product` should use `SET_NULL` or `PROTECT` consistently. Pick one and document it.)

---

## 23. Frontend Implementation Guidelines

- TypeScript strict mode; no `any` unless justified.
- Keep API calls in `src/api/`. Components never call `fetch` directly.
- One central API client handles base URL, auth headers, JSON parsing, error normalization (matching section 16.5) and `snake_case` ↔ `camelCase` mapping.
- Keep route-level pages thin; extract reusable components.
- Use environment configuration via `VITE_API_BASE_URL` (public values only).
- Handle every API failure with a user-friendly message; never show raw errors.
- Memoize only when measured to matter. Don't over-engineer state management.
- Format money in one utility (`formatMoney(amount, currency)`) and use it everywhere.

---

## 24. Testing Requirements

### 24.1 Backend (pytest-django or Django `TestCase`, DRF `APIClient`)

- **Catalog:** section/category/product creation, relationships, availability, slug behavior, active/inactive filtering, menu endpoint output.
- **Cart validation:** valid cart, zero/negative/non-integer quantities, unknown product, unavailable product, inactive category/section.
- **Orders:** successful creation, multiple items, quantity math, delivery fee, pickup fee, delivery address validation, historical price snapshots, order number uniqueness, transaction rollback on failure, client-sent prices ignored, idempotency (same key → one order), status transition rules.
- **Cleanup:** completed orders older than the retention window are deleted; recent and cancelled orders are not.
- **Notifications:** message generation, item details and totals, provider success, provider failure (order remains `PENDING`, notification `FAILED`), retry behavior.
- **Security:** throttling, admin access, unauthorized order access, tracking-token requirement, invalid input, CORS configuration.

### 24.2 Frontend (Vitest + React Testing Library)

- Cart context: add, update, remove, clear, persistence.
- Checkout form: conditional address requirement, server error display, double-submit prevention, idempotency key reuse.
- Components: ProductCard states (available/unavailable), empty states, loading/error states.
- API client: error normalization and case mapping.

### 24.3 End-to-End (Playwright)

The business-critical flow MUST be covered:

```text
Open website -> Meat Grill -> Chicken category -> Add Grilled Chicken
-> Open cart -> Change quantity to 2 -> Checkout -> Enter customer info
-> Select Delivery -> Enter address -> Place Order
-> Order created in PostgreSQL -> WhatsApp notification generated and sent (mock provider)
-> Customer sees confirmation
```

Also test the failure path: WhatsApp provider fails → the order is saved and `PENDING` → notification `FAILED` and logged → retry possible → the customer still sees confirmation.

---

## 25. Logging and Monitoring

Log: order created, order status changed, WhatsApp sent/failed/retried, unexpected checkout errors, completed-order cleanup counts.

Never log passwords, API secrets, tokens or unnecessary personal information.

Production: application error monitoring (Sentry for both Django and React), server logs, database monitoring, notification failure monitoring, uptime monitoring.

---

## 26. Backups

- Daily PostgreSQL backups, stored separately from the database server.
- Consider media backups; test restores periodically.
- Because completed orders are auto-deleted, backups should not be relied on for order history. Export data first if analytics are needed.

---

## 27. Environment Variables

`.env.example` documents the required configuration.

Backend:

```text
DJANGO_SECRET_KEY=
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=
CORS_ALLOWED_ORIGINS=
CSRF_TRUSTED_ORIGINS=

DATABASE_URL=

WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ADMIN_NUMBER=

REDIS_URL=

COMPLETED_ORDER_RETENTION_MINUTES=60
ORDER_NUMBER_PREFIX=ORD

MEDIA_STORAGE_BUCKET=
MEDIA_STORAGE_ACCESS_KEY=
MEDIA_STORAGE_SECRET_KEY=

SENTRY_DSN=
```

Frontend (public values only):

```text
VITE_API_BASE_URL=/api
VITE_SENTRY_DSN=
```

Never commit the actual `.env`.

---

## 28. Settings Architecture

Backend settings split: `base.py` (apps, middleware, DRF config, templates for Admin, database, i18n, static/media defaults), `development.py` (debug, local DB, CORS for `localhost:5173`, dev tools), `production.py` (secure cookies, HTTPS settings, allowed hosts, logging, static/media storage).

DRF defaults to configure: authentication classes, default permission class (`AllowAny` only where explicitly set on public views), throttle classes/rates, exception handler, pagination (only where lists can grow), JSON renderer only in production.

---

## 29. Docker and Deployment

`docker compose up` should start: `db` (PostgreSQL), `redis`, `backend` (Django, dev server), `frontend` (Vite dev server), and optionally `celery` and `celery-beat`.

Production: Nginx serves the built React app (`dist/`) and proxies `/api/`, `/admin/` and `/static/` to Gunicorn; PostgreSQL; Redis/Celery if enabled. Deployment MUST include HTTPS, static files, media storage, migrations, environment configuration, logging and backups. Nginx must fall back to `index.html` for client-side routes.

---

## 30. CI/CD

CI runs on every push:

- Backend: install dependencies, lint/format (ruff/black), `python manage.py check`, `makemigrations --check`, tests
- Frontend: install, lint (ESLint), type-check (`tsc --noEmit`), unit tests, build
- Optional: Playwright E2E against a test stack

Deploy only after CI passes.

---

## 31. Code Quality and Dependency Policy

- Keep functions small; use descriptive names; avoid duplicated business logic, giant views and giant components; avoid hidden global state; document non-obvious behavior; add tests for critical logic; prefer framework conventions.
- Add a dependency only if the built-in functionality is insufficient, it solves a real requirement, it is maintained, and it doesn't add disproportionate complexity. Avoid dependency sprawl on both sides.

Commit style: `feat: add catalog models`, `feat: add menu API`, `feat: implement cart context`, `feat: implement checkout endpoint`, `feat: add WhatsApp provider`, `test: add order creation tests`, `fix: prevent unavailable products from checkout`.

Never commit `.env`, database dumps, secret keys, production credentials or generated caches.

---

## 32. Development Milestones

1. **Foundation** — monorepo, Django + DRF setup, PostgreSQL, settings, CORS, Vite + React + TS + Tailwind, Docker, env config. *Acceptance: both apps start, DB connects, Tailwind renders, frontend can call a health endpoint.*
2. **Catalog API + Admin** — models (UUID), migrations, admin, seed command, menu/section/category/product endpoints, site config endpoint. *Acceptance: admin can manage products; API returns only active content.*
3. **Frontend Catalog** — API client, `RestaurantContext` from the backend, homepage, menu browser, section/category/product pages, loading/error/empty states. *Acceptance: customer browses live data with no local storage catalog.*
4. **Cart** — `CartContext`, `/api/cart/validate/`, cart page, quantity controls. *Acceptance: a complete cart can be built without login and survives refresh.*
5. **Checkout** — `Order`/`OrderItem`, `OrderService`, idempotency, `/api/orders/`, checkout form, success page. *Acceptance: valid checkout creates exactly one order with correct server-calculated totals.*
6. **WhatsApp** — `Notification` model, message builder, provider abstraction, provider, status/error handling. *Acceptance: a new order notification reaches the configured WhatsApp destination.*
7. **Admin Operations** — order admin, status transition enforcement, notification retry action, search/filters, completed-order cleanup job. *Acceptance: staff operate orders from Django Admin.*
8. **Hardening** — throttling, security headers, logging, query optimization, image derivatives, accessibility audit, SEO tags/sitemap, monitoring.
9. **Production** — production settings, Nginx, Gunicorn, HTTPS, media storage, CI/CD, backups.

After each milestone, run the relevant backend and frontend tests before continuing.

---

## 33. Definition of Done

**Catalog:** three default sections exist; admin can create/edit sections, categories and products, upload images, change prices and disable products; customers only see active content.

**Cart:** add, change quantity, remove, clear; cart survives navigation and refresh; invalid quantities rejected; unavailable products flagged.

**Checkout:** valid customer info required; delivery requires an address and pickup does not; server calculates all prices; creation is transactional; order number unique; item prices snapshotted; duplicate submissions protected.

**WhatsApp:** notification generated with all required details; success and failure recorded; failures never delete orders; retries supported.

**Admin:** orders visible, searchable, filterable; status changes follow valid transitions; notification status visible; completed orders are removed automatically after the retention window.

**Frontend:** mobile and desktop responsive; accessible forms; loading, empty and error states; availability clearly shown; cart easy to reach; no data sourced from local storage except the cart.

**Production:** HTTPS; secrets in environment variables; debug off; backups; error monitoring; static and media served correctly; all automated tests pass.

---

## 34. AI Implementation Rules

1. **Inspect before changing.** Read existing files, preserve conventions, make the smallest coherent change, never blindly overwrite. Existing frontend pieces (e.g. `src/api/auth`, `RestaurantContext`, `MenuBrowser`) should be adapted, not rewritten from scratch.
2. **Backend feature order:** model → migration → service → serializer → view/URL → tests. **Frontend feature order:** types → API module → context/hook → components → page → tests.
3. **Server is authoritative.** Never trust client-submitted price, subtotal, total, availability, product name or order status.
4. **Preserve order pricing.** Never mutate an order's snapshotted prices when a product price changes.
5. **Notification is secondary.** Order persistence succeeds independently from WhatsApp.
6. **Thin views, thin components.** Business rules belong in backend services; the frontend only presents and collects input.
7. **Reuse components.** No large duplicated JSX blocks.
8. **Test critical behavior.** Every critical business rule has a test.
9. **Secure by default.** Use Django/DRF security features rather than custom security.
10. **Don't over-engineer.** Prefer Django + DRF + React + PostgreSQL over distributed architecture.
11. **Keep the contract in sync.** When an API response changes, update the serializer, the TypeScript type, the API mapping layer and the tests together.

---

## 35. Implementation Sequence

1. Repository/monorepo foundation
2. Environment configuration
3. Django settings (+ DRF, CORS)
4. PostgreSQL connection
5. Vite + React + TypeScript + Tailwind setup
6. Core/site configuration model + `/api/site/`
7. Catalog models and migrations
8. Catalog admin
9. Seed command
10. Catalog selectors/services
11. Catalog API endpoints
12. Frontend API client + types + mapping layer
13. `RestaurantContext` wired to the backend
14. Base layout and shared components
15. Homepage
16. Menu UI (menu browser, section, category, product detail)
17. `CartContext` (+ localStorage persistence)
18. `/api/cart/validate/` + cart page
19. Order models and migrations
20. Order service, serializer and `/api/orders/` (idempotency included)
21. Checkout form and success page
22. Order admin + status transition rules
23. Notification models
24. WhatsApp message builder
25. WhatsApp provider abstraction + implementation
26. Async notification processing (Celery) + retry handling
27. Completed-order cleanup job
28. Order tracking endpoint + page
29. Security hardening (throttling, headers, CORS)
30. Query optimization
31. Image optimization
32. Backend + frontend automated tests
33. End-to-end tests
34. Production settings
35. Docker/deployment
36. Monitoring
37. Backup configuration
38. Documentation

---

## 36. Future Extension Points (do not implement now)

- **Product variants and add-ons** (size, portion, extras): keep `OrderItem` extensible with `variant` and `selected_options`.
- **Payments:** a separate `Payment` domain linked to `Order` (provider, reference, amount, currency, status). Don't add per-provider fields to `Order`.
- **Delivery zones and distance pricing:** `DeliveryZone` model (name, fee, active). A courier-facing view for the restaurant's own delivery staff.
- **Customer accounts and order history.**
- **Promotions:** coupons and discounts.
- **Operational dashboard:** today's orders and revenue, pending/preparing orders, failed notifications, popular products.
- **Caching:** active menu, site configuration, featured products. Never cache mutable order state.
- **Prerendering/SSR** for SEO if it becomes a priority.

---

## 37. Final Architectural Constraint

```text
React SPA (presentation)
      |  JSON over HTTPS
      v
DRF API (thin views/serializers)
      |
      v
Services: Catalog -> Orders -> Notifications
      |
      v
PostgreSQL (source of truth)
```

The backend remains a **modular Django monolith** (catalog, orders, notifications, core, accounts). The frontend remains a single React app. Do not split these into independent services unless explicitly required.

The primary objective is a reliable restaurant ordering system that is easy for restaurant staff to operate and easy for developers to maintain.