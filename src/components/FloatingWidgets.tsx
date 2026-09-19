import React, { useEffect, useState } from 'react';
import { ShoppingCart, MessageSquare, ArrowUp } from 'lucide-react';

interface FloatingWidgetsProps {
  cartCount: number;
  onOpenCart: () => void;
  whatsappPhone?: string;
}

export const FloatingWidgets: React.FC<FloatingWidgetsProps> = ({ 
  cartCount, 
  onOpenCart,
  whatsappPhone = '0791000001'
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const cleanWa = whatsappPhone.replace(/\D/g, '').replace(/^0+/, '');
    const waFull = cleanWa.startsWith('962') ? cleanWa : `962${cleanWa}`;
    window.open(
      `https://api.whatsapp.com/send?phone=${waFull}&text=` +
        encodeURIComponent('مرحباً، أود الاستفسار عن منتجات وزيوت رزويل الألمانية - متجر رزويل الأردن'),
      '_blank'
    );
  };

  return (
    <div className="fixed bottom-20 md:bottom-5 left-3 sm:left-5 z-40 flex flex-col items-center gap-2.5">
      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-11 h-11 rounded-full bg-gray-900/80 hover:bg-black text-white shadow-lg flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
          title="الرجوع للأعلى"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating Cart Button */}
      <button
        id="pgcart"
        onClick={onOpenCart}
        className="relative w-12 h-12 rounded-full bg-[#ea1b25] hover:bg-[#c9141d] text-white shadow-xl flex items-center justify-center transition transform hover:scale-105 active:scale-95 cursor-pointer"
        title="عرض السلة"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-[#ea1b25] font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">
            {cartCount}
          </span>
        )}
      </button>

      {/* WhatsApp Button with dynamic phone number */}
      <button
        onClick={openWhatsApp}
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl flex items-center justify-center transition transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
        title={`تواصل عبر واتساب (${whatsappPhone})`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};
