import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, XCircle, CheckCircle2 } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import '../../styles/Management.css';

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        Nombre: '',
        Descripcion: ''
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isEditing) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const allCategories = await categoryService.getAllCategories();
            const cat = allCategories.find(c => c.id === id);
            if (cat) {
                setFormData({
                    Nombre: cat.Nombre,
                    Descripcion: cat.Descripcion || ''
                });
            }
        } catch (error) {
            console.error("Error al cargar categoría:", error);
        }
    };

    const validateField = (name, value) => {
        let error = '';
        if (name === 'Nombre' && !value) error = 'el nombre es obligatorio';

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

        const error = validateField('Nombre', formData.Nombre);
        if (error) {
            alert("Por favor, complete los campos obligatorios.");
            return;
        }

        setSubmitting(true);
        try {
            if (isEditing) {
                await categoryService.updateCategory(id, formData);
            } else {
                await categoryService.createCategory(formData);
            }
            navigate('/categorias', {
                state: {
                    message: `Categoría ${isEditing ? 'actualizada' : 'creada'} con éxito`
                }
            });
        } catch (error) {
            console.error("Error saving category:", error);
            setMessage({ type: 'error', text: error.message || 'Error al guardar la categoría' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/categorias')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h1>
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
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Nombre de la Categoría <span className="text-danger">*</span></label>
                        <input
                            name="Nombre"
                            value={formData.Nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Ej: Herramientas Eléctricas"
                            className={errors.Nombre ? 'error' : ''}
                        />
                        {errors.Nombre && <span className="error-message">{errors.Nombre}</span>}
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="Descripcion"
                            value={formData.Descripcion}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Breve descripción de los productos incluidos..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/categorias')} className="btn-secondary">
                            <XCircle size={18} /> Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            <Save size={18} /> {submitting ? 'Guardando...' : 'Guardar Categoría'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
