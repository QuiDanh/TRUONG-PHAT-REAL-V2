<?php
/**
 * TRƯỜNG PHÁT REAL - CORS & Security Headers Middleware
 */

class CorsMiddleware {
    public static function handle(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $appEnv = defined('APP_ENV') ? APP_ENV : (getenv('APP_ENV') ?: 'production');
        $isDevelopment = ($appEnv === 'development');

        // Production chỉ chấp nhận https://truongphatsoft.online và https://www.truongphatsoft.online
        $allowedOrigins = [
            'https://truongphatsoft.online',
            'https://www.truongphatsoft.online'
        ];

        // Chỉ cho phép localhost khi APP_ENV=development
        if ($isDevelopment) {
            $allowedOrigins[] = 'http://localhost:3000';
            $allowedOrigins[] = 'http://127.0.0.1:3000';
            $allowedOrigins[] = 'http://localhost:5173';
            $allowedOrigins[] = 'http://127.0.0.1:5173';
        }

        // Bổ sung cấu hình bổ sung nếu có (nhưng production tuyệt đối không cho phép localhost)
        if (defined('CORS_ALLOWED_ORIGINS') && is_array(CORS_ALLOWED_ORIGINS)) {
            foreach (CORS_ALLOWED_ORIGINS as $customOrigin) {
                if (!$isDevelopment && (str_contains($customOrigin, 'localhost') || str_contains($customOrigin, '127.0.0.1'))) {
                    continue;
                }
                if (!in_array($customOrigin, $allowedOrigins, true)) {
                    $allowedOrigins[] = $customOrigin;
                }
            }
        }

        $isOriginAllowed = in_array($origin, $allowedOrigins, true);

        // Kiểm tra Origin cho các API thay đổi dữ liệu (POST, PUT, DELETE, PATCH)
        $isStateChangingMethod = in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'], true);
        if ($isStateChangingMethod) {
            // Nếu có header Origin gửi lên nhưng không hợp lệ -> Chặn ngay lập tức
            if (!empty($origin) && !$isOriginAllowed) {
                http_response_code(403);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'CORS Error: Origin không được phép thực hiện thao tác thay đổi dữ liệu.',
                    'statusCode' => 403
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        if ($isOriginAllowed) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Credentials: true');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Request-ID');
        header('Access-Control-Max-Age: 86400');

        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');

        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

