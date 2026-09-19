import React from 'react';
import { ShieldCheck, Award, UserCheck, Sparkles, Building2 } from 'lucide-react';

export const GoldenFalconCard: React.FC = () => {
  return (
    <div className="w-full max-w-sm mx-auto bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 hover:border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden group transition-all duration-300">
      <div className="relative flex flex-col items-center text-center space-y-4">
        {/* Emblem / Logo Container - Seamlessly Blended */}
        <div className="relative w-full flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center p-0">
            <img 
              src="/golden-falcon-logo.png" 
              alt="شعار شركة الصقر الذهبي للوكالات التجارية" 
              className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
        </div>

        {/* Company Name Badge */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-extrabold mb-1">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>شركة الصقر الذهبي للوكالات التجارية</span>
          </div>
          <div className="text-[11px] text-gray-300 font-medium">
            المستورد والوكيل الحصري لمنتجات RZ Oil الألمانية
          </div>
        </div>

        {/* Management Info */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs flex items-center justify-center gap-2 text-xs text-amber-200">
          <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="font-extrabold text-white text-xs sm:text-sm">
            بإدارة: <span className="text-amber-300">جلال المخادمة</span> و <span className="text-amber-300">عامر المخادمة</span>
          </div>
        </div>

        {/* Quality Seal */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold pt-0.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>وكالة معتمدة وموثوقة بالمملكة الأردنية الهاشمية</span>
        </div>
      </div>
    </div>
  );
};
