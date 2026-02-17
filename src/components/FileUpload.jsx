import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File, Loader } from 'lucide-react';
import { fileService } from '../services/fileService';
import '../styles/FileUpload.css';

/**
 * Componente reutilizable para cargar archivos
 * @param {Object} props
 * @param {function} props.onFileUploaded - Callback cuando el archivo se sube exitosamente (recibe URL)
 * @param {string} props.folder - Carpeta en Firebase Storage (default: 'attachments')
 * @param {string} props.currentFileUrl - URL del archivo actual (para modo edición)
 * @param {function} props.onFileRemoved - Callback cuando se elimina el archivo
 */
const FileUpload = ({ onFileUploaded, folder = 'attachments', currentFileUrl = null, onFileRemoved = null }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(currentFileUrl);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        setError('');
        setSelectedFile(file);
        // Auto-upload al seleccionar
        uploadFile(file);
    };

    const uploadFile = async (file) => {
        try {
            setUploading(true);
            setUploadProgress(0);
            setError('');

            const url = await fileService.uploadFile(
                file,
                folder,
                (progress) => setUploadProgress(progress)
            );

            setFileUrl(url);
            setUploading(false);
            setUploadProgress(100);

            if (onFileUploaded) {
                onFileUploaded(url);
            }
        } catch (err) {
            setError(err.message || 'Error al subir el archivo');
            setUploading(false);
            setSelectedFile(null);
            setUploadProgress(0);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileUrl(null);
        setUploadProgress(0);
        setError('');
        if (onFileRemoved) {
            onFileRemoved();
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const getFileIcon = (url) => {
        if (fileService.isImage(url)) {
            return <ImageIcon size={24} />;
        } else if (fileService.isPDF(url)) {
            return <FileText size={24} />;
        } else {
            return <File size={24} />;
        }
    };

    const renderFilePreview = () => {
        if (!fileUrl && !selectedFile) return null;

        const displayUrl = fileUrl || (selectedFile ? URL.createObjectURL(selectedFile) : null);
        const fileName = fileUrl
            ? fileService.getFileNameFromUrl(fileUrl)
            : selectedFile?.name;

        return (
            <div className="file-preview">
                <div className="file-preview-content">
                    {fileService.isImage(displayUrl) ? (
                        <img src={displayUrl} alt="Preview" className="file-preview-image" />
                    ) : (
                        <div className="file-preview-icon">
                            {getFileIcon(displayUrl)}
                        </div>
                    )}
                    <div className="file-preview-info">
                        <p className="file-preview-name">{fileName}</p>
                        {uploading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <span className="progress-text">{Math.round(uploadProgress)}%</span>
                            </div>
                        )}
                    </div>
                </div>
                {!uploading && (
                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="file-remove-btn"
                        title="Eliminar archivo"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="file-upload-container">
            <label className="file-upload-label">Archivo Adjunto (Opcional)</label>

            {error && (
                <div className="file-upload-error">
                    {error}
                </div>
            )}

            {!fileUrl && !selectedFile && (
                <div
                    className={`file-upload-dropzone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleChange}
                        accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf,.doc,.docx"
                        style={{ display: 'none' }}
                    />
                    {uploading ? (
                        <Loader className="upload-icon spinning" size={32} />
                    ) : (
                        <Upload className="upload-icon" size={32} />
                    )}
                    <p className="upload-text">
                        {uploading ? 'Subiendo archivo...' : 'Haz clic o arrastra un archivo aquí'}
                    </p>
                    <p className="upload-hint">
                        Imágenes (JPG, PNG, GIF) o documentos (PDF, DOC, DOCX) - Máx. 5MB
                    </p>
                </div>
            )}

            {renderFilePreview()}
        </div>
    );
};

export default FileUpload;
