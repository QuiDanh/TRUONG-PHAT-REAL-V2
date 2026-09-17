# TRƯỜNG PHÁT REAL - HỆ THỐNG QUẢN LÝ BẤT ĐỘNG SẢN NỘI BỘ

Phần mềm quản lý vận hành kinh doanh bất động sản chuyên nghiệp cho công ty môi giới tại Việt Nam.

---

## KIẾN TRÚC VÀ CÔNG NGHỆ

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7.
- **Backend**: Pure PHP 8.3 REST API (không framework cồng kềnh, tối ưu tuyệt đối cho DirectAdmin shared hosting).
- **Cơ sở dữ liệu**: MariaDB 10.6+ / MySQL 8.0+ với PDO Prepared Statements, Transactions & Foreign Keys.
- **Bảo mật**: Mã hóa `password_hash` (Bcrypt cost 12), Rate-limit chống Brute-force khóa tạm sau 5 lần sai, Bearer session tokens, kiểm tra RBAC tại API, chống XSS, chống CSRF, ngăn duyệt thư mục và cấm thực thi PHP trong uploads.
- **Giao diện**: Màu xanh navy đậm (`#0f172a`, `#1e293b`), điểm nhấn vàng kim (`#d97706`, `#f59e0b`), logo monogram **TP**, hỗ trợ đầy đủ desktop, tablet và mobile drawer.

---

## CẤU TRÚC THƯ MỤC DỰ ÁN

```text
├── backend/
│   ├── api/v1/index.php             # Router chính của REST API v1
│   ├── config/
│   │   ├── config.example.php       # Cấu hình mẫu cho hosting
│   │   └── config.php               # File cấu hình môi trường
│   ├── controllers/                 # Bộ điều khiển (Auth, Dashboard, User, Audit)
│   ├── middleware/                  # AuthMiddleware, PermissionMiddleware, CorsMiddleware
│   ├── services/                    # AuthService, AuditService
│   ├── helpers/                     # Database (PDO), ResponseHelper, Security
│   ├── database/
│   │   ├── database.sql             # Toàn bộ 33 bảng CSDL chuẩn hóa
│   │   ├── seed_permissions.php     # Khởi tạo 4 vai trò & danh mục quyền
│   │   └── create_admin.php         # Script CLI tạo tài khoản ADMIN an toàn
│   └── storage/logs/                # Thư mục nhật ký (bảo vệ bằng .htaccess)
├── deployment/
│   ├── public_html/
│   │   ├── .htaccess                # Cấu hình Rewrite React Router & bảo mật
│   │   ├── api/.htaccess            # Cấu hình định tuyến API v1
│   │   └── uploads/.htaccess        # Cấm thực thi PHP trong thư mục upload
│   └── README_DEPLOY.md             # Hướng dẫn chi tiết triển khai lên DirectAdmin
├── src/                             # Mã nguồn Frontend React & TypeScript
│   ├── api/                         # HTTP API client kết nối backend
│   ├── components/                  # Layout (Sidebar, Header), Modal, Toast, Skeleton
│   ├── context/                     # AuthContext quản lý trạng thái phiên
│   ├── pages/                       # Đăng nhập, Bảng điều khiển, Hồ sơ cá nhân, Audit
│   └── types/                       # Định nghĩa TypeScript đồng bộ với CSDL
├── index.html                       # Entry point HTML tiếng Việt
├── package.json
└── vite.config.ts
```

---

## HƯỚNG DẪN CHẠY LOCAL DEV VÀ BUILD

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Local Dev Server):
```bash
npm run dev
```
Truy cập: `http://localhost:3000`

### 3. Kiểm tra lỗi cú pháp TypeScript:
```bash
npm run lint
```

### 4. Build frontend thành file tĩnh:
```bash
npm run build
```
Thư mục xuất kết quả: `dist/`

---

## TỔNG QUAN GIAI ĐOẠN 1
- Đã hoàn thành toàn bộ kiến trúc nền tảng database (33 bảng).
- Đã hoàn thành hệ thống đăng nhập, kiểm soát phiên, khóa tạm brute-force.
- Đã hoàn thành layout Sidebar thu gọn + Drawer di động + Header tài khoản.
- Đã hoàn thành trang Bảng điều khiển (hiển thị 0 khi database trống).
- Đã hoàn thành trang Hồ sơ cá nhân & Đổi mật khẩu bắt buộc.
- Đã hoàn thành trang Nhật ký đăng nhập & kiểm toán hệ thống.
- Đã tạo đầy đủ các file cấu hình `.htaccess`, `config.example.php`, `database.sql`, `seed_permissions.php`, `create_admin.php`.
