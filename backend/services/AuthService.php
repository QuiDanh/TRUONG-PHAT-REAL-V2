<?php
/**
 * TRƯỜNG PHÁT REAL - Authentication Service
 */

require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Security.php';
require_once __DIR__ . '/AuditService.php';

class AuthService {
    public static function login(string $email, string $password, bool $rememberMe = false): array {
        $pdo = Database::getConnection();
        $email = trim(strtolower($email));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            AuditService::logLoginAttempt($email, false, 'Email không đúng định dạng');
            throw new InvalidArgumentException('Định dạng email không hợp lệ.');
        }

        // 1. Kiểm tra tài khoản trong database
        $stmt = $pdo->prepare("
            SELECT u.*, r.`code` AS role_code, r.`name` AS role_name, t.`name` AS team_name
            FROM `users` u
            JOIN `roles` r ON u.`role_id` = r.`id`
            LEFT JOIN `teams` t ON u.`team_id` = t.`id`
            WHERE u.`email` = :email AND u.`deleted_at` IS NULL
            LIMIT 1
        ");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            AuditService::logLoginAttempt($email, false, 'Tài khoản không tồn tại');
            throw new Exception('Email hoặc mật khẩu không chính xác.');
        }

        // 2. Kiểm tra trạng thái khóa tạm
        if ($user['status'] === 'locked') {
            AuditService::logLoginAttempt($email, false, 'Tài khoản bị khóa vĩnh viễn/chủ động');
            throw new Exception('Tài khoản đã bị khóa bởi Quản trị viên.');
        }

        if (!empty($user['locked_until']) && strtotime($user['locked_until']) > time()) {
            $remainMinutes = ceil((strtotime($user['locked_until']) - time()) / 60);
            AuditService::logLoginAttempt($email, false, "Tài khoản đang bị khóa tạm ({$remainMinutes} phút)");
            throw new Exception("Tài khoản đang bị tạm khóa sau nhiều lần đăng nhập sai. Vui lòng thử lại sau {$remainMinutes} phút.");
        }

        // 3. Kiểm tra mật khẩu
        if (!password_verify($password, $user['password_hash'])) {
            $newAttempts = $user['failed_login_attempts'] + 1;
            $maxAttempts = defined('MAX_LOGIN_ATTEMPTS') ? MAX_LOGIN_ATTEMPTS : 5;
            $lockoutMinutes = defined('LOCKOUT_DURATION_MINUTES') ? LOCKOUT_DURATION_MINUTES : 15;

            if ($newAttempts >= $maxAttempts) {
                $lockUntil = date('Y-m-d H:i:s', time() + ($lockoutMinutes * 60));
                $lockStmt = $pdo->prepare("
                    UPDATE `users` 
                    SET `failed_login_attempts` = :attempts, `locked_until` = :locked_until
                    WHERE `id` = :id
                ");
                $lockStmt->execute([
                    'attempts' => $newAttempts,
                    'locked_until' => $lockUntil,
                    'id' => $user['id']
                ]);

                AuditService::logLoginAttempt($email, false, "Đăng nhập sai {$newAttempts} lần -> Khóa tạm");
                throw new Exception("Bạn đã nhập sai mật khẩu {$maxAttempts} lần liên tiếp. Tài khoản đã bị tạm khóa trong {$lockoutMinutes} phút để đảm bảo an toàn.");
            } else {
                $rem = $maxAttempts - $newAttempts;
                $updStmt = $pdo->prepare("UPDATE `users` SET `failed_login_attempts` = :attempts WHERE `id` = :id");
                $updStmt->execute(['attempts' => $newAttempts, 'id' => $user['id']]);

                AuditService::logLoginAttempt($email, false, "Mật khẩu sai (Lần {$newAttempts}/{$maxAttempts})");
                throw new Exception("Mật khẩu không chính xác. Bạn còn {$rem} lần thử trước khi tài khoản bị khóa tạm.");
            }
        }

        // 4. Đăng nhập thành công -> Reset số lần sai, ghi nhận IP và thời gian
        $clientIp = Security::getClientIp();
        $userAgent = Security::getUserAgent();

        $resetStmt = $pdo->prepare("
            UPDATE `users` 
            SET `failed_login_attempts` = 0, 
                `locked_until` = NULL,
                `last_login_at` = NOW(),
                `last_login_ip` = :ip
            WHERE `id` = :id
        ");
        $resetStmt->execute(['ip' => $clientIp, 'id' => $user['id']]);

        // 5. Tạo Session Bearer Token an toàn
        $rawToken = Security::generateSecureToken(32);
        $tokenHash = Security::hashToken($rawToken);

        $lifetime = $rememberMe ? (86400 * 30) : (86400 * 7);
        $expiresAt = date('Y-m-d H:i:s', time() + $lifetime);

        $sessionStmt = $pdo->prepare("
            INSERT INTO `user_sessions` (
                `user_id`, `session_token_hash`, `ip_address`, `user_agent`, `expires_at`, `is_revoked`
            ) VALUES (
                :user_id, :token_hash, :ip, :ua, :expires_at, 0
            )
        ");
        $sessionStmt->execute([
            'user_id' => $user['id'],
            'token_hash' => $tokenHash,
            'ip' => $clientIp,
            'ua' => $userAgent,
            'expires_at' => $expiresAt
        ]);

        AuditService::logLoginAttempt($email, true);
        AuditService::logActivity($user['id'], 'login_success', 'auth', $user['id']);

        // 6. Lấy danh sách quyền của người dùng
        $permissions = self::getUserPermissions((int)$user['id'], (int)$user['role_id'], $user['role_code']);

        return [
            'token' => $rawToken,
            'expires_at' => $expiresAt,
            'user' => [
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
            ]
        ];
    }

    public static function logout(string $sessionId, ?int $userId): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE `user_sessions` SET `is_revoked` = 1 WHERE `id` = :id");
        $stmt->execute(['id' => $sessionId]);

        if ($userId) {
            AuditService::logActivity($userId, 'logout', 'auth', $userId);
        }
    }

    public static function revokeAllSessions(int $userId): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE `user_sessions` SET `is_revoked` = 1 WHERE `user_id` = :user_id");
        $stmt->execute(['user_id' => $userId]);

        AuditService::logActivity($userId, 'revoke_all_sessions', 'auth', $userId);
    }

