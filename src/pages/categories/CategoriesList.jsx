import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit2,
    Power,
    ChevronLeft,
    ChevronRight,
    Tags,
    ArrowLeft,
    FileDown,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { categoryService } from '../../services/categoryService';
import '../../styles/Management.css';

const CategoriesList = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
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
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (category) => {
        const action = category.Activo ? 'desactivar' : 'activar';
        if (window.confirm(`¿Está seguro de ${action} esta categoría?`)) {
            try {
                await categoryService.toggleStatus(category.id, category.Activo);
                setMessage({ type: 'success', text: `Categoría ${category.Activo ? 'desactivada' : 'activada'} con éxito` });
                window.scrollTo(0, 0);
                fetchCategories();
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
            const fileName = `Reporte_Categorias_${now.getFullYear()}${(now.getMonth() + 1)}${now.getDate()}_${now.getHours()}${now.getMinutes()}.pdf`;

            doc.setFontSize(18);
            doc.text("Gestión 360", 14, 20);
            doc.setFontSize(12);
            doc.text("Reporte: Categorías", 14, 28);
            doc.setFontSize(10);
            doc.text(`Fecha: ${timestamp}`, 14, 35);
            doc.text(`Filtro: ${filterStatus} | Búsqueda: ${searchTerm || 'Todas'}`, 14, 40);

            const tableData = filteredCategories.map(c => [
                c.id?.substring(0, 8).toUpperCase() || 'S/N',
                c.Nombre,
                c.Descripcion || '-',
                c.Activo ? 'Activo' : 'Inactivo'
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Código', 'Nombre', 'Descripción', 'Estado']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [67, 97, 238] }
            });

            doc.save(fileName);
        } catch (err) {
            console.error("Error al generar PDF:", err);
            alert("No se pudo generar el PDF. Revisa la consola para más detalles.");
        }
    };

    const filteredCategories = categories.filter(cat => {
        const matchesSearch = cat.Nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'Todos' ||
            (filterStatus === 'Activos' && cat.Activo) ||
            (filterStatus === 'Inactivos' && !cat.Activo);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>Gestión de Categorías</h1>
                </div>
                <div className="header-actions">
                    <button onClick={exportToPDF} className="btn-secondary" title="Exportar PDF">
                        <FileDown size={18} /> Reporte PDF
                    </button>
                    <button onClick={() => navigate('/categorias/nueva')} className="btn-primary">
                        <Plus size={18} /> Agregar Categoría
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
                        <Search className="search-icon-std" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="status-filter">
                        <span>Estado:</span>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="Todos">Todos</option>
                            <option value="Activos">Activos</option>
                            <option value="Inactivos">Inactivos</option>
                        </select>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Cargando categorías...</td></tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No se encontraron categorías</td></tr>
                        ) : filteredCategories.map((cat) => (
                            <tr key={cat.id} className={!cat.Activo ? 'row-inactive' : ''}>
                                <td>{cat.id?.substring(0, 8).toUpperCase()}</td>
                                <td className="fw-bold">{cat.Nombre}</td>
                                <td>{cat.Descripcion || '-'}</td>
                                <td>
                                    <span className={`badge ${cat.Activo ? 'badge-active' : 'badge-inactive'}`}>
                                        {cat.Activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="action-icon-btn"
                                        onClick={() => navigate(`/categorias/editar/${cat.id}`)}
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`action-icon-btn ${cat.Activo ? 'action-delete' : 'action-activate'}`}
                                        onClick={() => handleToggleStatus(cat)}
                                        title={cat.Activo ? 'Desactivar' : 'Activar'}
                                    >
                                        <Power size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <span className="text-muted">Mostrando {filteredCategories.length} categorías</span>
                    <div className="pagination-controls">
                        <button className="action-icon-btn" disabled><ChevronLeft size={16} /></button>
                        <button className="action-icon-btn" disabled><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesList;
