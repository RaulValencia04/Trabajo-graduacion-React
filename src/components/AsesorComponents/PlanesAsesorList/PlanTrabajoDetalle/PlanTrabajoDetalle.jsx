import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../../../Auth/Helpers/api";
import "./PlanTrabajoDetalle.css";
import  EvaluarPlanTrabajo from "../PlanTrabajoDetalle/EvaluarPlanTrabajo";

const PlanTrabajoDetalle = () => {
  const { planId } = useParams();
  const { authFetch } = useApi();
  const API_URL = process.env.REACT_APP_API_URL;

  const [planDetalle, setPlanDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Subcomponente para manejar "Leer más" en texto largo.
  const TruncatedBlock = ({ title, text, limit = 300 }) => {
    const [expanded, setExpanded] = useState(false);

    if (!text) return null;

    const isLong = text.length > limit;
    const displayedText = expanded || !isLong
      ? text
      : text.slice(0, limit) + "...";

    return (
      <div className="desc-block">
        <h3>{title}</h3>
        <p>{displayedText}</p>
        {isLong && (
          <button
            className="toggle-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Leer menos" : "Leer más"}
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchPlanDetalle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authFetch(
          `${API_URL}/api/planes-trabajo/${planId}/detalle`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error al cargar el detalle del plan (status ${response.status}).`
          );
        }

        const data = await response.json();
        console.log("Plan Detalle:", data);
        setPlanDetalle(data);
      } catch (err) {
        console.error("Error al cargar el detalle:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlanDetalle();
    }
  }, [planId, authFetch, API_URL]);

  if (loading)
    return <p className="detail-loading">Cargando detalle del plan...</p>;
  if (error) return <p className="detail-error">Error: {error}</p>;
  if (!planDetalle)
    return (
      <p className="detail-notfound">No se encontró el detalle del plan.</p>
    );

  // Desestructuramos los campos que necesitamos
  const {
    tipoTrabajo,                // "Proyecto", "Investigación", "Pasantía"
    cronograma,
    actividades,
    fechasReportes,
    validado,
    linkDrive,
    observaciones,
    tituloTrabajo,
    descripcionTrabajoGraduacion,
    tipoTrabajoGeneral,
    estadoTrabajo,

    // Miembro actual
    miembroNombreUsuario,
    miembroCorreo,
    miembroCarrera,
    miembroFacultad,

    // Proyecto / Investigación
    problemaProyecto,
    justificacionProyecto,
    alcanceProyecto,

    // Pasantía
    antecedentesPasantia,
    descripcionEmpresaPasantia,

    // Imagen del cronograma (archivo subido)
    ruta_cronograma,

    // Lista JSON de TODOS los miembros
    todosLosMiembros,
  } = planDetalle;

  // Función para parsear JSON de manera segura
  const safeJSONParse = (str) => {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.warn("Error al parsear JSON:", error);
      return [];
    }
  };

  // Convertir campos JSON a Arrays
  const cronogramaArray = cronograma ? safeJSONParse(cronograma) : [];
  const actividadesArray = actividades ? safeJSONParse(actividades) : [];
  const fechasReportesArray = fechasReportes ? safeJSONParse(fechasReportes) : [];

  // Miembros (JSON)
  const miembrosArray = todosLosMiembros ? safeJSONParse(todosLosMiembros) : [];

  return (
    <div className="plan-container">
      <h1 className="plan-title">Plan de Trabajo Detallado</h1>

      {/* Información General del Trabajo */}
      <section className="plan-section">
        <h2>Información del Trabajo</h2>
        {tituloTrabajo && (
          <p>
            <strong>Título:</strong> {tituloTrabajo}
          </p>
        )}
        {descripcionTrabajoGraduacion && (
          <TruncatedBlock
            title="Descripción"
            text={descripcionTrabajoGraduacion}
            limit={300}
          />
        )}
        {estadoTrabajo && (
          <p>
            <strong>Estado:</strong> {estadoTrabajo}
          </p>
        )}
        {tipoTrabajoGeneral && (
          <p>
            <strong>Tipo de Trabajo:</strong> {tipoTrabajoGeneral}
          </p>
        )}
        <EvaluarPlanTrabajo planId={planId} />
      </section>

      {/* Información del Miembro Principal */}
      <section className="plan-section">
        <h2>Información del Estudiante</h2>
        {miembroNombreUsuario && (
          <p>
            <strong>Nombre:</strong> {miembroNombreUsuario}
          </p>
        )}
        {miembroCorreo && (
          <p>
            <strong>Correo:</strong> {miembroCorreo}
          </p>
        )}
        {miembroCarrera && (
          <p>
            <strong>Carrera:</strong> {miembroCarrera}
          </p>
        )}
        {miembroFacultad && (
          <p>
            <strong>Facultad:</strong> {miembroFacultad}
          </p>
        )}
      </section>

      {/* Lista de TODOS los miembros (si hay más) */}
      {miembrosArray.length > 1 && (
        <section className="plan-section">
          <h2>Todos los Miembros del Trabajo</h2>
          <ul className="miembros-list">
            {miembrosArray.map((m, idx) => {
              // Evitar duplicar el principal (opcional)
              if (m.nombreUsuario === miembroNombreUsuario) return null;

              return (
                <li key={idx} className="miembro-item">
                  <p>
                    <strong>Nombre:</strong> {m.nombreUsuario}
                  </p>
                  <p>
                    <strong>Correo:</strong> {m.correo}
                  </p>
                  <p>
                    <strong>Carrera:</strong> {m.carrera}
                  </p>
                  <p>
                    <strong>Facultad:</strong> {m.facultad}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Sección: Proyecto/Investigación */}
      {(tipoTrabajo === "Proyecto" || tipoTrabajo === "Investigación") && (
        <section className="plan-section">
          <h2>Detalles de Proyecto/Investigación</h2>
          {problemaProyecto && (
            <TruncatedBlock
              title="Problema"
              text={problemaProyecto}
              limit={400}
            />
          )}
          {justificacionProyecto && (
            <TruncatedBlock
              title="Justificación"
              text={justificacionProyecto}
              limit={400}
            />
          )}
          {alcanceProyecto && (
            <TruncatedBlock
              title="Alcance"
              text={alcanceProyecto}
              limit={400}
            />
          )}
        </section>
      )}

      {/* Sección: Pasantía */}
      {tipoTrabajo === "Pasantía" &&
        (antecedentesPasantia || descripcionEmpresaPasantia) && (
          <section className="plan-section">
            <h2>Detalles de Pasantía</h2>
            {antecedentesPasantia && (
              <TruncatedBlock
                title="Antecedentes de la Institución"
                text={antecedentesPasantia}
                limit={400}
              />
            )}
            {descripcionEmpresaPasantia && (
              <TruncatedBlock
                title="Descripción de la Empresa"
                text={descripcionEmpresaPasantia}
                limit={400}
              />
            )}
          </section>
        )}

      {/* Detalles del Plan */}
      <section className="plan-section">
        <h2>Detalles del Plan</h2>
        <p>
          <strong>Validado:</strong> {validado ? "Sí" : "No"}
        </p>
        {observaciones && (
          <TruncatedBlock
            title="Observaciones"
            text={observaciones}
            limit={200}
          />
        )}
        {linkDrive && (
          <p>
            <strong>Link Adicional:</strong>{" "}
            <a href={linkDrive} target="_blank" rel="noopener noreferrer">
              Abrir Documento
            </a>
          </p>
        )}
      </section>

      {/* Cronograma: Imagen subida (ruta_cronograma) */}
      {(ruta_cronograma || cronogramaArray.length > 0) && (
        <section className="plan-section">
          <h2>Cronograma</h2>

          {/* Mostrar imagen si existe */}
          {ruta_cronograma && (
            <div className="cronograma-image-container">
              <h3>Imagen del Cronograma</h3>
              <img
                src={`${API_URL}/uploads/${ruta_cronograma}`}
                alt="Cronograma"
                className="cronograma-image"
              />
            </div>
          )}

          {/* Mostrar lista de cronograma si existe */}
          {cronogramaArray.length > 0 && (
            <ul className="cronograma-list">
              {cronogramaArray.map((item, index) => (
                <li key={index} className="cronograma-item">
                  {item.actividad && (
                    <p>
                      <strong>Actividad:</strong> {item.actividad}
                    </p>
                  )}
                  {item.fechaInicio && (
                    <p>
                      <strong>Fecha Inicio:</strong>{" "}
                      {Array.isArray(item.fechaInicio)
                        ? item.fechaInicio.join("-")
                        : item.fechaInicio}
                    </p>
                  )}
                  {item.fechaFin && (
                    <p>
                      <strong>Fecha Fin:</strong>{" "}
                      {Array.isArray(item.fechaFin)
                        ? item.fechaFin.join("-")
                        : item.fechaFin}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Actividades */}
      {actividadesArray.length > 0 && (
        <section className="plan-section">
          <h2>Actividades Generales</h2>
          <ul className="actividades-list">
            {actividadesArray.map((act, index) => (
              <li key={index}>{act}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Fechas de Reportes (Opcional) */}
      {fechasReportesArray.length > 0 && (
        <section className="plan-section">
          <h2>Fechas de Reportes</h2>
          <table className="reportes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha de Reporte</th>
              </tr>
            </thead>
            <tbody>
              {fechasReportesArray.map((fecha, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {Array.isArray(fecha) && fecha.length === 3
                      ? `${fecha[2]}/${fecha[1]}/${fecha[0]}`
                      : fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default PlanTrabajoDetalle;
