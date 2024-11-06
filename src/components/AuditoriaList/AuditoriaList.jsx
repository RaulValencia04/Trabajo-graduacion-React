import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuditoriaList.css';

const AuditoriaList = () => {
  const mockAuditoriaData = [
    { 
      id: 1, 
      tabla: 'usuarios', 
      operacion: 'INSERT', 
      usuario: 'admin', 
      ip_usuario: '192.168.1.10',
      registro_id: 101, 
      descripcion: 'Se añadió un nuevo usuario al sistema.', 
      fecha: '2024-09-01', 
      hora: '10:15:00',
      detalles: { nombre: 'John Doe', correo: 'john.doe@example.com', rol: 'Estudiante' } 
    },
    { 
      id: 2, 
      tabla: 'proyectos', 
      operacion: 'UPDATE', 
      usuario: 'john.doe', 
      ip_usuario: '192.168.1.11',
      registro_id: 202, 
      descripcion: 'Se actualizó el título del proyecto.', 
      fecha: '2024-09-01', 
      hora: '11:20:00',
      detalles: { titulo_anterior: 'Proyecto Antiguo', titulo_nuevo: 'Proyecto Actualizado', modificado_por: 'john.doe' } 
    },
    { 
      id: 3, 
      tabla: 'documentos', 
      operacion: 'DELETE', 
      usuario: 'mary.jane', 
      ip_usuario: '192.168.1.12',
      registro_id: 303, 
      descripcion: 'Se eliminó un documento importante.', 
      fecha: '2024-09-01', 
      hora: '12:25:00',
      detalles: { nombre_documento: 'Contrato.pdf', tipo_documento: 'PDF', eliminado_por: 'mary.jane' } 
    },
    { 
      id: 4, 
      tabla: 'seguimiento', 
      operacion: 'INSERT', 
      usuario: 'admin', 
      ip_usuario: '192.168.1.10',
      registro_id: 404, 
      descripcion: 'Se añadió un seguimiento al proyecto.', 
      fecha: '2024-09-01', 
      hora: '13:30:00',
      detalles: { proyecto_id: 101, asesor: 'Asesor A', comentario: 'Seguimiento inicial creado' } 
    },
    { 
      id: 5, 
      tabla: 'informes', 
      operacion: 'UPDATE', 
      usuario: 'peter.parker', 
      ip_usuario: '192.168.1.13',
      registro_id: 505, 
      descripcion: 'Se modificó el estado del informe.', 
      fecha: '2024-09-01', 
      hora: '14:35:00',
      detalles: { estado_anterior: 'Pendiente', estado_nuevo: 'Aprobado', revisado_por: 'peter.parker' } 
    },
  ];

  const renderIcon = (operacion) => {
    switch (operacion) {
      case 'INSERT':
        return <i className="bi bi-plus-circle-fill text-success"></i>; // Icono de Insert (verde)
      case 'UPDATE':
        return <i className="bi bi-arrow-repeat text-warning"></i>; // Icono de Update (ámbar)
      case 'DELETE':
        return <i className="bi bi-trash-fill text-danger"></i>; // Icono de Delete (rojo)
      default:
        return null;
    }
  };

  return (
    <div className='auditoria-container'>
      <h2 className='title'>Auditoría de Actividades</h2>
      <table className='tabla-auditoria'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tabla</th>
            <th>Operación</th>
            <th>Usuario</th>
            <th>IP Usuario</th>
            <th>ID Registro</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {mockAuditoriaData.map((auditoria) => (
            <tr key={auditoria.id}>
              <td>{auditoria.id}</td>
              <td>{auditoria.tabla}</td>
              <td>
                {renderIcon(auditoria.operacion)} {auditoria.operacion}
              </td>
              <td>{auditoria.usuario}</td>
              <td>{auditoria.ip_usuario}</td>
              <td>{auditoria.registro_id}</td>
              <td>{auditoria.descripcion}</td>
              <td>{auditoria.fecha}</td>
              <td>{auditoria.hora}</td>
              <td>
                <pre className='detalles'>{JSON.stringify(auditoria.detalles, null, 2)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditoriaList;
