import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Truck, Phone, MessageSquare, MapPin, User, ShieldCheck } from 'lucide-react';
import { Product, CartItem, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleProduct?: Product | null;
  singleQuantity?: number;
  cartItems?: CartItem[];
  onOrderSuccess: () => void;
  onPlaceOrder?: (order: Order) => void;
  shippingCost?: number;
  existingOrders?: Order[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  singleProduct,
  singleQuantity = 1,
  cartItems = [],
  onOrderSuccess,
  onPlaceOrder,
  shippingCost = 3,
  existingOrders = []
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('عمان');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Reset completion state whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setIsCompleted(false);
      setIsSubmitting(false);
      setOrderNumber('');
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    setIsCompleted(false);
    setIsSubmitting(false);
    setOrderNumber('');
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  // Determine items and total
  const itemsToOrder = singleProduct 
    ? [{ product: singleProduct, quantity: singleQuantity }]
    : cartItems;

  const subtotal = itemsToOrder.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const grandTotal = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، العنوان)');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      // Find highest existing order sequence number
      let highestSeq = 0;
      if (Array.isArray(existingOrders) && existingOrders.length > 0) {
        existingOrders.forEach(ord => {
          if (ord.orderNumber) {
            const match = ord.orderNumber.match(/\d+/);
            if (match) {
              const num = parseInt(match[0], 10);
              // Filter reasonable sequential numbers
              if (num > highestSeq && num < 100000) {
                highestSeq = num;
              }
            }
          }
        });
        if (highestSeq === 0) {
          highestSeq = existingOrders.length;
        }
      }

      const nextNumber = highestSeq + 1;
      const generatedOrder = `RZ-${String(nextNumber).padStart(3, '0')}`;
      setOrderNumber(generatedOrder);

      const createdOrder: Order = {
        id: String(Date.now()),
        orderNumber: generatedOrder,
        customerName: name,
        phone: phone,
        city: city,
        address: address,
        notes: notes || undefined,
        items: itemsToOrder.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          productCode: i.product.code,
          quantity: i.quantity,
          price: i.product.price,
          image: i.product.image
        })),
        subtotal: subtotal,
        shippingCost: shippingCost,
        grandTotal: grandTotal,
        status: 'pending',
        createdAt: new Date().toLocaleDateString('ar-JO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      if (onPlaceOrder) {
        onPlaceOrder(createdOrder);
      }

      setIsCompleted(true);
      onOrderSuccess();
    }, 800);
  };

  const handleWhatsAppOrder = () => {
    const itemsText = itemsToOrder
      .map(i => `- ${i.product.name} (الكمية: ${i.quantity}) بسعر: ${i.product.price * i.quantity} د.أ`)
      .join('%0A');

    const msg = `مرحباً، أود طلب المنتجات التالية من متجر رزويل الأردن:%0A${itemsText}%0A%0Aالإجمالي: ${grandTotal} د.أ%0Aالاسم: ${name || 'لم يحدد'}%0Aالهاتف: ${phone || 'لم يحدد'}%0Aالمحافظة: ${city}%0Aالعنوان: ${address || 'لم يحدد'}`;
    window.open(`https://api.whatsapp.com/send?phone=962791000001&text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleCloseModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="bg-[#ea1b25] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <h3 className="font-bold text-lg">إتمام الطلب والشحن</h3>
          </div>
          <button 
            onClick={handleCloseModal}
            className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h4 className="text-xl font-black text-gray-900 dark:text-white">
              تم تسجيل طلبك بنجاح!
            </h4>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              رقم طلبك هو: <span className="font-mono font-bold text-[#ea1b25]">{orderNumber}</span>
            </p>

            <div className="bg-gray-50 dark:bg-[#252525] p-3 rounded-xl text-xs text-gray-600 dark:text-gray-300 space-y-1 text-right">
              <div>• سيتواصل معك مندوب شركة الشحن لتأكيد العنوان وموعد التسليم.</div>
              <div>• الدفع عند الاستلام بعد معاينة الشحنة.</div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-[#ea1b25] text-white rounded-xl font-bold hover:bg-[#c9141d] transition cursor-pointer"
            >
              متابعة التسوق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Order Items Preview */}
            <div className="bg-gray-50 dark:bg-[#252525] p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2">
              <div className="font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1 flex justify-between">
                <span>ملخص الطلب:</span>
                <span>{itemsToOrder.length} صنف</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {itemsToOrder.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                    <span className="truncate max-w-[240px] font-medium">{item.product.name} × {item.quantity}</span>
                    <span className="font-bold font-mono">{(item.product.price * item.quantity).toLocaleString()} د.أ</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                <span>المجموع الكلي مع الشحن:</span>
                <span className="text-[#ea1b25] font-black">{grandTotal.toLocaleString()} د.أ</span>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  الاسم بالكامل *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسمك الثلاثي"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 pr-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#222222] text-sm text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  رقم الهاتف للتواصل *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="07XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 pr-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#222222] text-sm text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none text-right font-mono"
                    dir="ltr"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#222222] text-sm text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                  >
                    <option value="عمان">عمان</option>
                    <option value="إربد">إربد</option>
                    <option value="الزرقاء">الزرقاء</option>
                    <option value="العقبة">العقبة</option>
                    <option value="البلقاء (السلط)">البلقاء (السلط)</option>
                    <option value="مادبا">مادبا</option>
                    <option value="جرش">جرش</option>
                    <option value="عجلون">عجلون</option>
                    <option value="المفرق">المفرق</option>
                    <option value="الكرك">الكرك</option>
                    <option value="الطفيلة">الطفيلة</option>
                    <option value="معان">معان</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    العنوان بالتفصيل *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="المنطقة والشارع"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#222222] text-sm text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                    />
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="ملاحظات لمندوب التوصيل..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#222222] text-xs text-gray-900 dark:text-white focus:border-[#ea1b25] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment info */}
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-800 dark:text-amber-300 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>طريقة الدفع: الدفع نقدياً عند الاستلام بعد فحص الشحنة.</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.99] text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الطلب...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تأكيد الطلب الآن ({grandTotal.toLocaleString()} د.أ)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#1fb355] text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>الطلب المباشر عبر واتساب</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
