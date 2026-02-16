import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'offers';

export const offerService = {
    // Crear una nueva oferta
    async createOffer(offerData) {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...offerData,
                FechaCreacion: Timestamp.now(),
                Activo: true
            });
            return { id: docRef.id, ...offerData };
        } catch (error) {
            console.error("Error creating offer:", error);
            throw error;
        }
    },

    // Obtener todas las ofertas (para admin)
    async getAllOffers() {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('FechaCreacion', 'desc'));
            const querySnapshot = await getDocs(q);
            const offers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                FechaInicio: doc.data().FechaInicio?.toDate(),
                FechaFin: doc.data().FechaFin?.toDate(),
                FechaCreacion: doc.data().FechaCreacion?.toDate()
            }));
            return offers;
        } catch (error) {
            console.error("Error fetching all offers:", error);
            throw error;
        }
    },

    // Obtener solo ofertas activas (para catálogo público)
    async getActiveOffers() {
        try {
            const now = new Date();
            const q = query(
                collection(db, COLLECTION_NAME),
                where('Activo', '==', true)
            );
            const querySnapshot = await getDocs(q);

            const activeOffers = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    FechaInicio: doc.data().FechaInicio?.toDate(),
                    FechaFin: doc.data().FechaFin?.toDate()
                }))
                .filter(offer => {
                    // 1. Validar que tenga FechaInicio y que ya haya comenzado
                    if (!offer.FechaInicio) return false;

                    const startDate = new Date(offer.FechaInicio);
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                    // Si la fecha de inicio es hoy o en el pasado
                    const hasStarted = startDate <= now;

                    // 2. Validar que no haya expirado
                    if (!offer.FechaFin) return hasStarted;

                    const expiration = new Date(offer.FechaFin);
                    const hasNotExpired = expiration >= startOfToday;

                    return hasStarted && hasNotExpired;
                });

            return activeOffers;
        } catch (error) {
            console.error("Error fetching active offers:", error);
            throw error;
        }
    },

    // Actualizar una oferta
    async updateOffer(id, offerData) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...offerData,
                FechaModificacion: Timestamp.now()
            });
        } catch (error) {
            console.error("Error updating offer:", error);
            throw error;
        }
    },

    // Alternar estado (Activo/Inactivo)
    async toggleOfferStatus(id, currentStatus) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                Activo: !currentStatus,
                FechaModificacion: Timestamp.now()
            });
        } catch (error) {
            console.error("Error toggling offer status:", error);
            throw error;
        }
    }
};
