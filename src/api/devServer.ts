/**
 * TRƯỜNG PHÁT REAL - Local Development Mock Server Middleware for Vite
 * Đảm bảo ứng dụng chạy mượt mà ngay trong môi trường dev & preview.
 * Trong production trên DirectAdmin, Apache/LiteSpeed sẽ phục vụ PHP 8.3 thuần.
 */

interface DevUser {
  id: number;
  code: string;
  email: string;
  passwordHash: string; // Plain / simple hash for dev mode
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  role: {
    id: number;
    code: string;
    name: string;
  };
  team: { id: number; name: string } | null;
  status: 'active' | 'locked' | 'inactive';
  requirePasswordChange: boolean;
  failedLoginAttempts: number;
  lockedUntil: number | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
}

interface DevSession {
  id: string;
  userId: number;
  token: string;
  expiresAt: number;
  isRevoked: boolean;
}

interface DevAuditLog {
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

interface DevLoginAttempt {
  id: number;
  email: string;
  ip_address: string;
  user_agent: string | null;
  is_success: number;
  failure_reason: string | null;
  created_at: string;
}

// In-memory persistent state during dev server lifetime
const devState = {
  users: [
    {
      id: 1,
      code: 'TP-AD001',
      email: 'admin@truongphatsoft.online',
      passwordHash: 'Admin@2026', // Khởi tạo an toàn cho dev
      fullName: 'Nguyễn Văn Phát (Giám Đốc)',
      phone: '0901234567',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: {
        id: 1,
        code: 'ADMIN',
        name: 'Quản trị viên tối cao'
      },
      team: null,
      status: 'active' as const,
      requirePasswordChange: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: '127.0.0.1',
      createdAt: '2026-01-01 08:00:00'
    },
    {
      id: 2,
      code: 'TP-TL001',
      email: 'leader@truongphatsoft.online',
      passwordHash: 'Leader@2026',
      fullName: 'Trần Thị Kim Oanh (Trưởng Nhóm)',
      phone: '0912345678',
      avatarUrl: null,
      role: {
        id: 2,
        code: 'TEAM_LEADER',
        name: 'Trưởng nhóm kinh doanh'
      },
      team: { id: 1, name: 'Khối Kinh Doanh Đông Sài Gòn' },
      status: 'active' as const,
      requirePasswordChange: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      lastLoginIp: null,
      createdAt: '2026-01-05 09:00:00'
    },
    {
      id: 3,
      code: 'TP-AG001',
      email: 'agent@truongphatsoft.online',
      passwordHash: 'Agent@2026',
      fullName: 'Lê Minh Tuấn (Môi Giới)',
      phone: '0987654321',
      avatarUrl: null,
      role: {
        id: 3,
        code: 'AGENT',
        name: 'Chuyên viên môi giới'
      },
      team: { id: 1, name: 'Khối Kinh Doanh Đông Sài Gòn' },
      status: 'active' as const,
      requirePasswordChange: true, // Thử nghiệm tính năng bắt buộc đổi mật khẩu lần đầu
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      lastLoginIp: null,
      createdAt: '2026-02-01 10:00:00'
    }
  ] as DevUser[],
  sessions: [] as DevSession[],
  auditLogs: [] as DevAuditLog[],
  loginAttempts: [] as DevLoginAttempt[],
  logIdCounter: 1
};

export function handleDevApi(url: string, method: string, headers: any, body: any): { status: number; body: any } {
  const path = url.replace(/^\/api\/v1/, '').split('?')[0] || '/';
  const requestId = 'REQ-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();

  const makeRes = (success: boolean, message: string, data: any = null, errors: any = null, status: number = 200, resHeaders: any = null) => ({
    status,
    headers: resHeaders || {},
    body: {
      success,
      message,
      data: data || {},
      errors: errors || {},
      requestId
    }
  });

  const getAuthUser = (): DevUser | null => {
    let token = '';
    const cookieHeader = headers['cookie'] || headers['Cookie'] || '';
    const match = cookieHeader.match(/tp_token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
    if (!token) {
      const authHeader = headers['authorization'] || headers['Authorization'] || '';
      token = authHeader.replace(/^Bearer\s+/i, '').trim();
    }
    if (!token) return null;
    const session = devState.sessions.find(s => s.token === token && !s.isRevoked && s.expiresAt > Date.now());
    if (!session) return null;
    return devState.users.find(u => u.id === session.userId) || null;
  };

  // 1. POST /auth/login
  if (path === '/auth/login' && method === 'POST') {
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const rememberMe = Boolean(body.rememberMe);

    if (!email || !password) {
      return makeRes(false, 'Vui lòng nhập đầy đủ Email và Mật khẩu.', null, { email: 'Bắt buộc' }, 400);
    }

    const user = devState.users.find(u => u.email.toLowerCase() === email);
    const nowStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    if (!user) {
      devState.loginAttempts.unshift({
        id: devState.logIdCounter++,
        email,
        ip_address: '127.0.0.1',
        user_agent: headers['user-agent'] || 'Trình duyệt Web',
        is_success: 0,
        failure_reason: 'Tài khoản không tồn tại',
        created_at: nowStr
      });
      return makeRes(false, 'Email hoặc mật khẩu không chính xác.', null, null, 400);
    }

    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return makeRes(false, `Tài khoản đang bị tạm khóa sau nhiều lần đăng nhập sai. Vui lòng thử lại sau ${minutesLeft} phút.`, null, null, 400);
    }

    // Check password
    if (user.passwordHash !== password) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = Date.now() + 15 * 60 * 1000;
        devState.loginAttempts.unshift({
          id: devState.logIdCounter++,
          email,
          ip_address: '127.0.0.1',
          user_agent: headers['user-agent'] || 'Trình duyệt Web',
          is_success: 0,
          failure_reason: 'Khóa tạm do sai 5 lần',
          created_at: nowStr
        });
        return makeRes(false, 'Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản bị tạm khóa 15 phút.', null, null, 400);
      } else {
        const remaining = 5 - user.failedLoginAttempts;
        devState.loginAttempts.unshift({
          id: devState.logIdCounter++,
          email,
          ip_address: '127.0.0.1',
          user_agent: headers['user-agent'] || 'Trình duyệt Web',
          is_success: 0,
          failure_reason: `Sai mật khẩu (lần ${user.failedLoginAttempts}/5)`,
          created_at: nowStr
        });
        return makeRes(false, `Mật khẩu không chính xác. Bạn còn ${remaining} lần thử trước khi bị khóa tạm.`, null, null, 400);
      }
    }

