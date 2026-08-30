import React, { useEffect } from 'react';
import { CheckCircle2, AlertOctagon, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertOctagon,
    info: Info
  };

  const Icon = icons[toast.type] || Info;

  const typeStyles = {
    success: 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-lg',
    error: 'border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-300 shadow-lg',
    info: 'border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900 text-blue-800 dark:text-blue-300 shadow-lg'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in slide-in-from-bottom-3 duration-200">
      <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 ${typeStyles[toast.type] || typeStyles.info}`}>
        <Icon size={18} className="shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          {toast.title && (
            <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-slate-600 dark:text-slate-300 leading-normal">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
