import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Can, useAbility } from '../../hooks/useAbility';
import useCarStore from '../../store/useCarStore';
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
 
// ── Fake stats ──
const STATS = [
  { label: 'Tổng người dùng', value: '1,284',   delta: '+12%', icon: '👥', color: '#3b82f6' },
  { label: 'Đơn tháng này',   value: '₫842M',   delta: '+8%',  icon: '💳', color: '#22c55e' },
  { label: 'Lịch lái thử',    value: '47',       delta: '+23%', icon: '🚗', color: '#f59e0b' },
  { label: 'Gói Elite',       value: '23 users', delta: '+5%',  icon: '⭐', color: '#d4af37' },
];
 
const RECENT_ORDERS = [
  { id: 'ORD-001', user: 'Nguyễn Văn A', plan: 'Elite',   amount: '50.000.000₫', status: 'confirmed', date: '07/07/2026' },
  { id: 'ORD-002', user: 'Trần Thị B',   plan: 'Premium', amount: '25.000.000₫', status: 'pending',   date: '06/07/2026' },
  { id: 'ORD-003', user: 'Lê Văn C',     plan: 'Basic',   amount: '10.000.000₫', status: 'confirmed', date: '06/07/2026' },
  { id: 'ORD-004', user: 'Phạm Thị D',   plan: 'Elite',   amount: '50.000.000₫', status: 'cancelled', date: '05/07/2026' },
  { id: 'ORD-005', user: 'Hoàng Văn E',  plan: 'Premium', amount: '25.000.000₫', status: 'confirmed', date: '05/07/2026' },
];
 
const RECENT_TESTDRIVES = [
  { user: 'Nguyễn Văn A', car: 'GT3 RS', date: '10/07/2026 09:00', location: 'Hà Nội', status: 'confirmed' },
  { user: 'Trần Thị B',   car: '911 Turbo S', date: '11/07/2026 14:30', location: 'HCM', status: 'pending'   },
  { user: 'Lê Văn C',     car: 'GT3',    date: '12/07/2026 10:00', location: 'Đà Nẵng', status: 'confirmed' },
];
 
const ROLE_COLORS = { confirmed: '#22c55e', pending: '#f59e0b', cancelled: '#ef4444' };
const ROLE_LABELS = { confirmed: 'Đã xác nhận', pending: 'Chờ duyệt', cancelled: 'Đã hủy' };
 
