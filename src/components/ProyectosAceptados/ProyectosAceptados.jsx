// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './ProyectosAceptados.css';

// const ProyectosAceptados = () => {
//   const mockProyectosAceptados = [
//     { id: 1, titulo: 'Proyecto de Energía Solar', descripcion: 'Desarrollo de un sistema de energía solar para áreas rurales.', usuario_id: 101, carrera: 'Ingeniería Eléctrica', entregas: 'Primera Entrega' },
//     { id: 2, titulo: 'Aplicación de Gestión Escolar', descripcion: 'Creación de una aplicación para gestionar los recursos de una escuela.', usuario_id: 102, carrera: 'Ciencias de la Computación', entregas: 'Segunda Entrega' },
//     { id: 3, titulo: 'Plataforma de E-Commerce', descripcion: 'Desarrollo de una plataforma de comercio electrónico para pequeños negocios.', usuario_id: 103, carrera: 'Administración de Empresas', entregas: 'Primera Entrega' },
//     { id: 4, titulo: 'Sistema de Gestión de Inventarios', descripcion: 'Sistema para la gestión y control de inventarios en almacenes.', usuario_id: 104, carrera: 'Ingeniería Industrial', entregas: 'Tercera Entrega' },
//     { id: 5, titulo: 'Aplicación de Salud Mental', descripcion: 'App móvil para el seguimiento y mejora de la salud mental de los usuarios.', usuario_id: 105, carrera: 'Psicología', entregas: 'Final' },
//     { id: 6, titulo: 'Plataforma de Aprendizaje en Línea', descripcion: 'Desarrollo de una plataforma educativa para cursos en línea.', usuario_id: 106, carrera: 'Pedagogía', entregas: 'Cuarta Entrega' }
//   ];
//   const mockAdvisors = [
//     { id: 1, name: 'Asesor A' },
//     { id: 2, name: 'Asesor B' },
//     { id: 3, name: 'Asesor C' }
//   ];
//   const [proyectos, setProyectos] = useState([]);
//   const [filtroCarrera, setFiltroCarrera] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [selectedAdvisor, setSelectedAdvisor] = useState('');
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProyectosAceptados();
//   }, []);

//   const fetchProyectosAceptados = () => {
//     // Simulate an API call delay
//     setTimeout(() => {
//       setProyectos(mockProyectosAceptados);
//     }, 500); // Simulate a 0.5-second delay for loading data
//   };

//   // Function to filter projects by career
//   const handleFilterChange = (e) => {
//     setFiltroCarrera(e.target.value);
//   };

//   const filteredProyectos = proyectos.filter((proyecto) =>
//     filtroCarrera === '' || proyecto.carrera.toLowerCase().includes(filtroCarrera.toLowerCase())
//   );

//   // Open modal for changing advisor
//   const handleChangeAdvisor = (projectId) => {
//     setSelectedProjectId(projectId);
//     setShowModal(true);
//   };

//   // Handle advisor assignment
//   const handleAssignAdvisor = () => {
//     if (!isConfirmed) {
//       alert('Por favor, confirme el cambio de asesor marcando la casilla de verificación.');
//       return;
//     }

//     console.log(`Assigned advisor ${selectedAdvisor} to project ${selectedProjectId}`);
//     setShowModal(false); // Close modal after assigning advisor
//     setSelectedAdvisor('');
//     setIsConfirmed(false);
//   };

//   // Handle approve action with confirmation
//   const handleApprove = (projectId) => {
//     const isConfirmed = window.confirm('¿Está seguro de que desea aprobar este proyecto?');
//     if (isConfirmed) {
//       console.log(`Proyecto ${projectId} aprobado.`);
//       // Aquí puedes agregar la lógica para actualizar el estado del proyecto en la base de datos o API
//     }
//   };

//   return (
//     <div className='container'>
//       <h2 className='title'>Proyectos Aceptados</h2>

//       {/* Filter by Carrera */}
//       <div className='filter-container'>
//         <input
//           type="text"
//           placeholder="Filtrar por carrera..."
//           value={filtroCarrera}
//           onChange={handleFilterChange}
//           className='input-filtro'
//         />
//       </div>

//       <table className='tabla-proyectos'>
//         <thead>
//           <tr>
//             <th>Título</th>
//             <th>Descripción</th>
//             <th>Carrera</th>
//             <th>Entregas</th>
//             <th>Documento</th>
//             <th>Acciones</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredProyectos.map((proyecto) => (
//             <tr key={proyecto.id}>
//               <td>{proyecto.titulo}</td>
//               <td>{proyecto.descripcion}</td>
//               <td>{proyecto.carrera}</td>
//               <td>
//                 {proyecto.entregas}
//                 <button className='btn-aprobar' onClick={() => handleApprove(proyecto.id)}>Evaluar</button>
//               </td>
//               <td><button className='btn-entregas'>Descargar Documento</button></td>
//               <td>
//                 <button className='btn-entregas' onClick={() => navigate('/entregas')}>Ver Todas Entregas</button>
//                 <button className='btn-cambiar-asesor' onClick={() => handleChangeAdvisor(proyecto.id)}>Cambiar Asesor</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Modal for changing advisor */}
//       {showModal && (
//         <div className='modal'>
//           <div className='modal-content'>
//             <h3>Cambiar Asesor</h3>
//             <select 
//               onChange={(e) => setSelectedAdvisor(e.target.value)}
//               value={selectedAdvisor}
//               className='select-asesor'
//             >
//               <option value="">Seleccione Asesor</option>
//               {mockAdvisors.map(asesor => (
//                 <option key={asesor.id} value={asesor.id}>{asesor.name}</option>
//               ))}
//             </select>
//             <div className='checkbox-container'>
//               <input 
//                 type="checkbox" 
//                 checked={isConfirmed} 
//                 onChange={(e) => setIsConfirmed(e.target.checked)} 
//                 id="confirmar-cambio" 
//               />
//               <label htmlFor="confirmar-cambio">Confirmo el cambio de asesor</label>
//             </div>
//             <button className='btn-asignar' onClick={handleAssignAdvisor}>Asignar Asesor</button>
//             <button className='btn-cerrar' onClick={() => setShowModal(false)}>Cerrar</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProyectosAceptados;
