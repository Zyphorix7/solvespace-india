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
import { db } from '../firebase/config';
import { Product, Order, PaymentSettings } from '../types';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cashfreeEnabled: true,
  codEnabled: true,
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  storeCurrency: 'INR',
};

// Curated high-converting SolveSpace India collection (used when owner clicks "Seed Initial Catalog" in Admin)
export const SAMPLE_SOLVESPACE_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    title: 'SolveSpace UltraDesk™ Ergonomic Desk Organizer',
    subtitle: 'Modular Aerospace Aluminum Cable & Gadget Dock',
    price: 1899,
    compareAtPrice: 2999,
    description: 'Transform your desktop into an elevated, clutter-free productivity zone. Engineered from precision-milled aerospace aluminum with integrated high-speed 65W GaN charging pass-through, magnetic cable tidies, and velvet anti-scratch lining.',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'Desk & Workspace',
    inventory: 35,
    sku: 'SS-DSK-01',
    rating: 4.9,
    reviewCount: 142,
    isFeatured: true,
    tags: ['Best Seller', 'Ergonomic', 'Desk Setup', 'Made For India'],
    features: [
      'Crafted with CNC milled anodized matte aluminium',
      'Integrated magnetic cable docking ports',
      'Silicone base pads with zero desk scratching',
      '1 Year SolveSpace India Hassle-Free Replacement Warranty',
    ],
    variants: [
      { id: 'v1', name: 'Space Grey / Standard', price: 1899, compareAtPrice: 2999, sku: 'SS-DSK-01-GRY', inventory: 20 },
      { id: 'v2', name: 'Matte Stealth Black', price: 1999, compareAtPrice: 3199, sku: 'SS-DSK-01-BLK', inventory: 15 },
    ],
  },
  {
    title: 'SolveSpace AirPure™ Desktop HEPA Ionic Purifier',
    subtitle: 'Whisper-Quiet 360° Air Cleanser with Aromatherapy Chamber',
    price: 3499,
    compareAtPrice: 4999,
    description: 'Combat high Indian AQI and urban pollutants right where you breathe. Features true H13 Medical Grade HEPA filtration capturing 99.97% of airborne PM2.5, dust, allergens, and VOCs with whisper-quiet 22dB acoustics.',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'Home & Wellness',
    inventory: 18,
    sku: 'SS-AIR-02',
    rating: 4.8,
    reviewCount: 98,
    isFeatured: true,
    tags: ['Clean Air', 'H13 HEPA', 'Low Power', 'Trending'],
    features: [
      'True Medical-Grade H13 HEPA 3-Stage Filtration',
      'Covers up to 180 sq.ft personal workstation zone',
      'Real-time ambient air quality LED indicator ring',
      'USB-C powered with ultra-low 5W energy consumption',
    ],
    variants: [
      { id: 'v3', name: 'Ceramic White', price: 3499, compareAtPrice: 4999, sku: 'SS-AIR-02-WHT', inventory: 12 },
      { id: 'v4', name: 'Midnight Navy', price: 3599, compareAtPrice: 5199, sku: 'SS-AIR-02-NVY', inventory: 6 },
    ],
  },
  {
    title: 'SolveSpace SwiftVolt™ 100W GaN Travel Charger',
    subtitle: '4-Port Smart Fast Charging Powerhouse with India Plug',
    price: 2499,
    compareAtPrice: 3999,
    description: 'The single charger that replaces all your bricks. Powers 2 laptops, a smartphone, and earbuds simultaneously with cutting-edge Gallium Nitride (GaN III) architecture that remains remarkably cool and compact.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1609592426508-cc15f187a550?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'Tech & Mobility',
    inventory: 4, // Intentionally low stock to demonstrate low-stock alert in admin
    sku: 'SS-GAN-03',
    rating: 4.95,
    reviewCount: 215,
    isFeatured: true,
    tags: ['Fast Charging', '100W GaN', 'BIS Certified'],
    features: [
      '100W Max Delivery via USB-PD 3.0 & PPS fast protocols',
      'Foldable standard Type-D/C Indian plug design',
      'Over-voltage and surge-protected for Indian grid fluctuations',
      'Charges MacBook Pro 16" to 50% in just 32 minutes',
    ],
    variants: [
      { id: 'v5', name: 'Space Black', price: 2499, compareAtPrice: 3999, sku: 'SS-GAN-03-BLK', inventory: 4 },
    ],
  },
  {
    title: 'SolveSpace Lumina™ Smart Monitor ScreenBar',
    subtitle: 'Anti-Glare Asymmetric Eye-Care Desk Lamp with Wireless Dial',
    price: 2799,
    compareAtPrice: 4499,
    description: 'Zero screen reflection and zero eye fatigue during late-night work sessions. Features asymmetric optical design illuminating your workspace rather than the monitor screen, with stepless color temperature adjustment (2700K - 6500K).',
    images: [
      'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'Desk & Workspace',
    inventory: 24,
    sku: 'SS-SCR-04',
    rating: 4.88,
    reviewCount: 86,
    isFeatured: false,
    tags: ['Eye Care', 'ScreenBar', 'Smart Lighting'],
    features: [
      'Asymmetric 45° angled beam prevents screen glare',
      'Wireless desktop rotary control puck for brightness/temp',
      'High CRI > 95 for true natural color reproduction',
      'Auto-dimming ambient light sensor built-in',
    ],
  },
  {
    title: 'SolveSpace Nomad™ Waterproof Tech Sling Bag',
    subtitle: 'Cordura® Ballistic Fabric with RFID Shield Pocket',
    price: 2199,
    compareAtPrice: 3499,
    description: 'Designed for the modern commuter navigating Indian monsoons and crowded transits. Features waterproof YKK AquaGuard zippers, magnetic quick-release fidlock buckle, padded iPad sleeve, and hidden passport security pocket.',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80',
    ],
    category: 'Tech & Mobility',
    inventory: 3, // Low stock demo
    sku: 'SS-SLG-05',
    rating: 4.92,
    reviewCount: 64,
    isFeatured: false,
    tags: ['Waterproof', 'Cordura', 'Travel Essential'],
    features: [
      'Military-grade 1000D Cordura® weather-resistant exterior',
      'Magnetic German Fidlock® V-buckle for rapid strap release',
      'Dedicated plush tablet sleeve fits up to 11" iPad Pro',
      'Ergonomic breathable back panel for hot climates',
    ],
  },
];

