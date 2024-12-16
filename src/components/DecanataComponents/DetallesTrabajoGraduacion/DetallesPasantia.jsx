import React from "react";
import "./DetallesTrabajoGraduacion.css";
import EvaluarTrabajo from "../EvaluarTrabajo/EvaluarTrabajo";

const DetallesPasantia = ({ trabajo }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const {
    id,
    titulo,
    descripcion,
    tipoTrabajo,
    fechaInicio,
    fechaFin,
    estado,
    fechaCreacion,
    antecedentesInstitucion,
    descripcionEmpresa,
    actividades,
    supervisor,
    asesoresPropuestos,
    cartaAceptacion,
    inscripcionTrabajoGraduacion,
    certificacionGlobalNotas,
    constanciaServicioSocial,
    miembros,
  } = trabajo;

  return (
    <div className="document-wrapper">
      <div className="document-header">
        <h1>{titulo}</h1>
        <p>{tipoTrabajo}</p>
      </div>

      <div className="document-content">
        {/* Sección: Evaluar Trabajo */}
        <div className="evaluar">
          <EvaluarTrabajo trabajoId={id} />
        </div>

        {/* Sección: Información General */}
        <section className="document-section">
          <h2>Información General</h2>
          <p><strong>Descripción:</strong> {descripcion}</p>
          <p><strong>Estado:</strong> {estado}</p>
          <p><strong>Fecha de Creación:</strong> {fechaCreacion}</p>
          <p><strong>Fecha de Inicio:</strong> {fechaInicio}</p>
          <p><strong>Fecha de Fin:</strong> {fechaFin}</p>
        </section>

        {/* Sección: Antecedentes y Empresa */}
        <section className="document-section">
          <h2>Antecedentes y Empresa</h2>
          <p><strong>Antecedentes Institución:</strong> {antecedentesInstitucion}</p>
          <p><strong>Descripción de la Empresa:</strong> {descripcionEmpresa}</p>
        </section>

        {/* Sección: Actividades */}
        <section className="document-section">
          <h2>Actividades</h2>
          {actividades?.tareas ? (
            <ul>
              {actividades.tareas.map((tarea, index) => (
                <li key={index}>{tarea}</li>
              ))}
            </ul>
          ) : (
            <p>No hay actividades registradas.</p>
          )}
        </section>

        {/* Sección: Supervisor */}
        <section className="document-section">
          <h2>Supervisor</h2>
          {supervisor ? (
            <p>
              <strong>Nombre:</strong> {supervisor.nombre} <br />
              <strong>Cargo:</strong> {supervisor.cargo}
            </p>
          ) : (
            <p>No hay información del supervisor.</p>
          )}
        </section>

        {/* Sección: Asesores Propuestos */}
        <section className="document-section">
          <h2>Asesores Propuestos</h2>
          {asesoresPropuestos ? (
           <ul>
           {Array.isArray(trabajo.asesoresPropuestos) &&
             trabajo.asesoresPropuestos.map((asesor, index) => (
               <li key={index}>{asesor.nombre}</li>
             ))}
         </ul>
         
          ) : (
            <p>No hay asesores propuestos.</p>
          )}
        </section>

        {/* Sección: Miembros del Trabajo */}
        <section className="document-section">
          <h2>Miembros del Trabajo</h2>
          <p>{miembros || "No hay miembros registrados."}</p>
        </section>

        {/* Sección: Documentos Relacionados */}
        <section className="document-section">
      <h2>Documentos Relacionados</h2>
      <div className="document-container">
        {/* Inscripción Trabajo de Graduación */}
        <div className="document-item">
          <h3>Inscripción Trabajo Graduación</h3>
          {inscripcionTrabajoGraduacion ? (
            <img
              src={`${ API_URL}/uploads/${inscripcionTrabajoGraduacion}`}
              alt="Inscripción Trabajo Graduación"
              className="document-image"
              onError={(e) => {
                e.target.src = "/images/placeholder.png"; // Imagen de reemplazo
              }}
            />
          ) : (
            <p>No disponible</p>
          )}
        </div>

        {/* Certificación Global de Notas */}
        <div className="document-item">
          <h3>Certificación Global de Notas</h3>
          {certificacionGlobalNotas ? (
            <img
              src={`${API_URL}/uploads/${certificacionGlobalNotas}`}
              alt="Certificación Global de Notas"
              className="document-image"
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
          ) : (
            <p>No disponible</p>
          )}
        </div>

        {/* Constancia de Servicio Social */}
        <div className="document-item">
          <h3>Constancia de Servicio Social</h3>
          {constanciaServicioSocial ? (
            <img
              src={`${API_URL}/uploads/${constanciaServicioSocial}`}
              alt="Constancia de Servicio Social"
              className="document-image"
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
          ) : (
            <p>No disponible</p>
          )}
        </div>

        {/* Carta de Aceptación */}
        <div className="document-item">
          <h3>Carta de Aceptación</h3>
          {cartaAceptacion && cartaAceptacion[0]?.documento ? (
            <img
              src={`${API_URL}/uploads/${cartaAceptacion[0]?.documento}`}
              alt="Carta de Aceptación"
              className="document-image"
              onError={(e) => {
                e.target.src = "/images/placeholder.png";
              }}
            />
          ) : (
            <p>No disponible</p>
          )}
        </div>
      </div>
    </section>
      </div>
    </div>
  );
};

export default DetallesPasantia;
