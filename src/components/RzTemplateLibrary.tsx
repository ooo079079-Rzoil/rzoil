import React, { useState, useMemo, useRef } from 'react';
import { Product } from '../types';
import { ALL_INITIAL_PRODUCTS, RZ_OFFICIAL_FALLBACK_LOGO } from '../data/products';
import { JORDAN_OFFICIAL_CATALOG } from '../data/jordanCatalog';
import { 
  Search, 
  Plus, 
  Check, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Trash2, 
  Layers, 
  Edit3, 
  Upload, 
  X, 
  Save, 
  Globe, 
  CheckCircle2,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';

interface RzTemplateLibraryProps {
  templates?: Product[];
  currentStoreProducts: Product[];
  onAddTemplateToStore: (template: Product, customPrice: number) => void;
  onRemoveFromStore: (productId: string) => void;
  onFillFormWithTemplate?: (template: Product) => void;
  onAddAllTemplatesToStore?: (customList?: Product[]) => void;
  onUpdateTemplate?: (updatedTemplate: Product) => void;
  onAddNewTemplate?: (newTemplate: Product) => void;
}

export const RzTemplateLibrary: React.FC<RzTemplateLibraryProps> = ({
  templates = ALL_INITIAL_PRODUCTS,
  currentStoreProducts = [],
  onAddTemplateToStore,
  onRemoveFromStore,
  onFillFormWithTemplate,
  onAddAllTemplatesToStore,
  onUpdateTemplate,
  onAddNewTemplate
}) => {
  // Catalog tab: 'jordan' | 'factory' | 'all'
  const [catalogSource, setCatalogSource] = useState<'jordan' | 'factory' | 'all'>('jordan');

  // Active pool of products based on selected catalog
  const activeCatalogList = useMemo(() => {
    if (catalogSource === 'jordan') {
      return JORDAN_OFFICIAL_CATALOG;
    }
    if (catalogSource === 'factory') {
      return (templates && templates.length > 0) ? templates : ALL_INITIAL_PRODUCTS;
    }
    // 'all' combines both, prioritizing Jordan versions
    const jordanCodes = new Set(JORDAN_OFFICIAL_CATALOG.map(p => p.code.toUpperCase()));
    const nonJordanFactory = (templates || ALL_INITIAL_PRODUCTS).filter(
      p => !jordanCodes.has(p.code.toUpperCase())
    );
    return [...JORDAN_OFFICIAL_CATALOG, ...nonJordanFactory];
  }, [catalogSource, templates]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null);
  
  // State for Editing/Adding Template Modal
  const [editingTemplate, setEditingTemplate] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom price map for each template { [templateId]: number }
  const [prices, setPrices] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    JORDAN_OFFICIAL_CATALOG.forEach(t => {
      initial[t.id] = t.price || 10;
    });
    ALL_INITIAL_PRODUCTS.forEach(t => {
      if (initial[t.id] === undefined) {
        initial[t.id] = t.price || 10;
      }
    });
    return initial;
  });

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    activeCatalogList.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [activeCatalogList]);

  // Check if template is already active in store by code or name
  const isTemplateAdded = (template: Product): Product | undefined => {
    return currentStoreProducts.find(
      p => p.code?.toUpperCase() === template.code?.toUpperCase() || 
           p.name === template.name || 
           p.id === template.id
    );
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return activeCatalogList.filter(t => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        (t.subtitle && t.subtitle.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [activeCatalogList, selectedCategory, searchQuery]);

  const handlePriceChange = (templateId: string, val: number) => {
    setPrices(prev => ({
      ...prev,
      [templateId]: isNaN(val) ? 0 : val
    }));
  };

  const handleAddAllCurrentView = () => {
    if (onAddAllTemplatesToStore) {
      onAddAllTemplatesToStore(activeCatalogList);
    } else {
      activeCatalogList.forEach(t => {
        if (!isTemplateAdded(t)) {
          onAddTemplateToStore(t, prices[t.id] || t.price || 10);
        }
      });
    }
  };

  const handleAddAllJordan = () => {
    if (onAddAllTemplatesToStore) {
      onAddAllTemplatesToStore(JORDAN_OFFICIAL_CATALOG);
    } else {
      JORDAN_OFFICIAL_CATALOG.forEach(t => {
        if (!isTemplateAdded(t)) {
          onAddTemplateToStore(t, t.price || 10);
        }
      });
    }
  };

  // Open Edit Modal for an existing template
  const handleOpenEdit = (template: Product) => {
    setEditingTemplate({
      ...template,
      features: template.features || [],
      directions: template.directions || []
    });
    setIsCreatingNew(false);
  };

  // Open Add Modal for creating a new template
  const handleOpenCreate = () => {
    const newId = `rz-custom-${Date.now()}`;
    setEditingTemplate({
      id: newId,
      code: `RZ-${Date.now().toString().slice(-4)}`,
      name: '',
      brand: 'RZ Oil Germany',
      category: 'زيوت المحركات',
      price: 10,
      originalPrice: 12,
      originBadge: 'ألماني أصلي DE',
      image: RZ_OFFICIAL_FALLBACK_LOGO,
      images: [RZ_OFFICIAL_FALLBACK_LOGO],
      volume: '1L',
      subtitle: 'منتج ألماني أصلي معتمد',
      description: '',
      features: ['جودة ألمانية فائقة ومطابقة لأعلى معايير الأداء'],
      usage: 'يستخدم وفقاً لتعليمات وتوصيات الشركة المصنعة.',
      directions: ['يرجى قراءة تعليمات العبوة جيداً قبل الاستخدام.'],
      inStock: true
    });
    setIsCreatingNew(true);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingTemplate) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditingTemplate(prev => prev ? {
          ...prev,
          image: base64,
          images: [base64, ...(prev.images || []).filter(img => img !== base64)]
        } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save template edits
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.name.trim()) return;

    const finalizedTemplate: Product = {
      ...editingTemplate,
      name: editingTemplate.name.trim(),
      code: editingTemplate.code.trim() || `RZ-${editingTemplate.id}`,
      image: editingTemplate.image.trim() || RZ_OFFICIAL_FALLBACK_LOGO,
      images: editingTemplate.images && editingTemplate.images.length > 0 
        ? editingTemplate.images 
        : [editingTemplate.image.trim() || RZ_OFFICIAL_FALLBACK_LOGO]
    };

    if (isCreatingNew) {
      if (onAddNewTemplate) {
        onAddNewTemplate(finalizedTemplate);
      } else if (onUpdateTemplate) {
        onUpdateTemplate(finalizedTemplate);
      }
    } else {
      if (onUpdateTemplate) {
        onUpdateTemplate(finalizedTemplate);
      }
    }

    setEditingTemplate(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Guide with Dual Catalog Control */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ea1b25] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <span>مكتبة كتالوجات ومنتجات رزويل RZ Oil</span>
              {catalogSource === 'jordan' && (
                <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-black rounded-full flex items-center gap-1">
                  <span>🇯🇴 كتالوج الأردن المعتمد (47 منتج)</span>
                </span>
              )}
              {catalogSource === 'factory' && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center gap-1">
                  <span>🇩🇪 كتالوج المصنع الشامل (81 منتج)</span>
                </span>
              )}
              {catalogSource === 'all' && (
                <span className="px-2 py-0.5 bg-[#ea1b25] text-white text-[10px] font-black rounded-full">
                  <span>كافة الكتالوجات (128 منتج)</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              {catalogSource === 'jordan' ? (
                <>تمت مطابقة المنتجات والأسعار بالدينار الأردني والشروحات الفنية بدقة 100% مع موقع <strong>rzoiljo.netlify.app</strong> الرسمي.</>
              ) : (
                <>الكتالوج الشامل لجميع أصناف ومنتجات وزيوت رزويل المصنعة في ألمانيا بكافة سعاتها ومواصفاتها الدولية.</>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
          <button
            onClick={handleAddAllJordan}
            type="button"
            className="px-4 py-2 bg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
            title="إضافة كافة منتجات رزويل بالكامل إلى المتجر دفعة واحدة (47 منتج)"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>⚡ إضافة كافة المنتجات للمتجر (47 منتج)</span>
          </button>

          <button
            onClick={handleOpenCreate}
            type="button"
            className="px-3 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            title="إضافة منتج أو قالب جديد"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف مخصص</span>
          </button>

          <div className="px-3 py-1.5 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300">
            المعروض بالمتجر: <strong className="text-green-600 dark:text-green-400 font-mono text-sm">{currentStoreProducts.length}</strong> منتج
          </div>
        </div>
      </div>

      {/* Catalog Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#202020] p-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <span className="text-xs font-bold text-gray-500 px-2 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-[#ea1b25]" />
          <span>اختر الكتالوج:</span>
        </span>

        <button
          type="button"
          onClick={() => {
            setCatalogSource('jordan');
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            catalogSource === 'jordan'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <span>🇯🇴 كتالوج الأردن الرسمي</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">47 منتج</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCatalogSource('factory');
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            catalogSource === 'factory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <span>🇩🇪 كتالوج المصنع الشامل</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">81 منتج</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCatalogSource('all');
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            catalogSource === 'all'
              ? 'bg-[#ea1b25] text-white shadow-sm'
              : 'bg-gray-100 dark:bg-[#282828] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <span>🌐 جميع المنتجات المدمجة</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">128 منتج</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#202020] p-3 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث في الكتالوج بالاسم، الكود (مثل RZ12G أو RZ20E)، اللزوجة، أو الشرح..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pr-9 pl-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:border-[#ea1b25]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Package className="w-4 h-4 text-[#ea1b25]" />
          <span>مطابق للبحث: <strong>{filteredTemplates.length}</strong> منتج</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#ea1b25] text-white shadow-xs'
              : 'bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
          }`}
        >
          كافة الأقسام ({activeCatalogList.length})
        </button>
        {categories.map((cat) => (
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
        {filteredTemplates.map((template, tIdx) => {
          const activeStoreItem = isTemplateAdded(template);
          const isAdded = !!activeStoreItem;
          const currentPrice = prices[template.id] ?? template.price ?? 10;
          const isExpanded = expandedDescId === template.id;

          return (
            <div
              key={`${template.id}-${tIdx}`}
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
                      src={template.image || RZ_OFFICIAL_FALLBACK_LOGO}
                      alt={template.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = RZ_OFFICIAL_FALLBACK_LOGO;
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
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/50 text-[#ea1b25] border border-red-200/50">
                          {template.category}
                        </span>
                        {template.originBadge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {template.originBadge}
                          </span>
                        )}
                        {template.volume && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-300">
                            {template.volume}
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold text-gray-500">
                          #{template.code}
                        </span>
                      </div>

                      {/* Direct Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(template)}
                        className="p-1.5 text-gray-500 hover:text-[#ea1b25] hover:bg-gray-100 dark:hover:bg-[#282828] rounded-lg transition cursor-pointer shrink-0"
                        title="تعديل صورة أو مواصفات هذا الصنف في الكتالوج"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
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
                  <div className={isExpanded ? 'whitespace-pre-line' : 'line-clamp-2 leading-relaxed'}>
                    {template.description || 'منتج ألماني فائق الأداء مصمم لحماية منظومة السيارة وزيادة عمرها الافتراضي.'}
                  </div>

                  {isExpanded && template.features && template.features.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                      <div className="font-bold text-[#ea1b25] text-[10px]">المميزات والفوائد:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                        {template.features.slice(0, 5).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isExpanded && template.directions && template.directions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                      <div className="font-bold text-blue-600 dark:text-blue-400 text-[10px]">طريقة الاستخدام:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                        {template.directions.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedDescId(isExpanded ? null : template.id)}
                    className="mt-1.5 text-[10px] font-bold text-[#ea1b25] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض كامل الشرح والمواصفات وطريقة الاستخدام'}</span>
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
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(template)}
                        className="px-2 py-1 text-[11px] bg-gray-200 hover:bg-gray-300 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                        title="تعديل في الكتالوج"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
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
                        <span className="absolute left-1.5 top-2 text-[10px] text-gray-400 pointer-events-none">
                          د.أ
                        </span>
                      </div>
                    </div>

                    {/* Add to Store Button */}
                    <button
                      type="button"
                      onClick={() => onAddTemplateToStore(template, currentPrice)}
                      className="px-3 py-1.5 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.98] text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة للمتجر</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Create Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#202020] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 text-[#ea1b25] flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {isCreatingNew ? 'إضافة صنف جديد للكتالوج' : 'تعديل بيانات وصورة الصنف بالكتالوج'}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    التعديلات هنا تحفظ في الكتالوج وتنعكس على المتجر
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#ea1b25]">السعر الافتراضي (د.أ) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingTemplate.price}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, price: parseFloat(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-red-300 dark:border-red-700 bg-gray-50 dark:bg-[#181818] font-bold text-[#ea1b25]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">كود الصنف (Code)</label>
                  <input
                    type="text"
                    value={editingTemplate.code}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">القسم</label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
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
                    value={editingTemplate.volume || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, volume: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                    placeholder="مثال: 300 مل أو 4 لتر"
                  />
                </div>
              </div>

              {/* Image Upload Zone */}
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-[#181818] rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="block font-bold text-gray-800 dark:text-gray-200">
                  صورة المنتج
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div className="flex items-center gap-3">
                  <img
                    src={editingTemplate.image || RZ_OFFICIAL_FALLBACK_LOGO}
                    alt="معاينة"
                    className="w-16 h-16 object-contain rounded-lg bg-white dark:bg-[#111] p-1 border border-gray-200 dark:border-gray-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = RZ_OFFICIAL_FALLBACK_LOGO;
                    }}
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#ea1b25] hover:bg-[#c9141d] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة من الجهاز</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="أو رابط صورة مباشر (URL)..."
                      value={editingTemplate.image}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, image: e.target.value })}
                      className="w-full h-8 px-2 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">وصف المنتج ومميزاته</label>
                <textarea
                  rows={4}
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                  placeholder="شرح تفصيلي للمنتج وفوائده الفنية..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ea1b25] hover:bg-[#c9141d] text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ الصنف في الكتالوج</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
