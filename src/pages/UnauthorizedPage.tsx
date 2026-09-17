import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Truy cập bị từ chối (403)</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Tài khoản của bạn không có đủ thẩm quyền để truy cập tính năng hoặc phân hệ này. Vui lòng liên hệ Quản trị viên nếu bạn cần cấp quyền.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Bảng điều khiển
        </Link>
      </div>
    </div>
  );
};
