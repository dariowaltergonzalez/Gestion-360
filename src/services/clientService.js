import { db } from '../firebase/config';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';

const clientCollection = collection(db, 'clientes');

export const clientService = {
    // Obtener todos los clientes/proveedores
    async getAllClients() {
        const q = query(clientCollection, orderBy('Nombre', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.id, // Fallback if needed
            ...doc.data()
        }));
    },

    // Crear nuevo Cliente/Proveedor
    async createClient(clientData) {
        // Validar unicidad de Nombre o Razón Social (Punto 107)
        const nameCheck = query(clientCollection, where('Nombre', '==', clientData.Nombre));
        const nameSnap = await getDocs(nameCheck);

        if (!nameSnap.empty) {
            throw new Error('Ya existe un cliente o proveedor con este nombre');
        }

        const newClient = {
            ...clientData,
            Activo: true,
            FechaCreacion: serverTimestamp(),
            FechaModificacion: serverTimestamp(),
            FechaEliminacion: null
        };

        const docRef = await addDoc(clientCollection, newClient);
        return docRef.id;
    },

    // Actualizar datos
    async updateClient(id, clientData) {
        const clientRef = doc(db, 'clientes', id);

        // Si cambia el nombre, validar unicidad
        const nameCheck = query(clientCollection, where('Nombre', '==', clientData.Nombre));
        const nameSnap = await getDocs(nameCheck);

        if (!nameSnap.empty && nameSnap.docs[0].id !== id) {
            throw new Error('El nuevo nombre ya está en uso por otro cliente');
        }

        await updateDoc(clientRef, {
            ...clientData,
            FechaModificacion: serverTimestamp()
        });
    },

    // Alternar estado (Activo/Inactivo)
    async toggleStatus(id, currentStatus) {
        const clientRef = doc(db, 'clientes', id);
        const newStatus = !currentStatus;

        await updateDoc(clientRef, {
            Activo: newStatus,
            FechaEliminacion: newStatus ? null : serverTimestamp(),
            FechaModificacion: serverTimestamp()
        });
    }
};
