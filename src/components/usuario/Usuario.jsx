import React, { useState } from 'react';
import { Link } from 'react-router-dom';  // Importamos Link para la navegación
import './usuario.css';

const usuariosSimulados = [
  { id: 1, nombre: 'Juan Pérez', correo: 'juan@example.com', rol: 'Estudiante', estado: 'Activo' },
  { id: 2, nombre: 'Ana Gómez', correo: 'ana@example.com', rol: 'Asesor', estado: 'Inactivo' },
  { id: 3, nombre: 'Carlos López', correo: 'carlos@example.com', rol: 'Administrador', estado: 'Activo' },
];

const Usuario = () => {
  const [usuarios, setUsuarios] = useState(usuariosSimulados); // Estado para la lista de usuarios
  const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda
  const [filtroRol, setFiltroRol] = useState(''); // Estado para el filtro por rol

  // Función para manejar la activación/desactivación de un usuario
  const toggleEstadoUsuario = (id) => {
    const usuariosActualizados = usuarios.map((usuario) =>
      usuario.id === id ? { ...usuario, estado: usuario.estado === 'Activo' ? 'Inactivo' : 'Activo' } : usuario
    );
    setUsuarios(usuariosActualizados);
  };

  // Filtra usuarios según la búsqueda y el filtro de rol
  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroRol === '' || usuario.rol === filtroRol)
  );

  return (
    <div className='container'>
      <h2 className='title'>Gestión de Usuarios</h2>

      {/* Enlace para navegar al formulario de crear usuario */}
      <div className="enlace-crear-usuario">
        <Link to="/crear-usuarios" className="boton-crear-usuario">
          <i className="bi bi-person-plus"></i> Crear Usuario
        </Link>
      </div>

      {/* Buscador y Filtro */}
      <div className='buscador'>
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
        <select onChange={(e) => setFiltroRol(e.target.value)} value={filtroRol} className="select-filtro">
          <option value="">Filtrar por rol</option>
          <option value="Estudiante">Estudiante</option>
          <option value="Asesor">Asesor</option>
          <option value="Administrador">Administrador</option>
        </select>
      </div>

      {/* Tabla de Usuarios */}
      <TablaUsuarios usuarios={usuariosFiltrados} toggleEstadoUsuario={toggleEstadoUsuario} />
    </div>
  );
};

const TablaUsuarios = ({ usuarios, toggleEstadoUsuario }) => (
  <div className='lista-usuarios'>
    <table className="tabla-usuarios">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map(usuario => (
          <tr key={usuario.id}>
            <td>{usuario.nombre}</td>
            <td>{usuario.correo}</td>
            <td>{usuario.rol}</td>
            <td>{usuario.estado}</td>
            <td>
              <button onClick={() => toggleEstadoUsuario(usuario.id)} className="boton-estado">
                {usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Usuario;
