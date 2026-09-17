import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TRƯỜNG PHÁT REAL UI Error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-rose-100 p-8 text-center">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Đã xảy ra lỗi giao diện</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Hệ thống đã ghi nhận lỗi này. Vui lòng tải lại trang để tiếp tục làm việc.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
