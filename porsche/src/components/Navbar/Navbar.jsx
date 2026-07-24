import { useState, useRef, useEffect } from "react";
import './Navbar.css';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Can } from "../../hooks/useAbility";

function Navbar({ selectedCar, setSelectedCar }) {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    // ── LOGIC QUẢN LÝ MENU ──
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

    const accountMenuRef = useRef(null);
    const menuDropdownRef = useRef(null);

    const { user, logout } = useAuth();

    // Danh sách các dòng xe
    const CAR_MODELS = ['GT3 RS', 'GT3', '911 TURBO S'];

    // Tự động đóng Menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
            if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
                setIsMenuDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await logout();
            setIsAccountMenuOpen(false);
            setIsMobileMenuOpen(false);
            navigate('/'); 
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        }
    };

    const scrollToSection = (sectionId) => {
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleCarSelect = (car) => {
        setSelectedCar(car);
        setIsMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="navbar fixed top-0 left-0 w-full z-50 box-border">
            <div 
                className="porsche-text-logo" 
                onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
            >
                PORSCHE
            </div>

            {/* ── BÊN TRÁI: DANH SÁCH DÒNG XE ── */}
            {!isMobile && (
                <ul style={{ display: 'flex', gap: '35px', margin: 0, padding: 0 }}>
                    {CAR_MODELS.map(car => (
                        <li 
                            key={car}
                            onClick={() => handleCarSelect(car)}
                            className={`cursor-pointer font-semibold tracking-wide transition-colors duration-300 ${
                                selectedCar === car ? 'text-[#dc2626]' : 'text-white hover:text-[#dc2626]'
                            }`}
                        >
                            {car}
                        </li>
                    ))}
                </ul>
            )}

            {/* ── BÊN PHẢI: SHOP - ACCOUNT - MENU ── */}
            {!isMobile ? (
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', fontSize: "16px" }}>
                    <ul style={{ display: 'flex', gap: '30px', alignItems: 'center', margin: 0, padding: 0 }}>
                        <li>
                            <Link to="/shop" className="cursor-pointer transition-colors font-semibold tracking-wide hover:text-red-500">
                                Shop
                            </Link>
                        </li>
                        
                        {/* ── Menu Account ── */}
                        {user ? (
                            <li className="relative" ref={accountMenuRef} style={{ listStyle: 'none' }}>
                                <div 
                                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    className="transition-colors font-semibold tracking-wide hover:text-red-500"
                                >
                                    Account
                                </div>

                                {/* 🎯 Bảng Dropdown Account */}
                                {isAccountMenuOpen && (
                                    <div className="absolute right-0 mt-5 w-56 bg-[#141414]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-white transition-all duration-300" style={{ top: '100%' }}>
                                        <div className="px-4 py-3 border-b border-white/10 text-left">
                                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold">Hi,</p>
                                            <p className="text-sm font-bold truncate text-[#dc2626]">
                                                {user.displayName || 'ADMIN'}
                                            </p>
                                        </div>
                                        <div className="py-1 text-left">
                                            {/* 🚀 NÚT ADMIN ĐÃ ĐƯỢC CHUYỂN VÀO TRONG DROPDOWN */}
                                            <Can I="read" a="Dashboard">
                                                <Link to="/admin" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-red-500 font-bold hover:bg-white/10 transition-colors">
                                                    Dashboard
                                                </Link>
                                            </Can>

                                            <Link to="/profile" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-red-500 transition-colors">
                                                Thông tin tài khoản
                                            </Link>
                                            <Link to="/change-password" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-red-500 transition-colors">
                                                Đổi mật khẩu
                                            </Link>
                                        </div>
                                        <div className="border-t border-white/10 mt-1 pt-1 text-left">
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-white/10 transition-colors">
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ) : (
                            <li><Link to="/login" className="transition-colors font-semibold tracking-wide hover:text-red-500">Account</Link></li>
                        )}
                        
                        {/* ── Mục "Menu" Khám phá ── */}
                        <li className="relative" ref={menuDropdownRef} style={{ listStyle: 'none' }}>
                            <div 
                                onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                className="transition-colors font-semibold tracking-wide hover:text-red-500"
                            >
                                Menu
                            </div>

                            {/* 🎯 Bảng Dropdown Menu Khám phá */}
                            {isMenuDropdownOpen && (
                                <div className="absolute right-0 mt-5 w-64 bg-[#141414]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-white transition-all duration-300" style={{ top: '100%' }}>
                                    <div className="px-4 py-3 border-b border-white/10 text-left">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Khám phá</p>
                                    </div>
                                    <div className="py-1 text-left">
                                        <button onClick={() => scrollToSection('hero-gt3rs')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-200 hover:bg-white/10 hover:text-red-500 transition-colors">
                                            Porsche {selectedCar}
                                        </button>
                                        <button onClick={() => scrollToSection('history-section')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-200 hover:bg-white/10 hover:text-red-500 transition-colors">
                                            Lịch sử huyền thoại
                                        </button>
                                        <button onClick={() => scrollToSection('3d-showroom')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-200 hover:bg-white/10 hover:text-red-500 transition-colors">
                                            Showroom 3D Cấu hình
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            ) : (
                <button
                    className="hamburger-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Mới menu"
                >
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                </button>
            )}

            {/* ── Menu Điện thoại (Mobile) ── */}
            {isMobile && (
                <div className={`mobile-menu-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-menu-section">
                        {CAR_MODELS.map(car => (
                            <li 
                                key={car} 
                                onClick={() => handleCarSelect(car)}
                                className={selectedCar === car ? 'text-[#dc2626]' : ''}
                            >
                                {car}
                            </li>
                        ))}
                    </ul>
                    <div className="mobile-menu-divider" />
                    <ul className="mobile-menu-section">
                        <li>
                            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                        </li>
                        
                        {user ? (
                            <>
                                <li className="text-gray-400 text-sm font-bold mt-2">Hi, <span className="text-[#dc2626]">{user.displayName || 'ADMIN'}</span></li>
                                
                                {/* 🚀 NÚT ADMIN CHO MOBILE */}
                                <Can I="read" a="Dashboard">
                                    <li>
                                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-red-500 font-bold">
                                            Trang Quản Trị
                                        </Link>
                                    </li>
                                </Can>

                                <li><Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Thông tin tài khoản</Link></li>
                                <li><Link to="/change-password" onClick={() => setIsMobileMenuOpen(false)}>Đổi mật khẩu</Link></li>
                                <li onClick={handleLogout} className="text-gray-400 hover:text-red-500">Đăng xuất</li>
                            </>
                        ) : (
                            <li><Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Account</Link></li>
                        )}
                    </ul>

                    <div className="mobile-menu-divider" />
                    <ul className="mobile-menu-section">
                        <li className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Menu Khám phá</li>
                        <li onClick={() => scrollToSection('hero-gt3rs')} className="cursor-pointer hover:text-red-500">Porsche {selectedCar}</li>
                        <li onClick={() => scrollToSection('history-section')} className="cursor-pointer hover:text-red-500">Lịch sử huyền thoại</li>
                        <li onClick={() => scrollToSection('3d-showroom')} className="cursor-pointer hover:text-red-500">Showroom 3D Cấu hình</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Navbar;