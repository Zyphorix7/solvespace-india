import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Product, CartItem, ProductVariant, PaymentSettings, Order, ProductReview } from '../types';
import {
  getProductsFromDb,
  getPaymentSettingsFromDb,
  savePaymentSettingsToDb,
  getOrdersFromDb,
  createOrderInDb,
  updateOrderStatusInDb,
  updateOrderExchangeInDb,
  quickUpdateStockInDb,
  seedSolveSpaceCatalog,
  seedInitialOrders,
  SAMPLE_SOLVESPACE_PRODUCTS,
  DEFAULT_PAYMENT_SETTINGS,
} from '../services/firestore';
import { INITIAL_REVIEWS } from '../data/reviews';

interface StoreContextType {
  products: Product[];
  isLoadingProducts: boolean;
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (newSettings: PaymentSettings) => Promise<void>;
  cart: CartItem[];
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  trackOrderModalOpen: boolean;
  setTrackOrderModalOpen: (open: boolean) => void;
  exchangePolicyModalOpen: boolean;
  setExchangePolicyModalOpen: (open: boolean) => void;
  setupBuilderOpen: boolean;
  setSetupBuilderOpen: (open: boolean) => void;
  
  // Admin state & security
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  closeAdmin: () => void;

  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  
  // Coupon & Promo System
  discountCode: string;
  discountPercent: number;
  discountFlat: number;
  isFreeShippingCoupon: boolean;
  applyDiscountCode: (code: string) => boolean;
  removeDiscountCode: () => void;
  
  // Cart Actions
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  volumeDiscountAmount: number;
  shippingFee: number;
  grandTotal: number;
  freeShippingProgress: number; // 0 to 100
  amountNeededForFreeShipping: number;
  
  // Orders
  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<string>;
  updateOrderStatus: (
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus'],
    trackingNumber?: string,
    courierName?: string
  ) => Promise<void>;
  quickUpdateStock: (productId: string, newInventory: number) => Promise<void>;
  requestOrderExchange: (orderId: string, reason: string, notes?: string) => Promise<void>;
  updateOrderExchangeStatus: (orderId: string, exchangeStatus: Order['exchangeStatus'], notes?: string) => Promise<void>;
  seedCatalog: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  
  // Reviews & Recently Viewed
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  recentlyViewedIds: string[];
  addRecentlyViewed: (id: string) => void;

  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  formatCurrency: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'solvespace_cart_v1';
const REVIEWS_STORAGE_KEY = 'solvespace_reviews_v1';
const RECENTLY_VIEWED_KEY = 'solvespace_recently_viewed_v1';
const ADMIN_AUTH_KEY = 'solvespace_admin_authenticated';
const ADMIN_PASSKEY = 'Solvespace1@%!';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // UI states
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [trackOrderModalOpen, setTrackOrderModalOpen] = useState(false);
  const [exchangePolicyModalOpen, setExchangePolicyModalOpen] = useState(false);
  const [setupBuilderOpen, setSetupBuilderOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Discounts
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFlat, setDiscountFlat] = useState(0);
  const [isFreeShippingCoupon, setIsFreeShippingCoupon] = useState(false);

