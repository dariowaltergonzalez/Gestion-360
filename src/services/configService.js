import {
    doc,
    getDoc,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'systemConfig';
const GLOBAL_CONFIG_ID = 'global';

export const configService = {
    // Obtener configuración global (Feature Flags, etc)
    async getGlobalConfig() {
        try {
            const docRef = doc(db, COLLECTION_NAME, GLOBAL_CONFIG_ID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                // Configuración inicial por defecto
                const defaultConfig = {
                    features: {
                        offers: false,
                        orders: false,
                        reporting: false
                    },
                    lastUpdate: new Date()
                };
                await setDoc(docRef, defaultConfig);
                return defaultConfig;
            }
        } catch (error) {
            console.error("Error fetching global config:", error);
            throw error;
        }
    },

    // Actualizar una feature flag específica
    async updateFeatureFlag(featureName, enabled) {
        try {
            const docRef = doc(db, COLLECTION_NAME, GLOBAL_CONFIG_ID);
            await updateDoc(docRef, {
                [`features.${featureName}`]: enabled,
                lastUpdate: new Date()
            });
        } catch (error) {
            console.error("Error updating feature flag:", error);
            throw error;
        }
    }
};
