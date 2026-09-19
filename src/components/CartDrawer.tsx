import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { RZ_OFFICIAL_FALLBACK_LOGO } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onIncrement,
  onDecrement,
  onRemove,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-sm sm:max-w-md bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 shadow-2xl flex flex-col border-r border-gray-200 dark:border-gray-700">
          
          {/* Unified Red Header */}
          <div className="bg-[#ea1b25] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h3 className="font-bold text-base">سلة المشتريات ({cartItems.length})</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer text-white"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-3" />
                <h4 className="font-bold text-base text-gray-700 dark:text-gray-300">سلة المشتريات فارغة</h4>
                <p className="text-xs mt-1">تصفح المنتجات وأضف ما تحتاجه لسلتك</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[#ea1b25] text-white text-xs font-bold rounded-lg hover:bg-[#c9141d] transition cursor-pointer"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="flex gap-3 p-3 bg-gray-50 dark:bg-[#242424] rounded-xl border border-gray-200/80 dark:border-gray-800 items-center"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain bg-white dark:bg-[#1a1a1a] p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = RZ_OFFICIAL_FALLBACK_LOGO;
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {item.product.name}
                    </h5>
                    <div className="text-xs text-[#ea1b25] font-black font-tajawal mt-0.5">
                      {item.product.price.toLocaleString()} د.أ
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#1e1e1e] overflow-hidden">
                        <button
                          onClick={() => onIncrement(item.product.id)}
                          className="px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onDecrement(item.product.id)}
                          className="px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                      </div>

                      <button
                        onClick={() => onRemove(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition p-1 cursor-pointer"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                    {(item.product.price * item.quantity).toLocaleString()} د.أ
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Totals and Action */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161616] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">المجموع الجزئي:</span>
                <span className="text-lg font-black font-tajawal text-gray-900 dark:text-white">
                  {total.toLocaleString()} د.أ
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck className="w-4 h-4 text-green-600" />
                <span>الشحن متاح لكافة المحافظات مع خدمة الدفع عند الاستلام</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.99] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
