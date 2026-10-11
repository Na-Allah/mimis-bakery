import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { AdminLoginForm } from './AdminLoginForm';
import {
  Order,
  Product,
  Category,
  Section,
  OrderStatus,
  SiteConfiguration,
} from '../../types';
import {
  ShieldAlert,
  ShoppingBag,
  ListOrdered,
  MessageSquare,
  Settings,
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

export const AdminPortal: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminUser,
    logoutAdmin,
    orders,
    notifications,
    couriers,
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
    deleteProduct,
    deleteCategory,
    deleteSection,
    deleteCompletedOrder,
    assignOrderCourier,
    updateSiteConfig,
    navigateTo,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'whatsapp' | 'settings'>('orders');

  // --- ORDERS TAB STATE ---
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [whatsAppFilter, setWhatsAppFilter] = useState<string>('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);
  const [assigningCourierOrderId, setAssigningCourierOrderId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedOrderModal) return;
    const currentOrder = orders.find((order) => order.id === selectedOrderModal.id);
    setSelectedOrderModal(currentOrder ?? null);
  }, [orders, selectedOrderModal?.id]);

  // --- CATALOG TAB STATE ---
  const [catalogSubTab, setCatalogSubTab] = useState<'products' | 'categories' | 'sections'>('products');
  const [productSearch, setProductSearch] = useState('');
  const [productSectionFilter, setProductSectionFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<File | null>(null);
  const [selectedProductImagePreview, setSelectedProductImagePreview] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<Section> | null>(null);
  const [selectedSectionImage, setSelectedSectionImage] = useState<File | null>(null);
  const [catalogFormError, setCatalogFormError] = useState('');
  const [isSavingCatalogItem, setIsSavingCatalogItem] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configLogo, setConfigLogo] = useState<File | null>(null);
  const [configFormError, setConfigFormError] = useState('');
  const [retryingNotificationId, setRetryingNotificationId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedProductImage) {
      setSelectedProductImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedProductImage);
    setSelectedProductImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedProductImage]);

  // --- SETTINGS FORM STATE ---
  const [configForm, setConfigForm] = useState<SiteConfiguration>(siteConfig);
  const [isConfigDirty, setIsConfigDirty] = useState(false);
  const [configLogoPreview, setConfigLogoPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isConfigDirty) setConfigForm(siteConfig);
  }, [siteConfig, isConfigDirty]);

  const updateConfigForm = (changes: Partial<SiteConfiguration>) => {
    setIsConfigDirty(true);
    setConfigForm((current) => ({ ...current, ...changes }));
  };

  React.useEffect(() => {
    if (!configLogo) {
      setConfigLogoPreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(configLogo);
    setConfigLogoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [configLogo]);

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

  const makeSlug = (value: string) => value.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigFormError('');
    setIsSavingConfig(true);
    try {
      const result = await updateSiteConfig(configForm, configLogo);
      if (result.success) {
        setConfigLogo(null);
        setIsConfigDirty(false);
      }
      else setConfigFormError(result.error || 'Unable to save settings.');
    } catch (error) {
      setConfigFormError(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      setIsSavingConfig(false);
    }
  };

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
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.category_id) return;
    setProductFormError('');

    const slug =
      editingProduct.slug ||
      editingProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const productToSave: Product = {
      id: editingProduct.id || '',
      name: editingProduct.name,
      slug,
      category_id: editingProduct.category_id,
      description: editingProduct.description || '',
      price: Number(editingProduct.price) || 1000,
      image: editingProduct.image || '',
      is_available: editingProduct.is_available ?? true,
      is_featured: editingProduct.is_featured ?? false,
      display_order: Number(editingProduct.display_order) || 0,
      created_at: editingProduct.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setIsSavingProduct(true);
    const result = await saveProduct(productToSave, selectedProductImage);
    setIsSavingProduct(false);
    if (!result.success) {
      setProductFormError(result.error || 'Unable to save product.');
      return;
    }

    setEditingProduct(null);
    setSelectedProductImage(null);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim() || !editingCategory.section_id) return;
    setCatalogFormError('');
    setIsSavingCatalogItem(true);
    const now = new Date().toISOString();
    const result = await saveCategory({
      id: editingCategory.id || '',
      section_id: editingCategory.section_id,
      name: editingCategory.name.trim(),
      slug: editingCategory.slug?.trim() || makeSlug(editingCategory.name),
      description: editingCategory.description || '',
      is_active: editingCategory.is_active ?? true,
      display_order: Number(editingCategory.display_order) || 0,
      created_at: editingCategory.created_at || now,
      updated_at: now,
    });
    setIsSavingCatalogItem(false);
    if (!result.success) {
      setCatalogFormError(result.error || 'Unable to save category.');
      return;
    }
    setEditingCategory(null);
  };

  const handleSaveSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection?.name?.trim()) return;
    setCatalogFormError('');
    setIsSavingCatalogItem(true);
    const now = new Date().toISOString();
    const section: Section = {
      id: editingSection.id || '',
      name: editingSection.name.trim(),
      slug: editingSection.slug?.trim() || makeSlug(editingSection.name),
      description: editingSection.description || '',
      image: editingSection.image || '',
      is_active: editingSection.is_active ?? true,
      display_order: Number(editingSection.display_order) || 0,
      created_at: editingSection.created_at || now,
      updated_at: now,
    };
    const result = await saveSection(section, selectedSectionImage);
    setIsSavingCatalogItem(false);
    if (!result.success) {
      setCatalogFormError(result.error || 'Unable to save section.');
      return;
    }
    setEditingSection(null);
    setSelectedSectionImage(null);
  };

  const handleRetryNotification = async (id: string) => {
    setRetryingNotificationId(id);
    await retryNotification(id);
    setRetryingNotificationId(null);
  };

  // If not authenticated, render the dedicated admin login page
  if (!isAdminAuthenticated) {
    return <AdminLoginForm mode="page" />;
  }

  return (
    <div id="admin-portal" className="min-h-screen bg-[#FFF8ED]/40 text-[#111827] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5E7EB] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8ED] border border-[#E5E7EB] text-[#C8102E] flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                  Restaurant Administration
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck className="w-3 h-3" />
                  <span>Authenticated</span>
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                Logged in as <strong className="text-[#C8102E]">{adminUser?.full_name || 'Administrator'}</strong> ({adminUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              id="admin-btn-logout"
              onClick={logoutAdmin}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 hover:text-[#EF4444] text-[#475569] border border-[#E5E7EB] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <button
              id="admin-btn-back-to-store"
              onClick={() => navigateTo({ type: 'home' })}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#FFF8ED] text-[#111827] text-xs font-semibold border border-[#E5E7EB] transition-colors cursor-pointer min-h-[44px]"
            >
              Exit to Storefront
            </button>
          </div>
        </div>

        {/* Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <span className="text-xs text-[#475569] font-semibold uppercase tracking-wider block">
              Total Orders
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-[#111827]">{orders.length}</span>
              <span className="text-xs text-[#C8102E] font-semibold">Authoritative DB</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <span className="text-xs text-[#475569] font-semibold uppercase tracking-wider block">
              Pending Fulfillment
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-[#C8102E]">{pendingCount}</span>
              <span className="text-xs text-[#475569]">Needs Kitchen Action</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <span className="text-xs text-[#475569] font-semibold uppercase tracking-wider block">
              Fulfilled Revenue
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-extrabold text-emerald-700">
                {formatMoney(totalRevenue)}
              </span>
              <span className="text-xs text-[#475569]">Snapshotted</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <span className="text-xs text-[#475569] font-semibold uppercase tracking-wider block">
              WhatsApp Delivery Rate
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-700">
                {whatsAppSuccessRate}%
              </span>
              <span className="text-xs text-[#475569]">{notifications.length} Logs</span>
            </div>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] overflow-x-auto pb-1">
          <button
            id="tab-admin-orders"
            onClick={() => setActiveTab('orders')}
            className={`px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827] hover:bg-[#FFF8ED]'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Orders Management ({orders.length})</span>
          </button>

          <button
            id="tab-admin-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827] hover:bg-[#FFF8ED]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Menu Catalog ({products.length})</span>
          </button>

          <button
            id="tab-admin-whatsapp"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827] hover:bg-[#FFF8ED]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Dispatch Logs</span>
          </button>

          <button
            id="tab-admin-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827] hover:bg-[#FFF8ED]'
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
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-admin-order-search"
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order #, customer, phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-xs text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] min-h-[40px]"
                />
              </div>

              <div>
                <select
                  id="select-admin-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-xs text-[#111827] focus:bg-white focus:outline-none min-h-[40px]"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="READY">READY</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <select
                  id="select-admin-type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-xs text-[#111827] focus:bg-white focus:outline-none min-h-[40px]"
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
                  className="w-full py-2 px-3 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-xs text-[#111827] focus:bg-white focus:outline-none min-h-[40px]"
                >
                  <option value="all">All WhatsApp Statuses</option>
                  <option value="SENT">SENT</option>
                  <option value="FAILED">FAILED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table id="table-admin-orders" className="w-full text-left text-xs text-[#111827]">
                  <thead className="bg-[#FFF8ED]/60 text-[#475569] uppercase tracking-wider text-[11px] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Order #</th>
                      <th className="py-3.5 px-4 font-semibold">Customer & Contact</th>
                      <th className="py-3.5 px-4 font-semibold">Type</th>
                      <th className="py-3.5 px-4 font-semibold">Total</th>
                      <th className="py-3.5 px-4 font-semibold">Order Status</th>
                      <th className="py-3.5 px-4 font-semibold">Courier</th>
                      <th className="py-3.5 px-4 font-semibold">WhatsApp Status</th>
                      <th className="py-3.5 px-4 font-semibold">Created</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-[#475569]">
                          No orders matching current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#FFF8ED]/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#C8102E]">
                            {order.order_number}
                          </td>
                          <td className="py-3.5 px-4">
                            {order.order_type === 'DELIVERY' ? (
                              <select
                                aria-label={`Assign courier for ${order.order_number}`}
                                value={order.courier_id || ''}
                                disabled={
                                  assigningCourierOrderId === order.id
                                  || order.status === 'COMPLETED'
                                  || order.status === 'CANCELLED'
                                }
                                onChange={(event) => {
                                  const courierId = event.target.value || null;
                                  setAssigningCourierOrderId(order.id);
                                  void assignOrderCourier(order.id, courierId).finally(() => {
                                    setAssigningCourierOrderId(null);
                                  });
                                }}
                                className="w-40 max-w-full rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-[11px] text-[#111827] disabled:bg-stone-100"
                              >
                                <option value="">{couriers.length ? 'Unassigned' : 'No active couriers'}</option>
                                {order.courier_id && !couriers.some((courier) => courier.id === order.courier_id) && (
                                  <option value={order.courier_id}>{order.courier_name || 'Inactive courier'}</option>
                                )}
                                {couriers.map((courier) => (
                                  <option key={courier.id} value={courier.id}>
                                    {courier.full_name} · {courier.phone_number}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[11px] text-[#475569]">Pickup</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#111827] block">{order.customer_name}</span>
                            <span className="text-[#475569] text-[11px]">{order.customer_phone}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.order_type === 'DELIVERY'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-[#FFF8ED] text-[#475569] border border-[#E5E7EB]'
                              }`}
                            >
                              {order.order_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#111827]">
                            {formatMoney(order.total)}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              id={`select-order-status-${order.id}`}
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                                order.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="READY">READY</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.whatsapp_status === 'SENT'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : order.whatsapp_status === 'FAILED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {order.whatsapp_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#475569] text-[11px]">
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                id={`btn-view-order-${order.id}`}
                                onClick={() => setSelectedOrderModal(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#FFF8ED] hover:bg-[#FFF8ED]/80 text-[#111827] border border-[#E5E7EB] text-xs font-semibold transition-colors cursor-pointer min-h-[36px]"
                              >Inspect</button>
                              {order.status === 'COMPLETED' && (
                                <button
                                  type="button"
                                  aria-label={`Delete completed order ${order.order_number}`}
                                  title="Delete completed order"
                                  onClick={() => {
                                    if (window.confirm(`Permanently delete completed order ${order.order_number} and its notification logs?`)) {
                                      void deleteCompletedOrder(order.id);
                                    }
                                  }}
                                  className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                                ><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setCatalogSubTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer min-h-[40px] ${
                    catalogSubTab === 'products'
                      ? 'bg-[#C8102E] text-white shadow-xs'
                      : 'bg-white text-[#475569] hover:text-[#111827] border border-[#E5E7EB]'
                  }`}
                >
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setCatalogSubTab('categories')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer min-h-[40px] ${
                    catalogSubTab === 'categories'
                      ? 'bg-[#C8102E] text-white shadow-xs'
                      : 'bg-white text-[#475569] hover:text-[#111827] border border-[#E5E7EB]'
                  }`}
                >
                  Categories ({categories.length})
                </button>
                <button
                  onClick={() => setCatalogSubTab('sections')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer min-h-[40px] ${
                    catalogSubTab === 'sections'
                      ? 'bg-[#C8102E] text-white shadow-xs'
                      : 'bg-white text-[#475569] hover:text-[#111827] border border-[#E5E7EB]'
                  }`}
                >
                  Sections ({sections.length})
                </button>
              </div>

              {catalogSubTab === 'products' && (
                <button
                  id="btn-admin-add-product"
                  onClick={() => {
                    setSelectedProductImage(null);
                    setProductFormError('');
                    setEditingProduct({
                      name: '',
                      category_id: categories[0]?.id || '',
                      price: 3000,
                      is_available: true,
                      is_featured: false,
                    });
                  }}
                  className="flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>
              )}
              {catalogSubTab === 'categories' && (
                <button
                  type="button"
                  onClick={() => {
                    setCatalogFormError('');
                    setEditingCategory({ name: '', section_id: sections[0]?.id || '', is_active: true });
                  }}
                  className="flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Category</span>
                </button>
              )}
              {catalogSubTab === 'sections' && (
                <button
                  type="button"
                  onClick={() => {
                    setCatalogFormError('');
                    setSelectedSectionImage(null);
                    setEditingSection({ name: '', is_active: true });
                  }}
                  className="flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Section</span>
                </button>
              )}
            </div>

            {/* Products Table */}
            {catalogSubTab === 'products' && (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  aria-label="Search products"
                  placeholder="Search product name or description"
                  className="sm:col-span-1 w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs min-h-[40px]"
                />
                <select
                  value={productSectionFilter}
                  onChange={(event) => {
                    setProductSectionFilter(event.target.value);
                    setProductCategoryFilter('all');
                  }}
                  aria-label="Filter products by section"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs min-h-[40px]"
                >
                  <option value="all">All Sections</option>
                  {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
                </select>
                <select
                  value={productCategoryFilter}
                  onChange={(event) => setProductCategoryFilter(event.target.value)}
                  aria-label="Filter products by category"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs min-h-[40px]"
                >
                  <option value="all">All Categories</option>
                  {categories.filter((category) => productSectionFilter === 'all' || category.section_id === productSectionFilter)
                    .map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#111827]">
                    <thead className="bg-[#FFF8ED]/60 text-[#475569] uppercase tracking-wider text-[11px] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Item</th>
                        <th className="py-3.5 px-4 font-semibold">Category / Section</th>
                        <th className="py-3.5 px-4 font-semibold">Price</th>
                        <th className="py-3.5 px-4 font-semibold">Available</th>
                        <th className="py-3.5 px-4 font-semibold">Featured</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan={6} className="py-8 text-center text-[#475569]">No products match these filters.</td></tr>
                      ) : filteredProducts.map((prod) => {
                        const cat = categories.find((c) => c.id === prod.category_id);
                        const sec = cat ? sections.find((s) => s.id === cat.section_id) : null;

                        return (
                          <tr key={prod.id} className="hover:bg-[#FFF8ED]/30">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={getMediaUrl(prod.image)}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-[#E5E7EB]"
                              />
                              <div>
                                <span className="font-bold text-[#111827] block">{prod.name}</span>
                                <span className="text-[#475569] text-[11px] line-clamp-1 max-w-xs">
                                  {prod.description}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[#C8102E] font-semibold">{cat?.name}</span>
                              <span className="text-[#475569] block text-[10px]">{sec?.name}</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-[#111827]">
                              {formatMoney(prod.price)}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() =>
                                  saveProduct({ ...prod, is_available: !prod.is_available })
                                }
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase cursor-pointer ${
                                  prod.is_available
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
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
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase cursor-pointer ${
                                  prod.is_featured
                                    ? 'bg-[#FFF8ED] text-[#C8102E] border border-[#E5E7EB]'
                                    : 'bg-stone-100 text-[#475569]'
                                }`}
                              >
                                {prod.is_featured ? 'Featured' : 'Standard'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProductImage(null);
                                    setProductFormError('');
                                    setEditingProduct(prod);
                                  }}
                                  className="p-2 rounded-lg bg-[#FFF8ED] hover:bg-[#FFF8ED]/80 text-[#111827] border border-[#E5E7EB] transition-colors cursor-pointer"
                                  title="Edit Product"
                                  aria-label={`Edit ${prod.name}`}
                                ><Edit2 className="w-3.5 h-3.5" /></button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Permanently delete ${prod.name}? Historical orders will keep their item snapshots.`)) {
                                      void deleteProduct(prod.id, prod.name);
                                    }
                                  }}
                                  className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                                  title="Delete Product"
                                  aria-label={`Delete ${prod.name}`}
                                ><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
            )}

            {/* Categories List */}
            {catalogSubTab === 'categories' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
                <h3 className="text-lg font-bold text-[#111827]">Menu Categories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => {
                    const sec = sections.find((s) => s.id === cat.section_id);
                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FFF8ED]/30 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#111827] block">{cat.name}</span>
                          <span className="text-xs text-[#C8102E]">{sec?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCatalogFormError('');
                              setEditingCategory(cat);
                            }}
                            aria-label={`Edit ${cat.name}`}
                            className="p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#475569] hover:text-[#C8102E]"
                          ><Edit2 className="w-3.5 h-3.5" /></button>
                          <button
                            type="button"
                            onClick={() => void saveCategory({ ...cat, is_active: !cat.is_active })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                              cat.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}
                          >{cat.is_active ? 'Active' : 'Inactive'}</button>
                          <button
                            type="button"
                            onClick={() => {
                              const productCount = products.filter((product) => product.category_id === cat.id).length;
                              const detail = productCount ? ` This will also delete ${productCount} product(s); historical order items will be retained.` : '';
                              if (window.confirm(`Permanently delete category ${cat.name}?${detail}`)) {
                                void deleteCategory(cat.id, cat.name);
                              }
                            }}
                            aria-label={`Delete ${cat.name}`}
                            title="Delete Category"
                            className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sections List */}
            {catalogSubTab === 'sections' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
                <h3 className="text-lg font-bold text-[#111827]">Restaurant Kitchen Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-xs"
                    >
                      <img
                        src={getMediaUrl(sec.image)}
                        alt={sec.name}
                        referrerPolicy="no-referrer"
                        className="h-32 w-full object-cover"
                      />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#111827]">{sec.name}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCatalogFormError('');
                                setSelectedSectionImage(null);
                                setEditingSection(sec);
                              }}
                              aria-label={`Edit ${sec.name}`}
                              className="p-2 rounded-lg border border-[#E5E7EB] bg-white text-[#475569] hover:text-[#C8102E]"
                            ><Edit2 className="w-3.5 h-3.5" /></button>
                            <button
                              type="button"
                              onClick={() => void saveSection({ ...sec, is_active: !sec.is_active })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                                sec.is_active
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >{sec.is_active ? 'Active' : 'Inactive'}</button>
                            <button
                              type="button"
                              onClick={() => {
                                const categoryCount = categories.filter((category) => category.section_id === sec.id).length;
                                const productCount = products.filter((product) => categories.some((category) => category.id === product.category_id && category.section_id === sec.id)).length;
                                const detail = categoryCount || productCount ? ` This will also delete ${categoryCount} categor(ies) and ${productCount} product(s); historical order items will be retained.` : '';
                                if (window.confirm(`Permanently delete section ${sec.name}?${detail}`)) {
                                  void deleteSection(sec.id, sec.name);
                                }
                              }}
                              aria-label={`Delete ${sec.name}`}
                              title="Delete Section"
                              className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                            ><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <p className="text-xs text-[#475569] line-clamp-2">{sec.description}</p>
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
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    WhatsApp Order Notifications Log
                  </h3>
                  <p className="text-xs text-[#475569]">
                    System records all notifications dispatched to {siteConfig.whatsapp_number}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-[#475569] text-sm">
                    No WhatsApp notifications logged yet.
                  </div>
                ) : (
                  notifications.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-[#E5E7EB] bg-[#FFF8ED]/30 space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#C8102E] text-sm">
                            {log.order_number}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'SENT'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status === 'FAILED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-xs text-[#475569]">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>

                        {log.status !== 'SENT' && (
                          <button
                            type="button"
                            disabled={retryingNotificationId === log.id}
                            onClick={() => void handleRetryNotification(log.id)}
                            className="px-3 py-1 rounded-lg bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${retryingNotificationId === log.id ? 'animate-spin' : ''}`} />
                            <span>{retryingNotificationId === log.id ? 'Dispatching...' : log.status === 'FAILED' ? 'Retry Dispatch' : 'Dispatch Now'}</span>
                          </button>
                        )}
                      </div>

                      {log.last_error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-mono">
                          Error: {log.last_error} (Attempt {log.attempts})
                        </div>
                      )}

                      <div className="bg-white p-3 rounded-lg border border-[#E5E7EB] font-mono text-xs text-[#111827] whitespace-pre-wrap max-h-36 overflow-y-auto">
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
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E5E7EB] space-y-6 max-w-3xl shadow-xs">
            <div>
              <h3 className="text-xl font-extrabold text-[#111827]">
                Restaurant & Platform Configuration
              </h3>
              <p className="text-xs text-[#475569]">
                Update restaurant profile, contact channels, and delivery fee.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={configForm.restaurant_name}
                    onChange={(e) =>
                      updateConfigForm({ restaurant_name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                    WhatsApp Number (for order dispatch)
                  </label>
                  <input
                    type="text"
                    value={configForm.whatsapp_number}
                    onChange={(e) =>
                      updateConfigForm({ whatsapp_number: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={configForm.tagline}
                    onChange={(e) => updateConfigForm({ tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Email</label>
                  <input
                    type="email"
                    value={configForm.email}
                    onChange={(e) => updateConfigForm({ email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={configForm.phone}
                    onChange={(e) => updateConfigForm({ phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                    Default Delivery Fee (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={configForm.default_delivery_fee}
                    onChange={(e) =>
                      updateConfigForm({ default_delivery_fee: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={configForm.address}
                  onChange={(e) => updateConfigForm({ address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Restaurant Description</label>
                <textarea
                  rows={3}
                  value={configForm.description}
                  onChange={(e) => updateConfigForm({ description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={configForm.opening_hours}
                  onChange={(e) => updateConfigForm({ opening_hours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] focus:border-[#C8102E] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    required
                    value={configForm.currency_symbol}
                    onChange={(e) => updateConfigForm({ currency_symbol: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Currency Code</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={configForm.currency_code}
                    onChange={(e) => updateConfigForm({ currency_code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={configForm.delivery_enabled} onChange={(e) => updateConfigForm({ delivery_enabled: e.target.checked })} />
                  Delivery enabled
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={configForm.pickup_enabled} onChange={(e) => updateConfigForm({ pickup_enabled: e.target.checked })} />
                  Pickup enabled
                </label>
              </div>

              <div>
                <label htmlFor="admin-restaurant-logo" className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Restaurant Logo</label>
                <input
                  id="admin-restaurant-logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setConfigLogo(e.target.files?.[0] ?? null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm min-h-[44px]"
                />
                {(configLogoPreview || configForm.logo) && (
                  <img src={configLogoPreview || getMediaUrl(configForm.logo)} alt="Restaurant logo preview" className="mt-3 h-16 w-16 rounded-lg border border-[#E5E7EB] object-contain" />
                )}
              </div>

              {configFormError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{configFormError}</p>}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer min-h-[44px] disabled:opacity-60"
                >
                  {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-[#E5E7EB] space-y-5 shadow-xl">
            <h3 className="text-xl font-bold text-[#111827]">{editingCategory.id ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSaveCategorySubmit} className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Name
                <input required value={editingCategory.name || ''} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm min-h-[42px]" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Slug
                <input required value={editingCategory.slug || makeSlug(editingCategory.name || '')} onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm min-h-[42px]" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Section
                <select required value={editingCategory.section_id || ''} onChange={(e) => setEditingCategory({ ...editingCategory, section_id: e.target.value })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm min-h-[42px]">
                  {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Description
                <textarea rows={3} value={editingCategory.description || ''} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Display Order
                <input type="number" min="0" value={editingCategory.display_order || 0} onChange={(e) => setEditingCategory({ ...editingCategory, display_order: Number(e.target.value) })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm min-h-[42px]" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={editingCategory.is_active ?? true} onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })} /> Active in menu</label>
              {catalogFormError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{catalogFormError}</p>}
              <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-4">
                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm min-h-[40px]">Cancel</button>
                <button type="submit" disabled={isSavingCatalogItem || sections.length === 0} className="px-5 py-2 rounded-lg bg-[#C8102E] text-white text-sm font-semibold min-h-[40px] disabled:opacity-60">{isSavingCatalogItem ? 'Saving...' : 'Save Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-[#E5E7EB] space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#111827]">{editingSection.id ? 'Edit Section' : 'New Section'}</h3>
            <form onSubmit={handleSaveSectionSubmit} className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Name
                <input required value={editingSection.name || ''} onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm min-h-[42px]" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Slug
                <input required value={editingSection.slug || makeSlug(editingSection.name || '')} onChange={(e) => setEditingSection({ ...editingSection, slug: e.target.value })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm min-h-[42px]" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Description
                <textarea rows={3} value={editingSection.description || ''} onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Display Order
                <input type="number" min="0" value={editingSection.display_order || 0} onChange={(e) => setEditingSection({ ...editingSection, display_order: Number(e.target.value) })} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm min-h-[42px]" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827]">
                Section Image
                <input type="file" accept="image/*" onChange={(e) => setSelectedSectionImage(e.target.files?.[0] ?? null)} className="mt-1 w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-sm" />
              </label>
              {editingSection.image && <img src={getMediaUrl(editingSection.image)} alt="Current section" className="h-24 w-full rounded-lg object-cover" />}
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={editingSection.is_active ?? true} onChange={(e) => setEditingSection({ ...editingSection, is_active: e.target.checked })} /> Active in menu</label>
              {catalogFormError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{catalogFormError}</p>}
              <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-4">
                <button type="button" onClick={() => { setEditingSection(null); setSelectedSectionImage(null); }} className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm min-h-[40px]">Cancel</button>
                <button type="submit" disabled={isSavingCatalogItem} className="px-5 py-2 rounded-lg bg-[#C8102E] text-white text-sm font-semibold min-h-[40px] disabled:opacity-60">{isSavingCatalogItem ? 'Saving...' : 'Save Section'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Create Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E5E7EB] space-y-5 shadow-xl">
            <h3 className="text-xl font-bold text-[#111827]">
              {editingProduct.id ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8102E] min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={editingProduct.slug || makeSlug(editingProduct.name || '')}
                  onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm min-h-[40px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={editingProduct.category_id || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none min-h-[40px]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.display_order || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm min-h-[40px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-product-image"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1"
                >
                  Product Image
                </label>
                <input
                  id="admin-product-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedProductImage(e.target.files?.[0] ?? null)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#475569] min-h-[40px]"
                />
                <p className="text-[11px] text-[#475569]">
                  Choose an image from your device. Leave empty to keep the current image.
                </p>
                {(selectedProductImagePreview || editingProduct.image) && (
                  <img
                    src={
                      selectedProductImagePreview ||
                      getMediaUrl(editingProduct.image)
                    }
                    alt="Product image preview"
                    className="h-28 w-28 rounded-xl border border-[#E5E7EB] bg-stone-100 object-cover"
                  />
                )}
              </div>

              {productFormError && (
                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700" role="alert">
                  {productFormError}
                </p>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111827] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8ED]/30 border border-[#E5E7EB] text-sm text-[#111827] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#111827]">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_available ?? true}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_available: e.target.checked })
                    }
                    className="text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span>Is Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#111827]">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_featured: e.target.checked })
                    }
                    className="text-[#C8102E] focus:ring-[#C8102E]"
                  />
                  <span>Is Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setSelectedProductImage(null);
                    setProductFormError('');
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#475569] hover:text-[#111827] text-xs font-semibold cursor-pointer min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 rounded-xl bg-[#C8102E] hover:bg-[#A70D26] text-white text-xs font-semibold cursor-pointer min-h-[40px]"
                >
                  {isSavingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Detail Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E5E7EB] space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <span className="text-xs font-mono text-[#C8102E] font-bold block">
                  {selectedOrderModal.order_number}
                </span>
                <h3 className="text-xl font-extrabold text-[#111827]">
                  Order Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-2 rounded-lg hover:bg-[#FFF8ED] text-[#475569] hover:text-[#111827] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#111827]">
              <div className="flex justify-between">
                <span className="text-[#475569]">Customer:</span>
                <span className="font-bold text-[#111827]">{selectedOrderModal.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Phone:</span>
                <span>{selectedOrderModal.customer_phone}</span>
              </div>
              {selectedOrderModal.customer_email && (
                <div className="flex justify-between">
                  <span className="text-[#475569]">Email:</span>
                  <span>{selectedOrderModal.customer_email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#475569]">Fulfillment:</span>
                <span className="font-bold uppercase text-[#C8102E]">
                  {selectedOrderModal.order_type}
                </span>
              </div>
              {selectedOrderModal.delivery_address && (
                <div className="flex justify-between">
                  <span className="text-[#475569]">Delivery Address:</span>
                  <span className="text-right max-w-xs">{selectedOrderModal.delivery_address}</span>
                </div>
              )}
              {selectedOrderModal.customer_note && (
                <div className="flex justify-between">
                  <span className="text-[#475569]">Kitchen Note:</span>
                  <span className="text-right italic">{selectedOrderModal.customer_note}</span>
                </div>
              )}
            </div>

            {/* Snapshotted Items */}
            <div className="border-t border-[#E5E7EB] pt-3 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Snapshotted Items
              </h4>
              <div className="divide-y divide-[#E5E7EB]">
                {selectedOrderModal.items.map((i) => (
                  <div key={i.id} className="py-2 flex justify-between text-xs">
                    <span>
                      {i.quantity} × {i.product_name}
                    </span>
                    <span className="font-mono font-bold text-[#111827]">{formatMoney(i.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E5E7EB] pt-2 flex justify-between text-sm font-bold text-[#111827]">
                <span>Total Due</span>
                <span className="text-[#C8102E] font-black">{formatMoney(selectedOrderModal.total)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="px-4 py-2 rounded-xl bg-[#FFF8ED] hover:bg-[#FFF8ED]/80 text-[#111827] border border-[#E5E7EB] text-xs font-semibold cursor-pointer min-h-[40px]"
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
