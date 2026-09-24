import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SolveSpaceLogo } from './SolveSpaceLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* If user is already logged in */}
        {user ? (
          <div className="text-center space-y-4 pt-2">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto overflow-hidden border-2 border-[#0B2545]">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {user.displayName || 'SolveSpace Customer'}
              </h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium">
              Signed in securely with Firebase Auth
            </div>
            <button
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full min-h-[48px] bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 active:scale-95"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <SolveSpaceLogo variant="stacked" size="sm" />
              <h3 className="text-lg font-extrabold text-slate-900 pt-2">
                {mode === 'signin' ? 'Welcome Back' : 'Create Customer Account'}
              </h3>
              <p className="text-xs text-slate-500">
                Sign in to manage orders, fast track deliveries & express warranty
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl">
                {error}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-colors active:scale-98 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-200" />
              <span>or email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] bg-[#0B2545] hover:bg-slate-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs font-bold text-[#0B2545] hover:underline"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
