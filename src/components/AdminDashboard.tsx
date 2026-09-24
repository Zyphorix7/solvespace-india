import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Truck,
  Users,
  Search,
  ExternalLink,
  Loader2,
  Save,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Zap,
  RotateCcw,
  Bell,
  CreditCard,
  Info,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Check,
  Palette,
  Copy,
  Download,
  Eye,
  Printer,
  Filter,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  LogOut,
  Key,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Order, AIInsight, OrderStatus } from '../types';
import { SolveSpaceLogo } from './SolveSpaceLogo';
import { fetchStoreInsights, generateProductCopy } from '../services/gemini';
import {
  addProductToDb,
  updateProductInDb,
  deleteProductFromDb,
} from '../services/firestore';

// Preset high-quality curated images for SolveSpace products
const CURATED_IMAGE_PRESETS = [
  {
    label: 'UltraDesk Organizer',
    url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'GaN Travel Charger',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'AirPure HEPA Purifier',
    url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Smart Monitor ScreenBar',
    url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Nomad Tech Sling Bag',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Ergonomic Desk Setup',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
  },
];

export const AdminDashboard: React.FC = () => {
  const {
    adminOpen,
    setAdminOpen,
    logoutAdmin,
    closeAdmin,
    products,
    orders,
    paymentSettings,
    updatePaymentSettings,
    seedCatalog,
    refreshProducts,
    refreshOrders,
    updateOrderStatus,
    updateOrderExchangeStatus,
    quickUpdateStock,
    showToast,
    formatCurrency,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'brandkit'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Products Tab Filters
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'low' | 'out'>('all');

  // Orders Tab Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'exchange'>('all');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Order Dispatch Editor State inside Details Modal
  const [trackingForm, setTrackingForm] = useState({
    courierName: 'Delhivery Surface',
    trackingNumber: '',
  });

  // AI Insights State
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Product CMS Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    subtitle: '',
    category: 'Desk & Workspace',
    price: 1499,
    compareAtPrice: 2499,
    description: '',
    inventory: 20,
    sku: '',
    imagesText: '',
    tagsText: 'Ergonomic, Made For India',
    featuresText: 'Aerospace aluminum build\n1-Year Warranty\nExpress Pan-India Delivery',
  });
  const [isGeneratingAiCopy, setIsGeneratingAiCopy] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    cashfreeEnabled: paymentSettings.cashfreeEnabled,
    codEnabled: paymentSettings.codEnabled,
    freeShippingThreshold: paymentSettings.freeShippingThreshold || 999,
    standardShippingFee: paymentSettings.standardShippingFee || 99,
    storeCurrency: paymentSettings.storeCurrency || 'INR',
    cashfreeAppId: paymentSettings.cashfreeAppId || '',
    cashfreeSecretKey: paymentSettings.cashfreeSecretKey || '',
    cashfreeEnv: paymentSettings.cashfreeEnv || 'sandbox',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sync settings when paymentSettings changes
  useEffect(() => {
    setSettingsForm({
      cashfreeEnabled: paymentSettings.cashfreeEnabled,
      codEnabled: paymentSettings.codEnabled,
      freeShippingThreshold: paymentSettings.freeShippingThreshold || 999,
      standardShippingFee: paymentSettings.standardShippingFee || 99,
      storeCurrency: paymentSettings.storeCurrency || 'INR',
      cashfreeAppId: paymentSettings.cashfreeAppId || '',
      cashfreeSecretKey: paymentSettings.cashfreeSecretKey || '',
      cashfreeEnv: paymentSettings.cashfreeEnv || 'sandbox',
    });
  }, [paymentSettings]);

  // Derived Metrics for Dashboard
  const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.totalAmount : sum), 0);
  const processingCount = orders.filter((o) => o.orderStatus === 'processing' || o.orderStatus === 'pending').length;
  const shippedCount = orders.filter((o) => o.orderStatus === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const exchangeCount = orders.filter((o) => o.exchangeStatus && o.exchangeStatus !== 'none').length;
  const pendingExchangeCount = orders.filter((o) => o.exchangeStatus === 'requested').length;
  const totalCustomers = new Set(orders.map((o) => o.customer.email || o.customer.phoneNumber)).size;
  const lowStockProducts = products.filter((p) => p.inventory <= 5);

  // Load AI Insights
  const handleLoadInsights = async () => {
    setIsLoadingInsights(true);
    const catalogStats = {
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
    };
    const orderStats = {
      totalRevenue,
      totalOrders: orders.length,
      pendingShipments: processingCount,
    };
    const res = await fetchStoreInsights(catalogStats, orderStats);
    setInsights(res);
    setIsLoadingInsights(false);
  };

  useEffect(() => {
    if (adminOpen && insights.length === 0) {
      handleLoadInsights();
    }
  }, [adminOpen]);

  // Sync tracking form when an order is opened for inspection
  useEffect(() => {
    if (selectedOrderForDetails) {
      setTrackingForm({
        courierName: selectedOrderForDetails.courierName || 'Delhivery Surface',
        trackingNumber: selectedOrderForDetails.trackingNumber || '',
      });
    }
  }, [selectedOrderForDetails]);

  if (!adminOpen) return null;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedProductCategory === 'All' || p.category === selectedProductCategory;

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'instock' && p.inventory > 5) ||
      (stockFilter === 'low' && p.inventory > 0 && p.inventory <= 5) ||
      (stockFilter === 'out' && p.inventory === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.pincode.includes(searchQuery) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      orderStatusFilter === 'all' ||
      (orderStatusFilter === 'pending' && (o.orderStatus === 'pending' || o.orderStatus === 'processing')) ||
      (orderStatusFilter === 'processing' && o.orderStatus === 'processing') ||
      (orderStatusFilter === 'shipped' && o.orderStatus === 'shipped') ||
      (orderStatusFilter === 'delivered' && o.orderStatus === 'delivered') ||
      (orderStatusFilter === 'exchange' && o.exchangeStatus && o.exchangeStatus !== 'none');

    return matchesSearch && matchesStatus;
  });

  // Save Payment Settings to Firestore
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updatePaymentSettings(settingsForm);
      showToast('Gateway settings and shipping rules saved to Firestore!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Open Product Modal
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      subtitle: '',
      category: 'Desk & Workspace',
      price: 1999,
      compareAtPrice: 2999,
      description: '',
      inventory: 25,
      sku: `SS-${Math.floor(100 + Math.random() * 900)}`,
      imagesText: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
      tagsText: 'Ergonomic, Workspace, SolveSpace',
      featuresText: 'High grade material\nEngineered for India\n1-Year Replacement Warranty',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      subtitle: prod.subtitle || '',
      category: prod.category,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || prod.price * 1.4,
      description: prod.description,
      inventory: prod.inventory,
      sku: prod.sku || '',
      imagesText: prod.images.join('\n'),
      tagsText: prod.tags?.join(', ') || '',
      featuresText: prod.features?.join('\n') || '',
    });
    setIsProductModalOpen(true);
  };

  // AI Description Generator for Product CMS
  const handleGenerateProductCopy = async () => {
    if (!productForm.title) {
      showToast('Please enter a product title first to generate AI copy.', 'info');
      return;
    }
    setIsGeneratingAiCopy(true);
    const copy = await generateProductCopy(productForm.title, productForm.category);
    if (copy) {
      setProductForm((prev) => ({
        ...prev,
        subtitle: copy.subtitle || prev.subtitle,
        description: copy.description || prev.description,
        featuresText: copy.features ? copy.features.join('\n') : prev.featuresText,
        tagsText: copy.tags ? copy.tags.join(', ') : prev.tagsText,
        price: copy.suggestedPrice || prev.price,
        compareAtPrice: copy.suggestedCompareAtPrice || prev.compareAtPrice,
      }));
      showToast('Generated product description with Gemini AI!', 'success');
    }
    setIsGeneratingAiCopy(false);
  };

  // Safe client-side image downscaling to prevent Firestore 1MB limits
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
            setProductForm((prev) => ({
              ...prev,
              imagesText: prev.imagesText ? `${prev.imagesText}\n${compressedDataUrl}` : compressedDataUrl,
            }));
            showToast('Optimized image added to product', 'success');
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Save product in CMS
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = productForm.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const features = productForm.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = productForm.tagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Omit<Product, 'id'> = {
      title: productForm.title,
      subtitle: productForm.subtitle,
      category: productForm.category,
      price: Number(productForm.price),
      compareAtPrice: Number(productForm.compareAtPrice),
      description: productForm.description,
      inventory: Number(productForm.inventory),
      sku: productForm.sku,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80'],
      features,
      tags,
      rating: editingProduct?.rating || 4.9,
      reviewCount: editingProduct?.reviewCount || 1,
    };

    try {
      if (editingProduct) {
        await updateProductInDb(editingProduct.id, payload);
        showToast('Product updated successfully in Firestore', 'success');
      } else {
        await addProductToDb(payload);
        showToast('New product added to SolveSpace India catalog', 'success');
      }
      setIsProductModalOpen(false);
      await refreshProducts();
    } catch (err) {
      console.error(err);
      showToast('Error saving product to database', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProductFromDb(id);
      await refreshProducts();
      showToast('Product removed from catalog', 'info');
    }
  };

  // Save Tracking from details modal
  const handleSaveTracking = async () => {
    if (!selectedOrderForDetails) return;
    try {
      await updateOrderStatus(
        selectedOrderForDetails.id,
        selectedOrderForDetails.orderStatus === 'pending' ? 'processing' : selectedOrderForDetails.orderStatus,
        undefined,
        trackingForm.trackingNumber,
        trackingForm.courierName
      );
      setSelectedOrderForDetails((prev) =>
        prev
          ? {
              ...prev,
              trackingNumber: trackingForm.trackingNumber,
              courierName: trackingForm.courierName,
            }
          : null
      );
      showToast('Dispatch & tracking details updated for customer', 'success');
    } catch (err) {
      showToast('Failed to update tracking', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-3 md:p-6 font-sans">
      {/* Admin Window Frame */}
      <div className="w-full max-w-[1500px] h-full sm:h-[95vh] bg-[#F7F8FA] sm:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden text-slate-900 border border-slate-200">
        
        {/* LEFT EXPANDED/COLLAPSIBLE SIDEBAR */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 flex md:flex-col justify-between shrink-0 shadow-2xs z-20">
          <div className="flex md:flex-col items-center md:items-stretch gap-4 w-full">
            {/* SolveSpace India Brand Header */}
            <div className="flex items-center justify-between pb-2 md:pb-4 md:border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shadow-md shrink-0">
                  <SolveSpaceLogo variant="icon" size="xs" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-tight text-slate-900">SolveSpace</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#F58220] text-white tracking-widest uppercase">
                      IN
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Admin Console
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs with Icons AND Labels */}
            <nav className="flex md:flex-col items-center md:items-stretch gap-1.5 w-full overflow-x-auto md:overflow-visible pb-1 md:pb-0 no-scrollbar">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
                { id: 'products', label: 'Products Catalog', icon: Package, badge: products.length },
                {
                  id: 'orders',
                  label: 'Orders & Tracking',
                  icon: ShoppingBag,
                  badge: processingCount > 0 ? `${processingCount} new` : orders.length,
                  badgeColor: processingCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600',
                },
                { id: 'settings', label: 'Store & Gateways', icon: Sliders, badge: null },
                { id: 'brandkit', label: 'Brand Kit & Logos', icon: Palette, badge: '8 assets' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#0B2545] text-white shadow-md shadow-slate-900/15'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F58220]' : 'text-slate-400'}`} />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : (item as any).badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Quick AI Diagnostics Trigger */}
              <button
                onClick={handleLoadInsights}
                disabled={isLoadingInsights}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all cursor-pointer shrink-0 mt-1"
              >
                <div className="flex items-center gap-2.5">
                  {isLoadingInsights ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  )}
                  <span>Run AI Audit</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200/60 text-purple-800">
                  Gemini
                </span>
              </button>
            </nav>
          </div>

          {/* Bottom Actions: Storefront & Close */}
          <div className="hidden md:flex flex-col gap-2 pt-4 border-t border-slate-100 w-full">
            <button
              onClick={closeAdmin}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Return to Store</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
            <button
              onClick={logoutAdmin}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out & Lock</span>
              </div>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                Exit
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] overflow-hidden">
          {/* TOP BAR WITH LIVE SEARCH & CONTROLS */}
          <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
            {/* Functional Search Bar */}
            <div className="flex-1 max-w-md relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'products'
                    ? 'Search products by title, category, SKU...'
                    : activeTab === 'orders'
                    ? 'Search orders by ID, customer, city, tracking...'
                    : 'Search across SolveSpace catalog, orders, and tools...'
                }
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:border-slate-400 focus:outline-hidden transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Action Tools */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 relative cursor-pointer active:scale-95 transition-all"
                  title="Alerts & Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-600" />
                  {(lowStockProducts.length > 0 || pendingExchangeCount > 0 || processingCount > 0) && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-900">Admin Alerts</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Real-Time</span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {lowStockProducts.length > 0 && (
                        <div
                          onClick={() => {
                            setActiveTab('products');
                            setStockFilter('low');
                            setNotificationOpen(false);
                          }}
                          className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100/70"
                        >
                          <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Low Stock Alert ({lowStockProducts.length} items)</span>
                          </div>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            {lowStockProducts.map((p) => p.title).slice(0, 2).join(', ')}...
                          </p>
                        </div>
                      )}
                      {pendingExchangeCount > 0 && (
                        <div
                          onClick={() => {
                            setActiveTab('orders');
                            setOrderStatusFilter('exchange');
                            setNotificationOpen(false);
                          }}
                          className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl cursor-pointer hover:bg-purple-100/70"
                        >
                          <div className="flex items-center gap-2 text-purple-800 text-xs font-bold">
                            <RotateCcw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>Exchange Requests ({pendingExchangeCount} pending)</span>
                          </div>
                          <p className="text-[11px] text-purple-700 mt-0.5">
                            Customers requested product exchanges under 5-day policy.
                          </p>
                        </div>
                      )}
                      {processingCount > 0 && (
                        <div
                          onClick={() => {
                            setActiveTab('orders');
                            setOrderStatusFilter('pending');
                            setNotificationOpen(false);
                          }}
                          className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-100/70"
                        >
                          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                            <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{processingCount} orders ready for dispatch</span>
                          </div>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Generate courier AWB shipping labels to complete fulfillment.
                          </p>
                        </div>
                      )}
                      {lowStockProducts.length === 0 && pendingExchangeCount === 0 && processingCount === 0 && (
                        <p className="text-xs text-slate-500 py-3 text-center">
                          All systems operational. No critical alerts.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Add Product Button */}
              <button
                onClick={openNewProductModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>

              {/* Storefront return link & Logout for Mobile */}
              <button
                onClick={closeAdmin}
                className="px-2.5 py-1.5 rounded-lg flex md:hidden items-center gap-1 text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                title="Return to Customer Storefront"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Store</span>
              </button>
              <button
                onClick={logoutAdmin}
                className="w-8 h-8 rounded-lg flex md:hidden items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100"
                title="Sign Out of Admin Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* VIEWPORT CONTENT CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Greeting & Quick Action Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      SolveSpace India Operations Center
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Live store metrics, dispatch pipelines, and automated Indian logistics tracking.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshOrders}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Live DB</span>
                    </button>
                    <button
                      onClick={openNewProductModal}
                      className="px-4 py-2 bg-[#F58220] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* KPI CARDS (All formatted in ₹ INR) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Revenue */}
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                      <span>Total Revenue</span>
                      <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        ₹
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {formatCurrency(totalRevenue)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Paid orders</span>
                      <span className="text-slate-400 font-normal">via Cashfree & COD</span>
                    </div>
                  </div>

                  {/* Total Orders */}
                  <div
                    onClick={() => setActiveTab('orders')}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 cursor-pointer hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                      <span>Total Orders</span>
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {orders.length}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold">
                      <span>{deliveredCount} delivered</span>
                      <span className="text-slate-400 font-normal">across India</span>
                    </div>
                  </div>

                  {/* Pending Shipments */}
                  <div
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderStatusFilter('pending');
                    }}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 cursor-pointer hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                      <span>Pending Dispatch</span>
                      <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-600">
                      {processingCount}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ready to pack</span>
                      <span className="text-slate-400 font-normal">Cutoff: 2 PM IST</span>
                    </div>
                  </div>

                  {/* Exchange Requests */}
                  <div
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderStatusFilter('exchange');
                    }}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 cursor-pointer hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                      <span>Exchange Requests</span>
                      <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-purple-700">
                      {exchangeCount}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-purple-600 font-bold">
                      <span>5-Day Policy</span>
                      <span className="text-slate-400 font-normal">Product replacement only</span>
                    </div>
                  </div>
                </div>

                {/* REVENUE TREND & LOW STOCK SPLIT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Revenue Trend Line Chart */}
                  <div className="lg:col-span-8 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          SolveSpace Revenue Trajectory (₹ INR)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Direct-to-Consumer Pan-India sales across desk & tech hardware
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                        FY 2026-27
                      </span>
                    </div>

                    <div className="relative h-48 w-full pt-2">
                      <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0B2545" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#0B2545" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                        <line x1="0" y1="70" x2="400" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" />
                        <line x1="0" y1="110" x2="400" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />
                        <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" />

                        <path
                          d="M 10 140 Q 60 110, 110 120 T 210 70 T 310 40 T 390 20 L 390 150 L 10 150 Z"
                          fill="url(#areaGrad)"
                        />
                        <path
                          d="M 10 140 Q 60 110, 110 120 T 210 70 T 310 40 T 390 20"
                          fill="none"
                          stroke="#0B2545"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="210" cy="70" r="4" fill="#0B2545" stroke="#fff" strokeWidth="2" />
                        <circle cx="310" cy="40" r="5" fill="#F58220" stroke="#fff" strokeWidth="2" />

                        {/* Tooltip in ₹ INR */}
                        <g transform="translate(250, 8)">
                          <rect width="115" height="34" rx="8" fill="#0B2545" />
                          <text x="8" y="15" fill="#94A3B8" fontSize="9" fontWeight="bold">Active Run Rate</text>
                          <text x="8" y="27" fill="#FFFFFF" fontSize="11" fontWeight="bold">₹1.85 Lakh</text>
                          <text x="80" y="27" fill="#F58220" fontSize="9" fontWeight="bold">+24%</text>
                        </g>
                      </svg>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2">
                        <span>Delhi-NCR</span>
                        <span>Bengaluru</span>
                        <span>Mumbai</span>
                        <span>Hyderabad</span>
                        <span>Tier 2 Metros</span>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alerts Card */}
                  <div className="lg:col-span-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-extrabold text-slate-900">Inventory Alerts</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {lowStockProducts.length} low stock
                      </span>
                    </div>

                    <div className="space-y-3">
                      {lowStockProducts.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          All products healthy above safety stock buffer.
                        </div>
                      ) : (
                        lowStockProducts.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                                {item.title}
                              </span>
                              <span className="text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                {item.inventory} units left
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-500">Quick Restock:</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => quickUpdateStock(item.id, item.inventory + 10)}
                                  className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[10px] font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => quickUpdateStock(item.id, item.inventory + 25)}
                                  className="px-2 py-0.5 bg-[#0B2545] text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  +25
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* GEMINI AI STORE DIAGNOSTICS */}
                <div className="p-5 sm:p-6 bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-slate-50 rounded-3xl border border-purple-200/70 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          SolveSpace Gemini AI Diagnostic Insights
                        </h3>
                        <p className="text-xs text-slate-500">
                          Real-time reasoning on Indian conversion rate optimization, inventory velocity, and logistics.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLoadInsights}
                      disabled={isLoadingInsights}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                      {isLoadingInsights ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>Refresh Diagnostics</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">{item.title}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.type === 'opportunity'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.type === 'warning'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                        <div className="text-[11px] text-purple-700 font-bold bg-purple-50/80 p-2 rounded-xl">
                          <strong>Action:</strong> {item.actionableStep}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS CMS */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Product Catalog Management
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage pricing, multi-type imagery, stock quantities, and Gemini copy generation.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={openNewProductModal}
                      className="px-4 py-2 bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
                  <div className="flex items-center gap-1 text-slate-500 font-bold mr-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedProductCategory}
                    onChange={(e) => setSelectedProductCategory(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-hidden"
                  >
                    <option value="All">All Categories ({products.length})</option>
                    <option value="Desk & Workspace">Desk & Workspace</option>
                    <option value="Tech & Mobility">Tech & Mobility</option>
                    <option value="Home & Wellness">Home & Wellness</option>
                  </select>

                  {/* Stock Status Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'instock', label: 'In Stock' },
                      { id: 'low', label: 'Low Stock (≤5)' },
                      { id: 'out', label: 'Out of Stock' },
                    ].map((sf) => (
                      <button
                        key={sf.id}
                        onClick={() => setStockFilter(sf.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          stockFilter === sf.id
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {sf.label}
                      </button>
                    ))}
                  </div>

                  <span className="ml-auto text-[11px] text-slate-400 font-semibold">
                    Showing {filteredProducts.length} of {products.length} products
                  </span>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                      <p>No products matched the current filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedProductCategory('All');
                          setStockFilter('all');
                        }}
                        className="text-[#0B2545] font-bold underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-3.5">Product</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Price (INR)</th>
                            <th className="p-3.5">Stock Level</th>
                            <th className="p-3.5">Quick Stock Adjust</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5 flex items-center gap-3">
                                <img
                                  src={p.images[0] || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=150&q=80'}
                                  alt={p.title}
                                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 max-w-xs">
                                  <div className="font-bold text-slate-900 truncate">{p.title}</div>
                                  <div className="text-[11px] text-slate-400">SKU: {p.sku || 'N/A'}</div>
                                </div>
                              </td>
                              <td className="p-3.5 text-slate-600 font-semibold">{p.category}</td>
                              <td className="p-3.5 font-bold text-slate-900">
                                <div>{formatCurrency(p.price)}</div>
                                {p.compareAtPrice && (
                                  <div className="text-[10px] text-slate-400 line-through">
                                    {formatCurrency(p.compareAtPrice)}
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                    p.inventory === 0
                                      ? 'bg-rose-100 text-rose-800'
                                      : p.inventory <= 5
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {p.inventory} units
                                </span>
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => quickUpdateStock(p.id, Math.max(0, p.inventory - 1))}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                                    title="Decrease 1"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-bold text-slate-900">
                                    {p.inventory}
                                  </span>
                                  <button
                                    onClick={() => quickUpdateStock(p.id, p.inventory + 1)}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                                    title="Increase 1"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => quickUpdateStock(p.id, p.inventory + 10)}
                                    className="px-1.5 py-0.5 text-[10px] font-bold bg-[#0B2545]/10 text-[#0B2545] rounded hover:bg-[#0B2545]/20 cursor-pointer"
                                    title="Add 10"
                                  >
                                    +10
                                  </button>
                                </div>
                              </td>
                              <td className="p-3.5 text-right space-x-2">
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ORDERS & FULFILLMENT MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Orders, Fulfillment & Indian Logistics
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track customer parcels, assign courier AWB tracking, and manage 5-day exchange workflows.
                    </p>
                  </div>
                  <button
                    onClick={refreshOrders}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Orders</span>
                  </button>
                </div>

                {/* Status Segmented Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {[
                    { id: 'all', label: 'All Orders', count: orders.length },
                    { id: 'pending', label: 'Processing & Pending', count: processingCount },
                    { id: 'shipped', label: 'In Transit / Shipped', count: shippedCount },
                    { id: 'delivered', label: 'Delivered', count: deliveredCount },
                    { id: 'exchange', label: 'Exchanges', count: exchangeCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                        orderStatusFilter === tab.id
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          orderStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                      <p>No orders match the selected filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setOrderStatusFilter('all');
                        }}
                        className="text-[#0B2545] font-bold underline cursor-pointer"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-3.5">Order ID & Date</th>
                            <th className="p-3.5">Customer & City</th>
                            <th className="p-3.5">Items Summary</th>
                            <th className="p-3.5">Total & Payment</th>
                            <th className="p-3.5">Fulfillment Status</th>
                            <th className="p-3.5">Courier & Tracking</th>
                            <th className="p-3.5 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <span className="font-mono font-bold text-[#0B2545]">
                                  {order.orderNumber}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900">{order.customer.fullName}</div>
                                <div className="text-[11px] text-slate-500">
                                  {order.customer.city} ({order.customer.pincode})
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {order.customer.phoneNumber}
                                </div>
                              </td>
                              <td className="p-3.5 max-w-[200px]">
                                <div className="text-slate-800 font-semibold truncate">
                                  {order.items.map((it) => `${it.productTitle} (x${it.quantity})`).join(', ')}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</div>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    order.paymentMethod === 'cashfree'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {order.paymentMethod === 'cashfree' ? 'Cashfree UPI/Cards' : 'Cash on Delivery'}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <select
                                  value={order.orderStatus}
                                  onChange={(e) =>
                                    updateOrderStatus(order.id, e.target.value as any)
                                  }
                                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-hidden ${
                                    order.orderStatus === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : order.orderStatus === 'shipped'
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : order.orderStatus === 'cancelled'
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : 'bg-amber-50 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-3.5">
                                {order.trackingNumber ? (
                                  <div>
                                    <div className="font-mono font-bold text-slate-800 text-[11px]">
                                      {order.trackingNumber}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {order.courierName || 'Delhivery'}
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSelectedOrderForDetails(order)}
                                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Assign AWB</span>
                                  </button>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => setSelectedOrderForDetails(order)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: STORE SETTINGS & GATEWAYS */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Payment Gateway & Indian Logistics Configurations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control live checkout payment rails, COD restrictions, and shipping thresholds stored in Firestore.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Payment Gateways Card */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <CreditCard className="w-4 h-4 text-[#F58220]" />
                      <h4 className="text-sm font-extrabold text-slate-900">Indian Payment Gateways</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Cashfree Gateway Toggle */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                Cashfree Payments Gateway (UPI / QR / Cards / NetBanking)
                              </span>
                              <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                                Zero Latency
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Accept instant Google Pay, PhonePe, Paytm, and all Indian Rupay/Visa/Mastercard debit cards.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsForm.cashfreeEnabled}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, cashfreeEnabled: e.target.checked })
                            }
                            className="w-5 h-5 accent-[#0B2545] rounded cursor-pointer"
                          />
                        </div>

                        {/* Cashfree Credentials Config & Setup Walkthrough */}
                        {settingsForm.cashfreeEnabled && (
                          <div className="pt-3 border-t border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5 text-[#0B2545]" />
                                <span>Cashfree API Credentials</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <label className="text-[11px] text-slate-500 font-semibold">Environment:</label>
                                <select
                                  value={settingsForm.cashfreeEnv}
                                  onChange={(e) =>
                                    setSettingsForm({
                                      ...settingsForm,
                                      cashfreeEnv: e.target.value as 'sandbox' | 'production',
                                    })
                                  }
                                  className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                                >
                                  <option value="sandbox">Sandbox (Testing / Test Mode)</option>
                                  <option value="production">Production (Live Gateway)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                  Cashfree App ID (Client ID)
                                </label>
                                <input
                                  type="text"
                                  value={settingsForm.cashfreeAppId}
                                  onChange={(e) =>
                                    setSettingsForm({ ...settingsForm, cashfreeAppId: e.target.value })
                                  }
                                  placeholder="e.g. 12345678abcdef90"
                                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0B2545]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                  Cashfree Secret Key
                                </label>
                                <input
                                  type="password"
                                  value={settingsForm.cashfreeSecretKey}
                                  onChange={(e) =>
                                    setSettingsForm({ ...settingsForm, cashfreeSecretKey: e.target.value })
                                  }
                                  placeholder="cfsk_ma_prod_... or test key"
                                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0B2545]"
                                />
                              </div>
                            </div>

                            {/* Step-by-Step Quick Guide Card */}
                            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-2">
                              <div className="font-extrabold text-[#0B2545] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>How to connect your Cashfree Merchant Account:</span>
                              </div>
                              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed font-medium">
                                <li>
                                  Log in to your <strong>Cashfree Merchant Dashboard</strong> (
                                  <a
                                    href="https://merchant.cashfree.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline font-bold"
                                  >
                                    merchant.cashfree.com
                                  </a>
                                  ).
                                </li>
                                <li>Navigate to <strong>Payment Gateway</strong> &gt; <strong>Developers</strong> &gt; <strong>API Keys</strong>.</li>
                                <li>Copy your <strong>App ID</strong> and generate or copy your <strong>Secret Key</strong>.</li>
                                <li>Paste both values into the fields above and select <strong>Production</strong> or <strong>Sandbox</strong>.</li>
                                <li>Click <strong>Save Gateway & Shipping Settings</strong> below to update your Firestore database.</li>
                              </ol>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cash on Delivery Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              Cash on Delivery (COD) Pan-India
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-100 text-amber-800 uppercase">
                              Pincode Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Allow doorstep cash payment verified through automated Indian pincode serviceability rules.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.codEnabled}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })
                          }
                          className="w-5 h-5 accent-[#0B2545] rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Rules Card */}
                  <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Truck className="w-4 h-4 text-[#0B2545]" />
                      <h4 className="text-sm font-extrabold text-slate-900">Shipping Fees & Indian Rules</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Free Express Shipping Threshold (₹ INR)
                        </label>
                        <input
                          type="number"
                          value={settingsForm.freeShippingThreshold}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              freeShippingThreshold: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Orders above this amount qualify for zero delivery fee.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Standard Shipping Fee (₹ INR)
                        </label>
                        <input
                          type="number"
                          value={settingsForm.standardShippingFee}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              standardShippingFee: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Applied to orders below the free shipping threshold.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isSavingSettings ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 text-[#F58220]" />
                      )}
                      <span>Save Operational Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: BRAND KIT & ASSETS */}
            {activeTab === 'brandkit' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-[#0B2545] via-[#102F54] to-[#0B2545] text-white rounded-3xl shadow-md border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <SolveSpaceLogo variant="icon" size="sm" textColor="#FFFFFF" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          SolveSpace India Official Brand Assets
                        </h2>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F58220] text-white uppercase tracking-wider">
                          Official Guide
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        High-precision vector logos, app icons, packaging watermarks, and typography tokens.
                      </p>
                    </div>
                  </div>

                  <a
                    href="./favicon.svg"
                    download="solvespace-india-favicon.svg"
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Download Favicon</span>
                  </a>
                </div>

                {/* 8 Official Brand Assets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* 1. Main Logo */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Main Logo</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">PRIMARY</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Icon + SOLVESPACE + INDIA with Indian Tricolor wave</p>
                    </div>
                    <div className="py-6 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 min-h-[120px]">
                      <SolveSpaceLogo variant="main" size="md" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Header, Hero, Splash</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('<SolveSpaceLogo variant="main" size="md" />');
                          showToast('Copied Main Logo code!', 'success');
                        }}
                        className="text-xs font-bold text-[#0B2545] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Horizontal Logo */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Horizontal Logo</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">COMPACT</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Landscape orientation for tight horizontal navigation</p>
                    </div>
                    <div className="py-6 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 min-h-[120px]">
                      <SolveSpaceLogo variant="horizontal" size="md" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Invoices, Sticky Bar</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('<SolveSpaceLogo variant="horizontal" size="md" />');
                          showToast('Copied Horizontal Logo code!', 'success');
                        }}
                        className="text-xs font-bold text-[#0B2545] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Stacked Logo */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Stacked Logo</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">VERTICAL</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Icon top, SOLVESPACE center, INDIA bottom</p>
                    </div>
                    <div className="py-6 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 min-h-[120px]">
                      <SolveSpaceLogo variant="stacked" size="md" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Box Seals, Cartons</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('<SolveSpaceLogo variant="stacked" size="md" />');
                          showToast('Copied Stacked Logo code!', 'success');
                        }}
                        className="text-xs font-bold text-[#0B2545] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. App Icon / Profile Pic */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">App Icon (Squircle)</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">SQUIRCLE</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">iOS and Android launcher format with soft elevation</p>
                    </div>
                    <div className="py-6 flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200 min-h-[120px]">
                      <SolveSpaceLogo variant="app-icon" size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>App Stores, Favicon</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('<SolveSpaceLogo variant="app-icon" size="md" />');
                          showToast('Copied App Icon code!', 'success');
                        }}
                        className="text-xs font-bold text-[#0B2545] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Standalone Logomark */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Standalone Logomark</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">DUAL-TONE</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Navy hexagon with breakthrough arrow + orange filament</p>
                    </div>
                    <div className="py-6 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 min-h-[120px]">
                      <SolveSpaceLogo variant="icon" size="lg" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Badges, Watermarks</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('<SolveSpaceLogo variant="icon" size="md" />');
                          showToast('Copied Logomark code!', 'success');
                        }}
                        className="text-xs font-bold text-[#0B2545] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Tag</span>
                      </button>
                    </div>
                  </div>

                  {/* 6. Simplified & Inverted Logomarks */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Monochrome & Inverted</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">MONOCHROME</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Solid navy vector and inverted white silhouette</p>
                    </div>
                    <div className="py-6 flex items-center justify-center gap-6 bg-slate-50 rounded-xl border border-slate-100 min-h-[120px]">
                      <SolveSpaceLogo variant="simplified" size="md" />
                      <SolveSpaceLogo variant="inverted" size="md" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Laser Engraving, Seals</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('<SolveSpaceLogo variant="simplified" size="md" />');
                          showToast('Copied Monochrome code!', 'success');
                        }}
                        className="text-xs font-bold text-[#0B2545] hover:text-[#F58220] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Tag</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Packaging Carton Watermark Replica */}
                <div className="p-6 bg-gradient-to-r from-amber-50 via-orange-50/50 to-slate-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        Cardboard Packaging Box Watermark (From Brand Guide)
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Stamped across all genuine SolveSpace shipping cartons and parcel tape for tamper evidence.
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#E8D8C3] border-2 border-[#C9B194] rounded-2xl shadow-inner flex items-center justify-center">
                    <SolveSpaceLogo variant="watermark" size="sm" />
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#F58220]" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      SolveSpace India Official Color System
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="h-16 bg-[#0B2545] p-2 flex items-end">
                        <span className="font-mono text-[11px] font-bold text-white">#0B2545</span>
                      </div>
                      <div className="p-2.5">
                        <span className="text-xs font-bold text-slate-900 block">Deep Navy</span>
                        <span className="text-[10px] text-slate-500">Hexagon shell, Arrow, Wordmark</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="h-16 bg-[#F58220] p-2 flex items-end">
                        <span className="font-mono text-[11px] font-bold text-white">#F58220</span>
                      </div>
                      <div className="p-2.5">
                        <span className="text-xs font-bold text-slate-900 block">Amber Orange</span>
                        <span className="text-[10px] text-slate-500">Filament & Right wall</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="h-16 bg-[#FF671F] p-2 flex items-end">
                        <span className="font-mono text-[11px] font-bold text-white">#FF671F</span>
                      </div>
                      <div className="p-2.5">
                        <span className="text-xs font-bold text-slate-900 block">Tricolor Saffron</span>
                        <span className="text-[10px] text-slate-500">India flag ribbon</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="h-16 bg-[#046A38] p-2 flex items-end">
                        <span className="font-mono text-[11px] font-bold text-white">#046A38</span>
                      </div>
                      <div className="p-2.5">
                        <span className="text-xs font-bold text-slate-900 block">Tricolor Green</span>
                        <span className="text-[10px] text-slate-500">India flag ribbon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ORDER DETAILS & DISPATCH MODAL */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#F58220]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">
                      Order {selectedOrderForDetails.orderNumber}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        selectedOrderForDetails.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOrderForDetails.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedOrderForDetails.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Placed on {new Date(selectedOrderForDetails.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Dossier & Delivery Address */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Customer Delivery Details</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {selectedOrderForDetails.customer.pincode}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-700">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedOrderForDetails.customer.fullName}
                </div>
                <div>{selectedOrderForDetails.customer.addressLine1}</div>
                {selectedOrderForDetails.customer.landmark && (
                  <div className="text-slate-500 text-[11px]">
                    Landmark: {selectedOrderForDetails.customer.landmark}
                  </div>
                )}
                <div className="font-semibold text-slate-900">
                  {selectedOrderForDetails.customer.city}, {selectedOrderForDetails.customer.state} - {selectedOrderForDetails.customer.pincode}
                </div>
                <div className="flex items-center gap-4 pt-1 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <a href={`tel:${selectedOrderForDetails.customer.phoneNumber}`} className="text-blue-600 font-bold hover:underline">
                      {selectedOrderForDetails.customer.phoneNumber}
                    </a>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{selectedOrderForDetails.customer.email}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Order Items */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-900">Purchased Hardware Items</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedOrderForDetails.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=150&q=80'}
                        alt={item.productTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.productTitle}</div>
                        {item.variantName && (
                          <div className="text-[11px] text-slate-500">Variant: {item.variantName}</div>
                        )}
                        <div className="text-[11px] text-slate-400">Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                      </div>
                    </div>
                    <div className="font-black text-xs text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrderForDetails.subtotal)}</span>
                </div>
                {selectedOrderForDetails.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedOrderForDetails.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{selectedOrderForDetails.shippingFee === 0 ? 'FREE' : formatCurrency(selectedOrderForDetails.shippingFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span>{formatCurrency(selectedOrderForDetails.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Courier Dispatch & Tracking Number Assignment */}
            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Courier Fulfillment & AWB Tracking</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700">Pan-India Express</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={trackingForm.courierName}
                    onChange={(e) => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="Delhivery Surface">Delhivery Surface</option>
                    <option value="Delhivery Express">Delhivery Express</option>
                    <option value="Blue Dart Air Express">Blue Dart Air Express</option>
                    <option value="DTDC Plus">DTDC Plus</option>
                    <option value="India Post SpeedPost">India Post SpeedPost</option>
                    <option value="Shadowfax">Shadowfax</option>
                    <option value="Xpressbees">Xpressbees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    AWB / Tracking Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DEL10982348IN"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveTracking}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  Save Dispatch & Notify Customer
                </button>
              </div>
            </div>

            {/* Exchange Policy Management if requested */}
            {selectedOrderForDetails.exchangeStatus && selectedOrderForDetails.exchangeStatus !== 'none' && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
                    <span>5-Day Exchange Request Details</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-200 text-purple-900 uppercase">
                    {selectedOrderForDetails.exchangeStatus}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-purple-900">
                  <div><strong>Customer Reason:</strong> {selectedOrderForDetails.exchangeReason || 'Product replacement requested'}</div>
                  {selectedOrderForDetails.exchangeNotes && (
                    <div><strong>Customer Notes:</strong> {selectedOrderForDetails.exchangeNotes}</div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-purple-900">Update Status:</span>
                  <select
                    value={selectedOrderForDetails.exchangeStatus}
                    onChange={(e) => {
                      updateOrderExchangeStatus(selectedOrderForDetails.id, e.target.value as any);
                      setSelectedOrderForDetails((prev) =>
                        prev ? { ...prev, exchangeStatus: e.target.value as any } : null
                      );
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-purple-300 bg-white text-purple-900 focus:outline-hidden"
                  >
                    <option value="requested">Requested (Under Review)</option>
                    <option value="approved">Approved (Awaiting Pickup)</option>
                    <option value="in_transit">In Transit (Reverse Pickup Dispatched)</option>
                    <option value="completed">Completed (Replacement Delivered)</option>
                    <option value="rejected">Rejected (Non-Compliant)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Packing Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderForDetails(null)}
                className="px-5 py-2 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CMS ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {editingProduct ? 'Edit SolveSpace Product' : 'Add New Hardware to Catalog'}
                </h4>
                <p className="text-xs text-slate-400">
                  Curate specs, image assets, inventory, and automated AI product descriptions.
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Title & AI Generator Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Product Title *</label>
                  <button
                    type="button"
                    onClick={handleGenerateProductCopy}
                    disabled={isGeneratingAiCopy}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    {isGeneratingAiCopy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>Generate Copy with Gemini AI</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. SolveSpace UltraDesk™ Ergonomic Desk Organizer"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Modular Aerospace Aluminum Cable & Gadget Dock"
                  value={productForm.subtitle}
                  onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Category, Inventory, SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="Desk & Workspace">Desk & Workspace</option>
                    <option value="Tech & Mobility">Tech & Mobility</option>
                    <option value="Home & Wellness">Home & Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.inventory}
                    onChange={(e) =>
                      setProductForm({ ...productForm, inventory: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. SS-DSK-01"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* Pricing (INR ₹) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MRP / Compare At Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={productForm.compareAtPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, compareAtPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Engaging product description highlighting ergonomic benefits..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Image Preset Picker + URL Input + File Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Product Images (URLs or Instant Curated Presets)
                  </label>
                  <label className="text-[11px] font-bold text-[#0B2545] hover:underline cursor-pointer">
                    <span>+ Upload File (PNG/JPEG/WebP)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Presets:</span>
                  {CURATED_IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProductForm((prev) => ({
                          ...prev,
                          imagesText: prev.imagesText ? `${prev.imagesText}\n${preset.url}` : preset.url,
                        }));
                        showToast(`Added ${preset.label} image`, 'info');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={productForm.imagesText}
                  onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                  placeholder="Paste image URLs (one per line)..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Key Features */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Features (one per line)
                </label>
                <textarea
                  rows={2}
                  value={productForm.featuresText}
                  onChange={(e) => setProductForm({ ...productForm, featuresText: e.target.value })}
                  placeholder="e.g. Aerospace grade aluminum build&#10;1-Year Warranty&#10;Express Pan-India Delivery"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={productForm.tagsText}
                  onChange={(e) => setProductForm({ ...productForm, tagsText: e.target.value })}
                  placeholder="Ergonomic, Workspace, SolveSpace, Trending"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0B2545] hover:bg-slate-900 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Product to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
