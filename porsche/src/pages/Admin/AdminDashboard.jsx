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

  const [packages, setPackages] = useState([]);

  // Hàm load packages từ API (có thể gọi trong fetchData)
  const fetchPackages = async () => {
    try {
      const res = await adminAPI.getAllPlans();
      setPackages(Array.isArray(res) ? res : res?.data || res || []);
    } catch (err) {
      console.error('Lỗi load packages:', err);
    }
  };

  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    name: '', car: 'Porsche 911 GT3 RS', duration: '', features: '', price: '', status: 'Đang mở bán'
  });

  const savePackagesToStorage = async (pkgFormToSave, isEdit) => {
    try {
      if (isEdit) {
        await adminAPI.updatePlan(editingPkg._id || editingPkg.id, pkgFormToSave);
      } else {
        await adminAPI.createPlan(pkgFormToSave);
      }
      fetchPackages();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu gói!');
      console.error(error);
    }
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

  const handleDeletePkg = async (pkgId) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói trải nghiệm này?')) return;
    try {
      await adminAPI.deletePlan(pkgId);
      fetchPackages();
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa gói!');
    }
  };

  const handleSavePkgSubmit = (e) => {
    e.preventDefault();
    if (!pkgForm.name || !pkgForm.price) {
      alert('Vui lòng điền đầy đủ tên gói và giá!');
      return;
    }

    const planData = {
      ...pkgForm,
      price: Number(pkgForm.price),
      planId: pkgForm.name.toLowerCase().replace(/\s+/g, '-'),
      duration: pkgForm.duration || '60 phút',
      cars: pkgForm.car ? [pkgForm.car] : ['Porsche 911 GT3'],
      features: pkgForm.features ? pkgForm.features.split(',').map(f => ({ text: f.trim(), ok: true })) : []
    };

    savePackagesToStorage(planData, !!editingPkg);
    setShowPkgModal(false);
  };

  useEffect(() => {
    fetchData();
    fetchPackages();
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

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Xác nhận cập nhật quyền cho người dùng này?`)) return;
    try {
      // Giả sử có API adminAPI.updateUserRole(userId, newRole)
      // Tạm thời nếu backend chưa có, ta cứ gọi adminAPI.updateUser(userId, { role: newRole })
      await adminAPI.updateUser(userId, { role: newRole });
      
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      alert('✅ Cập nhật quyền thành công!');
    } catch (error) {
      alert('❌ Lỗi khi cập nhật quyền: ' + (error.response?.data?.message || error.message));
    }
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

  // Thống nhất các Tailwind Classes dùng chung (Dark Glassmorphism)
  const btnRefreshClass = "inline-flex items-center justify-center gap-1.5 bg-transparent/5 border border-white/10 text-gray-300 px-4 py-2 rounded-lg cursor-pointer text-[13px] font-bold transition-all shadow-sm hover:bg-transparent/10 hover:text-white hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-50 backdrop-blur-md";
  const btnSuccessClass = "inline-flex items-center gap-1 text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-green-500/20 hover:text-green-300 hover:-translate-y-px shadow-sm active:scale-95";
  const btnDangerClass = "inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-300 hover:-translate-y-px shadow-sm active:scale-95";
  const btnPrimaryClass = "inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all hover:bg-blue-500/20 hover:text-blue-300 hover:-translate-y-px shadow-sm active:scale-95";
  
  const thClass = "px-5 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest text-left whitespace-nowrap bg-[#111]/50 backdrop-blur-md";
  const tdClass = "px-5 py-4 border-b border-white/5 align-middle text-gray-300 transition-colors group-hover:bg-transparent/5";
  const tableWrapClass = "bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden overflow-x-auto shadow-2xl";

  return (
    <div className="flex min-h-screen bg-[#050505] text-gray-300 font-sans antialiased selection:bg-red-500/30 selection:text-white relative">
      {/* ── Bầu trời Pattern Mờ ảo ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-600 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]"></div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`bg-[#0a0a0a]/80 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-all duration-300 sticky top-0 h-screen overflow-y-auto overflow-x-hidden shrink-0 z-20 shadow-2xl ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5 min-h-[72px]">
          <Link to="/" className="text-decoration-none focus:outline-none">
            <div className={`text-[18px] font-black tracking-[0.2em] text-white whitespace-nowrap overflow-hidden transition-colors hover:text-red-500 ${!sidebarOpen && 'opacity-0 w-0'}`}>
              PORSCHE
            </div>
          </Link>
          <button 
            className="w-7 h-7 rounded-md bg-transparent/5 border border-white/10 text-gray-400 text-[10px] flex items-center justify-center shrink-0 cursor-pointer transition-all hover:bg-red-600 hover:border-red-600 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-4 py-4 mx-3 mt-4 mb-2 rounded-xl bg-transparent/5 border border-white/10 shadow-sm backdrop-blur-md">
            <div className="w-[40px] h-[40px] rounded-lg bg-gradient-to-br from-red-600 to-orange-500 text-white text-sm font-black flex items-center justify-center shrink-0 shadow-[0_4px_15px_rgba(220,38,38,0.4)]">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-bold text-white truncate">{user?.displayName || 'ADMIN'}</div>
              <div className="text-[10px] text-red-500 uppercase tracking-widest font-bold mt-0.5">{user?.role || 'Super Admin'}</div>
            </div>
          </div>
        )}

        <div className={`text-[10px] font-black tracking-[0.15em] text-gray-600 px-5 pt-4 pb-2 transition-opacity ${!sidebarOpen && 'opacity-0'}`}>
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
                    ? 'bg-red-600/10 border-red-500/30 text-red-500 shadow-lg' 
                    : 'bg-transparent border-transparent text-gray-400 hover:bg-transparent/5 hover:text-white'
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
        <header className="flex items-center justify-between px-8 h-[72px] bg-[#0a0a0a]/60 backdrop-blur-2xl border-b border-white/10 shrink-0 sticky top-0 z-30 shadow-2xl">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
              {MENU_ITEMS.find(m => m.id === activeMenu)?.label || 'Dashboard'}
            </h1>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">
              Admin / <span className="text-gray-300">{MENU_ITEMS.find(m => m.id === activeMenu)?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-gray-300 font-bold bg-transparent/5 px-4 py-2 rounded-full border border-white/10 shadow-md backdrop-blur-md">
            <span className="text-[14px]">📅</span> {new Date().toLocaleDateString('vi-VN')}
          </div>
        </header>

        {/* ── 1. GIAO DIỆN TAB TỔNG QUAN ── */}
        {activeMenu === 'overview' && (
          <div className="p-8 flex-1 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-[18px] font-extrabold text-white mb-1 tracking-tight">Tổng quan hệ thống</h2>
                  <p className="text-[13px] text-gray-400 font-medium">Theo dõi các chỉ số và dữ liệu quan trọng của Porsche.</p>
                </div>
                <button onClick={fetchData} className={btnRefreshClass}>🔄 Làm mới</button>
              </div>
              
              {loading ? (
                <div className="text-center p-12 text-gray-500 text-sm bg-transparent/5 rounded-2xl border border-white/10 border-dashed backdrop-blur-md">Đang tải dữ liệu tổng quan...</div>
              ) : stats.length === 0 ? (
                <div className="text-center p-12 text-gray-500 text-sm bg-transparent/5 rounded-2xl border border-white/10 border-dashed backdrop-blur-md">Chưa có dữ liệu thống kê từ Server.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex gap-4 items-start shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-white/20 relative overflow-hidden group">
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] shrink-0 shadow-lg" style={{ color: stat.color, background: `${stat.color}20` }}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-400 mb-1.5 font-extrabold uppercase tracking-widest">{stat.label}</div>
                        <div className="text-[28px] font-black text-white mb-1 tracking-tight leading-none">{stat.value}</div>
                        <div className="text-[12px] font-bold text-green-400 flex items-center gap-1 mt-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                          {stat.delta} <span className="text-gray-500 font-medium ml-1">so với tháng trước</span>
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
                    <h2 className="text-[18px] font-extrabold text-white mb-1 tracking-tight">Quản lý Tài Khoản</h2>
                    <p className="text-[13px] text-gray-400 font-medium">Danh sách khách hàng đăng ký và nhân viên hệ thống.</p>
                  </div>
                  <button onClick={fetchData} className={btnRefreshClass}>🔄 Làm mới</button>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[850px] border-collapse">
                    <thead>
                      <tr className="bg-[#111]/80 border-b border-white/10">
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
                        <tr><td colSpan="6" className="text-center p-12 text-gray-400 text-sm border-dashed">Đang tải dữ liệu Users...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan="6" className="text-center p-12 text-gray-400 text-sm border-dashed">Chưa có tài khoản nào.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id} className="group transition-colors">
                            <td className={tdClass}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-transparent/10 text-gray-300 flex items-center justify-center font-bold text-xs shrink-0">
                                  {(u.fullName || u.displayName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <strong className="text-white">{u.fullName || u.displayName}</strong>
                              </div>
                            </td>
                            <td className={`${tdClass} font-mono text-[13px] text-gray-400`}>{u.email}</td>
                            <td className={tdClass}>
                              <select
                                value={u.role || 'user'}
                                onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold border outline-none cursor-pointer tracking-wide transition-colors focus:ring-2 focus:ring-slate-200 ${
                                  u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' : 
                                  u.role === 'dealer_manager' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                  'bg-transparent/5 text-gray-300 border-white/10'
                                }`}
                              >
                                <option value="user" className="bg-transparent text-gray-300">USER / KHÁCH HÀNG</option>
                                <option value="dealer_manager" className="bg-transparent text-gray-300">DEALER MANAGER</option>
                                <option value="admin" className="bg-transparent text-gray-300">SUPER ADMIN</option>
                              </select>
                            </td>
                            <td className={tdClass}>
                              <span className="px-2.5 py-1 bg-transparent/5 border border-white/10 rounded-md text-[11px] font-semibold text-gray-400">
                                {u.authProvider || u.provider || 'Email'}
                              </span>
                            </td>
                            <td className={`${tdClass} font-mono text-[13px] text-gray-400`}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
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
                    <h2 className="text-[18px] font-extrabold text-white mb-1 tracking-tight">Quản lý Đơn Hàng & Lái Thử</h2>
                    <p className="text-[13px] text-gray-400 font-medium">Theo dõi các giao dịch tài chính và đặt cọc xe.</p>
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
                      <tr className="bg-[#111]/80 border-b border-white/10">
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
                        <tr><td colSpan="7" className="text-center p-12 text-gray-400 text-sm border-dashed">Đang tải dữ liệu...</td></tr>
                      ) : displayOrders.length === 0 ? (
                        <tr><td colSpan="7" className="text-center p-12 text-gray-400 text-sm border-dashed">Chưa có giao dịch nào.</td></tr>
                      ) : (
                        displayOrders.map((o) => {
                          const statusKey = getEffectiveOrderStatus(o);
                          return (
                            <tr key={o.id} className="group transition-colors">
                              <td className={`${tdClass} font-mono text-[13px] font-medium text-gray-300`}>#{o.orderId}</td>
                              <td className={tdClass}>
                                <div className="font-bold text-white">{o.customerName}</div>
                                <div className="text-[11px] text-gray-400 font-medium mt-0.5">{o.phone || o.showroom}</div>
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
                                    <div className={`${statusKey === 'upcoming' ? 'text-blue-600 font-bold' : 'text-gray-300 font-semibold'} text-[13px]`}>
                                      {new Date(o.driveDate).toLocaleDateString('vi-VN')}
                                    </div>
                                    {o.driveTime && <div className="text-[11px] text-gray-400 font-medium mt-0.5">{o.driveTime}</div>}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic text-[12.5px]">Chưa xếp lịch</span>
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
                                  <option value="pending_payment" className="bg-[#1a1a1a] text-amber-500">CHỜ THANH TOÁN</option>
                                  <option value="awaiting_cash" className="bg-[#1a1a1a] text-orange-500">CHỜ THU TIỀN</option>
                                  <option value="paid" className="bg-[#1a1a1a] text-emerald-500">ĐÃ THANH TOÁN</option>
                                  <option value="upcoming" className="bg-[#1a1a1a] text-blue-500">⚡ SẮP TỚI</option>
                                  <option value="completed" className="bg-[#1a1a1a] text-indigo-500">HOÀN THÀNH</option>
                                  <option value="cancelled" className="bg-[#1a1a1a] text-red-500">ĐÃ HỦY</option>
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
                    <h2 className="text-[18px] font-extrabold text-white mb-1 tracking-tight">Quản lý lịch lái thử</h2>
                    <p className="text-[13px] text-gray-400 font-medium">Sắp xếp, phê duyệt lịch hẹn lái thử từ khách hàng.</p>
                  </div>
                  <button onClick={fetchData} className={btnRefreshClass}>🔄 Làm mới</button>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-[#111]/80 border-b border-white/10">
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
                        <tr><td colSpan="7" className="text-center p-12 text-gray-400 text-sm border-dashed">Đang tải dữ liệu...</td></tr>
                      ) : testDrives.length === 0 ? (
                        <tr><td colSpan="7" className="text-center p-12 text-gray-400 text-sm border-dashed">Chưa có lịch hẹn nào.</td></tr>
                      ) : (
                        testDrives.map((t) => (
                          <tr key={t._id} className="group transition-colors">
                            <td className={`${tdClass} font-mono text-[13px] font-medium text-gray-300`}>{t.orderNumber}</td>
                            <td className={tdClass}>
                              <div className="font-bold text-white">{t.userName || t.user}</div>
                              <div className="text-[11px] text-gray-400 font-medium mt-0.5">{t.phone}</div>
                            </td>
                            <td className={tdClass}>
                              <span className="inline-flex items-center px-2 py-1 bg-transparent/5 border border-white/10 rounded text-[11.5px] font-semibold text-gray-300">
                                {t.cars?.join(', ') || t.car}
                              </span>
                              <div className="text-[11px] text-gray-400 font-medium mt-1">{t.planName}</div>
                            </td>
                            <td className={`${tdClass} font-mono text-[13px] font-semibold text-gray-300`}>{new Date(t.scheduledAt).toLocaleString('vi-VN')}</td>
                            <td className={`${tdClass} text-[13px] font-medium text-gray-300`}>{t.showroom}</td>
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
                  <h2 className="text-[18px] font-extrabold text-white mb-1 tracking-tight">Danh mục Dòng xe</h2>
                  <p className="text-[13px] text-gray-400 font-medium">Cấu hình thông số các mẫu xe trải nghiệm 3D Showroom.</p>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[700px] border-collapse">
                    <thead>
                      <tr className="bg-[#111]/80 border-b border-white/10">
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
                            <strong className="text-white">{carName}</strong>
                          </td>
                          <td className={`${tdClass} text-gray-300`}>
                            {idx === 0 ? '4.0L Atmospheric / 525 HP' : idx === 1 ? '4.0L Flat-6 / 510 HP' : '3.8L Twin-Turbo / 650 HP'}
                          </td>
                          <td className={`${tdClass} font-mono text-[13px] font-medium text-gray-300`}>
                            {idx === 0 ? '296 km/h' : idx === 1 ? '318 km/h' : '330 km/h'}
                          </td>
                          <td className={`${tdClass} font-mono text-[13px] font-medium text-gray-300`}>
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
                    <h2 className="text-[18px] font-extrabold text-white mb-1 tracking-tight">Gói Trải Nghiệm & Subscription</h2>
                    <p className="text-[13px] text-gray-400 font-medium">Quản lý các gói đăng ký chạy track chuyên nghiệp.</p>
                  </div>
                  <button onClick={handleOpenAddPkg} className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-all shadow-md hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
                    ➕ Thêm gói mới
                  </button>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[950px] border-collapse">
                    <thead>
                      <tr className="bg-[#111]/80 border-b border-white/10">
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
                        <tr><td colSpan="7" className="text-center p-12 text-gray-400 text-sm border-dashed">Chưa có gói trải nghiệm nào.</td></tr>
                      ) : (
                        packages.map((p) => (
                          <tr key={p._id || p.id} className="group transition-colors">
                            <td className={`${tdClass} font-extrabold text-white`}>{p.name}</td>
                            <td className={tdClass}>
                              <span className="inline-flex items-center px-2.5 py-1 bg-transparent/5 border border-white/10 rounded-md text-[11px] font-semibold text-gray-300">
                                {Array.isArray(p.cars) ? p.cars.join(', ') : (p.car || 'Porsche 911 GT3')}
                              </span>
                            </td>
                            <td className={`${tdClass} font-medium text-gray-300`}>{p.duration}</td>
                            <td className={`${tdClass} text-[12.5px] leading-relaxed text-gray-300 max-w-[250px]`}>
                              {Array.isArray(p.features) ? p.features.map(f => f.text).join(', ') : p.features}
                            </td>
                            <td className={`${tdClass} font-black text-red-600 tracking-tight text-[15px]`}>{Number(p.price).toLocaleString('vi-VN')} ₫</td>
                            <td className={tdClass}>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${p.status === 'Đang mở bán' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className={tdClass}>
                              <div className="flex gap-2">
                                <button onClick={() => handleOpenEditPkg(p)} className={btnSuccessClass}>✏️ Sửa</button>
                                <button onClick={() => handleDeletePkg(p._id || p.id)} className={btnDangerClass}>🗑️ Xóa</button>
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
                  <h2 className="text-[18px] font-extrabold text-white mb-1 tracking-tight">Phân Quyền Vai Trò (Ma Trận RBAC)</h2>
                  <p className="text-[13px] text-gray-400 font-medium">Bảng tham chiếu chi tiết quyền hạn truy cập của từng cấp độ.</p>
                </div>

                <div className={tableWrapClass}>
                  <table className="w-full text-[13.5px] min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-[#111]/80 border-b border-white/10">
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
                        <td className={`${tdClass} font-medium text-gray-300`}>Quản trị viên toàn quyền hệ thống</td>
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
                        <td className={`${tdClass} font-medium text-gray-300`}>Quản lý đại lý showroom</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read</td>
                        <td className={`${tdClass} text-red-500 font-bold text-[12px]`}>✕ Restricted</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Confirm</td>
                        <td className={`${tdClass} text-emerald-600 font-bold text-[12px]`}>✓ Read / Manage</td>
                      </tr>
                      <tr className="group transition-colors">
                        <td className={tdClass}>
                          <span className="inline-flex items-center px-2.5 py-1 bg-transparent/5 text-gray-300 border border-white/10 rounded-md text-[11px] font-black tracking-widest">
                            CUSTOMER / USER
                          </span>
                        </td>
                        <td className={`${tdClass} font-medium text-gray-300`}>Khách hàng thành viên</td>
                        <td className={`${tdClass} text-red-500 font-bold text-[12px]`}>✕ Restricted</td>
                        <td className={`${tdClass} text-red-500 font-bold text-[12px]`}>✕ Restricted</td>
                        <td className={`${tdClass} text-gray-500 font-medium text-[12px] italic`}>Chỉ xem đơn của mình</td>
                        <td className={`${tdClass} text-gray-500 font-medium text-[12px] italic`}>Chỉ đặt & xem lịch</td>
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
          <div className="bg-transparent rounded-2xl border border-white/10 w-full max-w-lg p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
              <h3 className="text-[18px] font-extrabold text-white tracking-tight">
                {editingPkg ? 'Chỉnh sửa Gói Trải Nghiệm' : 'Thêm Gói Trải Nghiệm Mới'}
              </h3>
              <button onClick={() => setShowPkgModal(false)} className="text-gray-500 hover:text-gray-300 transition-colors text-xl font-bold p-1">&times;</button>
            </div>

            <form onSubmit={handleSavePkgSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Tên gói</label>
                <input
                  type="text" required
                  placeholder="VD: Track Performance Ultimate"
                  value={pkgForm.name}
                  onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Dòng xe hỗ trợ</label>
                <select
                  value={pkgForm.car}
                  onChange={(e) => setPkgForm({ ...pkgForm, car: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow bg-transparent"
                >
                  <option value="Porsche 911 GT3 RS">Porsche 911 GT3 RS</option>
                  <option value="Porsche 911 GT3">Porsche 911 GT3</option>
                  <option value="Porsche 911 Turbo S">Porsche 911 Turbo S</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Thời lượng</label>
                  <input
                    type="text" required
                    placeholder="VD: 2 ngày"
                    value={pkgForm.duration}
                    onChange={(e) => setPkgForm({ ...pkgForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Giá niêm yết (VNĐ)</label>
                  <input
                    type="number" required
                    placeholder="45000000"
                    value={pkgForm.price}
                    onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Dịch vụ kèm theo</label>
                <input
                  type="text"
                  placeholder="VD: HLV cá nhân, Video HD"
                  value={pkgForm.features}
                  onChange={(e) => setPkgForm({ ...pkgForm, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Trạng thái</label>
                <select
                  value={pkgForm.status}
                  onChange={(e) => setPkgForm({ ...pkgForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow bg-transparent font-semibold"
                >
                  <option value="Đang mở bán">Đang mở bán (Active)</option>
                  <option value="Tạm ngưng">Tạm ngưng (Inactive)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowPkgModal(false)} className="px-5 py-2.5 rounded-lg border border-white/20 text-gray-300 font-bold text-[14px] hover:bg-[#111]/80 transition-colors">Hủy bỏ</button>
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
          <div className="bg-transparent rounded-2xl border border-white/10 w-full max-w-md p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
              <h3 className="text-[18px] font-extrabold text-white tracking-tight flex items-center gap-2">
                ✏️ Sửa thông tin tài khoản
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-300 transition-colors text-xl font-bold p-1">&times;</button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Họ và tên</label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Email đăng nhập</label>
                <input
                  type="email"
                  value={userForm.email}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-[#111]/80 text-gray-400 font-mono text-[13px] outline-none cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Email định danh không thể thay đổi để bảo vệ tài khoản.</p>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow font-mono"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-300 mb-1.5 uppercase tracking-wide">Quyền hạn (Role)</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-[14px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow bg-transparent font-semibold"
                >
                  <option value="user">CUSTOMER / USER — Khách hàng</option>
                  <option value="dealer_manager">DEALER MANAGER — Quản lý đại lý</option>
                  <option value="admin">SUPER ADMIN — Quản trị viên</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-5 py-2.5 rounded-lg border border-white/20 text-gray-300 font-bold text-[14px] hover:bg-[#111]/80 transition-colors">Hủy bỏ</button>
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