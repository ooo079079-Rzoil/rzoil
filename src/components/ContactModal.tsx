import React from 'react';
import { X, Phone, MessageSquare, Clock, MapPin, Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import { StoreSettings } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  // Clean and format phone for WhatsApp
  const rawWa = settings.whatsappPhone || '0791000001';
  const cleanWa = rawWa.replace(/\D/g, '').replace(/^0+/, '');
  const waFull = cleanWa.startsWith('962') ? cleanWa : `962${cleanWa}`;

  const supportPhone = settings.supportPhone || '0791000001';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
        <div className="bg-[#ea1b25] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <h3 className="font-bold text-base">اتصل بنا - {settings.storeName || 'متجر رزويل الأردن'}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-sm overflow-y-auto">
          {/* Support Phone */}
          <a
            href={`tel:${supportPhone}`}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-xl border border-gray-200 dark:border-gray-700 transition"
          >
            <Phone className="w-5 h-5 text-[#ea1b25] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-white">هاتف خدمة العملاء والطلبات:</div>
              <div className="text-[#ea1b25] font-mono font-bold text-base mt-0.5 flex items-center justify-between" dir="ltr">
                <span>{supportPhone}</span>
                <span className="text-xs font-normal text-gray-500 font-sans">انقر للاتصال</span>
              </div>
            </div>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={`https://api.whatsapp.com/send?phone=${waFull}&text=${encodeURIComponent('مرحباً، استفسار بخصوص منتجات وزيوت رزويل الألمانية - متجر رزويل الأردن')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/50 transition cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <div className="font-bold">المحادثة الفورية عبر واتساب:</div>
              <div className="text-xs text-green-700 dark:text-green-400 font-mono mt-0.5" dir="ltr">
                {settings.whatsappPhone}
              </div>
              <div className="text-[11px] text-green-600 dark:text-green-500 mt-0.5">انقر للدردشة المباشرة مع فريق المبيعات والدعم</div>
            </div>
          </a>

          {/* Email if provided */}
          {settings.supportEmail && (
            <a
              href={`mailto:${settings.supportEmail}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-xl border border-gray-200 dark:border-gray-700 transition"
            >
              <Mail className="w-5 h-5 text-[#ea1b25] shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-white">البريد الإلكتروني:</div>
                <div className="text-gray-600 dark:text-gray-300 text-xs font-mono mt-0.5" dir="ltr">
                  {settings.supportEmail}
                </div>
              </div>
            </a>
          )}

          {/* Working Hours */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-gray-700">
            <Clock className="w-5 h-5 text-[#ea1b25] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900 dark:text-white">أوقات وساعات العمل:</div>
              <div className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">{settings.workingHours}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-gray-700">
            <MapPin className="w-5 h-5 text-[#ea1b25] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900 dark:text-white">المقر والشحن:</div>
              <div className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">المملكة الأردنية الهاشمية - التوصيل متوفر لجميع المحافظات</div>
            </div>
          </div>

          {/* Social Links if available */}
          {(settings.facebookUrl || settings.instagramUrl || settings.tiktokUrl || settings.twitterUrl || settings.youtubeUrl) && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs font-bold text-gray-500 mb-2">تابعنا على مواقع التواصل:</div>
              <div className="flex items-center gap-2">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition shadow-sm"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white transition shadow-sm"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-black border border-gray-700 flex items-center justify-center text-white transition text-xs font-black shadow-sm"
                    title="TikTok"
                  >
                    TK
                  </a>
                )}
                {settings.twitterUrl && (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white transition shadow-sm"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white transition shadow-sm"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
