<?php
/**
 * TRƯỜNG PHÁT REAL - Audit Log Controller
 */

require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/PermissionMiddleware.php';

class AuditLogController {
    public static function index(): void {
        $user = AuthMiddleware::authenticate();
        PermissionMiddleware::requirePermission($user, 'audit_logs.view');

        $pdo = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(10, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $module = trim($_GET['module'] ?? '');
        $action = trim($_GET['action'] ?? '');
        $search = trim($_GET['search'] ?? '');

        $where = ["1=1"];
        $params = [];

        if (!empty($module)) {
            $where[] = "a.`module` = :module";
            $params['module'] = $module;
        }

        if (!empty($action)) {
            $where[] = "a.`action` = :action";
            $params['action'] = $action;
        }

        if (!empty($search)) {
            $where[] = "(a.`action` LIKE :s OR a.`ip_address` LIKE :s OR u.`full_name` LIKE :s OR u.`email` LIKE :s)";
            $params['s'] = "%{$search}%";
        }

        $whereClause = implode(" AND ", $where);

        try {
            // Count total
            $countStmt = $pdo->prepare("
                SELECT COUNT(*) 
                FROM `audit_logs` a
                LEFT JOIN `users` u ON a.`user_id` = u.`id`
                WHERE {$whereClause}
            ");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            // Fetch records
            $stmt = $pdo->prepare("
                SELECT 
                    a.`id`, a.`user_id`, a.`action`, a.`module`, a.`record_id`, 
                    a.`old_values`, a.`new_values`, a.`ip_address`, a.`user_agent`, 
                    a.`is_success`, a.`error_message`, a.`created_at`,
                    u.`full_name` AS user_name, u.`email` AS user_email, u.`code` AS user_code
                FROM `audit_logs` a
                LEFT JOIN `users` u ON a.`user_id` = u.`id`
                WHERE {$whereClause}
                ORDER BY a.`created_at` DESC
                LIMIT :limit OFFSET :offset
            ");

            foreach ($params as $k => $v) {
                $stmt->bindValue($k, $v);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $items = $stmt->fetchAll();

            // Also fetch recent login attempts
            $loginStmt = $pdo->prepare("
                SELECT `id`, `email`, `ip_address`, `user_agent`, `is_success`, `failure_reason`, `created_at`
                FROM `login_attempts`
                ORDER BY `created_at` DESC
                LIMIT 15
            ");
            $loginStmt->execute();
            $recentLoginAttempts = $loginStmt->fetchAll();

            ResponseHelper::success('Lấy danh sách nhật ký hoạt động thành công.', [
                'items' => $items,
                'recentLoginAttempts' => $recentLoginAttempts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            error_log("Audit Logs Error: " . $e->getMessage());
            ResponseHelper::serverError();
        }
    }
}
