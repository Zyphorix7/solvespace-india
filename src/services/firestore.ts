import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Product, Order, PaymentSettings } from '../types';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cashfreeEnabled: true,
  codEnabled: true,
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  storeCurrency: 'INR',
};

// Curated SolveSpace India collection - Wireless Electric Mini Food Chopper
export const SAMPLE_SOLVESPACE_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    title: 'Wireless Electric Mini Food Chopper & Garlic Mincer',
    subtitle: 'Cordless Portable USB Rechargeable Vegetable & Food Processor (Black Top & Clear Bowl)',
    price: 899,
    compareAtPrice: 1499,
    description: 'Say goodbye to teary eyes, smelly hands, and tedious manual chopping. The SolveSpace™ Wireless Electric Mini Food Chopper & Garlic Mincer packs heavy-duty mincing power into a sleek, portable cordless design. Driven by a high-torque 30W motor and razor-sharp 304 food-grade stainless steel multi-layer blades, it delivers freshly minced garlic, onions, ginger, chilies, herbs, nuts, and infant baby food purees with effortless one-touch operation in under 10 seconds. Completely wireless and USB rechargeable with an IPX6 waterproof detachable body for instant tap water rinsing.',
    images: [
      '/products/Screenshot_20260901_134903_Meesho.jpg',
      '/products/1788250324092.png',
      '/products/chopper-blades-precision.jpg',
      '/products/chopper-cordless-motor.jpg',
      '/products/chopper-washable-cleaning.jpg',
    ],
    imageDetails: [
      {
        url: '/products/Screenshot_20260901_134903_Meesho.jpg',
        label: 'Flagship Overview',
        badge: 'Assembled',
        description: 'Wireless mini chopper assembled with 250ml bowl and garlic mincer'
      },
      {
        url: '/products/1788250324092.png',
        label: 'Modular Architecture',
        badge: '4 Detachable Parts',
        description: 'Complete breakdown of motor head, splash isolation lid, 3-blade unit, and bowl'
      },
      {
        url: '/products/chopper-blades-precision.jpg',
        label: '304 Stainless Steel Blades',
        badge: 'Triple Razor Cut',
        description: 'Food-grade multi-angle cyclone mincing with splash isolation disc'
      },
      {
        url: '/products/chopper-cordless-motor.jpg',
        label: 'Cordless USB Motor Head',
        badge: 'High-Torque 30W',
        description: 'One-touch pulse operation with waterproof silicone sealed USB-C charging port'
      },
      {
        url: '/products/chopper-washable-cleaning.jpg',
        label: '5-Second Tap Rinsing',
        badge: 'IPX6 Detachable',
        description: 'Instant water washable components with zero food trap design'
      },
    ],
    category: 'Kitchen & Home',
    inventory: 50,
    sku: 'SS-CHOP-01',
    rating: 4.92,
    reviewCount: 186,
    isFeatured: true,
    tags: ['Best Seller', 'Cordless', 'USB Rechargeable', 'One-Touch Pulse', '304 Stainless Steel', 'BPA Free'],
    features: [
      '⚡ Cordless & USB Rechargeable: High-capacity lithium battery powers 35+ chopping sessions on a single 2-hour charge',
      '🔘 One-Touch Ergonomic Pulse Operation: Press top button to pulse, release to stop instant consistency control',
      '🔪 Triple-Layer 304 Stainless Steel Blades: S-shaped razor-sharp blades mince garlic, onions, chili, ginger, and nuts in 5–10 seconds',
      '🥣 100% Food-Grade BPA-Free 250ml Bowl: Safe for infant baby food, purees, pestos, salad dressings, and Indian gravies',
      '💧 IPX6 Waterproof Detachable Design: Motor, container bowl, and blades separate for effortless 5-second tap water rinsing',
      '🪶 Ultra-Compact & Portable: Minimalist space-saving footprint fits effortlessly in any kitchen drawer or travel bag',
    ],
    variants: [
      { id: 'v1', name: 'Stealth Matte Black (250ml Bowl)', price: 899, compareAtPrice: 1499, sku: 'SS-CHOP-BLK-250', inventory: 50, image: '/products/Screenshot_20260901_134903_Meesho.jpg' },
    ],
  },
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo:
        auth?.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Network timeout helper to prevent offline or slow iframe handshakes from blocking app
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Product operations
export async function getProductsFromDb(): Promise<Product[]> {
  const path = 'products';
  try {
    const productsCol = collection(db, path);
    const snapshot = await withTimeout(getDocs(productsCol), 6000);
    const list: Product[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function addProductToDb(product: Omit<Product, 'id'>): Promise<string> {
  const path = 'products';
  try {
    const productsCol = collection(db, path);
    const docRef = await addDoc(productsCol, {
      ...product,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

export async function updateProductInDb(id: string, updates: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}

// Payment Settings
export async function getPaymentSettingsFromDb(): Promise<PaymentSettings> {
  const path = 'settings/payments';
  try {
    const docRef = doc(db, 'settings', 'payments');
    const snap = await withTimeout(getDoc(docRef), 6000);
    if (snap.exists()) {
      return snap.data() as PaymentSettings;
    }
    return DEFAULT_PAYMENT_SETTINGS;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export async function savePaymentSettingsToDb(settings: PaymentSettings): Promise<void> {
  const path = 'settings/payments';
  try {
    const docRef = doc(db, 'settings', 'payments');
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// Orders
export async function getOrdersFromDb(): Promise<Order[]> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, path);
    const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await withTimeout(getDocs(q), 6000);
    const list: Order[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function createOrderInDb(orderData: Omit<Order, 'id'>): Promise<string> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, path);
    const docRef = await addDoc(ordersCol, {
      ...orderData,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

export const SAMPLE_INITIAL_ORDERS: Omit<Order, 'id'>[] = [
  {
    orderNumber: 'SS-IN-984210',
    customer: {
      fullName: 'Priyanka Sen',
      phoneNumber: '+91 98765 43210',
      email: 'priyanka.sen@example.com',
      addressLine1: 'Flat 402, Prestige Tower, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      landmark: 'Near Metro Station',
    },
    items: [
      {
        productId: 'chopper_main_prod',
        productTitle: 'Wireless Electric Mini Food Chopper & Garlic Mincer',
        variantName: 'Stealth Matte Black (250ml Bowl)',
        quantity: 1,
        price: 899,
        image: '/products/Screenshot_20260901_134903_Meesho.jpg',
      },
    ],
    subtotal: 899,
    discount: 0,
    shippingFee: 99,
    totalAmount: 998,
    paymentMethod: 'cashfree',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    trackingNumber: 'DEL10982348IN',
    courierName: 'Delhivery Surface',
    estimatedDeliveryDate: 'Delivered',
    exchangeStatus: 'none',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderNumber: 'SS-IN-984211',
    customer: {
      fullName: 'Pooja Iyer',
      phoneNumber: '+91 98234 56789',
      email: 'pooja.iyer@example.com',
      addressLine1: '12-B, Marine View Apartments, Worli',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400018',
    },
    items: [
      {
        productId: 'chopper_main_prod',
        productTitle: 'Wireless Electric Mini Food Chopper & Garlic Mincer',
        variantName: 'Stealth Matte Black (250ml Bowl)',
        quantity: 1,
        price: 899,
        image: '/products/1788250324092.png',
      },
    ],
    subtotal: 899,
    discount: 0,
    shippingFee: 0,
    totalAmount: 899,
    paymentMethod: 'cashfree',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    trackingNumber: 'BD74829103IN',
    courierName: 'Blue Dart Air Express',
    estimatedDeliveryDate: 'Tomorrow by 2:00 PM',
    exchangeStatus: 'none',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderNumber: 'SS-IN-984212',
    customer: {
      fullName: 'Vikram Malhotra',
      phoneNumber: '+91 97112 33445',
      email: 'vikram.m@example.com',
      addressLine1: 'Villa 14, DLF Phase 5, Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
    },
    items: [
      {
        productId: 'chopper_main_prod',
        productTitle: 'Wireless Electric Mini Food Chopper & Garlic Mincer',
        variantName: 'Stealth Matte Black (250ml Bowl)',
        quantity: 2,
        price: 899,
        image: '/products/Screenshot_20260901_134903_Meesho.jpg',
      },
    ],
    subtotal: 1798,
    discount: 180,
    shippingFee: 0,
    totalAmount: 1618,
    paymentMethod: 'cod',
    paymentStatus: 'cod_pending',
    orderStatus: 'processing',
    estimatedDeliveryDate: '2-3 Business Days',
    exchangeStatus: 'none',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export async function updateOrderStatusInDb(
  orderId: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus'],
  trackingNumber?: string,
  courierName?: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    const payload: any = { orderStatus };
    if (paymentStatus) payload.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
    if (courierName !== undefined) payload.courierName = courierName;
    await updateDoc(docRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

export async function updateOrderExchangeInDb(
  orderId: string,
  exchangeStatus: Order['exchangeStatus'],
  exchangeReason?: string,
  exchangeNotes?: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    const payload: any = {
      exchangeStatus,
      exchangeUpdatedAt: new Date().toISOString(),
    };
    if (exchangeReason !== undefined) payload.exchangeReason = exchangeReason;
    if (exchangeNotes !== undefined) payload.exchangeNotes = exchangeNotes;
    await updateDoc(docRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

// Quick Stock Update helper
export async function quickUpdateStockInDb(productId: string, newInventory: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, { inventory: Math.max(0, newInventory) });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

// Helper to seed initial sample catalog
export async function seedSolveSpaceCatalog(): Promise<Product[]> {
  const added: Product[] = [];
  for (const item of SAMPLE_SOLVESPACE_PRODUCTS) {
    const id = await addProductToDb(item);
    added.push({ id, ...item });
  }
  return added;
}

// Helper to seed sample orders
export async function seedInitialOrders(): Promise<Order[]> {
  const added: Order[] = [];
  for (const item of SAMPLE_INITIAL_ORDERS) {
    const id = await createOrderInDb(item);
    added.push({ id, ...item });
  }
  return added;
}

// Purge all existing products from Firestore
export async function purgeAllProductsFromDb(): Promise<void> {
  try {
    const productsCol = collection(db, 'products');
    const snapshot = await withTimeout(getDocs(productsCol), 10000);
    const deletePromises = snapshot.docs.map((docSnap) => withTimeout(deleteDoc(doc(db, 'products', docSnap.id)), 5000));
    await Promise.allSettled(deletePromises);
  } catch (err) {
    console.warn('Error purging products from Firestore:', err);
  }
}

// Purge all orders from Firestore
export async function purgeAllOrdersFromDb(): Promise<void> {
  try {
    const ordersCol = collection(db, 'orders');
    const snapshot = await withTimeout(getDocs(ordersCol), 10000);
    const deletePromises = snapshot.docs.map((docSnap) => withTimeout(deleteDoc(doc(db, 'orders', docSnap.id)), 5000));
    await Promise.allSettled(deletePromises);
  } catch (err) {
    console.warn('Error purging orders from Firestore:', err);
  }
}

// Complete Purge & Reset: Purges all old demo products & mock analysis, then sets the new Chopper product
export async function purgeAllDataAndSeedChopper(): Promise<{ products: Product[]; orders: Order[] }> {
  await purgeAllProductsFromDb();
  await purgeAllOrdersFromDb();
  const products = await seedSolveSpaceCatalog();
  const orders = await seedInitialOrders();
  return { products, orders };
}

