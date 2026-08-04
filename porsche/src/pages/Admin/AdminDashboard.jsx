import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Can, useAbility } from '../../hooks/useAbility';
import useCarStore from '../../store/useCarStore';
import { adminAPI } from '../../services/api';

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

  const handleUpdateUserRole = (userId, newRole) => {
    if (!window.confirm(`Xác nhận cập nhật quyền cho người dùng này?`)) return;
    setUsers(prev => prev.map(u => 
      u._id === userId ? { ...u, role: newRole } : u
    ));
  };

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

  const displayOrders = orders.filter(o => !hiddenOrderIds.includes(o.id));

  // Thống nhất các Tailwind Classes dùng chung
  const btnRefreshClass = "inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg cursor-pointer text-[13px] font-bold transition-all shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-50";
  const btnSuccessClass = "inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-emerald-100 hover:text-emerald-800 hover:-translate-y-px shadow-sm active:scale-95";
  const btnDangerClass = "inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-red-100 hover:text-red-800 hover:-translate-y-px shadow-sm active:scale-95";
  const btnPrimaryClass = "inline-flex items-center gap-1 text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-blue-100 hover:text-blue-700 hover:-translate-y-px shadow-sm active:scale-95";
  
  const thClass = "px-5 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left whitespace-nowrap";
  const tdClass = "px-5 py-4 border-b border-slate-100 align-middle text-slate-800 transition-colors group-hover:bg-slate-50/70";
  const tableWrapClass = "bg-white border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto shadow-sm";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-red-200 selection:text-red-900 relative">
      {/* ── Bầu trời Pattern Mờ ảo ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-50 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-[100px]"></div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 sticky top-0 h-screen overflow-y-auto overflow-x-hidden shrink-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.02)] ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 min-h-[72px]">
          <Link to="/" className="text-decoration-none focus:outline-none">
            <div className={`text-[18px] font-black tracking-[0.2em] text-slate-900 whitespace-nowrap overflow-hidden transition-colors hover:text-red-600 ${!sidebarOpen && 'opacity-0 w-0'}`}>
              PORSCHE
            </div>
          </Link>
          <button 
            className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-[10px] flex items-center justify-center shrink-0 cursor-pointer transition-all hover:bg-red-600 hover:border-red-600 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-4 py-4 mx-3 mt-4 mb-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="w-[40px] h-[40px] rounded-lg bg-gradient-to-br from-red-600 to-orange-500 text-white text-sm font-black flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(220,38,38,0.3)]">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-bold text-slate-900 truncate">{user?.displayName || 'ADMIN'}</div>
              <div className="text-[10px] text-red-600 uppercase tracking-widest font-bold mt-0.5">{user?.role || 'Super Admin'}</div>
            </div>
          </div>
        )}

        <div className={`text-[10px] font-black tracking-[0.15em] text-slate-400 px-5 pt-4 pb-2 transition-opacity ${!sidebarOpen && 'opacity-0'}`}>
          MENU
        </div>

        <nav className="flex-1 px-3 py-2 flex flex-col gap-1.5">
          {visibleMenu.map(item => {
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-[13.5px] font-semibold cursor-pointer transition-all w-full text-left whitespace-nowrap relative outline-none focus-visible:ring-2 focus-visible:ring-red-500 group ${
                  isActive 
                    ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-red-600 rounded-r-md"></div>
                )}
                <span className={`text-[18px] shrink-0 w-6 text-center transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        <header className="flex items-center justify-between px-8 h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200 shrink-0 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {MENU_ITEMS.find(m => m.id === activeMenu)?.label || 'Dashboard'}
            </h1>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              Admin / <span className="text-slate-800">{MENU_ITEMS.find(m => m.id === activeMenu)?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-slate-700 font-bold bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <span className="text-[14px]">📅</span> {new Date().toLocaleDateString('vi-VN')}
          </div>
        </header>

        {/* ── 1. GIAO DIỆN TAB TỔNG QUAN ── */}
        {activeMenu === 'overview' && (
          <div className="p-8 flex-1 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-[18px] font-extrabold text-slate-900 mb-1 tracking-tight">Tổng quan hệ thống</h2>
                  <p className="text-[13px] text-slate-500 font-medium">Theo dõi các chỉ số và dữ liệu quan trọng của Porsche.</p>
                </div>
                <button onClick={fetchData} className={btnRefreshClass}>🔄 Làm mới</button>
              </div>
              
              {loading ? (
                <div className="text-center p-12 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200 border-dashed">Đang tải dữ liệu tổng quan...</div>
              ) : stats.length === 0 ? (
                <div className="text-center p-12 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200 border-dashed">Chưa có dữ liệu thống kê từ Server.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] shrink-0 shadow-sm" style={{ color: stat.color, background: stat.bg }}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 mb-1.5 font-extrabold uppercase tracking-widest">{stat.label}</div>
                        <div className="text-[28px] font-black text-slate-900 mb-1 tracking-tight leading-none">{stat.value}</div>
                        <div className="text-[12px] font-bold text-emerald-600 flex items-center gap-1 mt-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                          {stat.delta} <span className="text-slate-400 font-medium ml-1">so với tháng trước</span>
                        </div>
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
            <div className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-slate-900 mb-1 tracking-tight">Quản lý Tài Khoản</h2>
                    <p className="text-[13px] text-slate-500 font-medium">Danh sách khách hàng đăng ký và nhân viên hệ thống.</p>
                  </div>
                  <button onClick={fetchData} className={btnRefreshClass}>🔄 Làm mới</button>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[850px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className={thClass}>Tên hiển thị</th>
                        <th className={thClass}>Email</th>
                        <th className={thClass}>Quyền (Role)</th>
                        <th className={thClass}>Đăng nhập</th>
                        <th className={thClass}>Ngày tạo</th>
                        <th className={thClass}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="6" className="text-center p-12 text-slate-500 text-sm border-dashed">Đang tải dữ liệu Users...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan="6" className="text-center p-12 text-slate-500 text-sm border-dashed">Chưa có tài khoản nào.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id} className="group transition-colors">
                            <td className={tdClass}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                  {(u.fullName || u.displayName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <strong className="text-slate-900">{u.fullName || u.displayName}</strong>
                              </div>
                            </td>
                            <td className={`${tdClass} font-mono text-[13px] text-slate-500`}>{u.email}</td>
                            <td className={tdClass}>
                              <select
                                value={u.role || 'user'}
                                onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold border outline-none cursor-pointer tracking-wide transition-colors focus:ring-2 focus:ring-slate-200 ${
                                  u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' : 
                                  u.role === 'dealer_manager' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                <option value="user" className="bg-white text-slate-700">USER / KHÁCH HÀNG</option>
                                <option value="dealer_manager" className="bg-white text-slate-700">DEALER MANAGER</option>
                                <option value="admin" className="bg-white text-slate-700">SUPER ADMIN</option>
                              </select>
                            </td>
                            <td className={tdClass}>
                              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-500">
                                {u.authProvider || u.provider || 'Email'}
                              </span>
                            </td>
                            <td className={`${tdClass} font-mono text-[13px] text-slate-500`}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className={tdClass}>
                              <div className="flex gap-2">
                                <button className={btnPrimaryClass} onClick={() => handleOpenEditUser(u)}>✏️ Sửa</button>
                                <button className={btnDangerClass} onClick={() => handleDeleteUser(u)}>🗑️ Xóa</button>
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
            <div className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-slate-900 mb-1 tracking-tight">Quản lý Đơn Hàng & Lái Thử</h2>
                    <p className="text-[13px] text-slate-500 font-medium">Theo dõi các giao dịch tài chính và đặt cọc xe.</p>
                  </div>
                  <div className="flex gap-2">
                    {hiddenOrderIds.length > 0 && (
                      <button onClick={handleResetHiddenOrders} className={`${btnRefreshClass} !text-red-500 !border-red-200 hover:!bg-red-50`}>
                        👁️ Hiện {hiddenOrderIds.length} đơn đã ẩn
                      </button>
                    )}
                    <button onClick={fetchData} className={btnRefreshClass}>🔄 Làm mới</button>
                  </div>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className={thClass}>Mã đơn</th>
                        <th className={thClass}>Khách hàng</th>
                        <th className={thClass}>Sản phẩm / Gói</th>
                        <th className={thClass}>Tổng tiền</th>
                        <th className={thClass}>Lịch chạy</th>
                        <th className={thClass}>Trạng thái đơn</th>
                        <th className={thClass}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" className="text-center p-12 text-slate-500 text-sm border-dashed">Đang tải dữ liệu...</td></tr>
                      ) : displayOrders.length === 0 ? (
                        <tr><td colSpan="7" className="text-center p-12 text-slate-500 text-sm border-dashed">Chưa có giao dịch nào.</td></tr>
                      ) : (
                        displayOrders.map((o) => {
                          const statusKey = getEffectiveOrderStatus(o);
                          return (
                            <tr key={o.id} className="group transition-colors">
                              <td className={`${tdClass} font-mono text-[13px] font-medium text-slate-600`}>#{o.orderId}</td>
                              <td className={tdClass}>
                                <div className="font-bold text-slate-900">{o.customerName}</div>
                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{o.phone || o.showroom}</div>
                              </td>
                              <td className={tdClass}>
                                <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-200/50 rounded-md text-[11.5px] font-bold shadow-sm">
                                  {o.productName || 'Porsche Plan'}
                                </span>
                              </td>
                              <td className={`${tdClass} font-black text-red-600 tracking-tight text-[15px]`}>{Number(o.amount).toLocaleString('vi-VN')} ₫</td>
                              <td className={`${tdClass} font-mono`}>
                                {o.driveDate ? (
                                  <div>
                                    <div className={`${statusKey === 'upcoming' ? 'text-blue-600 font-bold' : 'text-slate-700 font-semibold'} text-[13px]`}>
                                      {new Date(o.driveDate).toLocaleDateString('vi-VN')}
                                    </div>
                                    {o.driveTime && <div className="text-[11px] text-slate-500 font-medium mt-0.5">{o.driveTime}</div>}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[12.5px]">Chưa xếp lịch</span>
                                )}
                              </td>
                              <td className={tdClass}>
                                <select
                                  value={statusKey}
                                  onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                  className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold border outline-none cursor-pointer tracking-wide shadow-sm focus:ring-2 focus:ring-slate-200 transition-colors"
                                  style={{
                                    color: ROLE_COLORS[statusKey] || '#0f172a',
                                    backgroundColor: `${ROLE_COLORS[statusKey]}10`,
                                    borderColor: `${ROLE_COLORS[statusKey]}30`
                                  }}
                                >
                                  <option value="pending_payment" className="bg-white text-amber-600">CHỜ THANH TOÁN</option>
                                  <option value="awaiting_cash" className="bg-white text-orange-600">CHỜ THU TIỀN</option>
                                  <option value="paid" className="bg-white text-emerald-600">ĐÃ THANH TOÁN</option>
                                  <option value="upcoming" className="bg-white text-blue-600">⚡ SẮP TỚI</option>
                                  <option value="completed" className="bg-white text-indigo-600">HOÀN THÀNH</option>
                                  <option value="cancelled" className="bg-white text-red-600">ĐÃ HỦY</option>
                                </select>
                              </td>
                              <td className={tdClass}>
                                <button onClick={() => handleHideOrder(o.id)} className={btnDangerClass}>
                                  🗑️ Ẩn đơn
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
            <div className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-slate-900 mb-1 tracking-tight">Quản lý lịch lái thử</h2>
                    <p className="text-[13px] text-slate-500 font-medium">Sắp xếp, phê duyệt lịch hẹn lái thử từ khách hàng.</p>
                  </div>
                  <button onClick={fetchData} className={btnRefreshClass}>🔄 Làm mới</button>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className={thClass}>Mã đơn</th>
                        <th className={thClass}>Khách hàng</th>
                        <th className={thClass}>Xe đăng ký</th>
                        <th className={thClass}>Thời gian</th>
                        <th className={thClass}>Showroom</th>
                        <th className={thClass}>Trạng thái hiện tại</th>
                        <th className={thClass}>Đổi trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" className="text-center p-12 text-slate-500 text-sm border-dashed">Đang tải dữ liệu...</td></tr>
                      ) : testDrives.length === 0 ? (
                        <tr><td colSpan="7" className="text-center p-12 text-slate-500 text-sm border-dashed">Chưa có lịch hẹn nào.</td></tr>
                      ) : (
                        testDrives.map((t) => (
                          <tr key={t._id} className="group transition-colors">
                            <td className={`${tdClass} font-mono text-[13px] font-medium text-slate-600`}>{t.orderNumber}</td>
                            <td className={tdClass}>
                              <div className="font-bold text-slate-900">{t.userName || t.user}</div>
                              <div className="text-[11px] text-slate-500 font-medium mt-0.5">{t.phone}</div>
                            </td>
                            <td className={tdClass}>
                              <span className="inline-flex items-center px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11.5px] font-semibold text-slate-700">
                                {t.cars?.join(', ') || t.car}
                              </span>
                              <div className="text-[11px] text-slate-500 font-medium mt-1">{t.planName}</div>
                            </td>
                            <td className={`${tdClass} font-mono text-[13px] font-semibold text-slate-700`}>{new Date(t.scheduledAt).toLocaleString('vi-VN')}</td>
                            <td className={`${tdClass} text-[13px] font-medium text-slate-700`}>{t.showroom}</td>
                            <td className={tdClass}>
                              <span 
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold tracking-wide shadow-sm"
                                style={{ color: ROLE_COLORS[t.status], backgroundColor: `${ROLE_COLORS[t.status]}15`, border: `1px solid ${ROLE_COLORS[t.status]}30` }}
                              >
                                {ROLE_LABELS[t.status] || t.status?.toUpperCase()}
                              </span>
                            </td>
                            <td className={tdClass}>
                              <select
                                value={t.status}
                                onChange={(e) => handleUpdateStatus(t._id, e.target.value)}
                                className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold border outline-none cursor-pointer tracking-wide transition-colors focus:ring-2 focus:ring-slate-200"
                                style={{
                                  color: ROLE_COLORS[t.status] || '#0f172a',
                                  borderColor: ROLE_COLORS[t.status] || '#cbd5e1'
                                }}
                              >
                                <option value="pending" className="text-amber-600">Chờ duyệt</option>
                                <option value="confirmed" className="text-emerald-600">Đã xác nhận</option>
                                <option value="paid" className="text-emerald-600">Đã thanh toán</option>
                                <option value="upcoming" className="text-blue-600">⚡ Sắp tới</option>
                                <option value="completed" className="text-indigo-600">Hoàn thành</option>
                                <option value="cancelled" className="text-red-600">Đã hủy</option>
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
            <div className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 max-w-7xl mx-auto w-full">
                <div className="mb-6">
                  <h2 className="text-[18px] font-extrabold text-slate-900 mb-1 tracking-tight">Danh mục Dòng xe</h2>
                  <p className="text-[13px] text-slate-500 font-medium">Cấu hình thông số các mẫu xe trải nghiệm 3D Showroom.</p>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[700px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className={thClass}>Tên dòng xe</th>
                        <th className={thClass}>Động cơ / Mã lực</th>
                        <th className={thClass}>Tốc độ tối đa</th>
                        <th className={thClass}>0-100km/h</th>
                        <th className={thClass}>Giá niêm yết</th>
                        <th className={thClass}>Trạng thái 3D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Porsche 911 GT3 RS', 'Porsche 911 GT3', 'Porsche 911 Turbo S'].map((carName, idx) => (
                        <tr key={idx} className="group transition-colors">
                          <td className={tdClass}>
                            <strong className="text-slate-900">{carName}</strong>
                          </td>
                          <td className={`${tdClass} text-slate-600`}>
                            {idx === 0 ? '4.0L Atmospheric / 525 HP' : idx === 1 ? '4.0L Flat-6 / 510 HP' : '3.8L Twin-Turbo / 650 HP'}
                          </td>
                          <td className={`${tdClass} font-mono text-[13px] font-medium text-slate-600`}>
                            {idx === 0 ? '296 km/h' : idx === 1 ? '318 km/h' : '330 km/h'}
                          </td>
                          <td className={`${tdClass} font-mono text-[13px] font-medium text-slate-600`}>
                            {idx === 0 ? '3.2s' : idx === 1 ? '3.4s' : '2.7s'}
                          </td>
                          <td className={`${tdClass} font-black text-red-600 tracking-tight`}>
                            {idx === 0 ? '15.830.000.000 ₫' : idx === 1 ? '13.600.000.000 ₫' : '17.380.000.000 ₫'}
                          </td>
                          <td className={tdClass}>
                            <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold">
                              ✓ Sẵn sàng
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Can>
        )}

        {/* ── 6. GÓI SUBSCRIPTION ── */}
        {activeMenu === 'shop' && (
          <Can do="manage" on="Shop">
            <div className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-slate-900 mb-1 tracking-tight">Gói Trải Nghiệm & Subscription</h2>
                    <p className="text-[13px] text-slate-500 font-medium">Quản lý các gói đăng ký chạy track chuyên nghiệp.</p>
                  </div>
                  <button onClick={handleOpenAddPkg} className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-md hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
                    ➕ Thêm gói mới
                  </button>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[950px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className={thClass}>Tên gói</th>
                        <th className={thClass}>Dòng xe</th>
                        <th className={thClass}>Thời lượng</th>
                        <th className={thClass}>Dịch vụ kèm theo</th>
                        <th className={thClass}>Giá niêm yết</th>
                        <th className={thClass}>Trạng thái</th>
                        <th className={thClass}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.length === 0 ? (
                        <tr><td colSpan="7" className="text-center p-12 text-slate-500 text-sm border-dashed">Chưa có gói trải nghiệm nào.</td></tr>
                      ) : (
                        packages.map((p) => (
                          <tr key={p.id} className="group transition-colors">
                            <td className={`${tdClass} font-extrabold text-slate-900`}>{p.name}</td>
                            <td className={tdClass}>
                              <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700">
                                {p.car}
                              </span>
                            </td>
                            <td className={`${tdClass} font-medium text-slate-700`}>{p.duration}</td>
                            <td className={`${tdClass} text-[12.5px] leading-relaxed text-slate-600 max-w-[250px]`}>{p.features}</td>
                            <td className={`${tdClass} font-black text-red-600 tracking-tight text-[15px]`}>{Number(p.price).toLocaleString('vi-VN')} ₫</td>
                            <td className={tdClass}>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${p.status === 'Đang mở bán' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className={tdClass}>
                              <div className="flex gap-2">
                                <button onClick={() => handleOpenEditPkg(p)} className={btnSuccessClass}>✏️ Sửa</button>
                                <button onClick={() => handleDeletePkg(p.id)} className={btnDangerClass}>🗑️ Xóa</button>
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
            <div className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-8 max-w-7xl mx-auto w-full">
                <div className="mb-6">
                  <h2 className="text-[18px] font-extrabold text-slate-900 mb-1 tracking-tight">Phân Quyền Vai Trò (Ma Trận RBAC)</h2>
                  <p className="text-[13px] text-slate-500 font-medium">Bảng tham chiếu chi tiết quyền hạn truy cập của từng cấp độ.</p>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className={thClass}>Vai trò (Role)</th>
                        <th className={thClass}>Mô tả cấp bậc</th>
                        <th className={thClass}>Dashboard</th>
                        <th className={thClass}>Quản lý User</th>
                        <th className={thClass}>Đơn hàng</th>
                        <th className={thClass}>Test Drive & Xe</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="group transition-colors">
                        <td className={tdClass}>
                          <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-[11px] font-black tracking-widest">
                            SUPER ADMIN
                          </span>
                        </td>
                        <td className={`${tdClass} font-medium text-slate-700`}>Quản trị viên toàn quyền hệ thống</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Manage</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Manage</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Manage</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Manage</td>
                      </tr>
                      <tr className="group transition-colors">
                        <td className={tdClass}>
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[11px] font-black tracking-widest">
                            DEALER MANAGER
                          </span>
                        </td>
                        <td className={`${tdClass} font-medium text-slate-700`}>Quản lý đại lý showroom</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read</td>
                        <td className={`${tdClass} text-red-500 font-bold text-[12px]`}>✕ Restricted</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Confirm</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Manage</td>
                      </tr>
                      <tr className="group transition-colors">
                        <td className={tdClass}>
                          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[11px] font-black tracking-widest">
                            CUSTOMER / USER
                          </span>
                        </td>
                        <td className={`${tdClass} font-medium text-slate-700`}>Khách hàng thành viên</td>
                        <td className={`${tdClass} text-red-500 font-bold text-[12px]`}>✕ Restricted</td>
                        <td className={`${tdClass} text-red-500 font-bold text-[12px]`}>✕ Restricted</td>
                        <td className={`${tdClass} text-slate-400 font-medium text-[12px] italic`}>Chỉ xem đơn của mình</td>
                        <td className={`${tdClass} text-slate-400 font-medium text-[12px] italic`}>Chỉ đặt & xem lịch</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Can>
        )}
      </main>

      {/* ── MODALS ── */}
      {/* 1. Modal Thêm/Sửa Gói */}
      {showPkgModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
              <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
                {editingPkg ? 'Chỉnh sửa Gói Trải Nghiệm' : 'Thêm Gói Trải Nghiệm Mới'}
              </h3>
              <button onClick={() => setShowPkgModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors text-xl font-bold p-1">&times;</button>
            </div>

            <form onSubmit={handleSavePkgSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Tên gói</label>
                <input
                  type="text" required
                  placeholder="VD: Track Performance Ultimate"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Dòng xe hỗ trợ</label>
                <select
                  value={pkgForm.car}
                  onChange={(e) => setPkgForm({ ...pkgForm, car: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow bg-white"
                >
                  <option value="Porsche 911 GT3 RS">Porsche 911 GT3 RS</option>
                  <option value="Porsche 911 GT3">Porsche 911 GT3</option>
                  <option value="Porsche 911 Turbo S">Porsche 911 Turbo S</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Thời lượng</label>
                  <input
                    type="text" required
                    placeholder="VD: 2 ngày"
                    value={pkgForm.duration}
                    onChange={(e) => setPkgForm({ ...pkgForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Giá niêm yết (VNĐ)</label>
                  <input
                    type="number" required
                    placeholder="45000000"
                    value={pkgForm.price}
                    onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Dịch vụ kèm theo</label>
                <input
                  type="text"
                  placeholder="VD: HLV cá nhân, Video HD"
                  value={pkgForm.features}
                  onChange={(e) => setPkgForm({ ...pkgForm, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Trạng thái</label>
                <select
                  value={pkgForm.status}
                  onChange={(e) => setPkgForm({ ...pkgForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow bg-white font-semibold"
                >
                  <option value="Đang mở bán">Đang mở bán (Active)</option>
                  <option value="Tạm ngưng">Tạm ngưng (Inactive)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowPkgModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-[14px] hover:bg-slate-50 transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold text-[14px] hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                  {editingPkg ? 'Lưu cập nhật' : 'Tạo mới gói'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Sửa User */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
              <h3 className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                ✏️ Sửa thông tin tài khoản
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors text-xl font-bold p-1">&times;</button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Họ và tên</label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email đăng nhập</label>
                <input
                  type="email"
                  value={userForm.email}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono text-[13px] outline-none cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Email định danh không thể thay đổi để bảo vệ tài khoản.</p>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow font-mono"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Quyền hạn (Role)</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow bg-white font-semibold"
                >
                  <option value="user">CUSTOMER / USER — Khách hàng</option>
                  <option value="dealer_manager">DEALER MANAGER — Quản lý đại lý</option>
                  <option value="admin">SUPER ADMIN — Quản trị viên</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-[14px] hover:bg-slate-50 transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-bold text-[14px] hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}