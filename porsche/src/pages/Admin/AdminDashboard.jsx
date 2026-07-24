import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Can, useAbility } from '../../hooks/useAbility';
import useCarStore from '../../store/useCarStore';
import { adminAPI } from '../../services/api';
import './AdminDashboard.css';

// ── Menu items — mỗi item có CASL check riêng ──
const MENU_ITEMS = [
  { id: 'overview',   label: 'Tổng quan',       icon: '📊', action: 'read',   subject: 'Dashboard' },
  { id: 'users',      label: 'Người dùng',       icon: '👥', action: 'read',   subject: 'User'      },
  { id: 'orders',     label: 'Đơn hàng',         icon: '💳', action: 'read',   subject: 'Order'     },
  { id: 'testdrives', label: 'Lịch lái thử',     icon: '🚗', action: 'manage', subject: 'TestDrive' },
  { id: 'cars',       label: 'Quản lý xe',       icon: '🏎️', action: 'manage', subject: 'Car'       },
  { id: 'shop',       label: 'Gói subscription', icon: '🛒', action: 'manage', subject: 'Shop'      },
  { id: 'roles',      label: 'Phân quyền',       icon: '🔐', action: 'manage', subject: 'all'       },
];

const ROLE_COLORS = { confirmed: '#059669', pending: '#d97706', cancelled: '#dc2626' }; // Đã tinh chỉnh màu cho sáng sủa hơn
const ROLE_LABELS = { confirmed: 'Đã xác nhận', pending: 'Chờ duyệt', cancelled: 'Đã hủy' };

