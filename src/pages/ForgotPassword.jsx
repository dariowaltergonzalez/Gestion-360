import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, ShoppingCart, ArrowLeft, Send } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('Revisa tu bandeja de entrada para seguir las instrucciones.');
        } catch (err) {
            setError('Fallo al restablecer la contraseña. Asegúrate de que el correo sea correcto.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <ShoppingCart size={40} color="var(--primary-color)" />
                        </div>
                        <h1>Restablecer Contraseña</h1>
                        <p>Ingresa tu correo electrónico para enviarte un enlace de recuperación</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="login-success">
                            <AlertCircle size={18} />
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-group">
                            <label>Email</label>
                            <div className="login-input-wrapper">
                                <Mail size={18} className="login-input-icon" />
                                <input
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="login-submit-btn">
                            {loading ? 'Enviando...' : (
                                <>
                                    <Send size={20} />
                                    <span>Enviar Enlace</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            <Link to="/login" className="back-link">
                                <ArrowLeft size={16} />
                                <span>Volver al inicio de sesión</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
