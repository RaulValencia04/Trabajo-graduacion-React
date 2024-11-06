import React, { useState } from 'react';
import './FormularioCrearUsuario.css';

const FormularioCrearUsuario = ({ onSubmit }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [carrera, setCarrera] = useState('');
  const [facultad, setFacultad] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('');

  const manejarEnvio = (e) => {
    e.preventDefault();
    const nuevoUsuario = { nombreUsuario, correo, carrera, facultad, contrasena, rol };
    onSubmit(nuevoUsuario);
  };

  return (
    <div className="formulario-crear-usuario">
      <h2>Crear Nuevo Usuario</h2>
      <form onSubmit={manejarEnvio}>
        <div className="grupo-formulario">
          <label htmlFor="nombreUsuario">Nombre de Usuario:</label>
          <input
            type="text"
            id="nombreUsuario"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            required
          />
        </div>
        <div className="grupo-formulario">
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div className="grupo-formulario">
          <label htmlFor="carrera">Carrera:</label>
          <input
            type="text"
            id="carrera"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
          />
        </div>
        <div className="grupo-formulario">
          <label htmlFor="facultad">Facultad:</label>
          <input
            type="text"
            id="facultad"
            value={facultad}
            onChange={(e) => setFacultad(e.target.value)}
            required
          />
        </div>
        <div className="grupo-formulario">
          <label htmlFor="contrasena">Contraseña:</label>
          <input
            type="password"
            id="contrasena"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        <div className="grupo-formulario">
          <label htmlFor="rol">Rol:</label>
          <select
            id="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            required
          >
            <option value="">Selecciona un rol</option>
            <option value="estudiante">Estudiante</option>
            <option value="asesor">Asesor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" className="boton-enviar">Crear Usuario</button>
      </form>
    </div>
  );
};

export default FormularioCrearUsuario;
