import React from 'react';
import './DetallesTrabajoGraduacion.css';
import EvaluarTrabajo from "../EvaluarTrabajo/EvaluarTrabajo"

const DetallesProyectoOInvestigacion = ({ trabajo }) => {
  const {
    id,
    titulo,
    descripcion,
    tipoTrabajo,
    fechaInicio,
    fechaFin,
    problema,
    justificacion,
    alcance,
    objetivos,
    descripcionObjetivos,
    actores,
    miembros,
    asesoresPropuestos,
    inscripcionTrabajoGraduacion,
    certificacionGlobalNotas,
    constanciaServicioSocial,
    cartaAceptacion,
    estado,
    fechaCreacion
  } = trabajo;

  // Parsear campos JSON que son strings (si existen)
  let parsedActores = [];
  let parsedObjetivos = [];
  let parsedAsesores = [];

  try {
    parsedActores = actores ? JSON.parse(actores) : [];
  } catch (error) {
    parsedActores = ["No se pudo parsear actores"];
  }

  try {
    parsedObjetivos = objetivos ? JSON.parse(objetivos) : [];
  } catch (error) {
    parsedObjetivos = ["No se pudo parsear objetivos"];
  }

  try {
    parsedAsesores = asesoresPropuestos ? JSON.parse(asesoresPropuestos) : [];
  } catch (error) {
    parsedAsesores = ["No se pudo parsear asesores propuestos"];
  }

  return (
    <div className="document-wrapper">
      <div className="document-header">
        <h1>{titulo}</h1>
        <p>{tipoTrabajo === 'Proyecto' ? 'Proyecto' : 'Investigación'}</p>
      </div>

      <div className="document-content">
        {/* Sección 1: Información del alumno y asesores propuestos */}

        <div className="evaluar">
            <EvaluarTrabajo trabajoId={id}/>
        </div>
        <section className="document-section">
          <h2>Datos del Alumno y Asesores Propuestos</h2>
          {miembros && (
            <div>
              <strong>Miembros del Trabajo:</strong>
              <p>{miembros}</p>
            </div>
          )}
          {parsedAsesores.length > 0 && (
            <div>
              <strong>Asesores Propuestos:</strong>
              <ul>
                {parsedAsesores.map((asesor, index) => (
                  <li key={index}>{asesor.nombre}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Sección 2: Descripción general del trabajo */}
        <section className="document-section">
          <h2>Descripción del Trabajo</h2>
          <p>{descripcion}</p>
        </section>

        {/* Sección 3: Detalles del trabajo (Tipo, Fechas, Estado) */}
        <section className="document-section">
          <h2>Detalles del Trabajo</h2>
          <p><strong>Tipo de Trabajo:</strong> {tipoTrabajo}</p>
          <p><strong>Estado:</strong> {estado}</p>
          <p><strong>Fecha de Creación:</strong> {fechaCreacion || 'No disponible'}</p>
          <p><strong>Fecha de Inicio:</strong> {fechaInicio}</p>
          <p><strong>Fecha de Fin:</strong> {fechaFin}</p>
        </section>

        {/* Sección 4: Información específica del Proyecto/Investigación */}
        <section className="document-section">
          <h2>Información del {tipoTrabajo}</h2>
          <p><strong>Problema:</strong> {problema}</p>
          <p><strong>Justificación:</strong> {justificacion}</p>
          <p><strong>Alcance:</strong> {alcance}</p>

          <h3>Objetivos</h3>
          {parsedObjetivos.length > 0 ? (
            <ul>
              {parsedObjetivos.map((obj, index) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          ) : (
            <p>No hay objetivos disponibles.</p>
          )}

          <p><strong>Descripción de Objetivos:</strong> {descripcionObjetivos}</p>

          <h3>Actores</h3>
          {parsedActores.length > 0 ? (
            <ul>
              {parsedActores.map((actor, index) => (
                <li key={index}>{actor}</li>
              ))}
            </ul>
          ) : (
            <p>No hay actores disponibles.</p>
          )}
        </section>

        {/* Sección 5: Documentos y archivos relacionados */}
        <section className="document-section">
          <h2>Documentos Relacionados</h2>
          <p><strong>Inscripción Trabajo Graduación:</strong> {inscripcionTrabajoGraduacion}</p>
          <p><strong>Certificación Global de Notas:</strong> {certificacionGlobalNotas}</p>
          <p><strong>Constancia de Servicio Social:</strong> {constanciaServicioSocial}</p>
          <p><strong>Carta de Aceptación:</strong> {cartaAceptacion ? JSON.stringify(cartaAceptacion) : 'No disponible'}</p>
        </section>
      </div>
    </div>
  );
};

export default DetallesProyectoOInvestigacion;
