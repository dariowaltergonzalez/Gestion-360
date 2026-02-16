import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, ShoppingCart, User, LogIn, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="logo-link">
                    <div className="logo">
                        <ShoppingCart size={32} color="var(--primary-color)" />
                    </div>
                    <span className="brand-name">Gestión 360</span>
                </Link>
            </div>

            <div className="navbar-search">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="search-input"
                    />
                </div>
            </div>

            <div className="navbar-actions">
                <button className="nav-btn cart-btn">
                    <ShoppingCart size={20} />
                    <span className="cart-badge">0</span>
                </button>

                {currentUser ? (
                    <div className="user-menu">
                        <button className="nav-btn user-btn" onClick={() => navigate('/dashboard')}>
                            <User size={20} />
                            <span className="user-email">{currentUser.email?.split('@')[0]}</span>
                        </button>
                        <button onClick={handleLogout} className="nav-btn logout-btn" title="Cerrar sesión">
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="auth-btns">
                        <button
                            className="nav-btn login-btn"
                            onClick={() => navigate('/login')}
                        >
                            <LogIn size={20} />
                            <span>Ingresar</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
