import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../../docs/FileUpload";
import "./FormulariosPlanesTrabajo.css";
import { useApi } from "../../Auth/Helpers/api";
import { AuthContext } from "../../Auth/Context/AuthContext";

/**
 * @param {Object} props
 * @param {Number} props.trabajoId - ID del trabajo de graduación.
 * @param {String} props.tipoTrabajo - "Pasantía" | "Proyecto" | "Investigación"
 * @param {Object} [props.planData] - Datos precargados si el plan fue rechazado. Estructura:
 *        {
 *           observaciones: string,
 *           cronograma: string (JSON),
 *           actividades: string (JSON),
 *           fechasReportes: string (JSON),
 *           fechaVisita: Date (o string),
 *           fechaEntregaInformeFinal: Date (o string),
 *           linkDrive: string,
 *           ruta_cronograma: string,
 *           .
 *        }
 */
const FormulariosPlanesTrabajo = ({ trabajoId, tipoTrabajo, planData }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const { state } = useContext(AuthContext);
  const { userId } = state;

  const [currentStep, setCurrentStep] = useState(0);

  // Estado del plan de trabajo
  const [planTrabajo, setPlanTrabajo] = useState({
    trabajoGraduacionId: trabajoId,
    tipoTrabajo,
    cronograma: [{ actividad: "", fechaInicio: "", fechaFin: "" }],
    actividades: [""],
    fechasReportes: [""],
    fechaVisita: tipoTrabajo === "Pasantía" ? "" : null,
    fechaEntregaInformeFinal: "",
    validado: false,
    linkDrive: "",
    rutaCronograma: "",
    antecedentes: "",
    observaciones: "",
  });
  const formatDate = (dateValue) => {
    if (!dateValue) return ""; // Evita errores si el valor es null o undefined

    if (Array.isArray(dateValue)) {
      // Si la fecha viene en formato array [2025,3,4], la convertimos
      const [year, month, day] = dateValue;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }

    return dateValue; // Si ya es un string válido en "yyyy-MM-dd", devolverlo sin cambios
  };

  // Pre-carga de datos si `planData` existe (por ejemplo, plan rechazado)
  useEffect(() => {
    if (planData) {
      // console.log(planData);
      setPlanTrabajo((prev) => ({
        ...prev,
        observaciones: planData.observaciones || "",
        cronograma: planData.cronograma
          ? safeJSONParse(planData.cronograma)
          : prev.cronograma,
        actividades: planData.actividades
          ? safeJSONParse(planData.actividades)
          : prev.actividades,
        fechasReportes: planData.fechasReportes
          ? safeJSONParse(planData.fechasReportes)
          : prev.fechasReportes,
        fechaVisita: planData.fechaVisita || prev.fechaVisita,
        fechaEntregaInformeFinal:
          planData.fechaEntregaInformeFinal || prev.fechaEntregaInformeFinal,
        linkDrive: planData.linkDrive || "",
        rutaCronograma: planData.ruta_cronograma || "",
      }));
    }
  }, [planData]);

  // Función parse JSON segura
  const safeJSONParse = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const steps = [
    "Información General",
    "Cronograma",
    "Actividades",
    "Validación",
  ];

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Manejador de campos simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanTrabajo((prev) => ({ ...prev, [name]: value }));
  };

  // ------------- CRONOGRAMA -------------
  const addCronogramaItem = () => {
    setPlanTrabajo((prev) => ({
      ...prev,
      cronograma: [
        ...prev.cronograma,
        { actividad: "", fechaInicio: "", fechaFin: "" },
      ],
    }));
  };

  const handleCronogramaChange = (index, field, value) => {
    setPlanTrabajo((prev) => {
      const newArr = [...prev.cronograma];
      newArr[index][field] = value;
      return { ...prev, cronograma: newArr };
    });
  };

  // ------------- ACTIVIDADES -------------
  const addActividad = () => {
    setPlanTrabajo((prev) => ({
      ...prev,
      actividades: [...prev.actividades, ""],
    }));
  };
  const removeActividad = (index) => {
    setPlanTrabajo((prev) => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== index),
    }));
  };
  const handleActividadChange = (index, value) => {
    setPlanTrabajo((prev) => {
      const newArr = [...prev.actividades];
      newArr[index] = value;
      return { ...prev, actividades: newArr };
    });
  };

  // ------------- FECHAS DE REPORTES -------------
  const addFechaReporte = () => {
    setPlanTrabajo((prev) => ({
      ...prev,
      fechasReportes: [...prev.fechasReportes, ""],
    }));
  };
  const removeFechaReporte = (index) => {
    setPlanTrabajo((prev) => ({
      ...prev,
      fechasReportes: prev.fechasReportes.filter((_, i) => i !== index),
    }));
  };
  const handleFechaReporteChange = (index, value) => {
    setPlanTrabajo((prev) => {
      const newArr = [...prev.fechasReportes];
      newArr[index] = value;
      return { ...prev, fechasReportes: newArr };
    });
  };

  // ------------- SUBMIT -------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalLinkDrive = planTrabajo.linkDrive.trim();
    if (!finalLinkDrive && planTrabajo.rutaCronograma) {
      finalLinkDrive = planTrabajo.rutaCronograma;
    }

    const bodyData = {
      trabajoGraduacion: { id: planTrabajo.trabajoGraduacionId },
      tipoTrabajo: planTrabajo.tipoTrabajo,
      cronograma: planTrabajo.cronograma,
      actividades: planTrabajo.actividades,
      fechasReportes: planTrabajo.fechasReportes,
      fechaVisita: planTrabajo.fechaVisita || null,
      fechaEntregaInformeFinal: planTrabajo.fechaEntregaInformeFinal,
      validado: planTrabajo.validado,
      linkDrive: finalLinkDrive,
      rutaCronograma: planTrabajo.rutaCronograma,
      antecedentes: planTrabajo.antecedentes,
      observaciones: planTrabajo.observaciones,
      creadoPor: { id: userId },
    };

    try {
      let response;
      if (planData?.planId) {
        // 🔹 Si hay un `planId`, actualiza el plan existente (PUT)
        response = await authFetch(
          `${API_URL}/api/planes-trabajo/${planData.planId}/actualizar`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
          }
        );
      } else {
        // 🔹 Si NO hay `planId`, crea un nuevo plan (POST)
        response = await authFetch(`${API_URL}/api/planes-trabajo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
      }

      if (!response.ok) {
        throw new Error(
          `Error al enviar los datos del plan de trabajo (status ${response.status})`
        );
      }

      alert(
        `Plan de trabajo ${
          planData?.planId ? "actualizado" : "enviado"
        } con éxito`
      );
      navigate("/inicio");
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al enviar el plan de trabajo. Intente nuevamente.");
    }
  };

  return (
    <div className="form-container pt-4 pb-4">
      <h2 className="title-form">
        Formulario de Plan de Trabajo - {tipoTrabajo}
      </h2>

      <div className="tabs-container">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`tab ${idx === currentStep ? "active-tab" : ""}`}
            onClick={() => setCurrentStep(idx)}
          >
            {step}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="plan-form mt-3">
        {/* PASO 0: INFORMACIÓN GENERAL */}
        {currentStep === 0 && (
          <div className="form-step">
            <h3 className="step-title">{steps[0]}</h3>

            <div className="form-group">
              <label className="label">Enlace Manual de Drive (opcional)</label>
              <input
                type="text"
                name="linkDrive"
                className="input-field"
                placeholder="Ej. https://drive.google.com/folder/..."
                value={planTrabajo.linkDrive}
                onChange={handleChange}
              />
              <small className="help-text">
                Si no especificas nada y subes un archivo en la pestaña
                "Cronograma", usaremos la ruta que genere ese archivo.
              </small>
            </div>
          </div>
        )}

        {/* PASO 1: CRONOGRAMA */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3 className="step-title">{steps[1]}</h3>
            {/* Mostrar la imagen del cronograma si existe */}
            {planData?.ruta_cronograma && (
              <div className="text-center mb-3">
                <h5>Imagen del Cronograma Actual</h5>
                <img
                  src={`${API_URL}/uploads/${planData.ruta_cronograma}`}
                  alt="Cronograma Actual"
                  className="img-fluid rounded border shadow-sm"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            <p className="help-text">
              Sube un archivo (imagen) con tu cronograma general.
            </p>
            <FileUpload
              fileName="cronograma"
              onSuccess={(ruta) => {
                setPlanTrabajo((prev) => ({ ...prev, rutaCronograma: ruta }));
              }}
            />

            <h4 className="sub-title">Detalle Estructurado del Cronograma</h4>
            <p className="help-text">
              Aquí puedes detallar cada actividad con sus fechas de inicio y
              fin.
            </p>

            {planTrabajo.cronograma.map((item, i) => (
              <div key={i} className="cronograma-item">
                <div className="form-group">
                  <label className="label">Nombre de la Actividad</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. 'Investigación de requisitos'"
                    value={item.actividad}
                    onChange={(e) =>
                      handleCronogramaChange(i, "actividad", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="label">Fecha Inicio</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formatDate(item.fechaInicio)}
                    onChange={(e) =>
                      handleCronogramaChange(i, "fechaInicio", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="label">Fecha Fin</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formatDate(item.fechaFin)}
                    onChange={(e) =>
                      handleCronogramaChange(i, "fechaFin", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn-add"
              onClick={addCronogramaItem}
            >
              + Agregar línea cronograma
            </button>
          </div>
        )}

        {/* PASO 2: ACTIVIDADES Y FECHAS REPORTES */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3 className="step-title">{steps[2]}</h3>

            <h4 className="sub-title">Actividades Principales</h4>
            <p className="help-text">
              Describe macro-actividades o tareas claves (no tan detalladas como
              el cronograma).
            </p>
            {planTrabajo.actividades.map((act, idx) => (
              <div key={idx} className="activity-item">
                <input
                  type="text"
                  className="input-field"
                  placeholder={`Actividad #${
                    idx + 1
                  } (Ej. 'Desarrollo de módulo X')`}
                  value={act}
                  onChange={(e) => handleActividadChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => removeActividad(idx)}
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={addActividad}>
              + Agregar Actividad
            </button>

            <h4 className="sub-title">Fechas de Reportes Mensuales</h4>
            <p className="help-text">
              Asigna las fechas en que entregarás informes mensuales o de
              avance.
            </p>
            {planTrabajo.fechasReportes.map((rep, idx) => (
              <div key={idx} className="report-item">
                <input
                  type="date"
                  className="input-field"
                  value={formatDate(rep)} // 🛠 Aplica la función para corregir el formato
                  onChange={(e) =>
                    handleFechaReporteChange(idx, e.target.value)
                  }
                />
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => removeFechaReporte(idx)}
                >
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={addFechaReporte}>
              + Agregar Fecha de Reporte
            </button>
          </div>
        )}

        {/* PASO 3: VALIDACIÓN */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3 className="step-title">{steps[3]}</h3>

            <div className="form-group">
              <label className="label">
                Fecha de Entrega del Informe Final
              </label>
              <input
                type="date"
                name="fechaEntregaInformeFinal"
                className="input-field"
                value={planTrabajo.fechaEntregaInformeFinal}
                onChange={handleChange}
                required
              />
              <small className="help-text">
                Indica la fecha estimada para tu informe final.
              </small>
            </div>

            {tipoTrabajo === "Pasantía" && (
              <div className="form-group">
                <label className="label">Fecha de Visita del Asesor</label>
                <input
                  type="date"
                  name="fechaVisita"
                  className="input-field"
                  value={planTrabajo.fechaVisita || ""}
                  onChange={handleChange}
                />
                <small className="help-text">
                  El asesor agendará esta visita (si aplica).
                </small>
              </div>
            )}
          </div>
        )}

        {/* Botones de Navegación */}
        <div className="navigation-buttons">
          {currentStep > 0 && (
            <button type="button" className="btn-nav" onClick={prevStep}>
              Anterior
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button type="button" className="btn-nav" onClick={nextStep}>
              Siguiente
            </button>
          )}
          {currentStep === steps.length - 1 && (
            <button type="submit" className="btn-submit">
              Enviar Plan
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormulariosPlanesTrabajo;
