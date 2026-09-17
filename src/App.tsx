import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ForceChangePasswordPage } from './pages/ForceChangePasswordPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Active Phase 1 Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuditLogsPage } from './pages/AuditLogsPage';

// Roadmap Placeholder for Subsequent Phases
import { ModulePlaceholderPage } from './pages/ModulePlaceholderPage';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/force-change-password" element={<ForceChangePasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected App Routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Giai đoạn 1: Đã hoàn thiện */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute permission="dashboard.view">
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                  path="audit-logs"
                  element={
                    <ProtectedRoute permission="audit_logs.view">
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Giai đoạn 2: Nguồn hàng */}
                <Route
                  path="properties"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Quản Lý Nguồn Hàng Bất Động Sản"
                      phase={2}
                      phaseTitle="Giai Đoạn 2: Nguồn hàng, Upload ảnh, Lịch sử giá, Chia sẻ, QR & Soft delete"
                      description="Hệ thống quản lý nguồn hàng nhà phố, đất nền, căn hộ, biệt thự với thông tin chủ nhà bảo mật, định vị bản đồ, mã QR tra cứu, và quản lý giá bán/thuê linh hoạt."
                      features={[
                        'Mã sản phẩm tự sinh chuẩn TP-YYYY-XXXX',
                        'Upload ảnh đa định dạng, đóng dấu bản quyền logo TRƯỜNG PHÁT',
                        'Lưu vết lịch sử biến động giá bán và giá cho thuê',
                        'Bảo mật số điện thoại và địa chỉ thực của chủ nhà theo quyền',
                        'Tạo mã QR và link chia sẻ nội bộ hoặc cho khách hàng',
                        'Xóa mềm (Soft delete) và khôi phục từ thùng rác'
                      ]}
                      tables={['properties', 'property_images', 'property_price_histories', 'property_shares', 'property_views']}
                      iconType="properties"
                    />
                  }
                />

                {/* Giai đoạn 3: Khách hàng & Ghép sản phẩm */}
                <Route
                  path="customers"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Quản Lý Khách Hàng (CRM)"
                      phase={3}
                      phaseTitle="Giai Đoạn 3: Khách hàng, Nhật ký chăm sóc, Chuyển phụ trách & Lịch hẹn"
                      description="Quản lý phễu khách hàng mua, thuê và đầu tư, theo dõi tiến độ tư vấn, nhắc nhở định kỳ và chống trùng lặp dữ liệu khách hàng."
                      features={[
                        'Phân loại nguồn khách hàng (Facebook, Zalo, Giới thiệu, Hotline)',
                        'Nhật ký chăm sóc chi tiết từng cuộc gọi, tin nhắn và gặp mặt',
                        'Bàn giao khách hàng giữa các chuyên viên khi điều chuyển nhân sự',
                        'Cảnh báo khách hàng lâu ngày chưa được tương tác'
                      ]}
                      tables={['customers', 'customer_care_logs', 'customer_assignments']}
                      iconType="customers"
                    />
                  }
                />

                <Route
                  path="matches"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Ghép Sản Phẩm Thông Minh"
                      phase={3}
                      phaseTitle="Giai Đoạn 3: Khớp nối nhu cầu khách hàng và kho hàng"
                      description="Thuật toán đối chiếu thông minh tự động so khớp tầm tài chính, vị trí, diện tích và loại hình bất động sản phù hợp nhất cho từng khách hàng."
                      features={[
                        'Tính toán tỷ lệ % độ phù hợp của từng sản phẩm',
                        'Lọc theo bán kính vị trí và phân khúc giá',
                        'Gửi danh sách đề xuất nhanh chóng cho khách hàng'
                      ]}
                      tables={['properties', 'customers']}
                      iconType="matches"
                    />
                  }
                />

                <Route
                  path="appointments"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Lịch Hẹn & Tiếp Xúc"
                      phase={3}
                      phaseTitle="Giai Đoạn 3: Quản lý lịch hẹn dẫn khách xem nhà"
                      description="Lên lịch hẹn xem thực tế bất động sản, nhắc nhở giờ hẹn cho môi giới và khách hàng, ghi nhận kết quả và phản hồi sau khi khảo sát."
                      features={[
                        'Lên lịch hẹn xem nhà và tiếp xúc trực tiếp',
                        'Gửi thông báo nhắc hẹn trước giờ khởi hành',
                        'Ghi nhận phản hồi thực tế của khách hàng về căn nhà'
                      ]}
                      tables={['appointments']}
                      iconType="appointments"
                    />
                  }
                />

                {/* Giai đoạn 4: Giao dịch, Hợp đồng & Thanh toán */}
                <Route
                  path="sales"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Giao Dịch Bán & Sang Nhượng"
                      phase={4}
                      phaseTitle="Giai Đoạn 4: Quy trình đặt cọc, công chứng và bàn giao"
                      description="Theo dõi toàn bộ vòng đời giao dịch mua bán bất động sản từ bước nhận cọc, kiểm tra quy hoạch, soạn hồ sơ công chứng đến khi sang tên sổ đỏ."
                      features={[
                        'Quản lý hồ sơ đặt cọc và điều khoản cam kết',
                        'Theo dõi tiến độ ký hợp đồng công chứng',
                        'Tự động đồng bộ trạng thái nguồn hàng sang ĐÃ NHẬN CỌC / ĐÃ BÁN'
                      ]}
                      tables={['transactions', 'contracts']}
                      iconType="sales"
                    />
                  }
                />

                <Route
                  path="rentals"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Giao Dịch Cho Thuê"
                      phase={4}
                      phaseTitle="Giai Đoạn 4: Hợp đồng thuê, kỳ thanh toán & quản lý bàn giao"
                      description="Quản lý các hợp đồng cho thuê nhà ở, mặt bằng kinh doanh, theo dõi kỳ thanh toán tiền thuê, cọc giữ chỗ và thời hạn kết thúc hợp đồng."
                      features={[
                        'Quản lý kỳ hạn thuê và chu kỳ trả tiền (hàng tháng/quý)',
                        'Nhắc hạn thanh toán và tái ký hợp đồng trước 30 ngày',
                        'Biên bản bàn giao hiện trạng trang thiết bị'
                      ]}
                      tables={['transactions', 'contracts', 'payment_installments']}
                      iconType="rentals"
                    />
                  }
                />

                <Route
                  path="contracts"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Hợp Đồng Mẫu & Hồ Sơ Pháp Lý"
                      phase={4}
                      phaseTitle="Giai Đoạn 4: Lưu trữ và in ấn hợp đồng môi giới"
                      description="Quản lý biểu mẫu hợp đồng đặt cọc, hợp đồng dịch vụ môi giới, hợp đồng thuê nhà theo đúng quy định pháp luật Việt Nam."
                      features={[
                        'Tự động điền thông tin các bên vào mẫu văn bản chuẩn',
                        'Xuất file PDF hoặc in trực tiếp có chữ ký số',
                        'Lưu trữ file scan hợp đồng có đóng dấu công chứng'
                      ]}
                      tables={['contracts']}
                      iconType="contracts"
                    />
                  }
                />

                <Route
                  path="payments"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Kỳ Thu & Thanh Toán"
                      phase={4}
                      phaseTitle="Giai Đoạn 4: Quản lý dòng tiền và các đợt thanh toán"
                      description="Kiểm soát tiến độ đóng tiền theo từng đợt, ghi nhận ủy nhiệm chi, biên lai thu tiền và lịch sử giao dịch ngân hàng."
                      features={[
                        'Lập kế hoạch thanh toán nhiều đợt theo thỏa thuận hợp đồng',
                        'Ghi nhận chứng từ ủy nhiệm chi và biên nhận tiền mặt',
                        'Cảnh báo các đợt thanh toán quá hạn'
                      ]}
                      tables={['payment_installments']}
                      iconType="payments"
                    />
                  }
                />

                {/* Giai đoạn 5: Hoa hồng, Nhân sự, Báo cáo & Cài đặt */}
                <Route
                  path="commissions"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Quản Lý Hoa Hồng Môi Giới"
                      phase={5}
                      phaseTitle="Giai Đoạn 5: Tính toán và phân chia hoa hồng tự động"
                      description="Cơ chế chia hoa hồng minh bạch giữa đầu chủ nguồn hàng, đầu khách, trưởng nhóm và quỹ vận hành công ty TRƯỜNG PHÁT REAL."
                      features={[
                        'Công thức phân chia tỷ lệ hoa hồng theo chính sách từng giao dịch',
                        'Theo dõi trạng thái: Chờ duyệt -> Đã nhận -> Đã chi trả',
                        'Bảng kê hoa hồng chi tiết từng cá nhân theo tháng'
                      ]}
                      tables={['commissions', 'commission_splits']}
                      iconType="commissions"
                    />
                  }
                />

                <Route
                  path="teams"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Nhân Sự & Cơ Cấu Đội Nhóm"
                      phase={5}
                      phaseTitle="Giai Đoạn 5: Quản lý nhân viên, phòng ban và phân quyền RBAC"
                      description="Quản trị cơ cấu tổ chức theo khối kinh doanh, phòng ban và đội nhóm, phân quyền chi tiết tới từng nút bấm chức năng."
                      features={[
                        'Danh sách nhân sự, chức danh và hồ sơ chuyên viên',
                        'Quản lý cây đội nhóm và phân bổ KPI kinh doanh',
                        'Gán quyền hạn riêng biệt và mở khóa tài khoản'
                      ]}
                      tables={['users', 'teams', 'roles', 'permissions', 'role_permissions', 'user_permissions']}
                      iconType="teams"
                    />
                  }
                />

                <Route
                  path="reports"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Báo Cáo & Thống Kê Nâng Cao"
                      phase={5}
                      phaseTitle="Giai Đoạn 5: Phân tích doanh số, hiệu suất và dự báo"
                      description="Hệ thống báo cáo biểu đồ trực quan về doanh thu bán/cho thuê, bảng xếp hạng môi giới xuất sắc và hiệu quả từng kênh nguồn hàng."
                      features={[
                        'Biểu đồ doanh số theo tháng, quý và năm',
                        'Bảng xếp hạng hiệu suất Top Môi Giới xuất sắc',
                        'Xuất báo cáo tài chính ra file Excel / CSV'
                      ]}
                      tables={['properties', 'transactions', 'commissions']}
                      iconType="reports"
                    />
                  }
                />

                <Route
                  path="trash"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Thùng Rác Hệ Thống"
                      phase={1}
                      phaseTitle="An toàn dữ liệu: Soft Delete và Khôi phục"
                      description="Nơi lưu trữ tạm thời các nguồn hàng, khách hàng và giao dịch đã bị xóa. Người có thẩm quyền có thể khôi phục lại hoặc xóa vĩnh viễn."
                      features={[
                        'Lọc theo loại dữ liệu (Nguồn hàng, Khách hàng, Hợp đồng)',
                        'Xem lý do và người thực hiện thao tác xóa',
                        'Khôi phục nguyên trạng kèm đầy đủ lịch sử liên quan'
                      ]}
                      tables={['properties', 'customers', 'transactions']}
                      iconType="trash"
                    />
                  }
                />

                <Route
                  path="settings"
                  element={
                    <ModulePlaceholderPage
                      moduleName="Cài Đặt Hệ Thống"
                      phase={1}
                      phaseTitle="Cấu hình thông tin công ty và tham số hệ thống"
                      description="Thiết lập tên công ty, hotline, địa chỉ, định dạng tiền tệ, múi giờ Việt Nam và cấu hình bảo mật máy chủ."
                      features={[
                        'Thông tin thương hiệu TRƯỜNG PHÁT REAL',
                        'Cấu hình thời gian hết hạn phiên đăng nhập',
                        'Cấu hình chính sách mật khẩu và số lần khóa tạm brute-force'
                      ]}
                      tables={['system_settings']}
                      iconType="settings"
                    />
                  }
                />

                {/* 404 Inside Layout */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* 404 Global */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
