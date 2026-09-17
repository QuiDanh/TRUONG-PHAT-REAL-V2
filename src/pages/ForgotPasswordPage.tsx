import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() })
      });
      setIsSubmitted(true);
    } catch (err: any) {
      toastError(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 p-0.5 shadow-lg mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b132b] rounded-[14px] flex items-center justify-center">
              <span className="font-serif font-extrabold text-amber-400 text-xl tracking-tighter">TP</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Khôi phục mật khẩu</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Hệ thống Quản lý Bất động sản TRƯỜNG PHÁT REAL
          </p>
        </div>

        <div className="bg-[#0f1a36]/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-800">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Yêu cầu đã được ghi nhận</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nếu địa chỉ <strong className="text-amber-400">{email}</strong> tồn tại trên hệ thống TRƯỜNG PHÁT REAL, mã khôi phục an toàn (thời hạn 30 phút) đã được khởi tạo.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại trang Đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Nhập email công vụ được cấp. Hệ thống sẽ tạo liên kết bảo mật để bạn thiết lập lại mật khẩu mới.
              </p>

              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email công vụ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@truongphatreal.vn"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-md transition-all disabled:opacity-50"
              >
                {isLoading ? 'Đang xử lý...' : 'GỬI YÊU CẦU ĐẶT LẠI'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
