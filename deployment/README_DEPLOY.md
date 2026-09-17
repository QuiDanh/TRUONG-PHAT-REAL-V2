# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG TRƯỜNG PHÁT REAL
### Môi trường: Shared Hosting DirectAdmin (Apache / LiteSpeed, PHP 8.3, MariaDB 10.6)
### Control Panel: DirectAdmin tại `nuremberg.maychu.cloud:2222`
### Tên miền Production: https://truongphatsoft.online

---

## 1. YÊU CẦU MÔI TRƯỜNG HOSTING
- **Control Panel**: DirectAdmin Evolution tại `nuremberg.maychu.cloud:2222`
- **Web Server**: Apache 2.4+ hoặc LiteSpeed Web Server
- **PHP**: Phiên bản 8.3 (với các extensions: `pdo_mysql`, `mbstring`, `json`, `fileinfo`, `gd`, `openssl`)
- **Database**: MariaDB 10.6+
- **Thư mục gốc web**: `public_html/`
- **Cơ chế xác thực**: HttpOnly, Secure, SameSite Cookie (Không lưu trữ token trong localStorage)

---

## 2. BƯỚC 1: TẠO DATABASE TRÊN DIRECTADMIN
1. Đăng nhập vào **DirectAdmin** tại `https://nuremberg.maychu.cloud:2222`.
2. Vào mục **Account Manager** -> chọn **MySQL Management**.
3. Bấm **Create New Database**:
   - **Database Name**: ví dụ `truongphat_real` (hoặc tiền tố `username_truongphat_real`)
   - **Database User**: ví dụ `truongphat_usr` (hoặc tiền tố `username_truongphat_usr`)
   - **Database Password**: Đặt mật khẩu mạnh (ngẫu nhiên 20+ ký tự).
4. Lưu lại 3 thông số này cẩn thận.

---

## 3. BƯỚC 2: NHẬP CƠ SỞ DỮ LIỆU (DATABASE.SQL)
1. Trong DirectAdmin, mở **phpMyAdmin**.
2. Chọn database vừa tạo (`truongphat_real`).
3. Nhấp vào tab **Import** (Nhập).
4. Bấm **Choose File** (Chọn tệp) và chọn file `backend/database/database.sql`.
5. Kiểm tra định dạng là `SQL`, Character set là `utf-8`.
6. Nhấp **Go** (Thực hiện) để chạy nhập toàn bộ các bảng cơ sở dữ liệu (bao gồm cả bảng `password_resets` và `password_reset_tokens`).

---

