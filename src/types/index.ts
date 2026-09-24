export interface ProductVariant {
  id: string;
  name: string; // e.g. "Space Black / 256GB" or "Pack of 2"
  price: number;
  compareAtPrice?: number;
  sku: string;
  inventory: number;
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  inventory: number;
  sku?: string;
  rating: number;
  reviewCount: number;
  tags?: string[];
  features?: string[];
  variants?: ProductVariant[];
  createdAt?: string;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selectedPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  city: string;
  state: string;
  landmark?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cashfree' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cod_pending';

export interface OrderItem {
  productId: string;
  productTitle: string;
  variantName?: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
  exchangeStatus?: 'none' | 'requested' | 'approved' | 'in_transit' | 'dispatched' | 'completed' | 'rejected';
  exchangeReason?: string;
  exchangeNotes?: string;
  notes?: string;
  createdAt: string;
  userId?: string;
}

export interface PaymentSettings {
  cashfreeEnabled: boolean;
  codEnabled: boolean;
  freeShippingThreshold: number; // default 999
  standardShippingFee: number; // default 99
  storeCurrency: string; // default INR
  minDeliveryDays?: number; // default 3
  maxDeliveryDays?: number; // default 6
  cashfreeAppId?: string;
  cashfreeSecretKey?: string;
  cashfreeEnv?: 'sandbox' | 'production';
}

export interface PincodeServiceability {
  pincode: string;
  serviceable: boolean;
  city: string;
  state: string;
  zone: string;
  deliveryDays: string;
  estimatedDeliveryDate?: string;
  codAvailable: boolean;
  expressDelivery: boolean;
  message?: string;
}

export interface AIInsight {
  title: string;
  category: 'inventory' | 'cro' | 'revenue' | 'marketing';
  type: 'opportunity' | 'warning' | 'tip';
  impact: 'high' | 'medium' | 'low';
  description: string;
  actionableStep: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedBuyer: boolean;
}

export interface CouponRule {
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minOrderValue?: number;
  description: string;
}