export default function AdminDashboard() {
  const ability   = useAbility();
  const user      = useCarStore((s) => s.user ?? null);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [testDrives, setTestDrives] = useState([]);

  const visibleMenu = MENU_ITEMS.filter(item =>
    ability.can(item.action, item.subject)
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeMenu === 'overview' && ability.can('read', 'Dashboard')) {
        const res = await adminAPI.getDashboardStats();
        setStats(res.data || []); 
      } 
      else if (activeMenu === 'users' && ability.can('read', 'User')) {
        const res = await adminAPI.getAllUsers();
        setUsers(res.data || []);
      } 
      else if (activeMenu === 'orders' && ability.can('read', 'Order')) {
        const res = await adminAPI.getAllOrders();
        setOrders(res.data || []);
      } 
      else if (activeMenu === 'testdrives' && ability.can('manage', 'TestDrive')) {
        const res = await adminAPI.getAllTestDrives();
        setTestDrives(res.data || res);
      }
    } catch (error) {
      console.error(`Lỗi tải dữ liệu cho tab ${activeMenu}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeMenu, ability]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!ability.can('read', 'Dashboard')) {
    return <Navigate to="/" replace />;
  }

  const handleUpdateStatus = async (id, newStatus) => {
    if(!window.confirm(`Xác nhận chuyển trạng thái thành: ${ROLE_LABELS[newStatus]}?`)) return;
    try {
      await adminAPI.updateTestDriveStatus(id, newStatus);
      fetchData();
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="porsche-text-logo">
            PORSCHE
          </div>
</Link>
          <button className="admin-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        {sidebarOpen && (
          <div className="admin-user-info">
            <div className="admin-avatar">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div className="admin-user-name">{user?.displayName || 'ADMIN'}</div>
              <div className="admin-user-role">{user?.role || 'Super Admin'}</div>
            </div>
          </div>
        )}

        <nav className="admin-nav">
          {visibleMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`admin-nav-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {MENU_ITEMS.find(m => m.id === activeMenu)?.label || 'Dashboard'}
            </h1>
            <div className="admin-breadcrumb">Admin / {MENU_ITEMS.find(m => m.id === activeMenu)?.label}</div>
          </div>
          <div className="admin-date">{new Date().toLocaleDateString('vi-VN')}</div>
        </header>

        {/* ── 1. GIAO DIỆN TAB TỔNG QUAN ── */}
        {activeMenu === 'overview' && (
          <div className="admin-content">
            <div className="admin-section">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Tổng quan hệ thống</h2>
                  <p className="admin-section-desc">Theo dõi các chỉ số quan trọng.</p>
                </div>
                <button onClick={fetchData} className="admin-btn-refresh">🔄 Làm mới</button>
              </div>
              
              {loading ? (
                <div className="admin-empty-state">Đang tải dữ liệu tổng quan...</div>
              ) : stats.length === 0 ? (
                <div className="admin-empty-state">Chưa có dữ liệu thống kê từ Server.</div>
              ) : (
                <div className="admin-stats">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="admin-stat-card">
                      <div className="admin-stat-icon" style={{ color: stat.color, background: stat.bg }}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="admin-stat-label">{stat.label}</div>
                        <div className="admin-stat-value">{stat.value}</div>
                        <div className="admin-stat-delta" style={{ color: '#059669' }}>{stat.delta} so với kỳ trước</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 2. QUẢN LÝ NGƯỜI DÙNG ── */}
        {activeMenu === 'users' && (
          <Can do="read" on="User">
            <div className="admin-content">
              <div className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2 className="admin-section-title">Quản lý Tài Khoản</h2>
                    <p className="admin-section-desc">Danh sách toàn bộ khách hàng và nhân viên.</p>
                  </div>
                  <button onClick={fetchData} className="admin-btn-refresh">🔄 Làm mới</button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên hiển thị</th>
                        <th>Email</th>
                        <th>Quyền (Role)</th>
                        <th>Đăng nhập qua</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="6" className="admin-empty-state">Đang tải dữ liệu Users...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan="6" className="admin-empty-state">Chưa có tài khoản nào.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id}>
                            <td><strong>{u.fullName || u.displayName}</strong></td>
                            <td className="admin-td-mono">{u.email}</td>
                            <td>
                              <span className={`admin-badge-car ${u.role === 'admin' ? 'admin-role-admin' : ''}`}>
                                {u.role?.toUpperCase() || 'USER'}
                              </span>
                            </td>
                            <td>{u.provider}</td>
                            <td className="admin-td-mono">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td>
                              <button className="btn-text-primary">Sửa</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Can>
        )}

        {/* ── 3. QUẢN LÝ ĐƠN HÀNG/THANH TOÁN ── */}
        {activeMenu === 'orders' && (
          <Can do="read" on="Order">
            <div className="admin-content">
              <div className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2 className="admin-section-title">Quản lý Thanh toán</h2>
                    <p className="admin-section-desc">Giao dịch mua xe, cọc xe và nâng cấp gói.</p>
                  </div>
                  <button onClick={fetchData} className="admin-btn-refresh">🔄 Làm mới</button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn (ID)</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm/Gói</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="6" className="admin-empty-state">Đang tải dữ liệu Thanh toán...</td></tr>
                      ) : orders.length === 0 ? (
                        <tr><td colSpan="6" className="admin-empty-state">Chưa có giao dịch nào.</td></tr>
                      ) : (
                        orders.map((o) => (
                          <tr key={o.id}>
                            <td className="admin-td-mono">{o.orderId}</td>
                            <td><strong>{o.customerName}</strong></td>
                            <td><span className="admin-badge-plan">{o.productName}</span></td>
                            <td className="admin-td-amount">{Number(o.amount).toLocaleString('vi-VN')} ₫</td>
                            <td>
                              <span className="admin-status" style={{ color: ROLE_COLORS[o.status], background: ROLE_COLORS[o.status] + '20' }}>
                                {ROLE_LABELS[o.status] || o.status}
                              </span>
                            </td>
                            <td className="admin-td-mono">{new Date(o.paymentDate).toLocaleString('vi-VN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Can>
        )}

        {/* ── 4. LỊCH LÁI THỬ ── */}
        {activeMenu === 'testdrives' && (
          <Can do="manage" on="TestDrive">
            <div className="admin-content">
              <div className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2 className="admin-section-title">Quản lý lịch lái thử</h2>
                    <p className="admin-section-desc">Xác nhận và sắp xếp lịch trải nghiệm xe cho khách hàng.</p>
                  </div>
                  <button onClick={fetchData} className="admin-btn-refresh">🔄 Làm mới</button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Xe / Gói</th>
                        <th>Thời gian</th>
                        <th>Showroom</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" className="admin-empty-state">Đang tải dữ liệu...</td></tr>
                      ) : testDrives.length === 0 ? (
                        <tr><td colSpan="7" className="admin-empty-state">Chưa có dữ liệu lịch lái thử.</td></tr>
                      ) : (
                        testDrives.map((t) => (
                          <tr key={t._id}>
                            <td className="admin-td-mono">{t.orderNumber}</td>
                            <td>
                              <strong>{t.userName || t.user}</strong><br/>
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>{t.phone}</span>
                            </td>
                            <td>
                              <span className="admin-badge-car">{t.cars?.join(', ') || t.car}</span><br/>
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>{t.planName}</span>
                            </td>
                            <td className="admin-td-mono">{new Date(t.scheduledAt).toLocaleString('vi-VN')}</td>
                            <td>{t.showroom}</td>
                            <td>
                              <span className="admin-status" style={{ color: ROLE_COLORS[t.status], background: ROLE_COLORS[t.status] + '20' }}>
                                {ROLE_LABELS[t.status] || t.status}
                              </span>
                            </td>
                            <td>
                              {t.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => handleUpdateStatus(t._id, 'confirmed')} className="btn-outline-success">Duyệt</button>
                                  <button onClick={() => handleUpdateStatus(t._id, 'cancelled')} className="btn-outline-danger">Hủy</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Can>
        )}
      </main>
    </div>
  );
}