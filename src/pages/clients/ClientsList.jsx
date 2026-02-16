import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    ArrowLeft,
    Search,
    Filter,
    Edit2,
    Power,
    FileDown,
    ChevronLeft,
    ChevronRight,
    Users,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { clientService } from '../../services/clientService';
import '../../styles/Management.css';

const ClientsList = ({ initialType = 'Todos' }) => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [filterType, setFilterType] = useState(initialType);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage({ type: 'success', text: location.state.message });
            window.scrollTo(0, 0);
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            window.history.replaceState({}, document.title);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        setFilterType(initialType);
    }, [initialType]);

    const fetchClients = async () => {
        try {
            const data = await clientService.getAllClients();
            setClients(data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (window.confirm(`¿Está seguro de ${currentStatus ? 'desactivar' : 'activar'} este registro?`)) {
            try {
                await clientService.toggleStatus(id, currentStatus);
                setMessage({ type: 'success', text: `Registro ${currentStatus ? 'desactivado' : 'activado'} con éxito` });
                window.scrollTo(0, 0);
                fetchClients();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                console.error("Error toggling status:", error);
                setMessage({ type: 'error', text: 'Error al cambiar estado' });
            }
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const now = new Date();
            const timestamp = now.toLocaleString();
            const fileName = `Reporte_Clientes_${now.getFullYear()}${(now.getMonth() + 1)}${now.getDate()}_${now.getHours()}${now.getMinutes()}.pdf`;

            doc.setFontSize(18);
            doc.text("Gestión 360", 14, 20);
            doc.setFontSize(12);
            doc.text("Reporte: Clientes y Proveedores", 14, 28);
            doc.setFontSize(10);
            doc.text(`Fecha: ${timestamp}`, 14, 35);
            doc.text(`Filtros: Tipo: ${filterType} | Estado: ${filterStatus}`, 14, 40);

            const tableData = filteredClients.map(c => [
                c.id?.substring(0, 8).toUpperCase(),
                c.Nombre + (c.Apellido ? ` ${c.Apellido}` : ''),
                c.Tipo,
                c.Email || '-',
                c.Telefono || '-',
                c.Activo ? 'Activo' : 'Inactivo'
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['ID', 'Nombre/Razon Social', 'Tipo', 'Email', 'Teléfono', 'Estado']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [67, 97, 238] }
            });

            doc.save(fileName);
        } catch (err) {
            console.error("Error al generar PDF:", err);
            alert("No se pudo generar el PDF");
        }
    };

    const filteredClients = clients.filter(c => {
        const matchesStatus = filterStatus === 'Todos' ||
            (filterStatus === 'Activos' && c.Activo) ||
            (filterStatus === 'Inactivos' && !c.Activo);
        const matchesType = filterType === 'Todos' || c.Tipo === filterType;
        const matchesSearch = c.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.Apellido && c.Apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.RazonSocial && c.RazonSocial.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesType && matchesSearch;
    });

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>Gestión de {filterType === 'Todos' ? 'Clientes y Prov.' : `${filterType}s`}</h1>
                </div>
                <div className="header-actions">
                    <button onClick={exportToPDF} className="btn-secondary" title="Exportar PDF">
                        <FileDown size={18} /> Reporte PDF
                    </button>
                    <button
                        onClick={() => navigate(`/clientes/nuevo?type=${filterType === 'Todos' ? 'Cliente' : filterType}`)}
                        className="btn-primary"
                    >
                        <Plus size={18} /> Agregar {filterType === 'Todos' ? 'Cliente/Prov' : filterType}
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`} style={{ position: 'sticky', top: '20px', zIndex: 1000 }}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <div style={{ flex: 1 }}>{message.text}</div>
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="management-card">
                <div className="filters-bar">
                    <div className="search-box-std">
                        <Search size={18} className="search-icon-std" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="status-filter">
                        <Filter size={18} />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="Todos">Todos los Tipos</option>
                            <option value="Cliente">Solo Clientes</option>
                            <option value="Proveedor">Solo Proveedores</option>
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="Todos">Todos los Estados</option>
                            <option value="Activos">Solo Activos</option>
                            <option value="Inactivos">Solo Inactivos</option>
                        </select>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre / Razón Social</th>
                            <th>Tipo</th>
                            <th>Contacto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Cargando datos...</td></tr>
                        ) : filteredClients.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No se encontraron registros</td></tr>
                        ) : filteredClients.map(client => (
                            <tr key={client.id} className={!client.Activo ? 'row-inactive' : ''}>
                                <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    #{client.id?.substring(0, 8).toUpperCase()}
                                </td>
                                <td>
                                    <div className="fw-bold">{client.Nombre} {client.Apellido}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{client.RazonSocial}</div>
                                </td>
                                <td>
                                    <span className={`badge ${client.Tipo === 'Cliente' ? 'badge-info' : 'badge-warning'}`}>
                                        {client.Tipo}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.9rem' }}>{client.Email || '-'}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{client.Telefono || '-'}</div>
                                </td>
                                <td>
                                    <span className={`badge ${client.Activo ? 'badge-active' : 'badge-inactive'}`}>
                                        {client.Activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="action-icon-btn"
                                        title="Editar"
                                        onClick={() => navigate(`/clientes/editar/${client.id}`)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`action-icon-btn ${client.Activo ? 'action-delete' : 'action-activate'}`}
                                        title={client.Activo ? 'Desactivar' : 'Activar'}
                                        onClick={() => handleToggleStatus(client.id, client.Activo)}
                                    >
                                        <Power size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <span className="text-muted">Mostrando {filteredClients.length} registros</span>
                    <div className="pagination-btns">
                        <button className="btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
                        <button className="btn-secondary btn-sm" disabled><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientsList;
