import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ALL_INITIAL_PRODUCTS } from '../data/products';
import { 
  Search, 
  Plus, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Package, 
  CheckCircle2, 
  Flame,
  Info,
  SlidersHorizontal,
  ExternalLink,
  Trash2,
  Layers,
  RotateCcw
} from 'lucide-react';

interface RzTemplateLibraryProps {
  templates?: Product[];
  currentStoreProducts: Product[];
  onAddTemplateToStore: (template: Product, customPrice: number) => void;
  onRemoveFromStore: (productId: string) => void;
  onFillFormWithTemplate?: (template: Product) => void;
  onAddAllTemplatesToStore?: () => void;
}

export const RzTemplateLibrary: React.FC<RzTemplateLibraryProps> = ({
  templates = ALL_INITIAL_PRODUCTS,
  currentStoreProducts = [],
  onAddTemplateToStore,
  onRemoveFromStore,
  onFillFormWithTemplate,
  onAddAllTemplatesToStore
}) => {
  // Safe fallback to full official catalog
  const safeTemplates = (templates && templates.length > 0) ? templates : ALL_INITIAL_PRODUCTS;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null);
  
  // Custom price map for each template { [templateId]: number }
  const [prices, setPrices] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    safeTemplates.forEach(t => {
      initial[t.id] = t.price || 10;
    });
    return initial;
  });

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    safeTemplates.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [safeTemplates]);

  // Check if template is already active in store by code or name
  const isTemplateAdded = (template: Product): Product | undefined => {
    return currentStoreProducts.find(
      p => p.code === template.code || p.name === template.name || p.id === template.id
    );
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return safeTemplates.filter(t => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        (t.subtitle && t.subtitle.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [safeTemplates, selectedCategory, searchQuery]);

  const handlePriceChange = (templateId: string, val: number) => {
    setPrices(prev => ({
      ...prev,
      [templateId]: isNaN(val) ? 0 : val
    }));
  };

  const handleAddAll = () => {
    if (onAddAllTemplatesToStore) {
      onAddAllTemplatesToStore();
    } else {
      safeTemplates.forEach(t => {
        if (!isTemplateAdded(t)) {
          onAddTemplateToStore(t, prices[t.id] || t.price || 10);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Guide */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ea1b25] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <span>مكتبة كتالوج قوالب منتجات رزويل RZ Oil الألمانية</span>
              <span className="px-2 py-0.5 bg-[#ea1b25] text-white text-[10px] font-black rounded-full">
                {safeTemplates.length} صنف معتمد
              </span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              جميع المنتجات الألمانية بالصور والأكواد والأسعار الرسمية متوفرة. يمكنك إضافة أي منتج للمتجر فردياً أو إضافة الكتالوج كاملاً بضغطة زر!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
          <button
            onClick={handleAddAll}
            type="button"
            className="px-3.5 py-2 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            title="إضافة كافة منتجات الكتالوج للمتجر"
          >
            <Layers className="w-4 h-4" />
            <span>إضافة كامل الكتالوج ({safeTemplates.length} صنف)</span>
          </button>

          <div className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300">
            معروض بالمتجر: <strong className="text-green-600 dark:text-green-400 font-mono text-sm">{currentStoreProducts.length}</strong> صنف
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#202020] p-3 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث في الكتالوج بالاسم، كود المنتج (مثل 1050057)، أو الحجم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pr-9 pl-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#ea1b25]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Package className="w-4 h-4 text-[#ea1b25]" />
          <span>مطابق للبحث: <strong>{filteredTemplates.length}</strong> منتج</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#ea1b25] text-white shadow-xs'
              : 'bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
          }`}
        >
          كافة الأقسام ({templates.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#ea1b25] text-white shadow-xs'
                : 'bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const activeStoreItem = isTemplateAdded(template);
          const isAdded = !!activeStoreItem;
          const currentPrice = prices[template.id] ?? template.price ?? 10;
          const isExpanded = expandedDescId === template.id;

          return (
            <div
              key={template.id}
              className={`bg-white dark:bg-[#202020] rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isAdded 
                  ? 'border-green-400/80 dark:border-green-600/60 ring-1 ring-green-400/30' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-red-300'
              }`}
            >
              {/* Product Header & Image */}
              <div className="p-3.5 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Thumbnail Image */}
                  <div className="relative w-20 h-20 rounded-xl bg-gray-50 dark:bg-[#181818] p-1.5 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                    <img
                      src={template.image}
                      alt={template.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://www.rzoil.net/us/164/pidwebp600/7612/f133288936368174447131-1.webp";
                      }}
                    />
                    {isAdded && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Title & Badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/50 text-[#ea1b25] border border-red-200/50">
                        {template.category}
                      </span>
                      {template.volume && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-300">
                          {template.volume}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-400">
                        #{template.code}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 dark:text-white mt-1.5 line-clamp-2 leading-tight">
                      {template.name}
                    </h4>

                    {template.subtitle && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {template.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description & Features Accordion */}
                <div className="bg-gray-50 dark:bg-[#181818] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-300">
                  <div className={isExpanded ? '' : 'line-clamp-2 leading-relaxed'}>
                    {template.description || 'منظف ومحسن ألماني فائق الأداء مصمم لحماية منظومة السيارة وزيادة عمرها الافتراضي.'}
                  </div>

                  {isExpanded && template.features && template.features.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                      <div className="font-bold text-[#ea1b25] text-[10px]">المميزات والفوائد:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                        {template.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="truncate">{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedDescId(isExpanded ? null : template.id)}
                    className="mt-1.5 text-[10px] font-bold text-[#ea1b25] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض كامل الشرح والمواصفات'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Action Box: Price & Add/Remove */}
              <div className="p-3 bg-gray-50/80 dark:bg-[#1c1c1c] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                {isAdded ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">
                        معروض بالمتجر ({activeStoreItem.price} د.أ)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onFillFormWithTemplate && (
                        <button
                          type="button"
                          onClick={() => onFillFormWithTemplate(template)}
                          className="px-2 py-1 text-[11px] bg-gray-200 hover:bg-gray-300 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 rounded-lg transition cursor-pointer"
                          title="تعديل في النموذج"
                        >
                          تعديل
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveFromStore(activeStoreItem.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                        title="إزالة من المتجر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Price Input */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        السعر:
                      </label>
                      <div className="relative w-20">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={currentPrice}
                          onChange={(e) => handlePriceChange(template.id, parseFloat(e.target.value))}
                          className="w-full h-8 px-2 pr-2 pl-6 text-xs font-bold text-center text-[#ea1b25] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151515] focus:outline-none focus:border-[#ea1b25]"
                        />
                        <span className="absolute left-1.5 top-2 text-[10px] text-gray-400 font-bold pointer-events-none">
                          د.أ
                        </span>
                      </div>
                    </div>

                    {/* Add Buttons */}
                    <div className="flex items-center gap-1.5">
                      {onFillFormWithTemplate && (
                        <button
                          type="button"
                          onClick={() => onFillFormWithTemplate(template)}
                          className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#282828] text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="تعبئة وتعديل قبل الإضافة"
                        >
                          تخصيص
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onAddTemplateToStore(template, currentPrice)}
                        className="px-3 py-1.5 bg-[#ea1b25] hover:bg-[#c9141d] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة للمتجر</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <Package className="w-8 h-8 text-gray-400 mx-auto" />
          <div className="font-bold text-sm text-gray-800 dark:text-gray-200">
            لم يتم العثور على قوالب مطابقة للبحث
          </div>
          <p className="text-xs text-gray-500">
            جرب البحث باسم آخر أو اختر "كافة الأقسام" لعرض جميع الأصناف الجاهزة.
          </p>
        </div>
      )}
    </div>
  );
};
