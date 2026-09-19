import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Distributor, StoreSettings, AdminCredentials, DatabaseConfig } from './types';
import { ALL_INITIAL_PRODUCTS, MAIN_PRODUCT, RELATED_PRODUCTS, CATEGORIES, RZ_OFFICIAL_FALLBACK_LOGO } from './data/products';
import { JORDAN_OFFICIAL_CATALOG } from './data/jordanCatalog';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ProductDetail } from './components/ProductDetail';
import { RelatedProducts } from './components/RelatedProducts';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { LoginModal } from './components/LoginModal';
import { DistributorsModal } from './components/DistributorsModal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { FloatingWidgets } from './components/FloatingWidgets';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminPanel } from './components/AdminPanel';
import { DatabaseSetupModal } from './components/DatabaseSetupModal';
import { 
  getSavedDbConfig, 
  checkServerDbStatus, 
  saveOrderToDatabase, 
  clearRemoteProducts, 
  clearRemoteOrders,
  saveAdminCredentialsToDatabase,
  fetchAdminCredentialsFromDatabase,
  saveProductToDatabase,
  deleteProductFromDatabase,
  saveStoreSettingsToDatabase,
  fetchStoreSettingsFromDatabase,
  fetchProductsFromDatabase,
  syncLocalDataToDatabase,
  saveDistributorToDatabase,
  deleteDistributorFromDatabase,
  fetchDistributorsFromDatabase,
  fetchOrdersFromDatabase,
  updateOrderStatusInDatabase,
  deleteOrderFromDatabase,
  updateProductPriceInDatabase,
  toggleProductStockInDatabase
} from './services/databaseService';
import { Check, ShieldCheck, LogOut } from 'lucide-react';

const INITIAL_ADMIN_CREDS: AdminCredentials = {
  username: 'admin',
  password: 'admin123'
};

const INITIAL_DISTRIBUTORS: Distributor[] = [
  { id: '1', city: 'عمان', area: 'خلدا، شارع مكة، وبيادر وادي السير', phone: '0791000001', address: 'مركز خدمة وتوزيع رزويل المعتمد' },
  { id: '2', city: 'إربد', area: 'شارع الهاشمي والحي الشرقي', phone: '0791000002', address: 'موزع معتمد - محطات خدمة وصيانة' },
  { id: '3', city: 'الزرقاء', area: 'الزرقاء الجديدة والمنطقة الحرفية', phone: '0791000003', address: 'مركز قطع غيار وزيوت المحركات الألمانية' },
  { id: '4', city: 'العقبة', area: 'المنطقة التجارية والمنطقة الاقتصادية الخاصة', phone: '0791000004', address: 'موزع إقليمي معتمد لجنوب المملكة' }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'RZ-849201',
    customerName: 'طارق المجالي',
    phone: '0795543210',
    city: 'عمان',
    address: 'دابوق - قرب مجمع الملك حسين للأعمال',
    notes: 'يرجى الاتصال قبل الوصول بنصف ساعة',
    items: [
      {
        productId: '7612',
        productName: 'رزويل RZ21G منظف لدوره البنزين 5x1',
        productCode: '1050070',
        quantity: 2,
        price: 12.5
      }
    ],
    subtotal: 25,
    shippingCost: 3,
    grandTotal: 28,
    status: 'processing',
    createdAt: '2026/04/10 11:30 ص'
  },
  {
    id: 'ord-102',
    orderNumber: 'RZ-519302',
    customerName: 'أحمد الروسان',
    phone: '0788123456',
    city: 'إربد',
    address: 'شارع الجامعة - قرب إشارة الإسكان',
    items: [
      {
        productId: '7613',
        productName: 'رزويل RZ20E معالج ومحسن أداء زيت المحرك',
        productCode: '1050071',
        quantity: 1,
        price: 11.5
      },
      {
        productId: '7615',
        productName: 'رزويل RZ22G منظف دورة حقن الوقود',
        productCode: '1050073',
        quantity: 1,
        price: 10
      }
    ],
    subtotal: 21.5,
    shippingCost: 3,
    grandTotal: 24.5,
    status: 'pending',
    createdAt: '2026/04/11 09:15 ص'
  },
  {
    id: 'ord-103',
    orderNumber: 'RZ-392011',
    customerName: 'عمر القضاة',
    phone: '0777987654',
    city: 'الزرقاء',
    address: 'الزرقاء الجديدة - شارع 36',
    items: [
      {
        productId: '7614',
        productName: 'رزويل RZ26E غسيل وتنظيف المحرك الداخلي',
        productCode: '1050072',
        quantity: 1,
        price: 9.5
      }
    ],
    subtotal: 9.5,
    shippingCost: 3,
    grandTotal: 12.5,
    status: 'delivered',
    createdAt: '2026/04/08 04:45 م'
  }
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'متجر رزويل الأردن - الوكيل والموزع المعتمد',
  currency: 'دينار أردني (د.أ / JOD)',
  country: 'المملكة الأردنية الهاشمية',
  shippingCost: 3,
  supportPhone: '+962 7 9100 0001',
  whatsappPhone: '+962 7 9100 0001',
  workingHours: 'يومياً من 9:00 صباحاً حتى 9:00 مساءً (السبت - الخميس)'
};

