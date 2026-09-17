# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG TRƯỜNG PHÁT REAL
### Môi trường: Shared Hosting DirectAdmin (Apache / LiteSpeed, PHP 8.3, MariaDB 10.6)
### Control Panel: DirectAdmin tại `nuremberg.maychu.cloud:2222`
### Tên miền Production: https://truongphatsoft.online

---

## 1. NGUYÊN TẮC TÁCH BIỆT BUILD FRONTEND VÀ BACKEND
Hệ thống TRƯỜNG PHÁT REAL được thiết kế tách biệt hoàn toàn giữa Frontend và Backend:
- **Frontend (React + Tailwind CSS + Vite)**: 
  - Được build trên môi trường phát triển (Local / CI/CD) bằng lệnh `npm run build` để tạo ra thư mục chứa tệp tĩnh thuần túy (`dist/`).
  - Web server chỉ việc phục vụ các file tĩnh (`index.html`, `assets/*.js`, `assets/*.css`) thông qua Apache/LiteSpeed.
  - Máy chủ hosting PHP **KHÔNG CẦN** cài đặt Node.js hay `node_modules`.
- **Backend (PHP 8.3 RESTful API & MariaDB)**:
  - Chạy độc lập trong thư mục bảo mật riêng biệt (`backend/`) nằm **ngoài** `public_html` để không bao giờ bị lộ mã nguồn PHP hay file cấu hình `config.php`.
  - Kết nối giữa Frontend và Backend được thực hiện thông qua endpoint `/api/v1/` được định tuyến bởi `public_html/api/v1/index.php`.

---

## 2. XÁC ĐỊNH USERNAME TRÊN DIRECTADMIN
Trên DirectAdmin, cấu trúc thư mục người dùng luôn có định dạng:
```text
/home/{USERNAME}/domains/truongphatsoft.online/
```
Trong đó `{USERNAME}` là tên tài khoản đăng nhập hosting DirectAdmin của bạn (ví dụ: `truongphat`, `admin`, hoặc mã tài khoản do nhà cung cấp hosting cấp).

### Cách kiểm tra USERNAME chính xác:
1. Nhìn vào góc trên bên phải màn hình DirectAdmin sau khi đăng nhập: tên tài khoản hiển thị tại đó.
2. Hoặc kiểm tra đường dẫn trong File Manager: `/home/{USERNAME}/...`
3. Trong toàn bộ cấu hình, bạn **bắt buộc thay thế `USERNAME`** bằng tên tài khoản thực tế này.

---

## 3. BƯỚC 1: TẠO DATABASE TRÊN DIRECTADMIN
1. Đăng nhập vào **DirectAdmin** tại `https://nuremberg.maychu.cloud:2222`.
2. Vào mục **Account Manager** -> chọn **MySQL Management**.
3. Bấm **Create New Database**:
   - **Database Name**: ví dụ `USERNAME_truongphat` (DirectAdmin tự động gắn tiền tố `USERNAME_`)
   - **Database User**: ví dụ `USERNAME_usr`
   - **Database Password**: Đặt mật khẩu mạnh ngẫu nhiên (20+ ký tự, bao gồm chữ hoa, thường, số, ký tự đặc biệt).
4. Lưu lại các thông số này để điền vào `config.php`.

---

## 4. BƯỚC 2: NHẬP CƠ SỞ DỮ LIỆU (DATABASE.SQL)
1. Trong DirectAdmin, mở công cụ **phpMyAdmin**.
2. Chọn database vừa tạo ở cột bên trái.
3. Nhấp vào tab **Import** (Nhập).
4. Bấm **Choose File** (Chọn tệp) và chọn file `backend/database/database.sql` từ mã nguồn.
5. Đảm bảo charset là `utf-8`.
6. Nhấp **Import** / **Go** để khởi tạo toàn bộ cấu trúc bảng, chỉ mục và ràng buộc khóa ngoại (hệ thống sử dụng bảng `password_resets` chuẩn hóa duy nhất với cơ chế băm `token_hash`).

---

## 5. BƯỚC 3: CẤU HÌNH BACKEND (CONFIG.PHP)
1. Sao chép file `backend/config/config.example.php` thành `backend/config/config.php`.
2. Mở file `config.php` và cập nhật thông số kết nối thực tế:
   ```php
   <?php
   // 1. Cấu hình Database
   define('DB_HOST', 'localhost');
   define('DB_PORT', '3306');
   define('DB_NAME', 'USERNAME_truongphat'); // Thay USERNAME
   define('DB_USER', 'USERNAME_usr');        // Thay USERNAME
   define('DB_PASS', 'MatKhauDatabaseThucTeCuaBan');
   define('DB_CHARSET', 'utf8mb4');

   // 2. Cấu hình Môi trường
   define('APP_ENV', 'production');
   define('APP_NAME', 'TRƯỜNG PHÁT REAL');
   define('APP_URL', 'https://truongphatsoft.online');
   define('TIMEZONE', 'Asia/Ho_Chi_Minh');

   // 3. Chuỗi bí mật mã hóa token (Bắt buộc tối thiểu 64 ký tự)
   define('TOKEN_SECRET_SALT', 'DIEN_CHUOI_BI_MAT_NGAN_HANG_TOI_THIEU_64_KY_TU_TAI_DAY_KHONG_DE_TRONG');

   // 4. CORS: Production chỉ chấp nhận domain chính thức
   define('CORS_ALLOWED_ORIGINS', [
       'https://truongphatsoft.online',
       'https://www.truongphatsoft.online'
   ]);

   // 5. Cấu hình thư mục upload (THAY THẾ USERNAME BẰNG TÀI KHOẢN DIRECTADMIN THỰC TẾ)
   define('UPLOAD_DIR', '/home/USERNAME/domains/truongphatsoft.online/public_html/uploads');
   define('UPLOAD_MAX_BYTES', 10 * 1024 * 1024); // 10MB
   define('ALLOWED_IMAGE_MIMES', ['image/jpeg', 'image/png', 'image/webp']);
   define('ALLOWED_DOC_MIMES', ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

   date_default_timezone_set(TIMEZONE);
   ```
