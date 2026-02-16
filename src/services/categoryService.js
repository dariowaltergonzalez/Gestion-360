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
    serverTimestamp
} from 'firebase/firestore';

const categoryCollection = collection(db, 'categorias');

export const categoryService = {
    // Obtener todas las categorías (Punto 71: Independiente de estado)
    async getAllCategories() {
        const snapshot = await getDocs(categoryCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Obtener solo categorías activas
    async getActiveCategories() {
        const q = query(categoryCollection, where('Activo', '==', true));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Crear categoría (Punto 102: Validar unicidad)
    async createCategory(categoryData) {
        const { Nombre } = categoryData;

        // Validar unicidad de nombre (Punto 102)
        const q = query(categoryCollection, where('Nombre', '==', Nombre));
        const check = await getDocs(q);
        if (!check.empty) throw new Error('Ya existe una categoría con este nombre');

        const newCategory = {
            ...categoryData,
            Activo: true,
            FechaCreacion: serverTimestamp(),
            FechaModificacion: serverTimestamp(),
            FechaEliminacion: null
        };

        const docRef = await addDoc(categoryCollection, newCategory);
        return docRef.id;
    },

    // Actualizar categoría (Punto 102)
    async updateCategory(id, categoryData) {
        const docRef = doc(db, 'categorias', id);
        await updateDoc(docRef, {
            ...categoryData,
            FechaModificacion: serverTimestamp()
        });
    },

    // Desactivar/Activar categoría (Punto 102: Manejo de FechaEliminacion)
    async toggleStatus(id, currentStatus) {
        const docRef = doc(db, 'categorias', id);
        const newStatus = !currentStatus;
        await updateDoc(docRef, {
            Activo: newStatus,
            FechaEliminacion: newStatus ? null : serverTimestamp(),
            FechaModificacion: serverTimestamp()
        });
    }
};
