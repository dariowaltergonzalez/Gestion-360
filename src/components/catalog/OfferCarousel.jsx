import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import { offerService } from '../../services/offerService';
import './OfferCarousel.css';

const OfferCarousel = () => {
    const [offers, setOffers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveOffers();
    }, []);

    // Auto-play
    useEffect(() => {
        if (offers.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentIndex, offers.length]);

    const fetchActiveOffers = async () => {
        try {
            setLoading(true);
            const data = await offerService.getActiveOffers();
            setOffers(data);
        } catch (error) {
            console.error("Error fetching active offers for carousel:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    };

    if (loading || offers.length === 0) return null;

    const currentOffer = offers[currentIndex];

    return (
        <div className="offer-carousel-container">
            <div className="offer-carousel-slide" key={currentOffer.id}>
                <div className="offer-content">
                    <div className="offer-tag">
                        <Tag size={14} /> Oferta Especial
                    </div>
                    <h2 className="offer-title">{currentOffer.Nombre}</h2>
                    <p className="offer-description">{currentOffer.Descripcion}</p>
                    <div className="offer-value">
                        {currentOffer.Tipo === 'Porcentual' ? `${currentOffer.porcentajeDescuento}% OFF` :
                            currentOffer.Tipo === 'DescuentoFijo' ? `$${currentOffer.descuentoFijo} DE DESCUENTO` :
                                `PRECIO ESPECIAL: $${currentOffer.precioEspecial}`}
                    </div>
                    <button className="offer-btn">
                        Ver Oferta <ArrowRight size={18} />
                    </button>
                </div>

                {/* Decorative background pattern/gradient */}
                <div className="offer-visual">
                    <div className="visual-circle"></div>
                    <div className="visual-discount">
                        {currentOffer.Tipo === 'Porcentual' && <span>-{currentOffer.porcentajeDescuento}%</span>}
                    </div>
                </div>
            </div>

            {offers.length > 1 && (
                <>
                    <button className="carousel-control prev" onClick={handlePrev}>
                        <ChevronLeft size={24} />
                    </button>
                    <button className="carousel-control next" onClick={handleNext}>
                        <ChevronRight size={24} />
                    </button>
                    <div className="carousel-indicators">
                        {offers.map((_, idx) => (
                            <div
                                key={idx}
                                className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default OfferCarousel;
