import React from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../docs/FileUpload'; // Asumimos que este componente permite la subida de archivos
import './EntregasAprobadas.css'; // Importa el CSS

const EntregasAprobadas = () => {
  // Datos simulados de alumnos con entregas aprobadas
  const alumnosAprobadosData = [
    { 
      id: 1, 
      nombre: 'Juan Pérez', 
      carrera: 'Ingeniería Informática', 
      proyecto: 'Sistema de Gestión Académica', 
      entregaAprobada: 'Entrega Final',
      estado: 'Subir Documento',
      comentarioDecanato: '',
      contacto: 'juan.perez@example.com'
    },
    { 
      id: 2, 
      nombre: 'María López', 
      carrera: 'Administración de Empresas', 
      proyecto: 'Aplicación de Control Financiero', 
      entregaAprobada: '2da Entrega',
      estado: 'En espera de revisión',
      comentarioDecanato: 'Revisar la sección de conclusiones.',
      contacto: 'maria.lopez@example.com'
    },
    { 
      id: 3, 
      nombre: 'Luis Fernández', 
      carrera: 'Psicología', 
      proyecto: 'Aplicación de Salud Mental', 
      entregaAprobada: '3ra Entrega',
      estado: 'Subir Documento',
      comentarioDecanato: '',
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
      <h2 className="table-title">Entregas Aprobadas - Subir Informe para Decanato</h2>
      <table className="alumno-proyectos-table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Carrera</th>
            <th>Proyecto</th>
            <th>Entrega Aprobada</th>
            <th>Estado</th>
            <th>Comentario de Decanato</th>
            <th>Subir Informe</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnosAprobadosData.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.nombre}</td>
              <td>{alumno.carrera}</td>
              <td>{alumno.proyecto}</td>
              <td>{alumno.entregaAprobada}</td>
              <td className={alumno.estado === 'Subir Documento' ? 'estado-subir' : 'estado-revision'}>
                {alumno.estado}
              </td>
              <td>{alumno.comentarioDecanato || 'Sin comentarios'}</td>
              <td>
                {alumno.estado === 'Subir Documento' ? (
                  <FileUpload onSuccess={(result) => console.log('Informe subido con éxito:', result)} />
                ) : (
                  <span>No disponible</span>
                )}
              </td>
              <td>
                <button 
                  className="btn-ver-detalles" 
                  onClick={() => handleViewDetails(alumno.id)}
                >
                  Ver Proyecto
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntregasAprobadas;
