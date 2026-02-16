import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, AlertCircle, ShoppingCart } from 'lucide-react';
import './Login.css'; // Reutilizamos estilos de login para consistencia

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password);
            // Tras registrarse, Firebase loguea automáticamente al usuario
            navigate('/dashboard');
        } catch (err) {
            let message = 'Error al crear la cuenta. Inténtalo de nuevo.';

            if (err.code === 'auth/email-already-in-use') {
                message = 'Este correo ya está registrado.';
            } else if (err.code === 'auth/weak-password') {
                message = 'La contraseña debe tener al menos 6 caracteres.';
            } else if (err.code === 'auth/invalid-email') {
                message = 'El formato del correo no es válido.';
            } else if (err.code === 'auth/operation-not-allowed') {
                message = 'El registro con Email/Contraseña NO está habilitado en Firebase. Debes activarlo en la Consola de Firebase > Authentication > Sign-in method.';
            }

            setError(message);
            console.error("Firebase Auth Error:", err.code, err.message);
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
                            <UserPlus size={40} color="var(--primary-color)" />
                        </div>
                        <h1>Crear Cuenta</h1>
                        <p>Únete a Gestión 360 para administrar tu negocio</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
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

                        <div className="login-group">
                            <label>Contraseña</label>
                            <div className="login-input-wrapper">
                                <Lock size={18} className="login-input-icon" />
                                <input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-group">
                            <label>Confirmar Contraseña</label>
                            <div className="login-input-wrapper">
                                <Lock size={18} className="login-input-icon" />
                                <input
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="login-submit-btn">
                            {loading ? 'Creando cuenta...' : (
                                <>
                                    <UserPlus size={20} />
                                    <span>Registrarse</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
