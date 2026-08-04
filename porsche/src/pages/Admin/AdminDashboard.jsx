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

const ROLE_COLORS = { 
  confirmed: '#059669', 
  paid: '#10b981', 
  upcoming: '#3b82f6', 
  pending: '#d97706', 
  pending_payment: '#f59e0b', 
  awaiting_cash: '#f97316', 
  cancelled: '#dc2626', 
  completed: '#6366f1' 
};

const ROLE_LABELS = { 
  confirmed: 'Đã xác nhận', 
  paid: 'Đã thanh toán', 
  upcoming: '⚡ Sắp tới (Lái thử)', 
  pending: 'Chờ duyệt', 
  pending_payment: 'Chờ thanh toán', 
  awaiting_cash: 'Chờ thu tiền mặt', 
  cancelled: 'Đã hủy', 
  completed: 'Hoàn thành' 
};

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

  // Quản lý các ID đơn hàng bị Ẩn (Soft Delete — Không xóa khỏi CSDL)
  const [hiddenOrderIds, setHiddenOrderIds] = useState(() => {
    try {
      const saved = localStorage.getItem('porsche_admin_hidden_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Modal Sửa User ──
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', role: 'user', phone: '' });

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
        setUsers(Array.isArray(res) ? res : res?.data || res || []);
      } 
      else if (activeMenu === 'orders' && ability.can('read', 'Order')) {
        const res = await adminAPI.getAllOrders();
        setOrders(Array.isArray(res) ? res : res?.data || res || []);
      } 
      else if (activeMenu === 'testdrives' && ability.can('manage', 'TestDrive')) {
        const res = await adminAPI.getAllTestDrives();
        setTestDrives(Array.isArray(res) ? res : res?.data || res || []);
      }
    } catch (error) {
      console.error(`Lỗi tải dữ liệu cho tab ${activeMenu}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeMenu, ability]);

  // ── Quản lý Gói Subscription (CRUD với LocalStorage) ──
  const DEFAULT_PACKAGES = [
    { id: 'essential', name: 'Essential', car: 'Porsche 911 GT3', duration: '60 phút', features: '1 buổi lái thử 60 phút, Xe Porsche 911 GT3, Huấn luyện viên đi kèm, Bảo hiểm TNDS cơ bản, Chứng chỉ lái thử', price: 50000000, status: 'Đang mở bán' },
    { id: 'performance', name: 'Performance', car: 'Porsche 911 GT3 RS', duration: '90 phút', features: '2 buổi lái thử 90 phút, Toàn bộ dòng xe, Huấn luyện viên chuyên nghiệp, Bảo hiểm tiêu chuẩn, Video HD + ảnh kỷ niệm, Lái thử trên track đua', price: 75000000, status: 'Đang mở bán' },
    { id: 'elite', name: 'Elite', car: 'Porsche 911 Turbo S', duration: 'Trọn ngày', features: 'Lái thử trọn ngày (8 giờ), Toàn bộ dòng xe không giới hạn, HLV cá nhân Porsche Sport Driving School, Bảo hiểm cao cấp, Video onboard + drone footage, VIP lounge', price: 100000000, status: 'Đang mở bán' },
  ];

  const [packages, setPackages] = useState(() => {
    try {
      const saved = localStorage.getItem('porsche_admin_packages');
      return saved ? JSON.parse(saved) : DEFAULT_PACKAGES;
    } catch {
      return DEFAULT_PACKAGES;
    }
  });

  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    name: '', car: 'Porsche 911 GT3 RS', duration: '', features: '', price: '', status: 'Đang mở bán'
  });

  const savePackagesToStorage = (updatedList) => {
    setPackages(updatedList);
    localStorage.setItem('porsche_admin_packages', JSON.stringify(updatedList));
  };

  const handleOpenAddPkg = () => {
    setEditingPkg(null);
    setPkgForm({ name: '', car: 'Porsche 911 GT3 RS', duration: '', features: '', price: '', status: 'Đang mở bán' });
    setShowPkgModal(true);
  };

  const handleOpenEditPkg = (pkg) => {
    setEditingPkg(pkg);
    setPkgForm({ ...pkg });
    setShowPkgModal(true);
  };

  const handleDeletePkg = (pkgId) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói trải nghiệm này?')) return;
    const updated = packages.filter(p => p.id !== pkgId);
    savePackagesToStorage(updated);
  };

  const handleSavePkgSubmit = (e) => {
    e.preventDefault();
    if (!pkgForm.name || !pkgForm.price) {
      alert('Vui lòng điền đầy đủ tên gói và giá!');
      return;
    }

    if (editingPkg) {
      const updated = packages.map(p => p.id === editingPkg.id ? { ...p, ...pkgForm, price: Number(pkgForm.price) } : p);
      savePackagesToStorage(updated);
    } else {
      const newPkg = {
        id: Date.now(),
        ...pkgForm,
        price: Number(pkgForm.price)
      };
      savePackagesToStorage([...packages, newPkg]);
    }
    setShowPkgModal(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!ability.can('read', 'Dashboard')) {
    return <Navigate to="/" replace />;
  }

  const handleUpdateStatus = async (id, newStatus) => {
    if(!window.confirm(`Xác nhận chuyển trạng thái thành: ${ROLE_LABELS[newStatus] || newStatus}?`)) return;
    try {
      await adminAPI.updateTestDriveStatus(id, newStatus);
      fetchData();
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  // Hàm ẩn đơn hàng (Soft Delete không ảnh hưởng tới DB)
  const handleHideOrder = (orderId) => {
    if (!window.confirm('Bạn có chắc muốn ẩn đơn hàng này khỏi danh sách Admin?\n(Lưu ý: Thao tác này chỉ ẩn trên danh sách, dữ liệu trong CSDL MySQL hoàn toàn được giữ nguyên).')) return;
    const updated = [...hiddenOrderIds, orderId];
    setHiddenOrderIds(updated);
    localStorage.setItem('porsche_admin_hidden_orders', JSON.stringify(updated));
  };

  const handleResetHiddenOrders = () => {
    setHiddenOrderIds([]);
    localStorage.removeItem('porsche_admin_hidden_orders');
  };

  // ── Handlers cho User CRUD ──
  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ fullName: u.fullName || '', email: u.email || '', role: u.role || 'user', phone: u.phone || '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    // Cập nhật local state (frontend-only vì chưa có endpoint PUT /admin/users/:id)
    setUsers(prev => prev.map(u =>
      u._id === editingUser._id ? { ...u, ...userForm } : u
    ));
    setShowUserModal(false);
    alert('✅ Đã cập nhật thông tin người dùng!');
  };

  const handleDeleteUser = (u) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${u.fullName || u.email}" khỏi danh sách?\n(Chỉ ẩn khỏi giao diện, dữ liệu MongoDB vẫn được giữ nguyên)`)) return;
    setUsers(prev => prev.filter(user => user._id !== u._id));
  };

  // Tính toán tự động trạng thái 'Sắp tới' dựa trên ngày chạy thử
  const getEffectiveOrderStatus = (order) => {
    if (order.status === 'cancelled' || order.status === 'completed') return order.status;
    if (order.driveDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const target = new Date(order.driveDate);
      target.setHours(0,0,0,0);
      const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) {
        return 'upcoming';
      }
    }
    return order.status;
  };

  // Lọc các đơn không bị ẩn
  const displayOrders = orders.filter(o => !hiddenOrderIds.includes(o.id));

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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchData} className="admin-btn-refresh">🔄 Làm mới</button>
                  </div>
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
                            <td>{u.authProvider || u.provider || '—'}</td>
                            <td className="admin-td-mono">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn-text-primary"
                                  onClick={() => handleOpenEditUser(u)}
                                >✏️ Sửa</button>
                                <button
                                  className="btn-outline-danger"
                                  style={{ fontSize: '12px', padding: '4px 10px' }}
                                  onClick={() => handleDeleteUser(u)}
                                >🗑️ Xóa</button>
                              </div>
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
                    <h2 className="admin-section-title">Quản lý Đơn Hàng & Lái Thử</h2>
                    <p className="admin-section-desc">Theo dõi đơn hàng, chuyển trạng thái và quản lý danh sách.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {hiddenOrderIds.length > 0 && (
                      <button onClick={handleResetHiddenOrders} className="admin-btn-refresh" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                        👁️ Hiện {hiddenOrderIds.length} đơn đã ẩn
                      </button>
                    )}
                    <button onClick={fetchData} className="admin-btn-refresh">🔄 Làm mới</button>
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn (ID)</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm / Gói</th>
                        <th>Tổng tiền</th>
                        <th>Ngày lái thử</th>
                        <th>Chuyển Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" className="admin-empty-state">Đang tải dữ liệu Thanh toán...</td></tr>
                      ) : displayOrders.length === 0 ? (
                        <tr><td colSpan="7" className="admin-empty-state">Chưa có giao dịch nào (hoặc đã ẩn toàn bộ).</td></tr>
                      ) : (
                        displayOrders.map((o) => {
                          const statusKey = getEffectiveOrderStatus(o);
                          return (
                            <tr key={o.id}>
                              <td className="admin-td-mono">#{o.orderId}</td>
                              <td>
                                <strong>{o.customerName}</strong><br/>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>{o.phone || o.showroom}</span>
                              </td>
                              <td><span className="admin-badge-plan">{o.productName || 'Porsche Plan'}</span></td>
                              <td className="admin-td-amount">{Number(o.amount).toLocaleString('vi-VN')} ₫</td>
                              <td className="admin-td-mono">
                                {o.driveDate ? (
                                  <div>
                                    <span style={{ color: statusKey === 'upcoming' ? '#2563eb' : '#0f172a', fontWeight: statusKey === 'upcoming' ? 'bold' : '600' }}>
                                      {new Date(o.driveDate).toLocaleDateString('vi-VN')}
                                    </span>
                                    {o.driveTime && <div style={{ fontSize: '11px', color: '#64748b' }}>{o.driveTime}</div>}
                                  </div>
                                ) : (
                                  <span style={{ color: '#94a3b8' }}>Chưa xếp ngày</span>
                                )}
                              </td>
                              <td>
                                <select
                                  value={statusKey}
                                  onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                  style={{
                                    background: '#ffffff',
                                    color: ROLE_COLORS[statusKey] || '#0f172a',
                                    border: `1px solid ${ROLE_COLORS[statusKey] || '#cbd5e1'}`,
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="pending_payment" style={{ background: '#ffffff', color: '#d97706' }}>Chờ thanh toán</option>
                                  <option value="awaiting_cash" style={{ background: '#ffffff', color: '#ea580c' }}>Chờ thu tiền mặt</option>
                                  <option value="paid" style={{ background: '#ffffff', color: '#16a34a' }}>Đã thanh toán</option>
                                  <option value="upcoming" style={{ background: '#ffffff', color: '#2563eb' }}>⚡ Sắp tới (Lái thử)</option>
                                  <option value="completed" style={{ background: '#ffffff', color: '#4f46e5' }}>Hoàn thành</option>
                                  <option value="cancelled" style={{ background: '#ffffff', color: '#dc2626' }}>Đã hủy</option>
                                </select>
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleHideOrder(o.id)}
                                  className="btn-outline-danger"
                                  title="Ẩn đơn khỏi giao diện (Giữ nguyên CSDL)"
                                >
                                  🗑️ Xóa (Ẩn)
                                </button>
                              </td>
                            </tr>
                          );
                        })
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
                              <select
                                value={t.status}
                                onChange={(e) => handleUpdateStatus(t._id, e.target.value)}
                                style={{
                                  background: '#ffffff',
                                  color: ROLE_COLORS[t.status] || '#0f172a',
                                  border: `1px solid ${ROLE_COLORS[t.status] || '#cbd5e1'}`,
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  minWidth: '130px'
                                }}
                              >
                                <option value="pending">Chờ duyệt</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="paid">Đã thanh toán</option>
                                <option value="upcoming">⚡ Sắp tới</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
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

        {/* ── 5. QUẢN LÝ XE ── */}
        {activeMenu === 'cars' && (
          <Can do="manage" on="Car">
            <div className="admin-content">
              <div className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2 className="admin-section-title">Danh mục Dòng xe</h2>
                    <p className="admin-section-desc">Cấu hình thông số và màu sắc các mẫu xe Showroom 3D.</p>
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên dòng xe</th>
                        <th>Động cơ / Mã lực</th>
                        <th>Tốc độ tối đa</th>
                        <th>Tăng tốc (0-100km/h)</th>
                        <th>Giá niêm yết</th>
                        <th>Trạng thái 3D</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Porsche 911 GT3 RS</strong></td>
                        <td>4.0L Atmospheric / 525 HP</td>
                        <td>296 km/h</td>
                        <td>3.2s</td>
                        <td className="admin-td-amount">15.830.000.000 ₫</td>
                        <td><span className="admin-badge-car">Sẵn sàng (Active)</span></td>
                      </tr>
                      <tr>
                        <td><strong>Porsche 911 GT3</strong></td>
                        <td>4.0L Flat-6 / 510 HP</td>
                        <td>318 km/h</td>
                        <td>3.4s</td>
                        <td className="admin-td-amount">13.600.000.000 ₫</td>
                        <td><span className="admin-badge-car">Sẵn sàng (Active)</span></td>
                      </tr>
                      <tr>
                        <td><strong>Porsche 911 Turbo S</strong></td>
                        <td>3.8L Twin-Turbo / 650 HP</td>
                        <td>330 km/h</td>
                        <td>2.7s</td>
                        <td className="admin-td-amount">17.380.000.000 ₫</td>
                        <td><span className="admin-badge-car">Sẵn sàng (Active)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Can>
        )}

        {/* ── 6. GÓI SUBSCRIPTION (HỖ TRỢ THÊM / SỬA / XÓA) ── */}
        {activeMenu === 'shop' && (
          <Can do="manage" on="Shop">
            <div className="admin-content">
              <div className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2 className="admin-section-title">Quản lý Gói Trải Nghiệm & Subscription</h2>
                    <p className="admin-section-desc">Danh sách các gói đăng ký trải nghiệm xe Porsche.</p>
                  </div>
                  <button onClick={handleOpenAddPkg} className="admin-btn-refresh" style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}>
                    ➕ Thêm gói mới
                  </button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên gói</th>
                        <th>Dòng xe hỗ trợ</th>
                        <th>Thời lượng</th>
                        <th>Dịch vụ kèm theo</th>
                        <th>Giá niêm yết</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.length === 0 ? (
                        <tr><td colSpan="7" className="admin-empty-state">Chưa có gói trải nghiệm nào. Bấm nút Thêm gói mới để tạo.</td></tr>
                      ) : (
                        packages.map((p) => (
                          <tr key={p.id}>
                            <td><strong>{p.name}</strong></td>
                            <td><span className="admin-badge-car">{p.car}</span></td>
                            <td>{p.duration}</td>
                            <td style={{ maxWidth: '220px', fontSize: '13px' }}>{p.features}</td>
                            <td className="admin-td-amount">{Number(p.price).toLocaleString('vi-VN')} ₫</td>
                            <td>
                              <span className="admin-status" style={{ color: p.status === 'Đang mở bán' ? '#16a34a' : '#dc2626', background: p.status === 'Đang mở bán' ? '#f0fdf4' : '#fef2f2' }}>
                                {p.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleOpenEditPkg(p)} className="btn-outline-success">✏️ Sửa</button>
                                <button onClick={() => handleDeletePkg(p.id)} className="btn-outline-danger">🗑️ Xóa</button>
                              </div>
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

        {/* ── 7. PHÂN QUYỀN HỆ THỐNG ── */}
        {activeMenu === 'roles' && (
          <Can do="manage" on="all">
            <div className="admin-content">
              <div className="admin-section">
                <div className="admin-section-header">
                  <div>
                    <h2 className="admin-section-title">Phân Quyền Vai Trò (Ma Trận CASL / RBAC)</h2>
                    <p className="admin-section-desc">Cấu hình quyền hạn truy cập các chức năng cho từng cấp độ người dùng.</p>
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Vai trò (Role)</th>
                        <th>Mô tả cấp bậc</th>
                        <th>Quyền Dashboard</th>
                        <th>Quyền Quản lý User</th>
                        <th>Quyền Đơn hàng</th>
                        <th>Quyền Lịch lái thử / Car</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="admin-badge-car admin-role-admin">SUPER ADMIN</span></td>
                        <td>Quản trị viên toàn quyền hệ thống</td>
                        <td><span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Read / Manage</span></td>
                        <td><span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Read / Manage</span></td>
                        <td><span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Read / Manage</span></td>
                        <td><span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Read / Manage</span></td>
                      </tr>
                      <tr>
                        <td><span className="admin-badge-car" style={{ background: '#3b82f620', color: '#60a5fa' }}>DEALER MANAGER</span></td>
                        <td>Quản lý đại lý showroom</td>
                        <td><span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Read</span></td>
                        <td><span style={{ color: '#dc2626' }}>✕ Restricted</span></td>
                        <td><span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Read / Confirm</span></td>
                        <td><span style={{ color: '#059669', fontWeight: 'bold' }}>✓ Read / Manage</span></td>
                      </tr>
                      <tr>
                        <td><span className="admin-badge-car">CUSTOMER / USER</span></td>
                        <td>Khách hàng đăng ký tài khoản</td>
                        <td><span style={{ color: '#dc2626' }}>✕ Restricted</span></td>
                        <td><span style={{ color: '#dc2626' }}>✕ Restricted</span></td>
                        <td><span style={{ color: '#9ca3af' }}>Chỉ xem đơn của mình</span></td>
                        <td><span style={{ color: '#9ca3af' }}>Chỉ xem & đặt lịch</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Can>
        )}
      </main>

      {/* ── MODAL THÊM / SỬA GÓI SUBSCRIPTION ── */}
      {showPkgModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0',
            width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {editingPkg ? 'Chỉnh sửa Gói Trải Nghiệm' : 'Thêm Gói Trải Nghiệm Mới'}
              </h3>
              <button onClick={() => setShowPkgModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleSavePkgSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', mb: '4px' }}>Tên gói</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Track Performance Ultimate"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', mb: '4px' }}>Dòng xe hỗ trợ</label>
                <select
                  value={pkgForm.car}
                  onChange={(e) => setPkgForm({ ...pkgForm, car: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                >
                  <option value="Porsche 911 GT3 RS">Porsche 911 GT3 RS</option>
                  <option value="Porsche 911 GT3">Porsche 911 GT3</option>
                  <option value="Porsche 911 Turbo S">Porsche 911 Turbo S</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', mb: '4px' }}>Thời lượng</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 2 ngày (Trường đua)"
                  value={pkgForm.duration}
                  onChange={(e) => setPkgForm({ ...pkgForm, duration: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', mb: '4px' }}>Dịch vụ kèm theo</label>
                <input
                  type="text"
                  placeholder="VD: Huấn luyện viên đua, Lốp chuyên dụng"
                  value={pkgForm.features}
                  onChange={(e) => setPkgForm({ ...pkgForm, features: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', mb: '4px' }}>Giá niêm yết (VNĐ)</label>
                <input
                  type="number"
                  required
                  placeholder="45000000"
                  value={pkgForm.price}
                  onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', mb: '4px' }}>Trạng thái</label>
                <select
                  value={pkgForm.status}
                  onChange={(e) => setPkgForm({ ...pkgForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                >
                  <option value="Đang mở bán">Đang mở bán</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowPkgModal(false)} className="admin-btn-refresh">Hủy</button>
                <button type="submit" className="admin-btn-refresh" style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}>
                  {editingPkg ? 'Lưu cập nhật' : 'Tạo gói mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          MODAL SỬA NGƯỜI DÙNG
      ══════════════════════════════ */}
      {showUserModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                ✏️ Chỉnh sửa người dùng
              </h3>
              <button onClick={() => setShowUserModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#64748b'
              }}>✕</button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', background: '#f8fafc', color: '#64748b' }}
                  readOnly
                />
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>Email không thể thay đổi để bảo mật tài khoản</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="09xx xxx xxx"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Quyền (Role)
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="user">User — Khách hàng</option>
                  <option value="admin">Admin — Quản trị viên</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="admin-btn-refresh">Hủy</button>
                <button type="submit" className="admin-btn-refresh" style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
                  💾 Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}