  // Reviews & Recently Viewed
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart:', e);
    }
  }, [cart]);

  // Sync reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to sync reviews:', e);
    }
  }, [reviews]);

  // Sync recently viewed to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewedIds));
    } catch (e) {
      console.error('Failed to sync viewed items:', e);
    }
  }, [recentlyViewedIds]);

  // Add to recently viewed whenever a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setRecentlyViewedIds((prev) => {
        const filtered = prev.filter((id) => id !== selectedProduct.id);
        return [selectedProduct.id, ...filtered].slice(0, 10);
      });
    }
  }, [selectedProduct]);

  // URL Route Detection for Admin (/admin or #/admin or ?admin)
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
      const isAdminHash = hash === '#admin' || hash === '#/admin' || hash.startsWith('#/admin');
      const isAdminSearch = search.includes('admin=true') || search.includes('admin=1') || search.includes('admin');

      if (isAdminPath || isAdminHash || isAdminSearch) {
        setAdminOpen(true);
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Initial Database Load & Auto-seeding
  const loadData = async () => {
    setIsLoadingProducts(true);
    try {
      let [dbProducts, dbSettings, dbOrders] = await Promise.all([
        getProductsFromDb(),
        getPaymentSettingsFromDb(),
        getOrdersFromDb(),
      ]);

      let currentProducts = dbProducts;
      if (currentProducts.length === 0) {
        try {
          currentProducts = await seedSolveSpaceCatalog();
        } catch (err) {
          console.warn('Auto-seed products fallback:', err);
          currentProducts = SAMPLE_SOLVESPACE_PRODUCTS.map((p, idx) => ({ ...p, id: `seed_prod_${idx}` }));
        }
      }
      setProducts(currentProducts);
      setPaymentSettings(dbSettings);

      let currentOrders = dbOrders;
      if (currentOrders.length === 0) {
        try {
          currentOrders = await seedInitialOrders();
        } catch (err) {
          console.warn('Initial orders seed notice:', err);
        }
      }
      setOrders(currentOrders);
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshProducts = async () => {
    const list = await getProductsFromDb();
    setProducts(list);
  };

  const refreshOrders = async () => {
    const list = await getOrdersFromDb();
    setOrders(list);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Admin Auth Logic
  const loginAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSKEY) {
      try {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch (e) {
        console.warn('Session storage error:', e);
      }
      setIsAdminAuthenticated(true);
      showToast('Admin access authorized. Welcome back!', 'success');
      return true;
    }
    showToast('Invalid master passkey. Access denied.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (e) {
      console.warn('Session storage error:', e);
    }
    setIsAdminAuthenticated(false);
    setAdminOpen(false);
    closeAdminUrl();
    showToast('Logged out of SolveSpace Admin Console', 'info');
  };

  const closeAdmin = () => {
    setAdminOpen(false);
    closeAdminUrl();
  };

  const closeAdminUrl = () => {
    if (window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    } else if (window.location.hash.toLowerCase().includes('admin')) {
      window.location.hash = '';
    }
  };

  // Cart operations
  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      const unitPrice = variant?.price ?? product.price;

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { product, variant, quantity, selectedPrice: unitPrice }];
    });

    showToast(`Added "${product.title}" to cart!`, 'success');
    setCartDrawerOpen(true);
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const next = [...prev];
      next[index].quantity = quantity;
      return next;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Promo Code Engine (Shopify & Plusbase style)
  const applyDiscountCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'WELCOME10') {
      setDiscountCode('WELCOME10');
      setDiscountPercent(10);
      setDiscountFlat(0);
      setIsFreeShippingCoupon(false);
      showToast('🎉 Coupon WELCOME10 applied! 10% discount added.', 'success');
      return true;
    } else if (clean === 'SOLVE500') {
      if (subtotal < 2499) {
        showToast('SOLVE500 requires a minimum order value of ₹2,499', 'error');
        return false;
      }
      setDiscountCode('SOLVE500');
      setDiscountPercent(0);
      setDiscountFlat(500);
      setIsFreeShippingCoupon(false);
      showToast('🎉 Coupon SOLVE500 applied! Flat ₹500 off order.', 'success');
      return true;
    } else if (clean === 'FESTIVE15') {
      setDiscountCode('FESTIVE15');
      setDiscountPercent(15);
      setDiscountFlat(0);
      setIsFreeShippingCoupon(false);
      showToast('🎉 Festive code FESTIVE15 applied! 15% discount added.', 'success');
      return true;
    } else if (clean === 'FREESHIP') {
      setDiscountCode('FREESHIP');
      setDiscountPercent(0);
      setDiscountFlat(0);
      setIsFreeShippingCoupon(true);
      showToast('🎉 Coupon FREESHIP applied! Free express delivery unlocked.', 'success');
      return true;
    } else if (clean === 'FIRSTBUY' || clean === 'SOLVE10') {
      setDiscountCode(clean);
      setDiscountPercent(15);
      setDiscountFlat(0);
      setIsFreeShippingCoupon(false);
      showToast(`🎉 Code ${clean} applied! 15% discount added.`, 'success');
      return true;
    }

    showToast('Invalid discount code. Please check and try again.', 'error');
    return false;
  };

  const removeDiscountCode = () => {
    setDiscountCode('');
    setDiscountPercent(0);
    setDiscountFlat(0);
    setIsFreeShippingCoupon(false);
    showToast('Coupon removed', 'info');
  };

  const updatePaymentSettings = async (newSettings: PaymentSettings) => {
    setPaymentSettings(newSettings);
    await savePaymentSettingsToDb(newSettings);
    showToast('Payment gateway configuration saved!', 'success');
  };

  const seedCatalog = async () => {
    setIsLoadingProducts(true);
    try {
      const added = await seedSolveSpaceCatalog();
      setProducts(added);
      showToast('Catalog seeded with 5 premium SolveSpace solutions!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to seed catalog', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const placeOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>
  ): Promise<string> => {
    const orderNumber = `SS-IN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Omit<Order, 'id'> = {
      ...orderData,
      orderNumber,
      createdAt: new Date().toISOString(),
      orderStatus: 'pending',
      exchangeStatus: 'none',
      courierName: orderData.courierName || 'Delhivery Express',
      estimatedDeliveryDate: orderData.estimatedDeliveryDate || '3-5 business days',
    };

    const docId = await createOrderInDb(newOrder);

    // Decrement inventory in state and Firestore
    for (const item of orderData.items) {
      const targetProd = products.find((p) => p.id === item.productId);
      if (targetProd) {
        const newStock = Math.max(0, targetProd.inventory - item.quantity);
        quickUpdateStockInDb(targetProd.id, newStock).catch(console.error);
        setProducts((prev) =>
          prev.map((p) => (p.id === targetProd.id ? { ...p, inventory: newStock } : p))
        );
      }
    }

    clearCart();
    removeDiscountCode();
    await refreshOrders();
    return orderNumber;
  };

  const updateOrderStatus = async (
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus'],
    trackingNumber?: string,
    courierName?: string
  ) => {
    await updateOrderStatusInDb(orderId, orderStatus, paymentStatus, trackingNumber, courierName);
    await refreshOrders();
    showToast(`Order status updated to ${orderStatus}`, 'success');
  };

  const quickUpdateStock = async (productId: string, newInventory: number) => {
    const sanitized = Math.max(0, newInventory);
    await quickUpdateStockInDb(productId, sanitized);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inventory: sanitized } : p))
    );
    showToast('Inventory updated', 'success');
  };

  const requestOrderExchange = async (
    orderId: string,
    reason: string,
    notes?: string
  ) => {
    await updateOrderExchangeInDb(orderId, 'requested', reason, notes);
    await refreshOrders();
    showToast('Exchange request submitted! Only product exchange accepted.', 'success');
  };

  const updateOrderExchangeStatus = async (
    orderId: string,
    exchangeStatus: Order['exchangeStatus'],
    notes?: string
  ) => {
    await updateOrderExchangeInDb(orderId, exchangeStatus, undefined, notes);
    await refreshOrders();
    showToast(`Order exchange status updated to ${exchangeStatus}`, 'success');
  };

  // Reviews
  const addReview = (newRevData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const newRev: ProductReview = {
      ...newRevData,
      id: `rev_${Date.now()}`,
      createdAt: 'Just now',
    };
    setReviews((prev) => [newRev, ...prev]);
  };

  const addRecentlyViewed = (id: string) => {
    setRecentlyViewedIds((prev) => [id, ...prev.filter((i) => i !== id)].slice(0, 10));
  };

  // Cart totals calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.selectedPrice * item.quantity, 0);
  }, [cart]);

  // Volume Tier Bundle Discount (Shopify/Plusbase style: Buy 2 Save 10%, Buy 3+ Save 15%)
  const volumeDiscountAmount = useMemo(() => {
    if (cartCount >= 3) {
      return Math.round(subtotal * 0.15);
    } else if (cartCount >= 2) {
      return Math.round(subtotal * 0.10);
    }
    return 0;
  }, [cartCount, subtotal]);

  // Coupon Discount Calculation
  const discountAmount = useMemo(() => {
    let amount = 0;
    if (discountPercent > 0) {
      amount += Math.round((subtotal * discountPercent) / 100);
    }
    if (discountFlat > 0) {
      amount += discountFlat;
    }
    // Combine with volume savings if coupon is not higher
    return Math.max(amount, volumeDiscountAmount);
  }, [subtotal, discountPercent, discountFlat, volumeDiscountAmount]);

  const freeShippingThreshold = paymentSettings.freeShippingThreshold || 999;
  const standardShippingFee = paymentSettings.standardShippingFee || 99;

  const isFreeShipping = subtotal >= freeShippingThreshold || isFreeShippingCoupon;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : standardShippingFee;

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const freeShippingProgress = useMemo(() => {
    if (subtotal >= freeShippingThreshold || isFreeShippingCoupon) return 100;
    return Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  }, [subtotal, freeShippingThreshold, isFreeShippingCoupon]);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        isLoadingProducts,
        paymentSettings,
        updatePaymentSettings,
        cart,
        cartDrawerOpen,
        setCartDrawerOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
        trackOrderModalOpen,
        setTrackOrderModalOpen,
        exchangePolicyModalOpen,
        setExchangePolicyModalOpen,
        setupBuilderOpen,
        setSetupBuilderOpen,
        adminOpen,
        setAdminOpen,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        closeAdmin,
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        discountCode,
        discountPercent,
        discountFlat,
        isFreeShippingCoupon,
        applyDiscountCode,
        removeDiscountCode,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        discountAmount,
        volumeDiscountAmount,
        shippingFee,
        grandTotal,
        freeShippingProgress,
        amountNeededForFreeShipping,
        orders,
        placeOrder,
        updateOrderStatus,
        quickUpdateStock,
        requestOrderExchange,
        updateOrderExchangeStatus,
        seedCatalog,
        refreshProducts,
        refreshOrders,
        reviews,
        addReview,
        recentlyViewedIds,
        addRecentlyViewed,
        showToast,
        toast,
        formatCurrency,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
};
