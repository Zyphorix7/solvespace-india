import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SolveSpace Uncaught Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              An unexpected render error occurred. Please refresh or clear your browser cache to restore the SolveSpace catalog.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Error Details</span>
                <code className="text-xs font-mono text-rose-700 break-all">{this.state.error.message}</code>
              </div>
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('solvespace_cart_v1');
                  } catch (_) {}
                  window.location.reload();
                }}
                className="w-full py-3 bg-[#0B2545] hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload SolveSpace Store</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
