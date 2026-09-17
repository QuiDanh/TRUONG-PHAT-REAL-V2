import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Terminal,
  Globe,
  Clock,
  User,
  AlertTriangle
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { AuditLogItem, LoginAttemptItem, Pagination } from '../types';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'logins'>('activity');
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [logins, setLogins] = useState<LoginAttemptItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [detailItem, setDetailItem] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = `page=${pagination.page}&limit=${pagination.limit}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedModule) query += `&module=${encodeURIComponent(selectedModule)}`;

      const res = await apiRequest<{
        items: AuditLogItem[];
        recentLoginAttempts: LoginAttemptItem[];
        pagination: Pagination;
      }>(`/audit/logs?${query}`);

      if (res.success && res.data) {
        setLogs(res.data.items || []);
        setLogins(res.data.recentLoginAttempts || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedModule]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const parseJsonSafe = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-amber-600" />
            Nhật Ký Hoạt Động & Kiểm Toán An Ninh
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi vết toàn diện mọi tác vụ, thay đổi dữ liệu, lịch sử đăng nhập và bảo vệ trước gian lận.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'activity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Nhật Ký Tác Vụ ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logins')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'logins'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Lịch Sử Đăng Nhập ({logins.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar for Activity Logs */}
      {activeTab === 'activity' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm theo hành động, nhân sự, IP..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
            </div>

            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700"
            >
              <option value="">Tất cả phân hệ (Module)</option>
              <option value="auth">Xác thực & Phiên (auth)</option>
              <option value="users">Nhân sự (users)</option>
              <option value="properties">Nguồn hàng (properties)</option>
              <option value="customers">Khách hàng (customers)</option>
              <option value="transactions">Giao dịch (transactions)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : activeTab === 'activity' ? (
        logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Chưa có nhật ký tác vụ nào"
            description="Mọi hoạt động cập nhật, xóa, đăng nhập hoặc phân quyền sẽ được hệ thống tự động ghi vết an toàn tại đây."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Thời Gian</th>
                    <th className="px-5 py-3.5">Người Thực Hiện</th>
                    <th className="px-5 py-3.5">Hành Động / Module</th>
                    <th className="px-5 py-3.5">Địa Chỉ IP</th>
                    <th className="px-5 py-3.5 text-center">Trạng Thái</th>
                    <th className="px-5 py-3.5 text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {item.created_at}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">
                          {item.user_name || 'Hệ thống / Khách'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {item.user_email || item.user_code || ''}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {item.action}
                        </span>
                        <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.module}
                          {item.record_id ? ` #${item.record_id}` : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-600">
                        {item.ip_address}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {item.is_success ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Thành công
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3" /> Thất bại
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDetailItem(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Xem chi tiết thay đổi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : logins.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Chưa có lượt đăng nhập nào"
          description="Các lần đăng nhập thành công hay bị từ chối sẽ được lưu vết đầy đủ."
        />
      ) : (
        /* Login Attempts Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Thời Gian</th>
                  <th className="px-5 py-3.5">Email Đăng Nhập</th>
                  <th className="px-5 py-3.5">Địa Chỉ IP</th>
                  <th className="px-5 py-3.5">Thiết Bị / Trình Duyệt</th>
                  <th className="px-5 py-3.5 text-center">Kết Quả</th>
                  <th className="px-5 py-3.5">Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logins.map(attempt => (
                  <tr key={attempt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {attempt.created_at}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {attempt.email}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {attempt.ip_address}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-[11px] text-slate-500" title={attempt.user_agent || ''}>
                      {attempt.user_agent || 'Không xác định'}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      {attempt.is_success ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Thành công
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3 h-3" /> Bị chặn / Sai
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-rose-600 font-medium">
                      {attempt.failure_reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Item Details Modal (Diff viewer) */}
      <Modal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={`Chi tiết tác vụ #${detailItem?.id}: ${detailItem?.action}`}
        subtitle={`Module: ${detailItem?.module} • Ghi nhận: ${detailItem?.created_at}`}
        maxWidth="lg"
      >
        {detailItem && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Người thực hiện</span>
                <span className="font-semibold">{detailItem.user_name || 'Hệ thống'}</span> ({detailItem.user_email || 'N/A'})
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Địa chỉ IP & Thiết bị</span>
                <span className="font-mono">{detailItem.ip_address}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Dữ liệu trước thay đổi (Old Values):</span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono max-h-48">
                  {detailItem.old_values ? JSON.stringify(parseJsonSafe(detailItem.old_values), null, 2) : '(Không có dữ liệu cũ)'}
                </pre>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Dữ liệu mới ghi nhận (New Values):</span>
                <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl overflow-x-auto text-[11px] font-mono max-h-48">
                  {detailItem.new_values ? JSON.stringify(parseJsonSafe(detailItem.new_values), null, 2) : '(Không có dữ liệu mới)'}
                </pre>
              </div>
            </div>

            {detailItem.error_message && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                <strong>Lỗi phát sinh:</strong> {detailItem.error_message}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
