import React, { useState, useContext } from "react";
import FileUpload from "../../docs/FileUpload";
import "./FormulariosPropuestas.css";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useApi } from "../../Auth/Helpers/api";
import { useNavigate } from "react-router-dom";


function FormularioPasantia() {
  const { state } = useContext(AuthContext);
  const { token, userId } = state;               // Credenciales
  const { authFetch } = useApi();                // Para fetch con auth
  const API_URL = process.env.REACT_APP_API_URL; // URL base del backend
  const navigate = useNavigate();
  

  // -----------------------------
  // Helpers de conteo de palabras
  // -----------------------------
  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }
  function countWordsArray(arr) {
    return arr.reduce((acc, item) => acc + countWords(item), 0);
  }

  // -----------------------------
  // Estado principal del formulario
  // -----------------------------
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

  // -----------------------------
  // Estados para CADA archivo
  // -----------------------------
  // Inscripción
  const [inscripcionFile, setInscripcionFile] = useState(null);
  const [inscripcionUploaded, setInscripcionUploaded] = useState(false);
  const [rutaInscripcion, setRutaInscripcion] = useState(null);

  // Certificación
  const [certificacionFile, setCertificacionFile] = useState(null);
  const [certificacionUploaded, setCertificacionUploaded] = useState(false);
  const [rutaCertificacion, setRutaCertificacion] = useState(null);

  // Servicio Social
  const [servicioSocialFile, setServicioSocialFile] = useState(null);
  const [servicioSocialUploaded, setServicioSocialUploaded] = useState(false);
  const [rutaServicioSocial, setRutaServicioSocial] = useState(null);

  // Carta de Aceptación
  const [cartaFile, setCartaFile] = useState(null);
  const [cartaUploaded, setCartaUploaded] = useState(false);
  const [rutaCartaAceptacion, setRutaCartaAceptacion] = useState(null);

  // -----------------------------
  // Control de pasos (Wizard)
  // -----------------------------
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

  function nextStep() {
    setCurrentStep((p) => Math.min(p + 1, steps.length - 1));
  }
  function prevStep() {
    setCurrentStep((p) => Math.max(p - 1, 0));
  }

  // -----------------------------
  // Manejo de inputs
  // -----------------------------
  function handleChange(e) {
    const { name, value } = e.target;
    if (name.startsWith("supervisor.")) {
      // Para campos del supervisor, actualizamos supervisor de forma anidada
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

  // -----------------------------
  // Límites de palabras
  // -----------------------------
  const MIN_ANTECEDENTES = 200;
  const MAX_ANTECEDENTES = 350;
  const MIN_DESCR_EMP = 1200;
  const MAX_DESCR_EMP = 1500;
  const MIN_ACTIVIDADES = 550;
  const MAX_ACTIVIDADES = 650;
  // (Ej. const MIN_ASESORES = 100, etc.)

  // -----------------------------
  // Envío del formulario final
  // -----------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    // Validar que haya subido todos los docs requeridos
    if (
      !rutaInscripcion ||
      !rutaCertificacion ||
      !rutaServicioSocial ||
      !rutaCartaAceptacion
    ) {
      alert("Por favor, sube todos los documentos requeridos.");
      return;
    }

    // Validaciones de palabras
    const wAntecedentes = countWords(formData.antecedentesInstitucion);
    if (wAntecedentes < MIN_ANTECEDENTES || wAntecedentes > MAX_ANTECEDENTES) {
      alert("Los Antecedentes no cumplen con la métrica (200 a 350 palabras).");
      return;
    }

    const wDescripcion = countWords(formData.descripcionEmpresa);
    if (wDescripcion < MIN_DESCR_EMP || wDescripcion > MAX_DESCR_EMP) {
      alert(
        "La Descripción de la Empresa no cumple con la métrica (1200 a 1500 palabras)."
      );
      return;
    }

    const wActividades = countWordsArray(actividades);
    if (wActividades < MIN_ACTIVIDADES || wActividades > MAX_ACTIVIDADES) {
      alert("Las Actividades no cumplen con la métrica (550 a 650 palabras).");
      return;
    }

    // Construir objeto final
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

    // 1. Enviar el JSON al backend
    try {
      const response = await authFetch(`${API_URL}/api/pasantias/crear-completa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      });
      if (!response.ok) {
        throw new Error("Error al enviar los datos.");
      }
      const result = await response.json();
      const trabajoId = result.trabajoGraduacion.id;

      // 2. Asociar usuario con el trabajo
      const segundoPost = await authFetch(
        `${API_URL}/api/miembros-trabajo/add?trabajoId=${trabajoId}&usuarioId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!segundoPost.ok) {
        throw new Error("Error al asociar el usuario.");
      }
      alert("Formulario enviado correctamente y usuario asociado.");
      navigate("/inicio");
    } catch (err) {
      console.error("Error al procesar la solicitud:", err);
      alert("Error al procesar la solicitud. Por favor, intenta de nuevo.");
    }
  }

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="form-container">
      <h2>Formulario de Pasantías</h2>

      {/* Tabs (pasos) */}
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
        {/* Paso 0: Portada */}
        {currentStep === 0 && (
          <div className="form-step">
            <label>Fecha de Inicio</label>
            <p className="help-text">Indica la fecha en la que iniciarás tu pasantía.</p>
            <input
              type="date"
              name="Fecha_inicio"
              value={formData.Fecha_inicio}
              onChange={handleChange}
              required
            />

            <label>Fecha de Fin</label>
            <p className="help-text">Fecha estimada de finalización de tu pasantía.</p>
            <input
              type="date"
              name="Fecha_fin"
              value={formData.Fecha_fin}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Paso 1: Antecedentes de la Institución */}
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
              Palabras: {countWords(formData.antecedentesInstitucion)} / {MIN_ANTECEDENTES} -{" "}
              {MAX_ANTECEDENTES}
            </small>
          </div>
        )}

        {/* Paso 2: Descripción de la Empresa */}
        {currentStep === 2 && (
          <div className="form-step">
            <label>Descripción de la Empresa (1200 a 1500 palabras)</label>
            <p className="help-text">
              Explica los departamentos, áreas, procesos y mercado de la empresa
              donde realizarás la pasantía.
            </p>
            <textarea
              name="descripcionEmpresa"
              value={formData.descripcionEmpresa}
              onChange={handleChange}
              rows="6"
              required
            />
            <small>
              Palabras: {countWords(formData.descripcionEmpresa)} / {MIN_DESCR_EMP} -{" "}
              {MAX_DESCR_EMP}
            </small>

            <label>Nombre de la Empresa</label>
            <p className="help-text">Nombre oficial de la empresa.</p>
            <input
              type="text"
              name="nombreEmpresa"
              value={formData.nombreEmpresa}
              onChange={handleChange}
              required
            />

            <label>Contacto de la Empresa</label>
            <p className="help-text">Persona o vía de contacto principal.</p>
            <input
              type="text"
              name="contactoEmpresa"
              value={formData.contactoEmpresa}
              onChange={handleChange}
              required
            />

            <label>Dirección de la Empresa</label>
            <p className="help-text">Ubicación física.</p>
            <textarea
              name="direccionEmpresa"
              value={formData.direccionEmpresa}
              onChange={handleChange}
              rows="2"
              required
            />
          </div>
        )}

        {/* Paso 3: Actividades a Desarrollar */}
        {currentStep === 3 && (
          <div className="form-step">
            <label>Actividades a Desarrollar (550 a 650 palabras)</label>
            <p className="help-text">
              Lista las macro-actividades que realizarás y descripciones breves.
            </p>
            <small>
              Palabras totales: {countWordsArray(actividades)} / {MIN_ACTIVIDADES} -{" "}
              {MAX_ACTIVIDADES}
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

        {/* Paso 4: Datos del Supervisor */}
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

        {/* Paso 5: Asesores Propuestos */}
        {currentStep === 5 && (
          <div className="form-step">
            <label>Asesores Propuestos (100 a 200 palabras)</label>
            <p className="help-text">Lista el/los asesores (máx 3).</p>

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

        {/* Paso 6: Documentos de Soporte */}
        {currentStep === 6 && (
          <div className="form-step">
            <h4>Documentos de Soporte</h4>

            <label>Inscripción de Trabajo de Graduación</label>
            <p className="help-text">Sube el archivo de tu inscripción.</p>
            <FileUpload
              fileName="inscripcion_trabajo_graduacion"
              selectedFile={inscripcionFile}
              isUploaded={inscripcionUploaded}
              onFileSelect={(file) => setInscripcionFile(file)}
              onSetIsUploaded={(uploaded, ruta) => {
                setInscripcionUploaded(uploaded);
                setRutaInscripcion(ruta);
              }}
            />
            {rutaInscripcion && <p>Ruta: {rutaInscripcion}</p>}

            <label>Certificación Global de Notas</label>
            <p className="help-text">Sube la certificación global de notas.</p>
            <FileUpload
              fileName="certificacion_global_notas"
              selectedFile={certificacionFile}
              isUploaded={certificacionUploaded}
              onFileSelect={(file) => setCertificacionFile(file)}
              onSetIsUploaded={(uploaded, ruta) => {
                setCertificacionUploaded(uploaded);
                setRutaCertificacion(ruta);
              }}
            />
            {rutaCertificacion && <p>Ruta: {rutaCertificacion}</p>}

            <label>Constancia de Servicio Social</label>
            <p className="help-text">Sube la constancia de tu servicio social.</p>
            <FileUpload
              fileName="constancia_servicio_social"
              selectedFile={servicioSocialFile}
              isUploaded={servicioSocialUploaded}
              onFileSelect={(file) => setServicioSocialFile(file)}
              onSetIsUploaded={(uploaded, ruta) => {
                setServicioSocialUploaded(uploaded);
                setRutaServicioSocial(ruta);
              }}
            />
            {rutaServicioSocial && <p>Ruta: {rutaServicioSocial}</p>}

            <label>Carta de Aceptación</label>
            <p className="help-text">Sube la carta firmada de la empresa.</p>
            <FileUpload
              fileName="carta_aceptacion"
              selectedFile={cartaFile}
              isUploaded={cartaUploaded}
              onFileSelect={(file) => setCartaFile(file)}
              onSetIsUploaded={(uploaded, ruta) => {
                setCartaUploaded(uploaded);
                setRutaCartaAceptacion(ruta);
              }}
            />
            {rutaCartaAceptacion && <p>Ruta: {rutaCartaAceptacion}</p>}

            <label>Fecha de Aceptación</label>
            <p className="help-text">Fecha en que se emitió la carta.</p>
            <input
              type="date"
              name="cartaAceptacionFecha"
              value={formData.cartaAceptacionFecha}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Botones de navegación */}
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