3. Chmod file `backend/config/config.php` thành `600` (hoặc `640`) để chỉ tiến trình PHP của tài khoản mới có thể đọc.

---

## 6. BƯỚC 4: KHỞI TẠO DỮ LIỆU BAN ĐẦU & TÀI KHOẢN ADMIN
### Cách A: Qua SSH Terminal (Khuyến nghị)
1. Kết nối SSH vào máy chủ:
   ```bash
   ssh USERNAME@nuremberg.maychu.cloud -p [PORT]
   ```
2. Di chuyển đến thư mục database của backend:
   ```bash
   cd /home/USERNAME/domains/truongphatsoft.online/backend/database
   ```
3. Chạy phân quyền và danh mục chức năng hệ thống:
   ```bash
   php seed_permissions.php
   ```
4. Chạy tạo tài khoản ADMIN quản trị tối cao:
   ```bash
   php create_admin.php
   ```
   Nhập email công vụ, tên giám đốc, số điện thoại và mật khẩu an toàn theo hướng dẫn trên màn hình.

---

## 7. BƯỚC 5: BUILD FRONTEND TĨNH TRÊN MÁY DEV
1. Tại thư mục gốc dự án trên máy phát triển:
   ```bash
   npm ci
   npm run lint
   npm run build
   ```
2. Kết quả build sẽ nằm trong thư mục `dist/`.
   - `dist/index.html`
   - `dist/assets/*.js`
   - `dist/assets/*.css`

---

## 8. BƯỚC 6: BỐ TRÍ CÂY THƯ MỤC TRÊN DIRECTADMIN
Tải mã nguồn lên theo đúng cấu trúc bảo mật sau:
```text
/home/USERNAME/domains/truongphatsoft.online/
│
├── backend/                                   (Nằm NGOÀI public_html - An toàn tuyệt đối)
│   ├── api/
│   │   └── v1/
│   │       └── index.php
│   ├── config/
│   │   ├── config.php                         (Chmod 600)
│   │   └── config.example.php
│   ├── controllers/
│   ├── database/
│   ├── helpers/
│   ├── middleware/
│   ├── services/
│   └── storage/
│       └── logs/                              (Chmod 750, tự động ghi audit & mail log an toàn)
│
└── public_html/                               (Thư mục công khai truy cập Web)
    ├── .htaccess                              (Chặn file ẩn, định tuyến SPA React)
    ├── index.html                             (Từ thư mục dist/ sau khi build)
    ├── assets/                                (Từ thư mục dist/assets/ sau khi build)
    ├── favicon.ico
    ├── api/
    │   └── v1/
    │       ├── .htaccess                      (Rewrite mọi API call về index.php)
    │       └── index.php                      (Định vị động và nạp backend an toàn)
    └── uploads/                               (Lưu trữ tài liệu và ảnh tải lên)
        ├── .htaccess                          (Vô hiệu hóa hoàn toàn engine PHP trong uploads)
        ├── properties/
        ├── avatars/
        └── documents/
```

### Phân quyền (Permission / Chmod):
- Thư mục `public_html/uploads`: Chmod `755` (hoặc `775`).
- File `backend/config/config.php`: Chmod `600`.
- Thư mục `backend/storage/logs`: Chmod `750`.
- Tất cả thư mục khác: Chmod `755`.
- Tất cả tệp PHP/HTML/JS/CSS: Chmod `644`.

---

## 9. BƯỚC 7: KIỂM THỬ VÀ NGHIỆM THU HỆ THỐNG
1. **Kiểm tra API Health**:
   - Truy cập `https://truongphatsoft.online/api/v1/`
   - Nhận phản hồi JSON: `{"success": true, "message": "TRƯỜNG PHÁT REAL API v1 sẵn sàng hoạt động."}`
2. **Kiểm tra Giao diện Web**:
   - Truy cập `https://truongphatsoft.online/`
   - Trang đăng nhập hiển thị chính xác. Không chứa nút demo hay mật khẩu mẫu.
3. **Kiểm tra Cơ chế Đăng nhập & Cookie**:
   - Đăng nhập bằng tài khoản ADMIN.
   - Nhận JSON chứa `user`, `expires_at` (không trả access token trong JSON).
   - Cookie `tp_token` được gắn cờ `HttpOnly`, `Secure` (bắt buộc khi production), `SameSite=Strict`.
4. **Kiểm tra CORS**:
   - Kiểm tra request từ origin lạ hoặc gọi API thay đổi dữ liệu (POST, PUT, DELETE) sẽ bị chặn với mã lỗi HTTP 403.
5. **Kiểm tra Quên mật khẩu**:
   - Yêu cầu gửi mail khôi phục mật khẩu.
   - Token chỉ được băm `token_hash` và lưu vào bảng `password_resets`.
   - File log `mail.log` tuyệt đối không ghi nhận chuỗi raw token hoặc mật khẩu.
