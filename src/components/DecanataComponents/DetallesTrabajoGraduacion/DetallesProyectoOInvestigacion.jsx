import React from "react";
import "./DetallesTrabajoGraduacion.css";
import EvaluarTrabajo from "../EvaluarTrabajo/EvaluarTrabajo";

const DetallesProyectoOInvestigacion = ({ trabajo }) => {
  const API_URL = process.env.REACT_APP_API_URL;
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
    cartaAceptacion, // No modificar esta variable directamente
    estado,
    fechaCreacion,
  } = trabajo;

  // Asegurar que cartaAceptacion sea un array válido
  const parsedCartaAceptacion = Array.isArray(cartaAceptacion)
    ? cartaAceptacion
    : [];

  let parsedObjetivos = [];

  const parsedAsesores = Array.isArray(asesoresPropuestos)
    ? asesoresPropuestos
    : [];

  let parsedActores = {};
  try {
    parsedActores = actores ? JSON.parse(actores) : {};
  } catch (error) {
    console.error("Error al parsear los actores:", error);
    parsedActores = {};
  }

  try {
    parsedObjetivos = objetivos ? JSON.parse(objetivos) : [];
  } catch (error) {
    parsedObjetivos = ["No se pudo parsear objetivos"];
  }

  // try {
  //   parsedCartaAceptacion =
  //     typeof cartaAceptacion === "string"
  //       ? JSON.parse(cartaAceptacion)
  //       : Array.isArray(cartaAceptacion)
  //       ? cartaAceptacion
  //       : [];
  // } catch (error) {
  //   console.error("Error al parsear cartaAceptacion:", error);
  //   parsedCartaAceptacion = [];
  // }
  // console.log("parsedCartaAceptacion:", parsedCartaAceptacion);

  return (
    <div className="document-wrapper">
      <div className="document-header">
        <h1>{titulo}</h1>
        <p>{tipoTrabajo === "Proyecto" ? "Proyecto" : "Investigación"}</p>
      </div>

      <div className="document-content">
        {/* Sección 1: Información del alumno y asesores propuestos */}

        <div className="evaluar">
          <EvaluarTrabajo trabajoId={id} />
        </div>
        <section className="document-section">
          <h2>Datos del Alumno y Asesores Propuestos</h2>
          {miembros && (
            <div>
              <strong>Miembros del Trabajo:</strong>
              <p>{miembros}</p>
            </div>
          )}
          {parsedAsesores && parsedAsesores.length > 0 ? (
            <div>
              <strong>Asesores Propuestos:</strong>
              <ul>
                {parsedAsesores.map((asesor, index) => (
                  <li key={index}>{asesor.nombre}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No hay asesores propuestos disponibles.</p>
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
          <p>
            <strong>Tipo de Trabajo:</strong> {tipoTrabajo}
          </p>
          <p>
            <strong>Estado:</strong> {estado}
          </p>
          <p>
            <strong>Fecha de Creación:</strong>{" "}
            {fechaCreacion || "No disponible"}
          </p>
          <p>
            <strong>Fecha de Inicio:</strong> {fechaInicio}
          </p>
          <p>
            <strong>Fecha de Fin:</strong> {fechaFin}
          </p>
        </section>

        {/* Sección 4: Información específica del Proyecto/Investigación */}
        <section className="document-section">
          <h2>Información del {tipoTrabajo}</h2>
          <p>
            <strong>Problema:</strong> {problema}
          </p>
          <p>
            <strong>Justificación:</strong> {justificacion}
          </p>
          <p>
            <strong>Alcance:</strong> {alcance}
          </p>

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

          <p>
            <strong>Descripción de Objetivos:</strong> {descripcionObjetivos}
          </p>

          <h3>Actores</h3>
          {Object.keys(parsedActores).length > 0 ? (
            <ul>
              {Object.entries(parsedActores).map(([rol, datos], index) =>
                datos.nombre.trim() ? ( // Solo mostrar si el nombre no está vacío
                  <li key={index}>
                    <strong>
                      {rol.charAt(0).toUpperCase() + rol.slice(1)}:
                    </strong>{" "}
                    {datos.nombre} <br />
                    <small>{datos.descripcion}</small>
                  </li>
                ) : null
              )}
            </ul>
          ) : (
            <p>No hay actores disponibles.</p>
          )}
        </section>

        {/* Sección 5: Documentos y archivos relacionados */}
        <section className="document-section">
          <h2>Documentos Relacionados</h2>
          <div className="document-container">
            {/* Inscripción Trabajo de Graduación */}
            <div className="document-item">
              <h3>Inscripción Trabajo Graduación</h3>
              {inscripcionTrabajoGraduacion ? (
                <img
                  src={`${API_URL}/uploads/${inscripcionTrabajoGraduacion}`}
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
              {parsedCartaAceptacion.length > 0 ? (
                <>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {new Date(
                      parsedCartaAceptacion[0].fecha[0],
                      parsedCartaAceptacion[0].fecha[1] - 1,
                      parsedCartaAceptacion[0].fecha[2]
                    ).toLocaleDateString()}
                  </p>
                  <img
                    src={`${API_URL}/uploads/${parsedCartaAceptacion[0].documento}`}
                    alt="Carta de Aceptación"
                    className="document-image"
                    onError={(e) => {
                      console.error("Error al cargar la imagen:", e.target.src);
                      e.target.src = "/images/placeholder.png"; // Imagen de respaldo en caso de error
                    }}
                  />
                </>
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

export default DetallesProyectoOInvestigacion;