    public static function changePassword(
        int $userId,
        string $currentPassword,
        string $newPassword,
        bool $isMandatoryFirstChange = false
    ): void {
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT `password_hash`, `require_password_change` FROM `users` WHERE `id` = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new Exception('Người dùng không tồn tại.');
        }

        // Nếu không phải lần đầu bắt buộc đổi mà là tự đổi thì phải xác nhận mật khẩu hiện tại
        if (!$isMandatoryFirstChange || !empty($currentPassword)) {
            if (!password_verify($currentPassword, $user['password_hash'])) {
                throw new Exception('Mật khẩu hiện tại không chính xác.');
            }
        }

        $strengthErrors = Security::validatePasswordStrength($newPassword);
        if (!empty($strengthErrors)) {
            throw new InvalidArgumentException(implode(' ', $strengthErrors));
        }

        if (password_verify($newPassword, $user['password_hash'])) {
            throw new InvalidArgumentException('Mật khẩu mới không được trùng với mật khẩu cũ.');
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

        $upd = $pdo->prepare("
            UPDATE `users` 
            SET `password_hash` = :hash, `require_password_change` = 0, `updated_at` = NOW()
            WHERE `id` = :id
        ");
        $upd->execute(['hash' => $newHash, 'id' => $userId]);

        AuditService::logActivity($userId, 'change_password_success', 'auth', $userId);
    }

    public static function getUserPermissions(int $userId, int $roleId, string $roleCode): array {
        if ($roleCode === 'ADMIN') {
            return ['*']; // Quyền tối cao
        }

        $pdo = Database::getConnection();

        // Lấy quyền từ vai trò
        $roleStmt = $pdo->prepare("
            SELECT p.`code`
            FROM `role_permissions` rp
            JOIN `permissions` p ON rp.`permission_id` = p.`id`
            WHERE rp.`role_id` = :role_id
        ");
        $roleStmt->execute(['role_id' => $roleId]);
        $perms = $roleStmt->fetchAll(PDO::FETCH_COLUMN);

        // Lấy quyền riêng override (grant hoặc revoke)
        $userPermStmt = $pdo->prepare("
            SELECT p.`code`, up.`is_granted`
            FROM `user_permissions` up
            JOIN `permissions` p ON up.`permission_id` = p.`id`
            WHERE up.`user_id` = :user_id
        ");
        $userPermStmt->execute(['user_id' => $userId]);
        $overrides = $userPermStmt->fetchAll();

        foreach ($overrides as $ov) {
            $code = $ov['code'];
            if ($ov['is_granted'] && !in_array($code, $perms, true)) {
                $perms[] = $code;
            } elseif (!$ov['is_granted']) {
                $perms = array_values(array_diff($perms, [$code]));
            }
        }

        return $perms;
    }
}
