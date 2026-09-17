<?php
/**
 * TRƯỜNG PHÁT REAL - User Controller
 */

require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../helpers/Security.php';
require_once __DIR__ . '/../services/AuditService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UserController {
    public static function getProfile(): void {
        $user = AuthMiddleware::authenticate();
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT u.`id`, u.`code`, u.`email`, u.`full_name`, u.`phone`, u.`avatar_url`, 
                   u.`title`, u.`status`, u.`last_login_at`, u.`last_login_ip`, u.`created_at`,
                   r.`code` AS role_code, r.`name` AS role_name,
                   t.`name` AS team_name
            FROM `users` u
            JOIN `roles` r ON u.`role_id` = r.`id`
            LEFT JOIN `teams` t ON u.`team_id` = t.`id`
            WHERE u.`id` = :id
            LIMIT 1
        ");
        $stmt->execute(['id' => $user['id']]);
        $data = $stmt->fetch();

        ResponseHelper::success('Lấy thông tin cá nhân thành công.', $data);
    }

    public static function updateProfile(): void {
        $user = AuthMiddleware::authenticate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $fullName = trim($body['fullName'] ?? '');
        $phone = trim($body['phone'] ?? '');

        if (empty($fullName)) {
            ResponseHelper::error('Họ và tên không được để trống.');
        }

        if (empty($phone) || !preg_match('/^(0[3|5|7|8|9])[0-9]{8}$/', $phone)) {
            ResponseHelper::error('Số điện thoại không hợp lệ (yêu cầu số di động Việt Nam 10 chữ số).');
        }

        try {
            $pdo = Database::getConnection();

            $oldStmt = $pdo->prepare("SELECT `full_name`, `phone` FROM `users` WHERE `id` = :id");
            $oldStmt->execute(['id' => $user['id']]);
            $oldValues = $oldStmt->fetch();

            $upd = $pdo->prepare("
                UPDATE `users` 
                SET `full_name` = :name, `phone` = :phone, `updated_at` = NOW()
                WHERE `id` = :id
            ");
            $upd->execute([
                'name' => $fullName,
                'phone' => $phone,
                'id' => $user['id']
            ]);

            AuditService::logActivity(
                (int)$user['id'],
                'update_profile',
                'users',
                (int)$user['id'],
                $oldValues,
                ['full_name' => $fullName, 'phone' => $phone]
            );

            ResponseHelper::success('Cập nhật hồ sơ cá nhân thành công.', [
                'fullName' => $fullName,
                'phone' => $phone
            ]);
        } catch (Exception $e) {
            error_log("Update Profile Error: " . $e->getMessage());
            ResponseHelper::serverError();
        }
    }
}
