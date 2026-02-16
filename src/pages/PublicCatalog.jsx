import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Loader2 } from 'lucide-react';
import { productService } from '../services/productService';
import './PublicCatalog.css';

const PublicCatalog = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Obtenemos solo productos activos para el catálogo público
            const allProducts = await productService.getAllProducts();
            setProducts(allProducts.filter(p => p.Activo));
        } catch (error) {
            console.error("Error al cargar productos:", error);
        } finally {
            setLoading(false);
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
                                    <span>4.5</span> {/* Rating placeholder por ahora */}
                                </div>
                                <h3>{product.Nombre}</h3>
                                <div className="price-row">
                                    <span className="price">${Number(product.Precio).toLocaleString()}</span>
                                    <button className="add-to-cart">
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicCatalog;
