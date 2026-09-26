import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Section,
  Category,
  Product,
  CartItem,
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
import { notificationService } from '../services/notificationService';

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from "../api/auth";

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
  createOrder: (params: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    order_type: OrderType;
    delivery_address?: string;
    customer_note?: string;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => { success: boolean; error?: string };
  retryNotification: (logId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Admin catalog actions
  saveProduct: (product: Product) => void;
  saveCategory: (category: Category) => void;
  saveSection: (section: Section) => void;
  updateSiteConfig: (config: SiteConfiguration) => void;
  resetToDefaults: () => void;

  // Complete User & Role Authentication
  currentUser: User | null;
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
  logout: () => void;
  updateProfile: (updates: Partial<User>) => { success: boolean; user?: User; error?: string };
  userOrders: Order[];
  canUserTrackOrder: (order: Order) => boolean;
  isOrderOwnedByUser: (order: Order) => boolean;

  // Admin Authentication (backward-compatible aliases)
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (email: string, password: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;

  // Toast
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Helper
  formatMoney: (amount: number) => string;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<Section[]>(() => storageService.getSections());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [siteConfig, setSiteConfig] = useState<SiteConfiguration>(() => storageService.getSiteConfig());
  const [cart, setCart] = useState<CartItem[]>(() => storageService.getCart());
  const [orders, setOrders] = useState<Order[]>(() => storageService.getOrders());
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => storageService.getNotifications());
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'home' });
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
const [authLoading, setAuthLoading] = useState(true);
useEffect(() => {
  let mounted = true;

  const loadAuthenticatedUser = async () => {
    try {
      const data = await getCurrentUser();

      if (mounted) {
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Failed to restore authentication:", error);

      if (mounted) {
        setCurrentUser(null);
      }
    } finally {
      if (mounted) {
        setAuthLoading(false);
      }
    }
  };

  loadAuthenticatedUser();

  return () => {
    mounted = false;
  };
}, []);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');

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



const register = async (payload: {
  full_name: string;
  email: string;
  phone_number: string;
  delivery_address: string;
  password: string;
}) => {
  try {
    const data = await registerUser(payload);

    setCurrentUser(data.user);

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
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setCurrentUser(null);

    showToast("Signed out successfully.", "info");

    setActiveView((curr) =>
      curr.type === "admin" || curr.type === "my-orders"
        ? { type: "home" }
        : curr
    );
  }
}, [showToast]);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!currentUser) return { success: false, error: 'Not signed in' };
      const res = storageService.updateUserProfile(currentUser.id, updates);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast('Profile updated successfully!', 'success');
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Failed to update profile.' };
    },
    [currentUser, showToast]
  );

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return storageService.getOrdersForUser(currentUser);
  }, [currentUser, orders]);

  const canUserTrackOrder = useCallback(
    (order: Order) => {
      return storageService.canUserTrackOrder(order, currentUser);
    },
    [currentUser]
  );

  const isOrderOwnedByUser = useCallback(
    (order: Order) => {
      return storageService.isOrderOwnedByUser(order, currentUser);
    },
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
    (email: string, password: string) => {
      const res = login(email, password);
      if (res.success && res.user) {
        if (res.user.role !== 'admin') {
          return {
            success: false,
            error: `Access denied. Signed in as ${res.user.name} (${res.user.role}). Administrator role required.`,
          };
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    [login]
  );

  const logoutAdmin = logout;

  // Sync state helpers
  const refreshCatalog = useCallback(() => {
    setSections(storageService.getSections());
    setCategories(storageService.getCategories());
    setProducts(storageService.getProducts());
    setSiteConfig(storageService.getSiteConfig());
    setOrders(storageService.getOrders());
    setNotifications(storageService.getNotifications());
  }, []);

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
      const eligibility = storageService.isProductEligible(productId);
      if (!eligibility.eligible) {
        showToast(eligibility.reason || 'This item cannot be added.', 'error');
        return { success: false, message: eligibility.reason };
      }

      const product = products.find((p) => p.id === productId);
      if (!product) return { success: false, message: 'Product not found.' };

      let updatedCart = [...cart];
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
    [cart, products, showToast]
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
    }) => {
      const idempotencyToken = `tok-${params.customer_phone}-${cart.map((c) => `${c.product_id}:${c.quantity}`).join('-')}`;
      const result = await storageService.createOrder({
        ...params,
        user_id: currentUser?.id,
        cart_items: cart,
        idempotency_token: idempotencyToken,
      });

      if (result.success && result.order) {
        setCart([]);
        setOrders(storageService.getOrders());
        setNotifications(storageService.getNotifications());
        showToast(`Order ${result.order.order_number} confirmed!`, 'success');
        return { success: true, order: result.order };
      } else {
        showToast(result.error || 'Failed to place order. Please try again.', 'error');
        return { success: false, error: result.error };
      }
    },
    [cart, currentUser, showToast]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      const res = storageService.updateOrderStatus(orderId, status);
      if (res.success) {
        setOrders(storageService.getOrders());
        showToast(`Order status updated to ${status}`, 'success');
      } else {
        showToast(res.error || 'Status update failed.', 'error');
      }
      return res;
    },
    [showToast]
  );

  const retryNotification = useCallback(
    async (logId: string) => {
      const logs = storageService.getNotifications();
      const log = logs.find((l) => l.id === logId);
      if (!log) return { success: false, error: 'Notification log not found.' };

      const order = storageService.getOrderByNumber(log.order_number);
      if (!order) return { success: false, error: 'Associated order not found.' };

      const res = await notificationService.retryNotification(log, order, siteConfig);
      storageService.saveNotification(res.log);
      order.whatsapp_status = res.status;
      order.whatsapp_message_id = res.messageId;
      storageService.updateOrder(order);

      setNotifications(storageService.getNotifications());
      setOrders(storageService.getOrders());

      if (res.status === 'SENT') {
        showToast('WhatsApp notification sent successfully!', 'success');
        return { success: true };
      } else {
        showToast(`Retry failed: ${res.error || 'Unknown error'}`, 'error');
        return { success: false, error: res.error };
      }
    },
    [siteConfig, showToast]
  );

  // Admin Catalog actions
  const saveProduct = useCallback(
    (product: Product) => {
      storageService.saveProduct(product);
      refreshCatalog();
      showToast(`Product "${product.name}" saved.`, 'success');
    },
    [refreshCatalog, showToast]
  );

  const saveCategory = useCallback(
    (category: Category) => {
      storageService.saveCategory(category);
      refreshCatalog();
      showToast(`Category "${category.name}" saved.`, 'success');
    },
    [refreshCatalog, showToast]
  );

  const saveSection = useCallback(
    (section: Section) => {
      storageService.saveSection(section);
      refreshCatalog();
      showToast(`Section "${section.name}" saved.`, 'success');
    },
    [refreshCatalog, showToast]
  );

  const updateSiteConfig = useCallback(
    (config: SiteConfiguration) => {
      storageService.saveSiteConfig(config);
      setSiteConfig(config);
      showToast('Restaurant configuration updated.', 'success');
    },
    [showToast]
  );

  const resetToDefaults = useCallback(() => {
    storageService.resetToSeedData();
    refreshCatalog();
    setCart(storageService.getCart());
    showToast('Platform reset to initial seed data.', 'info');
  }, [refreshCatalog, showToast]);

  const navigateTo = useCallback((view: ActiveView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
        createOrder,
        updateOrderStatus,
        retryNotification,
        saveProduct,
        saveCategory,
        saveSection,
        updateSiteConfig,
        resetToDefaults,
        // Complete User & Role Authentication
        currentUser,
        isAuthenticated,
        isAdmin,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateProfile,
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
