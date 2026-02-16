import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    User,
    Building2,
    Mail,
    Phone,
    MapPin,
    Info
} from 'lucide-react';
import { clientService } from '../../services/clientService';
import '../../styles/Management.css';

const ClientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        Nombre: '',
        Apellido: '',
        RazonSocial: '',
        Tipo: 'Cliente',
        Email: '',
        Telefono: '',
        Direccion: '',
        codigoPostal: '',
        DNI: '',
        CUIT: '',
        EsResponsableIVA: false,
        Observaciones: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isEditing) {
            fetchClientData();
        }
    }, [id]);

    const fetchClientData = async () => {
        setLoading(true);
        try {
            const allClients = await clientService.getAllClients();
            const client = allClients.find(c => c.id === id);
            if (client) {
                setFormData({
                    ...client,
                    Apellido: client.Apellido || '',
                    RazonSocial: client.RazonSocial || '',
                    Email: client.Email || '',
                    Telefono: client.Telefono || '',
                    Direccion: client.Direccion || '',
                    codigoPostal: client.codigoPostal || '',
                    DNI: client.DNI || '',
                    CUIT: client.CUIT || '',
                    Observaciones: client.Observaciones || ''
                });
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
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

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Nombre.trim()) newErrors.Nombre = 'El nombre o razón social es obligatorio';

        if (formData.Email && !/\S+@\S+\.\S+/.test(formData.Email)) {
            newErrors.Email = 'Email inválido';
        }

        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        if (!isValid) {
            console.log("Validación fallida:", newErrors);
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            // Asegurar que si es proveedor, Nombre y RazonSocial sean consistentes si no hay campo separado
            const finalData = {
                ...formData,
                RazonSocial: formData.Tipo === 'Proveedor' && !formData.RazonSocial
                    ? formData.Nombre
                    : formData.RazonSocial
            };

            if (isEditing) {
                await clientService.updateClient(id, finalData);
            } else {
                await clientService.createClient(finalData);
            }
            navigate('/clientes');
        } catch (error) {
            console.error("Error al guardar cliente:", error);
            alert(error.message || "Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="management-container"><p>Cargando...</p></div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/clientes')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>{isEditing ? 'Editar' : 'Nuevo'} {formData.Tipo}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="management-card form-grid-layout">
                <div className="form-section">
                    <h3 className="section-title"><User size={18} /> Datos Principales</h3>

                    <div className="form-group">
                        <label>Tipo de Registro <span className="text-danger">*</span></label>
                        <select name="Tipo" value={formData.Tipo} onChange={handleChange}>
                            <option value="Cliente">Cliente</option>
                            <option value="Proveedor">Proveedor</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${errors.Nombre ? 'error' : ''}`}>
                            <label>Nombre / Razón Social <span className="text-danger">*</span></label>
                            <input
                                name="Nombre"
                                value={formData.Nombre}
                                onChange={handleChange}
                                placeholder="Ej: Juan Pérez o Distribuidora S.A."
                            />
                            {errors.Nombre && <span className="error-message">{errors.Nombre}</span>}
                        </div>
                        {formData.Tipo === 'Cliente' && (
                            <div className="form-group">
                                <label>Apellido</label>
                                <input
                                    name="Apellido"
                                    value={formData.Apellido}
                                    onChange={handleChange}
                                    placeholder="Solo para personas físicas"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>DNI</label>
                            <input name="DNI" value={formData.DNI} onChange={handleChange} placeholder="Número de documento" />
                        </div>
                        <div className="form-group">
                            <label>CUIT / CUIL</label>
                            <input name="CUIT" value={formData.CUIT} onChange={handleChange} placeholder="Ej: 20-12345678-9" />
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="EsResponsableIVA"
                                checked={formData.EsResponsableIVA}
                                onChange={handleChange}
                            />
                            Responsable Inscripto / IVA
                        </label>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title"><Mail size={18} /> Contacto y Ubicación</h3>

                    <div className="form-row">
                        <div className={`form-group ${errors.Email ? 'error' : ''}`}>
                            <label>Email</label>
                            <div className="input-with-icon">
                                <Mail size={16} />
                                <input name="Email" type="email" value={formData.Email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                            </div>
                            {errors.Email && <span className="error-message">{errors.Email}</span>}
                        </div>
                        <div className="form-group">
                            <label>Teléfono</label>
                            <div className="input-with-icon">
                                <Phone size={16} />
                                <input name="Telefono" value={formData.Telefono} onChange={handleChange} placeholder="Ej: +54 9 11..." />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 2 }}>
                            <label>Dirección</label>
                            <div className="input-with-icon">
                                <MapPin size={16} />
                                <input name="Direccion" value={formData.Direccion} onChange={handleChange} placeholder="Calle, Número, Localidad" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Cod. Postal</label>
                            <input name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} placeholder="Ej: 1425" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Observaciones</label>
                        <textarea
                            name="Observaciones"
                            value={formData.Observaciones}
                            onChange={handleChange}
                            placeholder="Notas adicionales sobre el cliente o proveedor..."
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/clientes')} className="btn-secondary" disabled={isSaving}>
                        <X size={18} /> Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSaving}>
                        <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Registro'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;
