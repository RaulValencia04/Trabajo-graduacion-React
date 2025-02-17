import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../../docs/FileUpload"; // Tu FileUpload sin cambios
import "./FormulariosPlanesTrabajo.css";
import { useApi } from "../../Auth/Helpers/api";
import { AuthContext } from "../../Auth/Context/AuthContext";

/**
 * @param {Object} props
 * @param {Number} props.trabajoId - ID del trabajo de graduación
 * @param {String} props.tipoTrabajo - "Pasantía" | "Proyecto" | "Investigación"
 * @param {Object} [props.planData] - Datos ya existentes del plan si se edita o fue rechazado.
 *        {
 *          planId: number,
 *          cronograma: string (JSON),
 *          actividades: string (JSON),
 *          fechasReportes: string (JSON),
 *          fechaVisita: Date|string,
 *          fechaEntregaInformeFinal: Date|string,
 *          linkDrive: string,
 *          ruta_cronograma: string (almacenado como JSONB en la BD),
 *          ...
 *        }
 */
const FormulariosPlanesTrabajo = ({ trabajoId, tipoTrabajo, planData }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const { state } = useContext(AuthContext);
  const { userId } = state;


  const safeJSONParse = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };


  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Información General", "Cronograma", "Actividades", "Validación"];
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const [cronogramaFile, setCronogramaFile] = useState(null);

  const [cronogramaUploaded, setCronogramaUploaded] = useState(false);

  const [rutaCronograma, setRutaCronograma] = useState(
    planData?.ruta_cronograma || ""
  );


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
    rutaCronograma: planData?.ruta_cronograma || "",
  });

  useEffect(() => {
    if (planData) {
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


      setCronogramaUploaded(false);

      if (planData.ruta_cronograma) {
        setRutaCronograma(planData.ruta_cronograma);
      }
    }
  }, [planData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanTrabajo((prev) => ({ ...prev, [name]: value }));
  };

  const addCronogramaItem = () => {
    setPlanTrabajo((prev) => ({
      ...prev,
      cronograma: [
        ...prev.cronograma,
        { actividad: "", fechaInicio: "", fechaFin: "" },
      ],
    }));
  };
  const handleCronogramaChange = (idx, field, val) => {
    setPlanTrabajo((prev) => {
      const arr = [...prev.cronograma];
      arr[idx][field] = val;
      return { ...prev, cronograma: arr };
    });
  };

  
  const addActividad = () => {
    setPlanTrabajo((prev) => ({
      ...prev,
      actividades: [...prev.actividades, ""],
    }));
  };
  const removeActividad = (i) => {
    setPlanTrabajo((prev) => ({
      ...prev,
      actividades: prev.actividades.filter((_, idx) => idx !== i),
    }));
  };
  const handleActividadChange = (i, val) => {
    setPlanTrabajo((prev) => {
      const arr = [...prev.actividades];
      arr[i] = val;
      return { ...prev, actividades: arr };
    });
  };

  const addFechaReporte = () => {
    setPlanTrabajo((prev) => ({
      ...prev,
      fechasReportes: [...prev.fechasReportes, ""],
    }));
  };
  const removeFechaReporte = (i) => {
    setPlanTrabajo((prev) => ({
      ...prev,
      fechasReportes: prev.fechasReportes.filter((_, idx) => idx !== i),
    }));
  };
  const handleFechaReporteChange = (i, val) => {
    setPlanTrabajo((prev) => {
      const arr = [...prev.fechasReportes];
      arr[i] = val;
      return { ...prev, fechasReportes: arr };
    });
  };

  // Formatear fecha (si es un array [yyyy,MM,dd], la convertimos)
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    if (Array.isArray(dateValue)) {
      const [year, month, day] = dateValue;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
    return dateValue; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  
    const finalRutaPlain = cronogramaUploaded && rutaCronograma
      ? rutaCronograma
      : planData?.ruta_cronograma || "";

 
    const finalRutaJson = finalRutaPlain
      ? JSON.stringify({ file: finalRutaPlain })
      : "{}";

    
    const bodyData = {
      trabajoGraduacion: { id: planTrabajo.trabajoGraduacionId },
      tipoTrabajo: planTrabajo.tipoTrabajo,
      
      cronograma: planTrabajo.cronograma,
      actividades: planTrabajo.actividades,
      fechasReportes: planTrabajo.fechasReportes,

      fechaVisita: planTrabajo.fechaVisita || null,
      fechaEntregaInformeFinal: planTrabajo.fechaEntregaInformeFinal,
      validado: planTrabajo.validado,
      linkDrive: (planTrabajo.linkDrive || "").trim(),

      
      rutaCronograma: finalRutaJson,
      creadoPor: { id: userId },
    };

    try {
      let response;
      if (planData?.planId) {
        // Actualizar

        console.log(planData);
        response = await authFetch(
          `${API_URL}/api/planes-trabajo/${planData.planId}/actualizar`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
          }
        );
      } else {
        // Crear
        console.log(bodyData);
        response = await authFetch(`${API_URL}/api/planes-trabajo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
      }

      if (!response.ok) {
        throw new Error(
          `Error al enviar plan (status ${response.status})`
        );
      }

      alert(
        `Plan de trabajo ${
          planData?.planId ? "actualizado" : "enviado"
        } con éxito`
      );
      navigate("/inicio");
    } catch (err) {
      console.error("Error al enviar plan:", err);
      alert("Ocurrió un error al enviar. Intenta de nuevo.");
    }
  };


  return (
    <div className="form-container pt-4 pb-4">
      <h2 className="title-form">
        Formulario de Plan de Trabajo - {tipoTrabajo}
      </h2>

      <div className="tabs-container">
        {steps.map((st, i) => (
          <div
            key={i}
            className={`tab ${i === currentStep ? "active-tab" : ""}`}
            onClick={() => setCurrentStep(i)}
          >
            {st}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="plan-form mt-3">
        {/* Paso 0: Info General */}
        {currentStep === 0 && (
          <div className="form-step">
            <h3>{steps[0]}</h3>

            <div className="form-group">
              <label>Enlace Manual de Drive (opcional)</label>
              <input
                type="text"
                name="linkDrive"
                value={planTrabajo.linkDrive}
                onChange={handleChange}
              />
              <small className="help-text">
                Si no especificas nada y subes un archivo en “Cronograma”,
                usaremos esa ruta.
              </small>
            </div>

          </div>
        )}

        {/* Paso 1: Cronograma */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3>{steps[1]}</h3>

{/* Mostrar la imagen previa si existe y no hemos subido otra */}
{planData?.ruta_cronograma && !cronogramaFile && !cronogramaUploaded && (
  <div className="text-center mb-3">
    <img
      src={`${API_URL}/uploads/${JSON.parse(planData.ruta_cronograma).file}`}
      alt="Cronograma Actual"
      style={{ maxWidth: "100%", maxHeight: "300px" }}
    />
  </div>
)}


            <p>Sube una nueva imagen para reemplazar (o deja así si no deseas cambiar).</p>
            <FileUpload
              fileName="cronograma"
              selectedFile={cronogramaFile}
              isUploaded={cronogramaUploaded}
              onFileSelect={(file) => {
                setCronogramaFile(file);
              }}
              onSetIsUploaded={(uploaded, ruta) => {
                setCronogramaUploaded(uploaded);
                // 'ruta' es una cadena tipo "miArchivo.png"
                setRutaCronograma(ruta);
                setPlanTrabajo((prev) => ({ ...prev, rutaCronograma: ruta }));
              }}
            />

            {cronogramaUploaded && (
              <button
                type="button"
                onClick={() => {
                  // Permitir "otra" subida
                  setCronogramaUploaded(false);
                  setCronogramaFile(null);
                }}
              >
                Reemplazar otra vez
              </button>
            )}

            <h4>Detalle Estructurado del Cronograma</h4>
            {planTrabajo.cronograma.map((item, idx) => (
              <div key={idx}>
                <input
                  type="text"
                  placeholder="Actividad"
                  value={item.actividad}
                  onChange={(e) =>
                    handleCronogramaChange(idx, "actividad", e.target.value)
                  }
                />
                <input
                  type="date"
                  value={formatDate(item.fechaInicio)}
                  onChange={(e) =>
                    handleCronogramaChange(idx, "fechaInicio", e.target.value)
                  }
                />
                <input
                  type="date"
                  value={formatDate(item.fechaFin)}
                  onChange={(e) =>
                    handleCronogramaChange(idx, "fechaFin", e.target.value)
                  }
                />
              </div>
            ))}
            <button type="button" onClick={addCronogramaItem}>
              + Agregar Fila
            </button>
          </div>
        )}

        {/* Paso 2: Actividades */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3>{steps[2]}</h3>

            <h4>Actividades Principales</h4>
            {planTrabajo.actividades.map((act, idx) => (
              <div key={idx}>
                <input
                  type="text"
                  placeholder={`Actividad #${idx + 1}`}
                  value={act}
                  onChange={(e) => handleActividadChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeActividad(idx)}
                  disabled={planTrabajo.actividades.length <= 1}
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button type="button" onClick={addActividad}>
              + Agregar Actividad
            </button>

            <h4>Fechas de Reportes</h4>
            {planTrabajo.fechasReportes.map((fr, idx) => (
              <div key={idx}>
                <input
                  type="date"
                  value={formatDate(fr)}
                  onChange={(e) => handleFechaReporteChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeFechaReporte(idx)}
                  disabled={planTrabajo.fechasReportes.length <= 1}
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button type="button" onClick={addFechaReporte}>
              + Agregar Fecha
            </button>
          </div>
        )}

        {/* Paso 3: Validación Final */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3>{steps[3]}</h3>

            <label>Fecha de Entrega del Informe Final</label>
            <input
              type="date"
              name="fechaEntregaInformeFinal"
              value={planTrabajo.fechaEntregaInformeFinal}
              onChange={handleChange}
              required
            />

            {tipoTrabajo === "Pasantía" && (
              <>
                <label>Fecha de Visita del Asesor</label>
                <input
                  type="date"
                  name="fechaVisita"
                  value={planTrabajo.fechaVisita || ""}
                  onChange={handleChange}
                />
              </>
            )}
          </div>
        )}

        {/* Navegación */}
        <div className="navigation-buttons">
          {currentStep > 0 && (
            <button type="button" onClick={prevStep}>
              Anterior
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button type="button" onClick={nextStep}>
              Siguiente
            </button>
          )}
          {currentStep === steps.length - 1 && <button type="submit">Enviar</button>}
        </div>
      </form>
    </div>
  );
};

export default FormulariosPlanesTrabajo;
