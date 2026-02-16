import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, HardHat, Hammer, Wrench } from 'lucide-react';
import './UnderConstruction.css';

const UnderConstruction = ({ title = "Opción en Construcción" }) => {
    const navigate = useNavigate();

    return (
        <div className="construction-page">
            <div className="construction-card">
                <div className="construction-visual">
                    <div className="icon-circle main-icon">
                        <Construction size={64} />
                    </div>
                    <div className="floating-icons">
                        <HardHat className="float-icon icon-1" size={24} />
                        <Hammer className="float-icon icon-2" size={24} />
                        <Wrench className="float-icon icon-3" size={24} />
                    </div>
                </div>

                <h1 className="construction-title">{title}</h1>
                <p className="construction-text">
                    Estamos trabajando arduamente para brindarte la mejor experiencia.
                    Esta funcionalidad estará disponible muy pronto.
                </p>

                <div className="construction-progress">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                    <span className="progress-label">En desarrollo...</span>
                </div>

                <button
                    className="back-dashboard-btn"
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft size={18} />
                    <span>Volver al Dashboard</span>
                </button>
            </div>
        </div>
    );
};

export default UnderConstruction;
