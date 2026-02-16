import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    Users,
    Truck,
    ShoppingCart,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    History
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Productos', icon: <Package size={20} />, path: '/productos' },
        { name: 'Categorías', icon: <Tags size={20} />, path: '/categorias' },
        { name: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
        { name: 'Proveedores', icon: <Truck size={20} />, path: '/proveedores' },
        { name: 'Compras', icon: <ShoppingCart size={20} />, path: '/compras' },
        { name: 'Ventas', icon: <FileText size={20} />, path: '/ventas' },
        { name: 'Logs', icon: <History size={20} />, path: '/logs' },
        { name: 'Reportes', icon: <BarChart3 size={20} />, path: '/reportes' },
        { name: 'Configuración', icon: <Settings size={20} />, path: '/config' },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="collapse-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <div className="sidebar-menu">
                {menuItems.map((item) => (
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
