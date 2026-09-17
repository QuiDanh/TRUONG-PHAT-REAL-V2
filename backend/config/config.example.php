<?php
/**
 * TRƯỜNG PHÁT REAL - File Cấu Hình Mẫu (config.example.php)
 * Hãy đổi tên hoặc sao chép thành config.php và cập nhật thông tin thực tế.
 * TUYỆT ĐỐI KHÔNG commit mật khẩu thật lên Git repository công khai.
 */

// 1. Cấu hình Database MariaDB / MySQL trên DirectAdmin
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'truongphat_real');
define('DB_USER', 'truongphat_usr');
define('DB_PASS', 'YOUR_STRONG_DATABASE_PASSWORD_HERE');
define('DB_CHARSET', 'utf8mb4');

// 2. Cấu hình Môi trường Ứng dụng
define('APP_ENV', 'production'); // 'development' hoặc 'production'
define('APP_NAME', 'TRƯỜNG PHÁT REAL');
define('APP_URL', 'https://truongphatsoft.online');
define('TIMEZONE', 'Asia/Ho_Chi_Minh');

// 3. Cấu hình Bảo mật & Phiên làm việc (HttpOnly Cookie / Session Token)
define('SESSION_LIFETIME_SECONDS', 86400 * 7); // 7 ngày
define('MAX_LOGIN_ATTEMPTS', 5);               // Khóa tạm sau 5 lần sai
define('LOCKOUT_DURATION_MINUTES', 15);        // Khóa trong 15 phút
// BẮT BUỘC: Thay thế bằng chuỗi ngẫu nhiên tối thiểu 64 ký tự hex/alphanumeric. Nếu để mặc định hoặc trống, hệ thống sẽ từ chối khởi động.
define('TOKEN_SECRET_SALT', 'CHANGE_THIS_TO_A_64_CHAR_RANDOM_STRING_FOR_SECURE_TOKEN_HASHING');

// 4. Cấu hình CORS (Chỉ cho phép domain xác thực truy cập khi production)
define('CORS_ALLOWED_ORIGINS', [
    'https://truongphatsoft.online',
    'https://www.truongphatsoft.online'
]);

// 5. Cấu hình Upload File (Thay USERNAME bằng tên tài khoản DirectAdmin của bạn)
define('UPLOAD_DIR', '/home/USERNAME/domains/truongphatsoft.online/public_html/uploads');
define('UPLOAD_MAX_BYTES', 10 * 1024 * 1024); // 10MB
define('ALLOWED_IMAGE_MIMES', ['image/jpeg', 'image/png', 'image/webp']);
define('ALLOWED_DOC_MIMES', ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

// Thiết lập múi giờ Việt Nam
date_default_timezone_set(TIMEZONE);
