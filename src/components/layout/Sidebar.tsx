import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users2,
  GitCompare,
  CalendarDays,
  BadgePercent,
  KeyRound,
  FileText,
  CreditCard,
  Coins,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user } = useAuth();

  const navItems = [
    {
      group: 'CHÍNH',
      items: [
        { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard, badge: null, phase: 1 },
        { name: 'Nguồn hàng', path: '/properties', icon: Building2, badge: 'GĐ 2', phase: 2 },
        { name: 'Khách hàng', path: '/customers', icon: Users2, badge: 'GĐ 3', phase: 3 },
        { name: 'Ghép sản phẩm', path: '/matches', icon: GitCompare, badge: 'GĐ 3', phase: 3 },
        { name: 'Lịch hẹn', path: '/appointments', icon: CalendarDays, badge: 'GĐ 3', phase: 3 }
      ]
    },
    {
      group: 'KINH DOANH & TÀI CHÍNH',
      items: [
        { name: 'Bán & Sang nhượng', path: '/sales', icon: BadgePercent, badge: 'GĐ 4', phase: 4 },
        { name: 'Cho thuê', path: '/rentals', icon: KeyRound, badge: 'GĐ 4', phase: 4 },
        { name: 'Hợp đồng', path: '/contracts', icon: FileText, badge: 'GĐ 4', phase: 4 },
        { name: 'Thanh toán', path: '/payments', icon: CreditCard, badge: 'GĐ 4', phase: 4 },
        { name: 'Hoa hồng', path: '/commissions', icon: Coins, badge: 'GĐ 5', phase: 5 }
      ]
    },
    {
      group: 'HỆ THỐNG & QUẢN TRỊ',
      items: [
        { name: 'Nhân sự & Nhóm', path: '/teams', icon: ShieldCheck, badge: 'GĐ 5', phase: 5 },
        { name: 'Báo cáo', path: '/reports', icon: BarChart3, badge: 'GĐ 5', phase: 5 },
        { name: 'Nhật ký hoạt động', path: '/audit-logs', icon: ClipboardList, badge: null, phase: 1 },
        { name: 'Thùng rác', path: '/trash', icon: Trash2, badge: null, phase: 1 },
        { name: 'Cài đặt hệ thống', path: '/settings', icon: Settings, badge: null, phase: 1 }
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b132b] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Monogram TP Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center">
              <span className="font-serif font-extrabold text-amber-400 text-lg tracking-tighter">TP</span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5 truncate">
                TRƯỜNG PHÁT <span className="text-amber-400 text-xs px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">REAL</span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">Hệ Thống Môi Giới BĐS</span>
            </div>
          )}
        </div>

        {/* Collapse toggle (Desktop only) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[11px] font-semibold text-slate-300 tracking-wider uppercase mb-1">
                {group.group}
              </div>
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : ''} text-slate-300 group-hover:text-amber-400 transition-colors`} />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 truncate">
                      <span className="truncate">{item.name}</span>
                      {item.badge ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          {item.badge}
                        </span>
                      ) : item.phase === 1 && item.path !== '/dashboard' ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      ) : null}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* DirectAdmin Production Badge */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Giai Đoạn 1: Sẵn Sàng
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Kiến trúc PHP 8.3 REST API + MariaDB 10.6 cho DirectAdmin.
          </p>
        </div>
      )}

      {/* User Mini Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080e1f] shrink-0">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                {user?.fullName || 'Người dùng'}
              </p>
              <span className="text-[11px] text-amber-400/90 truncate block">
                {user?.role?.name || 'Thành viên'}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-sidebar"
        className={`hidden lg:block shrink-0 transition-all duration-300 h-screen sticky top-0 border-r border-slate-800 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
