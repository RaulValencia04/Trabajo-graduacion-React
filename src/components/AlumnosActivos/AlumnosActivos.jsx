import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AlumnosActivos.css';

const AlumnosActivos = () => {
  // Datos simulados de alumnos y sus proyectos
  const alumnosData = [
    { 
      id: 1, 
      nombre: 'Juan Pérez', 
      carrera: 'Ingeniería Informática', 
      proyecto: 'Sistema de Gestión Académica', 
      numeroEntrega: 'Primera Entrega', 
      estado: 'A Tiempo',
      entregasTotales: 5,
      entregasRealizadas: 3,
      contacto: 'juan.perez@example.com'
    },
    { 
      id: 2, 
      nombre: 'María López', 
      carrera: 'Administración de Empresas', 
      proyecto: 'Aplicación de Control Financiero', 
      numeroEntrega: 'Segunda Entrega', 
      estado: 'Retrasado',
      entregasTotales: 5,
      entregasRealizadas: 2,
      contacto: 'maria.lopez@example.com'
    },
    { 
      id: 3, 
      nombre: 'Carlos Sánchez', 
      carrera: 'Ingeniería Civil', 
      proyecto: 'Plataforma de E-Learning', 
      numeroEntrega: 'Primera Entrega', 
      estado: 'A Tiempo',
      entregasTotales: 6,
      entregasRealizadas: 4,
      contacto: 'carlos.sanchez@example.com'
    },
    { 
      id: 4, 
      nombre: 'Ana García', 
      carrera: 'Diseño Gráfico', 
      proyecto: 'Sistema de Inventarios', 
      numeroEntrega: 'Tercera Entrega', 
      estado: 'Retrasado',
      entregasTotales: 6,
      entregasRealizadas: 4,
      contacto: 'ana.garcia@example.com'
    },
    { 
      id: 5, 
      nombre: 'Luis Fernández', 
      carrera: 'Psicología', 
      proyecto: 'Aplicación de Salud Mental', 
      numeroEntrega: 'Segunda Entrega', 
      estado: 'A Tiempo',
      entregasTotales: 5,
      entregasRealizadas: 5,
      contacto: 'luis.fernandez@example.com'
    }
  ];

  const navigate = useNavigate();

  const handleViewDetails = (alumnoId) => {
    // Navega al componente de detalles del alumno usando el ID del alumno
    navigate(`/detalles-alumno/${alumnoId}`);
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Alumnos Activos y sus Proyectos</h2>
      <table className="alumno-proyectos-table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Carrera</th>
            <th>Proyecto</th>
            <th>Entrega Actual</th>
            <th>Estado</th>
            <th>Entregas Realizadas</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnosData.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.nombre}</td>
              <td>{alumno.carrera}</td>
              <td>{alumno.proyecto}</td>
              <td>{alumno.numeroEntrega}</td>
              <td>
                <span className={alumno.estado === 'A Tiempo' ? 'estado-atiempo' : 'estado-retrasado'}>
                  {alumno.estado}
                </span>
              </td>
              <td>{`${alumno.entregasRealizadas} / ${alumno.entregasTotales}`}</td>
              <td>{alumno.contacto}</td>
              <td>
                <button 
                  className="btn-ver-detalles" 
                  onClick={() => handleViewDetails(alumno.id)}
                >
                  Ver Detalle
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
