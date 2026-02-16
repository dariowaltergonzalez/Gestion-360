import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Tag,
    Layers,
    Calendar,
    Target,
    Percent,
    DollarSign,
    Package,
    LayoutGrid
} from 'lucide-react';
import { offerService } from '../../services/offerService';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import '../../styles/Management.css';

const OfferForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        Nombre: '',
        Descripcion: '',
        Alcance: 'General', // General, Categoria, Articulo
        Tipo: 'Porcentual', // Porcentual, DescuentoFijo, PrecioEspecial
        ProductoId: '',
        CategoriaId: '',
        porcentajeDescuento: 0,
        descuentoFijo: 0,
        precioEspecial: 0,
        FechaInicio: '',
        FechaFin: '',
        Prioridad: 0,
        BannerUrl: '',
        Activo: true
    });

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadDependecies();
        if (isEditing) {
            fetchOffer();
        }
    }, [id]);

    const loadDependecies = async () => {
        try {
            const [cats, prods] = await Promise.all([
                categoryService.getAllCategories(),
                productService.getAllProducts()
            ]);
            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error("Error loading dependencies:", error);
        }
    };

    const fetchOffer = async () => {
        setLoading(true);
        try {
            const allOffers = await offerService.getAllOffers();
            const offer = allOffers.find(o => o.id === id);
            if (offer) {
                setFormData({
                    ...offer,
                    FechaInicio: offer.FechaInicio?.toISOString().split('T')[0] || '',
                    FechaFin: offer.FechaFin?.toISOString().split('T')[0] || ''
                });
            }
        } catch (error) {
            console.error("Error fetching offer:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                FechaInicio: new Date(formData.FechaInicio),
                FechaFin: new Date(formData.FechaFin),
                // Asegurar que los números sean números
                porcentajeDescuento: Number(formData.porcentajeDescuento),
                descuentoFijo: Number(formData.descuentoFijo),
                precioEspecial: Number(formData.precioEspecial),
                Prioridad: Number(formData.Prioridad)
            };

            if (isEditing) {
                await offerService.updateOffer(id, dataToSave);
            } else {
                await offerService.createOffer(dataToSave);
            }
            navigate('/ofertas');
        } catch (error) {
            console.error("Error saving offer:", error);
            alert("Error al guardar la oferta");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="management-container"><p>Cargando...</p></div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/ofertas')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>{isEditing ? 'Editar' : 'Nueva'} Oferta</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="management-card form-grid-layout">
                <div className="form-section">
                    <h3 className="section-title"><Tag size={18} /> Información Básica</h3>

                    <div className="form-group">
                        <label>Nombre de la Oferta <span className="text-danger">*</span></label>
                        <input
                            name="Nombre"
                            value={formData.Nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Hot Sale 20% OFF"
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción / Slogan</label>
                        <textarea
                            name="Descripcion"
                            value={formData.Descripcion}
                            onChange={handleChange}
                            placeholder="Frase que aparecerá en el banner del catálogo..."
                            rows="2"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Layers size={14} /> Alcance</label>
                            <select name="Alcance" value={formData.Alcance} onChange={handleChange}>
                                <option value="General">General (Todos los productos)</option>
                                <option value="Categoria">Por Categoría</option>
                                <option value="Articulo">Por Artículo Específico</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Target size={14} /> Tipo de Descuento</label>
                            <select name="Tipo" value={formData.Tipo} onChange={handleChange}>
                                <option value="Porcentual">Porcentual (%)</option>
                                <option value="DescuentoFijo">Monto Fijo ($ de descuento)</option>
                                <option value="PrecioEspecial">Precio Especial (Setear Precio Final)</option>
                            </select>
                        </div>
                    </div>

                    {formData.Alcance === 'Categoria' && (
                        <div className="form-group">
                            <label><LayoutGrid size={14} /> Seleccionar Categoría</label>
                            <select name="CategoriaId" value={formData.CategoriaId} onChange={handleChange} required>
                                <option value="">Seleccione una categoría...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.Nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.Alcance === 'Articulo' && (
                        <div className="form-group">
                            <label><Package size={14} /> Seleccionar Producto</label>
                            <select name="ProductoId" value={formData.ProductoId} onChange={handleChange} required>
                                <option value="">Seleccione un producto...</option>
                                {products.map(prod => (
                                    <option key={prod.id} value={prod.id}>{prod.Nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h3 className="section-title"><DollarSign size={18} /> Valores y Vigencia</h3>

                    <div className="form-row">
                        {formData.Tipo === 'Porcentual' && (
                            <div className="form-group">
                                <label><Percent size={14} /> Porcentaje de Descuento</label>
                                <input
                                    type="number"
                                    name="porcentajeDescuento"
                                    value={formData.porcentajeDescuento}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        {formData.Tipo === 'DescuentoFijo' && (
                            <div className="form-group">
                                <label><DollarSign size={14} /> Monto a Descontar ($)</label>
                                <input
                                    type="number"
                                    name="descuentoFijo"
                                    value={formData.descuentoFijo}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        {formData.Tipo === 'PrecioEspecial' && (
                            <div className="form-group">
                                <label><DollarSign size={14} /> Precio Final de Oferta ($)</label>
                                <input
                                    type="number"
                                    name="precioEspecial"
                                    value={formData.precioEspecial}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Prioridad (1-10)</label>
                            <input
                                type="number"
                                name="Prioridad"
                                value={formData.Prioridad}
                                onChange={handleChange}
                                min="0" max="10"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Calendar size={14} /> Fecha Inicio</label>
                            <input
                                type="date"
                                name="FechaInicio"
                                value={formData.FechaInicio}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Calendar size={14} /> Fecha Fin</label>
                            <input
                                type="date"
                                name="FechaFin"
                                value={formData.FechaFin}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="Activo"
                                checked={formData.Activo}
                                onChange={handleChange}
                            />
                            Oferta Habilitada
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/ofertas')} className="btn-secondary" disabled={isSaving}>
                        <X size={18} /> Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSaving}>
                        <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Oferta'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OfferForm;
