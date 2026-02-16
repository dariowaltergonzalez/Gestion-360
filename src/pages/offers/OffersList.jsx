import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    ArrowLeft,
    Search,
    Filter,
    Edit2,
    Power,
    Calendar,
    Tag,
    Layers,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { offerService } from '../../services/offerService';
import '../../styles/Management.css';

const OffersList = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const data = await offerService.getAllOffers();
            setOffers(data);
        } catch (error) {
            console.error("Error loading offers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (window.confirm(`¿Está seguro de ${currentStatus ? 'desactivar' : 'activar'} esta oferta?`)) {
            try {
                await offerService.toggleOfferStatus(id, currentStatus);
                fetchOffers();
            } catch (error) {
                alert("Error al cambiar el estado de la oferta");
            }
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    const getOfferBadgeClass = (type) => {
        switch (type) {
            case 'Porcentual': return 'badge-info';
            case 'DescuentoFijo': return 'badge-success';
            case 'PrecioEspecial': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    const filteredOffers = offers.filter(offer => {
        const matchesSearch = offer.Nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const isCurrentlyActive = offer.Activo &&
            new Date(offer.FechaInicio) <= new Date() &&
            new Date(offer.FechaFin) >= new Date();

        const matchesStatus = filterStatus === 'Todos' ||
            (filterStatus === 'Activas' && isCurrentlyActive) ||
            (filterStatus === 'Inactivas' && !offer.Activo) ||
            (filterStatus === 'Expiradas' && new Date(offer.FechaFin) < new Date());

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>Gestión de Ofertas</h1>
                </div>
                <div className="header-actions">
                    <button onClick={() => navigate('/ofertas/nuevo')} className="btn-primary">
                        <Plus size={18} /> Crear Oferta
                    </button>
                </div>
            </div>

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
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="Todos">Todos los Estados</option>
                            <option value="Activas">Solo Vigentes</option>
                            <option value="Inactivas">Pausadas</option>
                            <option value="Expiradas">Expiradas</option>
                        </select>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre de Oferta</th>
                            <th>Alcance / Tipo</th>
                            <th>Vigencia</th>
                            <th>Valor / Descuento</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Cargando ofertas...</td></tr>
                        ) : filteredOffers.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No se encontraron ofertas</td></tr>
                        ) : filteredOffers.map(offer => {
                            const isExpired = new Date(offer.FechaFin) < new Date();
                            const isUpcoming = new Date(offer.FechaInicio) > new Date();

                            return (
                                <tr key={offer.id} className={!offer.Activo || isExpired ? 'row-inactive' : ''}>
                                    <td>
                                        <div className="fw-bold">{offer.Nombre}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{offer.Descripcion}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1">
                                            <span className="badge badge-light" style={{ width: 'fit-content' }}>
                                                <Layers size={12} style={{ marginRight: '4px' }} /> {offer.Alcance}
                                            </span>
                                            <span className={`badge ${getOfferBadgeClass(offer.Tipo)}`} style={{ width: 'fit-content' }}>
                                                <Tag size={12} style={{ marginRight: '4px' }} /> {offer.Tipo}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <Calendar size={12} style={{ marginRight: '4px' }} />
                                            {formatDate(offer.FechaInicio)} - {formatDate(offer.FechaFin)}
                                        </div>
                                        {isUpcoming && <div className="text-info" style={{ fontSize: '0.75rem' }}>Próximamente</div>}
                                        {isExpired && <div className="text-danger" style={{ fontSize: '0.75rem' }}>Expirada</div>}
                                    </td>
                                    <td>
                                        <div className="fw-bold fs-5">
                                            {offer.Tipo === 'Porcentual' ? `${offer.porcentajeDescuento}% OFF` :
                                                offer.Tipo === 'DescuentoFijo' ? `$${offer.descuentoFijo} OFF` :
                                                    `$${offer.precioEspecial} (Fijo)`}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${offer.Activo && !isExpired ? 'badge-active' : 'badge-inactive'}`}>
                                            {offer.Activo ? (isExpired ? 'Expirada' : 'Activa') : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-icon-btn"
                                            title="Editar"
                                            onClick={() => navigate(`/ofertas/editar/${offer.id}`)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className={`action-icon-btn ${offer.Activo ? 'action-delete' : 'action-activate'}`}
                                            title={offer.Activo ? 'Desactivar' : 'Activar'}
                                            onClick={() => handleToggleStatus(offer.id, offer.Activo)}
                                        >
                                            <Power size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <span className="text-muted">Mostrando {filteredOffers.length} ofertas</span>
                    <div className="pagination-btns">
                        <button className="btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
                        <button className="btn-secondary btn-sm" disabled><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffersList;
