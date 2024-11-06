import React, { useState, useEffect } from 'react';
import './PropuestasSinAprobar.css';

const PropuestasSinAprobar = () => {
  const mockPropuestas = [
    { id: 1, titulo: 'Proyecto de Energía Solar', descripcion: 'Desarrollo de un sistema de energía solar para áreas rurales.', usuario_id: 101, fecha_inicio: '2024-01-10', fecha_fin: '2024-06-15', estado: 'En espera' },
    { id: 2, titulo: 'Aplicación de Gestión Escolar', descripcion: 'Creación de una aplicación para gestionar los recursos de una escuela.', usuario_id: 102, fecha_inicio: '2024-02-01', fecha_fin: '2024-07-01', estado: 'En espera' },
    { id: 3, titulo: 'Plataforma de E-Commerce', descripcion: 'Desarrollo de una plataforma de comercio electrónico para pequeños negocios.', usuario_id: 103, fecha_inicio: '2024-03-01', fecha_fin: '2024-08-01', estado: 'En espera' },
    { id: 4, titulo: 'Sistema de Gestión de Inventarios', descripcion: 'Sistema para la gestión y control de inventarios en almacenes.', usuario_id: 104, fecha_inicio: '2024-03-15', fecha_fin: '2024-09-15', estado: 'En espera' },
    { id: 5, titulo: 'Aplicación de Salud Mental', descripcion: 'App móvil para el seguimiento y mejora de la salud mental de los usuarios.', usuario_id: 105, fecha_inicio: '2024-04-01', fecha_fin: '2024-10-01', estado: 'En espera' },
    { id: 6, titulo: 'Plataforma de Aprendizaje en Línea', descripcion: 'Desarrollo de una plataforma educativa para cursos en línea.', usuario_id: 106, fecha_inicio: '2024-04-10', fecha_fin: '2024-11-10', estado: 'Rechazado' }
  ];

  const mockAdvisors = [
    { id: 1, name: 'Asesor A' },
    { id: 2, name: 'Asesor B' },
    { id: 3, name: 'Asesor C' }
  ];

  const [propuestas, setPropuestas] = useState([]);
  const [asesorId, setAsesorId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    fetchPropuestas();
  }, []);

  const fetchPropuestas = () => {
    setTimeout(() => {
      setPropuestas(mockPropuestas);
    }, 500); // Simulate a delay
  };

  const handleApprove = (id) => {
    const updatedPropuestas = propuestas.map((propuesta) =>
      propuesta.id === id ? { ...propuesta, estado: 'En Progreso' } : propuesta
    );
    setPropuestas(updatedPropuestas);
    setSelectedProposal(id); // Set the selected proposal for advisor assignment
    setShowModal(true); // Show the modal for assigning an advisor
  };

  const handleAssignAdvisor = () => {
    console.log(`Assigned advisor ${asesorId} to proposal ${selectedProposal}`);
    setShowModal(false); // Close the modal
    setAsesorId(''); // Reset advisor selection
  };

  return (
    <div className='container'>
      <h2 className='title'>Propuestas Sin Aprobar</h2>
      <table className='tabla-propuestas'>
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Usuario ID</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Documento</th>
            <th>Estado Actual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {propuestas.map((propuesta) => (
            <tr key={propuesta.id}>
              <td>{propuesta.titulo}</td>
              <td>{propuesta.descripcion}</td>
              <td>{propuesta.usuario_id}</td>
              <td>{propuesta.fecha_inicio}</td>
              <td>{propuesta.fecha_fin}</td>
              <td><button className='btn-descargar'>Descargar Documento</button></td>
              <td>
                <span className={`estado ${propuesta.estado.toLowerCase().replace(' ', '-')}`}>
                  {propuesta.estado}
                </span>
              </td>
              <td>
                <button className='btn-aprobar' onClick={() => handleApprove(propuesta.id)}>Modificar Estado</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for assigning an advisor */}
      {showModal && (
        <div className='modal'>
          <div className='modal-content'>
            <h3>Asignar Asesor</h3>
            <select 
              onChange={(e) => setAsesorId(e.target.value)}
              value={asesorId}
              className='select-asesor'
            >
              <option value="">Seleccione Asesor</option>
              {mockAdvisors.map(asesor => (
                <option key={asesor.id} value={asesor.id}>{asesor.name}</option>
              ))}
            </select>
            <button className='btn-asignar' onClick={handleAssignAdvisor}>Asignar Asesor</button>
            <button className='btn-cerrar' onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropuestasSinAprobar;
