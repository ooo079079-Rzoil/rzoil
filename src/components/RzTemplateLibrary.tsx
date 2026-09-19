import React, { useState, useMemo, useRef } from 'react';
import { Product } from '../types';
import { ALL_INITIAL_PRODUCTS, RZ_OFFICIAL_FALLBACK_LOGO } from '../data/products';
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
  RotateCcw,
  Edit3,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  CheckCheck
} from 'lucide-react';

interface RzTemplateLibraryProps {
  templates?: Product[];
  currentStoreProducts: Product[];
  onAddTemplateToStore: (template: Product, customPrice: number) => void;
  onRemoveFromStore: (productId: string) => void;
  onFillFormWithTemplate?: (template: Product) => void;
  onAddAllTemplatesToStore?: () => void;
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
  // Safe fallback to full official catalog
  const safeTemplates = (templates && templates.length > 0) ? templates : ALL_INITIAL_PRODUCTS;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedDescId, setExpandedDescId] = useState<string | null>(null);
  
  // State for Editing/Adding Template Modal
  const [editingTemplate, setEditingTemplate] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Open Edit Modal for an existing template
  const handleOpenEdit = (template: Product) => {
    setEditingTemplate({
      ...template,
      features: template.features || [],
      directions: template.directions || []
    });
    setIsCreatingNew(false);
    setImagePreviewError(false);
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
    setImagePreviewError(false);
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
        setImagePreviewError(false);
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
              جميع المنتجات بالصور الألمانية الرسمية والشروحات الدقيقة. يمكنك تعديل أي منتج أو تحديث صورته ومواصفاته مباشرة، أو إضافة منتجات جديدة للكتالوج.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
          <button
            onClick={handleOpenCreate}
            type="button"
            className="px-3 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            title="إضافة منتج أو قالب جديد لكتالوج رزويل"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قالب جديد</span>
          </button>

          <button
            onClick={handleAddAll}
            type="button"
            className="px-3.5 py-2 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            title="إضافة كافة منتجات الكتالوج للمتجر"
          >
            <Layers className="w-4 h-4" />
            <span>إضافة كامل الكتالوج للمتجر</span>
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
            placeholder="ابحث في الكتالوج بالاسم، الكود (مثل RZ400)، اللزوجة، أو الحجم..."
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
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#ea1b25] text-white shadow-xs'
              : 'bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828]'
          }`}
        >
          كافة الأصناف ({safeTemplates.length})
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
                  {/* Thumbnail Image with fallback to official RZ Logo only */}
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
                        {template.volume && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-300">
                            {template.volume}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-gray-400">
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
                  <div className={isExpanded ? '' : 'line-clamp-2 leading-relaxed'}>
                    {template.description || 'منتج ألماني فائق الأداء مصمم لحماية منظومة السيارة وزيادة عمرها الافتراضي.'}
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
                        <span className="absolute left-1.5 top-2 text-[10px] text-gray-400 font-bold pointer-events-none">
                          د.أ
                        </span>
                      </div>
                    </div>

                    {/* Add & Edit Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(template)}
                        className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#282828] text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                        title="تعديل بيانات أو صورة الصنف قبل الإضافة"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
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
            جرب البحث باسم آخر أو اضغط "إضافة قالب جديد" لإنشاء صنف مخصص في الكتالوج.
          </p>
        </div>
      )}

      {/* MODAL: EDIT / ADD CATALOG TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#202020] rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden my-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ea1b25] text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    {isCreatingNew ? 'إضافة صنف وقالب جديد إلى كتالوج رزويل' : `تعديل صنف: ${editingTemplate.name || 'بدون اسم'}`}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    يمكنك تغيير الصورة، الكود، الاسم، والسعر والمواصفات وسيتم حفظها مباشرة في الكتالوج والمتجر.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Image Preview & Upload Section */}
              <div className="p-3.5 bg-gray-50 dark:bg-[#181818] rounded-xl border border-gray-200 dark:border-gray-700/80 space-y-3">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  صورة المنتج (رابط صورة مباشر أو رفع من الجهاز):
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-24 h-24 rounded-xl bg-white dark:bg-[#242424] border-2 border-dashed border-gray-300 dark:border-gray-600 p-2 flex items-center justify-center relative shrink-0 overflow-hidden shadow-inner">
                    <img
                      src={imagePreviewError || !editingTemplate.image ? RZ_OFFICIAL_FALLBACK_LOGO : editingTemplate.image}
                      alt="معاينة الصورة"
                      className="max-h-full max-w-full object-contain"
                      onError={() => setImagePreviewError(true)}
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* URL Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="ضع رابط صورة المنتج المباشر (https://...)"
                        value={editingTemplate.image}
                        onChange={(e) => {
                          setEditingTemplate({ ...editingTemplate, image: e.target.value });
                          setImagePreviewError(false);
                        }}
                        className="flex-1 h-9 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                      />
                      {editingTemplate.image && editingTemplate.image !== RZ_OFFICIAL_FALLBACK_LOGO && (
                        <button
                          type="button"
                          onClick={() => setEditingTemplate({ ...editingTemplate, image: RZ_OFFICIAL_FALLBACK_LOGO })}
                          className="p-2 text-xs text-gray-500 hover:text-red-500 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg cursor-pointer"
                          title="استخدام لوجو الشركة الرسمي كصورة بديلة"
                        >
                          استعادة اللوجو
                        </button>
                      )}
                    </div>

                    {/* File Upload Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#2c2c2c] dark:hover:bg-[#363636] text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>اختيار صورة من جهازك / هاتفك</span>
                      </button>
                      <span className="text-[11px] text-gray-500">يدعم PNG, JPG, WebP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    اسم المنتج (باللغة العربية) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رزويل زيت RZ800 5W30 PAO تخليقي بالكامل"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    كود المنتج / الباركود *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: RZ800-5W30-4L أو 1050057"
                    value={editingTemplate.code}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-mono text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    القسم / التصنيف *
                  </label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white"
                  >
                    <option value="زيوت المحركات">زيوت المحركات</option>
                    <option value="زيوت ناقل الحركه">زيوت ناقل الحركه</option>
                    <option value="مياه الردياتير و الاضافات">مياه الردياتير و الاضافات</option>
                    <option value="اضافات الزيت">اضافات الزيت</option>
                    <option value="اضافات الوقود">اضافات الوقود</option>
                    <option value="صيانه و اصلاح">صيانه و اصلاح</option>
                    <option value="العنايه بالسياره">العنايه بالسياره</option>
                    <option value="الدراجات الناريه">الدراجات الناريه</option>
                    <option value="معدات">معدات</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    حجم أو سعة العبوة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 1 لتر / 4L / 5L / 300 مل / مقاس 60x90 سم"
                    value={editingTemplate.volume || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, volume: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    السعر المقترح (د.أ) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={editingTemplate.price}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="مثال: 15.0"
                    value={editingTemplate.originalPrice || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    شارة المنشأ والجودة (ألماني أصلي / مخصص)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: ألماني أصلي DE"
                    value={editingTemplate.originBadge || 'ألماني أصلي DE'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, originBadge: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    العنوان الإنجليزي أو التسمية الفرعية
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: RZ Fully Synthetic Engine Oil 5W30"
                    value={editingTemplate.subtitle || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subtitle: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="text-xs">
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  الوصف والشرح الفني للمنتج
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب شرحاً تفصيلياً لخصائص المنتج، تقنية التركيب، ومجالات الاستخدام..."
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none text-xs leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282828] rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ea1b25] hover:bg-[#c9141d] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreatingNew ? 'إضافة الصنف للكتالوج' : 'حفظ التعديلات وتحديث المتجر'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
