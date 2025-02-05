import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './RegistroUsuario.css';

const RegistroUsuario = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [form, setForm] = useState({
    nombreUsuario: '',
    correo: '',
    carrera: '',
    contrasena: '',
    confirmContrasena: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const opcionesCarreras = [
    'Ingeniería Mecánica',
    'Ingeniería Química',
    'Técnico en Textiles',
    'Ingeniería en Procesos Textiles',
    'Ingeniería Eléctrica',
    'Ingeniería en Tecnología y Procesamiento de Alimentos',
    'Ingeniería en Desarrollo de Software',
    'Ingeniería en Telecomunicaciones y Redes',
    'Ingeniería Civil',
    'Ingeniería Industrial',
    'Ingeniería en Sistemas Informáticos',
    'Ingeniería Agronómica',
    'Arquitectura',
  ];

  const isValidEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@catolica\.edu\.sv$/.test(email);

  const isValidPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const validateForm = () => {
    if (!form.nombreUsuario.trim() || form.nombreUsuario.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres.';
    }

    if (!isValidEmail(form.correo)) {
      return 'El correo debe ser válido y pertenecer a @catolica.edu.sv.';
    }

    if (!form.carrera.trim() || !opcionesCarreras.includes(form.carrera)) {
      return 'Debes seleccionar una carrera válida.';
    }

    if (!isValidPassword(form.contrasena)) {
      return 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula y un número.';
    }

    if (form.contrasena !== form.confirmContrasena) {
      return 'Las contraseñas no coinciden.';
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/registro`, {
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
        alert('Usuario registrado con éxito. Redirigiendo al inicio de sesión...');
        navigate('/login');
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
          <select
            name="carrera"
            value={form.carrera}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una carrera</option>
            {opcionesCarreras.map((carrera, index) => (
              <option key={index} value={carrera}>
                {carrera}
              </option>
            ))}
          </select>
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
        <button
          type="button"
          className="registro-boton-secondary"
          onClick={() => navigate('/login')}
        >
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
};

export default RegistroUsuario;
