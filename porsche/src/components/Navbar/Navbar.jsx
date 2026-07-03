import { useState } from "react";
import './Navbar.css';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useActiveSection } from '../../hooks/useActiveSection';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ✅ Đã cập nhật lại thứ tự Section theo luồng mới nhất của App.jsx
const SECTION_ORDER = ['hero-gt3rs', 'history-section', '3d-showroom'];

// ✅ Section nào navbar nên hiện màu ĐEN — còn lại mặc định TRẮNG
const DARK_NAVBAR_SECTIONS = ['3d-showroom'];

function Navbar() {
    const isMobile = useIsMobile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const activeSection = useActiveSection(SECTION_ORDER);

    // 🐛 CHÌA KHÓA LÀ ĐÂY: Mọi Hooks phải nằm BÊN TRONG Component
    const { user, logout } = useAuth();

    // navColor không liên quan đến theme sáng/tối người dùng chọn —
    // chỉ phụ thuộc section nào đang hiện trên màn hình
    const navColor = DARK_NAVBAR_SECTIONS.includes(activeSection) ? 'dark' : 'light';

    return (
        <div className={`navbar ${navColor}`}>

            <div className="porsche-text-logo">PORSCHE</div>

            {!isMobile && (
                <ul>
                    <li>GT3 RS</li>
                    <li>GT3</li>
                    <li>911 Turbo S</li>
                </ul>
            )}

            {!isMobile ? (
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', fontSize: "16px" }}>
                    <ul>
                        <li>Shop</li>
                        {/* ── Logic User Account ── */}
                        {user ? (
                            <li onClick={logout} style={{ cursor: 'pointer' }}>
                                {user.displayName?.split(' ')[0] ?? 'Tài khoản'}
                            </li>
                        ) : (
                            <li><Link to="/login">Account</Link></li>
                        )}
                        <li>Menu</li>
                    </ul>
                </div>
            ) : (
                <button
                    className="hamburger-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Mở menu"
                >
                    <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                </button>
            )}

            {isMobile && (
                <div className={`mobile-menu-dropdown ${navColor} ${isMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-menu-section">
                        <li>GT3 RS</li>
                        <li>GT3</li>
                        <li>911 Turbo S</li>
                    </ul>
                    <div className="mobile-menu-divider" />
                    <ul className="mobile-menu-section">
                        <li>Shop</li>
                        <li>Account</li>
                        <li>Menu</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Navbar;