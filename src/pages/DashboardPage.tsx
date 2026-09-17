import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Users,
  BadgePercent,
  Coins,
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowUpRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { DashboardStats } from '../types';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [range, setRange] = useState<string>('this_month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = `range=${range}`;
      if (range === 'custom' && customStart && customEnd) {
        query += `&start_date=${customStart}&end_date=${customEnd}`;
      }
      const res = await apiRequest<DashboardStats>(`/dashboard/stats?${query}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [range, customStart, customEnd]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const summary = data?.summary || {
    totalProperties: 0,
    newProperties: 0,
    sellingProperties: 0,
    rentingProperties: 0,
    depositedProperties: 0,
    totalCustomers: 0,
    newCustomers: 0,
    caringCustomers: 0,
    overdueCareCustomers: 0,
    activeTransactions: 0,
    completedTransactions: 0,
    totalSalesVolume: 0,
    totalRentRevenue: 0,
    totalCommission: 0,
    appointmentsToday: 0,
    pendingTasks: 0
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Xin chào, {user?.fullName}!
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
              {user?.role?.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bảng điều khiển kinh doanh bất động sản • Múi giờ: Asia/Ho_Chi_Minh (GMT+7)
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'this_week', label: 'Tuần này' },
              { id: 'this_month', label: 'Tháng này' },
              { id: 'this_quarter', label: 'Quý này' },
              { id: 'this_year', label: 'Năm nay' },
              { id: 'custom', label: 'Tùy chọn' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  range === tab.id
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchStats}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Inputs if selected */}
      {range === 'custom' && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs animate-in fade-in">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> Chọn khoảng ngày:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-slate-400">đến</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
            <button
              type="button"
              onClick={fetchStats}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* Primary 4 Metric Cards */}
      {isLoading && !data ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Nguồn hàng */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nguồn Hàng
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {summary.totalProperties}
              </span>
              <span className="text-xs text-slate-500">sản phẩm</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div>
                Bán: <strong className="text-slate-800">{summary.sellingProperties}</strong>
              </div>
              <div>
                Thuê: <strong className="text-slate-800">{summary.rentingProperties}</strong>
              </div>
              <div>
                Cọc: <strong className="text-amber-600">{summary.depositedProperties}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Khách hàng */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Khách Hàng
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {summary.totalCustomers}
              </span>
              <span className="text-xs text-slate-500">liên hệ</span>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div>
                Mới: <strong className="text-slate-800">{summary.newCustomers}</strong>
              </div>
              <div>
                Cần chăm sóc: <strong className="text-emerald-700">{summary.caringCustomers}</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Giao dịch */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Giao Dịch
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BadgePercent className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {summary.activeTransactions}
              </span>
              <span className="text-xs text-slate-500">đang xử lý</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Đã hoàn tất:</span>
              <strong className="text-purple-700 font-bold">{summary.completedTransactions} giao dịch</strong>
            </div>
          </div>

          {/* Card 4: Doanh thu & Hoa hồng */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hoa Hồng Thực Nhận
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-extrabold text-slate-900 truncate">
                {formatCurrency(summary.totalCommission)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Doanh số bán:</span>
              <strong className="text-slate-800">{formatCurrency(summary.totalSalesVolume)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Row: Lịch hẹn hôm nay & Trạng thái hệ thống */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Lịch hẹn & Công việc */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Lịch Hẹn & Công Việc Hôm Nay
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {summary.appointmentsToday} lịch hẹn
            </span>
          </div>

          {summary.appointmentsToday === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
              <Clock className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Chưa có lịch hẹn nào hôm nay</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Khi các chuyên viên môi giới lên lịch hẹn dẫn khách xem nhà ở Giai đoạn 3, hệ thống sẽ tự động nhắc nhở tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Lịch hẹn thực tế */}
            </div>
          )}

          {/* Quy chuẩn cơ sở dữ liệu trống */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-0.5">
                Cơ sở dữ liệu đang ở trạng thái chuẩn ban đầu (0 dữ liệu mẫu)
              </span>
              Theo tiêu chuẩn của phần mềm thực tế, khi chưa có nguồn hàng hay khách hàng phát sinh, mọi thống kê hiển thị chính xác số 0, không dùng dữ liệu mô phỏng.
            </div>
          </div>
        </div>

        {/* Right 1 Col: Thông số hạ tầng hosting & Giai đoạn tiếp theo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Hạ Tầng DirectAdmin</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Môi trường máy chủ:</span>
                <span className="font-semibold text-slate-800">Apache / LiteSpeed</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Phiên bản PHP:</span>
                <span className="font-semibold text-slate-800">PHP 8.3 (Pure REST)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Hệ quản trị CSDL:</span>
                <span className="font-semibold text-slate-800">MariaDB 10.6+ (33 bảng)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Thư mục gốc web:</span>
                <span className="font-semibold text-slate-800">public_html</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Bảo mật xác thực:</span>
                <span className="font-semibold text-emerald-600">Bcrypt + Khóa tạm 5 lần</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800">
              <span className="font-bold block mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Sẵn sàng cho Giai đoạn 2
              </span>
              Module Nguồn hàng, Upload ảnh đa định dạng, Watermark, Lịch sử giá và Soft delete.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
