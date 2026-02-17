import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    X,
    Plus,
    Trash2,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Calendar,
    User,
    CreditCard,
    FileText
} from 'lucide-react';
import { purchaseService } from '../../services/purchaseService';
import { productService } from '../../services/productService';
import { clientService } from '../../services/clientService';
import { priceUtils } from '../../utils/priceUtils';
import { generatePurchasePDF } from '../../utils/pdfUtils';
import '../../styles/Management.css';

const PurchaseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [providers, setProviders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        Fecha: new Date().toISOString().split('T')[0],
        IdProveedor: '',
        ProveedorNombre: '',
        Estado: 'Pendiente',
        FormaPago: 'Efectivo',
        Observaciones: '',
        IVA_Porcentaje: 21,
        Codigo: ''
    });

    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        IdProducto: '',
        Nombre: '',
        Cantidad: 1,
        PrecioUnitario: 0
    });

    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [provs, prods] = await Promise.all([
                clientService.getAllClients(),
                productService.getAllProducts()
            ]);

            setProviders(provs.filter(c => c.Tipo === 'Proveedor' && c.Activo));
            setProducts(prods.filter(p => p.Activo));

            if (isEditing) {
                const purchase = await purchaseService.getPurchaseById(id);
                if (purchase) {
                    setFormData({
                        Fecha: purchase.FechaCreacion?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                        IdProveedor: purchase.IdProveedor,
                        ProveedorNombre: purchase.ProveedorNombre,
                        Estado: purchase.Estado,
                        FormaPago: purchase.FormaPago || 'Efectivo',
                        Observaciones: purchase.Observaciones || '',
                        IVA_Porcentaje: purchase.IVA_Porcentaje || 21,
                        Codigo: purchase.Codigo
                    });
                    setItems(purchase.Items || []);
                }
            }
        } catch (error) {
            console.error("Error loading form data:", error);
            setMessage({ type: 'error', text: 'Error al cargar los datos necesarios' });
        } finally {
            setLoading(false);
        }
    };

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        if (name === 'IdProveedor') {
            const provider = providers.find(p => p.id === value);
            setFormData(prev => ({
                ...prev,
                IdProveedor: value,
                ProveedorNombre: provider ? provider.Nombre : ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        if (name === 'IdProducto') {
            const product = products.find(p => p.id === value);
            setNewItem(prev => ({
                ...prev,
                IdProducto: value,
                Nombre: product ? product.Nombre : '',
                PrecioUnitario: product ? Number(product.Precio) : 0
            }));
        } else {
            setNewItem(prev => ({ ...prev, [name]: value }));
        }
    };

    const addItem = () => {
        if (!newItem.IdProducto || newItem.Cantidad <= 0) {
            alert('Selecciona un producto y cantidad válida');
            return;
        }

        const subtotal = Number(newItem.Cantidad) * Number(newItem.PrecioUnitario);
        setItems([...items, { ...newItem, Subtotal: subtotal }]);
        setNewItem({ IdProducto: '', Nombre: '', Cantidad: 1, PrecioUnitario: 0 });
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const { subtotal, iva, total } = (() => {
        const s = items.reduce((acc, item) => acc + item.Subtotal, 0);
        const i = s * (formData.IVA_Porcentaje / 100);
        return { subtotal: s, iva: i, total: s + i };
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            setMessage({ type: 'error', text: 'Debes agregar al menos un producto' });
            return;
        }
        if (!formData.IdProveedor) {
            setMessage({ type: 'error', text: 'Debes seleccionar un proveedor' });
            return;
        }

        try {
            setIsSaving(true);
            const purchaseData = {
                ...formData,
                Items: items,
                Subtotal: subtotal,
                IVA: iva,
                TotalConIVA: total
            };

            await purchaseService.createPurchase(purchaseData);
            navigate('/compras', { state: { message: 'Compra registrada con éxito' } });
        } catch (error) {
            console.error("Error saving purchase:", error);
            setMessage({ type: 'error', text: 'Error al registrar la compra' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="loading-state">Cargando formulario...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/compras')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>{isEditing ? 'Editar Compra' : 'Nueva Compra'}</h1>
                </div>
                {isEditing && (
                    <button type="button" className="btn-secondary" onClick={() => generatePurchasePDF({ ...formData, Items: items, Subtotal: subtotal, IVA: iva, TotalConIVA: total })}>
                        <FileText size={18} /> Descargar PDF
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-4`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="close-btn" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="form-container" style={{ maxWidth: '1000px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><Calendar size={14} /> Fecha</label>
                            <input type="date" name="Fecha" value={formData.Fecha} onChange={handleHeaderChange} required />
                        </div>
                        <div className="form-group">
                            <label><User size={14} /> Proveedor</label>
                            <select name="IdProveedor" value={formData.IdProveedor} onChange={handleHeaderChange} required>
                                <option value="">Seleccionar...</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.Nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estado</label>
                            <select name="Estado" value={formData.Estado} onChange={handleHeaderChange} disabled={isEditing}>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Recibida">Recibida (Suma Stock)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label><CreditCard size={14} /> Pago</label>
                            <select name="FormaPago" value={formData.FormaPago} onChange={handleHeaderChange}>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Cuenta Corriente">Cta Corriente</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
                        <h3>Productos del Pedido</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Producto</label>
                                <select name="IdProducto" value={newItem.IdProducto} onChange={handleNewItemChange}>
                                    <option value="">Buscar...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.Nombre} (Stock: {p.StockActual})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cant.</label>
                                <input type="number" name="Cantidad" value={newItem.Cantidad} onChange={handleNewItemChange} min="1" />
                            </div>
                            <div className="form-group">
                                <label>Costo ($)</label>
                                <input type="number" name="PrecioUnitario" value={newItem.PrecioUnitario} onChange={handleNewItemChange} step="0.01" />
                            </div>
                            <button type="button" className="btn-primary" onClick={addItem} style={{ height: '45px' }}>
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th style={{ textAlign: 'center' }}>Cant.</th>
                                        <th style={{ textAlign: 'right' }}>Costo</th>
                                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                                        <th style={{ textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>Sin productos</td></tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.Nombre}</td>
                                                <td style={{ textAlign: 'center' }}>{item.Cantidad}</td>
                                                <td style={{ textAlign: 'right' }}>{priceUtils.formatPrice(item.PrecioUnitario)}</td>
                                                <td style={{ textAlign: 'right' }}>{priceUtils.formatPrice(item.Subtotal)}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button type="button" className="action-icon-btn action-delete" onClick={() => removeItem(index)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', minWidth: '300px' }}>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <strong>{priceUtils.formatPrice(subtotal)}</strong>
                            </div>
                            <div className="d-flex justify-content-between mb-2 align-items-center">
                                <span>IVA:</span>
                                <select
                                    name="IVA_Porcentaje"
                                    value={formData.IVA_Porcentaje}
                                    onChange={handleHeaderChange}
                                    style={{ padding: '2px 5px', borderRadius: '4px' }}
                                >
                                    {[0, 10.5, 21, 27].map(v => <option key={v} value={v}>{v}%</option>)}
                                </select>
                                <strong>{priceUtils.formatPrice(iva)}</strong>
                            </div>
                            <div className="d-flex justify-content-between fs-5 fw-bold" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                                <span>TOTAL:</span>
                                <span style={{ color: 'var(--primary-color)' }}>{priceUtils.formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label><FileText size={14} /> Observaciones</label>
                        <textarea name="Observaciones" rows="2" value={formData.Observaciones} onChange={handleHeaderChange} placeholder="Notas internas..." />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/compras')} className="btn-secondary">
                            <X size={18} /> Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Compra'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseForm;
