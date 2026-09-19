import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Eye } from 'lucide-react';

interface RelatedProductsProps {
  products: Product[];
  cartQuantities: { [productId: string]: number };
  onAddToCart: (product: Product) => void;
  onIncrementQuantity: (productId: string) => void;
  onDecrementQuantity: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  cartQuantities,
  onAddToCart,
  onIncrementQuantity,
  onDecrementQuantity,
  onSelectProduct,
}) => {
  // Split into Section 1: "رزويل" and Section 2: "اضافات الوقود" as on rzoil.net
  const section1 = products.slice(0, 6);
  const section2 = products.slice(6);

  const renderProductCard = (item: Product, idx: number) => {
    const qty = cartQuantities[item.id] || 0;

    return (
      <div
        key={`${item.id}-${idx}`}
        className="cardw ypx min-w-[210px] w-[220px] sm:w-[240px] shrink-0 bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-col justify-between hover:shadow-lg transition-all group"
      >
        {/* Product Image & Quick Link */}
        <div
          onClick={() => onSelectProduct(item)}
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="relative w-full aspect-square bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3 flex items-center justify-center overflow-hidden mb-3">
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://www.rzoil.net/us/164/pidwebp600/7612/f133288936368174447131-1.webp";
              }}
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-[#ea1b25] text-white text-xs font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow">
                <Eye className="w-3.5 h-3.5" />
                <span>عرض التفاصيل</span>
              </span>
            </div>
          </div>

          <h4 className="prboxproductname text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 text-center line-clamp-2 min-h-[40px] group-hover:text-[#ea1b25] transition-colors">
            {item.name}
          </h4>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="lbl_price text-base font-black text-gray-900 dark:text-white font-tajawal">
              {item.price.toLocaleString()} د.أ
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              #{item.code}
            </span>
          </div>

          {/* Interactive cart button matching original qpnlc0 */}
          {qty === 0 ? (
            <button
              onClick={() => onAddToCart(item)}
              className="qpnlca w-full py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-[#ea1b25] dark:hover:bg-[#ea1b25] hover:text-white text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>أضف إلى السلة</span>
            </button>
          ) : (
            <div className="qpnlcb flex items-center justify-between bg-red-50 dark:bg-red-950/30 border border-[#ea1b25]/40 rounded-lg p-1">
              <button
                onClick={() => onIncrementQuantity(item.id)}
                className="w-7 h-7 bg-[#ea1b25] text-white font-bold text-sm rounded flex items-center justify-center hover:bg-[#c9141d] transition cursor-pointer"
                title="زيادة"
              >
                +
              </button>
              <span className="text-xs font-black text-gray-900 dark:text-white font-mono">
                {qty}
              </span>
              <button
                onClick={() => onDecrementQuantity(item.id)}
                className="w-7 h-7 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold text-sm rounded flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
                title="إنقاص"
              >
                -
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="relatedproducts" className="w-full max-w-[1280px] mx-auto px-4 py-8 space-y-10">
      
      {/* Section 1: منتجات رزويل (Brand Section) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-gray-200 dark:border-gray-800 pb-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-6 bg-[#ea1b25] rounded-full"></span>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              منتجات إضافات وقود رزويل
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">اسحب للتصفح</span>
        </div>

        <div className="relative overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex gap-4 min-w-max">
            {section1.map(renderProductCard)}
          </div>
        </div>
      </div>

      {/* Section 2: اضافات الوقود (Category Section) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-gray-200 dark:border-gray-800 pb-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-6 bg-[#ea1b25] rounded-full"></span>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              إضافات الوقود والديزل
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">منتجات متوافقة</span>
        </div>

        <div className="relative overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex gap-4 min-w-max">
            {section2.map(renderProductCard)}
          </div>
        </div>
      </div>

    </div>
  );
};
