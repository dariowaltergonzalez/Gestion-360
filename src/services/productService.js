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
    orderBy
} from 'firebase/firestore';

const productCollection = collection(db, 'productos');

export const productService = {
    // Obtener todos los productos (Punto 71)
    async getAllProducts() {
        const q = query(productCollection, orderBy('FechaCreacion', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Crear producto (Punto 98: Validaciones de negocio)
    async createProduct(productData) {
        // Validar unicidad de Nombre (Punto 98)
        const nameCheck = query(productCollection, where('Nombre', '==', productData.Nombre));
        const nameSnap = await getDocs(nameCheck);

        if (!nameSnap.empty) throw new Error('El nombre del producto ya existe');

        // Validar números positivos (Punto 98)
        if (productData.Precio <= 0) throw new Error('El precio debe ser un número positivo');
        if (productData.StockActual < 0) throw new Error('El stock no puede ser negativo');

        const newProduct = {
            ...productData,
            Activo: true,
            FechaCreacion: serverTimestamp(),
            FechaModificacion: serverTimestamp(),
            FechaEliminacion: null
        };

        const docRef = await addDoc(productCollection, newProduct);
        return docRef.id;
    },

    // Actualizar producto (Punto 98)
    async updateProduct(id, productData) {
        const docRef = doc(db, 'productos', id);

        // Re-validar números positivos
        if (productData.Precio <= 0) throw new Error('El precio debe ser un número positivo');

        await updateDoc(docRef, {
            ...productData,
            FechaModificacion: serverTimestamp()
        });
    },

    // Cambiar estado (Punto 98: FechaEliminacion)
    async toggleStatus(id, currentStatus) {
        const docRef = doc(db, 'productos', id);
        const newStatus = !currentStatus;
        await updateDoc(docRef, {
            Activo: newStatus,
            FechaEliminacion: newStatus ? null : serverTimestamp(),
            FechaModificacion: serverTimestamp()
        });
    }
};
