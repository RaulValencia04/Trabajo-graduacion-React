import React, { useState, useContext } from "react";
import FileUpload from "../../docs/FileUpload";
import "./FormulariosPropuestas.css";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useApi } from "../../Auth/Helpers/api";

function FormularioPasantia() {
  const { state } = useContext(AuthContext);
  const { token, userId } = state;
  const { authFetch } = useApi();
  const API_URL = process.env.REACT_APP_API_URL;

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function countWordsArray(arr) {
    return arr.reduce((acc, item) => acc + countWords(item), 0);
  }

  const [formData, setFormData] = useState({
    Fecha_inicio: "",
    Fecha_fin: "",
    antecedentesInstitucion: "",
    descripcionEmpresa: "",
    nombreEmpresa: "",
    contactoEmpresa: "",
    direccionEmpresa: "",
    supervisor: { nombre: "", cargo: "", contacto: "" },
    asesores: ["", "", ""],
    cartaAceptacionFecha: "",
  });

  const [actividades, setActividades] = useState([""]);
  const [archivosSubidos, setArchivosSubidos] = useState({
    carta_aceptacion: false,
    inscripcion_trabajo_graduacion: false,
    certificacion_global_notas: false,
    constancia_servicio_social: false,
  });

  const [rutaInscripcion, setRutaInscripcion] = useState(null);
  const [rutaCertificacion, setRutaCertificacion] = useState(null);
  const [rutaServicioSocial, setRutaServicioSocial] = useState(null);
  const [rutaCartaAceptacion, setRutaCartaAceptacion] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Portada",
    "Antecedentes de la Institución",
    "Descripción de la Empresa",
    "Actividades a Desarrollar",
    "Datos del Supervisor",
    "Asesores Propuestos",
    "Datos Adicionales",
  ];

  // Límites de palabras
  const MIN_ANTECEDENTES = 200;
  const MAX_ANTECEDENTES = 350;
  const MIN_DESCR_EMP = 1200;
  const MAX_DESCR_EMP = 1500;
  const MIN_ACTIVIDADES = 550;
  const MAX_ACTIVIDADES = 650;
  // const MIN_ASESORES = 100;
  // const MAX_ASESORES = 200;

  function nextStep() {
    setCurrentStep((p) => Math.min(p + 1, steps.length - 1));
  }

  function prevStep() {
    setCurrentStep((p) => Math.max(p - 1, 0));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name.startsWith("supervisor.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        supervisor: { ...prev.supervisor, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleArrayChange(setter, index, value) {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }

  function addField(setter, def) {
    setter((prev) => [...prev, def]);
  }

  function removeField(setter, index) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !rutaInscripcion ||
      !rutaCertificacion ||
      !rutaServicioSocial ||
      !rutaCartaAceptacion
    ) {
      alert("Por favor, sube todos los documentos requeridos.");
      return;
    }

    const wAntecedentes = countWords(formData.antecedentesInstitucion);
    if (wAntecedentes < MIN_ANTECEDENTES || wAntecedentes > MAX_ANTECEDENTES) {
      alert("Los Antecedentes no cumplen con la métrica (200 a 350 palabras).");
      return;
    }

    const wDescripcion = countWords(formData.descripcionEmpresa);
    if (wDescripcion < MIN_DESCR_EMP || wDescripcion > MAX_DESCR_EMP) {
      alert("La Descripción de la Empresa no cumple con la métrica (1200 a 1500 palabras).");
      return;
    }

    const wActividades = countWordsArray(actividades);
    if (wActividades < MIN_ACTIVIDADES || wActividades > MAX_ACTIVIDADES) {
      alert("Las Actividades no cumplen con la métrica (550 a 650 palabras).");
      return;
    }

    // const wAsesores = countWordsArray(formData.asesores);
    // if (wAsesores < MIN_ASESORES || wAsesores > MAX_ASESORES) {
    //   alert("Los Asesores Propuestos no cumplen con la métrica (100 a 200 palabras).");
    //   return;
    // }

    const jsonData = {
      trabajoGraduacion: {
        titulo: formData.nombreEmpresa,
        descripcion: formData.descripcionEmpresa,
        tipoTrabajo: "Pasantía",
        fechaInicio: formData.Fecha_inicio,
        fechaFin: formData.Fecha_fin,
        estado: "En espera",
      },
      pasantia: {
        antecedentesInstitucion: formData.antecedentesInstitucion,
        descripcionEmpresa: formData.descripcionEmpresa,
        actividades,
        supervisor: {
          nombre: formData.supervisor.nombre,
          contacto: formData.supervisor.contacto,
          cargo: formData.supervisor.cargo,
        },
        asesoresPropuestos: formData.asesores
          .filter((a) => a.trim() !== "")
          .map((n) => ({ nombre: n })),
        cartaAceptacion: [
          {
            documento: rutaCartaAceptacion,
            fecha: formData.cartaAceptacionFecha,
          },
        ],
        inscripcionTrabajoGraduacion: rutaInscripcion,
        certificacion_global_notas: rutaCertificacion,
        constancia_servicio_social: rutaServicioSocial,
      },
      asignacionEmpresa: {
        nombreEmpresa: formData.nombreEmpresa,
        contactoEmpresa: formData.contactoEmpresa,
        direccionEmpresa: formData.direccionEmpresa,
        evaluacion: "En Revisión",
      },
    };

    try {
      console.log(jsonData);
      const response = await authFetch(`${API_URL}/api/pasantias/crear-completa`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(jsonData),
      });
      if (!response.ok) {
        throw new Error("Error al enviar los datos.");
      }
      const result = await response.json();
      const trabajoId = result.trabajoGraduacion.id;
      const segundoPost = await authFetch(
        `${API_URL}/api/miembros-trabajo/add?trabajoId=${trabajoId}&usuarioId=${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }
      );
      if (!segundoPost.ok) {
        throw new Error("Error al asociar el usuario.");
      }
      alert("Formulario enviado correctamente y usuario asociado.");
    } catch (err) {
      alert("Error al procesar la solicitud. Por favor, intenta de nuevo.");
    }
  }

  return (
    <div className="form-container">
      <h2>Formulario de Pasantías</h2>
      <div className="tabs">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`tab ${i === currentStep ? "active" : ""}`}
            onClick={() => setCurrentStep(i)}
          >
            {s}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 0 && (
          <div className="form-step">
            <label>Fecha de Inicio</label>
            <p className="help-text">
              Indica la fecha en la que iniciarás tu pasantía.
            </p>
            <input
              type="date"
              name="Fecha_inicio"
              value={formData.Fecha_inicio}
              onChange={handleChange}
              required
            />
            <label>Fecha de Fin</label>
            <p className="help-text">
              Indica la fecha estimada de finalización de tu pasantía.
            </p>
            <input
              type="date"
              name="Fecha_fin"
              value={formData.Fecha_fin}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="form-step">
            <label>Antecedentes de la Institución (200 a 350 palabras)</label>
            <p className="help-text">
              Describe cómo la institución ha impactado ciertos temas o áreas.
            </p>
            <textarea
              name="antecedentesInstitucion"
              value={formData.antecedentesInstitucion}
              onChange={handleChange}
              rows="5"
              required
            />
            <small>
              Palabras: {countWords(formData.antecedentesInstitucion)} / {MIN_ANTECEDENTES} - {MAX_ANTECEDENTES}
            </small>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <label>Descripción de la Empresa (1200 a 1500 palabras)</label>
            <p className="help-text">
              Explica los departamentos, áreas, procesos y mercado de la empresa donde realizarás la pasantía.
            </p>
            <textarea
              name="descripcionEmpresa"
              value={formData.descripcionEmpresa}
              onChange={handleChange}
              rows="6"
              required
            />
            <small>
              Palabras: {countWords(formData.descripcionEmpresa)} / {MIN_DESCR_EMP} - {MAX_DESCR_EMP}
            </small>

            <label>Nombre de la Empresa</label>
            <p className="help-text">
              Indica el nombre oficial de la empresa o institución.
            </p>
            <input
              type="text"
              name="nombreEmpresa"
              value={formData.nombreEmpresa}
              onChange={handleChange}
              required
            />

            <label>Contacto de la Empresa</label>
            <p className="help-text">
              Persona o vía de contacto principal.
            </p>
            <input
              type="text"
              name="contactoEmpresa"
              value={formData.contactoEmpresa}
              onChange={handleChange}
              required
            />

            <label>Dirección de la Empresa</label>
            <p className="help-text">
              Ubicación física de la empresa.
            </p>
            <textarea
              name="direccionEmpresa"
              value={formData.direccionEmpresa}
              onChange={handleChange}
              rows="2"
              required
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <label>Actividades a Desarrollar (550 a 650 palabras)</label>
            <p className="help-text">
              Lista las macro-actividades que realizarás y sus descripciones breves.
            </p>
            <small>
              Palabras totales: {countWordsArray(actividades)} / {MIN_ACTIVIDADES} - {MAX_ACTIVIDADES}
            </small>
            {actividades.map((act, idx) => (
              <div key={idx} style={{ marginBottom: "5px" }}>
                <input
                  type="text"
                  value={act}
                  onChange={(e) => handleArrayChange(setActividades, idx, e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeField(setActividades, idx)}
                  disabled={actividades.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addField(setActividades, "")}>
              + Agregar Actividad
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-step">
            <label>Datos del Supervisor Empresarial</label>
            <p className="help-text">
              Ingresa la información de contacto y cargo del supervisor designado.
            </p>
            <label>Nombre del Supervisor</label>
            <input
              type="text"
              name="supervisor.nombre"
              value={formData.supervisor.nombre}
              onChange={handleChange}
              required
            />
            <label>Cargo del Supervisor</label>
            <input
              type="text"
              name="supervisor.cargo"
              value={formData.supervisor.cargo}
              onChange={handleChange}
              required
            />
            <label>Contacto del Supervisor</label>
            <input
              type="text"
              name="supervisor.contacto"
              value={formData.supervisor.contacto}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {currentStep === 5 && (
          <div className="form-step">
            <label>Asesores Propuestos (100 a 200 palabras)</label>
            <p className="help-text">
              Lista el/los asesores que propones para tu pasantía (máx 3). 
            </p>
           
            {formData.asesores.map((asesor, i) => (
              <div key={i} style={{ marginBottom: "5px" }}>
                <input
                  type="text"
                  value={asesor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      asesores: prev.asesores.map((a, ix) =>
                        ix === i ? e.target.value : a
                      ),
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      asesores: prev.asesores.filter((_, ix) => ix !== i),
                    }))
                  }
                  disabled={formData.asesores.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                if (formData.asesores.length < 3) {
                  setFormData((prev) => ({
                    ...prev,
                    asesores: [...prev.asesores, ""],
                  }));
                } else {
                  alert("Máximo 3 asesores.");
                }
              }}
              disabled={formData.asesores.length >= 3}
            >
              + Agregar Asesor
            </button>
          </div>
        )}

        {currentStep === 6 && (
          <div className="form-step">
            <h4>Documentos de Soporte</h4>

            <label>Inscripción de Trabajo de Graduación</label>
            <p className="help-text">
              Sube la impresión o archivo que demuestre la inscripción.
            </p>
            <FileUpload
              fileName="inscripcion_trabajo_graduacion"
              initialUploaded={archivosSubidos["inscripcion_trabajo_graduacion"]}
              onSuccess={(ruta) => {
                setRutaInscripcion(ruta);
                setArchivosSubidos((p) => ({
                  ...p,
                  inscripcion_trabajo_graduacion: true,
                }));
              }}
            />
            {rutaInscripcion && <p>{rutaInscripcion}</p>}

            <label>Certificación Global de Notas</label>
            <p className="help-text">
              Sube la copia de tu certificación global de notas.
            </p>
            <FileUpload
              fileName="certificacion_global_notas"
              initialUploaded={archivosSubidos["certificacion_global_notas"]}
              onSuccess={(ruta) => {
                setRutaCertificacion(ruta);
                setArchivosSubidos((p) => ({
                  ...p,
                  certificacion_global_notas: true,
                }));
              }}
            />
            {rutaCertificacion && <p>{rutaCertificacion}</p>}

            <label>Constancia de Servicio Social</label>
            <p className="help-text">
              Sube la constancia emitida por decanato.
            </p>
            <FileUpload
              fileName="constancia_servicio_social"
              initialUploaded={archivosSubidos["constancia_servicio_social"]}
              onSuccess={(ruta) => {
                setRutaServicioSocial(ruta);
                setArchivosSubidos((p) => ({
                  ...p,
                  constancia_servicio_social: true,
                }));
              }}
            />
            {rutaServicioSocial && <p>{rutaServicioSocial}</p>}

            <label>Carta de Aceptación</label>
            <p className="help-text">
              Sube la carta firmada por el representante legal o RRHH.
            </p>
            <FileUpload
              fileName="carta_aceptacion"
              initialUploaded={archivosSubidos["carta_aceptacion"]}
              onSuccess={(ruta) => {
                setRutaCartaAceptacion(ruta);
                setArchivosSubidos((p) => ({
                  ...p,
                  carta_aceptacion: true,
                }));
              }}
            />
            {rutaCartaAceptacion && <p>{rutaCartaAceptacion}</p>}

            <label>Fecha de Aceptación</label>
            <p className="help-text">
              Indica la fecha en que se emitió la carta de aceptación.
            </p>
            <input
              type="date"
              name="cartaAceptacionFecha"
              value={formData.cartaAceptacionFecha}
              onChange={handleChange}
              required
            />
          </div>
        )}

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
          {currentStep === steps.length - 1 && (
            <button type="submit">Enviar</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default FormularioPasantia;
