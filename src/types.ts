export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  originalPrice?: number;
  hasDiscount?: boolean;
  originBadge?: string;
  brand: string;
  category: string;
  subcategory?: string;
  image: string;
  images?: string[];
  description: string;
  subtitle?: string;
  features: string[];
  usage: string;
  directions: string[];
  certifications?: string;
  volume?: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  brands: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Distributor {
  id: string;
  city: string;
  area: string;
  phone: string;
  address: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  country: string;
  shippingCost: number;
  supportPhone: string;
  whatsappPhone: string;
  workingHours: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface DatabaseConfig {
  dbHost: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
  apiEndpoint: string;
  isConfigured: boolean;
  connectedAt?: string;
  autoSync: boolean;
}

export interface DatabaseStatus {
  isConnected: boolean;
  isChecking: boolean;
  message: string;
  dbVersion?: string;
  tablesFound?: string[];
  latencyMs?: number;
  lastChecked?: string;
  errorMessage?: string;
}

