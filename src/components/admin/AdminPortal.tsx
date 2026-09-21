import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { AdminLoginForm } from './AdminLoginForm';
import {
  Order,
  Product,
  Category,
  Section,
  OrderStatus,
  OrderType,
  SiteConfiguration,
} from '../../types';
import {
  ShieldAlert,
  ShoppingBag,
  ListOrdered,
  MessageSquare,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  Clock,
  Phone,
  RotateCcw,
  Check,
  AlertTriangle,
  LogOut,
  UserCheck,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminUser,
    logoutAdmin,
    orders,
    notifications,
    sections,
    categories,
    products,
    siteConfig,
    formatMoney,
    updateOrderStatus,
    retryNotification,
    saveProduct,
    saveCategory,
    saveSection,
    updateSiteConfig,
    resetToDefaults,
    navigateTo,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'whatsapp' | 'settings'>('orders');

  // --- ORDERS TAB STATE ---
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [whatsAppFilter, setWhatsAppFilter] = useState<string>('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  // --- CATALOG TAB STATE ---
  const [catalogSubTab, setCatalogSubTab] = useState<'products' | 'categories' | 'sections'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [productSectionFilter, setProductSectionFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<Section> | null>(null);

  // --- SETTINGS FORM STATE ---
  const [configForm, setConfigForm] = useState<SiteConfiguration>(siteConfig);

  // Synchronize config form when siteConfig changes
  React.useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  // --- KPIS ---
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING').length;
  }, [orders]);

  const whatsAppSuccessRate = useMemo(() => {
    if (notifications.length === 0) return 100;
    const sent = notifications.filter((n) => n.status === 'SENT').length;
    return Math.round((sent / notifications.length) * 100);
  }, [notifications]);

  // --- FILTERED ORDERS ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchNum = order.order_number.toLowerCase().includes(q);
        const matchName = order.customer_name.toLowerCase().includes(q);
        const matchPhone = order.customer_phone.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchPhone) return false;
      }

      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (typeFilter !== 'all' && order.order_type !== typeFilter) return false;
      if (whatsAppFilter !== 'all' && order.whatsapp_status !== whatsAppFilter) return false;

      return true;
    });
  }, [orders, orderSearch, statusFilter, typeFilter, whatsAppFilter]);

  // --- FILTERED PRODUCTS ---
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        if (!prod.name.toLowerCase().includes(q) && !prod.description.toLowerCase().includes(q)) {
          return false;
        }
      }

      const cat = categories.find((c) => c.id === prod.category_id);
      if (productSectionFilter !== 'all') {
        if (!cat || cat.section_id !== productSectionFilter) return false;
      }

      if (productCategoryFilter !== 'all' && prod.category_id !== productCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [products, productSearch, productSectionFilter, productCategoryFilter, categories]);

  // Handle Save Product
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.category_id) return;

    const slug =
      editingProduct.slug ||
      editingProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const productToSave: Product = {
      id: editingProduct.id || `prod-${Date.now()}`,
      name: editingProduct.name,
      slug,
      category_id: editingProduct.category_id,
      description: editingProduct.description || '',
      price: Number(editingProduct.price) || 1000,
      image:
        editingProduct.image ||
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80',
      is_available: editingProduct.is_available ?? true,
      is_featured: editingProduct.is_featured ?? false,
      display_order: Number(editingProduct.display_order) || 0,
      created_at: editingProduct.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveProduct(productToSave);
    setEditingProduct(null);
  };

  // If not authenticated, render the dedicated admin login page
  if (!isAdminAuthenticated) {
    return <AdminLoginForm mode="page" />;
  }

  return (
    <div id="admin-portal" className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-white">
                  Restaurant Administration
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <UserCheck className="w-3 h-3" />
                  <span>Authenticated</span>
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Logged in as <strong className="text-amber-400">{adminUser?.name || 'Administrator'}</strong> ({adminUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="admin-btn-logout"
              onClick={logoutAdmin}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-800 text-stone-300 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <button
              id="admin-btn-back-to-store"
              onClick={() => navigateTo({ type: 'home' })}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
            >
              Exit to Storefront
            </button>
            <button
              id="admin-btn-reset-seed"
              onClick={() => {
                if (window.confirm('Reset catalog and settings to initial seed data?')) {
                  resetToDefaults();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Reset all database tables to initial seed records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-md">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
              Total Orders
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-white">{orders.length}</span>
              <span className="text-xs text-amber-400 font-medium">Authoritative DB</span>
            </div>
          </div>

          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-md">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
              Pending Fulfillment
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-amber-400">{pendingCount}</span>
              <span className="text-xs text-stone-400">Needs Kitchen Action</span>
            </div>
          </div>

          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-md">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
              Fulfilled Revenue
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-extrabold text-emerald-400">
                {formatMoney(totalRevenue)}
              </span>
              <span className="text-xs text-stone-400">Snapshotted</span>
            </div>
          </div>

          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-md">
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wider block">
              WhatsApp Delivery Rate
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-400">
                {whatsAppSuccessRate}%
              </span>
              <span className="text-xs text-stone-400">{notifications.length} Logs</span>
            </div>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-800 overflow-x-auto pb-1">
          <button
            id="tab-admin-orders"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Orders Management ({orders.length})</span>
          </button>

          <button
            id="tab-admin-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Menu Catalog ({products.length} Products)</span>
          </button>

          <button
            id="tab-admin-whatsapp"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Dispatch Logs</span>
          </button>

          <button
            id="tab-admin-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site & Delivery Settings</span>
          </button>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-admin-order-search"
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order #, customer, phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <select
                  id="select-admin-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="READY">READY</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <select
                  id="select-admin-type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="all">All Fulfillment Types</option>
                  <option value="DELIVERY">DELIVERY</option>
                  <option value="PICKUP">PICKUP</option>
                </select>
              </div>

              <div>
                <select
                  id="select-admin-whatsapp-filter"
                  value={whatsAppFilter}
                  onChange={(e) => setWhatsAppFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="all">All WhatsApp Statuses</option>
                  <option value="SENT">SENT</option>
                  <option value="FAILED">FAILED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table id="table-admin-orders" className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-900/90 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Customer & Contact</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Order Status</th>
                      <th className="py-3.5 px-4">WhatsApp Status</th>
                      <th className="py-3.5 px-4">Created</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-stone-500">
                          No orders matching current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                            {order.order_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{order.customer_name}</span>
                            <span className="text-stone-400 text-[11px]">{order.customer_phone}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.order_type === 'DELIVERY'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {order.order_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {formatMoney(order.total)}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              id={`select-order-status-${order.id}`}
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 border focus:outline-none ${
                                order.status === 'COMPLETED'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                                  : 'bg-amber-950 text-amber-400 border-amber-800'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="READY">READY</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.whatsapp_status === 'SENT'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : order.whatsapp_status === 'FAILED'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {order.whatsapp_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              id={`btn-view-order-${order.id}`}
                              onClick={() => setSelectedOrderModal(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-200 text-xs font-semibold transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG MANAGEMENT */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Catalog Subtabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setCatalogSubTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    catalogSubTab === 'products'
                      ? 'bg-stone-800 text-amber-400 border border-stone-700'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setCatalogSubTab('categories')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    catalogSubTab === 'categories'
                      ? 'bg-stone-800 text-amber-400 border border-stone-700'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Categories ({categories.length})
                </button>
                <button
                  onClick={() => setCatalogSubTab('sections')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    catalogSubTab === 'sections'
                      ? 'bg-stone-800 text-amber-400 border border-stone-700'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Sections ({sections.length})
                </button>
              </div>

              {catalogSubTab === 'products' && (
                <button
                  id="btn-admin-add-product"
                  onClick={() =>
                    setEditingProduct({
                      name: '',
                      category_id: categories[0]?.id || '',
                      price: 3000,
                      is_available: true,
                      is_featured: false,
                    })
                  }
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>
              )}
            </div>

            {/* Products Table */}
            {catalogSubTab === 'products' && (
              <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900 text-stone-400 uppercase tracking-wider text-[11px] border-b border-stone-800">
                      <tr>
                        <th className="py-3.5 px-4">Item</th>
                        <th className="py-3.5 px-4">Category / Section</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Available</th>
                        <th className="py-3.5 px-4">Featured</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850">
                      {filteredProducts.map((prod) => {
                        const cat = categories.find((c) => c.id === prod.category_id);
                        const sec = cat ? sections.find((s) => s.id === cat.section_id) : null;

                        return (
                          <tr key={prod.id} className="hover:bg-stone-900/40">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover bg-stone-900"
                              />
                              <div>
                                <span className="font-bold text-white block">{prod.name}</span>
                                <span className="text-stone-500 text-[11px] line-clamp-1 max-w-xs">
                                  {prod.description}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-amber-400 font-semibold">{cat?.name}</span>
                              <span className="text-stone-500 block text-[10px]">{sec?.name}</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-white">
                              {formatMoney(prod.price)}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() =>
                                  saveProduct({ ...prod, is_available: !prod.is_available })
                                }
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                  prod.is_available
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                                }`}
                              >
                                {prod.is_available ? 'Available' : 'Disabled'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() =>
                                  saveProduct({ ...prod, is_featured: !prod.is_featured })
                                }
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                  prod.is_featured
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-stone-850 text-stone-400'
                                }`}
                              >
                                {prod.is_featured ? 'Featured' : 'Standard'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories List */}
            {catalogSubTab === 'categories' && (
              <div className="bg-stone-950 rounded-2xl border border-stone-800 p-6 space-y-4">
                <h3 className="font-serif-display text-lg font-bold text-white">
                  Menu Categories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => {
                    const sec = sections.find((s) => s.id === cat.section_id);
                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-white block">{cat.name}</span>
                          <span className="text-xs text-amber-400">{sec?.name}</span>
                        </div>
                        <button
                          onClick={() => saveCategory({ ...cat, is_active: !cat.is_active })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cat.is_active ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                          }`}
                        >
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sections List */}
            {catalogSubTab === 'sections' && (
              <div className="bg-stone-950 rounded-2xl border border-stone-800 p-6 space-y-4">
                <h3 className="font-serif-display text-lg font-bold text-white">
                  Restaurant Kitchen Sections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden"
                    >
                      <img src={sec.image} alt={sec.name} className="h-32 w-full object-cover" />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white">{sec.name}</h4>
                          <button
                            onClick={() => saveSection({ ...sec, is_active: !sec.is_active })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              sec.is_active
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {sec.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                        <p className="text-xs text-stone-400 line-clamp-2">{sec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WHATSAPP LOGS */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-white">
                    WhatsApp Order Notifications Log
                  </h3>
                  <p className="text-xs text-stone-400">
                    System records all notifications dispatched to {siteConfig.whatsapp_number}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-sm">
                    No WhatsApp notifications logged yet.
                  </div>
                ) : (
                  notifications.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            {log.order_number}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'SENT'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-xs text-stone-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>

                        {log.status === 'FAILED' && (
                          <button
                            onClick={() => retryNotification(log.id)}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Dispatch</span>
                          </button>
                        )}
                      </div>

                      {log.last_error && (
                        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-xs text-rose-300 font-mono">
                          Error: {log.last_error} (Attempt {log.attempts})
                        </div>
                      )}

                      <div className="bg-stone-950 p-3 rounded-lg border border-stone-850 font-mono text-xs text-stone-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {log.message_text}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-stone-950 p-6 sm:p-10 rounded-2xl border border-stone-800 space-y-6 max-w-3xl">
            <div>
              <h3 className="font-serif-display text-xl font-bold text-white">
                Restaurant & Platform Configuration
              </h3>
              <p className="text-xs text-stone-400">
                Update restaurant profile, contact channels, and delivery fee.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSiteConfig(configForm);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={configForm.restaurant_name}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, restaurant_name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    WhatsApp Number (for order dispatch)
                  </label>
                  <input
                    type="text"
                    value={configForm.whatsapp_number}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, whatsapp_number: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={configForm.phone}
                    onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Default Delivery Fee (₦)
                  </label>
                  <input
                    type="number"
                    value={configForm.default_delivery_fee}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        default_delivery_fee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={configForm.opening_hours}
                  onChange={(e) => setConfigForm({ ...configForm, opening_hours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Edit/Create Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-800 space-y-5">
            <h3 className="font-serif-display text-xl font-bold text-white">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={editingProduct.category_id || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={editingProduct.image || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, image: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-300">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_available ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_available: e.target.checked })
                    }
                  />
                  <span>Is Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-300">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_featured: e.target.checked })
                    }
                  />
                  <span>Is Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Detail Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold block">
                  {selectedOrderModal.order_number}
                </span>
                <h3 className="font-serif-display text-xl font-bold text-white">
                  Order Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-400">Customer:</span>
                <span className="font-bold text-white">{selectedOrderModal.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Phone:</span>
                <span>{selectedOrderModal.customer_phone}</span>
              </div>
              {selectedOrderModal.customer_email && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Email:</span>
                  <span>{selectedOrderModal.customer_email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-400">Fulfillment:</span>
                <span className="font-bold uppercase text-amber-400">
                  {selectedOrderModal.order_type}
                </span>
              </div>
              {selectedOrderModal.delivery_address && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Delivery Address:</span>
                  <span className="text-right max-w-xs">{selectedOrderModal.delivery_address}</span>
                </div>
              )}
              {selectedOrderModal.customer_note && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Kitchen Note:</span>
                  <span className="text-right italic">{selectedOrderModal.customer_note}</span>
                </div>
              )}
            </div>

            {/* Snapshotted Items */}
            <div className="border-t border-stone-800 pt-3 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Snapshotted Items
              </h4>
              <div className="divide-y divide-stone-850">
                {selectedOrderModal.items.map((i) => (
                  <div key={i.id} className="py-2 flex justify-between text-xs">
                    <span>
                      {i.quantity} × {i.product_name}
                    </span>
                    <span className="font-mono">{formatMoney(i.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-800 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Total Due</span>
                <span className="text-amber-400">{formatMoney(selectedOrderModal.total)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-200 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
