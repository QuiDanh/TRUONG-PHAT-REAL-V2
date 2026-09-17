<?php
/**
 * TRƯỜNG PHÁT REAL - REST API Entry Point for public_html/api/v1/index.php
 * Hỗ trợ chạy trên Apache / LiteSpeed của DirectAdmin.
 */

// Các vị trí tìm kiếm thư mục backend chuẩn trên DirectAdmin
$backendCandidates = [
    dirname(__DIR__, 3) . '/backend/api/v1/index.php', // /home/username/backend/api/v1/index.php
    dirname(__DIR__, 2) . '/backend/api/v1/index.php', // /home/username/public_html/backend/api/v1/index.php
    __DIR__ . '/../../backend/api/v1/index.php',
];

foreach ($backendCandidates as $candidate) {
    if (file_exists($candidate)) {
        require_once $candidate;
        exit;
    }
}

// Trả về lỗi 500 nếu chưa tải thư mục backend
header('Content-Type: application/json; charset=utf-8');
http_response_code(500);
echo json_encode([
    'success' => false,
    'message' => 'Lỗi triển khai: Không tìm thấy thư mục backend của TRƯỜNG PHÁT REAL. Vui lòng đảm bảo thư mục backend đã được tải lên ngang hàng với public_html (/home/username/backend).',
    'statusCode' => 500
], JSON_UNESCAPED_UNICODE);
