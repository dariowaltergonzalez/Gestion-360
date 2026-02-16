/**
 * Utilidades para el cálculo de precios y aplicación de ofertas.
 */

export const priceUtils = {
    /**
     * Calcula el precio final de un producto aplicando la mejor oferta disponible.
     * @param {Object} product - El producto a evaluar.
     * @param {Array} activeOffers - Lista de ofertas activas en el sistema.
     * @returns {Object} - { originalPrice, finalPrice, appliedOffer, hasOffer }
     */
    calculateDiscountedPrice(product, activeOffers = []) {
        const originalPrice = Number(product.Precio);
        let finalPrice = originalPrice;
        let appliedOffer = null;

        if (!activeOffers || activeOffers.length === 0) {
            return { originalPrice, finalPrice, appliedOffer: null, hasOffer: false };
        }

        // 1. Filtrar ofertas que apliquen a este producto específicamente, su categoría, o a todo.
        const applicableOffers = activeOffers.filter(offer => {
            if (offer.Alcance === 'Articulo' && offer.ProductoId === product.id) return true;
            if (offer.Alcance === 'Categoria' && offer.CategoriaId === product.IdCategoria) return true;
            if (offer.Alcance === 'Todos') return true;
            return false;
        });

        if (applicableOffers.length === 0) {
            return { originalPrice, finalPrice, appliedOffer: null, hasOffer: false };
        }

        // 2. Ordenar por prioridad (mayor valor = mayor prioridad)
        const sortedOffers = [...applicableOffers].sort((a, b) => (b.Prioridad || 0) - (a.Prioridad || 0));

        // 3. Tomar la de mayor prioridad y calcular el precio
        appliedOffer = sortedOffers[0];

        if (appliedOffer.Tipo === 'Porcentual') {
            finalPrice = originalPrice * (1 - (Number(appliedOffer.porcentajeDescuento) / 100));
        } else if (appliedOffer.Tipo === 'DescuentoFijo') {
            finalPrice = originalPrice - Number(appliedOffer.descuentoFijo);
        } else if (appliedOffer.Tipo === 'PrecioEspecial') {
            finalPrice = Number(appliedOffer.precioEspecial);
        }

        // Asegurar que el precio no sea negativo
        finalPrice = Math.max(0, finalPrice);

        return {
            originalPrice,
            finalPrice,
            appliedOffer,
            hasOffer: finalPrice < originalPrice
        };
    },

    /**
     * Formatea un número como moneda local.
     */
    formatPrice(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    }
};
