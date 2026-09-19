import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X, Trash2, ShieldCheck, Database } from 'lucide-react';

export interface InAppDialogProps {
  isOpen: boolean;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'delete';
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const InAppModal: React.FC<InAppDialogProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  details,
  confirmText = 'موافق',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  onClose
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const handleConfirmAction = () => {
    if (onConfirm) onConfirm();
    else if (onClose) onClose();
  };

  const isConfirmDialog = type === 'confirm' || type === 'delete';

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-500" />;
      case 'error':
      case 'delete':
        return <AlertCircle className="w-8 h-8 text-[#ea1b25]" />;
      case 'info':
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case 'delete':
      case 'error':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50';
      default:
        return 'bg-gray-50 dark:bg-[#202020] border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0" 
        onClick={handleClose} 
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10 animate-scale-up">
        {/* Top Header */}
        <div className={`p-4 border-b flex items-start gap-3.5 ${getHeaderBg()}`}>
          <div className="p-2 rounded-xl bg-white dark:bg-[#252525] shadow-xs shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 pr-1">
            <h3 className="font-black text-base text-gray-900 dark:text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Details block */}
        {details && (
          <div className="p-4 bg-gray-50 dark:bg-[#222222] border-b border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 font-mono overflow-x-auto max-h-32">
            {details}
          </div>
        )}

        {/* Bottom Actions Buttons */}
        <div className="p-3.5 bg-gray-50 dark:bg-[#1f1f1f] flex items-center justify-end gap-2.5">
          {isConfirmDialog && (
            <button
              onClick={handleClose}
              type="button"
              className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={handleConfirmAction}
            type="button"
            className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
              type === 'delete' || type === 'error'
                ? 'bg-[#ea1b25] hover:bg-[#c9141d]'
                : type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gray-900 hover:bg-black dark:bg-[#ea1b25] dark:hover:bg-[#c9141d]'
            }`}
          >
            {type === 'delete' && <Trash2 className="w-3.5 h-3.5" />}
            {type === 'success' && <CheckCircle className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
