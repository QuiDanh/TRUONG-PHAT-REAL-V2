<?php
/**
 * TRƯỜNG PHÁT REAL - Dashboard Controller
 * Khi database trống, tất cả các số liệu thống kê phải trả về số 0 chuẩn xác.
 */

require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/PermissionMiddleware.php';

class DashboardController {
    public static function getStats(): void {
        $user = AuthMiddleware::authenticate();
        PermissionMiddleware::requirePermission($user, 'dashboard.view');

        $range = $_GET['range'] ?? 'this_month'; // today, this_week, this_month, this_quarter, this_year, custom
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        $filterUserId = !empty($_GET['user_id']) ? (int)$_GET['user_id'] : null;
        $filterTeamId = !empty($_GET['team_id']) ? (int)$_GET['team_id'] : null;

        // Phân quyền dữ liệu: AGENT chỉ xem dữ liệu của mình, TEAM_LEADER xem của team, ADMIN/ACCOUNTANT xem toàn bộ
        $scopeUser = null;
        $scopeTeam = null;
        if ($user['role_code'] === 'AGENT') {
            $scopeUser = (int)$user['id'];
        } elseif ($user['role_code'] === 'TEAM_LEADER') {
            $scopeTeam = (int)$user['team_id'];
            if ($filterUserId) $scopeUser = $filterUserId;
        } else {
            if ($filterUserId) $scopeUser = $filterUserId;
            if ($filterTeamId) $scopeTeam = $filterTeamId;
        }

        try {
            $pdo = Database::getConnection();

            // Tính toán khoảng ngày theo bộ lọc
            $now = new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh'));
            $dateConditions = self::resolveDateRange($range, $startDate, $endDate, $now);

            // 1. Thống kê nguồn hàng
            $propSql = "
                SELECT 
                    COUNT(*) AS total_properties,
                    COALESCE(SUM(CASE WHEN `status` = 'new' THEN 1 ELSE 0 END), 0) AS new_properties,
                    COALESCE(SUM(CASE WHEN `status` = 'selling' THEN 1 ELSE 0 END), 0) AS selling_properties,
                    COALESCE(SUM(CASE WHEN `status` = 'renting' THEN 1 ELSE 0 END), 0) AS renting_properties,
                    COALESCE(SUM(CASE WHEN `status` = 'deposited' THEN 1 ELSE 0 END), 0) AS deposited_properties,
                    COALESCE(SUM(CASE WHEN `status` = 'sold' THEN 1 ELSE 0 END), 0) AS sold_properties,
                    COALESCE(SUM(CASE WHEN `status` = 'rented' THEN 1 ELSE 0 END), 0) AS rented_properties
                FROM `properties`
                WHERE `deleted_at` IS NULL
            ";
            $params = [];
            if ($scopeUser) {
                $propSql .= " AND `assigned_to` = :scope_user";
                $params['scope_user'] = $scopeUser;
            } elseif ($scopeTeam) {
                $propSql .= " AND `team_id` = :scope_team";
                $params['scope_team'] = $scopeTeam;
            }
            $stmt = $pdo->prepare($propSql);
            $stmt->execute($params);
            $propStats = $stmt->fetch() ?: [];

            // 2. Thống kê khách hàng
            $custSql = "
                SELECT 
                    COUNT(*) AS total_customers,
                    COALESCE(SUM(CASE WHEN `status` = 'new' THEN 1 ELSE 0 END), 0) AS new_customers,
                    COALESCE(SUM(CASE WHEN `status` IN ('consulting', 'negotiating') THEN 1 ELSE 0 END), 0) AS caring_customers,
                    COALESCE(SUM(CASE WHEN `next_care_date` <= CURDATE() AND `status` NOT IN ('deal_closed', 'lost') THEN 1 ELSE 0 END), 0) AS overdue_care_customers
                FROM `customers`
                WHERE `deleted_at` IS NULL
            ";
            $custParams = [];
            if ($scopeUser) {
                $custSql .= " AND `assigned_to` = :scope_user";
                $custParams['scope_user'] = $scopeUser;
            } elseif ($scopeTeam) {
                $custSql .= " AND `team_id` = :scope_team";
                $custParams['scope_team'] = $scopeTeam;
            }
            $custStmt = $pdo->prepare($custSql);
            $custStmt->execute($custParams);
            $custStats = $custStmt->fetch() ?: [];

            // 3. Thống kê giao dịch & doanh số
            $txSql = "
                SELECT 
                    COALESCE(SUM(CASE WHEN `status` IN ('consulting', 'viewed', 'negotiating', 'deposited', 'processing') THEN 1 ELSE 0 END), 0) AS active_transactions,
                    COALESCE(SUM(CASE WHEN `status` = 'completed' THEN 1 ELSE 0 END), 0) AS completed_transactions,
                    COALESCE(SUM(CASE WHEN `status` = 'completed' AND `type` = 'sale' THEN `final_price` ELSE 0 END), 0) AS total_sales_volume,
                    COALESCE(SUM(CASE WHEN `status` = 'completed' AND `type` = 'rent' THEN `final_price` ELSE 0 END), 0) AS total_rent_revenue
                FROM `transactions`
                WHERE `deleted_at` IS NULL
            ";
            $txParams = [];
            if ($scopeUser) {
                $txSql .= " AND `lead_agent_id` = :scope_user";
                $txParams['scope_user'] = $scopeUser;
            }
            $txStmt = $pdo->prepare($txSql);
            $txStmt->execute($txParams);
            $txStats = $txStmt->fetch() ?: [];

            // 4. Tổng hoa hồng
            $commSql = "
                SELECT COALESCE(SUM(`net_amount`), 0) AS total_commissions
                FROM `commissions`
                WHERE `status` IN ('approved', 'partially_paid', 'paid')
            ";
            $commStmt = $pdo->query($commSql);
            $commStats = $commStmt->fetch() ?: ['total_commissions' => 0];

            // 5. Lịch hẹn hôm nay
            $today = $now->format('Y-m-d');
            $appSql = "
                SELECT COUNT(*) AS appointments_today
                FROM `appointments`
                WHERE DATE(`start_time`) = :today AND `status` != 'cancelled'
            ";
            $appParams = ['today' => $today];
            if ($scopeUser) {
                $appSql .= " AND `user_id` = :scope_user";
                $appParams['scope_user'] = $scopeUser;
            }
            $appStmt = $pdo->prepare($appSql);
            $appStmt->execute($appParams);
            $appToday = (int)$appStmt->fetchColumn();

            // Kết quả tổng hợp hoàn toàn là 0 nếu database trống
            $response = [
                'summary' => [
                    'totalProperties' => (int)($propStats['total_properties'] ?? 0),
                    'newProperties' => (int)($propStats['new_properties'] ?? 0),
                    'sellingProperties' => (int)($propStats['selling_properties'] ?? 0),
                    'rentingProperties' => (int)($propStats['renting_properties'] ?? 0),
                    'depositedProperties' => (int)($propStats['deposited_properties'] ?? 0),
                    'totalCustomers' => (int)($custStats['total_customers'] ?? 0),
                    'newCustomers' => (int)($custStats['new_customers'] ?? 0),
                    'caringCustomers' => (int)($custStats['caring_customers'] ?? 0),
                    'overdueCareCustomers' => (int)($custStats['overdue_care_customers'] ?? 0),
                    'activeTransactions' => (int)($txStats['active_transactions'] ?? 0),
                    'completedTransactions' => (int)($txStats['completed_transactions'] ?? 0),
                    'totalSalesVolume' => (float)($txStats['total_sales_volume'] ?? 0),
                    'totalRentRevenue' => (float)($txStats['total_rent_revenue'] ?? 0),
                    'totalCommission' => (float)($commStats['total_commissions'] ?? 0),
                    'appointmentsToday' => $appToday,
                    'pendingTasks' => 0
                ],
                'filter' => [
                    'range' => $range,
                    'startDate' => $dateConditions['start'],
                    'endDate' => $dateConditions['end']
                ],
                'recentAppointments' => [],
                'staleProperties' => [],
                'staleCustomers' => [],
                'monthlyPerformance' => []
            ];

            ResponseHelper::success('Lấy dữ liệu bảng điều khiển thành công.', $response);
        } catch (Exception $e) {
            error_log("Dashboard Error: " . $e->getMessage());
            ResponseHelper::serverError();
        }
    }

