import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Section,
  Category,
  Product,
  CartItem,
  CourierOption,
  Order,
  OrderItem,
  NotificationLog,
  SiteConfiguration,
  ActiveView,
  OrderStatus,
  OrderType,
  AdminUser,
  User,
  UserRole,
} from '../types';
import { storageService } from '../services/storageService';
import {
  applyRealtimeEvent,
  createRealtimeWebSocketUrl,
  RealtimeManager,
  type RealtimeConnectionStatus,
  type RealtimeEvent,
} from '../api/realtime';

import { fetchSiteConfig, saveSiteConfig } from '../api/siteConfig';
import {
  deleteCategoryApi,
  deleteCompletedOrderApi,
  deleteProductApi,
  deleteSectionApi,
  assignOrderCourierApi,
  fetchAdminCouriers,
  fetchAdminNotifications,
  retryAdminNotification,
  saveCategoryApi,
  saveSectionApi,
} from '../api/admin';

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  updateCurrentUserProfile,
  forgotPasswordUser,
} from "../api/auth";

import {
  fetchMenu
} from '../api/menu';
import { saveProductApi } from '../api/products';

import { createOrderApi, fetchMyOrders, trackOrderApi, updateOrderStatusApi } from '../api/orders';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface RestaurantContextType {
  sections: Section[];
  activeSections: Section[];
  categories: Category[];
  activeCategories: Category[];
  products: Product[];
  activeProducts: Product[];
  featuredProducts: Product[];
  siteConfig: SiteConfiguration;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Views / Routing
  activeView: ActiveView;
  navigateTo: (view: ActiveView) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (prod: Product | null) => void;

  // Orders & Notifications
  orders: Order[];
  notifications: NotificationLog[];
  couriers: CourierOption[];
  realtimeStatus: RealtimeConnectionStatus;
  lastRealtimeEvent: RealtimeEvent | null;
  createOrder: (params: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    order_type: OrderType;
    delivery_address?: string;
    customer_note?: string;
    idempotency_key: string;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<{ success: boolean; error?: string }>;
  lookupOrder: (orderNumber: string, token?: string) => Promise<Order>;
  retryNotification: (logId: string) => Promise<{ success: boolean; error?: string }>;

  // Admin catalog actions
  saveProduct: (
    product: Product,
    imageFile?: File | null
  ) => Promise<{ success: boolean; error?: string }>;
  saveCategory: (category: Category) => Promise<{ success: boolean; error?: string }>;
  saveSection: (section: Section, imageFile?: File | null) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;
  deleteSection: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;
  deleteCompletedOrder: (id: string) => Promise<{ success: boolean; error?: string }>;
  assignOrderCourier: (orderId: string, courierId: string | null) => Promise<{ success: boolean; error?: string }>;
  updateSiteConfig: (config: SiteConfiguration, logoFile?: File | null) => Promise<{ success: boolean; error?: string }>;

  // Complete User & Role Authentication
  currentUser: User | null;
  authLoading: boolean;
  authRestoreError: string | null;
  retryAuthRestore: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }>;

  forgotPassword: (email: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;

  register: (params: {
    full_name: string;
    email: string;
    phone_number: string;
    delivery_address: string;
    password: string;
  }) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }>;
  updateProfile: (profile: Pick<User, 'full_name' | 'phone_number'>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => void;
  userOrders: Order[];
  canUserTrackOrder: (order: Order) => boolean;
  isOrderOwnedByUser: (order: Order) => boolean;

  // Admin Authentication (backward-compatible aliases)
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;

  // Toast
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;



  // Helper
  formatMoney: (amount: number) => string;

  // Menu
  menuLoading: boolean;
  menuError: string | null;
  reloadMenu: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const requiresAuthentication = (view: ActiveView) =>
  view.type === 'my-orders' || view.type === 'order-status' || view.type === 'profile' || view.type === 'courier' || view.type === 'admin';

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const DEFAULT_SITE_CONFIG: SiteConfiguration = {
    restaurant_name: '',
    tagline: '',
    logo: '',
    phone: '',
    whatsapp_number: '',
    email: '',
    address: '',
    description: '',
    opening_hours: '',
    currency_symbol: '₦',
    currency_code: 'NGN',
    delivery_enabled: true,
    pickup_enabled: true,
    default_delivery_fee: 0,
  };
  const [siteConfig, setSiteConfig] = useState<SiteConfiguration>(DEFAULT_SITE_CONFIG);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeConnectionStatus>('disconnected');
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<RealtimeEvent | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const VIEW_KEY = 'mimis_active_view';

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    try {
      const saved = sessionStorage.getItem(VIEW_KEY);
      return saved ? (JSON.parse(saved) as ActiveView) : { type: 'home' };
    } catch {
      return { type: 'home' };
    }
  });
  const [pendingAuthView, setPendingAuthView] = useState<ActiveView | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(VIEW_KEY, JSON.stringify(activeView));
    } catch {
      /* storage unavailable, ignore */
    }
  }, [activeView]);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // User Authentication & Roles State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    let cancelled = false;
    setOrders([]); // never carry one user's orders into the next session
    if (!currentUser) return;

    fetchMyOrders()
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch(() => { if (!cancelled) setOrders([]); });

    return () => { cancelled = true; };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.is_admin) {
      setNotifications([]);
      setCouriers([]);
      return;
    }
    let cancelled = false;
    fetchAdminNotifications()
      .then((logs) => { if (!cancelled) setNotifications(logs); })
      .catch((error) => {
        if (!cancelled) showToast(error instanceof Error ? error.message : 'Unable to load notifications.', 'error');
      });
    fetchAdminCouriers()
      .then((items) => { if (!cancelled) setCouriers(items); })
      .catch((error) => {
        if (!cancelled) showToast(error instanceof Error ? error.message : 'Unable to load couriers.', 'error');
      });
    return () => { cancelled = true; };
  }, [currentUser?.id, currentUser?.is_admin, showToast]);



  const [authLoading, setAuthLoading] = useState(true);
  const [authRestoreError, setAuthRestoreError] = useState<string | null>(null);
  const cartKey = currentUser ? `mimis_cart:${currentUser.id}` : 'mimis_cart:guest';

  const persistCart = useCallback(
    (items: CartItem[]) => {
      try {
        localStorage.setItem(cartKey, JSON.stringify(items));
      } catch {
        /* storage unavailable, ignore */
      }
    },
    [cartKey]
  );

  // load the right cart whenever the user changes (login, logout, page load)
  useEffect(() => {
    if (authLoading) return; // wait until we know who is signed in
    try {
      const raw = localStorage.getItem(cartKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCart([]);
    }
  }, [authLoading, cartKey]);
  const retryAuthRestore = useCallback(async () => {
    setAuthLoading(true);
    setAuthRestoreError(null);
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to restore authentication:", error);
      setAuthRestoreError(
        error instanceof Error ? error.message : "Unable to restore your session."
      );
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void retryAuthRestore();
  }, [retryAuthRestore]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = Boolean(currentUser?.is_admin);

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);

      setCurrentUser(data.user);
      if (pendingAuthView) {
        setActiveView(pendingAuthView);
        setPendingAuthView(null);
      }
      setIsAuthModalOpen(false);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid email or password.",
      };
    }
  };



  const forgotPassword = async (email: string) => {
    try {
      const data = await forgotPasswordUser(email);

      return {
        success: true,
        message:
          data.message ||
          data.detail ||
          "If an account exists for this email, password reset instructions have been sent.",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send reset instructions.",
      };
    }
  };

  const register = async (payload: {
    full_name: string;
    email: string;
    phone_number: string;
    delivery_address: string;
    password: string;
  }) => {
    try {
      const data = await registerUser(payload);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create account.",
      };
    }
  };

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setIsCartOpen(false);
      setSelectedProductModal(null);
      setActiveView({ type: 'home' });
      setPendingAuthView(null);
      setSections([]);
      setCategories([]);
      setProducts([]);

      showToast("Signed out successfully.", "info");

      setActiveView((curr) =>
        curr.type === "admin" || curr.type === "my-orders"
          ? { type: "home" }
          : curr
      );
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Could not sign out. Please try again.", "error");
    }
  }, [showToast]);

  const updateProfile = useCallback(async (profile: Pick<User, 'full_name' | 'phone_number'>) => {
    try {
      const updatedUser = await updateCurrentUserProfile(profile) as User;
      setCurrentUser(updatedUser);
      showToast('Profile updated successfully.', 'success');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update your profile.';
      return { success: false, error: message };
    }
  }, [showToast]);

  const userOrders = useMemo(
    () => (currentUser ? orders.filter((o) => o.user_id === currentUser.id) : []),
    [currentUser, orders]
  );


  const canUserTrackOrder = useCallback(
    (order: Order) => Boolean(currentUser && (currentUser.is_admin || order.user_id === currentUser.id)),
    [currentUser]
  );

  const isOrderOwnedByUser = useCallback(
    (order: Order) => Boolean(currentUser && order.user_id === currentUser.id),
    [currentUser]
  );


  // Backwards compatibility aliases for admin authentication
  const adminUser = isAdmin ? currentUser : null;
  const isAdminAuthenticated = isAdmin;
  const isAdminLoginModalOpen = isAuthModalOpen;
  const setIsAdminLoginModalOpen = useCallback(
    (open: boolean) => {
      if (open) {
        openAuthModal('login');
      } else {
        closeAuthModal();
      }
    },
    [openAuthModal, closeAuthModal]
  );

  const loginAdmin = useCallback(
    async (email: string, password: string) => {
      const res = await login(email, password);
      if (res.success && res.user) {
        if (!res.user.is_admin) {
          return {
            success: false,
            error: `Access denied. Signed in as ${res.user.full_name}. Administrator role required.`,
          };
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [login]
  );

  const logoutAdmin = logout;

  const reloadMenu = useCallback(async (silent = false) => {
    if (!silent) setMenuLoading(true);
    setMenuError(null);
    try {
      const data = await fetchMenu();
      setSections(data.sections);
      setCategories(data.categories);
      setProducts(data.products);

      // drop cart lines whose product no longer exists on the backend
      const validIds = new Set(data.products.map((p) => p.id));
      setCart((prev) => {
        const cleaned = prev.filter((i) => validIds.has(i.product_id));
        if (cleaned.length !== prev.length) storageService.saveCart(cleaned);
        return cleaned;
      });
    } catch (e) {
      setMenuError(e instanceof Error ? e.message : 'Could not load the menu');
    } finally {
      setMenuLoading(false);
    }
  }, [currentUser]);

  const loadSiteConfig = useCallback(async () => {
    try {
      setSiteConfig(await fetchSiteConfig());
    } catch (e) {
      console.error('Failed to load site configuration:', e);
    }
  }, []);

  useEffect(() => {
    loadSiteConfig();
  }, [loadSiteConfig]);

  useEffect(() => {
    if (authLoading) return;
    reloadMenu();
  }, [authLoading, reloadMenu]);

  // Sync state helpers
  const refreshCatalog = useCallback(() => {
    reloadMenu();
    loadSiteConfig();
  }, [reloadMenu, loadSiteConfig]);

  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    setLastRealtimeEvent(event);
    applyRealtimeEvent(event, Boolean(currentUser?.is_admin), {
      refreshCatalog: () => { void reloadMenu(true); },
      refreshSiteConfiguration: () => {
        void fetchSiteConfig().then(setSiteConfig).catch((error) => {
          console.error('Failed to refresh site configuration:', error);
        });
      },
      refreshOrders: () => {
        void fetchMyOrders().then(setOrders).catch((error) => {
          console.error('Failed to refresh orders:', error);
        });
      },
      refreshNotifications: () => {
        void fetchAdminNotifications().then(setNotifications).catch((error) => {
          console.error('Failed to refresh notifications:', error);
        });
      },
    });
  }, [currentUser?.is_admin, reloadMenu]);

  useEffect(() => {
    if (authLoading || !currentUser) {
      setRealtimeStatus('disconnected');
      return;
    }

    const manager = new RealtimeManager({
      url: createRealtimeWebSocketUrl(),
      onEvent: handleRealtimeEvent,
      onStatus: setRealtimeStatus,
    });
    manager.connect();
    return () => manager.disconnect();
  }, [authLoading, currentUser?.id, handleRealtimeEvent]);

  // Format money helper
  const formatMoney = useCallback(
    (amount: number) => {
      const sym = siteConfig.currency_symbol || '₦';
      return `${sym}${Number(amount || 0).toLocaleString()}`;
    },
    [siteConfig.currency_symbol]
  );

  // Active items memos
  const activeSections = useMemo(() => sections.filter((s) => s.is_active), [sections]);
  const activeCategories = useMemo(() => categories.filter((c) => c.is_active), [categories]);

  const activeProducts = useMemo(() => {
    const activeCatIds = new Set(activeCategories.map((c) => c.id));
    const activeSecIds = new Set(activeSections.map((s) => s.id));
    return products.filter((p) => {
      if (!p.is_available) return false;
      if (!activeCatIds.has(p.category_id)) return false;
      const cat = categories.find((c) => c.id === p.category_id);
      if (!cat || !activeSecIds.has(cat.section_id)) return false;
      return true;
    });
  }, [products, activeCategories, activeSections, categories]);

  const featuredProducts = useMemo(() => {
    return activeProducts.filter((p) => p.is_featured);
  }, [activeProducts]);

  // Cart derivations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.product_id);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  // Cart operations
  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return { success: false, message: 'Product not found.' };

      const isEligible = activeProducts.some((p) => p.id === productId);
      if (!isEligible) {
        const reason = 'This item is currently unavailable.';
        showToast(reason, 'error');
        return { success: false, message: reason };
      }

      const updatedCart = [...cart];
      const existingIdx = updatedCart.findIndex((i) => i.product_id === productId);

      if (existingIdx >= 0) {
        const newQty = Math.min(99, updatedCart[existingIdx].quantity + quantity);
        updatedCart[existingIdx] = { ...updatedCart[existingIdx], quantity: newQty };
      } else {
        updatedCart.push({ product_id: productId, quantity: Math.min(99, Math.max(1, quantity)) });
      }

      setCart(updatedCart);
      storageService.saveCart(updatedCart);
      showToast(`Added ${product.name} to cart`, 'success');
      return { success: true };
    },
    [cart, products, activeProducts, showToast, currentUser, openAuthModal]
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      const clampedQty = Math.min(99, Math.max(1, Math.floor(quantity)));
      const updated = cart.map((i) =>
        i.product_id === productId ? { ...i, quantity: clampedQty } : i
      );
      setCart(updated);
      storageService.saveCart(updated);
    },
    [cart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      const updated = cart.filter((i) => i.product_id !== productId);
      setCart(updated);
      storageService.saveCart(updated);
      showToast('Item removed from cart', 'info');
    },
    [cart, showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    storageService.clearCart();
    showToast('Cart cleared', 'info');
  }, [showToast]);

  // Order creation
  const createOrder = useCallback(
    async (params: {
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
      order_type: OrderType;
      delivery_address?: string;
      customer_note?: string;
      idempotency_key: string;
    }) => {
      try {
        const { idempotency_key, ...orderParams } = params;
        const order = await createOrderApi({
          ...orderParams,
          items: cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity })),
        }, idempotency_key);
        setCart([]);
        storageService.clearCart();
        setOrders((prev) => [order, ...prev]);
        showToast(`Order ${order.order_number} confirmed!`, 'success');
        return { success: true, order };
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Failed to place order. Please try again.';
        showToast(error, 'error');
        return { success: false, error };
      }
    },
    [cart, showToast, currentUser, openAuthModal]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      try {
        const updated = await updateOrderStatusApi(orderId, status);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        showToast(`Order status updated to ${status}`, 'success');
        return { success: true };
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Status update failed.';
        showToast(error, 'error');
        return { success: false, error };
      }
    },
    [showToast]
  );

  const lookupOrder = useCallback(
    (orderNumber: string, token?: string) => {
      return trackOrderApi(orderNumber, token);
    },
    []
  );

  const retryNotification = useCallback(
    async (logId: string) => {
      try {
        const log = await retryAdminNotification(logId);
        setNotifications((previous) => previous.map((item) => item.id === log.id ? log : item));
        setOrders((previous) => previous.map((order) => order.id === log.order_id
          ? { ...order, whatsapp_status: log.status, whatsapp_message_id: log.provider_message_id }
          : order));
        if (log.status === 'SENT') {
          showToast('WhatsApp notification sent successfully!', 'success');
          return { success: true };
        }
        showToast(log.last_error || 'WhatsApp dispatch failed.', 'error');
        return { success: false, error: log.last_error };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to retry notification.';
        showToast(message, 'error');
        return { success: false, error: message };
      }
    },
    [showToast]
  );

  // Admin Catalog actions
  const saveProduct = useCallback(
    async (product: Product, imageFile?: File | null) => {
      try {
        await saveProductApi(product, imageFile);
        await reloadMenu();
        showToast(`Product "${product.name}" saved.`, 'success');
        return { success: true };
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Unable to save product.';
        showToast(error, 'error');
        return { success: false, error };
      }
    },
    [reloadMenu, showToast]
  );
  const saveCategory = useCallback(
    async (category: Category) => {
      try {
        await saveCategoryApi(category);
        await reloadMenu();
        showToast(`Category "${category.name}" saved.`, 'success');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save category.';
        showToast(message, 'error');
        return { success: false, error: message };
      }
    },
    [reloadMenu, showToast]
  );

  const saveSection = useCallback(
    async (section: Section, imageFile?: File | null) => {
      try {
        await saveSectionApi(section, imageFile);
        await reloadMenu();
        showToast(`Section "${section.name}" saved.`, 'success');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save section.';
        showToast(message, 'error');
        return { success: false, error: message };
      }
    },
    [reloadMenu, showToast]
  );

  const deleteCatalogEntry = useCallback(
    async (deleteRequest: (id: string) => Promise<void>, id: string, label: string) => {
      try {
        await deleteRequest(id);
        await reloadMenu();
        showToast(`${label} deleted.`, 'success');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : `Unable to delete ${label.toLowerCase()}.`;
        showToast(message, 'error');
        return { success: false, error: message };
      }
    },
    [reloadMenu, showToast]
  );

  const deleteProduct = useCallback(
    (id: string, name: string) => deleteCatalogEntry(deleteProductApi, id, `Product "${name}"`),
    [deleteCatalogEntry]
  );

  const deleteCategory = useCallback(
    (id: string, name: string) => deleteCatalogEntry(deleteCategoryApi, id, `Category "${name}"`),
    [deleteCatalogEntry]
  );

  const deleteSection = useCallback(
    (id: string, name: string) => deleteCatalogEntry(deleteSectionApi, id, `Section "${name}"`),
    [deleteCatalogEntry]
  );

  const deleteCompletedOrder = useCallback(
    async (id: string) => {
      try {
        await deleteCompletedOrderApi(id);
        setOrders((previous) => previous.filter((order) => order.id !== id));
        setNotifications((previous) => previous.filter((notification) => notification.order_id !== id));
        showToast('Completed order deleted.', 'success');
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete completed order.';
        showToast(message, 'error');
        return { success: false, error: message };
      }
    },
    [showToast]
  );

  const assignOrderCourier = useCallback(
    async (orderId: string, courierId: string | null) => {
      try {
        const updatedOrder = await assignOrderCourierApi(orderId, courierId);
        setOrders((previous) => previous.map((order) => order.id === orderId ? updatedOrder : order));
        showToast(
          courierId ? `Courier assigned to ${updatedOrder.order_number}.` : `Courier removed from ${updatedOrder.order_number}.`,
          'success',
        );
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to assign courier.';
        showToast(message, 'error');
        return { success: false, error: message };
      }
    },
    [showToast]
  );

  const updateSiteConfig = useCallback(
    async (config: SiteConfiguration, logoFile?: File | null) => {
      try {
        setSiteConfig(await saveSiteConfig(config, logoFile));
        showToast('Restaurant configuration updated.', 'success');
        return { success: true };
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Could not save settings.';
        showToast(error, 'error');
        return { success: false, error };
      }
    },
    [showToast]
  );

  const navigateTo = useCallback((view: ActiveView) => {
    if (!currentUser && requiresAuthentication(view)) {
      setPendingAuthView(view);
      setActiveView({ type: 'home' });
      setIsCartOpen(false);
      openAuthModal('login');
      return;
    }
    if (view.type === 'home') setPendingAuthView(null);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser, openAuthModal]);
  // menu


  return (
    <RestaurantContext.Provider
      value={{
        sections,
        activeSections,
        categories,
        activeCategories,
        products,
        activeProducts,
        featuredProducts,
        siteConfig,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        activeView,
        navigateTo,
        selectedProductModal,
        setSelectedProductModal,
        orders,
        notifications,
        couriers,
        realtimeStatus,
        lastRealtimeEvent,
        createOrder,
        lookupOrder,
        updateOrderStatus,
        retryNotification,
        saveProduct,
        saveCategory,
        saveSection,
        deleteProduct,
        deleteCategory,
        deleteSection,
        deleteCompletedOrder,
        assignOrderCourier,
        updateSiteConfig,
        // Complete User & Role Authentication
        currentUser,
        authLoading,
        authRestoreError,
        retryAuthRestore,
        isAuthenticated,
        isAdmin,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        forgotPassword,
        register,
        updateProfile,
        logout,
        userOrders,
        canUserTrackOrder,
        isOrderOwnedByUser,
        // Admin compatibility
        adminUser,
        isAdminAuthenticated,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        toasts,
        showToast,
        removeToast,
        formatMoney,
        menuLoading,
        menuError,
        reloadMenu,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
};
