import { db } from '../firebase/config';
import {
    collection,
    addDoc,
    updateDoc,
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

const COLLECTION_NAME = 'purchases';
const purchaseCollection = collection(db, COLLECTION_NAME);

export const purchaseService = {
    // Obtener todas las compras
    async getAllPurchases() {
        try {
            const q = query(purchaseCollection, orderBy('FechaCreacion', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                FechaCreacion: doc.data().FechaCreacion?.toDate(),
                FechaVencimiento: doc.data().FechaVencimiento?.toDate(),
                FechaPago: doc.data().FechaPago?.toDate()
            }));
        } catch (error) {
            console.error("Error matching purchases:", error);
            throw error;
        }
    },

    // Generar siguiente código correlativo (OC-YYYY-NNNN)
    async generateNextCode() {
        try {
            const year = new Date().getFullYear();
            const prefix = `OC-${year}-`;

            // Buscamos la última compra de este año
            const q = query(
                purchaseCollection,
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
            console.error("Error generating purchase code:", error);
            // Fallback en caso de error
            return `OC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
        }
    },

    // Crear una nueva compra
    async createPurchase(purchaseData) {
        try {
            const code = await this.generateNextCode();

            const newPurchase = {
                ...purchaseData,
                Codigo: code,
                FechaCreacion: serverTimestamp(),
                FechaModificacion: serverTimestamp(),
                Activo: true
            };

            const docRef = await addDoc(purchaseCollection, newPurchase);

            // Si la compra nace ya en estado "Recibida", actualizar stock
            if (purchaseData.Estado === 'Recibida') {
                await this.applyStockIncrease(purchaseData.Items);
            }

            return { id: docRef.id, ...newPurchase };
        } catch (error) {
            console.error("Error creating purchase:", error);
            throw error;
        }
    },

    // Obtener una compra por ID
    async getPurchaseById(id) {
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
            console.error("Error fetching purchase detail:", error);
            throw error;
        }
    },

    // Actualizar estado de la compra y automatizaciones de stock (Punto 142)
    async updatePurchaseStatus(id, newStatus, currentPurchaseData) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            const oldStatus = currentPurchaseData.Estado;

            // Transacción para asegurar que el cambio de estado y el stock sean atómicos
            await runTransaction(db, async (transaction) => {
                // Actualizar la compra
                transaction.update(docRef, {
                    Estado: newStatus,
                    FechaModificacion: serverTimestamp()
                });

                // Si cambia a 'Recibida', sumar stock
                if (newStatus === 'Recibida' && oldStatus !== 'Recibida') {
                    for (const item of currentPurchaseData.Items) {
                        const productRef = doc(db, 'productos', item.IdProducto);
                        transaction.update(productRef, {
                            StockActual: increment(Number(item.Cantidad)),
                            FechaModificacion: serverTimestamp()
                        });
                    }
                }

                // Nota: Si pasara de 'Recibida' a otro (ej. Cancelada), 
                // idealmente restaría stock, pero Analisis.md solo menciona SUMAR al recibir.
            });
        } catch (error) {
            console.error("Error updating purchase status:", error);
            throw error;
        }
    },

    // Lógica interna para aplicar incremento de stock (usada en creación directa como Recibida)
    async applyStockIncrease(items) {
        try {
            const batch = runTransaction(db, async (transaction) => {
                for (const item of items) {
                    const productRef = doc(db, 'productos', item.IdProducto);
                    transaction.update(productRef, {
                        StockActual: increment(Number(item.Cantidad)),
                        FechaModificacion: serverTimestamp()
                    });
                }
            });
            await batch;
        } catch (error) {
            console.error("Error applying stock increase:", error);
            throw error;
        }
    }
};