    private static function resolveDateRange(string $range, ?string $start, ?string $end, DateTime $now): array {
        switch ($range) {
            case 'today':
                return [
                    'start' => $now->format('Y-m-d 00:00:00'),
                    'end' => $now->format('Y-m-d 23:59:59')
                ];
            case 'this_week':
                $startOfWeek = clone $now;
                $startOfWeek->modify('monday this week');
                $endOfWeek = clone $now;
                $endOfWeek->modify('sunday this week');
                return [
                    'start' => $startOfWeek->format('Y-m-d 00:00:00'),
                    'end' => $endOfWeek->format('Y-m-d 23:59:59')
                ];
            case 'this_quarter':
                $month = (int)$now->format('n');
                $quarter = ceil($month / 3);
                $startMonth = ($quarter - 1) * 3 + 1;
                $startDate = sprintf('%s-%02d-01 00:00:00', $now->format('Y'), $startMonth);
                $endDateObj = new DateTime($startDate);
                $endDateObj->modify('+3 months -1 second');
                return [
                    'start' => $startDate,
                    'end' => $endDateObj->format('Y-m-d 23:59:59')
                ];
            case 'this_year':
                return [
                    'start' => $now->format('Y-01-01 00:00:00'),
                    'end' => $now->format('Y-12-31 23:59:59')
                ];
            case 'custom':
                return [
                    'start' => ($start ?: $now->format('Y-m-01')) . ' 00:00:00',
                    'end' => ($end ?: $now->format('Y-m-d')) . ' 23:59:59'
                ];
            case 'this_month':
            default:
                return [
                    'start' => $now->format('Y-m-01 00:00:00'),
                    'end' => $now->format('Y-m-t 23:59:59')
                ];
        }
    }
}
