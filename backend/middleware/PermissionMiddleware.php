<?php
/**
 * TRƯỜNG PHÁT REAL - RBAC Permission Middleware
 */

require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';

class PermissionMiddleware {
    public static function check(array $user, string $permissionCode): bool {
        // ADMIN tối cao có toàn quyền hệ thống
        if ($user['role_code'] === 'ADMIN') {
            return true;
        }

        try {
            $pdo = Database::getConnection();

            // 1. Kiểm tra quyền riêng ghi đè theo từng user (user_permissions)
            $userPermStmt = $pdo->prepare("
                SELECT up.`is_granted`
                FROM `user_permissions` up
                JOIN `permissions` p ON up.`permission_id` = p.`id`
                WHERE up.`user_id` = :user_id AND p.`code` = :code
                LIMIT 1
            ");
            $userPermStmt->execute(['user_id' => $user['id'], 'code' => $permissionCode]);
            $override = $userPermStmt->fetchColumn();

            if ($override !== false) {
                return (bool)$override;
            }

            // 2. Kiểm tra theo vai trò (role_permissions)
            $rolePermStmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM `role_permissions` rp
                JOIN `permissions` p ON rp.`permission_id` = p.`id`
                WHERE rp.`role_id` = :role_id AND p.`code` = :code
            ");
            $rolePermStmt->execute(['role_id' => $user['role_id'], 'code' => $permissionCode]);
            return (int)$rolePermStmt->fetchColumn() > 0;

        } catch (Exception $e) {
            error_log("Permission Check Error: " . $e->getMessage());
            return false;
        }
    }

    public static function requirePermission(array $user, string $permissionCode): void {
        if (!self::check($user, $permissionCode)) {
            ResponseHelper::forbidden("Bạn không có quyền '{$permissionCode}' để thực hiện thao tác này.");
        }
    }
}
