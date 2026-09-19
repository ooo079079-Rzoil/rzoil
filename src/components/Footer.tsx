import React from 'react';
import { Facebook, Twitter, MessageSquare, ShieldCheck, Truck, Headphones, Instagram, Youtube } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  onOpenDistributors: () => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  onGoHome?: () => void;
  settings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenDistributors, 
  onOpenContact, 
  onOpenAdmin, 
  onGoHome,
  settings 
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.rzoil.net';

  const shareFacebook = () => {
    window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent('متجر زيوت وإضافات رزويل الألمانية RZ Oil Jordan')}`, '_blank');
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const facebookUrl = settings?.facebookUrl || 'https://facebook.com';
  const twitterUrl = settings?.twitterUrl || 'https://twitter.com';
  const instagramUrl = settings?.instagramUrl;
  const tiktokUrl = settings?.tiktokUrl;
  const youtubeUrl = settings?.youtubeUrl;

  return (
    <footer id="footercontainer" className="w-full bg-[#181818] text-white pt-10 pb-6 border-t-4 border-[#ea1b25] mt-12">
      {/* Service Highlights */}
      <div className="max-w-[1280px] mx-auto px-4 pb-8 mb-8 border-b border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-right">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ea1b25]/20 flex items-center justify-center text-[#ea1b25] shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm">شحن لكافة محافظات الأردن</h5>
            <p className="text-xs text-gray-400">توصيل سريع وآمن حتى باب المنزل ({settings?.shippingCost ?? 3} د.أ)</p>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ea1b25]/20 flex items-center justify-center text-[#ea1b25] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm">جودة ألمانية معتمدة</h5>
            <p className="text-xs text-gray-400">شهادات فحص TÜV والأيزو الألمانية</p>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ea1b25]/20 flex items-center justify-center text-[#ea1b25] shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm">دعم واستشارات فنية</h5>
            <p className="text-xs text-gray-400">هاتف: {settings?.supportPhone || '0791000001'} | واتساب: {settings?.whatsappPhone || '0791000001'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Brand title */}
          <div className="flex flex-col items-center md:items-start text-center md:text-right">
            <button 
              onClick={onGoHome}
              className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:text-[#ea1b25] transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{settings?.storeName || 'rzoil - rzoil.net'}</span>
            </button>
            <span className="text-xs text-gray-400 mt-1">
              الوكيل والموزع المعتمد لزيوت وإضافات رزويل الألمانية في المملكة الأردنية الهاشمية
            </span>
          </div>

          {/* Social sharing & follow */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-bold">تابعنا:</span>
              <div className="flex items-center gap-2">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition shadow-sm"
                  title="صفحة الفيسبوك"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 hover:opacity-90 flex items-center justify-center text-white transition shadow-sm"
                    title="حساب إنستغرام"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}

                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-black hover:bg-gray-900 border border-gray-700 flex items-center justify-center text-white transition text-xs font-black shadow-sm"
                    title="حساب تيك توك"
                  >
                    TK
                  </a>
                )}

                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white transition shadow-sm"
                  title="حساب تويتر / إكس"
                >
                  <Twitter className="w-4 h-4" />
                </a>

                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition shadow-sm"
                    title="قناة يوتيوب"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-bold">شارك مع أصدقائك:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={shareFacebook}
                  className="w-8 h-8 rounded-full bg-blue-800 hover:bg-blue-900 flex items-center justify-center text-white transition cursor-pointer shadow-sm"
                  title="مشاركة على فيسبوك"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={shareTwitter}
                  className="w-8 h-8 rounded-full bg-black hover:bg-gray-900 border border-gray-700 flex items-center justify-center text-white transition cursor-pointer shadow-sm"
                  title="مشاركة على إكس / تويتر"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1fb355] flex items-center justify-center text-white transition cursor-pointer shadow-sm"
                  title="مشاركة على واتساب"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Footer Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={onGoHome} className="hover:text-white transition cursor-pointer">الصفحة الرئيسية</button>
            <span>•</span>
            <button onClick={onOpenDistributors} className="hover:text-white transition cursor-pointer">الموزعين في الأردن</button>
            <span>•</span>
            <button onClick={onOpenContact} className="hover:text-white transition cursor-pointer">اتصل بنا</button>
            <span>•</span>
            <button onClick={onOpenAdmin} className="hover:text-white transition cursor-pointer font-bold text-gray-300">لوحة الإدارة والمزامنة</button>
          </div>

          {/* Visitor counter badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400">إجمالي زوار الموقع:</span>
            <strong className="text-white font-mono">{typeof window !== 'undefined' ? (parseInt(localStorage.getItem('rzoil_site_visits') || '1428', 10)).toLocaleString('ar-JO') : '1,428'} زائر</strong>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 font-mono gap-2">
          <a 
            href="https://wa.me/962798010075" 
            target="_blank" 
            rel="noreferrer"
            className="text-white hover:text-[#25D366] transition cursor-pointer font-bold flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-gray-900/80 border border-gray-800 hover:border-green-600/50"
            title="تواصل مباشر عبر واتساب مع المطور عبدالله رباع"
          >
            <span className="text-[#25D366] text-xs">💬</span>
            <span>Developed by Abdullah Rabba © 2026</span>
          </a>
          <span>RZ Oil Deutschland GmbH - Jordan Official Store - All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
};
