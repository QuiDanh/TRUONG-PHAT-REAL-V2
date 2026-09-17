<?php
/**
 * TRƯỜNG PHÁT REAL - REST API Entry Point for public_html/api/v1/index.php
 * Hỗ trợ chạy trên Apache / LiteSpeed của DirectAdmin và các môi trường máy chủ khác.
 * Tự động và linh hoạt định vị thư mục backend.
 */

$backendCandidates = [];

// 1. Kiểm tra cấu hình qua biến môi trường hoặc biến máy chủ
$envBackendPath = getenv('TP_BACKEND_PATH') ?: ($_SERVER['TP_BACKEND_PATH'] ?? ($_ENV['TP_BACKEND_PATH'] ?? ''));
if (!empty($envBackendPath)) {
    $backendCandidates[] = rtrim($envBackendPath, '/') . '/api/v1/index.php';
    $backendCandidates[] = $envBackendPath;
}

// 2. Kiểm tra file cấu hình đường dẫn riêng nếu có (backend_path.php)
$customPathFile = __DIR__ . '/backend_path.php';
if (file_exists($customPathFile)) {
    $customPath = include $customPathFile;
    if (is_string($customPath) && !empty($customPath)) {
        $backendCandidates[] = rtrim($customPath, '/') . '/api/v1/index.php';
        $backendCandidates[] = $customPath;
    }
}

// 3. Tự động suy diễn các vị trí backend phổ biến trên DirectAdmin
// Cấu trúc DirectAdmin điển hình:
// /home/USERNAME/domains/truongphatsoft.online/public_html/api/v1/index.php
$publicHtmlDir = dirname(__DIR__, 2);
$domainDir = dirname(__DIR__, 3);
$userDir = dirname(__DIR__, 4);

$backendCandidates[] = $domainDir . '/backend/api/v1/index.php';                // /home/USERNAME/domains/truongphatsoft.online/backend/api/v1/index.php
$backendCandidates[] = $userDir . '/backend/api/v1/index.php';                  // /home/USERNAME/backend/api/v1/index.php
$backendCandidates[] = $publicHtmlDir . '/backend/api/v1/index.php';            // /home/USERNAME/.../public_html/backend/api/v1/index.php
$backendCandidates[] = dirname(__DIR__, 5) . '/backend/api/v1/index.php';

// Sử dụng username của hệ điều hành nếu có
$sysUser = get_current_user();
if (!empty($sysUser)) {
    $backendCandidates[] = "/home/{$sysUser}/domains/truongphatsoft.online/backend/api/v1/index.php";
    $backendCandidates[] = "/home/{$sysUser}/backend/api/v1/index.php";
}

// 4. Tìm kiếm và nạp file backend entry point
foreach ($backendCandidates as $candidate) {
    if (!empty($candidate) && file_exists($candidate) && is_file($candidate)) {
        require_once $candidate;
        exit;
    }
}

// 5. Trả về thông báo lỗi chi tiết nếu không tìm thấy backend
header('Content-Type: application/json; charset=utf-8');
http_response_code(500);
echo json_encode([
    'success' => false,
    'message' => 'Lỗi triển khai: Không thể định vị thư mục backend của TRƯỜNG PHÁT REAL.',
    'hint' => 'Đảm bảo thư mục backend đã được tải lên ngang hàng với public_html (ví dụ: /home/USERNAME/domains/truongphatsoft.online/backend hoặc /home/USERNAME/backend), hoặc tạo file public_html/api/v1/backend_path.php trả về đường dẫn tuyệt đối đến thư mục backend.',
    'statusCode' => 500
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
