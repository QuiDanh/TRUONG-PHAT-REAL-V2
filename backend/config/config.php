<?php
/**
 * TRƯỜNG PHÁT REAL - Cấu hình hệ thống chính
 */

$envDbHost = getenv('DB_HOST') ?: 'localhost';
$envDbPort = getenv('DB_PORT') ?: '3306';
$envDbName = getenv('DB_NAME') ?: 'anminhto_tp_real';
$envDbUser = getenv('DB_USER') ?: 'anminhto_tp_usr';
$envDbPass = getenv('DB_PASS') ?: '';
$envAppUrl = getenv('APP_URL') ?: 'https://dev.anminhtown.vn';
$envSalt   = getenv('TOKEN_SECRET_SALT') ?: 'TP_REAL_ESTATE_SALT_k98sd7f6a5s4d3f2g1h_SECURE';

if (!defined('DB_HOST')) define('DB_HOST', $envDbHost);
if (!defined('DB_PORT')) define('DB_PORT', $envDbPort);
if (!defined('DB_NAME')) define('DB_NAME', $envDbName);
if (!defined('DB_USER')) define('DB_USER', $envDbUser);
if (!defined('DB_PASS')) define('DB_PASS', $envDbPass);
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

if (!defined('APP_ENV')) define('APP_ENV', getenv('APP_ENV') ?: 'production');
if (!defined('APP_NAME')) define('APP_NAME', 'TRƯỜNG PHÁT REAL');
if (!defined('APP_URL')) define('APP_URL', $envAppUrl);
if (!defined('TIMEZONE')) define('TIMEZONE', 'Asia/Ho_Chi_Minh');

if (!defined('SESSION_LIFETIME_SECONDS')) define('SESSION_LIFETIME_SECONDS', 86400 * 7);
if (!defined('MAX_LOGIN_ATTEMPTS')) define('MAX_LOGIN_ATTEMPTS', 5);
if (!defined('LOCKOUT_DURATION_MINUTES')) define('LOCKOUT_DURATION_MINUTES', 15);
if (!defined('TOKEN_SECRET_SALT')) define('TOKEN_SECRET_SALT', $envSalt);

if (!defined('CORS_ALLOWED_ORIGINS')) {
    define('CORS_ALLOWED_ORIGINS', [
        'https://dev.anminhtown.vn',
        'https://app.anminhtown.vn',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ]);
}

if (!defined('UPLOAD_DIR')) define('UPLOAD_DIR', dirname(__DIR__, 2) . '/public_html/uploads');
if (!defined('UPLOAD_MAX_BYTES')) define('UPLOAD_MAX_BYTES', 10 * 1024 * 1024);
if (!defined('ALLOWED_IMAGE_MIMES')) define('ALLOWED_IMAGE_MIMES', ['image/jpeg', 'image/png', 'image/webp']);
if (!defined('ALLOWED_DOC_MIMES')) define('ALLOWED_DOC_MIMES', ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

date_default_timezone_set(TIMEZONE);
