import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Save,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
    CheckCircle2,
    Database,
    Github
} from 'lucide-react';
import { configService } from '../../services/configService';
import '../../styles/Management.css';

const Settings = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await configService.getGlobalConfig();
            setConfig(data);
        } catch (error) {
            console.error("Error loading config:", error);
            setMessage({ type: 'error', text: 'Error al cargar la configuración' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (feature) => {
        if (!config) return;

        const newValue = !config.features[feature];
        setSaving(true);
        try {
            await configService.updateFeatureFlag(feature, newValue);
            setConfig(prev => ({
                ...prev,
                features: {
                    ...prev.features,
                    [feature]: newValue
                }
            }));
            setMessage({ type: 'success', text: `Feature "${feature}" ${newValue ? 'activada' : 'desactivada'}` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error updating feature flag:", error);
            setMessage({ type: 'error', text: 'Error al actualizar' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="management-container"><p>Cargando configuración...</p></div>;

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title">
                    <SettingsIcon size={24} className="text-primary" />
                    <h1>Configuración del Sistema</h1>
                </div>
            </div>

            <div className="management-card" style={{ maxWidth: '800px' }}>
                <div className="settings-section">
                    <h3 className="section-title">
                        <Database size={18} /> Módulos y Feature Flags
                    </h3>
                    <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                        Active o desactive módulos completos del sistema. Estas configuraciones afectan a todos los usuarios en tiempo real.
                    </p>

                    <div className="feature-flags-list">
                        {/* OFERTAS */}
                        <div className="feature-flag-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                            <div className="feature-info">
                                <h4 className="m-0" style={{ fontSize: '1.05rem' }}>Módulo de Ofertas</h4>
                                <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
                                    Habilita el banner de carrusel en el catálogo y la aplicación de descuentos.
                                </p>
                            </div>
                            <button
                                onClick={() => handleToggle('offers')}
                                disabled={saving}
                                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                {config.features.offers ? (
                                    <ToggleRight size={40} className="text-primary" />
                                ) : (
                                    <ToggleLeft size={40} className="text-muted" />
                                )}
                            </button>
                        </div>

                        {/* COMPRAS (Placeholder for future) */}
                        <div className="feature-flag-item d-flex justify-content-between align-items-center p-3 border rounded mb-3 opacity-50">
                            <div className="feature-info">
                                <h4 className="m-0" style={{ fontSize: '1.05rem' }}>Módulo de Compras</h4>
                                <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
                                    Gestión de pedidos a proveedores y stock entrante.
                                </p>
                            </div>
                            <ToggleLeft size={40} className="text-muted" />
                        </div>

                        {/* REPORTE AVANZADO (Placeholder for future) */}
                        <div className="feature-flag-item d-flex justify-content-between align-items-center p-3 border rounded mb-3 opacity-50">
                            <div className="feature-info">
                                <h4 className="m-0" style={{ fontSize: '1.05rem' }}>Reportes Avanzados</h4>
                                <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
                                    Gráficos estadísticos y proyecciones de ventas.
                                </p>
                            </div>
                            <ToggleLeft size={40} className="text-muted" />
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mt-3 d-flex align-items-center gap-2`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                        {message.text}
                    </div>
                )}
            </div>

            <div className="management-card mt-4" style={{ maxWidth: '800px', background: '#f8f9fa' }}>
                <div className="d-flex align-items-center gap-2 text-muted">
                    <Github size={16} />
                    <span style={{ fontSize: '0.8rem' }}>Versión del Sistema: 2.3.0-beta</span>
                </div>
            </div>
        </div>
    );
};

export default Settings;
