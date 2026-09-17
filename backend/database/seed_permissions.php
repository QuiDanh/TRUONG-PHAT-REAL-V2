<?php
/**
 * TRƯỜNG PHÁT REAL - Database Permission Seeder
 * Chỉ seed vai trò mặc định và danh sách quyền hệ thống.
 * TUYỆT ĐỐI KHÔNG TỰ TẠO DỮ LIỆU MẪU (khách hàng, nguồn hàng, giao dịch).
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/Database.php';

try {
    $pdo = Database::getConnection();
    $pdo->beginTransaction();

    echo ">>> Bắt đầu khởi tạo Vai trò và Quyền hệ thống...\n";

    // 1. Roles mặc định
    $roles = [
        [
            'code' => 'ADMIN',
            'name' => 'Quản trị viên tối cao',
            'description' => 'Toàn quyền điều hành hệ thống, quản lý người dùng, cấu hình và nhật ký',
            'is_system' => 1
        ],
        [
            'code' => 'TEAM_LEADER',
            'name' => 'Trưởng nhóm kinh doanh',
            'description' => 'Quản lý nhân viên trong nhóm, xem khách hàng, nguồn hàng và giao dịch của nhóm',
            'is_system' => 1
        ],
        [
            'code' => 'AGENT',
            'name' => 'Chuyên viên môi giới',
            'description' => 'Chăm sóc khách hàng và quản lý nguồn hàng được giao',
            'is_system' => 1
        ],
        [
            'code' => 'ACCOUNTANT',
            'name' => 'Kế toán tài chính',
            'description' => 'Quản lý hợp đồng, thanh toán và theo dõi hoa hồng',
            'is_system' => 1
        ]
    ];

    $roleStmt = $pdo->prepare("
        INSERT INTO `roles` (`code`, `name`, `description`, `is_system`)
        VALUES (:code, :name, :description, :is_system)
        ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`)
    ");

    $roleIds = [];
    foreach ($roles as $r) {
        $roleStmt->execute($r);
        $roleId = $pdo->query("SELECT `id` FROM `roles` WHERE `code` = " . $pdo->quote($r['code']))->fetchColumn();
        $roleIds[$r['code']] = (int)$roleId;
    }

    // 2. Danh mục quyền theo từng module & hành động
    $permissions = [
        // Dashboard
        ['module' => 'dashboard', 'action' => 'view', 'code' => 'dashboard.view', 'name' => 'Xem bảng điều khiển tổng quan'],

        // Nguồn hàng (Properties)
        ['module' => 'properties', 'action' => 'view', 'code' => 'properties.view', 'name' => 'Xem danh sách nguồn hàng'],
        ['module' => 'properties', 'action' => 'create', 'code' => 'properties.create', 'name' => 'Tiếp nhận nguồn hàng mới'],
        ['module' => 'properties', 'action' => 'update', 'code' => 'properties.update', 'name' => 'Cập nhật thông tin nguồn hàng'],
        ['module' => 'properties', 'action' => 'delete', 'code' => 'properties.delete', 'name' => 'Xóa tạm nguồn hàng vào thùng rác'],
        ['module' => 'properties', 'action' => 'restore', 'code' => 'properties.restore', 'name' => 'Khôi phục nguồn hàng đã xóa'],
        ['module' => 'properties', 'action' => 'export', 'code' => 'properties.export', 'name' => 'Xuất danh sách nguồn hàng ra Excel/CSV'],
        ['module' => 'properties', 'action' => 'share', 'code' => 'properties.share', 'name' => 'Tạo liên kết chia sẻ công khai'],

        // Khách hàng (Customers)
        ['module' => 'customers', 'action' => 'view', 'code' => 'customers.view', 'name' => 'Xem danh sách khách hàng'],
        ['module' => 'customers', 'action' => 'create', 'code' => 'customers.create', 'name' => 'Thêm khách hàng mới'],
        ['module' => 'customers', 'action' => 'update', 'code' => 'customers.update', 'name' => 'Cập nhật thông tin khách hàng'],
        ['module' => 'customers', 'action' => 'delete', 'code' => 'customers.delete', 'name' => 'Xóa khách hàng vào thùng rác'],
        ['module' => 'customers', 'action' => 'restore', 'code' => 'customers.restore', 'name' => 'Khôi phục khách hàng đã xóa'],
        ['module' => 'customers', 'action' => 'export', 'code' => 'customers.export', 'name' => 'Xuất dữ liệu khách hàng'],
        ['module' => 'customers', 'action' => 'assign', 'code' => 'customers.assign', 'name' => 'Phân công / điều chuyển khách hàng'],

        // Ghép sản phẩm (Matches)
        ['module' => 'matches', 'action' => 'view', 'code' => 'matches.view', 'name' => 'Xem đề xuất ghép sản phẩm'],
        ['module' => 'matches', 'action' => 'send', 'code' => 'matches.send', 'name' => 'Gửi sản phẩm ghép cho khách hàng'],

        // Lịch hẹn (Appointments)
        ['module' => 'appointments', 'action' => 'view', 'code' => 'appointments.view', 'name' => 'Xem danh sách lịch hẹn'],
        ['module' => 'appointments', 'action' => 'create', 'code' => 'appointments.create', 'name' => 'Đặt lịch hẹn mới'],
        ['module' => 'appointments', 'action' => 'update', 'code' => 'appointments.update', 'name' => 'Cập nhật / hủy lịch hẹn'],

        // Giao dịch bán (Sales)
        ['module' => 'sales', 'action' => 'view', 'code' => 'sales.view', 'name' => 'Xem giao dịch bán & sang nhượng'],
        ['module' => 'sales', 'action' => 'create', 'code' => 'sales.create', 'name' => 'Tạo giao dịch bán mới'],
        ['module' => 'sales', 'action' => 'update', 'code' => 'sales.update', 'name' => 'Cập nhật tiến độ giao dịch'],
        ['module' => 'sales', 'action' => 'deposit', 'code' => 'sales.deposit', 'name' => 'Ghi nhận nhận cọc'],
        ['module' => 'sales', 'action' => 'complete', 'code' => 'sales.complete', 'name' => 'Hoàn tất giao dịch bán'],

        // Cho thuê (Rentals)
        ['module' => 'rentals', 'action' => 'view', 'code' => 'rentals.view', 'name' => 'Xem giao dịch cho thuê'],
        ['module' => 'rentals', 'action' => 'create', 'code' => 'rentals.create', 'name' => 'Tạo giao dịch cho thuê mới'],
        ['module' => 'rentals', 'action' => 'update', 'code' => 'rentals.update', 'name' => 'Cập nhật giao dịch cho thuê'],

        // Hợp đồng & Thanh toán (Contracts & Payments)
        ['module' => 'contracts', 'action' => 'view', 'code' => 'contracts.view', 'name' => 'Xem hợp đồng'],
        ['module' => 'contracts', 'action' => 'create', 'code' => 'contracts.create', 'name' => 'Tạo hợp đồng mới'],
        ['module' => 'contracts', 'action' => 'update', 'code' => 'contracts.update', 'name' => 'Sửa đổi / gia hạn hợp đồng'],
        ['module' => 'payments', 'action' => 'view', 'code' => 'payments.view', 'name' => 'Xem phiếu thanh toán'],
        ['module' => 'payments', 'action' => 'create', 'code' => 'payments.create', 'name' => 'Tạo đợt thu tiền / thanh toán'],
        ['module' => 'payments', 'action' => 'confirm', 'code' => 'payments.confirm', 'name' => 'Xác nhận thu tiền'],

        // Hoa hồng (Commissions)
        ['module' => 'commissions', 'action' => 'view', 'code' => 'commissions.view', 'name' => 'Xem bảng tính hoa hồng'],
        ['module' => 'commissions', 'action' => 'create', 'code' => 'commissions.create', 'name' => 'Tạo phiếu hoa hồng'],
        ['module' => 'commissions', 'action' => 'approve', 'code' => 'commissions.approve', 'name' => 'Phê duyệt chi trả hoa hồng'],
        ['module' => 'commissions', 'action' => 'pay', 'code' => 'commissions.pay', 'name' => 'Ghi nhận thanh toán hoa hồng'],

        // Nhân sự & Nhóm (Users & Teams)
        ['module' => 'users', 'action' => 'view', 'code' => 'users.view', 'name' => 'Xem danh sách nhân viên'],
        ['module' => 'users', 'action' => 'create', 'code' => 'users.create', 'name' => 'Thêm nhân viên mới'],
        ['module' => 'users', 'action' => 'update', 'code' => 'users.update', 'name' => 'Sửa nhân viên / gán quyền'],
        ['module' => 'users', 'action' => 'reset_pwd', 'code' => 'users.reset_pwd', 'name' => 'Cấp mật khẩu tạm cho nhân sự'],
        ['module' => 'teams', 'action' => 'manage', 'code' => 'teams.manage', 'name' => 'Quản lý phòng ban / nhóm'],

        // Báo cáo & Thống kê (Reports)
        ['module' => 'reports', 'action' => 'view', 'code' => 'reports.view', 'name' => 'Xem báo cáo doanh thu & hiệu suất'],
        ['module' => 'reports', 'action' => 'export', 'code' => 'reports.export', 'name' => 'Xuất báo cáo tổng hợp'],

        // Nhật ký hoạt động & Thùng rác & Cài đặt
        ['module' => 'audit_logs', 'action' => 'view', 'code' => 'audit_logs.view', 'name' => 'Xem nhật ký hoạt động hệ thống'],
        ['module' => 'trash', 'action' => 'view', 'code' => 'trash.view', 'name' => 'Xem dữ liệu trong thùng rác'],
        ['module' => 'trash', 'action' => 'restore', 'code' => 'trash.restore', 'name' => 'Khôi phục từ thùng rác'],
        ['module' => 'trash', 'action' => 'delete_permanent', 'code' => 'trash.delete_permanent', 'name' => 'Xóa vĩnh viễn dữ liệu'],
        ['module' => 'settings', 'action' => 'manage', 'code' => 'settings.manage', 'name' => 'Quản trị cài đặt hệ thống']
    ];

    $permStmt = $pdo->prepare("
        INSERT INTO `permissions` (`module`, `action`, `code`, `name`)
        VALUES (:module, :action, :code, :name)
        ON DUPLICATE KEY UPDATE `name` = VALUES(`name`)
    ");

    $permIds = [];
    foreach ($permissions as $p) {
        $permStmt->execute($p);
        $permId = $pdo->query("SELECT `id` FROM `permissions` WHERE `code` = " . $pdo->quote($p['code']))->fetchColumn();
        $permIds[$p['code']] = (int)$permId;
    }

    // 3. Gán quyền cho từng vai trò
    $rolePermStmt = $pdo->prepare("
        INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
        VALUES (:role_id, :permission_id)
    ");

    // ADMIN: Mọi quyền
    foreach ($permIds as $code => $pId) {
        $rolePermStmt->execute(['role_id' => $roleIds['ADMIN'], 'permission_id' => $pId]);
    }

    // TEAM_LEADER: Xem dashboard, nguồn hàng, khách hàng, giao dịch, lịch hẹn, đề xuất hoa hồng, báo cáo nhóm
    $leaderPermCodes = [
        'dashboard.view', 'properties.view', 'properties.create', 'properties.update', 'properties.share',
        'customers.view', 'customers.create', 'customers.update', 'customers.assign',
        'matches.view', 'matches.send', 'appointments.view', 'appointments.create', 'appointments.update',
        'sales.view', 'sales.create', 'sales.update', 'sales.deposit',
        'rentals.view', 'rentals.create', 'rentals.update',
        'contracts.view', 'payments.view',
        'commissions.view', 'commissions.create', 'commissions.approve',
        'users.view', 'reports.view'
    ];
    foreach ($leaderPermCodes as $code) {
        if (isset($permIds[$code])) {
            $rolePermStmt->execute(['role_id' => $roleIds['TEAM_LEADER'], 'permission_id' => $permIds[$code]]);
        }
    }

    // AGENT: Nguồn hàng, khách hàng, lịch hẹn, giao dịch của cá nhân
    $agentPermCodes = [
        'dashboard.view', 'properties.view', 'properties.create', 'properties.update', 'properties.share',
        'customers.view', 'customers.create', 'customers.update',
        'matches.view', 'matches.send', 'appointments.view', 'appointments.create', 'appointments.update',
        'sales.view', 'sales.create', 'sales.update',
        'rentals.view', 'rentals.create', 'rentals.update',
        'contracts.view', 'commissions.view'
    ];
    foreach ($agentPermCodes as $code) {
        if (isset($permIds[$code])) {
            $rolePermStmt->execute(['role_id' => $roleIds['AGENT'], 'permission_id' => $permIds[$code]]);
        }
    }

    // ACCOUNTANT: Hợp đồng, thanh toán, hoa hồng, báo cáo tài chính
    $accountantPermCodes = [
        'dashboard.view', 'contracts.view', 'contracts.create', 'contracts.update',
        'payments.view', 'payments.create', 'payments.confirm',
        'commissions.view', 'commissions.create', 'commissions.pay',
        'sales.view', 'rentals.view', 'reports.view', 'reports.export'
    ];
    foreach ($accountantPermCodes as $code) {
        if (isset($permIds[$code])) {
            $rolePermStmt->execute(['role_id' => $roleIds['ACCOUNTANT'], 'permission_id' => $permIds[$code]]);
        }
    }

    $pdo->commit();
    echo ">>> Khởi tạo vai trò và quyền thành công!\n";
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "LỖI SEED: " . $e->getMessage() . "\n";
    exit(1);
}
