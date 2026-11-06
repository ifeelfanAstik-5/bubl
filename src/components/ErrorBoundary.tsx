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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-stone-800 font-sans">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-stone-200/80 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold font-serif-letter text-stone-900">
                A Gentle Breeze Paused the Stream
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed font-serif-letter">
                A minor rendering turbulence occurred. Your session and settings remain completely safe.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs font-mono text-stone-500 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Calmly</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
