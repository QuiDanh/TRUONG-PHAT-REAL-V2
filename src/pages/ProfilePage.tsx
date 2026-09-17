import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Shield,
  Clock,
  Globe,
  KeyRound,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../api/client';
import { Modal } from '../components/common/Modal';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { success, error: toastError } = useToast();

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Modal revoke all sessions
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toastError('Họ và tên không được để trống.');
      return;
    }
    if (!phone || !/^(0[3|5|7|8|9])[0-9]{8}$/.test(phone.trim())) {
      toastError('Số điện thoại không hợp lệ (yêu cầu số di động 10 chữ số của Việt Nam).');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateProfile(fullName.trim(), phone.trim());
      success('Cập nhật hồ sơ cá nhân thành công.');
    } catch (err: any) {
      toastError(err.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (!currentPassword) {
      setPassError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 8) {
      setPassError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      success('Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.message || 'Đổi mật khẩu không thành công.';
      setPassError(msg);
      toastError(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    setShowRevokeModal(false);
    await logout();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 font-extrabold text-2xl flex items-center justify-center shadow-md border border-slate-800">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                {user?.code}
              </span>
              <span>•</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                {user?.role?.name}
              </span>
              {user?.team && (
                <>
                  <span>•</span>
                  <span className="text-slate-600">{user.team.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRevokeModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Thu hồi mọi phiên đăng nhập
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Info Overview & Last Login Meta */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              Thông Tin Xác Thực
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Email công vụ</span>
                  <span className="font-semibold text-slate-800 truncate block">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Đăng nhập gần nhất</span>
                  <span className="font-semibold text-slate-800">
                    {user?.lastLoginAt || 'Chưa ghi nhận'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Địa chỉ IP gần nhất</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {user?.lastLoginIp || '127.0.0.1'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Forms for Update Profile & Change Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form 1: Cập nhật thông tin cá nhân */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              Chỉnh Sửa Hồ Sơ Cá Nhân
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Số điện thoại liên lạc
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Định dạng số điện thoại di động Việt Nam (10 chữ số).
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isUpdatingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Đổi mật khẩu chủ động */}
          <div id="security" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Đổi Mật Khẩu Chủ Động
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mật khẩu an toàn phải có tối thiểu 8 ký tự, gồm cả chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>

            {passError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới an toàn"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {isChangingPass ? 'Đang xử lý...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Revoke Sessions Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Thu hồi toàn bộ phiên làm việc"
        subtitle="Hành động này sẽ đăng xuất tài khoản của bạn khỏi tất cả các thiết bị và trình duyệt khác."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Nếu bạn nghi ngờ mật khẩu bị lộ hoặc để quên phiên đăng nhập trên thiết bị công cộng, thao tác này sẽ vô hiệu hóa ngay lập tức toàn bộ session token đã cấp.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRevokeModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleRevokeAllSessions}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
            >
              Xác nhận thu hồi & Đăng xuất
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
