import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { 
  ShieldCheck, 
  Award, 
  Truck, 
  CheckCircle2, 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  Search, 
  SlidersHorizontal,
  Flame,
  Phone,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

interface HomeViewProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  cartQuantities: { [key: string]: number };
  wishlistIds: string[];
  onOpenDistributors: () => void;
  onOpenContact: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onToggleFavorite,
  cartQuantities,
  wishlistIds,
  onOpenDistributors,
  onOpenContact
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory && selectedCategory !== 'الكل') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }

    return result;
  }, [products, selectedCategory, localSearch, sortBy]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const map: { [cat: string]: number } = { 'الكل': products.length };
    products.forEach(p => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <div className="w-full pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#181818] via-[#222222] to-[#181818] text-white py-10 sm:py-14 border-b border-gray-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ea1b25_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            {/* German Badge */}
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-800/80 text-red-300 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#ea1b25] animate-ping"></span>
              <span>منتجات ألمانية أصلية 100% حاصلة على اعتماد TÜV العالمية</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              رزويل الأردن <span className="text-[#ea1b25]">RZ Oil</span>
              <span className="block text-xl sm:text-2xl font-bold text-gray-300 mt-2 font-sans">
                الزيوت والإضافات الألمانية الرائدة لمحركات فائقة الأداء
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              الموزع المعتمد لكافة منتجات <strong className="text-white">رزويل الألمانية (RZ Germany)</strong> في المملكة الأردنية الهاشمية. حلول احترافية متطورة لتنظيف دورات الوقود (GDI)، حماية المحركات بالسيراميك، وزيوت التخليق الكامل PAO.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <Truck className="w-4 h-4 text-[#ea1b25] shrink-0" />
                <span>توصيل لكافة محافظات الأردن</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span>دفع عند الاستلام بالدينار (JOD)</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>معتمد من TÜV الألمانية</span>
              </div>
            </div>

            {/* Quick Hero Search */}
            <div className="pt-2">
              <div className="relative max-w-xl">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو كود الصنف (مثل: RZ21G، زيت 5W-30، سيراميك...)"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-12 pr-4 pl-12 rounded-xl bg-white dark:bg-[#282828] text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 text-sm focus:outline-none focus:border-[#ea1b25] shadow-lg transition"
                />
                <div className="absolute left-3 top-3.5 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Tabs */}
      <section className="sticky top-[64px] z-30 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
            <button
              onClick={() => onSelectCategory('الكل')}
              className={`shrink-0 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'الكل'
                  ? 'bg-[#ea1b25] text-white shadow-md shadow-red-500/20'
                  : 'bg-gray-100 dark:bg-[#252525] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>جميع المنتجات</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'الكل' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {products.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#ea1b25] text-white shadow-md shadow-red-500/20'
                      : 'bg-gray-100 dark:bg-[#252525] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalog & Filter Header */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>{selectedCategory === 'الكل' ? 'كتالوج المنتجات الكامل' : selectedCategory}</span>
            </h2>
            <span className="text-xs bg-red-100 dark:bg-red-950/60 text-[#ea1b25] font-bold px-2.5 py-0.5 rounded-full">
              {filteredProducts.length} صنف متاح
            </span>
          </div>

          {/* Sorter and Search Clear */}
          <div className="flex items-center gap-3">
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="text-xs text-red-500 hover:underline cursor-pointer"
              >
                مسح البحث
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span>الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 dark:bg-[#252525] border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#ea1b25]"
              >
                <option value="default">الافتراضي (الأكثر طلباً)</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="name">الاسم الأبجدي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              لم يتم العثور على منتجات مطابقة
            </h3>
            <p className="text-xs text-gray-500">
              جرب البحث بكلمات أخرى أو اختر قسماً آخر من الأقسام أعلاه.
            </p>
            <button
              onClick={() => { setLocalSearch(''); onSelectCategory('الكل'); }}
              className="mt-2 px-4 py-2 bg-[#ea1b25] text-white rounded-xl text-xs font-bold hover:bg-[#c9141d] transition cursor-pointer"
            >
              عرض كافة المنتجات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 pt-6">
            {filteredProducts.map((product, pIdx) => {
              const inWishlist = wishlistIds.includes(product.id);
              const qty = cartQuantities[product.id] || 0;

              return (
                <div
                  key={`${product.id}-${pIdx}`}
                  className="group relative bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-red-400 dark:hover:border-red-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Badges & Wishlist */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 items-start">
                    <span className="bg-[#ea1b25] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      ألماني أصلي 🇩🇪
                    </span>
                    {product.originalPrice && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        خصم
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(product);
                    }}
                    className={`absolute top-2.5 left-2.5 z-10 p-2 rounded-full transition shadow-xs cursor-pointer ${
                      inWishlist 
                        ? 'bg-red-50 dark:bg-red-950/80 text-[#ea1b25]' 
                        : 'bg-white/80 dark:bg-black/60 text-gray-400 hover:text-[#ea1b25]'
                    }`}
                    title={inWishlist ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>

                  {/* Image Container */}
                  <div 
                    onClick={() => onSelectProduct(product)}
                    className="relative w-full h-52 sm:h-56 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#252525] dark:to-[#1c1c1c] flex items-center justify-center p-4 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://www.rzoil.net/us/164/pidwebp600/7612/f133288936368174447131-1.webp";
                      }}
                    />
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      {/* Category & Code */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="text-[#ea1b25] font-semibold">{product.category}</span>
                        <span className="font-mono">كود: {product.code}</span>
                      </div>

                      {/* Title */}
                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="font-black text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-[#ea1b25] dark:hover:text-[#ea1b25] transition cursor-pointer leading-snug"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Subtitle / Volume */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {product.subtitle || product.volume}
                      </p>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-[#ea1b25]">
                            {product.price}
                          </span>
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                            د.أ (JOD)
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through mr-1">
                              {product.originalPrice} د.أ
                            </span>
                          )}
                        </div>
                        {product.volume && (
                          <span className="text-[11px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">
                            {product.volume}
                          </span>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="w-full py-2 px-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#2c2c2c] dark:hover:bg-[#333333] text-gray-800 dark:text-gray-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>عرض التفاصيل</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onAddToCart(product)}
                          className="w-full py-2 px-2 rounded-xl bg-[#ea1b25] hover:bg-[#c9141d] text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{qty > 0 ? `في السلة (${qty})` : 'أضف للسلة'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Choose RZ Germany Section */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            لماذا يفضل السائقون والفنيون <span className="text-[#ea1b25]">رزويل الألمانية</span>؟
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            أكثر من 50 عاماً من الخبرة والابتكار الهندسي في مجال كيمياء الزيوت والإضافات الخاصة بالسيارات في ألمانيا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-[#202020] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-[#ea1b25] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">اعتماد TÜV الألماني</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              جميع الإضافات والزيوت خاضعة لاختبارات معملية مستقلة وحاصلة على شهادات TÜV Thüringen للسلامة والأداء الفعلي.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-[#202020] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-[#ea1b25] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">حماية محركات GDI والتيربو</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              تركيبات مخصصة لمحركات الحقن المباشر عالي الضغط لمنع تراكم الكربون على الصمامات وحماية التيربو.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-[#202020] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-[#ea1b25] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">شبكة توزيع معتمدة بالأردن</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              مراكز خدمة وموزعون معتمدون في عمان، إربد، الزرقاء، العقبة، والسلط لضمان وصول المنتج الأصلي ليدك.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-[#202020] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-[#ea1b25] flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">شحن سريع ودفع عند الاستلام</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              توصيل مباشر لباب منزلك أو ورشتك في جميع محافظات الأردن مع خيار الدفع نقداً عند استلام طلبك ومعاينته.
            </p>
          </div>
        </div>
      </section>

      {/* Jordan Help / Contact CTA */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-gradient-to-r from-[#181818] to-[#2a1012] border border-red-900/60 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-right">
            <span className="text-[#ea1b25] text-xs font-bold tracking-wider">خدمة العملاء والاستشارات الفنية - الأردن</span>
            <h3 className="text-xl sm:text-2xl font-black">
              هل تحتاج مساعدة لاختيار الزيت أو المنظف المناسب لسيارتك؟
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              مهندسونا وفنيونا متاحون يومياً لتقديم النصيحة الفنية المناسبة لنوع وموديل محرك سيارتك.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={onOpenContact}
              className="px-5 py-3 rounded-xl bg-[#ea1b25] hover:bg-[#c9141d] text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
            >
              <Phone className="w-4 h-4" />
              <span>اتصل بنا / واتساب</span>
            </button>
            <button
              onClick={onOpenDistributors}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <MapPin className="w-4 h-4" />
              <span>مراكز التوزيع في الأردن</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
