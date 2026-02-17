import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Paperclip,
    FileDown
} from 'lucide-react';
import { saleService } from '../../services/saleService'; // NEW Service
import { priceUtils } from '../../utils/priceUtils';
import { generatePurchasePDF, generateSalesReport } from '../../utils/pdfUtils'; // TODO: Update to generateSalePDF
import '../../styles/Management.css';

const SalesList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todas');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ... (useEffect and fetchSales remain same) ...

    useEffect(() => {
        fetchSales();

        if (location.state?.message) {
            setMessage({ type: 'success', text: location.state.message });
            window.scrollTo(0, 0);
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const data = await saleService.getAllSales();
            setSales(data);
        } catch (error) {
            console.error("Error fetching sales:", error);
            setMessage({ type: 'error', text: 'Error al cargar las ventas' });
        } finally {
            setLoading(false);
        }
    };

    // Filtrado
    const filteredSales = sales.filter(sale => {
        const matchesSearch =
            sale.Codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.ClienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()); // Changed to ClienteNombre

        const matchesStatus = statusFilter === 'Todas' || sale.Estado === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const currentItems = filteredSales.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completada': return <span className="badge badge-success"><CheckCircle2 size={12} /> Completada</span>;
            case 'Cancelada': return <span className="badge badge-inactive"><XCircle size={12} /> Cancelada</span>;
            case 'Pendiente': return <span className="badge badge-warning"><Clock size={12} /> Pendiente</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    // Placeholder for PDF generation until generateSalePDF is ready
    const handleGeneratePDF = (sale) => {
        // We'll use the existing generator for now, but strictly it should be a Sale PDF
        // passing 'isSale: true' if we modify the util, or just sending consistent data
        const pdfData = {
            ...sale,
            TipoDocumento: 'Venta'
        };
        generatePurchasePDF(pdfData);
    };

    return (
        <div className="management-container">
            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`} style={{ position: 'sticky', top: '20px', zIndex: 1000 }}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <div style={{ flex: 1 }}>{message.text}</div>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="close-btn">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <ArrowLeft size={18} /> Dashboard
                    </button>
                    <h1>Gestión de Ventas</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => generateSalesReport(filteredSales)}
                        disabled={filteredSales.length === 0}
                        title="Exportar PDF"
                    >
                        <FileDown size={18} /> Reporte PDF
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/ventas/nueva')}
                    >
                        <Plus size={20} /> Nueva Venta
                    </button>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box-std">
                    <Search className="search-icon-std" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código o cliente..."
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
                        <option value="Completada">Completadas</option>
                        <option value="Pendiente">Pendientes</option>
                        <option value="Cancelada">Canceladas</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando ventas...</div>
            ) : (
                <>
                    <div className="management-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Código</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'center' }}>Adjunto</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((sale) => (
                                        <tr key={sale.id}>
                                            <td>{sale.FechaCreacion?.toLocaleDateString()}</td>
                                            <td><strong>{sale.Codigo}</strong></td>
                                            <td>{sale.ClienteNombre}</td>
                                            <td>{priceUtils.formatPrice(sale.TotalConIVA)}</td>
                                            <td>{getStatusBadge(sale.Estado)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {sale.ArchivoAdjunto && (
                                                    <button
                                                        className="action-icon-btn"
                                                        title="Ver archivo adjunto"
                                                        onClick={() => window.open(sale.ArchivoAdjunto, '_blank')}
                                                        style={{ color: '#4361ee' }}
                                                    >
                                                        <Paperclip size={18} />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="actions-cell" style={{ justifyContent: 'center' }}>
                                                {/* Only PDF and Attachment view actions for now */}
                                                <button
                                                    className="action-icon-btn"
                                                    title="Ver PDF"
                                                    onClick={() => handleGeneratePDF(sale)}
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            No se encontraron ventas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-footer">
                            <span>Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredSales.length)} de {filteredSales.length} ventas</span>
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

export default SalesList;
