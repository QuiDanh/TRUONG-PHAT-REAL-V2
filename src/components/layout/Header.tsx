import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  KeyRound,
  LogOut,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  // Determine current page title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'Tổng quan kinh doanh';
    if (p.startsWith('/properties')) return 'Quản lý nguồn hàng';
    if (p.startsWith('/customers')) return 'Quản lý khách hàng';
    if (p.startsWith('/matches')) return 'Ghép sản phẩm phù hợp';
    if (p.startsWith('/appointments')) return 'Lịch hẹn & Tiếp xúc';
    if (p.startsWith('/sales')) return 'Giao dịch Bán & Sang nhượng';
    if (p.startsWith('/rentals')) return 'Giao dịch Cho thuê';
    if (p.startsWith('/contracts')) return 'Hợp đồng bất động sản';
    if (p.startsWith('/payments')) return 'Kỳ thu & Thanh toán';
    if (p.startsWith('/commissions')) return 'Quản lý Hoa hồng';
    if (p.startsWith('/teams') || p.startsWith('/users')) return 'Nhân sự & Đội nhóm';
    if (p.startsWith('/reports')) return 'Báo cáo & Thống kê';
    if (p.startsWith('/audit-logs')) return 'Nhật ký hoạt động & Bảo mật';
    if (p.startsWith('/trash')) return 'Thùng rác hệ thống';
    if (p.startsWith('/settings')) return 'Cài đặt hệ thống';
    if (p.startsWith('/profile')) return 'Hồ sơ cá nhân & Bảo mật';
    return 'Hệ thống quản lý BĐS';
  };

  return (
    <>
      <header
        id="app-header"
        className="h-18 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-xs"
      >
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
              {getPageTitle()}
            </h1>
            <div className="hidden sm:flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>TRƯỜNG PHÁT REAL</span>
              <span>/</span>
              <span className="text-slate-700 font-medium">Bất động sản Việt Nam</span>
            </div>
          </div>
        </div>

        {/* Right: Environment chip, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DirectAdmin Production Chip */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            DirectAdmin PHP 8.3
          </div>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h4 className="font-bold text-sm text-slate-900">Thông báo hệ thống</h4>
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                    Giai đoạn 1
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Khởi tạo nền tảng thành công</p>
                      <p className="text-slate-500 mt-0.5">Database 33 bảng, xác thực bảo mật và phân quyền đã sẵn sàng.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Vừa xong</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Dữ liệu sản phẩm & khách hàng</p>
                      <p className="text-slate-500 mt-0.5">Hệ thống tuân thủ nghiêm ngặt: không chèn dữ liệu giả trong production.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Quy chuẩn chất lượng</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.fullName || 'Tài khoản'}
                </span>
                <span className="text-[11px] text-amber-700 font-medium">
                  {user?.role?.name || 'Vai trò'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs border border-slate-700">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 divide-y divide-slate-100">
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user?.role?.name}
                  </div>
                </div>

                <div className="py-1.5">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User className="w-4 h-4 text-slate-400" /> Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/profile#security"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" /> Đổi mật khẩu
                  </Link>
                  <Link
                    to="/audit-logs"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Nhật ký kiểm toán
                  </Link>
                </div>

                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Xác nhận đăng xuất"
        subtitle="Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại không?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Mọi thao tác chưa lưu sẽ không được ghi nhận. Phiên làm việc của bạn sẽ được thu hồi an toàn.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
            >
              Đồng ý đăng xuất
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
