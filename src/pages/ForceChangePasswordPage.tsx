import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldAlert, Check, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ForceChangePasswordPage: React.FC = () => {
  const { changePassword, logout, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength checks
  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[\W_]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword
  };

  const isAllValid =
    checks.length &&
    checks.uppercase &&
    checks.lowercase &&
    checks.number &&
    checks.special &&
    checks.match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAllValid) {
      setErrorMessage('Mật khẩu chưa đáp ứng đầy đủ các tiêu chuẩn bảo mật bên dưới.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      success('Đổi mật khẩu thành công. Bạn có thể sử dụng hệ thống ngay bây giờ.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Yêu cầu đổi mật khẩu lần đầu</h2>
          <p className="mt-1 text-xs text-slate-400">
            Xin chào <strong>{user?.fullName}</strong>. Để bảo vệ dữ liệu khách hàng và nguồn hàng, bạn cần tạo mật khẩu riêng trước khi vào hệ thống.
          </p>
        </div>

        <div className="bg-[#0f1a36]/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-800">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Mật khẩu tạm thời hiện tại
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, hoa, thường, số, ký tự đặc biệt"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Checklist Tiêu Chuẩn Mật Khẩu */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">Tiêu chuẩn mật khẩu an toàn:</span>
              <div className="flex items-center gap-2">
                {checks.length ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={checks.length ? 'text-emerald-400' : 'text-slate-400'}>Ít nhất 8 ký tự</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.uppercase ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={checks.uppercase ? 'text-emerald-400' : 'text-slate-400'}>Chứa chữ cái in hoa (A-Z)</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.lowercase ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={checks.lowercase ? 'text-emerald-400' : 'text-slate-400'}>Chứa chữ cái thường (a-z)</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.number ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={checks.number ? 'text-emerald-400' : 'text-slate-400'}>Chứa ít nhất 1 chữ số (0-9)</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.special ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={checks.special ? 'text-emerald-400' : 'text-slate-400'}>Chứa ký tự đặc biệt (!@#$%^&*...)</span>
              </div>
              <div className="flex items-center gap-2">
                {checks.match ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={checks.match ? 'text-emerald-400' : 'text-slate-400'}>Hai mật khẩu khớp nhau</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isAllValid}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                'Đang lưu mật khẩu...'
              ) : (
                <>
                  <span>XÁC NHẬN VÀ TIẾP TỤC</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={logout}
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
              >
                Đăng xuất khỏi tài khoản này
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
