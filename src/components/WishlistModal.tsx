import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 dark:border-gray-700">
        
        <div className="bg-[#ea1b25] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white" />
            <h3 className="font-bold text-base">قائمة المنتجات المفضلة ({wishlistProducts.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 space-y-2">
              <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
              <p className="font-bold text-sm">قائمة المفضلة فارغة حالياً</p>
              <p className="text-xs">اضغط على زر المفضلة في صفحة أي منتج لحفظه هنا</p>
            </div>
          ) : (
            wishlistProducts.map((prod, idx) => (
              <div
                key={`${prod.id}-${idx}`}
                className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div 
                  onClick={() => { onSelectProduct(prod); onClose(); }} 
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain bg-white dark:bg-[#1a1a1a] p-1 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.rzoil.net/us/164/pidwebp600/7612/f133288936368174447131-1.webp";
                    }}
                  />
                  <div className="truncate">
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {prod.name}
                    </h5>
                    <div className="text-xs text-[#ea1b25] font-black font-tajawal mt-0.5">
                      {prod.price.toLocaleString()} د.أ
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAddToCart(prod)}
                    className="p-2 bg-[#ea1b25] text-white rounded-lg hover:bg-[#c9141d] transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="إضافة للسلة"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">أضف للسلة</span>
                  </button>
                  <button
                    onClick={() => onRemoveFromWishlist(prod.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    title="حذف من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