// Helper to guarantee completely unique product IDs, proper images, and deduplicated catalog
function sanitizeProductCatalog(products: Product[]): Product[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const result: Product[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p || !p.name) continue;

    const trimmedName = p.name.trim();
    // Normalize old numeric IDs e.g. "7681" -> "rz-7681"
    let cleanId = p.id ? String(p.id).trim() : `prod-${i}-${Date.now()}`;
    if (/^\d+$/.test(cleanId)) {
      cleanId = `rz-${cleanId}`;
    }

    // If ID already seen or duplicate name + volume, ensure uniqueness or skip redundant duplicate
    if (seenIds.has(cleanId)) {
      if (seenNames.has(trimmedName + (p.volume || ''))) {
        // Skip redundant exact duplicate item
        continue;
      }
      cleanId = `${cleanId}-dup-${i}`;
    }

    seenIds.add(cleanId);
    seenNames.add(trimmedName + (p.volume || ''));

    // Safe image checking: do not assign 20G or 21G to products that aren't 7611/7612
    let safeImage = p.image ? p.image.trim() : RZ_OFFICIAL_FALLBACK_LOGO;
    
    // Strict non-oil and accessory protection: towels, cloths, buckets, detailing accessories
    const isAccessoryOrCare = /منشفة|منشفه|مايكروفايبر|فوطة|فوطه|سطل|bucket|towel|microfiber|قماش|تنظيف زجاج|غسيل/i.test(trimmedName) || 
      /منشفة|منشفه|مايكروفايبر|فوطة|فوطه|سطل/i.test(p.description || '');

    if (isAccessoryOrCare) {
      // If it has an oil can image (like 7611, 7612, 7635, 7746, 20g, 21g), reset to official RZ logo unless it's a custom uploaded data URI
      if (
        safeImage.includes('7612') || 
        safeImage.includes('7611') || 
        safeImage.includes('7635') || 
        safeImage.includes('7746') || 
        safeImage.includes('7556') || 
        safeImage.includes('7558') || 
        /20[gG]|21[gG]/.test(safeImage)
      ) {
        safeImage = RZ_OFFICIAL_FALLBACK_LOGO;
      }
    } else {
      // Generic guard: only 7612 gets 7612 image, only 7611 gets 7611 image
      if (safeImage.includes('7612') && cleanId !== 'rz-7612' && !trimmedName.includes('RZ21G')) {
        safeImage = RZ_OFFICIAL_FALLBACK_LOGO;
      }
      if (safeImage.includes('7611') && cleanId !== 'rz-7611' && !trimmedName.includes('RZ11G') && !trimmedName.includes('RZ20G')) {
        safeImage = RZ_OFFICIAL_FALLBACK_LOGO;
      }
    }

    if (!safeImage || safeImage.length < 5) {
      safeImage = RZ_OFFICIAL_FALLBACK_LOGO;
    }

    result.push({
      ...p,
      id: cleanId,
      code: p.code ? String(p.code).trim() : `RZ-${cleanId}`,
      originBadge: p.originBadge !== undefined ? p.originBadge : 'ألماني أصلي DE',
      image: safeImage,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [safeImage],
    });
  }

  return result;
}

