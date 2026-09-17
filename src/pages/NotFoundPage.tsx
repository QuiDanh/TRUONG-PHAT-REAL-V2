import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy trang (404)</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển hướng sang địa chỉ khác trong hệ thống TRƯỜNG PHÁT REAL.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Về trang chủ Bảng điều khiển
        </Link>
      </div>
    </div>
  );
};
