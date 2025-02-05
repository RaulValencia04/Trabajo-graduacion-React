import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import './AlumnosActivos.css';
import { AuthContext } from '../../Auth/Context/AuthContext';
import { useApi } from "../../Auth/Helpers/api";

const AlumnosActivos = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { authFetch } = useApi();
  const { state } = useContext(AuthContext);
  const { token } = state;

  const [alumnosData, setAlumnosData] = useState([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Para el modal de edición/creación
  const [showModal, setShowModal] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // true si estamos editando, false si estamos creando
  
  // Estado de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Función para recargar usuarios y roles
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) throw new Error('Token no disponible');

      // Obtener usuarios
      const usuariosResponse = await authFetch(`${API_URL}/api/usuarios/getAll`, { method: 'GET' });
      if (!usuariosResponse.ok) throw new Error(`Error ${usuariosResponse.status}`);
      const usuariosData = await usuariosResponse.json();
      setAlumnosData(usuariosData);
      setFilteredAlumnos(usuariosData);

      // Obtener roles
      const rolesResponse = await authFetch(`${API_URL}/api/roles`, { method: 'GET' });
      if (!rolesResponse.ok) throw new Error(`Error ${rolesResponse.status}`);
      const rolesData = await rolesResponse.json();
      setRoles(rolesData);

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  // 2. useEffect inicial
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, API_URL, authFetch]);

  // 3. Filtrar alumnos cuando cambia searchTerm o selectedRole
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = alumnosData.filter((alumno) => {
      const matchesSearch =
        alumno.nombreUsuario.toLowerCase().includes(lowercasedTerm) ||
        alumno.correo.toLowerCase().includes(lowercasedTerm) ||
        alumno.carrera.toLowerCase().includes(lowercasedTerm) ||
        alumno.facultad.toLowerCase().includes(lowercasedTerm);

      const matchesRole = selectedRole
        ? alumno.rol.id === parseInt(selectedRole)
        : true;

      return matchesSearch && matchesRole;
    });

    setFilteredAlumnos(filtered);
  }, [searchTerm, selectedRole, alumnosData]);

  // 4. Abrir modal para crear nuevo usuario
  const handleOpenCreateModal = () => {
    setSelectedAlumno({
      // Campos por defecto para nuevo usuario
      nombreUsuario: '',
      correo: '',
      carrera: '',
      facultad: '',
      rol: { id: '', nombre: '' },
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // 5. Abrir modal para editar usuario existente
  const handleOpenEditModal = (alumno) => {
    setSelectedAlumno(alumno);
    setIsEditing(true);
    setShowModal(true);
  };

  // 6. Cerrar modal
  const handleCloseModal = () => {
    setSelectedAlumno(null);
    setShowModal(false);
    setIsEditing(false);
  };

  // 7. Guardar Cambios (PUT/POST)
  const handleSaveChanges = async () => {
    if (!selectedAlumno) return;

    // Confirmación del usuario
    const confirmMsg = isEditing
      ? '¿Seguro que deseas guardar los cambios en este usuario?'
      : '¿Seguro que deseas crear este nuevo usuario?';
    if (!window.confirm(confirmMsg)) return;

    try {
      // Construir objeto con los datos a actualizar/crear
      const userData = {
        nombreUsuario: selectedAlumno.nombreUsuario,
        correo: selectedAlumno.correo,
        carrera: selectedAlumno.carrera,
        facultad: selectedAlumno.facultad,
        rol: selectedAlumno.rol, 
      };

      if (isEditing) {
        // PUT /api/usuarios/{id}
        const response = await authFetch(`${API_URL}/api/usuarios/${selectedAlumno.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);
        const updatedUser = await response.json();
        console.log("Usuario actualizado:", updatedUser);
        alert("¡Usuario actualizado con éxito!");
      } else {
        // POST /api/usuarios
        const response = await authFetch(`${API_URL}/api/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error(`Error al crear: ${response.status}`);
        const newUser = await response.json();
        console.log("Usuario creado:", newUser);
        alert("¡Usuario creado con éxito!");
      }

      // Volver a cargar la lista
      await fetchData();
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  // 8. Eliminar Usuario
  const handleDeleteUser = async (alumnoId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      const response = await authFetch(`${API_URL}/api/usuarios/${alumnoId}`, {
        method: 'DELETE',
      });
      if (response.status === 204) {
        alert("Usuario eliminado exitosamente.");
        await fetchData();
      } else {
        throw new Error(`Error al eliminar: ${response.status}`);
      }
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("No se pudo eliminar el usuario.");
    }
  };

  if (loading) return <p className="loading-message">Cargando datos...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="table-container">
      <h2 className="table-title">Gestión de Usuarios Activos</h2>

      {/* Filtros de búsqueda */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre, correo, carrera o facultad"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="role-select"
        >
          <option value="">Todos los roles</option>
          {roles.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </select>

        <button className="add-user-button" onClick={handleOpenCreateModal}>
          <FaUserPlus /> Agregar Usuario
        </button>
      </div>

      {/* Tabla de usuarios */}
      <table className="alumno-proyectos-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Carrera</th>
            <th>Facultad</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlumnos.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.nombreUsuario}</td>
              <td>{alumno.correo}</td>
              <td>{alumno.carrera}</td>
              <td>{alumno.facultad}</td>
              <td>{alumno.rol.nombre}</td>
              <td>
                <button
                  className="action-button"
                  title="Editar Información"
                  onClick={() => handleOpenEditModal(alumno)}
                >
                  <FaEdit />
                </button>
                <button
                  className="action-button delete-button"
                  title="Eliminar Usuario"
                  onClick={() => handleDeleteUser(alumno.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición/creación */}
      {showModal && selectedAlumno && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>

            <label>Nombre de Usuario:</label>
            <input
              type="text"
              value={selectedAlumno.nombreUsuario}
              onChange={(e) =>
                setSelectedAlumno((prev) => ({ ...prev, nombreUsuario: e.target.value }))
              }
            />

            <label>Correo:</label>
            <input
              type="email"
              value={selectedAlumno.correo}
              onChange={(e) =>
                setSelectedAlumno((prev) => ({ ...prev, correo: e.target.value }))
              }
            />

            <label>Carrera:</label>
            <input
              type="text"
              value={selectedAlumno.carrera}
              onChange={(e) =>
                setSelectedAlumno((prev) => ({ ...prev, carrera: e.target.value }))
              }
            />

            <label>Facultad:</label>
            <input
              type="text"
              value={selectedAlumno.facultad}
              onChange={(e) =>
                setSelectedAlumno((prev) => ({ ...prev, facultad: e.target.value }))
              }
            />

            <label>Rol:</label>
            <select
              value={selectedAlumno.rol.id || ''}
              onChange={(e) =>
                setSelectedAlumno((prev) => ({
                  ...prev,
                  rol: { ...prev.rol, id: parseInt(e.target.value) },
                }))
              }
            >
              <option value="">Seleccione un rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>

            <div className="modal-buttons">
              <button className="save-button" onClick={handleSaveChanges}>
                Guardar Cambios
              </button>
              <button className="cancel-button" onClick={handleCloseModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumnosActivos;
