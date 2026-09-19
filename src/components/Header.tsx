import React from 'react';
import { Menu, Home, User, Heart, ShoppingCart, Search, Moon, Sun, Phone, MapPin, Tag, ShieldCheck, Database } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
  onGoHome: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  onOpenDistributors: () => void;
  onOpenContact: () => void;
  cartTotal: number;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
  isDbConnected?: boolean;
  onOpenDbSetup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onGoHome,
  onOpenCart,
  onOpenWishlist,
  onOpenLogin,
  onOpenAdmin,
  onOpenDistributors,
  onOpenContact,
  cartTotal,
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isDarkMode,
  onToggleDarkMode,
  isAdminAuthenticated = false,
  onAdminLogout,
  isDbConnected = false,
  onOpenDbSetup
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#181818] border-b border-gray-200 dark:border-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-colors">
      {/* Top Bar for Links */}
      <div className="hidden md:flex items-center justify-between px-4 lg:px-8 py-1.5 bg-[#f8f8f8] dark:bg-[#121212] border-b border-gray-200/70 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-5">
          <button 
            onClick={onOpenDistributors}
            className="flex items-center gap-1.5 hover:text-[#ea1b25] transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#ea1b25]" />
            <span>الموزعين المعتمدين في الأردن</span>
          </button>
          <button 
            onClick={onOpenContact}
            className="flex items-center gap-1.5 hover:text-[#ea1b25] transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#ea1b25]" />
            <span>خدمة العملاء والدعم الفني</span>
          </button>
          {isAdminAuthenticated && onOpenDbSetup && (
            <button
              onClick={onOpenDbSetup}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer text-[11px]"
              title="إعداد وفحص اتصال قاعدة بيانات InfinityFree (خاص بالمشرف)"
            >
              <Database className={`w-3.5 h-3.5 ${isDbConnected ? 'text-green-500' : 'text-amber-500'}`} />
              <span className="font-bold flex items-center gap-1">
                <span className="text-gray-500">قاعدة البيانات:</span>
                <span className={isDbConnected ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                  {isDbConnected ? 'متصلة (MySQL) 🟢' : 'ربط InfinityFree 🟡'}
                </span>
              </span>
            </button>
          )}
          <span className="flex items-center gap-1 text-[#ea1b25] font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>منتجات ألمانية أصلية 100%</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleDarkMode} 
            className="flex items-center gap-1 hover:text-[#ea1b25] transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
          </button>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="text-gray-700 dark:text-gray-200 font-bold flex items-center gap-1">
            <span>🇯🇴</span>
            <span>الأردن (JOD / د.أ)</span>
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 h-[64px] flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side (RTL Start): Menu & Home & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            id="btnmenu"
            onClick={onOpenMenu}
            className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="القائمة والأقسام"
            title="تصفح أقسام المتجر"
          >
            <Menu className="w-6 h-6 text-[#ea1b25]" />
          </button>

          {/* Home Icon Button */}
          <button
            id="btnhome"
            onClick={onGoHome}
            className="p-1.5 sm:p-2 rounded-xl text-[#ea1b25] hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition cursor-pointer group"
            aria-label="الرئيسية"
            title="العودة إلى الصفحة الرئيسية وكل المنتجات"
          >
            <Home className="w-6 h-6 text-[#ea1b25] group-hover:scale-110 transition-transform" />
          </button>

          {/* Logo: Red RZ badge on the LEFT of the word OIL with logo icon */}
          <div 
            onClick={onGoHome} 
            dir="ltr"
            className="cursor-pointer flex items-center gap-1.5 sm:gap-2 select-none hover:opacity-90 transition"
            title="رزويل الأردن - Rzoil Jo"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-red-500/30 bg-red-600 shrink-0 shadow-xs flex items-center justify-center">
              <img 
                src="/rzoil-logo.png" 
                alt="Rzoil Jo Logo" 
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col leading-none font-sans text-left">
              <div className="flex items-center gap-1">
                <span className="font-black text-base sm:text-xl tracking-tight text-gray-900 dark:text-white">
                  RZOIL
                </span>
                <span className="text-[10px] sm:text-xs font-black bg-[#ea1b25] text-white px-1 py-0.5 rounded">
                  JO
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-[#ea1b25] uppercase tracking-wider">
                GERMANY
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Box */}
        <div className="flex-1 max-w-[560px] mx-2">
          <form onSubmit={onSearchSubmit} className="relative w-full">
            <input
              id="scanbox"
              type="search"
              placeholder="البحث عن صنف (مثل RZ21G، زيت، منظف...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-[42px] pr-4 pl-12 rounded-lg border-2 border-[#e3e3e3] dark:border-gray-700 bg-white dark:bg-[#202020] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-[#ea1b25] transition"
            />
            <button
              id="sbtn"
              type="submit"
              className="absolute left-1 top-1 bottom-1 w-10 flex items-center justify-center bg-[#ea1b25] text-white rounded-md hover:bg-[#c9141d] transition cursor-pointer"
              title="بحث"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Side (RTL End): User, Wishlist, Cart */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* User / Login (Single Entry Point) */}
          <button
            id="shopuserparent"
            onClick={onOpenLogin}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition cursor-pointer text-sm font-medium ${
              isAdminAuthenticated
                ? 'text-green-600 dark:text-green-400 font-bold hover:bg-green-50 dark:hover:bg-green-950/40'
                : 'text-gray-700 dark:text-gray-200 hover:text-[#ea1b25] dark:hover:text-[#ea1b25]'
            }`}
            title={isAdminAuthenticated ? "حساب المشرف ولوحة الإدارة" : "تسجيل الدخول / لوحة الإدارة"}
          >
            <User className={`w-5 h-5 ${isAdminAuthenticated ? 'text-green-600' : 'text-[#ea1b25]'}`} />
            <span className="hidden sm:inline">
              {isAdminAuthenticated ? 'دخول (مشرف)' : 'دخول'}
            </span>
          </button>

          {/* Wishlist */}
          <button
            id="shopfav"
            onClick={onOpenWishlist}
            className="relative p-2 text-gray-700 dark:text-gray-200 hover:text-[#ea1b25] dark:hover:text-[#ea1b25] rounded-lg transition cursor-pointer"
            title="المفضلة"
          >
            <Heart className="w-5 h-5 text-[#ea1b25]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-[#ea1b25] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart with Total */}
          <button
            id="pnlcart"
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-[#ea1b25] hover:bg-[#d0151f] text-white px-3 py-2 rounded-lg transition cursor-pointer shadow-sm text-sm font-bold"
            title="عرض السلة"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-white text-[#ea1b25] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <span id="carttotal" className="whitespace-nowrap font-tajawal">
              {cartTotal.toLocaleString()} د.أ
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