    // Success
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = nowStr;
    user.lastLoginIp = '127.0.0.1';

    const token = 'tp_tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const lifetime = rememberMe ? 30 * 86400 * 1000 : 7 * 86400 * 1000;
    devState.sessions.push({
      id: 'sess_' + Date.now(),
      userId: user.id,
      token,
      expiresAt: Date.now() + lifetime,
      isRevoked: false
    });

    devState.loginAttempts.unshift({
      id: devState.logIdCounter++,
      email,
      ip_address: '127.0.0.1',
      user_agent: headers['user-agent'] || 'Trình duyệt Web',
      is_success: 1,
      failure_reason: null,
      created_at: nowStr
    });

    devState.auditLogs.unshift({
      id: devState.logIdCounter++,
      user_id: user.id,
      action: 'login_success',
      module: 'auth',
      record_id: user.id,
      old_values: null,
      new_values: JSON.stringify({ email: user.email }),
      ip_address: '127.0.0.1',
      user_agent: headers['user-agent'] || 'Trình duyệt Web',
      is_success: 1,
      error_message: null,
      created_at: nowStr,
      user_name: user.fullName,
      user_email: user.email,
      user_code: user.code
    });

    const cookieStr = `tp_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(lifetime / 1000)}`;

    return makeRes(true, 'Đăng nhập thành công.', {
      token,
      expires_at: new Date(Date.now() + lifetime).toISOString(),
      user: {
        id: user.id,
        code: user.code,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        title: 'Chuyên viên Bất động sản',
        role: user.role,
        team: user.team,
        requirePasswordChange: user.requirePasswordChange,
        permissions: user.role.code === 'ADMIN' ? ['*'] : ['dashboard.view', 'properties.view', 'customers.view', 'appointments.view']
      }
    }, null, 200, { 'Set-Cookie': cookieStr });
  }

  // 2. GET /auth/me
  if (path === '/auth/me' && method === 'GET') {
    const user = getAuthUser();
    if (!user) return makeRes(false, 'Chưa đăng nhập hoặc phiên đã hết hạn.', null, null, 401);
    return makeRes(true, 'Lấy thông tin tài khoản thành công.', {
      id: user.id,
      code: user.code,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      title: 'Chuyên viên Bất động sản',
      role: user.role,
      team: user.team,
      requirePasswordChange: user.requirePasswordChange,
      permissions: user.role.code === 'ADMIN' ? ['*'] : ['dashboard.view', 'properties.view', 'customers.view', 'appointments.view']
    });
  }

  // 3. POST /auth/logout
  if (path === '/auth/logout' && method === 'POST') {
    let token = '';
    const cookieHeader = headers['cookie'] || headers['Cookie'] || '';
    const match = cookieHeader.match(/tp_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
    if (!token) {
      const authHeader = headers['authorization'] || headers['Authorization'] || '';
      token = authHeader.replace(/^Bearer\s+/i, '').trim();
    }
    const session = devState.sessions.find(s => s.token === token);
    if (session) session.isRevoked = true;
    const clearCookie = 'tp_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return makeRes(true, 'Đăng xuất thành công.', null, null, 200, { 'Set-Cookie': clearCookie });
  }

  // 4. POST /auth/change-password
  if (path === '/auth/change-password' && method === 'POST') {
    const user = getAuthUser();
    if (!user) return makeRes(false, 'Chưa đăng nhập.', null, null, 401);

    const { currentPassword, newPassword } = body;
    if (!user.requirePasswordChange && user.passwordHash !== currentPassword) {
      return makeRes(false, 'Mật khẩu hiện tại không đúng.', null, null, 400);
    }
    if (!newPassword || newPassword.length < 8) {
      return makeRes(false, 'Mật khẩu mới phải có tối thiểu 8 ký tự.', null, null, 400);
    }

    user.passwordHash = newPassword;
    user.requirePasswordChange = false;
    return makeRes(true, 'Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới.');
  }

  // 5. POST /auth/forgot-password
  if (path === '/auth/forgot-password' && method === 'POST') {
    return makeRes(true, 'Nếu email tồn tại trên hệ thống, mã bảo mật khôi phục mật khẩu (thời hạn 30 phút) đã được khởi tạo.');
  }

  // 5b. POST /auth/reset-password
  if (path === '/auth/reset-password' && method === 'POST') {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      return makeRes(false, 'Vui lòng cung cấp đầy đủ thông tin đặt lại mật khẩu.', null, null, 400);
    }
    if (newPassword.length < 8) {
      return makeRes(false, 'Mật khẩu mới phải có tối thiểu 8 ký tự.', null, null, 400);
    }
    // Update admin password for dev testing
    if (devState.users[0]) {
      devState.users[0].passwordHash = newPassword;
      devState.users[0].requirePasswordChange = false;
      devState.users[0].failedLoginAttempts = 0;
      devState.users[0].lockedUntil = null;
    }
    // Revoke old sessions
    devState.sessions.forEach(s => { s.isRevoked = true; });
    return makeRes(true, 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
  }

  // 6. GET /dashboard/stats
  // TUYỆT ĐỐI TUÂN THỦ: Khi database trống, toàn bộ số liệu thống kê phải trả về số 0!
  if (path === '/dashboard/stats' && method === 'GET') {
    const user = getAuthUser();
    if (!user) return makeRes(false, 'Chưa đăng nhập.', null, null, 401);

    return makeRes(true, 'Lấy dữ liệu bảng điều khiển thành công.', {
      summary: {
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
      },
      filter: {
        range: 'this_month',
        startDate: '2026-09-01 00:00:00',
        endDate: '2026-09-30 23:59:59'
      },
      recentAppointments: [],
      staleProperties: [],
      staleCustomers: [],
      monthlyPerformance: []
    });
  }

  // 7. GET & PUT /users/profile
  if (path === '/users/profile') {
    const user = getAuthUser();
    if (!user) return makeRes(false, 'Chưa đăng nhập.', null, null, 401);

    if (method === 'GET') {
      return makeRes(true, 'Lấy hồ sơ cá nhân thành công.', {
        id: user.id,
        code: user.code,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        title: 'Chuyên viên Bất động sản',
        role_code: user.role.code,
        role_name: user.role.name,
        team_name: user.team?.name || 'Chưa phân nhóm',
        last_login_at: user.lastLoginAt,
        last_login_ip: user.lastLoginIp,
        created_at: user.createdAt
      });
    }

    if (method === 'PUT') {
      const { fullName, phone } = body;
      if (!fullName) return makeRes(false, 'Họ và tên không được để trống.', null, null, 400);
      if (!phone || !/^(0[3|5|7|8|9])[0-9]{8}$/.test(phone)) {
        return makeRes(false, 'Số điện thoại không hợp lệ (10 chữ số di động VN).', null, null, 400);
      }
      user.fullName = fullName;
      user.phone = phone;
      return makeRes(true, 'Cập nhật hồ sơ cá nhân thành công.', { fullName, phone });
    }
  }

  // 8. GET /audit/logs
  if (path === '/audit/logs' && method === 'GET') {
    const user = getAuthUser();
    if (!user) return makeRes(false, 'Chưa đăng nhập.', null, null, 401);

    return makeRes(true, 'Lấy danh sách nhật ký hoạt động thành công.', {
      items: devState.auditLogs,
      recentLoginAttempts: devState.loginAttempts,
      pagination: {
        page: 1,
        limit: 20,
        total: devState.auditLogs.length,
        totalPages: 1
      }
    });
  }

  return makeRes(false, `Endpoint '${path}' không tồn tại trong môi trường phát triển.`, null, null, 404);
}
