import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'users';

export const userService = {
    // Obtener el perfil del usuario (rol y datos extra)
    async getUserProfile(uid) {
        try {
            const docRef = doc(db, COLLECTION_NAME, uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                // Si no existe perfil (primer login), podríamos crear uno por defecto como 'Operador'
                // Pero para SuperAdmin lo setearemos manualmente en DB por ahora
                return null;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    // Crear o actualizar perfil
    async setUserProfile(uid, profileData) {
        try {
            const docRef = doc(db, COLLECTION_NAME, uid);
            await setDoc(docRef, profileData, { merge: true });
        } catch (error) {
            console.error("Error setting user profile:", error);
            throw error;
        }
    }
};
