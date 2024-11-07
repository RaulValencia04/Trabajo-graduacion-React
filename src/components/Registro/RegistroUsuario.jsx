import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import {jwtDecode} from 'jwt-decode'; // Importa jwtDecode si no lo tienes ya instalado
import { AuthContext } from '../Auth/Context/AuthContext';
import './RegistroUsuario.css';

const RegistroUsuario = () => {
  const navigate = useNavigate(); // Inicializa navigate
  const { state, dispatch } = useContext(AuthContext);

  const [form, setForm] = useState({
    nombreUsuario: '',
    correo: '',
    carrera: '',
    contrasena: '',
    confirmContrasena: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir automáticamente al usuario autenticado si hay un token válido en sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        // Verificar si el token ha expirado
        if (decodedToken.exp * 1000 > Date.now()) {
          dispatch({
            type: 'login',
            payload: {
              token,
              role: decodedToken.role,
              email: decodedToken.sub,
            },
          });
          navigate('/inicio', { replace: true });
        } else {
          // Si el token ha expirado, se remueve de sessionStorage
          sessionStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        sessionStorage.removeItem('token');
      }
    }
  }, [dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.contrasena !== form.confirmContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/auth/registro', { // Cambia la URL según tu configuración
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreUsuario: form.nombreUsuario,
          correo: form.correo,
          carrera: form.carrera,
          contrasena: form.contrasena,
          rolId: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error en el registro. Intenta de nuevo.');
      } else {
        alert('Usuario registrado con éxito');
        setForm({
          nombreUsuario: '',
          correo: '',
          carrera: '',
          contrasena: '',
          confirmContrasena: '',
        });
        navigate('/login'); // Redirige al usuario a la página de inicio de sesión
      }
    } catch (err) {
      setError('Error en el servidor. Intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registro-container">
      <h2 className="registro-titulo">Registro de Usuario</h2>
      <form className="registro-form" onSubmit={handleSubmit}>
        <label>
          Nombre de Usuario:
          <input
            type="text"
            name="nombreUsuario"
            value={form.nombreUsuario}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Correo Electrónico:
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Carrera:
          <input
            type="text"
            name="carrera"
            value={form.carrera}
            onChange={handleChange}
          />
        </label>

        <label>
          Contraseña:
          <input
            type="password"
            name="contrasena"
            value={form.contrasena}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Confirmar Contraseña:
          <input
            type="password"
            name="confirmContrasena"
            value={form.confirmContrasena}
            onChange={handleChange}
            required
          />
        </label>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="registro-boton" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};

export default RegistroUsuario;
