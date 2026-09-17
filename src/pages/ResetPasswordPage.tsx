import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { success: toastSuccess } = useToast();

  // Kiểm tra độ mạnh mật khẩu chuẩn bảo mật
  const rules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword
  };

  const isFormValid =
    rules.length &&
    rules.uppercase &&
    rules.lowercase &&
    rules.number &&
    rules.special &&
    rules.match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Mã liên kết đặt lại mật khẩu không hợp lệ hoặc đã bị thiếu.');
      return;
    }

    if (!isFormValid) {
      setErrorMessage('Vui lòng hoàn thành tất cả các tiêu chí bảo mật mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      if (res.success) {
        setIsSuccess(true);
        toastSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      } else {
        setErrorMessage(res.message || 'Không thể đặt lại mật khẩu.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-xl mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b132b] rounded-[14px] flex items-center justify-center">
              <span className="font-serif font-extrabold text-amber-400 text-xl tracking-tighter">TP</span>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
            TRƯỜNG PHÁT REAL
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Hệ thống Quản lý Bất động sản Nội bộ • Thiết lập Mật khẩu Mới
          </p>
        </div>

        <div className="bg-[#0f1a36]/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          {!token ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Liên kết không hợp lệ</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mã xác thực đặt lại mật khẩu không được tìm thấy trên thanh địa chỉ. Vui lòng kiểm tra lại liên kết trong email hoặc gửi lại yêu cầu.
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  to="/forgot-password"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all text-center"
                >
                  YÊU CẦU LẠI LIÊN KẾT MỚI
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 pt-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại trang Đăng nhập
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Đổi mật khẩu thành công!</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mật khẩu tài khoản công vụ của bạn đã được cập nhật an toàn. Mọi phiên đăng nhập cũ đã được thu hồi để bảo vệ dữ liệu.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>ĐĂNG NHẬP NGAY BẰNG MẬT KHẨU MỚI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Nhập mật khẩu mới cho tài khoản công vụ của bạn. Liên kết có hiệu lực trong 30 phút và chỉ dùng 1 lần.
              </p>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-200">
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checklist độ an toàn mật khẩu */}
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider mb-2">
                  Tiêu chuẩn mật khẩu công vụ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${rules.length ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {rules.length ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />}
                    <span>Tối thiểu 8 ký tự</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.uppercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {rules.uppercase ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />}
                    <span>1 chữ hoa (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.lowercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {rules.lowercase ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />}
                    <span>1 chữ thường (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.number ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {rules.number ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />}
                    <span>1 chữ số (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.special ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {rules.special ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />}
                    <span>1 ký tự đặc biệt (!@#...)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${rules.match ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {rules.match ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />}
                    <span>Xác nhận mật khẩu trùng khớp</span>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>ĐANG THIẾT LẬP MẬT KHẨU...</span>
                ) : (
                  <>
                    <span>ĐẶT LẠI MẬT KHẨU</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại trang Đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
