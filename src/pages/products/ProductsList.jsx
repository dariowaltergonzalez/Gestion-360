import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    ArrowLeft,
    Search,
    Filter,
    Edit2,
    Power,
    FileDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { productService } from '../../services/productService';
import '../../styles/Management.css';

const ProductsList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (window.confirm(`¿Está seguro de ${currentStatus ? 'desactivar' : 'activar'} este producto?`)) {
            try {
                await productService.toggleStatus(id, currentStatus);
                fetchProducts();
            } catch (error) {
                alert("Error al cambiar estado");
            }
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const now = new Date();
            const timestamp = now.toLocaleString();
            const fileName = `Reporte_Productos_${now.getFullYear()}${(now.getMonth() + 1)}${now.getDate()}_${now.getHours()}${now.getMinutes()}.pdf`;

            doc.setFontSize(18);
            doc.text("Gestión 360", 14, 20);
            doc.setFontSize(12);
            doc.text("Reporte: Productos", 14, 28);
            doc.setFontSize(10);
            doc.text(`Fecha: ${timestamp}`, 14, 35);
            doc.text(`Filtro: ${filterStatus} | Búsqueda: ${searchTerm || 'Todos'}`, 14, 40);

            const tableData = filteredProducts.map(p => [
                p.id?.substring(0, 8).toUpperCase(),
                p.Nombre,
                `$${p.Precio?.toLocaleString()}`,
                p.StockActual,
                p.Activo ? 'Activo' : 'Inactivo'
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['ID', 'Nombre', 'Precio', 'Stock', 'Estado']],
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

    const filteredProducts = products.filter(p => {
        const matchesStatus = filterStatus === 'Todos' ||
            (filterStatus === 'Activos' && p.Activo) ||
            (filterStatus === 'Inactivos' && !p.Activo);
        const matchesSearch = p.Nombre.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>Gestión de Productos</h1>
                </div>
                <div className="header-actions">
                    <button onClick={exportToPDF} className="btn-secondary" title="Exportar PDF">
                        <FileDown size={18} /> Reporte PDF
                    </button>
                    <button onClick={() => navigate('/productos/nuevo')} className="btn-primary">
                        <Plus size={18} /> Agregar Producto
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
                            <option value="Activos">Solo Activos</option>
                            <option value="Inactivos">Solo Inactivos</option>
                        </select>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Cargando productos...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No se encontraron productos</td></tr>
                        ) : filteredProducts.map(product => (
                            <tr key={product.id} className={!product.Activo ? 'row-inactive' : ''}>
                                <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    #{product.id?.substring(0, 8).toUpperCase()}
                                </td>
                                <td className="fw-bold">{product.Nombre}</td>
                                <td>${product.Precio?.toLocaleString()}</td>
                                <td>
                                    <span className={product.StockActual <= product.StockMinimo ? 'text-danger fw-bold' : ''}>
                                        {product.StockActual}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${product.Activo ? 'badge-active' : 'badge-inactive'}`}>
                                        {product.Activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="action-icon-btn"
                                        title="Editar"
                                        onClick={() => navigate(`/productos/editar/${product.id}`)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className={`action-icon-btn ${product.Activo ? 'action-delete' : 'action-activate'}`}
                                        title={product.Activo ? 'Desactivar' : 'Activar'}
                                        onClick={() => handleToggleStatus(product.id, product.Activo)}
                                    >
                                        <Power size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination-footer">
                    <span className="text-muted">Mostrando {filteredProducts.length} registros</span>
                    <div className="pagination-btns">
                        <button className="btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
                        <button className="btn-secondary btn-sm" disabled><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsList;
