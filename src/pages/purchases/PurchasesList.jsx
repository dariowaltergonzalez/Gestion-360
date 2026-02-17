import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Edit,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Paperclip
} from 'lucide-react';
import { purchaseService } from '../../services/purchaseService';
import { priceUtils } from '../../utils/priceUtils';
import { generatePurchasePDF, generatePurchasesReport } from '../../utils/pdfUtils';
import '../../styles/Management.css';

const PurchasesList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todas');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchPurchases();

        // Cargar mensaje desde la navegación si existe
        if (location.state?.message) {
            setMessage({ type: 'success', text: location.state.message });
            window.scrollTo(0, 0);
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            window.history.replaceState({}, document.title);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllPurchases();
            setPurchases(data);
        } catch (error) {
            console.error("Error fetching purchases:", error);
            setMessage({ type: 'error', text: 'Error al cargar las compras' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (purchase, newStatus) => {
        if (purchase.Estado === 'Recibida') {
            alert('No se puede cambiar el estado de una compra ya recibida.');
            return;
        }

        const confirmMsg = newStatus === 'Recibida'
            ? '¿Estás seguro de marcar esta compra como RECIBIDA? Esto sumará el stock automáticamente.'
            : `¿Estás seguro de cambiar el estado a ${newStatus}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            await purchaseService.updatePurchaseStatus(purchase.id, newStatus, purchase);
            setMessage({ type: 'success', text: `Compra ${purchase.Codigo} actualizada a ${newStatus}` });
            fetchPurchases();
            window.scrollTo(0, 0);
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        } catch (error) {
            console.error("Error updating status:", error);
            setMessage({ type: 'error', text: 'Error al actualizar el estado' });
        }
    };

    // Filtrado
    const filteredPurchases = purchases.filter(purchase => {
        const matchesSearch =
            purchase.Codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.ProveedorNombre?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'Todas' || purchase.Estado === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Lógica de paginación
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Recibida': return <span className="badge badge-success"><CheckCircle2 size={12} /> Recibida</span>;
            case 'Cancelada': return <span className="badge badge-inactive"><XCircle size={12} /> Cancelada</span>;
            case 'Pendiente': return <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}><Clock size={12} /> Pendiente</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div className="management-container">
            {/* Alertas Sticky */}
            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`} style={{ position: 'sticky', top: '20px', zIndex: 1000 }}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <div style={{ flex: 1 }}>{message.text}</div>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <ArrowLeft size={18} /> Dashboard
                    </button>
                    <h1>Gestión de Compras (Stock)</h1>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/compras/nueva')}
                >
                    <Plus size={20} /> Nueva Compra
                </button>
            </div>

            <div className="filters-bar">
                <div className="search-box-std">
                    <Search className="search-icon-std" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código o proveedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <Filter size={20} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="Todas">Todos los Estados</option>
                        <option value="Pendiente">Pendientes</option>
                        <option value="Recibida">Recibidas</option>
                        <option value="Cancelada">Canceladas</option>
                    </select>
                </div>
                <button className="btn-secondary" onClick={() => generatePurchasesReport(filteredPurchases)}>
                    <FileText size={20} /> Exportar PDF
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Cargando compras...</div>
            ) : (
                <>
                    <div className="management-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Código</th>
                                    <th>Proveedor</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'center' }}>Adjunto</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((purchase) => (
                                        <tr key={purchase.id}>
                                            <td>{purchase.FechaCreacion?.toLocaleDateString()}</td>
                                            <td><strong>{purchase.Codigo}</strong></td>
                                            <td>{purchase.ProveedorNombre}</td>
                                            <td>{priceUtils.formatPrice(purchase.TotalConIVA)}</td>
                                            <td>{getStatusBadge(purchase.Estado)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {purchase.ArchivoAdjunto && (
                                                    <button
                                                        className="action-icon-btn"
                                                        title="Ver archivo adjunto"
                                                        onClick={() => window.open(purchase.ArchivoAdjunto, '_blank')}
                                                        style={{ color: '#4361ee' }}
                                                    >
                                                        <Paperclip size={18} />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="actions-cell" style={{ justifyContent: 'center' }}>
                                                <button
                                                    className="action-icon-btn"
                                                    title="Editar"
                                                    onClick={() => navigate(`/compras/editar/${purchase.id}`)}
                                                    disabled={purchase.Estado === 'Recibida'}
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                {purchase.Estado === 'Pendiente' && (
                                                    <>
                                                        <button
                                                            className="action-icon-btn"
                                                            title="Marcar como Recibida"
                                                            onClick={() => handleStatusChange(purchase, 'Recibida')}
                                                            style={{ color: 'var(--success)' }}
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button
                                                            className="action-icon-btn action-delete"
                                                            title="Cancelar"
                                                            onClick={() => handleStatusChange(purchase, 'Cancelada')}
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    className="action-icon-btn"
                                                    title="Ver PDF"
                                                    onClick={() => generatePurchasePDF(purchase)}
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            No se encontraron compras.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-footer">
                            <span>Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredPurchases.length)} de {filteredPurchases.length} compras</span>
                            <div className="pagination-btns" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn-secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    className="btn-secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchasesList;
