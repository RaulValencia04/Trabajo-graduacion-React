import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AlumnosActivos.css';

const AlumnosActivos = () => {
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
          'Authorization': `Bearer ${token}`,
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
    fetch(`http://localhost:8080/api/usuarios/${alumnoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          setAlumnosData(alumnosData.filter(alumno => alumno.id !== alumnoId));
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
    return <p>Cargando datos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="table-container">
      <h2 className="table-title">Alumnos Activos y sus Detalles</h2>
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
               
                <button 
                  className="btn-actualizar" 
                  onClick={() => handleUpdate(alumno.id)}
                >
                  Actualizar
                </button>
                <button 
                  className="btn-actualizar-rol" 
                  onClick={() => handleUpdateRole(alumno.id)}
                >
                  Actualizar Rol
                </button>
                <button 
                  className="btn-borrar" 
                  onClick={() => handleDelete(alumno.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlumnosActivos;
