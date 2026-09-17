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

            // Thiết lập Cookie HttpOnly, Secure, SameSite chuẩn ngân hàng
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
                || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) 
                || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

            $cookieLifetime = $rememberMe ? (30 * 86400) : (8 * 3600); // 30 ngày hoặc 8 giờ
            $cookieExpires = time() + $cookieLifetime;

            setcookie('tp_token', $result['token'], [
                'expires' => $cookieExpires,
                'path' => '/',
                'domain' => '',
                'secure' => $isHttps,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

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
        try {
            $user = AuthMiddleware::authenticate();
            $sessionId = AuthMiddleware::getSessionId();

            if ($sessionId && $user) {
                AuthService::logout($sessionId, (int)$user['id']);
            }
        } catch (Exception $e) {
            // Ngay cả khi token không hợp lệ, vẫn tiến hành xóa cookie
        }

        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
            || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) 
            || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

        // Xóa cookie HttpOnly
        setcookie('tp_token', '', [
            'expires' => time() - 86400,
            'path' => '/',
            'domain' => '',
            'secure' => $isHttps,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

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
            $stmt = $pdo->prepare("SELECT `id`, `full_name`, `email` FROM `users` WHERE `email` = :email AND `deleted_at` IS NULL LIMIT 1");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();

            if ($user) {
                $rawToken = Security::generateSecureToken(32); // 64 ký tự hex ngẫu nhiên
                $tokenHash = Security::hashToken($rawToken);
                $expiresAt = date('Y-m-d H:i:s', time() + 1800); // 30 phút

                // Lưu vào bảng password_resets (và password_reset_tokens)
                try {
                    $insPr = $pdo->prepare("
                        INSERT INTO `password_resets` (`email`, `token`, `token_hash`, `user_id`, `expires_at`, `is_used`)
                        VALUES (:email, :token, :th, :uid, :exp, 0)
                    ");
                    $insPr->execute([
                        'email' => $user['email'],
                        'token' => $rawToken,
                        'th' => $tokenHash,
                        'uid' => $user['id'],
                        'exp' => $expiresAt
                    ]);
                } catch (Exception $e) {
                    // Ignore nếu bảng password_resets chưa tồn tại
                }

                try {
                    $insPrt = $pdo->prepare("
                        INSERT INTO `password_reset_tokens` (`user_id`, `token_hash`, `expires_at`, `ip_address`, `is_used`)
                        VALUES (:uid, :th, :exp, :ip, 0)
                    ");
                    $insPrt->execute([
                        'uid' => $user['id'],
                        'th' => $tokenHash,
                        'exp' => $expiresAt,
                        'ip' => Security::getClientIp()
                    ]);
                } catch (Exception $e) {
                    // Ignore
                }

                $appUrl = defined('APP_URL') ? rtrim(APP_URL, '/') : 'https://truongphatsoft.online';
                $resetLink = "{$appUrl}/reset-password?token=" . urlencode($rawToken);

                // Gửi email đặt lại mật khẩu
                $to = $user['email'];
                $subject = '=?UTF-8?B?' . base64_encode('[TRƯỜNG PHÁT REAL] Hướng dẫn đặt lại mật khẩu') . '?=';
                $senderEmail = 'no-reply@truongphatsoft.online';

                $htmlMessage = "
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset='utf-8'>
                  <title>Đặt lại mật khẩu - TRƯỜNG PHÁT REAL</title>
                </head>
                <body style='font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;'>
                  <div style='max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;'>
                    <div style='text-align: center; margin-bottom: 24px;'>
                      <h2 style='color: #0b132b; margin: 0;'>TRƯỜNG PHÁT REAL</h2>
                      <p style='color: #64748b; font-size: 13px; margin-top: 4px;'>Hệ thống Quản lý Bất động sản Nội bộ</p>
                    </div>
                    <p>Kính gửi <strong>" . htmlspecialchars($user['full_name']) . "</strong>,</p>
                    <p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản công vụ của bạn.</p>
                    <p>Vui lòng bấm vào nút bên dưới để tiến hành thiết lập mật khẩu mới (Liên kết có hiệu lực trong <strong>30 phút</strong> và chỉ sử dụng 1 lần):</p>
                    <div style='text-align: center; margin: 28px 0;'>
                      <a href='{$resetLink}' style='background: #d97706; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(217,119,6,0.3);'>ĐẶT LẠI MẬT KHẨU</a>
                    </div>
                    <p style='font-size: 12px; color: #64748b; word-break: break-all;'>Nếu nút trên không hoạt động, vui lòng copy đường dẫn sau vào trình duyệt:<br><a href='{$resetLink}' style='color: #2563eb;'>{$resetLink}</a></p>
                    <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;'>
                    <p style='font-size: 11px; color: #94a3b8; text-align: center;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn an toàn tuyệt đối.</p>
                  </div>
                </body>
                </html>";

                $headers = [
                    'MIME-Version: 1.0',
                    'Content-type: text/html; charset=UTF-8',
                    "From: TRUONG PHAT REAL <{$senderEmail}>",
                    "Reply-To: {$senderEmail}",
                    'X-Mailer: PHP/' . phpversion()
                ];

                @mail($to, $subject, $htmlMessage, implode("\r\n", $headers));

                // Ghi log email vào file an toàn
                $logDir = dirname(__DIR__, 2) . '/storage/logs';
                if (!is_dir($logDir)) {
                    @mkdir($logDir, 0755, true);
                }
                $logEntry = "[" . date('Y-m-d H:i:s') . "] RESET PASSWORD LINK SENT TO: {$to} | TOKEN: {$rawToken} | IP: " . Security::getClientIp() . PHP_EOL;
                @file_put_contents($logDir . '/mail.log', $logEntry, FILE_APPEND);

                AuditService::logActivity((int)$user['id'], 'forgot_password_request', 'auth', (int)$user['id']);
            }

            // Luôn trả thông báo thành công chung để chống enumeration user
            ResponseHelper::success('Nếu email của bạn tồn tại trên hệ thống, hướng dẫn đặt lại mật khẩu đã được xử lý và gửi vào hòm thư.');
        } catch (Exception $e) {
            error_log("Forgot password error: " . $e->getMessage());
            ResponseHelper::serverError();
        }
    }

    public static function resetPassword(): void {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $token = trim((string)($body['token'] ?? ''));
        $newPassword = (string)($body['newPassword'] ?? '');

        if (empty($token)) {
            ResponseHelper::error('Mã xác thực đặt lại mật khẩu không hợp lệ hoặc bị thiếu.');
        }

        $validationErrors = Security::validatePasswordStrength($newPassword);
        if (!empty($validationErrors)) {
            ResponseHelper::error(implode(' ', $validationErrors), ['password' => implode(' ', $validationErrors)], 422);
        }

        try {
            $pdo = Database::getConnection();
            $tokenHash = Security::hashToken($token);

            $userId = null;
            $resetTable = '';
            $recordId = 0;

            // 1. Kiểm tra bảng password_resets trước
            try {
                $stmt = $pdo->prepare("
                    SELECT `id`, `user_id`, `expires_at`, `is_used` 
                    FROM `password_resets` 
                    WHERE (`token` = :raw_token OR `token_hash` = :th)
                    ORDER BY `id` DESC LIMIT 1
                ");
                $stmt->execute(['raw_token' => $token, 'th' => $tokenHash]);
                $record = $stmt->fetch();
                if ($record) {
                    $userId = (int)$record['user_id'];
                    $resetTable = 'password_resets';
                    $recordId = (int)$record['id'];
                    $isUsed = (bool)$record['is_used'];
                    $expiresAt = $record['expires_at'];

                    if ($isUsed) {
                        ResponseHelper::error('Liên kết đặt lại mật khẩu này đã được sử dụng trước đó.', null, 400);
                    }
                    if (strtotime($expiresAt) < time()) {
                        ResponseHelper::error('Liên kết đặt lại mật khẩu đã hết hạn (tối đa 30 phút). Vui lòng yêu cầu lại.', null, 400);
                    }
                }
            } catch (Exception $e) {
                // Table might not exist yet
            }

            // 2. Dự phòng: kiểm tra bảng password_reset_tokens
            if (!$userId) {
                $stmt2 = $pdo->prepare("
                    SELECT `id`, `user_id`, `expires_at`, `is_used` 
                    FROM `password_reset_tokens` 
                    WHERE `token_hash` = :th 
                    ORDER BY `id` DESC LIMIT 1
                ");
                $stmt2->execute(['th' => $tokenHash]);
                $record2 = $stmt2->fetch();

                if (!$record2) {
                    ResponseHelper::error('Mã xác thực đặt lại mật khẩu không chính xác hoặc đã bị xóa.', null, 404);
                }

                if ($record2['is_used']) {
                    ResponseHelper::error('Liên kết đặt lại mật khẩu này đã được sử dụng trước đó.', null, 400);
                }
                if (strtotime($record2['expires_at']) < time()) {
                    ResponseHelper::error('Liên kết đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.', null, 400);
                }

                $userId = (int)$record2['user_id'];
                $resetTable = 'password_reset_tokens';
                $recordId = (int)$record2['id'];
            }

            // 3. Cập nhật mật khẩu mới cho tài khoản
            $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
            $updUser = $pdo->prepare("
                UPDATE `users` 
                SET `password_hash` = :hash,
                    `require_password_change` = 0,
                    `failed_login_attempts` = 0,
                    `locked_until` = NULL
                WHERE `id` = :uid
            ");
            $updUser->execute([
                'hash' => $passwordHash,
                'uid' => $userId
            ]);

            // 4. Đánh dấu token đã được sử dụng (1 lần duy nhất)
            if ($resetTable === 'password_resets') {
                $updToken = $pdo->prepare("UPDATE `password_resets` SET `is_used` = 1, `used_at` = NOW() WHERE `id` = :id");
                $updToken->execute(['id' => $recordId]);
            } else {
                $updToken = $pdo->prepare("UPDATE `password_reset_tokens` SET `is_used` = 1, `used_at` = NOW() WHERE `id` = :id");
                $updToken->execute(['id' => $recordId]);
            }

            // 5. Thu hồi tất cả phiên làm việc cũ để đảm bảo an toàn tuyệt đối
            $revokeSessions = $pdo->prepare("UPDATE `user_sessions` SET `is_revoked` = 1 WHERE `user_id` = :uid");
            $revokeSessions->execute(['uid' => $userId]);

            AuditService::logActivity($userId, 'reset_password_completed', 'auth', $userId);

            ResponseHelper::success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
        } catch (Exception $e) {
            error_log("Reset password error: " . $e->getMessage());
            ResponseHelper::serverError();
        }
    }
}
