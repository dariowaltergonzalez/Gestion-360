import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import OfferCarousel from '../components/catalog/OfferCarousel';
import {
    Search,
    ShoppingCart,
    Star, Loader2
} from 'lucide-react';
import { productService } from '../services/productService';
import { offerService } from '../services/offerService';
import { priceUtils } from '../utils/priceUtils';
import './PublicCatalog.css';

const PublicCatalog = () => {
    const navigate = useNavigate();
    const { isFeatureEnabled } = useConfig();
    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchProducts(),
                fetchActiveOffers()
            ]);
        } catch (error) {
            console.error("Error loading catalog data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts.filter(p => p.Activo));
    };

    const fetchActiveOffers = async () => {
        if (isFeatureEnabled('offers')) {
            const activeOffers = await offerService.getActiveOffers();
            setOffers(activeOffers);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="spinner" size={48} />
                <p>Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <div className="catalog-container">
            <header className="catalog-header">
                <h1>Explora nuestro Catálogo</h1>
                <p>Encuentra todo lo que necesitas para tu proyecto</p>
            </header>

            {/* Banner de Ofertas (Condicional) */}
            {isFeatureEnabled('offers') && <OfferCarousel />}

            {/* Barra de Búsqueda y Filtros */}
            {products.length === 0 ? (
                <div className="no-products">
                    <p>No hay productos disponibles en este momento.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-image">
                                {/* Fallback image if none provided (Punto 35 de Analisis.md) */}
                                <img
                                    src={product.Imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                                    alt={product.Nombre}
                                />
                                <span className="category-badge">{product.CategoriaNombre || 'General'}</span>
                            </div>
                            <div className="product-info">
                                <div className="rating">
                                    <Star size={14} fill="var(--warning)" color="var(--warning)" />
                                    <span>4.5</span>
                                </div>
                                <h3>{product.Nombre}</h3>

                                {(() => {
                                    const { finalPrice, originalPrice, hasOffer, appliedOffer } =
                                        priceUtils.calculateDiscountedPrice(product, offers);

                                    return (
                                        <div className="price-row">
                                            <div className="price-container">
                                                {hasOffer ? (
                                                    <>
                                                        <span className="current-price">{priceUtils.formatPrice(finalPrice)}</span>
                                                        <span className="old-price">{priceUtils.formatPrice(originalPrice)}</span>
                                                        <span className="discount-tag">
                                                            {appliedOffer.Tipo === 'Porcentual' ? `-${appliedOffer.porcentajeDescuento}%` : 'OFERTA'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="current-price">{priceUtils.formatPrice(originalPrice)}</span>
                                                )}
                                            </div>
                                            <button className="add-to-cart">
                                                <ShoppingCart size={18} />
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicCatalog;
