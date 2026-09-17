<?php
/**
 * TRƯỜNG PHÁT REAL - Auth Controller
 */

require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../helpers/Security.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController {
    public static function login(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim($body['email'] ?? '');
        $password = (string)($body['password'] ?? '');
        $rememberMe = (bool)($body['rememberMe'] ?? false);

        if (empty($email) || empty($password)) {
            ResponseHelper::error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
        }

        try {
            $result = AuthService::login($email, $password, $rememberMe);
            ResponseHelper::success('Đăng nhập thành công.', $result);
        } catch (InvalidArgumentException $ie) {
            ResponseHelper::error($ie->getMessage(), null, 422);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), null, 400);
        }
    }

    public static function me(): void {
        $user = AuthMiddleware::authenticate();
        $permissions = AuthService::getUserPermissions((int)$user['id'], (int)$user['role_id'], $user['role_code']);

        ResponseHelper::success('Lấy thông tin tài khoản thành công.', [
            'id' => (int)$user['id'],
            'code' => $user['code'],
            'email' => $user['email'],
            'fullName' => $user['full_name'],
            'phone' => $user['phone'],
            'avatarUrl' => $user['avatar_url'],
            'title' => $user['title'],
            'role' => [
                'id' => (int)$user['role_id'],
                'code' => $user['role_code'],
                'name' => $user['role_name']
            ],
            'team' => $user['team_id'] ? [
                'id' => (int)$user['team_id'],
                'name' => $user['team_name']
            ] : null,
            'requirePasswordChange' => (bool)$user['require_password_change'],
            'permissions' => $permissions
        ]);
    }

    public static function logout(): void {
        $user = AuthMiddleware::authenticate();
        $sessionId = AuthMiddleware::getSessionId();

        if ($sessionId) {
            AuthService::logout($sessionId, (int)$user['id']);
        }

        ResponseHelper::success('Đăng xuất thành công.');
    }

    public static function changePassword(): void {
        $user = AuthMiddleware::authenticate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $currentPassword = (string)($body['currentPassword'] ?? '');
        $newPassword = (string)($body['newPassword'] ?? '');
        $isMandatory = (bool)$user['require_password_change'];

        if (empty($newPassword)) {
            ResponseHelper::error('Mật khẩu mới không được để trống.');
        }

        try {
            AuthService::changePassword((int)$user['id'], $currentPassword, $newPassword, $isMandatory);
            ResponseHelper::success('Đổi mật khẩu thành công. Vui lòng ghi nhớ thông tin mới.');
        } catch (InvalidArgumentException $ie) {
            ResponseHelper::error($ie->getMessage(), null, 422);
        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), null, 400);
        }
    }

    public static function forgotPassword(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim(strtolower($body['email'] ?? ''));

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ResponseHelper::error('Vui lòng nhập địa chỉ email hợp lệ.');
        }

        // Tạo token đặt lại mật khẩu bảo mật (30 phút, dùng 1 lần)
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT `id`, `full_name` FROM `users` WHERE `email` = :email AND `deleted_at` IS NULL LIMIT 1");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();

            if ($user) {
                $rawToken = Security::generateSecureToken(32);
                $tokenHash = Security::hashToken($rawToken);
                $expiresAt = date('Y-m-d H:i:s', time() + 1800); // 30 phút

                $ins = $pdo->prepare("
                    INSERT INTO `password_reset_tokens` (`user_id`, `token_hash`, `expires_at`, `ip_address`)
                    VALUES (:uid, :th, :exp, :ip)
                ");
                $ins->execute([
                    'uid' => $user['id'],
                    'th' => $tokenHash,
                    'exp' => $expiresAt,
                    'ip' => Security::getClientIp()
                ]);

                AuditService::logActivity((int)$user['id'], 'forgot_password_request', 'auth', (int)$user['id']);
            }

            // Luôn trả thông báo thành công chung để chống enumeration user
            ResponseHelper::success('Nếu email của bạn tồn tại trên hệ thống, hướng dẫn đặt lại mật khẩu đã được xử lý.');
        } catch (Exception $e) {
            ResponseHelper::serverError();
        }
    }
}
