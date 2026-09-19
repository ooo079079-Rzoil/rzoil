import React, { useState, useEffect } from 'react';
import { X, User, Lock, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle, KeyRound, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AdminCredentials } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: () => void;
  adminCredentials: AdminCredentials;
  initialMode?: 'user' | 'admin';
  isAdminAuthenticated?: boolean;
  onOpenAdminPanel?: () => void;
  onAdminLogout?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdminLoginSuccess,
  adminCredentials,
  initialMode = 'user',
  isAdminAuthenticated = false,
  onOpenAdminPanel,
  onAdminLogout
}) => {
  const [mode, setMode] = useState<'user' | 'admin'>(initialMode);
  
  // User login state
  const [userIdentifier, setUserIdentifier] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isUserSuccess, setIsUserSuccess] = useState(false);

  // Admin login state
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminSuccess, setIsAdminSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAdminError(null);
      setIsAdminSuccess(false);
      setIsUserSuccess(false);
      setShowAdminPass(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdentifier.trim() || !userPassword.trim()) return;

    // If customer entered 'admin', switch to admin mode smoothly
    if (userIdentifier.trim().toLowerCase() === 'admin') {
      setMode('admin');
      setAdminUser(userIdentifier);
      setAdminPass(userPassword);
      return;
    }

    setIsUserSuccess(true);
    setTimeout(() => {
      onClose();
      setIsUserSuccess(false);
    }, 1100);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const inputUser = adminUser.trim().toLowerCase();
    const inputPass = adminPass.trim();

    if (!inputUser || !inputPass) {
      setAdminError('يرجى كتابة اسم المستخدم وكلمة المرور');
      return;
    }

    // Strictly match current stored credentials from settings/database
    const storedUser = (adminCredentials.username || '').trim().toLowerCase();
    const storedPass = adminCredentials.password || '';

    const isUserMatch = inputUser === storedUser;
    const isPassMatch = inputPass === storedPass;

    if (isUserMatch && isPassMatch) {
      setIsAdminSuccess(true);
      setTimeout(() => {
        onAdminLoginSuccess();
        onClose();
        setIsAdminSuccess(false);
      }, 500);
    } else {
      setAdminError('اسم المستخدم أو كلمة المرور غير صحيحة! يرجى التأكد والمحاولة مجدداً');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with unified blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 dark:border-gray-700 animate-scale-up">
        
        {/* Unified Red Signature Header */}
        <div className="bg-[#ea1b25] text-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            {mode === 'admin' ? (
              <>
                <ShieldCheck className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">دخول المشرف (Admin)</h3>
              </>
            ) : (
              <>
                <User className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">تسجيل الدخول / حسابي</h3>
              </>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer text-white"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 bg-gray-100 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('user'); setAdminError(null); }}
            className={`py-3 text-center transition cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'user'
                ? 'border-[#ea1b25] text-[#ea1b25] bg-white dark:bg-[#1e1e1e]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>حساب الزبون</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin'); setAdminError(null); }}
            className={`py-3 text-center transition cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'admin'
                ? 'border-[#ea1b25] text-[#ea1b25] bg-white dark:bg-[#1e1e1e]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>إدارة المتجر</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5">
          {mode === 'admin' ? (
            /* ADMIN SECTION */
            isAdminAuthenticated ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">لوحة الإدارة مفعلة</h4>
                  <p className="text-xs text-gray-500 mt-0.5">أنت مسجل الدخول كمشرف النظام حالياً</p>
                </div>
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenAdminPanel) onOpenAdminPanel();
                    }}
                    className="w-full py-3 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.99] text-white font-bold rounded-xl transition shadow text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>فتح لوحة تحكم الإدارة الكاملة</span>
                  </button>
                  {onAdminLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onAdminLogout();
                        onClose();
                      }}
                      className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-bold rounded-xl transition text-xs cursor-pointer border border-transparent hover:border-red-200"
                    >
                      تسجيل الخروج من الإدارة
                    </button>
                  )}
                </div>
              </div>
            ) : isAdminSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">تم التحقق من المشرف بنجاح!</h4>
                <p className="text-xs text-gray-500">جاري تفعيل وفتح لوحة تحكم متجر رزويل الأردن...</p>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <KeyRound className="w-3.5 h-3.5 text-[#ea1b25]" />
                    <span>منطقة محمية خاصة بإدارة المتجر</span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    أدخل اسم المستخدم وكلمة المرور للوصول لإدارة الطلبات والأسعار والمخزون.
                  </div>
                </div>

                {adminError && (
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{adminError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    اسم مستخدم الإدارة (Admin Username)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: admin"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-xs focus:border-[#ea1b25] focus:outline-none font-mono"
                      dir="ltr"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    كلمة المرور (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className="w-full h-10 px-9 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-xs focus:border-[#ea1b25] focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                      title={showAdminPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.99] text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm mt-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>دخول وتفعيل لوحة الإدارة</span>
                </button>
              </form>
            )
          ) : (
            /* CUSTOMER LOGIN FORM */
            isUserSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-gray-900 dark:text-white text-base">تم تسجيل الدخول بنجاح!</h4>
                <p className="text-xs text-gray-500">أهلاً بك مجدداً في متجر رزويل الأردن</p>
              </div>
            ) : (
              <form onSubmit={handleUserLogin} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    رقم الهاتف الأردني أو البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="07XXXXXXXX أو user@example.com"
                      value={userIdentifier}
                      onChange={(e) => setUserIdentifier(e.target.value)}
                      className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-xs focus:border-[#ea1b25] focus:outline-none text-right font-mono"
                      dir="ltr"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white text-xs focus:border-[#ea1b25] focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ea1b25]" defaultChecked />
                    <span>تذكرني على هذا الجهاز</span>
                  </label>
                  <button type="button" className="text-[#ea1b25] hover:underline">
                    نسيت كلمة المرور؟
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#ea1b25] hover:bg-[#c9141d] active:scale-[0.99] text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('admin'); setAdminError(null); }}
                    className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer inline-flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#ea1b25]" />
                    <span>دخول إدارة المتجر (Staff Portal)</span>
                  </button>
                </div>
              </form>
            )
          )}
        </div>

      </div>
    </div>
  );
};
