import { db } from '../firebase/config';
import {
    collection,
    addDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    serverTimestamp,
    orderBy,
    limit,
    increment,
    runTransaction
} from 'firebase/firestore';

const COLLECTION_NAME = 'sales';
const saleCollection = collection(db, COLLECTION_NAME);

export const saleService = {
    // Obtener todas las ventas
    async getAllSales() {
        try {
            const q = query(saleCollection, orderBy('FechaCreacion', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                FechaCreacion: doc.data().FechaCreacion?.toDate(),
                FechaVencimiento: doc.data().FechaVencimiento?.toDate(),
                FechaPago: doc.data().FechaPago?.toDate()
            }));
        } catch (error) {
            console.error("Error fetching sales:", error);
            throw error;
        }
    },

    // Generar siguiente código correlativo (VE-YYYY-NNNN)
    async generateNextCode() {
        try {
            const year = new Date().getFullYear();
            const prefix = `VE-${year}-`;

            // Buscamos la última venta de este año
            const q = query(
                saleCollection,
                where('Codigo', '>=', prefix),
                where('Codigo', '<=', prefix + '\uf8ff'),
                orderBy('Codigo', 'desc'),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return `${prefix}0001`;
            }

            const lastCode = snapshot.docs[0].data().Codigo;
            const lastNumber = parseInt(lastCode.split('-')[2]);
            const nextNumber = (lastNumber + 1).toString().padStart(4, '0');

            return `${prefix}${nextNumber}`;
        } catch (error) {
            console.error("Error generating sale code:", error);
            // Fallback en caso de error
            return `VE-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
        }
    },

    // Crear una nueva venta y descontar stock
    async createSale(saleData) {
        try {
            const code = await this.generateNextCode();

            // Preparar objeto de venta
            const newSale = {
                ...saleData,
                Codigo: code,
                FechaCreacion: serverTimestamp(),
                FechaModificacion: serverTimestamp(),
                Activo: true,
                Estado: 'Completada' // Por defecto, una venta se asume completada/entregada
            };

            // Usar transacción para asegurar integridad de stock
            return await runTransaction(db, async (transaction) => {
                // 1. Verificar stock de todos los productos primero
                for (const item of saleData.Items) {
                    const productRef = doc(db, 'productos', item.IdProducto);
                    const productDoc = await transaction.get(productRef);

                    if (!productDoc.exists()) {
                        throw new Error(`El producto ${item.ProductoNombre} no existe.`);
                    }

                    const currentStock = productDoc.data().StockActual || 0;
                    if (currentStock < item.Cantidad) {
                        throw new Error(`Stock insuficiente para ${item.ProductoNombre}. Disponible: ${currentStock}`);
                    }
                }

                // 2. Si todo está bien, crear la venta
                const saleRef = doc(collection(db, COLLECTION_NAME));
                transaction.set(saleRef, newSale);

                // 3. Descontar stock
                for (const item of saleData.Items) {
                    const productRef = doc(db, 'productos', item.IdProducto);
                    transaction.update(productRef, {
                        StockActual: increment(-Number(item.Cantidad)),
                        FechaModificacion: serverTimestamp()
                    });
                }

                return { id: saleRef.id, ...newSale };
            });

        } catch (error) {
            console.error("Error creating sale:", error);
            throw error;
        }
    },

    // Obtener una venta por ID
    async getSaleById(id) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    FechaCreacion: data.FechaCreacion?.toDate(),
                    FechaVencimiento: data.FechaVencimiento?.toDate(),
                    FechaPago: data.FechaPago?.toDate()
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching sale detail:", error);
            throw error;
        }
    }
};
