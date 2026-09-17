<?php
/**
 * TRƯỜNG PHÁT REAL - REST API Router v1
 * Entry point cho toàn bộ API phiên bản 1.
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/Security.php';
require_once __DIR__ . '/../../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../../controllers/AuthController.php';
require_once __DIR__ . '/../../controllers/DashboardController.php';
require_once __DIR__ . '/../../controllers/UserController.php';
require_once __DIR__ . '/../../controllers/AuditLogController.php';

// 1. Áp dụng CORS & Security Headers
CorsMiddleware::handle();

// 2. Parse request URI & method
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';

// Bỏ query string
$parsedPath = parse_url($requestUri, PHP_URL_PATH);

// Chuẩn hóa path: cắt bỏ prefix /api/v1 hoặc /public_html/api/v1
$path = preg_replace('#^.*?/api/v1#', '', $parsedPath);
$path = '/' . trim($path, '/');

// 3. Routing table
try {
    switch ($path) {
        // --- AUTH ---
        case '/auth/login':
            if ($requestMethod === 'POST') {
                AuthController::login();
            }
            break;

        case '/auth/me':
            if ($requestMethod === 'GET') {
                AuthController::me();
            }
            break;

        case '/auth/logout':
            if ($requestMethod === 'POST') {
                AuthController::logout();
            }
            break;

        case '/auth/change-password':
            if ($requestMethod === 'POST') {
                AuthController::changePassword();
            }
            break;

        case '/auth/forgot-password':
            if ($requestMethod === 'POST') {
                AuthController::forgotPassword();
            }
            break;

        // --- DASHBOARD ---
        case '/dashboard/stats':
            if ($requestMethod === 'GET') {
                DashboardController::getStats();
            }
            break;

        // --- USER PROFILE ---
        case '/users/profile':
            if ($requestMethod === 'GET') {
                UserController::getProfile();
            } elseif ($requestMethod === 'PUT') {
                UserController::updateProfile();
            }
            break;

        // --- AUDIT LOGS ---
        case '/audit/logs':
            if ($requestMethod === 'GET') {
                AuditLogController::index();
            }
            break;

        case '/':
            ResponseHelper::success('TRƯỜNG PHÁT REAL API v1 sẵn sàng hoạt động.');
            break;

        default:
            ResponseHelper::notFound("Endpoint API '{$path}' không tồn tại.");
            break;
    }

    ResponseHelper::error("Phương thức HTTP {$requestMethod} không được hỗ trợ cho {$path}.", null, 405);

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    ResponseHelper::serverError();
}
