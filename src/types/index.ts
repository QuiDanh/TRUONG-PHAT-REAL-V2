/**
 * TRƯỜNG PHÁT REAL - TypeScript Type Definitions
 * Đồng bộ chính xác với cơ sở dữ liệu MariaDB và Backend PHP REST API.
 */

export type RoleCode = 'ADMIN' | 'TEAM_LEADER' | 'AGENT' | 'ACCOUNTANT';

export interface Role {
  id: number;
  code: RoleCode | string;
  name: string;
  description?: string;
}

export interface Team {
  id: number;
  name: string;
  code?: string;
}

export interface User {
  id: number;
  code: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string | null;
  title?: string | null;
  role: Role;
  team?: Team | null;
  requirePasswordChange: boolean;
  permissions: string[];
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  status?: 'active' | 'locked' | 'inactive';
  createdAt?: string;
}

export interface AuthResponseData {
  token: string;
  expires_at: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string> | null;
  requestId: string;
}

export interface DashboardSummary {
  totalProperties: number;
  newProperties: number;
  sellingProperties: number;
  rentingProperties: number;
  depositedProperties: number;
  totalCustomers: number;
  newCustomers: number;
  caringCustomers: number;
  overdueCareCustomers: number;
  activeTransactions: number;
  completedTransactions: number;
  totalSalesVolume: number;
  totalRentRevenue: number;
  totalCommission: number;
  appointmentsToday: number;
  pendingTasks: number;
}

export interface DashboardStats {
  summary: DashboardSummary;
  filter: {
    range: string;
    startDate: string;
    endDate: string;
  };
  recentAppointments: any[];
  staleProperties: any[];
  staleCustomers: any[];
  monthlyPerformance: any[];
}

export interface AuditLogItem {
  id: number;
  user_id: number | null;
  action: string;
  module: string;
  record_id: number | null;
  old_values: string | null;
  new_values: string | null;
  ip_address: string;
  user_agent: string | null;
  is_success: number;
  error_message: string | null;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
  user_code?: string | null;
}

export interface LoginAttemptItem {
  id: number;
  email: string;
  ip_address: string;
  user_agent: string | null;
  is_success: number;
  failure_reason: string | null;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
