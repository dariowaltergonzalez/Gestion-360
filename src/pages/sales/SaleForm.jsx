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
    FileText,
    Mail
} from 'lucide-react';
import { saleService } from '../../services/saleService';
import { productService } from '../../services/productService';
import { clientService } from '../../services/clientService';
import { fileService } from '../../services/fileService';
import { priceUtils } from '../../utils/priceUtils';
import { generatePurchasePDF } from '../../utils/pdfUtils'; // TODO: Update to generateSalePDF
import FileUpload from '../../components/FileUpload';
import '../../styles/Management.css';

const SaleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [sendEmail, setSendEmail] = useState(false);
    const [clientEmail, setClientEmail] = useState('');

    const [formData, setFormData] = useState({
        Fecha: new Date().toISOString().split('T')[0],
        IdCliente: '',
        ClienteNombre: '',
        Estado: 'Completada', // Default to Completed for Sales
        FormaPago: 'Efectivo',
        Observaciones: '',
        IVA_Porcentaje: 21,
        Codigo: '',
        ArchivoAdjunto: ''
    });

    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        IdProducto: '',
        Nombre: '',
        Cantidad: 1,
        PrecioUnitario: 0,
        StockDisponible: 0
    });

    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [clis, prods] = await Promise.all([
                clientService.getAllClients(),
                productService.getAllProducts()
            ]);

            // Filter for Clients
            setClients(clis.filter(c => c.Tipo === 'Cliente' && c.Activo));
            // Filter active products
            setProducts(prods.filter(p => p.Activo));

            if (isEditing) {
                const sale = await saleService.getSaleById(id);
                if (sale) {
                    setFormData({
                        Fecha: sale.FechaCreacion?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                        IdCliente: sale.IdCliente,
                        ClienteNombre: sale.ClienteNombre,
                        Estado: sale.Estado,
                        FormaPago: sale.FormaPago || 'Efectivo',
                        Observaciones: sale.Observaciones || '',
                        IVA_Porcentaje: sale.IVA_Porcentaje || 21,
                        Codigo: sale.Codigo,
                        ArchivoAdjunto: sale.ArchivoAdjunto || ''
                    });
                    setItems(sale.Items || []);
                    // Note: In editing, checking original stock is complex because we already consumed it. 
                    // For now, simplify editing by not strictly re-validating past items against current stock, 
                    // but preventing *new* additions if shortage.
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
        if (name === 'IdCliente') {
            const client = clients.find(c => c.id === value);
            setFormData(prev => ({
                ...prev,
                IdCliente: value,
                ClienteNombre: client ? client.Nombre : ''
            }));
            setClientEmail(client?.Email || '');
            if (!client?.Email) setSendEmail(false);
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
                PrecioUnitario: product ? Number(product.Precio) : 0,
                StockDisponible: product ? Number(product.StockActual) : 0
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

        // Stock Validation
        if (newItem.Cantidad > newItem.StockDisponible) {
            alert(`Stock insuficiente. Solo hay ${newItem.StockDisponible} unidades disponibles.`);
            return;
        }

        const subtotal = Number(newItem.Cantidad) * Number(newItem.PrecioUnitario);
        setItems([...items, { ...newItem, Subtotal: subtotal }]);
        setNewItem({ IdProducto: '', Nombre: '', Cantidad: 1, PrecioUnitario: 0, StockDisponible: 0 });
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
        if (!formData.IdCliente) {
            setMessage({ type: 'error', text: 'Debes seleccionar un cliente' });
            return;
        }

        try {
            setIsSaving(true);
            const saleData = {
                ...formData,
                Items: items,
                Subtotal: subtotal,
                IVA: iva,
                TotalConIVA: total
            };

            const newSale = await saleService.createSale(saleData);

            if (sendEmail && clientEmail) {
                try {
                    // Generate PDF (Temporary reusing Purchase PDF generator with adjusted data)
                    const pdfData = {
                        ...saleData,
                        Codigo: newSale.Codigo,
                        ClienteNombre: formData.ClienteNombre,
                        FechaCreacion: new Date(),
                        returnBlob: true,
                        TipoDocumento: 'Venta' // Hint for future generator
                    };

                    // We need a proper generateSalePDF, but for now let's use generatePurchasePDF 
                    // knowing it might label "Proveedor" instead of "Cliente".
                    // TODO: Implement proper generateSalePDF
                    const pdfBlob = generatePurchasePDF(pdfData);

                    const pdfFile = new File([pdfBlob], `Venta_${newSale.Codigo}.pdf`, { type: 'application/pdf' });
                    const pdfUrl = await fileService.uploadFile(pdfFile, 'sales');

                    const subject = encodeURIComponent(`Nueva Compra #${newSale.Codigo} - Gestión 360`);
                    const body = encodeURIComponent(`Estimado Cliente,\n\nAdjunto encontrará el detalle de su compra #${newSale.Codigo}.\n\nPuede descargar el documento PDF desde el siguiente enlace:\n${pdfUrl}\n\nSaludos cordiales,\nGestión 360`);

                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${clientEmail}&su=${subject}&body=${body}`;
                    window.open(gmailUrl, '_blank');

                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (emailError) {
                    console.error("Error preparing email:", emailError);
                    alert("La venta se guardó, pero hubo un error al preparar el email: " + emailError.message);
                }
            }

            navigate('/ventas', { state: { message: 'Venta registrada con éxito' } });
        } catch (error) {
            console.error("Error saving sale:", error);
            setMessage({ type: 'error', text: 'Error al registrar la venta: ' + error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="loading-state">Cargando formulario...</div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <button onClick={() => navigate('/ventas')} className="btn-secondary">
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <h1>{isEditing ? 'Editar Venta' : 'Nueva Venta'}</h1>
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
                            <label><User size={14} /> Cliente</label>
                            <select name="IdCliente" value={formData.IdCliente} onChange={handleHeaderChange} required>
                                <option value="">Seleccionar...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.Nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estado</label>
                            <select name="Estado" value={formData.Estado} onChange={handleHeaderChange} disabled={isEditing}>
                                <option value="Completada">Completada</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cancelada">Cancelada</option>
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
                        <h3>Productos de la Venta</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Producto</label>
                                <select name="IdProducto" value={newItem.IdProducto} onChange={handleNewItemChange}>
                                    <option value="">Buscar...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id} disabled={p.StockActual <= 0}>
                                            {p.Nombre} (Stock: {p.StockActual})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cant.</label>
                                <input
                                    type="number"
                                    name="Cantidad"
                                    value={newItem.Cantidad}
                                    onChange={handleNewItemChange}
                                    min="1"
                                    max={newItem.StockDisponible || 1}
                                    disabled={!newItem.IdProducto}
                                    placeholder={!newItem.IdProducto ? 'Seleccionar Producto' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label>Precio ($)</label>
                                <input
                                    type="number"
                                    name="PrecioUnitario"
                                    value={newItem.PrecioUnitario}
                                    onChange={handleNewItemChange}
                                    step="0.01"
                                    disabled={!newItem.IdProducto}
                                />
                            </div>
                            <button type="button" className="btn-primary" onClick={addItem} style={{ height: '45px' }} disabled={!newItem.IdProducto}>
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th style={{ textAlign: 'center' }}>Cant.</th>
                                        <th style={{ textAlign: 'right' }}>Precio</th>
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

                    {/* Email Option */}
                    {formData.IdCliente && clientEmail && (
                        <div className="form-group checkbox-group" style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="sendEmail"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="sendEmail" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                                    <Mail size={18} color="#4361ee" />
                                    <span>Enviar notificación por email al cliente</span>
                                </label>
                            </div>
                            <div style={{ marginLeft: '2rem', marginTop: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                                Se enviará a: <strong>{clientEmail}</strong>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '1.5rem' }}>
                        <FileUpload
                            onFileUploaded={(url) => setFormData(prev => ({ ...prev, ArchivoAdjunto: url }))}
                            onFileRemoved={() => setFormData(prev => ({ ...prev, ArchivoAdjunto: '' }))}
                            currentFileUrl={formData.ArchivoAdjunto}
                            folder="sales"
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label><FileText size={14} /> Observaciones</label>
                        <textarea name="Observaciones" rows="2" value={formData.Observaciones} onChange={handleHeaderChange} placeholder="Notas internas..." />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/ventas')} className="btn-secondary">
                            <X size={18} /> Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Venta'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default SaleForm;
