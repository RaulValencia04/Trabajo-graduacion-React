import {jwtDecode} from 'jwt-decode'; // Importación corregida
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './Context/AuthContext'; // Asegúrate de que la ruta es correcta
import './Login.css';

const Login = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token'); // Usamos 'token' para el almacenamiento local
    const savedRefreshToken = sessionStorage.getItem('refreshToken');

    if (savedToken && savedRefreshToken) {
      try {
        const decodedToken = jwtDecode(savedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          dispatch({
            type: 'login',
            payload: {
              token: savedToken, // Usamos 'token' para el estado
              refreshToken: savedRefreshToken,
              role: decodedToken.role,
              email: decodedToken.sub,
              userId: decodedToken.userId,
            },
          });
          navigate('/inicio', { replace: true });
        } else {
          // Si el token expiró, lo removemos
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
      }
    }
  }, [dispatch, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { accessToken, refreshToken } = data; // Capturamos como accessToken

      const decodedToken = jwtDecode(accessToken);

      dispatch({
        type: 'login',
        payload: {
          token: accessToken, // Guardamos como token en el estado
          refreshToken,
          role: decodedToken.role,
          email: decodedToken.sub,
          userId: decodedToken.userId,
        },
      });

      sessionStorage.setItem('token', accessToken); // Guardamos como token en sessionStorage
      sessionStorage.setItem('refreshToken', refreshToken);

      navigate('/inicio', { replace: true });
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
          <button type="submit" className="btn btn-primary btn-block">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
