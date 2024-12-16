import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaUserCog } from 'react-icons/fa';
import './AlumnosActivos.css';

const AlumnosActivos = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [alumnosData, setAlumnosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8080/api/usuarios/getAll', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al obtener los datos de los alumnos');
          }
          return response.json();
        })
        .then((data) => {
          setAlumnosData(data);
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    } else {
      setError('Token no encontrado. Por favor, inicie sesión.');
      setLoading(false);
    }
  }, [token]);

  const handleDelete = (alumnoId) => {
    fetch(`${API_URL}/api/usuarios/${alumnoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          setAlumnosData(alumnosData.filter((alumno) => alumno.id !== alumnoId));
        } else {
          throw new Error('Error al eliminar el alumno');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleUpdate = (alumnoId) => {
    navigate(`/actualizar-alumno/${alumnoId}`);
  };

  const handleUpdateRole = (alumnoId) => {
    navigate(`/actualizar-rol/${alumnoId}`);
  };

  if (loading) {
    return <p className="loading-message">Cargando datos, por favor espere...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <div className="table-container">
      <h2 className="table-title">Gestión de Usuarios Activos</h2>
      <p className="table-description">
        Administra los datos de los Usuarios activos y realiza acciones con un clic.
      </p>
      <table className="alumno-proyectos-table">
        <thead>
          <tr>
            <th>Nombre de Usuario</th>
            <th>Correo</th>
            <th>Carrera</th>
            <th>Facultad</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnosData.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.nombreUsuario}</td>
              <td>{alumno.correo}</td>
              <td>{alumno.carrera}</td>
              <td>{alumno.facultad}</td>
              <td>{alumno.rol.nombre}</td>
              <td>
                <div className="actions-menu">
                  <button
                    className="action-button"
                    title="Actualizar Información"
                    onClick={() => handleUpdate(alumno.id)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-button"
                    title="Actualizar Rol"
                    onClick={() => handleUpdateRole(alumno.id)}
                  >
                    <FaUserCog />
                  </button>
                  <button
                    className="action-button danger"
                    title="Eliminar Alumno"
                    onClick={() => handleDelete(alumno.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosActivos;
