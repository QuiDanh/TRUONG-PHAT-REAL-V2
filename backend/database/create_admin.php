<?php
/**
 * TRƯỜNG PHÁT REAL - Script Tạo Tài Khoản Quản Trị Viên (ADMIN) Đầu Tiên
 * 
 * Cách chạy trên máy chủ hoặc dòng lệnh:
 * php backend/database/create_admin.php --email="admin@truongphatreal.vn" --name="Quản Trị Viên" --phone="0901234567"
 * 
 * Hoặc chạy trực tiếp sẽ có nhắc nhập mật khẩu an toàn từ CLI.
 */

if (php_sapi_name() !== 'cli') {
    die("Script này chỉ được phép thực thi thông qua giao diện dòng lệnh (CLI).\n");
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/Database.php';

echo "========================================================\n";
echo "   TRƯỜNG PHÁT REAL - KHỞI TẠO TÀI KHOẢN ADMIN ĐẦU TIÊN\n";
echo "========================================================\n";

$options = getopt('', ['email:', 'name:', 'phone:', 'password:']);

$email = $options['email'] ?? null;
$name = $options['name'] ?? null;
$phone = $options['phone'] ?? null;
$password = $options['password'] ?? null;

if (!$email) {
    echo "Nhập Email quản trị: ";
    $email = trim(fgets(STDIN));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("LỖI: Định dạng email không hợp lệ!\n");
}

if (!$name) {
    echo "Nhập Họ và tên: ";
    $name = trim(fgets(STDIN));
}

if (empty($name)) {
    die("LỖI: Họ và tên không được để trống!\n");
}

if (!$phone) {
    echo "Nhập Số điện thoại (VD: 0901234567): ";
    $phone = trim(fgets(STDIN));
}

if (!preg_match('/^(0[3|5|7|8|9])[0-9]{8}$/', $phone)) {
    die("LỖI: Số điện thoại phải đúng định dạng di động Việt Nam (10 số, đầu 03/05/07/08/09)!\n");
}

if (!$password) {
    echo "Nhập Mật khẩu an toàn (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt): ";
    $password = trim(fgets(STDIN));
}

// Kiểm tra độ mạnh của mật khẩu
$isStrong = strlen($password) >= 8
    && preg_match('/[A-Z]/', $password)
    && preg_match('/[a-z]/', $password)
    && preg_match('/[0-9]/', $password)
    && preg_match('/[^A-Za-z0-9]/', $password);

if (!$isStrong) {
    die("LỖI: Mật khẩu chưa đủ mạnh! Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.\n");
}

try {
    $pdo = Database::getConnection();

    // Lấy ID vai trò ADMIN
    $roleStmt = $pdo->prepare("SELECT `id` FROM `roles` WHERE `code` = 'ADMIN' LIMIT 1");
    $roleStmt->execute();
    $adminRoleId = $roleStmt->fetchColumn();

    if (!$adminRoleId) {
        die("LỖI: Chưa có vai trò ADMIN trong CSDL. Vui lòng chạy lệnh: php seed_permissions.php trước!\n");
    }

    // Kiểm tra xem email đã tồn tại chưa
    $checkUser = $pdo->prepare("SELECT `id` FROM `users` WHERE `email` = :email LIMIT 1");
    $checkUser->execute(['email' => $email]);
    if ($checkUser->fetch()) {
        die("LỖI: Email '{$email}' đã tồn tại trong hệ thống!\n");
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $userCode = 'TP-AD001';

    // Tạo user ADMIN mới
    $insertStmt = $pdo->prepare("
        INSERT INTO `users` (
            `code`, `email`, `password_hash`, `full_name`, `phone`, `role_id`, 
            `title`, `status`, `require_password_change`
        ) VALUES (
            :code, :email, :password_hash, :full_name, :phone, :role_id,
            'Quản trị viên hệ thống', 'active', 0
        )
    ");

    $insertStmt->execute([
        'code' => $userCode,
        'email' => $email,
        'password_hash' => $passwordHash,
        'full_name' => $name,
        'phone' => $phone,
        'role_id' => $adminRoleId
    ]);

    $userId = $pdo->lastInsertId();

    // Ghi nhận audit log
    $auditStmt = $pdo->prepare("
        INSERT INTO `audit_logs` (`user_id`, `action`, `module`, `record_id`, `ip_address`, `is_success`, `new_values`)
        VALUES (:user_id, 'create_initial_admin', 'users', :record_id, '127.0.0.1', 1, :new_values)
    ");
    $auditStmt->execute([
        'user_id' => $userId,
        'record_id' => $userId,
        'new_values' => json_encode(['email' => $email, 'full_name' => $name, 'role' => 'ADMIN'])
    ]);

    echo "\n>>> TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!\n";
    echo "- Mã nhân viên: {$userCode}\n";
    echo "- Họ và tên: {$name}\n";
    echo "- Email: {$email}\n";
    echo "- Vai trò: Quản trị viên tối cao (ADMIN)\n";
    echo "Hãy bảo mật mật khẩu của bạn cẩn thận và bắt đầu đăng nhập vào hệ thống.\n\n";

} catch (Exception $e) {
    die("LỖI HỆ THỐNG: " . $e->getMessage() . "\n");
}
