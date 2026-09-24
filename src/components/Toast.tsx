import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in slide-in-from-top-4 fade-in-50 duration-300 pointer-events-none">
      <div
        className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 max-w-sm text-xs sm:text-sm font-semibold pointer-events-auto backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-[#0B2545] text-white border-slate-700'
            : toast.type === 'error'
            ? 'bg-rose-900 text-white border-rose-700'
            : 'bg-slate-900 text-white border-slate-700'
        }`}
      >
        {toast.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : toast.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
