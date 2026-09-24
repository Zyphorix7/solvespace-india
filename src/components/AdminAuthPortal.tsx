import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SolveSpaceLogo } from './SolveSpaceLogo';

interface AdminAuthPortalProps {
  onAuthenticate: (password: string) => boolean;
  onCancel: () => void;
}

export const AdminAuthPortal: React.FC<AdminAuthPortalProps> = ({ onAuthenticate, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter the administrative master passkey.');
      return;
    }

    const valid = onAuthenticate(password);
    if (valid) {
      setIsSuccess(true);
    } else {
      setError('Invalid master passkey. Access to SolveSpace Operations denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Security Header Banner */}
        <div className="bg-[#0B2545] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A36]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 mb-3 shadow-inner">
            <Shield className="w-7 h-7 text-[#FF5A36]" />
          </div>
          <div className="flex justify-center mb-1">
            <SolveSpaceLogo variant="icon" size="sm" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">SolveSpace Operations</h2>
          <p className="text-xs text-slate-300 mt-1">
            Administrative Management & Dispatch Console
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-slate-300">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Restricted Zone • Staff Only</span>
          </div>
        </div>

        {/* Auth Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Master Admin Passkey
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter admin password..."
                autoFocus
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#0B2545] focus:ring-2 focus:ring-[#0B2545]/15 focus:outline-hidden transition-all placeholder:text-slate-400 font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Only authorized SolveSpace India administrators have access to this link.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Passkey verified. Opening SolveSpace Console...</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full min-h-[48px] py-3 px-4 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#FF5A36]" />
              <span>Unlock Admin Console</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full min-h-[44px] py-2.5 px-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Storefront</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
