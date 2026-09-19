import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MapPin, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Search, 
  MessageSquare, 
  Phone, 
  DollarSign, 
  Eye, 
  ShieldCheck, 
  RefreshCw, 
  Building, 
  Check,
  Upload,
  Image as ImageIcon,
  KeyRound,
  Lock,
  User,
  LogOut,
  Database,
  Server,
  Zap,
  Download,
  Sparkles
} from 'lucide-react';
import { Product, Order, Distributor, StoreSettings, AdminCredentials, DatabaseConfig } from '../types';
import { RzTemplateLibrary } from './RzTemplateLibrary';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  adminCredentials: AdminCredentials;
  onUpdateAdminCredentials: (creds: AdminCredentials) => void;
  products: Product[];
  templates?: Product[];
  onAddTemplateToStore?: (template: Product, customPrice: number) => void;
  onClearAllProducts?: () => void;
  onClearAllOrders?: () => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onToggleProductStock: (productId: string) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductImage?: (productId: string, newImage: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  distributors: Distributor[];
  onAddDistributor: (distributor: Distributor) => void;
  onDeleteDistributor: (distributorId: string) => void;
  onUpdateDistributor?: (distributor: Distributor) => void;
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  dbConfig?: DatabaseConfig;
  onOpenDbSetup?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  adminCredentials,
  onUpdateAdminCredentials,
  products,
  templates = [],
  onAddTemplateToStore,
  onClearAllProducts,
  onClearAllOrders,
  onUpdateProductPrice,
  onToggleProductStock,
  onAddProduct,
  onDeleteProduct,
  onUpdateProductImage,
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  distributors,
  onAddDistributor,
  onDeleteDistributor,
  onUpdateDistributor,
  settings,
  onUpdateSettings,
  dbConfig,
  onOpenDbSetup
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'templates' | 'distributors' | 'database' | 'settings' | 'security'>('overview');
  
  // Product edit states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [uploadedImageFile, setUploadedImageFile] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New product state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    code: '',
    price: 10,
    brand: 'رزويل',
    category: 'اضافات الوقود',
    image: '',
    description: '',
    volume: '300 مل',
    inStock: true
  });

  // Orders filters
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'delivered' | 'cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Distributor add & edit state
  const [isAddDistOpen, setIsAddDistOpen] = useState(false);
  const [editingDistId, setEditingDistId] = useState<string | null>(null);
  const [editDistForm, setEditDistForm] = useState<Distributor | null>(null);
  const [newDist, setNewDist] = useState<Omit<Distributor, 'id'>>({
    city: 'عمان',
    area: '',
    phone: '079',
    address: ''
  });

  // Settings local state (sync with incoming settings prop)
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  // Admin Credentials form state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newUsernameInput, setNewUsernameInput] = useState(adminCredentials.username);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState<string | null>(null);
  const [securityErrorMsg, setSecurityErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculation for overview
  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);
  
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const inStockCount = products.filter(p => p.inStock).length;

  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch = 
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      o.city.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredProducts = products.filter(p => {
    const matchesCategory = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle image file selection from computer
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WEBP)');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setUploadedImageFile(base64);
      setNewProduct(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectTemplateForForm = (template: Product) => {
    setNewProduct({
      name: template.name,
      code: template.code,
      price: template.price || 10,
      brand: template.brand || 'رزويل',
      category: template.category || 'اضافات الوقود',
      image: template.image,
      description: template.description || '',
      volume: template.volume || '300 مل',
      inStock: true
    });
    setUploadedImageFile(template.image);
    setUploadedFileName(`قالب رسمي: ${template.name}`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('يرجى ملء اسم وسعر المنتج');
      return;
    }

    if (!uploadedImageFile && !newProduct.image) {
      alert('يرجى تحميل صورة للمنتج أو اختيار قالب جاهز');
      return;
    }

    const created: Product = {
      id: String(Date.now()),
      name: newProduct.name,
      code: newProduct.code || 'RZ-' + Math.floor(1000 + Math.random() * 9000),
      price: Number(newProduct.price),
      brand: newProduct.brand || 'رزويل',
      category: newProduct.category || 'اضافات الوقود',
      image: uploadedImageFile || newProduct.image || 'https://www.rzoil.net/us/164/pidwebp600/7612/f133288936368174447131-1.webp',
      description: newProduct.description || 'منتج ألماني فائق الجودة من شركة RZ Oil الألمانية.',
      features: ['صناعة ألمانية 100%', 'معتمد ومطابق للمواصفات', 'حماية فائقة للمحرك'],
      usage: 'يضاف لخزان الوقود أو المحرك حسب إرشادات الشركة المصنعة',
      directions: ['تأكد من إطفاء المحرك', 'قم بصب العبوة كاملة', 'قم بتشغيل المحرك لعدة دقائق'],
      volume: newProduct.volume || '300 مل',
      inStock: newProduct.inStock ?? true
    };

    onAddProduct(created);
    setIsAddProductOpen(false);
    setUploadedImageFile(null);
    setUploadedFileName('');
    setNewProduct({
      name: '',
      code: '',
      price: 10,
      brand: 'رزويل',
      category: 'اضافات الوقود',
      image: '',
      description: '',
      volume: '300 مل',
      inStock: true
    });
  };

  const handleSavePrice = (productId: string) => {
    if (tempPrice > 0) {
      onUpdateProductPrice(productId, tempPrice);
      setEditingPriceId(null);
    }
  };

  const handleCreateDistributor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDist.city || !newDist.phone) return;

    onAddDistributor({
      id: String(Date.now()),
      city: newDist.city,
      area: newDist.area || 'مركز معتمد',
      phone: newDist.phone,
      address: newDist.address || 'موزع معتمد لزيوت رزويل الألمانية'
    });

    setIsAddDistOpen(false);
    setNewDist({ city: 'عمان', area: '', phone: '079', address: '' });
  };

  const startEditDist = (d: Distributor) => {
    setEditingDistId(d.id);
    setEditDistForm({ ...d });
  };

  const cancelEditDist = () => {
    setEditingDistId(null);
    setEditDistForm(null);
  };

  const handleSaveDistEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editDistForm && onUpdateDistributor) {
      onUpdateDistributor(editDistForm);
      setEditingDistId(null);
      setEditDistForm(null);
    }
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg(null);
    setSecuritySuccessMsg(null);

    // Verify current password
    if (currentPasswordInput !== adminCredentials.password) {
      setSecurityErrorMsg('كلمة المرور الحالية غير صحيحة!');
      return;
    }

    if (!newUsernameInput.trim()) {
      setSecurityErrorMsg('يرجى تحديد اسم مستخدم جديد');
      return;
    }

    if (newPasswordInput && newPasswordInput.length < 4) {
      setSecurityErrorMsg('كلمة المرور يجب أن لا تقل عن 4 خانات');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setSecurityErrorMsg('كلمة المرور الجديدة غير متطابقة مع التأكيد!');
      return;
    }

    const updatedCreds: AdminCredentials = {
      username: newUsernameInput.trim(),
      password: newPasswordInput ? newPasswordInput.trim() : adminCredentials.password
    };

    onUpdateAdminCredentials(updatedCreds);
    setSecuritySuccessMsg('تم تحديث بيانات المشرف (اسم المستخدم وكلمة المرور) بنجاح!');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Admin Panel Card */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 dark:border-gray-700 max-h-[92vh] flex flex-col animate-scale-up">
        
        {/* Unified Red Signature Header */}
        <div className="bg-[#ea1b25] text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-black shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">لوحة تحكم إدارة متجر رزويل الأردن</h3>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  مشرف النظام: {adminCredentials.username}
                </span>
              </div>
              <p className="text-[11px] text-white/80">RZ Oil Deutschland GmbH - إدارة المتجر والطلبات في المملكة الأردنية الهاشمية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-black/25 hover:bg-black/40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="تسجيل خروج من حساب الإدارة"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer text-white"
              title="إغلاق لوحة الإدارة"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto bg-gray-100 dark:bg-[#222222] p-2 border-b border-gray-200 dark:border-gray-800 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#ea1b25] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#ea1b25] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>إدارة الطلبات الواردة</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-[#ea1b25] rounded-full text-[10px] font-black">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#ea1b25] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات المعروضة بالمتجر</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-sm font-bold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>كتالوج قوالب رزويل (صور وشروحات جاهزة) ⚡</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold">
              {templates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('distributors')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'distributors'
                ? 'bg-[#ea1b25] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>شبكة الموزعين في الأردن</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#ea1b25] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>قاعدة البيانات (InfinityFree)</span>
            <span className={`w-2 h-2 rounded-full ${dbConfig?.isConfigured ? 'bg-green-400' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#ea1b25] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات المتجر والشحن</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#ea1b25] text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d2d2d]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>تغيير اليوزر والباسورد 🔑</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-[#151515]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 font-bold">إجمالي المبيعات المؤكدة</div>
                    <div className="text-xl font-black text-[#ea1b25] mt-1 font-tajawal">
                      {totalSales.toLocaleString()} دينار أردني
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#ea1b25]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 font-bold">الطلبات قيد الانتظار</div>
                    <div className="text-xl font-black text-amber-500 mt-1 font-mono">
                      {pendingOrdersCount} طلبات
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 font-bold">إجمالي الطلبات المسجلة</div>
                    <div className="text-xl font-black text-gray-900 dark:text-white mt-1 font-mono">
                      {orders.length}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 font-bold">المنتجات المتوفرة بالمستودع</div>
                    <div className="text-xl font-black text-green-600 mt-1 font-mono">
                      {inStockCount} / {products.length}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#202020] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">أحدث طلبات الزبائن في الأردن</h4>
                    <button 
                      onClick={() => setActiveTab('orders')} 
                      className="text-xs text-[#ea1b25] font-bold hover:underline"
                    >
                      عرض كل الطلبات ({orders.length}) ←
                    </button>
                  </div>

                  <div className="space-y-2">
                    {orders.slice(0, 3).map((order) => (
                      <div 
                        key={order.id} 
                        className="p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{order.customerName}</span>
                            <span className="font-mono text-gray-400">({order.orderNumber})</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {order.city}
                            </span>
                          </div>
                          <div className="text-gray-500 font-mono" dir="ltr">{order.phone}</div>
                        </div>

                        <div className="text-left space-y-1">
                          <div className="font-bold text-[#ea1b25] font-tajawal text-sm">{order.grandTotal} د.أ</div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'pending' ? 'قيد الانتظار' : order.status === 'processing' ? 'جاري التوصيل' : 'تم التسليم'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info & Security summary */}
                <div className="bg-white dark:bg-[#202020] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 text-[#ea1b25]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>أمان المتجر وحساب المشرف</span>
                  </h4>
                  
                  <div className="p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">اسم مستخدم المشرف:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{adminCredentials.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">حالة الجلسة:</span>
                      <span className="text-green-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>مفعلة ونشطة</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('security')}
                      className="w-full mt-2 py-2 bg-[#ea1b25] hover:bg-[#c9141d] text-white rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>تغيير اليوزر والباسورد</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="font-bold text-gray-700 dark:text-gray-300">إرشادات سريعة للإدارة:</div>
                    <ul className="list-disc pr-4 space-y-1 text-gray-500">
                      <li>تعديل أسعار المنتجات يظهر فوراً في المتجر بالدينار الأردني.</li>
                      <li>يمكنك تحميل صور المنتجات من جهاز الكمبيوتر مباشرة.</li>
                      <li>بيانات الدخول محمية ومحفوظة على جهازك.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#202020] p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs font-bold">
                  {(['all', 'pending', 'processing', 'delivered', 'cancelled'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                        orderFilter === filter
                          ? 'bg-[#ea1b25] text-white'
                          : 'bg-gray-100 dark:bg-[#282828] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {filter === 'all' ? 'الكل' :
                       filter === 'pending' ? 'قيد الانتظار' :
                       filter === 'processing' ? 'جاري التوصيل' :
                       filter === 'delivered' ? 'تم التسليم' : 'ملغي'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="بحث باسم العميل، الهاتف، أو المدينة..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full h-8 pr-8 pl-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#ea1b25]"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
                  </div>

                  {orders.length > 0 && onClearAllOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من رغبتك في تصفير وحذف جميع الطلبات؟')) {
                          onClearAllOrders();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900 text-red-600 dark:text-red-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      title="تصفير وحذف جميع الطلبات"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>تصفير الطلبات</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500">
                  <ShoppingCart className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="font-bold">لا توجد طلبات مطابقة للبحث أو الفلتر</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-[#ea1b25]">{order.orderNumber}</span>
                          <span className="font-bold text-gray-900 dark:text-white text-sm">{order.customerName}</span>
                          <span className="text-xs text-gray-400 font-mono">{order.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Status select */}
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200"
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="processing">جاري التوصيل</option>
                            <option value="delivered">تم التسليم</option>
                            <option value="cancelled">ملغي</option>
                          </select>

                          {/* WhatsApp Customer */}
                          <a
                            href={`https://api.whatsapp.com/send?phone=${order.phone.startsWith('0') ? '962' + order.phone.substring(1) : order.phone}&text=${encodeURIComponent(`مرحباً أستاذ ${order.customerName}، معكم خدمة عملاء متجر رزويل الأردن بخصوص طلبكم رقم ${order.orderNumber}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition cursor-pointer"
                            title="مراسلة العميل عبر واتساب"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Delete order */}
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الطلب ${order.orderNumber}؟`)) {
                                onDeleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-950/40 transition cursor-pointer"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800 space-y-1">
                          <div className="font-bold text-gray-500">معلومات الاتصال والشحن:</div>
                          <div className="text-gray-900 dark:text-white font-medium">الهاتف: <span className="font-mono text-[#ea1b25]">{order.phone}</span></div>
                          <div className="text-gray-700 dark:text-gray-300">العنوان: {order.address} ({order.city})</div>
                          {order.notes && <div className="text-gray-500 italic">ملاحظات: {order.notes}</div>}
                        </div>

                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800 space-y-1 md:col-span-2">
                          <div className="font-bold text-gray-500">المنتجات المطلوبة:</div>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-gray-800 dark:text-gray-200">
                                <span>• {item.productName} <span className="text-gray-400 font-mono">({item.productCode})</span> × <strong className="text-gray-900 dark:text-white">{item.quantity}</strong></span>
                                <span className="font-bold font-tajawal">{item.price * item.quantity} د.أ</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between font-bold">
                            <span className="text-gray-600 dark:text-gray-400">الشحن لكافة محافظات الأردن ({order.shippingCost} د.أ) + الإجمالي:</span>
                            <span className="text-sm text-[#ea1b25] font-black font-tajawal">{order.grandTotal} دينار أردني</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS & PRICING IN JOD + COMPUTER FILE UPLOAD */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#202020] p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="ابحث عن منتج معروض، كود، أو تصنيف..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full h-9 pr-8 pl-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#ea1b25]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab('templates')}
                    className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>⚡ تصفح قوالب رزويل الجاهزة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(!isAddProductOpen)}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddProductOpen ? 'إلغاء الإضافة' : 'إضافة صنف مخصص'}</span>
                  </button>

                  {products.length > 0 && onClearAllProducts && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من رغبتك في تصفير وحذف جميع المنتجات المعروضة في المتجر للبدء من الصفر؟ (يمكنك إضافة أي صنف تريده لاحقاً من قوالب رزويل بضغطة زر)')) {
                          onClearAllProducts();
                        }
                      }}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap border border-red-200 dark:border-red-900/50"
                      title="تصفير جميع منتجات المتجر"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>تصفير المتجر</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills for Admin */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'اضافات الوقود', 'اضافات الزيت', 'زيوت المحركات', 'زيوت ناقل الحركه', 'صيانه و اصلاح', 'مياه الردياتير و الاضافات', 'العنايه بالسياره', 'الدراجات الناريه', 'معدات'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAdminCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                      adminCategoryFilter === cat
                        ? 'bg-[#ea1b25] text-white shadow-xs'
                        : 'bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {cat === 'all' ? `جميع الأقسام (${products.length})` : cat}
                  </button>
                ))}
              </div>

              {/* Add Product Form with Computer File Upload */}
              {isAddProductOpen && (
                <form onSubmit={handleCreateProduct} className="p-4 bg-white dark:bg-[#202020] rounded-xl border-2 border-red-200 dark:border-red-950 space-y-4 text-xs animate-scale-up">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 text-[#ea1b25]">
                      <Plus className="w-4 h-4" />
                      <span>إضافة منتج جديد لكتالوج رزويل الأردن</span>
                    </h4>
                  </div>

                  {/* Template Quick Selection */}
                  {templates && templates.length > 0 && (
                    <div className="p-3 bg-red-50/80 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 space-y-1.5">
                      <label className="block font-bold text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#ea1b25]" />
                        <span>تعبئة سريعة من قوالب رزويل الجاهزة (الصور والشروحات الألمانية الأصلية)</span>
                      </label>
                      <select
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (!selectedId) return;
                          const tmpl = templates.find(t => t.id === selectedId);
                          if (tmpl) {
                            handleSelectTemplateForForm(tmpl);
                          }
                        }}
                        defaultValue=""
                        className="w-full h-8 px-2.5 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-[#1a1a1a] text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                      >
                        <option value="">-- اختر قالباً لتعبئة الاسم والصورة والشرح والمواصفات فوراً --</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category}) - #{t.code}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500">
                        عند اختيار أي صنف، يتم جلب صورته وشرحه ومواصفاته فوراً، وتستطيع تعديل السعر والضغط على حفظ!
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold mb-1">اسم المنتج *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: رزويل RZ10E زيت تخليقي 5W30"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">السعر بالدينار الأردني (د.أ) *</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        placeholder="مثال: 12.5"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-bold text-[#ea1b25]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">كود المنتج (Code)</label>
                      <input
                        type="text"
                        placeholder="مثال: 1050070"
                        value={newProduct.code}
                        onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">القسم</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                      >
                        <option value="اضافات الوقود">اضافات الوقود</option>
                        <option value="اضافات الزيت">اضافات الزيت</option>
                        <option value="زيوت المحركات">زيوت المحركات</option>
                        <option value="زيوت ناقل الحركه">زيوت ناقل الحركه</option>
                        <option value="صيانه و اصلاح">صيانه و اصلاح</option>
                        <option value="مياه الردياتير و الاضافات">مياه الردياتير و الاضافات</option>
                        <option value="العنايه بالسياره">العنايه بالسياره</option>
                        <option value="الدراجات الناريه">الدراجات الناريه</option>
                        <option value="معدات">معدات</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">الحجم / السعة</label>
                      <input
                        type="text"
                        placeholder="مثال: 300 مل أو 4 لتر"
                        value={newProduct.volume}
                        onChange={(e) => setNewProduct({ ...newProduct, volume: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">العلامة التجارية</label>
                      <input
                        type="text"
                        value="رزويل - RZ Oil Germany"
                        disabled
                        className="w-full h-8 px-2 rounded border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#111] text-gray-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* COMPUTER IMAGE FILE UPLOAD ZONE */}
                  <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-[#181818] rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="block font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-[#ea1b25]" />
                        <span>تحميل صورة المنتج من جهاز الكمبيوتر *</span>
                      </span>
                      {uploadedImageFile && (
                        <span className="text-[11px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تم تحميل الصورة بنجاح</span>
                        </span>
                      )}
                    </label>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="computer-image-upload"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                    />

                    {uploadedImageFile ? (
                      /* Preview Box */
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#202020] rounded-xl border border-gray-300 dark:border-gray-600 shadow-xs">
                        <img
                          src={uploadedImageFile}
                          alt="معاينة الصورة المرفوعة"
                          className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-[#111] p-1 border border-gray-200 dark:border-gray-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white truncate">
                            {uploadedFileName || 'صورة مختارة من الكمبيوتر'}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            تم تحويل وتجهيز الصورة للعرض والحفظ في المتجر
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>تغيير</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImageFile(null);
                              setUploadedFileName('');
                              setNewProduct(prev => ({ ...prev, image: '' }));
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Upload Zone */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleImageFile(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`w-full p-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                          isDragging 
                            ? 'border-[#ea1b25] bg-red-50 dark:bg-red-950/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-[#ea1b25] bg-white dark:bg-[#202020]'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-[#ea1b25] flex items-center justify-center">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
                            انقر لاختيار صورة من جهاز الكمبيوتر أو اسحب الصورة وأفلتها هنا
                          </span>
                          <p className="text-[11px] text-gray-400 mt-1">
                            الصيغ المدعومة: PNG, JPG, JPEG, WEBP مباشرة من جهازك
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold mb-1">وصف المنتج</label>
                    <textarea
                      rows={2}
                      placeholder="وصف مختصر لمميزات المنتج وفوائده للسيارة..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(false)}
                      className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[#ea1b25] hover:bg-[#c9141d] text-white font-bold cursor-pointer"
                    >
                      حفظ المنتج الجديد
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table or Empty State */}
              {products.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#202020] rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/50 space-y-4 shadow-xs">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 text-[#ea1b25] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="font-black text-base text-gray-900 dark:text-white">
                      المتجر حالياً مصفّر وخالٍ من المنتجات
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      لقد تم تصفير المتجر بنجاح كما طلبت. يمكنك الآن إضافة المنتجات التي تريدها فوراً بالصور والشروحات الألمانية الرسمية المحفوظة في كتالوج القوالب، مع تحديد السعر بالدينار الأردني!
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveTab('templates')}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تصفح كتالوج رزويل وإضافة المنتجات فوراً (30+ صنف)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(true)}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      إضافة صنف مخصص
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-gray-50 dark:bg-[#181818] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="p-3">المنتج والصورة</th>
                        <th className="p-3">كود الصنف</th>
                        <th className="p-3">القسم</th>
                        <th className="p-3">السعر الحالي (د.أ)</th>
                        <th className="p-3">حالة التوفر</th>
                        <th className="p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-[#252525]">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 object-contain p-1 rounded bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</div>
                                <div className="text-[10px] text-gray-400">{p.volume || '300 مل'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-gray-700 dark:text-gray-300">{p.code}</td>
                          <td className="p-3 text-gray-500">{p.category}</td>
                          <td className="p-3 font-tajawal">
                            {editingPriceId === p.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(parseFloat(e.target.value))}
                                  className="w-16 h-7 px-1 text-xs font-bold border border-red-400 rounded bg-white dark:bg-[#181818] text-right font-mono"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSavePrice(p.id)}
                                  className="p-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                                  title="حفظ"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingPriceId(null)}
                                  className="p-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded cursor-pointer"
                                  title="إلغاء"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-sm text-[#ea1b25]">{p.price} د.أ</span>
                                <button
                                  onClick={() => {
                                    setEditingPriceId(p.id);
                                    setTempPrice(p.price);
                                  }}
                                  className="p-1 text-gray-400 hover:text-[#ea1b25] transition cursor-pointer"
                                  title="تعديل السعر"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => onToggleProductStock(p.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                p.inStock
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                              }`}
                            >
                              {p.inStock ? 'متوفر' : 'نفد المخزون'}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف المنتج ${p.name}؟`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition cursor-pointer"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          )}

          {/* TAB: RZ OIL GERMANY OFFICIAL TEMPLATES CATALOG */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <RzTemplateLibrary
                templates={templates}
                currentStoreProducts={products}
                onAddTemplateToStore={(template, customPrice) => {
                  if (onAddTemplateToStore) {
                    onAddTemplateToStore(template, customPrice);
                  } else {
                    onAddProduct({
                      ...template,
                      id: 'prod-' + template.id + '-' + Date.now(),
                      price: customPrice > 0 ? customPrice : template.price,
                      inStock: true
                    });
                  }
                }}
                onRemoveFromStore={(productId) => {
                  onDeleteProduct(productId);
                }}
                onFillFormWithTemplate={(template) => {
                  handleSelectTemplateForForm(template);
                  setActiveTab('products');
                  setIsAddProductOpen(true);
                }}
              />
            </div>
          )}

          {/* TAB 4: DISTRIBUTORS IN JORDAN */}
          {activeTab === 'distributors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-[#202020] p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">الموزعون ومراكز الصيانة المعتمدة في الأردن</h4>
                  <p className="text-xs text-gray-400">شبكة التوزيع المعتمدة لزيوت ومواد RZ Oil الألمانية بالمملكة</p>
                </div>

                <button
                  onClick={() => setIsAddDistOpen(!isAddDistOpen)}
                  className="px-3.5 py-2 bg-[#ea1b25] hover:bg-[#c9141d] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddDistOpen ? 'إلغاء' : 'إضافة موزع جديد'}</span>
                </button>
              </div>

              {isAddDistOpen && (
                <form onSubmit={handleCreateDistributor} className="p-4 bg-white dark:bg-[#202020] rounded-xl border border-red-200 dark:border-red-950 space-y-3 text-xs animate-scale-up">
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 text-[#ea1b25]">
                    <Building className="w-4 h-4" />
                    <span>إضافة نقطة بيع / موزع معتمد جديد في الأردن</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold mb-1">المحافظة *</label>
                      <select
                        value={newDist.city}
                        onChange={(e) => setNewDist({ ...newDist, city: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                      >
                        <option value="عمان">عمان</option>
                        <option value="إربد">إربد</option>
                        <option value="الزرقاء">الزرقاء</option>
                        <option value="العقبة">العقبة</option>
                        <option value="البلقاء (السلط)">البلقاء (السلط)</option>
                        <option value="مادبا">مادبا</option>
                        <option value="جرش">جرش</option>
                        <option value="عجلون">عجلون</option>
                        <option value="المفرق">المفرق</option>
                        <option value="الكرك">الكرك</option>
                        <option value="الطفيلة">الطفيلة</option>
                        <option value="معان">معان</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">المنطقة / الشارع</label>
                      <input
                        type="text"
                        placeholder="مثال: شارع المدينة المنورة، الصويفية"
                        value={newDist.area}
                        onChange={(e) => setNewDist({ ...newDist, area: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">رقم الهاتف الأردني *</label>
                      <input
                        type="tel"
                        required
                        placeholder="079XXXXXXX"
                        value={newDist.phone}
                        onChange={(e) => setNewDist({ ...newDist, phone: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-mono text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">اسم المركز أو الوصف</label>
                      <input
                        type="text"
                        placeholder="مثال: مركز فحص وخدمة سيارات المعتمد"
                        value={newDist.address}
                        onChange={(e) => setNewDist({ ...newDist, address: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDistOpen(false)}
                      className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded bg-[#ea1b25] hover:bg-[#c9141d] text-white font-bold cursor-pointer"
                    >
                      حفظ الموزع
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {distributors.map((d) => (
                  <div 
                    key={d.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2 relative group"
                  >
                    {editingDistId === d.id && editDistForm ? (
                      <form onSubmit={handleSaveDistEdit} className="space-y-2.5">
                        <div className="font-bold text-xs text-[#ea1b25] flex items-center justify-between">
                          <span>تعديل الموزع:</span>
                          <span className="text-[10px] text-gray-400">ID: {d.id}</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-0.5">المحافظة</label>
                          <select
                            value={editDistForm.city}
                            onChange={(e) => setEditDistForm({ ...editDistForm, city: e.target.value })}
                            className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-xs"
                          >
                            {['عمان', 'إربد', 'الزرقاء', 'العقبة', 'البلقاء (السلط)', 'مادبا', 'جرش', 'عجلون', 'المفرق', 'الكرك', 'الطفيلة', 'معان'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-0.5">رقم الهاتف الأردني</label>
                          <input
                            type="tel"
                            required
                            value={editDistForm.phone}
                            onChange={(e) => setEditDistForm({ ...editDistForm, phone: e.target.value })}
                            className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-xs font-mono text-left"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-0.5">المنطقة / الشارع</label>
                          <input
                            type="text"
                            value={editDistForm.area}
                            onChange={(e) => setEditDistForm({ ...editDistForm, area: e.target.value })}
                            className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-0.5">اسم المركز / العنوان</label>
                          <input
                            type="text"
                            value={editDistForm.address}
                            onChange={(e) => setEditDistForm({ ...editDistForm, address: e.target.value })}
                            className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-xs"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                          <button
                            type="button"
                            onClick={cancelEditDist}
                            className="px-2.5 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>حفظ</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#ea1b25]" />
                            <span>{d.city}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditDist(d)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                              title="تعديل بيانات الموزع"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف موزع "${d.city}"؟`)) {
                                  onDeleteDistributor(d.id);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 dark:text-gray-300">{d.address || d.area}</div>
                        {d.area && d.address && <div className="text-[11px] text-gray-400">{d.area}</div>}

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                          <a
                            href={`tel:${d.phone}`}
                            className="text-[#ea1b25] font-mono font-bold flex items-center gap-1 hover:underline"
                            dir="ltr"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{d.phone}</span>
                          </a>
                          <a
                            href={`https://api.whatsapp.com/send?phone=962${d.phone.replace(/\D/g, '').replace(/^0+/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-700 font-bold flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>تواصل</span>
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: JORDAN STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-4">
              <form onSubmit={handleSaveSettingsSubmit} className="bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">إعدادات متجر رزويل الأردن</h4>
                    <p className="text-gray-400">تخصيص معلومات العملة والشحن والتواصل الخاصة بالمملكة الأردنية</p>
                  </div>
                  {settingsSaved && (
                    <span className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم حفظ التعديلات!</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold mb-1">اسم المتجر</label>
                    <input
                      type="text"
                      value={localSettings.storeName}
                      onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">الدولة</label>
                      <input
                        type="text"
                        disabled
                        value="المملكة الأردنية الهاشمية (Jordan 🇯🇴)"
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#151515] text-gray-500 font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">العملة الرسمية</label>
                      <input
                        type="text"
                        disabled
                        value="دينار أردني (JOD / د.أ)"
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#151515] text-gray-500 font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">سعر الشحن والتوصيل لكافة المحافظات (د.أ)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={localSettings.shippingCost}
                        onChange={(e) => setLocalSettings({ ...localSettings, shippingCost: parseFloat(e.target.value) || 0 })}
                        className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-bold text-[#ea1b25]"
                      />
                      <span className="absolute left-3 top-2 text-gray-400 font-bold">د.أ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">هاتف خدمة العملاء الأردني</label>
                      <input
                        type="text"
                        value={localSettings.supportPhone}
                        onChange={(e) => setLocalSettings({ ...localSettings, supportPhone: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-mono text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">رقم الواتساب الأردني للطلبات</label>
                      <input
                        type="text"
                        value={localSettings.whatsappPhone}
                        onChange={(e) => setLocalSettings({ ...localSettings, whatsappPhone: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">ساعات وأيام العمل</label>
                    <input
                      type="text"
                      value={localSettings.workingHours}
                      onChange={(e) => setLocalSettings({ ...localSettings, workingHours: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#ea1b25] hover:bg-[#c9141d] text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ إعدادات المتجر</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: INFINITYFREE MYSQL DATABASE (إدارة وربط قاعدة البيانات الحقيقية) */}
          {activeTab === 'database' && (
            <div className="space-y-4 animate-scale-up text-xs">
              
              {/* Top Banner Status */}
              <div className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ea1b25]/10 text-[#ea1b25] flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <span>قاعدة بيانات InfinityFree (MySQL / MariaDB)</span>
                        {dbConfig?.isConfigured ? (
                          <span className="bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            مهيأة ومتصلة 🟢
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            بانتظار الإعداد والربط 🟡
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-400 text-xs mt-0.5">
                        الربط السحابي الحقيقي لتخزين المنتجات، والموزعين، وطلبات الزبائن في الأردن فور وصولها.
                      </p>
                    </div>
                  </div>

                  {onOpenDbSetup && (
                    <button
                      onClick={onOpenDbSetup}
                      className="px-4 py-2 bg-[#ea1b25] hover:bg-[#c9141d] text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{dbConfig?.isConfigured ? 'تعديل وفحص الربط' : 'إعداد وربط قاعدة البيانات'}</span>
                    </button>
                  )}
                </div>

                {/* Connection Specs Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-400 block text-[11px]">خادم القاعدة (Host)</span>
                    <span className="font-bold font-mono text-gray-800 dark:text-gray-200 text-xs truncate block" dir="ltr">
                      {dbConfig?.dbHost || 'لم يحدد بعد'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-400 block text-[11px]">اسم القاعدة (DB Name)</span>
                    <span className="font-bold font-mono text-gray-800 dark:text-gray-200 text-xs truncate block" dir="ltr">
                      {dbConfig?.dbName || 'لم يحدد بعد'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-400 block text-[11px]">مستخدم القاعدة (User)</span>
                    <span className="font-bold font-mono text-gray-800 dark:text-gray-200 text-xs truncate block" dir="ltr">
                      {dbConfig?.dbUser || 'لم يحدد بعد'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-400 block text-[11px]">مسار ملف الربط (Bridge)</span>
                    <span className="font-bold font-mono text-gray-800 dark:text-gray-200 text-xs truncate block" dir="ltr">
                      {dbConfig?.apiEndpoint || './api.php'}
                    </span>
                  </div>
                </div>

                {/* Quick File Downloads */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500">الملفات الجاهزة للرفع على InfinityFree (مجلد htdocs):</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="/api.php"
                      download="api.php"
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#252525] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-[#ea1b25]" />
                      <span>تحميل ملف api.php</span>
                    </a>

                    <a
                      href="/rzoil_database.sql"
                      download="rzoil_database.sql"
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#252525] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-[#ea1b25]" />
                      <span>تحميل سكريبت rzoil_database.sql</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Database Tables Overview */}
              <div className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
                <h5 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#ea1b25]" />
                  <span>جداول قاعدة البيانات الرسمية (Schema Tables):</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#181818] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-gray-900 dark:text-white">rzoil_orders</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                        {orders.length} طلب
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">حفظ كافة بيانات الزبائن وأرقام هواتفهم في الأردن وتفاصيل طلباتهم.</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#181818] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-gray-900 dark:text-white">rzoil_products</span>
                      <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px]">
                        {products.length} منتج
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">أسعار المنتجات بالدينار الأردني، والكميات، وحالة التوفر، والصور.</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#181818] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-gray-900 dark:text-white">rzoil_distributors</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                        {distributors.length} موزع
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">شبكة الموزعين ومراكز الصيانة المعتمدة في عمان وإربد والزرقاء والعقبة.</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#181818] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-gray-900 dark:text-white">rzoil_settings</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                        نشط
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">أرقام خدمة العملاء والواتساب وتكلفة الشحن الرسمية للأردن.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: ADMIN CREDENTIALS & SECURITY (تغيير اليوزر والباسورد) */}
          {activeTab === 'security' && (
            <div className="max-w-xl space-y-4 animate-scale-up">
              <form onSubmit={handleUpdateSecurity} className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 text-xs shadow-sm">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 text-[#ea1b25]">
                      <KeyRound className="w-5 h-5" />
                      <span>تغيير اسم المستخدم وكلمة المرور للإدارة (Admin)</span>
                    </h4>
                    <p className="text-gray-400 mt-0.5">
                      قم بتحديث بيانات الدخول الخاصة بك لحماية لوحة الإدارة من الدخول غير المصرح به.
                    </p>
                  </div>
                </div>

                {securitySuccessMsg && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-300 flex items-center gap-2 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
                    <span>{securitySuccessMsg}</span>
                  </div>
                )}

                {securityErrorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{securityErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      اسم المستخدم الحالي
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={adminCredentials.username}
                        className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#181818] text-gray-500 font-mono font-bold cursor-not-allowed"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      كلمة المرور الحالية (للتأكيد قبل التغيير) *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="أدخل كلمة المرور الحالية للتأكيد..."
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      اسم المستخدم الجديد (Admin Username) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="أدخل اسم المستخدم الجديد..."
                        value={newUsernameInput}
                        onChange={(e) => setNewUsernameInput(e.target.value)}
                        className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none font-mono"
                        dir="ltr"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      كلمة المرور الجديدة (New Password) *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="أدخل كلمة المرور الجديدة (4 أحرف أو أرقام على الأقل)..."
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="أعد إدخال كلمة المرور الجديدة للتأكيد..."
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.99] text-white font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>تحديث وحفظ بيانات الدخول الجديدة</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
