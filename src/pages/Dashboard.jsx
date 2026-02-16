import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Users,
    AlertTriangle,
    ShoppingCart,
    PlusCircle,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser } = useAuth();
    // TODO: Implementar lógica de roles real desde Firestore. 
    // Por ahora, asumimos Admin por defecto para desarrollo.
    const [role, setRole] = useState('Admin');

    // Datos simulados (según Punto 4 de Analisis.md)
    const metrics = {
        ventasMensual: 1250000,
        comprasMensual: 450000,
        gananciaEstimada: 800000,
        saldoCajas: 120500,
        stockCritico: 12,
        clientesTotales: 85,
        usuariosActivos: 3,
        ventasHoy: 15
    };

    const AdminView = () => (
        <div className="dashboard-grid">
            <StatCard
                title="Total Ventas Mensual"
                value={`$${metrics.ventasMensual.toLocaleString()}`}
                icon={<TrendingUp color="var(--success)" />}
                trend="+12%"
            />
            <StatCard
                title="Total Compras Mensual"
                value={`$${metrics.comprasMensual.toLocaleString()}`}
                icon={<TrendingDown color="var(--danger)" />}
                trend="-5%"
            />
            <StatCard
                title="Ganancia Estimada"
                value={`$${metrics.gananciaEstimada.toLocaleString()}`}
                icon={<DollarSign color="var(--primary-color)" />}
                trend="+8.5%"
            />
            <StatCard
                title="Saldo de Cajas"
                value={`$${metrics.saldoCajas.toLocaleString()}`}
                icon={<ShoppingCart color="var(--warning)" />}
            />
            <StatCard
                title="Stock Crítico"
                value={metrics.stockCritico}
                icon={<AlertTriangle color="var(--danger)" />}
                subtitle="Unidades a reponer"
            />
            <StatCard
                title="Clientes Activos"
                value={metrics.clientesTotales}
                icon={<Users color="var(--info)" />}
            />
        </div>
    );

    const OperatorView = () => (
        <div className="dashboard-grid">
            <StatCard
                title="Stock Crítico"
                value={metrics.stockCritico}
                icon={<AlertTriangle color="var(--danger)" />}
                subtitle="Reposición urgente"
            />
            <StatCard
                title="Tus Ventas de Hoy"
                value={`${metrics.ventasHoy} pedidos`}
                icon={<ShoppingCart color="var(--success)" />}
            />
            <div className="quick-actions-card">
                <h3>Accesos Rápidos</h3>
                <div className="actions-grid">
                    <button className="action-btn"><PlusCircle size={20} /> Nueva Venta</button>
                    <button className="action-btn"><Search size={20} /> Consultar Stock</button>
                    <button className="action-btn"><PlusCircle size={20} /> Cargar Cliente</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <h1>{role === 'Admin' ? 'Panel de Control (Admin)' : 'Gestión Operativa'}</h1>
                <p>Bienvenido, {currentUser?.email}</p>
            </div>

            {role === 'Admin' ? <AdminView /> : <OperatorView />}

            <div className="dashboard-charts-placeholder">
                <h3>{role === 'Admin' ? 'Curva de Ventas Diaria' : 'Alertas de Stock'}</h3>
                <div className="chart-box">
                    {/* Placeholder para gráficos del Punto 58/60 */}
                    {role === 'Admin' ? 'Gráfico de Ventas y Ranking de Productos' : 'Lista de productos que llegaron al stock mínimo'}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, subtitle }) => (
    <div className="stat-card-luxury">
        <div className="stat-card-header">
            <span className="stat-title">{title}</span>
            <div className="stat-icon-wrapper">{icon}</div>
        </div>
        <div className="stat-value">{value}</div>
        {(trend || subtitle) && (
            <div className="stat-footer">
                {trend && <span className={`stat-trend ${trend.startsWith('+') ? 'up' : 'down'}`}>{trend}</span>}
                {subtitle && <span className="stat-subtitle">{subtitle}</span>}
            </div>
        )}
    </div>
);

export default Dashboard;