export default function App() {
  // Catalog Templates (initialized with 81 official products + custom saved templates)
  const [catalogTemplates, setCatalogTemplates] = useState<Product[]>(() => {
    const saved = localStorage.getItem('rzoil_custom_templates');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(p => p.id));
          const missingOfficial = ALL_INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
          return sanitizeProductCatalog([...parsed, ...missingOfficial]);
        }
      } catch (e) { /* ignore */ }
    }
    return ALL_INITIAL_PRODUCTS;
  });

  // Store Catalog Products - Starts empty until added by admin
  const [productsList, setProductsList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('rzoil_jordan_products');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return sanitizeProductCatalog(parsed);
        }
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [currentProduct, setCurrentProduct] = useState<Product>(() => {
    return (productsList && productsList[0]) || MAIN_PRODUCT;
  });
  const [viewMode, setViewMode] = useState<'home' | 'product'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  
  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('rzoil_jordan_orders');
    if (saved !== null) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { /* ignore */ }
    }
    return INITIAL_ORDERS;
  });

  // Distributors State
  const [distributors, setDistributors] = useState<Distributor[]>(() => {
    const saved = localStorage.getItem('rzoil_jordan_distributors');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_DISTRIBUTORS;
  });

  // Settings State
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('rzoil_jordan_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SETTINGS;
  });

  // Admin Authentication & Credentials
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    const saved = localStorage.getItem('rzoil_admin_auth');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ADMIN_CREDS;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rzoil_admin_authenticated') === 'true';
  });

  const [loginModalMode, setLoginModalMode] = useState<'user' | 'admin'>('user');

  // UI Modals & Drawers
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDistributorsOpen, setIsDistributorsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDbSetupOpen, setIsDbSetupOpen] = useState(false);
  const [directCheckoutProduct, setDirectCheckoutProduct] = useState<Product | null>(null);

  // InfinityFree Database Connection State
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(getSavedDbConfig);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(() => {
    return getSavedDbConfig().isConfigured;
  });

  // Check live status on server mount & sync admin credentials, store settings, and products from MySQL
  useEffect(() => {
    checkServerDbStatus(dbConfig.apiEndpoint).then((status) => {
      if (status.isConnected) {
        setIsDbConnected(true);
      }
    });

    // Attempt to load store settings from MySQL if configured
    fetchStoreSettingsFromDatabase(dbConfig).then((res) => {
      if (res.success && res.settings && Object.keys(res.settings).length > 0) {
        setSettings(prev => ({ ...prev, ...res.settings }));
        localStorage.setItem('rzoil_jordan_settings', JSON.stringify({ ...settings, ...res.settings }));
      }
    }).catch(console.warn);

    // Attempt to load products from Server Database
    fetchProductsFromDatabase(dbConfig).then((res) => {
      if (res.success && Array.isArray(res.products)) {
        const sanitized = sanitizeProductCatalog(res.products);
        setProductsList(sanitized);
        localStorage.setItem('rzoil_jordan_products', JSON.stringify(sanitized));
      }
    }).catch(console.warn);

    // Attempt to load distributors from MySQL if configured
    fetchDistributorsFromDatabase(dbConfig).then((res) => {
      if (res.success && Array.isArray(res.distributors) && res.distributors.length > 0) {
        setDistributors(res.distributors);
        localStorage.setItem('rzoil_jordan_distributors', JSON.stringify(res.distributors));
      }
    }).catch(console.warn);

    // Attempt to load orders from MySQL if configured
    fetchOrdersFromDatabase(dbConfig).then((res) => {
      if (res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        setOrders(res.orders);
        localStorage.setItem('rzoil_jordan_orders', JSON.stringify(res.orders));
      }
    }).catch(console.warn);

    // Attempt to load admin credentials from MySQL if configured
    fetchAdminCredentialsFromDatabase(dbConfig).then((res) => {
      if (res.success && res.username && res.password) {
        const syncedCreds: AdminCredentials = {
          username: res.username,
          password: res.password
        };
        setAdminCredentials(syncedCreds);
        localStorage.setItem('rzoil_admin_auth', JSON.stringify(syncedCreds));
      }
    }).catch(console.warn);
  }, [dbConfig.apiEndpoint, dbConfig.isConfigured]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rzoil_jordan_products', JSON.stringify(productsList));
  }, [productsList]);

  useEffect(() => {
    localStorage.setItem('rzoil_jordan_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rzoil_jordan_distributors', JSON.stringify(distributors));
  }, [distributors]);

  useEffect(() => {
    localStorage.setItem('rzoil_jordan_settings', JSON.stringify(settings));
  }, [settings]);

  // Dark mode class handler
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check URL query on mount or hash for admin (e.g. ?admin=1 or /admin or #admin)
  useEffect(() => {
    if (
      window.location.search.includes('admin') || 
      window.location.hash.includes('admin') ||
      window.location.pathname.includes('admin')
    ) {
      if (sessionStorage.getItem('rzoil_admin_authenticated') === 'true') {
        setIsAdminOpen(true);
      } else {
        setLoginModalMode('admin');
        setIsLoginOpen(true);
      }
    }

    // Keyboard shortcut: Alt+A or Ctrl+Alt+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        if (sessionStorage.getItem('rzoil_admin_authenticated') === 'true') {
          setIsAdminOpen(prev => !prev);
        } else {
          setLoginModalMode('admin');
          setIsLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  const handleUpdateAdminCredentials = (newCreds: AdminCredentials) => {
    setAdminCredentials(newCreds);
    localStorage.setItem('rzoil_admin_auth', JSON.stringify(newCreds));
    
    // Save to remote MySQL database
    saveAdminCredentialsToDatabase(dbConfig, newCreds.username, newCreds.password).then((res) => {
      if (res.success) {
        showToast('تم حفظ بيانات المشرف الجديدة في قاعدة البيانات بنجاح');
      } else {
        showToast('تم الحفظ محلياً (سيتم المزامنة عند الاتصال بقاعدة البيانات)');
      }
    });
  };

  const handleRequestAdminAccess = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setLoginModalMode('admin');
      setIsLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('rzoil_admin_authenticated', 'true');
    setIsAdminOpen(true);
    showToast('تم تفعيل حساب المشرف وفتح لوحة الإدارة');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('rzoil_admin_authenticated');
    setIsAdminOpen(false);
    showToast('تم تسجيل الخروج من لوحة الإدارة');
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`تمت إضافة "${product.name}" إلى السلة`);
  };

  const handleIncrement = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('تم حذف المنتج من السلة');
  };

  // Wishlist operations
  const handleToggleFavorite = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast('تمت الإزالة من المفضلة');
        return prev.filter((id) => id !== product.id);
      } else {
        showToast('تمت الإضافة إلى المفضلة');
        return [...prev, product.id];
      }
    });
  };

  // Direct checkout
  const handleDirectCheckout = (product: Product) => {
    setDirectCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Go to Home Page Catalog
  const handleGoHome = () => {
    setViewMode('home');
    setSelectedCategory('الكل');
    setSearchQuery('');
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select a product to view its details
  const handleSelectProduct = (product: Product) => {
    setCurrentProduct(product);
    setViewMode('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matches = productsList.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matches.length === 1) {
      setCurrentProduct(matches[0]);
      setViewMode('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`تم العثور على: ${matches[0].name}`);
    } else if (matches.length > 1) {
      setViewMode('home');
      setSelectedCategory('الكل');
      showToast(`تم العثور على ${matches.length} منتج`);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else {
      showToast('لم يتم العثور على منتجات مطابقة للبحث');
    }
  };

  // Category filter
  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setViewMode('home');
    setIsMenuOpen(false);
    showToast(`تصفح قسم: ${catName}`);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Admin handlers
  const handleUpdateProduct = (updatedProd: Product) => {
    const sanitized = sanitizeProductCatalog([updatedProd])[0] || updatedProd;
    setProductsList(prev => prev.map(p => p.id === sanitized.id ? sanitized : p));
    if (currentProduct.id === sanitized.id) {
      setCurrentProduct(sanitized);
    }
    saveProductToDatabase(dbConfig, sanitized).then(res => {
      if (res.success) {
        showToast(`تم حفظ وتحديث ${sanitized.name} في قاعدة البيانات بنجاح ✅`);
      } else {
        showToast(`تم تحديث بيانات المنتج: ${sanitized.name}`);
      }
    }).catch(() => {
      showToast(`تم تحديث بيانات المنتج: ${sanitized.name}`);
    });
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    let updatedProd: Product | null = null;
    setProductsList(prev => prev.map(p => {
      if (p.id === productId) {
        updatedProd = { ...p, price: newPrice };
        return updatedProd;
      }
      return p;
    }));
    if (currentProduct.id === productId) {
      setCurrentProduct(prev => ({ ...prev, price: newPrice }));
    }
    updateProductPriceInDatabase(dbConfig, productId, newPrice).catch(console.warn);
    showToast(`تم تحديث السعر إلى ${newPrice} د.أ`);
  };

  const handleToggleProductStock = (productId: string) => {
    let nextStock = true;
    setProductsList(prev => prev.map(p => {
      if (p.id === productId) {
        nextStock = !p.inStock;
        showToast(nextStock ? 'تم تعيين المنتج: متوفر' : 'تم تعيين المنتج: نفد من المخزون');
        return { ...p, inStock: nextStock };
      }
      return p;
    }));
    toggleProductStockInDatabase(dbConfig, productId, nextStock).catch(console.warn);
  };

  const handleAddProduct = (newProd: Product) => {
    const sanitized = sanitizeProductCatalog([newProd])[0] || newProd;
    setProductsList(prev => sanitizeProductCatalog([sanitized, ...prev]));
    saveProductToDatabase(dbConfig, sanitized).then(res => {
      if (res.success) {
        showToast(`تم إضافة وحفظ ${sanitized.name} في قاعدة البيانات بنجاح ✅`);
      }
    }).catch(console.warn);
  };

  const handleDeleteProduct = (productId: string) => {
    setProductsList(prev => {
      const next = prev.filter(p => p.id !== productId && p.code !== productId);
      localStorage.setItem('rzoil_jordan_products', JSON.stringify(next));
      return next;
    });
    deleteProductFromDatabase(dbConfig, productId).then(res => {
      if (res.success) {
        showToast('تم حذف المنتج من قاعدة البيانات نهائياً ✅');
      }
    }).catch(console.warn);
  };

  const handleClearAllProducts = () => {
    setProductsList([]);
    localStorage.setItem('rzoil_jordan_products', JSON.stringify([]));
    clearRemoteProducts(dbConfig).then(res => {
      if (res.success) {
        showToast('تم تصفير وحذف جميع المنتجات من قاعدة البيانات بنجاح ✅');
      }
    }).catch(console.warn);
  };

  const handleClearAllOrders = () => {
    setOrders([]);
    localStorage.setItem('rzoil_jordan_orders', JSON.stringify([]));
    clearRemoteOrders(dbConfig).catch(console.warn);
    showToast('تم تصفير جميع الطلبات بنجاح');
  };

  const handleAddTemplateToStore = (template: Product, customPrice?: number) => {
    const newProd: Product = {
      ...template,
      id: template.id.startsWith('rz-') ? template.id : 'rz-' + template.id,
      price: customPrice && customPrice > 0 ? customPrice : template.price,
      inStock: true
    };
    // If product already exists with this ID, replace/update it or ensure uniqueness
    setProductsList(prev => {
      const filtered = prev.filter(p => p.id !== newProd.id && p.name !== newProd.name);
      return sanitizeProductCatalog([newProd, ...filtered]);
    });
    saveProductToDatabase(dbConfig, newProd).then(res => {
      if (res.success) {
        showToast(`تمت إضافة ${template.name} إلى المتجر وحفظه في قاعدة البيانات بنجاح ✅`);
      }
    }).catch(console.warn);
  };

  const handleUpdateTemplate = (updatedTemplate: Product) => {
    // 1. Update in catalogTemplates state & localStorage
    setCatalogTemplates(prev => {
      const next = prev.map(t => (t.id === updatedTemplate.id || t.code === updatedTemplate.code) ? updatedTemplate : t);
      localStorage.setItem('rzoil_custom_templates', JSON.stringify(next));
      return next;
    });

    // 2. Also update live in productsList (store) if present
    setProductsList(prev => {
      let matched = false;
      const next = prev.map(p => {
        if (p.id === updatedTemplate.id || p.code === updatedTemplate.code || p.name === updatedTemplate.name) {
          matched = true;
          return {
            ...p,
            ...updatedTemplate,
            price: p.price // preserve custom active store price
          };
        }
        return p;
      });
      if (matched) {
        localStorage.setItem('rzoil_jordan_products', JSON.stringify(next));
      }
      return next;
    });

    // 3. Update currentProduct if currently viewing it
    if (currentProduct.id === updatedTemplate.id || currentProduct.code === updatedTemplate.code) {
      setCurrentProduct(prev => ({ ...prev, ...updatedTemplate }));
    }

    if (dbConfig.isConfigured) {
      saveProductToDatabase(dbConfig, updatedTemplate).catch(console.warn);
    }

    showToast(`تم تحديث بيانات وصورة "${updatedTemplate.name}" بنجاح`);
  };

  const handleAddNewTemplate = (newTemplate: Product) => {
    const sanitized: Product = {
      ...newTemplate,
      id: newTemplate.id || `rz-custom-${Date.now()}`,
      image: newTemplate.image || RZ_OFFICIAL_FALLBACK_LOGO,
      images: newTemplate.images?.length ? newTemplate.images : [newTemplate.image || RZ_OFFICIAL_FALLBACK_LOGO]
    };
    setCatalogTemplates(prev => {
      const next = [sanitized, ...prev];
      localStorage.setItem('rzoil_custom_templates', JSON.stringify(next));
      return next;
    });
    if (dbConfig.isConfigured) {
      saveProductToDatabase(dbConfig, sanitized).catch(console.warn);
    }
    showToast(`تمت إضافة صنف "${newTemplate.name}" إلى الكتالوج بنجاح`);
  };

  const handleAddAllTemplatesToStore = (customList?: Product[]) => {
    const listToAdd = customList && customList.length > 0 ? customList : catalogTemplates;
    const existingIds = new Set(productsList.map(p => p.id));
    const existingCodes = new Set(productsList.map(p => p.code?.toUpperCase()));
    const missing = listToAdd.filter(p => !existingIds.has(p.id) && !existingCodes.has(p.code?.toUpperCase()));
    
    if (missing.length === 0) {
      showToast('جميع منتجات هذا الكتالوج متوفرة بالفعل في متجرك');
      return;
    }
    const combined = sanitizeProductCatalog([...productsList, ...missing]);
    setProductsList(combined);
    localStorage.setItem('rzoil_jordan_products', JSON.stringify(combined));
    
    // Always persist to database backend
    missing.forEach(prod => saveProductToDatabase(dbConfig, prod).catch(console.warn));
    
    showToast(`تمت إضافة ${missing.length} صنفاً جديداً وحفظها في قاعدة البيانات بنجاح ✅`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (dbConfig.isConfigured) {
      updateOrderStatusInDatabase(dbConfig, orderId, status).catch(console.warn);
    }
    showToast('تم تحديث حالة الطلب في قاعدة البيانات');
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (dbConfig.isConfigured) {
      deleteOrderFromDatabase(dbConfig, orderId).catch(console.warn);
    }
    showToast('تم حذف الطلب من قاعدة البيانات');
  };

  const handleSaveNewOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast(`تم تسجيل طلب جديد بنجاح برقم ${newOrder.orderNumber}`);

    // Automatically save directly to MySQL table rzoil_orders
    if (dbConfig.isConfigured) {
      saveOrderToDatabase(dbConfig, newOrder).then((res) => {
        if (res.success) {
          console.log('✅ تم تسجيل الطلب في قاعدة بيانات MySQL بنجاح:', res.message);
        }
      }).catch((err) => {
        console.warn('تنبيه حفظ الطلب في قاعدة البيانات:', err);
      });
    }
  };

  const handleAddDistributor = (dist: Distributor) => {
    setDistributors(prev => [...prev, dist]);
    if (dbConfig.isConfigured) {
      saveDistributorToDatabase(dbConfig, dist).then(res => {
        if (res.success) {
          showToast(`تم حفظ موزع ${dist.city} في قاعدة البيانات بنجاح ✅`);
        }
      }).catch(console.warn);
    } else {
      showToast(`تمت إضافة موزع ${dist.city}`);
    }
  };

  const handleUpdateDistributor = (dist: Distributor) => {
    setDistributors(prev => prev.map(d => d.id === dist.id ? dist : d));
    if (dbConfig.isConfigured) {
      saveDistributorToDatabase(dbConfig, dist).then(res => {
        if (res.success) {
          showToast(`تم تحديث بيانات موزع ${dist.city} في قاعدة البيانات بنجاح ✅`);
        }
      }).catch(console.warn);
    } else {
      showToast(`تم تحديث بيانات موزع ${dist.city}`);
    }
  };

  const handleDeleteDistributor = (distId: string) => {
    setDistributors(prev => prev.filter(d => d.id !== distId));
    if (dbConfig.isConfigured) {
      deleteDistributorFromDatabase(dbConfig, distId).then(res => {
        if (res.success) {
          showToast('تم حذف الموزع من قاعدة البيانات بنجاح ✅');
        }
      }).catch(console.warn);
    } else {
      showToast('تم حذف الموزع');
    }
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem('rzoil_jordan_settings', JSON.stringify(newSettings));
    if (dbConfig.isConfigured) {
      saveStoreSettingsToDatabase(dbConfig, newSettings).then((res) => {
        if (res.success) {
          showToast('✅ تم حفظ الإعدادات وأرقام التواصل وروابط السوشيال ميديا في قاعدة البيانات بنجاح');
        } else {
          showToast('⚠️ تم الحفظ محلياً (تنبيه قاعدة البيانات: ' + (res.message || 'فشل الاتصال') + ')');
        }
      }).catch((err) => {
        console.warn('تنبيه حفظ الإعدادات:', err);
      });
    } else {
      showToast('تم حفظ إعدادات المتجر وأرقام التواصل وروابط السوشيال ميديا بنجاح');
    }
  };

  // Totals
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  // Current active product quantity in cart
  const currentQuantityInCart = cart.find((item) => item.product.id === currentProduct.id)?.quantity || 0;
  const isCurrentFavorite = wishlistIds.includes(currentProduct.id);

  // Map of quantities in cart by product ID
  const cartQuantities = cart.reduce<{ [id: string]: number }>((acc, item) => {
    acc[item.product.id] = item.quantity;
    return acc;
  }, {});

  const wishlistProducts = productsList.filter((p) => wishlistIds.includes(p.id));
  const relatedCatalogProducts = productsList.filter((p) => p.id !== currentProduct.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white dark:bg-white dark:text-gray-900 px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-fade-in border border-gray-700 dark:border-gray-200">
          <Check className="w-4 h-4 text-[#ea1b25]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onGoHome={handleGoHome}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenLogin={() => {
          setLoginModalMode('admin');
          setIsLoginOpen(true);
        }}
        onOpenAdmin={handleRequestAdminAccess}
        onOpenDistributors={() => setIsDistributorsOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        cartTotal={cartTotal}
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={handleAdminLogout}
        isDbConnected={isDbConnected}
        onOpenDbSetup={() => setIsDbSetupOpen(true)}
      />

      {/* Navigation Categories Drawer */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectCategory={handleCategorySelect}
        onOpenDistributors={() => setIsDistributorsOpen(true)}
        onOpenOffers={() => {
          showToast('تخفيضات وعروض خاصة متوفرة على كافة منتجات RZ في الأردن');
          handleCategorySelect('اضافات الوقود');
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={handleRequestAdminAccess}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isAdminAuthenticated={isAdminAuthenticated}
        onGoHome={handleGoHome}
      />

      {/* Main Screen: Home Catalog or Product Details */}
      <main className="flex-1">
        {viewMode === 'home' ? (
          <HomeView
            products={productsList}
            categories={CATEGORIES.map(c => c.name)}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            cartQuantities={cartQuantities}
            wishlistIds={wishlistIds}
            onOpenDistributors={() => setIsDistributorsOpen(true)}
            onOpenContact={() => setIsContactOpen(true)}
            onOpenAdmin={handleRequestAdminAccess}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        ) : (
          <>
            <ProductDetail
              product={currentProduct}
              quantityInCart={currentQuantityInCart}
              isFavorite={isCurrentFavorite}
              onAddToCart={() => handleAddToCart(currentProduct)}
              onIncrementQuantity={() => handleIncrement(currentProduct.id)}
              onDecrementQuantity={() => handleDecrement(currentProduct.id)}
              onToggleFavorite={() => handleToggleFavorite(currentProduct)}
              onDirectCheckout={() => handleDirectCheckout(currentProduct)}
              onCategoryClick={handleCategorySelect}
              onShare={() => showToast('تم نسخ رابط المنتج بنجاح')}
              onGoHome={handleGoHome}
            />

            {/* Related Products sections */}
            <RelatedProducts
              products={productsList.filter(p => p.id !== currentProduct.id).slice(0, 8)}
              cartQuantities={cartQuantities}
              onAddToCart={handleAddToCart}
              onIncrementQuantity={handleIncrement}
              onDecrementQuantity={handleDecrement}
              onSelectProduct={handleSelectProduct}
            />
          </>
        )}
      </main>

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setDirectCheckoutProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Direct Order Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        singleProduct={directCheckoutProduct}
        singleQuantity={directCheckoutProduct ? (cartQuantities[directCheckoutProduct.id] || 1) : 1}
        cartItems={cart}
        shippingCost={settings.shippingCost}
        onOrderSuccess={() => {
          if (!directCheckoutProduct) {
            setCart([]);
          }
        }}
        onPlaceOrder={handleSaveNewOrder}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={(id) => setWishlistIds((prev) => prev.filter((item) => item !== id))}
        onAddToCart={handleAddToCart}
        onSelectProduct={handleSelectProduct}
      />

      {/* Login / Profile Modal with Admin Gateway & Verification */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        adminCredentials={adminCredentials}
        initialMode={loginModalMode}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminPanel={() => {
          setIsLoginOpen(false);
          setIsAdminOpen(true);
        }}
        onAdminLogout={handleAdminLogout}
      />

      {/* Distributors Modal */}
      <DistributorsModal
        isOpen={isDistributorsOpen}
        onClose={() => setIsDistributorsOpen(false)}
        distributors={distributors}
        isAdminAuthenticated={isAdminAuthenticated}
        onDeleteDistributor={handleDeleteDistributor}
        onUpdateDistributor={handleUpdateDistributor}
        onAddDistributor={handleAddDistributor}
        onOpenAdmin={() => {
          setIsDistributorsOpen(false);
          setIsAdminOpen(true);
        }}
      />

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        settings={settings}
      />

      {/* Floating Buttons: WhatsApp & Quick Cart */}
      <FloatingWidgets
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        whatsappPhone={settings.whatsappPhone}
      />

      {/* Full Admin Control Center Modal (Only active and displayed when authenticated) */}
      <AdminPanel
        isOpen={isAdminOpen && isAdminAuthenticated}
        onClose={() => setIsAdminOpen(false)}
        onLogout={handleAdminLogout}
        adminCredentials={adminCredentials}
        onUpdateAdminCredentials={handleUpdateAdminCredentials}
        products={productsList}
        templates={catalogTemplates}
        onUpdateProduct={handleUpdateProduct}
        onUpdateProductPrice={handleUpdateProductPrice}
        onToggleProductStock={handleToggleProductStock}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onClearAllProducts={handleClearAllProducts}
        onClearAllOrders={handleClearAllOrders}
        onAddTemplateToStore={handleAddTemplateToStore}
        onAddAllTemplatesToStore={handleAddAllTemplatesToStore}
        onUpdateTemplate={handleUpdateTemplate}
        onAddNewTemplate={handleAddNewTemplate}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        distributors={distributors}
        onAddDistributor={handleAddDistributor}
        onDeleteDistributor={handleDeleteDistributor}
        onUpdateDistributor={handleUpdateDistributor}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        dbConfig={dbConfig}
        onOpenDbSetup={() => setIsDbSetupOpen(true)}
      />

      {/* InfinityFree Database Setup & Real Verification Modal */}
      <DatabaseSetupModal
        isOpen={isDbSetupOpen}
        onClose={() => setIsDbSetupOpen(false)}
        config={dbConfig}
        onUpdateConfig={(newConfig) => {
          setDbConfig(newConfig);
          setIsDbConnected(newConfig.isConfigured);
          showToast('تم تحديث إعدادات قاعدة بيانات InfinityFree');
        }}
        products={productsList}
        distributors={distributors}
        orders={orders}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={viewMode}
        onGoHome={handleGoHome}
        onOpenCategories={() => setIsMenuOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        whatsappPhone={settings.whatsappPhone}
      />

      {/* Footer */}
      <Footer
        onOpenDistributors={() => setIsDistributorsOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={handleRequestAdminAccess}
        onGoHome={handleGoHome}
        settings={settings}
      />
    </div>
  );
}
