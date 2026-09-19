import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Heart, 
  ShoppingCart, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Award, 
  ZoomIn, 
  Share2, 
  Flame,
  Check
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  quantityInCart: number;
  isFavorite: boolean;
  onAddToCart: () => void;
  onIncrementQuantity: () => void;
  onDecrementQuantity: () => void;
  onToggleFavorite: () => void;
  onDirectCheckout: () => void;
  onCategoryClick: (cat: string) => void;
  onShare: () => void;
  onGoHome?: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  quantityInCart,
  isFavorite,
  onAddToCart,
  onIncrementQuantity,
  onDecrementQuantity,
  onToggleFavorite,
  onDirectCheckout,
  onCategoryClick,
  onShare,
  onGoHome
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare();
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-4 sm:py-6">
      {/* Top Return Button & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-nowrap pb-1">
          <button 
            onClick={onGoHome} 
            className="hover:text-[#ea1b25] font-bold text-gray-700 dark:text-gray-300 transition cursor-pointer flex items-center gap-1"
          >
            <span>الصفحة الرئيسية</span>
          </button>
          <span>/</span>
          <button 
            onClick={() => onCategoryClick(product.category)}
            className="hover:text-[#ea1b25] transition cursor-pointer font-medium"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">{product.name}</span>
        </nav>

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#ea1b25] dark:hover:text-[#ea1b25] bg-gray-100 dark:bg-[#252525] hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <span>← العودة إلى الكتالوج الكامل والصفحة الرئيسية</span>
          </button>
        )}
      </div>

      {/* Main Product Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 mb-6">
        <h1 
          id="CPH1_SUBH_productname" 
          className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-snug"
        >
          {product.name}
        </h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            متوفر في المخزن
          </span>
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#ea1b25] hover:border-[#ea1b25] transition cursor-pointer"
            title="مشاركة المنتج"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'مشاركة'}</span>
          </button>
        </div>
      </div>

      {/* Product Content 3-Column / Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Col 1: Product Image Gallery (4 cols) */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center">
          <div className="relative w-full max-w-[400px] aspect-square rounded-2xl bg-white dark:bg-[#202020] border-2 border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center justify-center overflow-hidden group">
            
            {/* German Flag / Certification Pill */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-gray-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              <span className="flex items-center h-2.5 w-3.5 rounded overflow-hidden shadow-xs border border-white/20">
                <span className="bg-black w-1/3 h-full"></span>
                <span className="bg-red-600 w-1/3 h-full"></span>
                <span className="bg-yellow-400 w-1/3 h-full"></span>
              </span>
              <span>Made in Germany</span>
            </div>

            {/* TÜV Rheinland / Cert Badge */}
            {product.certifications && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded">
                <Award className="w-3 h-3 text-blue-600" />
                <span>اعتماد TÜV</span>
              </div>
            )}

            {/* Main Product Image */}
            <img
              id="prdcimage"
              src={product.image}
              alt={product.name}
              className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-125' : 'group-hover:scale-105'
              }`}
              loading="eager"
            />

            {/* Zoom Trigger Button */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute bottom-3 left-3 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow border border-gray-200 dark:border-gray-700 transition cursor-pointer"
              title="تكبير الصورة"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Product Code Badge */}
          <div className="mt-3 w-full max-w-[400px] flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200/80 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="text-gray-500">كود المنتج:</span>
            <span className="text-[#ea1b25] font-mono font-bold tracking-wider">{product.code}</span>
          </div>
        </div>

        {/* Col 2: Description & Specifications (4-5 cols) */}
        <div className="md:col-span-7 lg:col-span-5 space-y-4">
          {/* Subtitle / Headline */}
          {product.subtitle && (
            <div className="p-3 bg-red-50/70 dark:bg-red-950/20 border-r-4 border-[#ea1b25] rounded-r text-gray-900 dark:text-white font-bold text-base leading-relaxed">
              {product.subtitle}
            </div>
          )}

          {/* Intro Description */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
            {product.description}
          </p>

          {/* Features List */}
          <div className="bg-white dark:bg-[#202020] rounded-xl p-4 border border-gray-200 dark:border-gray-800 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2 text-[#ea1b25]">
              <Flame className="w-5 h-5 text-[#ea1b25]" />
              <span>المميزات والفوائد:</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ea1b25] shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Usage & Directions */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-700/80">
              <span className="block font-bold text-gray-900 dark:text-white mb-1">الاستخدام:</span>
              <p className="text-gray-600 dark:text-gray-300">{product.usage}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-gray-700/80">
              <span className="block font-bold text-gray-900 dark:text-white mb-1">طريقة الاستخدام:</span>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-0.5">
                {product.directions.map((dir, idx) => (
                  <li key={idx}>{dir}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Col 3: Action & Purchase Card (.pitemcard from original site) (3-4 cols) */}
        <div className="md:col-span-12 lg:col-span-3">
          <div className="bg-white dark:bg-[#1f1f1f] border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-5 sticky top-24">
            
            {/* Price section */}
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">السعر الرسمي:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white font-tajawal">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-xl font-bold text-[#ea1b25]">دينار أردني</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                شامل ضريبة القيمة المضافة
              </span>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800" />

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">الكمية:</span>
              
              {quantityInCart === 0 ? (
                <button
                  onClick={onAddToCart}
                  className="w-full h-12 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.99] text-white font-bold text-base rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>أضف إلى السلة</span>
                </button>
              ) : (
                <div className="flex items-center justify-between bg-gray-100 dark:bg-[#2a2a2a] p-1.5 rounded-xl border border-gray-300 dark:border-gray-700">
                  <button
                    onClick={onIncrementQuantity}
                    className="w-10 h-10 rounded-lg bg-[#ea1b25] text-white font-black text-xl flex items-center justify-center hover:bg-[#c9141d] transition cursor-pointer"
                    title="زيادة الكمية"
                  >
                    +
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-gray-900 dark:text-white font-mono">
                      {quantityInCart}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">في السلة</span>
                  </div>
                  <button
                    onClick={onDecrementQuantity}
                    className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-black text-xl flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
                    title="إنقاص الكمية"
                  >
                    -
                  </button>
                </div>
              )}

              {/* Direct Checkout (Place Order) Button */}
              <button
                id="placeorderbtn"
                onClick={onDirectCheckout}
                className="w-full h-12 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-base rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <span>إتمام الشراء مباشرة</span>
              </button>

              {/* Add to Wishlist Button */}
              <button
                onClick={onToggleFavorite}
                className={`w-full py-2.5 px-3 rounded-xl border transition flex items-center justify-center gap-2 text-sm font-bold cursor-pointer ${
                  isFavorite 
                    ? 'border-red-300 bg-red-50 dark:bg-red-950/30 text-[#ea1b25]' 
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#ea1b25] hover:text-[#ea1b25]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#ea1b25] text-[#ea1b25]' : ''}`} />
                <span>{isFavorite ? 'تمت الإضافة للمفضلة' : 'أضف للمفضلة'}</span>
              </button>
            </div>

            {/* SKU and Guarantee badges */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between font-mono font-bold text-gray-500">
                <span>Code:</span>
                <span className="text-gray-800 dark:text-gray-200">{product.code}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Truck className="w-4 h-4 text-[#ea1b25] shrink-0" />
                <span>شحن وتوصيل سريع لكافة محافظات المملكة الأردنية الهاشمية</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span>ضمان الجودة الألمانية وأصالة المنتج 100%</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <span>إمكانية الاسترجاع والاستبدال خلال 14 يوم</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
