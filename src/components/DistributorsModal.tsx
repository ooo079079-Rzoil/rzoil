import React, { useState } from 'react';
import { X, MapPin, Phone, Building, MessageSquare, Trash2, Edit3, Plus, Check, Save } from 'lucide-react';
import { Distributor } from '../types';

interface DistributorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributors: Distributor[];
  isAdminAuthenticated?: boolean;
  onDeleteDistributor?: (id: string) => void;
  onUpdateDistributor?: (distributor: Distributor) => void;
  onAddDistributor?: (distributor: Distributor) => void;
  onOpenAdmin?: () => void;
}

export const DistributorsModal: React.FC<DistributorsModalProps> = ({ 
  isOpen, 
  onClose,
  distributors,
  isAdminAuthenticated = false,
  onDeleteDistributor,
  onUpdateDistributor,
  onAddDistributor,
  onOpenAdmin
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Distributor | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Distributor, 'id'>>({
    city: 'عمان',
    area: '',
    phone: '079',
    address: ''
  });

  if (!isOpen) return null;

  const startEdit = (d: Distributor) => {
    setEditingId(d.id);
    setEditForm({ ...d });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm && onUpdateDistributor) {
      onUpdateDistributor(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.city || !newForm.phone) return;
    if (onAddDistributor) {
      onAddDistributor({
        id: String(Date.now()),
        city: newForm.city,
        area: newForm.area || 'مركز معتمد',
        phone: newForm.phone,
        address: newForm.address || 'موزع معتمد لمنتجات رزويل الألمانية'
      });
      setIsAddingNew(false);
      setNewForm({ city: 'عمان', area: '', phone: '079', address: '' });
    }
  };

  const formatWhatsAppUrl = (phone: string) => {
    const clean = phone.replace(/\D/g, '').replace(/^0+/, '');
    const wa = clean.startsWith('962') ? clean : `962${clean}`;
    return `https://api.whatsapp.com/send?phone=${wa}&text=${encodeURIComponent('مرحباً، أود الاستفسار عن توفر منتجات رزويل الألمانية لديكم')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#ea1b25] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-base">شبكة الموزعين ومراكز الخدمة المعتمدة في الأردن</h3>
              <p className="text-[11px] text-white/80">الوكيل المعتمد لزيوت وإضافات RZ Oil الألمانية بالمملكة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                وضع الإدارة
              </span>
            )}
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action bar for Admin */}
        {isAdminAuthenticated && (
          <div className="bg-red-50 dark:bg-red-950/30 p-2.5 px-4 border-b border-red-100 dark:border-red-900/50 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <span>كمشرف نظام: يمكنك تعديل أو حذف أي موزع أو إضافة موزع جديد فوراً:</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="bg-[#ea1b25] hover:bg-[#c9141d] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingNew ? 'إلغاء الإضافة' : 'إضافة موزع جديد'}</span>
              </button>
              {onOpenAdmin && (
                <button
                  onClick={() => { onClose(); onOpenAdmin(); }}
                  className="bg-gray-800 hover:bg-black text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                >
                  لوحة التحكم الكاملة
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          
          {/* Add Form */}
          {isAddingNew && (
            <form onSubmit={handleSaveNew} className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl space-y-2.5 text-xs animate-scale-up">
              <div className="font-bold text-[#ea1b25] flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span>إضافة نقطة بيع أو موزع جديد للأردن:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">المحافظة *</label>
                  <select
                    value={newForm.city}
                    onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#181818]"
                  >
                    {['عمان', 'إربد', 'الزرقاء', 'العقبة', 'البلقاء (السلط)', 'مادبا', 'جرش', 'عجلون', 'المفرق', 'الكرك', 'الطفيلة', 'معان'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">رقم الهاتف الأردني *</label>
                  <input
                    type="tel"
                    required
                    placeholder="079XXXXXXX"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#181818] font-mono text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">المنطقة / الشارع</label>
                  <input
                    type="text"
                    placeholder="مثال: شارع وصفي التل، خلدا"
                    value={newForm.area}
                    onChange={(e) => setNewForm({ ...newForm, area: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#181818]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">اسم المركز أو الوصف</label>
                  <input
                    type="text"
                    placeholder="مثال: مركز فحص وخدمة وصيانة معتمد"
                    value={newForm.address}
                    onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#181818]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-[#ea1b25] text-white font-bold cursor-pointer"
                >
                  حفظ الموزع
                </button>
              </div>
            </form>
          )}

          {distributors.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Building className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="font-bold">لا يوجد موزعون مضافون حالياً</p>
              {isAdminAuthenticated && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="mt-2 text-xs text-[#ea1b25] font-bold hover:underline"
                >
                  اضغط هنا لإضافة أول موزع
                </button>
              )}
            </div>
          ) : (
            distributors.map((d) => (
              <div 
                key={d.id} 
                className="p-3.5 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2 hover:border-red-300 dark:hover:border-red-900 transition shadow-xs"
              >
                {editingId === d.id && editForm ? (
                  /* INLINE EDIT FORM */
                  <form onSubmit={handleSaveEdit} className="space-y-2.5 p-2 bg-white dark:bg-[#1c1c1c] rounded-lg border border-red-300 dark:border-red-900">
                    <div className="font-bold text-[#ea1b25] flex items-center justify-between">
                      <span>تعديل بيانات الموزع:</span>
                      <span className="text-gray-400 text-[10px]">ID: {d.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold mb-1">المحافظة:</label>
                        <select
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                        >
                          {['عمان', 'إربد', 'الزرقاء', 'العقبة', 'البلقاء (السلط)', 'مادبا', 'جرش', 'عجلون', 'المفرق', 'الكرك', 'الطفيلة', 'معان'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">رقم الهاتف الأردني:</label>
                        <input
                          type="tel"
                          required
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">المنطقة / الشارع:</label>
                        <input
                          type="text"
                          value={editForm.area}
                          onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                          className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">اسم المركز أو الوصف:</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full h-8 px-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#181818]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ التعديل</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* NORMAL VIEW */
                  <>
                    <div className="flex items-center justify-between font-bold text-sm text-gray-900 dark:text-white">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#ea1b25]" />
                        <span>{d.city}</span>
                        {d.area && <span className="text-xs text-gray-500 font-normal">({d.area})</span>}
                      </span>
                      
                      {isAdminAuthenticated && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(d)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                            title="تعديل بيانات الموزع"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف موزع "${d.city}"؟`)) {
                                if (onDeleteDistributor) onDeleteDistributor(d.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition cursor-pointer"
                            title="حذف الموزع"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-gray-600 dark:text-gray-300 text-xs">{d.address}</div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={`tel:${d.phone}`}
                        className="flex items-center gap-1.5 text-[#ea1b25] hover:underline font-mono font-bold"
                        dir="ltr"
                        title="اتصال هاتفي"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{d.phone}</span>
                      </a>

                      <a
                        href={formatWhatsAppUrl(d.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-bold bg-green-50 dark:bg-green-950/40 px-2 py-1 rounded-lg border border-green-200 dark:border-green-800"
                        title="محادثة واتساب مباشرة"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>محادثة واتساب</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>إجمالي الموزعين المعتمدين: {distributors.length} نقاط في الأردن</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
