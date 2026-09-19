import React from 'react';
import { X, ChevronLeft, Layers, Sparkles, MapPin, Phone, Moon, Sun, ShoppingBag, Heart, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryName: string) => void;
  onOpenDistributors: () => void;
  onOpenOffers: () => void;
  onOpenWishlist: () => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAdminAuthenticated?: boolean;
  onGoHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenDistributors,
  onOpenOffers,
  onOpenWishlist,
  onOpenContact,
  onOpenAdmin,
  isDarkMode,
  onToggleDarkMode,
  isAdminAuthenticated = false,
  onGoHome
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-4 bg-[#ea1b25] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 font-bold text-base">
              <Layers className="w-5 h-5" />
              <span>الأقسام والمنتجات</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition cursor-pointer text-white"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Nav Menu */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 bg-gray-50 dark:bg-[#171717] text-xs">
            <button
              onClick={() => { onClose(); onOpenOffers(); }}
              className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 hover:text-[#ea1b25] transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#ea1b25]" />
              <span className="font-bold">العروض والخصومات</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenDistributors(); }}
              className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 hover:text-[#ea1b25] transition cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#ea1b25]" />
              <span className="font-bold">موزعي الأردن</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenWishlist(); }}
              className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 hover:text-[#ea1b25] transition cursor-pointer"
            >
              <Heart className="w-4 h-4 text-[#ea1b25]" />
              <span className="font-bold">المفضلة</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenContact(); }}
              className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 hover:text-[#ea1b25] transition cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#ea1b25]" />
              <span className="font-bold">خدمة العملاء</span>
            </button>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="py-2 flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span>كتالوج المنتجات (الأردن)</span>
            </div>

            {/* Return to Home Page button */}
            {onGoHome && (
              <div className="pb-2">
                <button
                  onClick={() => {
                    onGoHome();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#ea1b25] transition text-sm font-bold border border-red-200 dark:border-red-900/60 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">⌂</span>
                    <span>الصفحة الرئيسية (جميع المنتجات)</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[#ea1b25]" />
                </button>
              </div>
            )}

            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="pt-2">
                <button
                  onClick={() => {
                    onSelectCategory(cat.name);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-800 dark:text-gray-200 hover:text-[#ea1b25] dark:hover:text-[#ea1b25] transition text-sm font-semibold group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-[#ea1b25]" />
                    <span>{cat.name}</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-[#ea1b25] transition-transform group-hover:-translate-x-1" />
                </button>

                {/* Sub items as in original site */}
                <div className="pr-8 pl-2 py-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span 
                    onClick={() => { onSelectCategory(cat.name); onClose(); }} 
                    className="hover:text-[#ea1b25] cursor-pointer"
                  >
                    • الكل
                  </span>
                  <span 
                    onClick={() => { onSelectCategory(cat.name); onClose(); }} 
                    className="hover:text-[#ea1b25] cursor-pointer text-[#ea1b25] font-semibold"
                  >
                    • رزويل
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#141414] space-y-3">
            <button
              onClick={onToggleDarkMode}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white dark:bg-[#222222] border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>تفعيل الوضع النهاري (Light Mode)</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-gray-700" />
                  <span>تفعيل الوضع الداكن (Dark Mode)</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-gray-500">
              RZ Oil Germany - الوكيل الرسمي للمملكة الأردنية الهاشمية 🇯🇴
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