## 4. BƯỚC 3: CẤU HÌNH KẾT NỐI PHP BACKEND
1. Sao chép file `backend/config/config.example.php` thành `backend/config/config.php`.
2. Chỉnh sửa thông số kết nối:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_PORT', '3306');
   define('DB_NAME', 'tên_database_của_bạn');
   define('DB_USER', 'tên_user_database_của_bạn');
   define('DB_PASS', 'mật_khẩu_database_của_bạn');
   define('APP_URL', 'https://truongphatsoft.online');
   
   // BẮT BUỘC: Điền chuỗi ngẫu nhiên tối thiểu 64 ký tự hex/alphanumeric.
   // Nếu thiếu hoặc để chuỗi mặc định, backend sẽ từ chối khởi động để bảo vệ an toàn hệ thống.
   define('TOKEN_SECRET_SALT', 'TAO_MOT_CHUOI_BI_MAT_NGAN_HANG_64_KY_TU_CHO_TRUONG_PHAT_REAL');

   define('CORS_ALLOWED_ORIGINS', [
       'https://truongphatsoft.online',
       'http://localhost:3000',
       'http://127.0.0.1:3000'
   ]);
   ```
3. Lưu ý an toàn: File `config.php` đã được khai báo trong `.gitignore` để không bao giờ bị lộ ra ngoài.

---

## 5. BƯỚC 4: KHỞI TẠO VAI TRÒ VÀ TÀI KHOẢN ADMIN ĐẦU TIÊN
### Cách A: Thông qua Terminal SSH (Khuyến nghị)
1. SSH vào hosting:
   ```bash
   ssh username@truongphatsoft.online -p port
   ```
2. Di chuyển đến thư mục chứa mã nguồn:
   ```bash
   cd /home/username/backend/database
   ```
3. Chạy lệnh khởi tạo vai trò và danh mục quyền hệ thống:
   ```bash
   php seed_permissions.php
   ```
4. Chạy lệnh tạo tài khoản ADMIN đầu tiên:
   ```bash
   php create_admin.php
   ```
   Hệ thống sẽ nhắc nhập:
   - Email: `admin@truongphatsoft.online` (hoặc email công vụ của giám đốc)
   - Họ và tên: `Nguyễn Văn Phát (Giám Đốc)`
   - Số điện thoại: `0901234567`
   - Mật khẩu: (Nhập mật khẩu an toàn theo quy chuẩn: tối thiểu 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt).

### Cách B: Nếu hosting không mở cổng SSH
1. Sử dụng công cụ chạy script PHP hoặc import câu lệnh SQL quyền hệ thống từ `seed_permissions.sql`.

---

## 6. BƯỚC 5: BUILD FRONTEND REACT
Trên máy phát triển local:
1. Cài đặt thư viện:
   ```bash
   npm install
   ```
2. Kiểm tra type và linter:
   ```bash
   npm run lint
   ```
3. Build mã nguồn React thành file tĩnh:
   ```bash
   npm run build
   ```
   Toàn bộ file build sẽ nằm trong thư mục `dist/` và được đồng bộ sẵn trong `deployment/public_html/`.

---

## 7. BƯỚC 6: TẢI LÊN PUBLIC_HTML TRÊN DIRECTADMIN
Cấu trúc cây thư mục trên server sau khi upload:
```text
/home/username/
├── backend/                      (Nằm ngoài public_html để bảo mật tuyệt đối)
│   ├── config/
│   │   ├── config.php            (File cấu hình thực tế, Chmod 600)
│   │   └── config.example.php
│   ├── api/
│   │   └── v1/
│   │       └── index.php
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── helpers/
│   ├── database/
│   └── storage/
│       └── logs/
└── public_html/                  (Thư mục gốc của domain https://truongphatsoft.online)
    ├── .htaccess                 (File cấu hình routing React Router & bảo mật)
    ├── index.html                (Từ dist/index.html)
    ├── assets/                   (Từ dist/assets/)
    ├── api/                      (Thư mục API)
    │   ├── .htaccess
    │   └── v1/
    │       └── index.php         (Khởi chạy backend an toàn)
    └── uploads/                  (Thư mục lưu trữ ảnh & tài liệu)
        ├── .htaccess             (Chặn hoàn toàn thực thi script PHP độc hại)
        ├── properties/
        ├── avatars/
        └── documents/
```

**Phân quyền thư mục (Chmod) trên DirectAdmin**:
- Thư mục `public_html/uploads`: Chmod `755` (hoặc `775`).
- File cấu hình `backend/config/config.php`: Chmod `600` hoặc `640`.
- Các file PHP: Chmod `644`.

---

## 8. BƯỚC 7: KIỂM TRA SAU TRIỂN KHAI
1. Mở trình duyệt truy cập: `https://truongphatsoft.online/api/v1/`
   -> Phải trả về JSON: `{"success": true, "message": "TRƯỜNG PHÁT REAL API v1 sẵn sàng hoạt động."}`
2. Truy cập `https://truongphatsoft.online/`
   -> Hiển thị giao diện Đăng nhập màu xanh navy & vàng kim cao cấp của **TRƯỜNG PHÁT REAL**.
   -> Xác nhận giao diện sạch sẽ, KHÔNG còn nút tài khoản mẫu hay mật khẩu kiểm thử.
3. Đăng nhập bằng tài khoản ADMIN vừa tạo:
   -> Xác nhận cookie `tp_token` được gán cờ `HttpOnly`, `Secure`, `SameSite=Lax`.
   -> Xác nhận trong `localStorage` KHÔNG chứa bất kỳ token xác thực nào.
4. F5 refresh trang bất kỳ (ví dụ `/dashboard`, `/profile`) để xác nhận file `.htaccess` không gây lỗi 404 Apache.
5. Kiểm tra luồng **Quên mật khẩu**:
   - Bấm "Quên mật khẩu?" tại trang đăng nhập.
   - Nhập email công vụ.
   - Nhận link reset: `https://truongphatsoft.online/reset-password?token=...`
   - Truy cập liên kết, nhập mật khẩu mới đạt đủ 5 tiêu chuẩn an toàn.
   - Đặt lại mật khẩu thành công và đăng nhập bằng mật khẩu mới.
