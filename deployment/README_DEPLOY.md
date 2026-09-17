# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG TRƯỜNG PHÁT REAL
### Môi trường: Shared Hosting DirectAdmin (Apache / LiteSpeed, PHP 8.3, MariaDB 10.6+)
### Domain: https://dev.anminhtown.vn (Sau nghiệm thu: https://app.anminhtown.vn)

---

## 1. YÊU CẦU MÔI TRƯỜNG HOSTING
- **Control Panel**: DirectAdmin Evolution
- **Web Server**: Apache 2.4+ hoặc LiteSpeed Web Server
- **PHP**: Phiên bản 8.3 (với các extensions: `pdo_mysql`, `mbstring`, `json`, `fileinfo`, `gd`, `openssl`)
- **Database**: MariaDB 10.6+ hoặc MySQL 8.0+
- **Thư mục gốc web**: `public_html/`

---

## 2. BƯỚC 1: TẠO DATABASE TRÊN DIRECTADMIN
1. Đăng nhập vào **DirectAdmin** tại domain hoặc IP server.
2. Vào mục **Account Manager** -> chọn **MySQL Management**.
3. Bấm **Create New Database**:
   - **Database Name**: ví dụ `anminhto_tp_real`
   - **Database User**: ví dụ `anminhto_tp_usr`
   - **Database Password**: Đặt mật khẩu mạnh (ngẫu nhiên 20+ ký tự).
4. Lưu lại 3 thông số này cẩn thận.

---

## 3. BƯỚC 2: NHẬP CƠ SỞ DỮ LIỆU (DATABASE.SQL)
1. Trong DirectAdmin, mở **phpMyAdmin** (hoặc truy cập URL phpMyAdmin của hosting).
2. Chọn database vừa tạo (`anminhto_tp_real`).
3. Nhấp vào tab **Import** (Nhập).
4. Bấm **Choose File** (Chọn tệp) và chọn file `backend/database/database.sql`.
5. Kiểm tra định dạng là `SQL`, Character set là `utf-8`.
6. Nhấp **Go** (Thực hiện) để chạy nhập toàn bộ 33 bảng.

---

## 4. BƯỚC 3: CẤU HÌNH KẾT NỐI PHP BACKEND
1. Sao chép file `backend/config/config.example.php` thành `backend/config/config.php`.
2. Chỉnh sửa thông số kết nối:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_PORT', '3306');
   define('DB_NAME', 'anminhto_tp_real');
   define('DB_USER', 'anminhto_tp_usr');
   define('DB_PASS', 'MẬT_KHẨU_DATABASE_CỦA_BẠN');
   define('APP_URL', 'https://dev.anminhtown.vn');
   define('TOKEN_SECRET_SALT', 'CHUỖI_NGẪU_NHIÊN_64_KÝ_TỰ_DÙNG_ĐỂ_BẢO_MẬT_TOKEN');
   ```

---

## 5. BƯỚC 4: KHỞI TẠO VAI TRÒ VÀ TÀI KHOẢN ADMIN ĐẦU TIÊN
### Cách A: Thông qua Terminal SSH (Khuyến nghị)
1. SSH vào hosting:
   ```bash
   ssh username@anminhtown.vn
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
   - Email: `admin@truongphatreal.vn`
   - Họ và tên: `Quản Trị Viên`
   - Số điện thoại: `0901234567`
   - Mật khẩu: (Nhập mật khẩu an toàn theo quy chuẩn tối thiểu 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt).

### Cách B: Nếu hosting không có quyền SSH
1. File `database.sql` đã thiết kế sẵn toàn bộ schema. Bạn có thể import script `seed_permissions.sql` được trích xuất hoặc upload tạm file `seed_permissions.php` vào thư mục bảo vệ, chạy 1 lần qua trình duyệt rồi xóa ngay.

---

## 6. BƯỚC 5: BUILD FRONTEND REACT
Trên máy phát triển local:
1. Cài đặt thư viện:
   ```bash
   npm install
   ```
2. Build mã nguồn React thành file tĩnh:
   ```bash
   npm run build
   ```
   Toàn bộ file build sẽ nằm trong thư mục `dist/`.

---

## 7. BƯỚC 6: TẢI LÊN PUBLIC_HTML TRÊN DIRECTADMIN
Cấu trúc cây thư mục trên server sau khi upload:
```text
/home/username/
├── backend/                      (Nằm ngoài hoặc trong thư mục an toàn)
│   ├── config/config.php
│   ├── api/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   └── database/
└── public_html/                  (Thư mục gốc của domain web)
    ├── .htaccess                 (File cấu hình routing React Router & bảo mật)
    ├── index.html                (Từ dist/index.html)
    ├── assets/                   (Từ dist/assets/)
    ├── api/                      (Thư mục API)
    │   ├── .htaccess
    │   └── v1/
    │       └── index.php
    └── uploads/                  (Thư mục lưu trữ ảnh & tài liệu)
        ├── .htaccess             (Cấm thực thi PHP)
        ├── properties/
        └── avatars/
```

**Phân quyền thư mục trên DirectAdmin**:
- Thư mục `public_html/uploads`: Chmod `755` (hoặc `775`).
- File cấu hình `config.php`: Chmod `600` hoặc `640`.
- Các file PHP: Chmod `644`.

---

## 8. BƯỚC 7: KIỂM TRA SAU TRIỂN KHAI
1. Mở trình duyệt truy cập: `https://dev.anminhtown.vn/api/v1/`
   -> Phải trả về JSON: `{"success": true, "message": "TRƯỜNG PHÁT REAL API v1 sẵn sàng hoạt động."}`
2. Truy cập `https://dev.anminhtown.vn/`
   -> Hiển thị giao diện Đăng nhập màu xanh navy & vàng kim cao cấp của **TRƯỜNG PHÁT REAL**.
3. Đăng nhập bằng tài khoản ADMIN vừa tạo.
4. F5 refresh trang bất kỳ (ví dụ `/dashboard`, `/profile`) để xác nhận file `.htaccess` không gây lỗi 404 Apache.
5. Khi cơ sở dữ liệu trống, xác nhận trang Tổng quan hiển thị chính xác các chỉ số 0.
