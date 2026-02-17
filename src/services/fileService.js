import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Servicio para gestionar la carga y eliminación de archivos en Firebase Storage
 */
export const fileService = {
    /**
     * Sube un archivo a Firebase Storage
     * @param {File} file - Archivo a subir
     * @param {string} folder - Carpeta destino en Storage (ej: 'purchases', 'sales')
     * @param {function} onProgress - Callback para reportar progreso (opcional)
     * @returns {Promise<string>} URL de descarga del archivo
     */
    async uploadFile(file, folder = 'attachments', onProgress = null) {
        try {
            // Validar tamaño del archivo (máximo 5MB)
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
            if (file.size > MAX_SIZE) {
                throw new Error('El archivo excede el tamaño máximo permitido de 5MB');
            }

            // Validar tipo de archivo
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedTypes.includes(file.type)) {
                throw new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, GIF) y documentos (PDF, DOC, DOCX)');
            }

            // Generar nombre único para el archivo
            const timestamp = Date.now();
            // Si es un Blob y no tiene name, usar un nombre genérico
            const originalName = file.name || `archivo_${timestamp}`;
            const fileName = `${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = `${folder}/${fileName}`;

            // Crear referencia en Storage
            const storageRef = ref(storage, filePath);

            // Subir archivo con seguimiento de progreso
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Calcular progreso
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (onProgress) {
                            onProgress(progress);
                        }
                    },
                    (error) => {
                        console.error('Error al subir archivo:', error);
                        reject(new Error('Error al subir el archivo. Por favor, intente nuevamente.'));
                    },
                    async () => {
                        // Subida completada, obtener URL de descarga
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (error) {
                            console.error('Error al obtener URL de descarga:', error);
                            reject(new Error('Error al obtener la URL del archivo'));
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error en uploadFile:', error);
            throw error;
        }
    },

    /**
     * Elimina un archivo de Firebase Storage
     * @param {string} fileUrl - URL completa del archivo a eliminar
     * @returns {Promise<void>}
     */
    async deleteFile(fileUrl) {
        try {
            if (!fileUrl) return;

            // Extraer la ruta del archivo desde la URL
            // URL formato: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]
            const urlParts = fileUrl.split('/o/');
            if (urlParts.length < 2) {
                throw new Error('URL de archivo inválida');
            }

            const pathWithToken = urlParts[1];
            const filePath = decodeURIComponent(pathWithToken.split('?')[0]);

            // Crear referencia y eliminar
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);

            console.log('Archivo eliminado exitosamente:', filePath);
        } catch (error) {
            // Si el archivo no existe, no lanzar error
            if (error.code === 'storage/object-not-found') {
                console.warn('El archivo ya no existe en Storage:', fileUrl);
                return;
            }
            console.error('Error al eliminar archivo:', error);
            throw new Error('Error al eliminar el archivo');
        }
    },

    /**
     * Obtiene el nombre del archivo desde su URL
     * @param {string} fileUrl - URL del archivo
     * @returns {string} Nombre del archivo
     */
    getFileNameFromUrl(fileUrl) {
        try {
            if (!fileUrl) return '';
            const urlParts = fileUrl.split('/o/');
            if (urlParts.length < 2) return '';
            const pathWithToken = urlParts[1];
            const filePath = decodeURIComponent(pathWithToken.split('?')[0]);
            const fileName = filePath.split('/').pop();
            // Remover el timestamp del inicio del nombre
            return fileName.replace(/^\d+_/, '');
        } catch (error) {
            console.error('Error al extraer nombre de archivo:', error);
            return '';
        }
    },

    /**
     * Verifica si un archivo es una imagen
     * @param {string} fileUrl - URL del archivo
     * @returns {boolean}
     */
    isImage(fileUrl) {
        if (!fileUrl) return false;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        return imageExtensions.some(ext => fileUrl.toLowerCase().includes(ext));
    },

    /**
     * Verifica si un archivo es un PDF
     * @param {string} fileUrl - URL del archivo
     * @returns {boolean}
     */
    isPDF(fileUrl) {
        if (!fileUrl) return false;
        return fileUrl.toLowerCase().includes('.pdf');
    }
};
