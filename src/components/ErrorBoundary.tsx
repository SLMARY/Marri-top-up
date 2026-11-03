import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { extractErrorMessage, safeRenderText } from '../utils/errorUtils';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: extractErrorMessage(error, 'An unexpected application error occurred.'),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught runtime error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  private handleReturnHome = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-[#101016] p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Something Went Wrong
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                We encountered an unexpected issue while rendering this page. Your account and orders remain safe.
              </p>
            </div>
            {this.state.errorMessage && (
              <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-3 text-left text-[11px] font-mono text-red-300 break-words">
                {safeRenderText(this.state.errorMessage)}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReturnHome}
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Return to Portal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
