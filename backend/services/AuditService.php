<?php
/**
 * TRƯỜNG PHÁT REAL - Audit & Activity Logging Service
 */

require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Security.php';

class AuditService {
    public static function logActivity(
        ?int $userId,
        string $action,
        string $module,
        ?int $recordId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        bool $isSuccess = true,
        ?string $errorMessage = null
    ): void {
        try {
            $pdo = Database::getConnection();

            $oldClean = $oldValues ? json_encode(Security::sanitizeForAudit($oldValues), JSON_UNESCAPED_UNICODE) : null;
            $newClean = $newValues ? json_encode(Security::sanitizeForAudit($newValues), JSON_UNESCAPED_UNICODE) : null;

            $stmt = $pdo->prepare("
                INSERT INTO `audit_logs` (
                    `user_id`, `action`, `module`, `record_id`, `old_values`, `new_values`, 
                    `ip_address`, `user_agent`, `is_success`, `error_message`
                ) VALUES (
                    :user_id, :action, :module, :record_id, :old_values, :new_values,
                    :ip_address, :user_agent, :is_success, :error_message
                )
            ");

            $stmt->execute([
                'user_id' => $userId,
                'action' => substr($action, 0, 100),
                'module' => substr($module, 0, 50),
                'record_id' => $recordId,
                'old_values' => $oldClean,
                'new_values' => $newClean,
                'ip_address' => Security::getClientIp(),
                'user_agent' => Security::getUserAgent(),
                'is_success' => $isSuccess ? 1 : 0,
                'error_message' => $errorMessage ? substr($errorMessage, 0, 500) : null
            ]);
        } catch (Exception $e) {
            error_log("Audit Log Failed: " . $e->getMessage());
        }
    }

    public static function logLoginAttempt(
        string $email,
        bool $isSuccess,
        ?string $failureReason = null
    ): void {
        try {
            $pdo = Database::getConnection();

            $stmt = $pdo->prepare("
                INSERT INTO `login_attempts` (`email`, `ip_address`, `user_agent`, `is_success`, `failure_reason`)
                VALUES (:email, :ip_address, :user_agent, :is_success, :failure_reason)
            ");

            $stmt->execute([
                'email' => substr($email, 0, 191),
                'ip_address' => Security::getClientIp(),
                'user_agent' => Security::getUserAgent(),
                'is_success' => $isSuccess ? 1 : 0,
                'failure_reason' => $failureReason ? substr($failureReason, 0, 255) : null
            ]);
        } catch (Exception $e) {
            error_log("Login Attempt Log Failed: " . $e->getMessage());
        }
    }
}
