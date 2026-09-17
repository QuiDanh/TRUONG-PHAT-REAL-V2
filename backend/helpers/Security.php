<?php
/**
 * TRƯỜNG PHÁT REAL - Security & Sanitization Helper
 */

class Security {
    public static function getClientIp(): string {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '127.0.0.1';
    }

    public static function getUserAgent(): string {
        return substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 500);
    }

    public static function generateSecureToken(int $bytes = 32): string {
        return bin2hex(random_bytes($bytes));
    }

    public static function hashToken(string $token): string {
        if (!defined('TOKEN_SECRET_SALT') || empty(trim(TOKEN_SECRET_SALT)) || trim(TOKEN_SECRET_SALT) === 'CHANGE_THIS_TO_A_64_CHAR_RANDOM_STRING_FOR_SECURE_TOKEN_HASHING') {
            throw new RuntimeException('LỖI BẢO MẬT: TOKEN_SECRET_SALT chưa được cấu hình. Backend từ chối hoạt động.');
        }
        return hash('sha256', $token . TOKEN_SECRET_SALT);
    }

    public static function sanitizeString(?string $str): string {
        if ($str === null) return '';
        return htmlspecialchars(trim($str), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function validatePasswordStrength(string $password): array {
        $errors = [];
        if (strlen($password) < 8) {
            $errors[] = 'Mật khẩu phải có độ dài tối thiểu 8 ký tự.';
        }
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 chữ cái in hoa.';
        }
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 chữ cái in thường.';
        }
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 chữ số.';
        }
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...).';
        }
        return $errors;
    }

    public static function sanitizeForAudit(array $data): array {
        $sensitiveKeys = ['password', 'password_hash', 'password_confirmation', 'token', 'secret', 'db_pass'];
        $clean = [];
        foreach ($data as $key => $val) {
            if (in_array(strtolower($key), $sensitiveKeys, true)) {
                $clean[$key] = '[REDACTED]';
            } elseif (is_array($val)) {
                $clean[$key] = self::sanitizeForAudit($val);
            } else {
                $clean[$key] = $val;
            }
        }
        return $clean;
    }
}
