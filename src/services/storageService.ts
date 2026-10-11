import {
  Section,
  Category,
  Product,
  CartItem,
  Order,
  OrderItem,
  OrderType,
  OrderStatus,
  NotificationLog,
  SiteConfiguration,
} from '../types';
import {
  initialSections,
  initialCategories,
  initialProducts,
  initialSiteConfig,
} from '../data/seedData';
import { notificationService } from './notificationService';

const STORAGE_KEYS = {
  SECTIONS: 'restaurant_sections_v1',
  CATEGORIES: 'restaurant_categories_v1',
  PRODUCTS: 'restaurant_products_v1',
  ORDERS: 'restaurant_orders_v1',
  NOTIFICATIONS: 'restaurant_notifications_v1',
  SITE_CONFIG: 'restaurant_site_config_v1',
  CART: 'restaurant_session_cart_v1',
  SUBMISSION_TOKENS: 'restaurant_submission_tokens_v1',
};

class StorageService {
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    if (this.isBrowser) {
      try {
        localStorage.removeItem('restaurant_admin_auth_v1');
        localStorage.removeItem('restaurant_registered_users_v2');
        localStorage.removeItem('restaurant_auth_current_user_v2');
      } catch (error) {
        console.error('Failed to clear legacy local authentication data.', error);
      }
    }
    this.initializeIfEmpty();
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to persist key: ${key}`, err);
    }
  }

  public initializeIfEmpty(): void {
    if (!this.isBrowser) return;
    if (!localStorage.getItem(STORAGE_KEYS.SECTIONS)) {
      this.resetToSeedData();
    }
  }

  public resetToSeedData(): void {
    if (!this.isBrowser) return;
    this.setItem(STORAGE_KEYS.SECTIONS, initialSections);
    this.setItem(STORAGE_KEYS.CATEGORIES, initialCategories);
    this.setItem(STORAGE_KEYS.PRODUCTS, initialProducts);
    this.setItem(STORAGE_KEYS.SITE_CONFIG, initialSiteConfig);
    // Keep or seed a sample order for immediate rich preview
    const sampleOrders = this.createInitialSampleOrders();
    this.setItem(STORAGE_KEYS.ORDERS, sampleOrders.orders);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, sampleOrders.notifications);
  }

  // --- SECTIONS ---
  public getSections(): Section[] {
    const sections = this.getItem<Section[]>(STORAGE_KEYS.SECTIONS, initialSections);
    return sections.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }

  public getActiveSections(): Section[] {
    return this.getSections().filter((s) => s.is_active);
  }

  public getSectionBySlug(slug: string): Section | undefined {
    return this.getSections().find((s) => s.slug === slug);
  }

  public saveSection(section: Section): void {
    const sections = this.getSections();
    const index = sections.findIndex((s) => s.id === section.id);
    section.updated_at = new Date().toISOString();
    if (index >= 0) {
      sections[index] = section;
    } else {
      sections.push(section);
    }
    this.setItem(STORAGE_KEYS.SECTIONS, sections);
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    const categories = this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    return categories.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }

  public getActiveCategories(sectionId?: string): Category[] {
    return this.getCategories().filter(
      (c) => c.is_active && (!sectionId || c.section_id === sectionId)
    );
  }

  public getCategoryBySlug(slug: string, sectionId?: string): Category | undefined {
    return this.getCategories().find(
      (c) => c.slug === slug && (!sectionId || c.section_id === sectionId)
    );
  }

  public saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    category.updated_at = new Date().toISOString();
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return products.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  }

  /**
   * Rule 11 of spec.md:
   * A product can only be added to a new order if:
   * product exists AND product.is_available == True
   * AND product.category.is_active == True
   * AND product.category.section.is_active == True
   */
  public isProductEligible(productId: string): { eligible: boolean; reason?: string } {
    const product = this.getProductById(productId);
    if (!product) return { eligible: false, reason: 'Product does not exist.' };
    if (!product.is_available) return { eligible: false, reason: `"${product.name}" is currently unavailable.` };

    const categories = this.getCategories();
    const category = categories.find((c) => c.id === product.category_id);
    if (!category || !category.is_active) {
      return { eligible: false, reason: `Category for "${product.name}" is inactive.` };
    }

    const sections = this.getSections();
    const section = sections.find((s) => s.id === category.section_id);
    if (!section || !section.is_active) {
      return { eligible: false, reason: `Section for "${product.name}" is inactive.` };
    }

    return { eligible: true };
  }

  public getActiveProducts(categoryId?: string): Product[] {
    const activeCategories = new Map(this.getActiveCategories().map((c) => [c.id, c]));
    const activeSections = new Map(this.getActiveSections().map((s) => [s.id, s]));

    return this.getProducts().filter((p) => {
      if (!p.is_available) return false;
      const cat = activeCategories.get(p.category_id);
      if (!cat) return false;
      if (!activeSections.has(cat.section_id)) return false;
      if (categoryId && p.category_id !== categoryId) return false;
      return true;
    });
  }

  public getFeaturedProducts(): Product[] {
    return this.getActiveProducts().filter((p) => p.is_featured);
  }

  public saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    product.updated_at = new Date().toISOString();
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  // --- SITE CONFIG ---
  public getSiteConfig(): SiteConfiguration {
    return this.getItem<SiteConfiguration>(STORAGE_KEYS.SITE_CONFIG, initialSiteConfig);
  }

  public saveSiteConfig(config: SiteConfiguration): void {
    this.setItem(STORAGE_KEYS.SITE_CONFIG, config);
  }

  // --- SESSION CART ---
  public getCart(): CartItem[] {
    return this.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
  }

  public saveCart(items: CartItem[]): void {
    // Sanitize: remove 0 or invalid quantities
    const sanitized = items
      .filter((i) => i.quantity > 0 && i.quantity <= 99)
      .map((i) => ({ product_id: i.product_id, quantity: Math.floor(i.quantity) }));
    this.setItem(STORAGE_KEYS.CART, sanitized);
  }

  public clearCart(): void {
    this.setItem(STORAGE_KEYS.CART, []);
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    return orders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getOrderByNumber(orderNumber: string): Order | undefined {
    return this.getOrders().find((o) => o.order_number === orderNumber);
  }

  public getNotifications(): NotificationLog[] {
    const logs = this.getItem<NotificationLog[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return logs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public saveNotification(log: NotificationLog): void {
    const logs = this.getNotifications();
    const index = logs.findIndex((l) => l.id === log.id);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.unshift(log);
    }
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, logs);
  }

  /**
   * Generates a unique, human-readable order number: ORD-YYMMDD-XXXXX
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const orders = this.getOrders();
    const todayPrefix = `ORD-${yy}${mm}${dd}`;
    const todayOrdersCount = orders.filter((o) => o.order_number.startsWith(todayPrefix)).length;
    const seq = String(todayOrdersCount + 1).padStart(5, '0');
    return `${todayPrefix}-${seq}`;
  }

  /**
   * Order Creation Transaction conforming to Sections 11, 14, 15, 16, 17, 21, 24 of spec.md
   */
  public async createOrder(params: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    order_type: OrderType;
    delivery_address?: string;
    customer_note?: string;
    cart_items: CartItem[];
    idempotency_token?: string;
    user_id?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    // 1. Validate customer data
    const name = params.customer_name?.trim();
    if (!name || name.length < 2) {
      return { success: false, error: 'Please provide a valid customer name.' };
    }

    const phone = params.customer_phone?.trim();
    if (!phone || phone.length < 7) {
      return { success: false, error: 'Please provide a valid phone number.' };
    }

    // 2. Validate Order Type & Delivery Address
    if (params.order_type === 'DELIVERY') {
      const address = params.delivery_address?.trim();
      if (!address || address.length < 5) {
        return { success: false, error: 'A complete delivery address is required for delivery orders.' };
      }
    }

    // 3. Cart check
    if (!params.cart_items || params.cart_items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items before checking out.' };
    }

    // 4. Duplicate protection / idempotency check (Section 24)
    if (params.idempotency_token) {
      const recentTokens = this.getItem<Record<string, number>>(STORAGE_KEYS.SUBMISSION_TOKENS, {});
      const lastSubmitted = recentTokens[params.idempotency_token];
      if (lastSubmitted && Date.now() - lastSubmitted < 60000) {
        return { success: false, error: 'This order has already been submitted. Please wait.' };
      }
      recentTokens[params.idempotency_token] = Date.now();
      this.setItem(STORAGE_KEYS.SUBMISSION_TOKENS, recentTokens);
    }

    // 5. Authoritative Product Revalidation & Price Calculation (Rule 11 & 14)
    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of params.cart_items) {
      if (!item.quantity || item.quantity < 1 || item.quantity > 99) {
        return { success: false, error: `Invalid quantity specified for item: ${item.quantity}` };
      }

      const eligibility = this.isProductEligible(item.product_id);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason || 'An item in your cart is unavailable.' };
      }

      const product = this.getProductById(item.product_id)!;
      const unitPrice = product.price; // authoritative from DB
      const itemSubtotal = unitPrice * item.quantity;
      calculatedSubtotal += itemSubtotal;

      // Rule 16: Snapshot product_name and unit_price
      orderItems.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        unit_price: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        created_at: new Date().toISOString(),
      });
    }

    // 6. Delivery fee computation
    const config = this.getSiteConfig();
    const deliveryFee = params.order_type === 'DELIVERY' ? config.default_delivery_fee : 0;
    const calculatedTotal = calculatedSubtotal + deliveryFee;

    const orderNumber = this.generateOrderNumber();
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      tracking_token: crypto.randomUUID(),
      user_id: params.user_id,
      customer_name: name,
      customer_phone: phone,
      customer_email: params.customer_email?.trim() || undefined,
      order_type: params.order_type,
      delivery_address: params.order_type === 'DELIVERY' ? params.delivery_address?.trim() : undefined,
      customer_note: params.customer_note?.trim() || undefined,
      subtotal: calculatedSubtotal,
      delivery_fee: deliveryFee,
      total: calculatedTotal,
      status: 'PENDING',
      whatsapp_status: 'PENDING',
      created_at: now,
      updated_at: now,
      items: orderItems,
    };

    // 7. Atomic Commit to Database (Orders Table)
    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.setItem(STORAGE_KEYS.ORDERS, orders);

    // Clear session cart
    this.clearCart();

    // 8. Trigger Isolated WhatsApp Notification (Section 25 & 29: failure doesn't rollback order)
    try {
      const notifResult = await notificationService.sendOrderNotification(newOrder, config);
      newOrder.whatsapp_status = notifResult.status;
      newOrder.whatsapp_message_id = notifResult.messageId;
      this.saveNotification(notifResult.log);

      // Update order record with notification outcome
      this.updateOrder(newOrder);
    } catch (notifErr) {
      console.warn('WhatsApp dispatch warning:', notifErr);
      newOrder.whatsapp_status = 'FAILED';
      this.updateOrder(newOrder);
    }

    return { success: true, order: newOrder };
  }

  public updateOrder(order: Order): void {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    order.updated_at = new Date().toISOString();
    if (index >= 0) {
      orders[index] = order;
      this.setItem(STORAGE_KEYS.ORDERS, orders);
    }
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus): { success: boolean; error?: string } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    // Valid workflow transitions (Section 19):
    // PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED
    // CANCELLED allowed from pre-completed states
    if (order.status === 'COMPLETED' && newStatus !== 'COMPLETED') {
      return { success: false, error: 'Completed orders cannot be transitioned.' };
    }

    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.ORDERS, orders);
    return { success: true };
  }

  private createInitialSampleOrders(): { orders: Order[]; notifications: NotificationLog[] } {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const sampleOrder: Order = {
      id: 'ord-sample-01',
      order_number: `ORD-${yy}${mm}${dd}-00042`,
      tracking_token: crypto.randomUUID(),
      customer_name: 'Babajide Adeleke',
      customer_phone: '+234 802 334 9812',
      customer_email: 'adeleke@example.ng',
      order_type: 'DELIVERY',
      delivery_address: '15 Victoria Arobieke Street, Lekki Phase 1, Lagos',
      customer_note: 'Please make the grilled chicken well spiced with extra onions.',
      subtotal: 14800,
      delivery_fee: 2000,
      total: 16800,
      status: 'PREPARING',
      whatsapp_status: 'SENT',
      whatsapp_message_id: 'wamid.HBgM26092000042VRK91',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      items: [
        {
          id: 'item-sample-01',
          order_id: 'ord-sample-01',
          product_id: 'prod-grilled-chicken-half',
          product_name: 'Flame-Grilled Half Chicken',
          unit_price: 5500,
          quantity: 2,
          subtotal: 11000,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'item-sample-02',
          order_id: 'ord-sample-01',
          product_id: 'prod-classic-meat-pie',
          product_name: 'Golden Flaky Beef Meat Pie',
          unit_price: 1800,
          quantity: 1,
          subtotal: 1800,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'item-sample-03',
          order_id: 'ord-sample-01',
          product_id: 'prod-fresh-pineapple-ginger',
          product_name: 'Cold-Pressed Pineapple Ginger Splash',
          unit_price: 2000,
          quantity: 1,
          subtotal: 2000,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    };

    const sampleNotification: NotificationLog = {
      id: 'notif-sample-01',
      order_id: sampleOrder.id,
      order_number: sampleOrder.order_number,
      channel: 'WHATSAPP',
      status: 'SENT',
      provider_message_id: sampleOrder.whatsapp_message_id,
      attempts: 1,
      created_at: sampleOrder.created_at,
      sent_at: sampleOrder.created_at,
      message_text: `🍽 NEW RESTAURANT ORDER\n\nOrder: ${sampleOrder.order_number}\n\nCustomer:\n${sampleOrder.customer_name}\n${sampleOrder.customer_phone}\n\nType:\nDelivery\n\nItems:\n2 × Flame-Grilled Half Chicken — ₦11,000\n1 × Golden Flaky Beef Meat Pie — ₦1,800\n1 × Cold-Pressed Pineapple Ginger Splash — ₦2,000\n\nSubtotal: ₦14,800\nDelivery: ₦2,000\nTOTAL: ₦16,800\n\nAddress:\n${sampleOrder.delivery_address}\n\nNote:\n${sampleOrder.customer_note}\n\nTime:\nToday`,
    };

    return { orders: [sampleOrder], notifications: [sampleNotification] };
  }

}

export const storageService = new StorageService();
