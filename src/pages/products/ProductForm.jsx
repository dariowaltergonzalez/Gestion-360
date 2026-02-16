import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, XCircle, CheckCircle2 } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import '../../styles/Management.css';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        Nombre: '',
        Descripcion: '',
        Precio: '',
        StockActual: '',
        StockMinimo: '',
        IdCategoria: '',
        FechaVencimiento: ''
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchProductData();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getActiveCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };

    const fetchProductData = async () => {
        try {
            const allProducts = await productService.getAllProducts();
            const product = allProducts.find(p => p.id === id);
            if (product) {
                const { SKU, ...rest } = product; // Ignoramos SKU si existía
                setFormData({
                    ...rest,
                    Precio: product.Precio?.toString() || '',
                    StockActual: product.StockActual?.toString() || '',
                    StockMinimo: product.StockMinimo?.toString() || ''
                });
            }
        } catch (error) {
            console.error("Error al cargar datos del producto:", error);
        }
    };

    const validateField = (name, value) => {
        let error = '';
        if (name === 'Nombre' && !value) error = 'El nombre es obligatorio';
        if (name === 'Precio' && (value === '' || value <= 0)) error = 'El precio debe ser mayor a 0';
        if (name === 'StockActual' && (value === '' || value < 0)) error = 'El stock no puede ser negativo';
        if (name === 'IdCategoria' && !value) error = 'Seleccione una categoría';

        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['Nombre', 'Precio', 'StockActual', 'IdCategoria'];
        const newErrors = {};
        let isValid = true;

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        if (!isValid) {
            setErrors(newErrors);
            alert("Por favor, complete todos los campos obligatorios.");
            return;
        }

        setSubmitting(true);
        try {
            const dataToSave = {
                ...formData,
                Precio: Number(formData.Precio),
                StockActual: Number(formData.StockActual),
                StockMinimo: Number(formData.StockMinimo || 0)
            };

            if (isEditing) {
                await productService.updateProduct(id, dataToSave);
            } else {
                await productService.createProduct(dataToSave);
            }
            navigate('/productos', {
                state: {
                    message: `Producto ${isEditing ? 'actualizado' : 'creado'} con éxito`
                }
            });
        } catch (error) {
            console.error("Error saving product:", error);
            setMessage({ type: 'error', text: error.message || 'Error al guardar el producto' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/productos')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
                </div>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-4`}>
                    {message.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    {message.text}
                </div>
            )}

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className={`form-group ${errors.Nombre ? 'error' : ''}`}>
                            <label>Nombre del Producto <span className="text-danger">*</span></label>
                            <input
                                name="Nombre"
                                value={formData.Nombre}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Ej: Taladro Percutor Pro"
                            />
                            {errors.Nombre && <span className="error-message">{errors.Nombre}</span>}
                        </div>

                        <div className={`form-group ${errors.IdCategoria ? 'error' : ''}`}>
                            <label>Categoría <span className="text-danger">*</span></label>
                            <select name="IdCategoria" value={formData.IdCategoria} onChange={handleChange} onBlur={handleBlur}>
                                <option value="">Seleccione una categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.Nombre}</option>
                                ))}
                            </select>
                            {errors.IdCategoria && <span className="error-message">{errors.IdCategoria}</span>}
                        </div>

                        <div className={`form-group ${errors.Precio ? 'error' : ''}`}>
                            <label>Precio de Venta ($) <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                name="Precio"
                                value={formData.Precio}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {errors.Precio && <span className="error-message">{errors.Precio}</span>}
                        </div>

                        <div className={`form-group ${errors.StockActual ? 'error' : ''}`}>
                            <label>Stock Actual <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                name="StockActual"
                                value={formData.StockActual}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                            {errors.StockActual && <span className="error-message">{errors.StockActual}</span>}
                        </div>

                        <div className={`form-group`}>
                            <label>Stock Mínimo (Alerta)</label>
                            <input
                                type="number"
                                name="StockMinimo"
                                value={formData.StockMinimo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label>Descripción</label>
                        <textarea
                            name="Descripcion"
                            value={formData.Descripcion}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/productos')} className="btn-secondary">
                            <XCircle size={18} /> Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            <Save size={18} /> {submitting ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
