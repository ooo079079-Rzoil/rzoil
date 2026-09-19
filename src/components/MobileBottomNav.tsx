import React from 'react';
import { Home, Layers, ShoppingBag, Heart, Phone, MessageSquare } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'home' | 'product';
  onGoHome: () => void;
  onOpenCategories: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenContact: () => void;
  cartCount: number;
  wishlistCount: number;
  whatsappPhone?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onGoHome,
  onOpenCategories,
  onOpenCart,
  onOpenWishlist,
  onOpenContact,
  cartCount,
  wishlistCount,
  whatsappPhone = '0791000001'
}) => {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 transition-colors"
      aria-label="شريط التنقل السفلي للموبايل"
    >
      <div className="grid grid-cols-5 items-center justify-around text-center gap-1 max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer min-h-[48px] ${
            currentView === 'home'
              ? 'text-[#ea1b25] font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">الرئيسية</span>
        </button>

        {/* Categories / Menu */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-gray-600 dark:text-gray-400 hover:text-[#ea1b25] dark:hover:text-[#ea1b25] transition cursor-pointer min-h-[48px]"
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">الأقسام</span>
        </button>

        {/* Cart Button (Central Highlighted) */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#ea1b25] transition cursor-pointer min-h-[48px]"
        >
          <div className="relative">
            <div className={`p-1.5 rounded-full ${cartCount > 0 ? 'bg-[#ea1b25] text-white shadow-md' : 'text-gray-600 dark:text-gray-300'}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#ea1b25] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow border border-[#ea1b25]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold leading-tight mt-0.5">السلة</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center justify-center py-1 rounded-xl text-gray-600 dark:text-gray-400 hover:text-[#ea1b25] transition cursor-pointer min-h-[48px]"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-[#ea1b25] text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">المفضلة</span>
        </button>

        {/* WhatsApp / Contact */}
        <button
          onClick={onOpenContact}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-[#25D366] hover:text-[#1fb355] transition cursor-pointer min-h-[48px]"
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold leading-tight">تواصل</span>
        </button>
      </div>
    </nav>
  );
};
