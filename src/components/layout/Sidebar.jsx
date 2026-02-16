import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    Truck,
    ShoppingCart,
    FileText,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    History,
    Percent
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { isFeatureEnabled } = useConfig();
    const { isSuperAdmin, isAdmin } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Productos', icon: <Package size={20} />, path: '/productos' },
        { name: 'Categorías', icon: <Tags size={20} />, path: '/categorias' },
        { name: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
        { name: 'Proveedores', icon: <Truck size={20} />, path: '/proveedores' },
        { name: 'Ofertas', icon: <Percent size={20} />, path: '/ofertas', feature: 'offers' },
        { name: 'Compras', icon: <ShoppingCart size={20} />, path: '/compras' },
        { name: 'Ventas', icon: <FileText size={20} />, path: '/ventas' },
        { name: 'Logs', icon: <History size={20} />, path: '/logs' },
        { name: 'Reportes', icon: <BarChart3 size={20} />, path: '/reportes' },
        { name: 'Configuración', icon: <SettingsIcon size={20} />, path: '/config' },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        // Primero chequear si la feature está prendida
        if (item.feature && !isFeatureEnabled(item.feature)) return false;

        // Luego chequear permisos por rol
        if (item.path === '/config' && !isAdmin) return false;
        if (item.path === '/ofertas' && !isAdmin) return false;

        return true;
    });

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="collapse-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="sidebar-menu">
                {filteredMenuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.name : ''}
                    >
                        <span className="menu-icon">{item.icon}</span>
                        {!isCollapsed && <span className="menu-text">{item.name}</span>}
                    </NavLink>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