export default function AdminDashboard() {
  const ability   = useAbility();
  const user      = useCarStore((s) => s.user ?? null);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  // Redirect nếu không có quyền
  if (!ability.can('read', 'Dashboard')) {
    return <Navigate to="/" replace />;
  }
 
  const visibleMenu = MENU_ITEMS.filter(item =>
    ability.can(item.action, item.subject)
  );
 
  return (
    <div className="admin-layout">
 
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="admin-sidebar-header">
          <span className="admin-logo">PORSCHE</span>
          <button className="admin-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
 
        {/* User info */}
        <div className="admin-user-info">
          <div className="admin-avatar">
            {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
          </div>
          {sidebarOpen && (
            <div>
              <p className="admin-user-name">{user?.fullName ?? 'Admin'}</p>
              <p className="admin-user-role">{user?.role ?? 'admin'}</p>
            </div>
          )}
        </div>
 
        {/* Menu */}
        <nav className="admin-nav">
          {visibleMenu.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="admin-nav-label">{item.label}</span>}
              {/* CASL badge — hiện role cần để truy cập */}
              {sidebarOpen && item.subject !== 'Dashboard' && (
                <span className="admin-nav-badge">
                  {item.action === 'manage' ? 'manage' : 'read'}
                </span>
              )}
            </button>
          ))}
        </nav>
 
        {/* CASL info */}
        {sidebarOpen && (
          <div className="admin-casl-info">
            <p className="admin-casl-title">🔐 CASL Permissions</p>
            <p className="admin-casl-role">Role: <strong>{user?.role ?? 'admin'}</strong></p>
            <p className="admin-casl-desc">
              Menu được lọc tự động theo quyền của role hiện tại.
            </p>
          </div>
        )}
      </aside>
 
      {/* ── Main content ── */}
      <main className="admin-main">
 
        {/* Topbar */}
        <header className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {visibleMenu.find(m => m.id === activeMenu)?.icon}{' '}
              {visibleMenu.find(m => m.id === activeMenu)?.label ?? 'Dashboard'}
            </h1>
            <p className="admin-breadcrumb">Admin / {visibleMenu.find(m => m.id === activeMenu)?.label}</p>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-date">07/07/2026</span>
          </div>
        </header>
 
        {/* ── Overview ── */}
        {activeMenu === 'overview' && (
          <div className="admin-content">
            {/* Stats */}
            <div className="admin-stats">
              {STATS.map((stat, i) => (
                <div key={i} className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: stat.color + '20', color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="admin-stat-label">{stat.label}</p>
                    <p className="admin-stat-value">{stat.value}</p>
                    <p className="admin-stat-delta" style={{ color: stat.color }}>{stat.delta} so với tháng trước</p>
                  </div>
                </div>
              ))}
            </div>
 
            {/* Recent orders */}
            <Can do="read" on="Order">
              <div className="admin-section">
                <h2 className="admin-section-title">Đơn hàng gần đây</h2>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th><th>Khách hàng</th><th>Gói</th>
                        <th>Số tiền</th><th>Ngày</th><th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RECENT_ORDERS.map((o) => (
                        <tr key={o.id}>
                          <td className="admin-td-mono">{o.id}</td>
                          <td>{o.user}</td>
                          <td><span className="admin-badge-plan">{o.plan}</span></td>
                          <td className="admin-td-amount">{o.amount}</td>
                          <td>{o.date}</td>
                          <td>
                            <span className="admin-status" style={{ color: ROLE_COLORS[o.status], background: ROLE_COLORS[o.status] + '20' }}>
                              {ROLE_LABELS[o.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Can>
 
            {/* Recent test drives */}
            <Can do="manage" on="TestDrive">
              <div className="admin-section">
                <h2 className="admin-section-title">Lịch lái thử sắp tới</h2>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Khách hàng</th><th>Xe</th><th>Thời gian</th><th>Showroom</th><th>Trạng thái</th></tr>
                    </thead>
                    <tbody>
                      {RECENT_TESTDRIVES.map((t, i) => (
                        <tr key={i}>
                          <td>{t.user}</td>
                          <td><span className="admin-badge-car">{t.car}</span></td>
                          <td className="admin-td-mono">{t.date}</td>
                          <td>{t.location}</td>
                          <td>
                            <span className="admin-status" style={{ color: ROLE_COLORS[t.status], background: ROLE_COLORS[t.status] + '20' }}>
                              {ROLE_LABELS[t.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Can>
          </div>
        )}
 
        {/* ── Roles page ── */}
        {activeMenu === 'roles' && (
          <Can do="manage" on="all">
            <div className="admin-content">
              <div className="admin-section">
                <h2 className="admin-section-title">Phân quyền hệ thống — CASL</h2>
                <p className="admin-section-desc">
                  Hệ thống phân quyền dùng thư viện <strong>CASL.js</strong> — định nghĩa trong{' '}
                  <code>src/abilities/ability.js</code>
                </p>
                <div className="admin-roles-grid">
                  {[
                    { role: 'user',    color: '#3b82f6', perms: ['read Car', 'configure Car', 'read Shop', 'purchase Shop', 'book TestDrive'] },
                    { role: 'dealer',  color: '#f59e0b', perms: ['manage Car', 'manage TestDrive', 'read User', 'read Order', 'read Dashboard'] },
                    { role: 'manager', color: '#8b5cf6', perms: ['manage Car', 'manage TestDrive', 'manage Order', 'update User', 'manage Shop', 'manage Dashboard'] },
                    { role: 'admin',   color: '#dc2626', perms: ['manage all — toàn quyền không giới hạn'] },
                  ].map((r) => (
                    <div key={r.role} className="admin-role-card" style={{ borderColor: r.color + '40' }}>
                      <div className="admin-role-header" style={{ background: r.color + '15' }}>
                        <span className="admin-role-badge" style={{ background: r.color }}>{r.role}</span>
                      </div>
                      <ul className="admin-role-perms">
                        {r.perms.map((p, i) => (
                          <li key={i}><code>{p}</code></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Can>
        )}
 
        {/* Placeholder cho các menu khác */}
        {!['overview', 'roles'].includes(activeMenu) && (
          <div className="admin-content admin-placeholder">
            <div className="admin-placeholder-inner">
              <span style={{ fontSize: 48 }}>
                {visibleMenu.find(m => m.id === activeMenu)?.icon}
              </span>
              <h2>{visibleMenu.find(m => m.id === activeMenu)?.label}</h2>
              <p>Tính năng đang phát triển — sẽ tích hợp với MongoDB backend.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}