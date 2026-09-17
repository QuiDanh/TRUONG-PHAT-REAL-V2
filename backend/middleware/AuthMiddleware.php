<?php
/**
 * TRƯỜNG PHÁT REAL - Authentication Middleware
 */

require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../helpers/Security.php';

class AuthMiddleware {
    private static ?array $currentUser = null;
    private static ?string $currentSessionId = null;

    public static function authenticate(): array {
        // Ưu tiên trích xuất Bearer token từ HttpOnly Cookie an toàn
        $token = $_COOKIE['tp_token'] ?? '';

        // Dự phòng: trích xuất từ Authorization header nếu client gửi trực tiếp
        if (empty($token)) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = trim($matches[1]);
            }
        }

        if (empty($token)) {
            ResponseHelper::unauthorized('Vui lòng đăng nhập để truy cập hệ thống.');
        }

        $tokenHash = Security::hashToken($token);

        try {
            $pdo = Database::getConnection();

            $stmt = $pdo->prepare("
                SELECT 
                    s.`id` AS session_id,
                    s.`user_id`,
                    s.`expires_at`,
                    s.`is_revoked`,
                    u.`id`,
                    u.`code`,
                    u.`email`,
                    u.`full_name`,
                    u.`phone`,
                    u.`avatar_url`,
                    u.`role_id`,
                    u.`team_id`,
                    u.`title`,
                    u.`status`,
                    u.`require_password_change`,
                    u.`locked_until`,
                    r.`code` AS role_code,
                    r.`name` AS role_name,
                    t.`name` AS team_name
                FROM `user_sessions` s
                JOIN `users` u ON s.`user_id` = u.`id`
                JOIN `roles` r ON u.`role_id` = r.`id`
                LEFT JOIN `teams` t ON u.`team_id` = t.`id`
                WHERE s.`session_token_hash` = :token_hash
                  AND u.`deleted_at` IS NULL
                LIMIT 1
            ");
            $stmt->execute(['token_hash' => $tokenHash]);
            $session = $stmt->fetch();

            if (!$session) {
                ResponseHelper::unauthorized('Phiên đăng nhập không tồn tại hoặc đã bị thu hồi.');
            }

            if ($session['is_revoked']) {
                ResponseHelper::unauthorized('Phiên làm việc đã bị đăng xuất trước đó.');
            }

            if (strtotime($session['expires_at']) < time()) {
                ResponseHelper::unauthorized('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            if ($session['status'] === 'locked' || ($session['locked_until'] && strtotime($session['locked_until']) > time())) {
                ResponseHelper::unauthorized('Tài khoản của bạn đang bị tạm khóa vì lý do an toàn. Vui lòng liên hệ quản trị viên.');
            }

            if ($session['status'] === 'inactive') {
                ResponseHelper::unauthorized('Tài khoản đã bị ngừng kích hoạt.');
            }

            // Cập nhật last_activity
            $upd = $pdo->prepare("UPDATE `user_sessions` SET `last_activity` = NOW() WHERE `id` = :id");
            $upd->execute(['id' => $session['session_id']]);

            self::$currentUser = $session;
            self::$currentSessionId = (string)$session['session_id'];

            return $session;
        } catch (Exception $e) {
            error_log("Auth Middleware Error: " . $e->getMessage());
            ResponseHelper::serverError();
            return [];
        }
    }

    public static function getUser(): ?array {
        return self::$currentUser;
    }

    public static function getSessionId(): ?string {
        return self::$currentSessionId;
    }
}
