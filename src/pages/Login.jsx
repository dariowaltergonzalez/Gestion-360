import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ShoppingCart } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Fallo al iniciar sesión. Por favor revisa tus credenciales.');
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
                        <h1>Gestión 360</h1>
                        <p>Ingresa a tu cuenta para gestionar el negocio</p>
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button disabled={loading} type="submit" className="login-submit-btn">
                            {loading ? 'Iniciando...' : (
                                <>
                                    <LogIn size={20} />
                                    <span>Ingresar</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>¿No tienes cuenta? <Link to="/signup">Crea una aquí</Link></p>
                        <p><Link to="/">Volver al catálogo</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