// Product operations
export async function getProductsFromDb(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    const list: Product[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
    });
    return list;
  } catch (err) {
    console.warn('Firestore fetch error or offline, fallback to empty array:', err);
    return [];
  }
}

export async function addProductToDb(product: Omit<Product, 'id'>): Promise<string> {
  const productsCol = collection(db, 'products');
  const docRef = await addDoc(productsCol, {
    ...product,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateProductInDb(id: string, updates: Partial<Product>): Promise<void> {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, updates);
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
}

// Payment Settings
export async function getPaymentSettingsFromDb(): Promise<PaymentSettings> {
  try {
    const docRef = doc(db, 'settings', 'payments');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PaymentSettings;
    }
    // Return default settings
    return DEFAULT_PAYMENT_SETTINGS;
  } catch (err) {
    console.warn('Error fetching payment settings from db, using defaults:', err);
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export async function savePaymentSettingsToDb(settings: PaymentSettings): Promise<void> {
  const docRef = doc(db, 'settings', 'payments');
  await setDoc(docRef, settings, { merge: true });
}

// Orders
export async function getOrdersFromDb(): Promise<Order[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    const list: Order[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
    });
    return list;
  } catch (err) {
    console.warn('Error fetching orders from db:', err);
    return [];
  }
}

export async function createOrderInDb(orderData: Omit<Order, 'id'>): Promise<string> {
  const ordersCol = collection(db, 'orders');
  const docRef = await addDoc(ordersCol, {
    ...orderData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export const SAMPLE_INITIAL_ORDERS: Omit<Order, 'id'>[] = [
  {
    orderNumber: 'SS-IN-984210',
    customer: {
      fullName: 'Rahul Sharma',
      phoneNumber: '+91 98765 43210',
      email: 'rahul.s@example.com',
      addressLine1: 'Flat 402, Prestige Tower, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      landmark: 'Near Metro Station',
    },
    items: [
      {
        productId: 'sample_1',
        productTitle: 'SolveSpace UltraDesk™ Ergonomic Desk Organizer',
        variantName: 'Space Grey / Standard',
        quantity: 1,
        price: 1899,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 1899,
    discount: 0,
    shippingFee: 0,
    totalAmount: 1899,
    paymentMethod: 'cashfree',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    trackingNumber: 'DEL10982348IN',
    courierName: 'Delhivery Surface',
    estimatedDeliveryDate: 'Delivered',
    exchangeStatus: 'requested',
    exchangeReason: 'Requested exchange for Matte Stealth Black variant',
    exchangeNotes: 'Customer contacted support. Product seal intact.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
        productId: 'sample_2',
        productTitle: 'SolveSpace SwiftVolt™ 100W GaN Travel Charger',
        variantName: 'Space Black',
        quantity: 1,
        price: 2499,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 2499,
    discount: 250,
    shippingFee: 0,
    totalAmount: 2249,
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
        productId: 'sample_3',
        productTitle: 'SolveSpace AirPure™ Desktop HEPA Ionic Purifier',
        variantName: 'Ceramic White',
        quantity: 1,
        price: 3499,
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=80',
      },
      {
        productId: 'sample_1',
        productTitle: 'SolveSpace UltraDesk™ Ergonomic Desk Organizer',
        variantName: 'Matte Stealth Black',
        quantity: 1,
        price: 1999,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    subtotal: 5498,
    discount: 500,
    shippingFee: 0,
    totalAmount: 4998,
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
  const docRef = doc(db, 'orders', orderId);
  const payload: any = { orderStatus };
  if (paymentStatus) payload.paymentStatus = paymentStatus;
  if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
  if (courierName !== undefined) payload.courierName = courierName;
  await updateDoc(docRef, payload);
}

export async function updateOrderExchangeInDb(
  orderId: string,
  exchangeStatus: Order['exchangeStatus'],
  exchangeReason?: string,
  exchangeNotes?: string
): Promise<void> {
  const docRef = doc(db, 'orders', orderId);
  const payload: any = {
    exchangeStatus,
    exchangeUpdatedAt: new Date().toISOString(),
  };
  if (exchangeReason !== undefined) payload.exchangeReason = exchangeReason;
  if (exchangeNotes !== undefined) payload.exchangeNotes = exchangeNotes;
  await updateDoc(docRef, payload);
}

// Quick Stock Update helper
export async function quickUpdateStockInDb(productId: string, newInventory: number): Promise<void> {
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, { inventory: Math.max(0, newInventory) });
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
