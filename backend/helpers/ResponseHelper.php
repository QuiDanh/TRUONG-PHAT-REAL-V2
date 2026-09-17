<?php
/**
 * TRƯỜNG PHÁT REAL - Unified REST API Response Helper
 */

class ResponseHelper {
    public static function generateRequestId(): string {
        return 'REQ-' . bin2hex(random_bytes(8)) . '-' . time();
    }

    public static function json(
        bool $success,
        string $message,
        mixed $data = null,
        mixed $errors = null,
        int $statusCode = 200,
        ?string $requestId = null
    ): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');

        $reqId = $requestId ?? ($_SERVER['HTTP_X_REQUEST_ID'] ?? self::generateRequestId());

        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data' => $data ?? (object)[],
            'errors' => $errors ?? (object)[],
            'requestId' => $reqId
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(string $message, mixed $data = null, int $statusCode = 200): void {
        self::json(true, $message, $data, null, $statusCode);
    }

    public static function error(string $message, mixed $errors = null, int $statusCode = 400): void {
        self::json(false, $message, null, $errors, $statusCode);
    }

    public static function unauthorized(string $message = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'): void {
        self::json(false, $message, null, (object)['auth' => 'unauthorized'], 401);
    }

    public static function forbidden(string $message = 'Bạn không có quyền thực hiện chức năng này.'): void {
        self::json(false, $message, null, (object)['permission' => 'forbidden'], 403);
    }

    public static function notFound(string $message = 'Không tìm thấy dữ liệu yêu cầu.'): void {
        self::json(false, $message, null, (object)['resource' => 'not_found'], 404);
    }

    public static function serverError(string $message = 'Đã có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau.'): void {
        self::json(false, $message, null, (object)['server' => 'internal_error'], 500);
    }
}
