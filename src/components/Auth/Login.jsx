import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { AuthContext } from '../Auth/Context/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { state, dispatch } = useContext(AuthContext);

    // Redirigir automáticamente al usuario autenticado
    useEffect(() => {
        if (state.logged) {
            navigate('/inicio');
        }
    }, [state.logged, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            const { token } = data;

            // Decodificar el token
            const decodedToken = jwtDecode(token);

            // Guardar el token y la información en el contexto
            dispatch({
                type: 'login',
                payload: {
                    token,
                    role: decodedToken.role,
                    email: decodedToken.sub,
                },
            });

            // Guardar el token en sessionStorage
            sessionStorage.setItem('token', token);

            // Redirigir al usuario a la página de inicio
            navigate('/inicio');
        } catch (err) {
            console.error('Error durante el login:', err);
            setError('Error de inicio de sesión. Verifica tus credenciales e inténtalo de nuevo.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Usuario:</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-primary btn-block">Iniciar Sesión</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
