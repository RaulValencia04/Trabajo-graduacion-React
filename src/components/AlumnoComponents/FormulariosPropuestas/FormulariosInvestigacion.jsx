import React, { useState, useContext } from "react";
import FileUpload from "../../docs/FileUpload";
import "./FormulariosPropuestas.css";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Auth/Helpers/api";

export default function FormulariosProyecto() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { token, userId } = state;
  const { authFetch } = useApi();
  const navigate = useNavigate();

  function countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  const MAX_DESC_TRABAJO = 900;
  const MAX_PROBLEMA = 900;
  const MAX_JUSTIFICACION = 900;
  const MAX_ALCANCE = 300;
  const MAX_DESCR_OBJETIVOS = 900;

  const [trabajoData, setTrabajoData] = useState({
    titulo: "",
    descripcion: "",
    tipoTrabajo: "Investigación",
    fechaInicio: "",
    fechaFin: "",
    estado: "En espera",
  });

  const [correosExtras, setCorreosExtras] = useState({
    uno: "",
    dos: "",
  });

  const [proyectoData, setProyectoData] = useState({
    problema: "",
    justificacion: "",
    alcance: "",
    objetivos: [""],
    descripcionObjetivos: "",
    metodologia: "",
    entregables: [""],
    cronograma: [{ actividad: "", fechaInicio: "", fechaFin: "" }],
    actores: [""],
    asesoresPropuestos: [{ nombre: "" }],
    cartaAceptacion: [{ documento: "", fecha: "" }],
    inscripcionTrabajoGraduacion: "",
    certificacionGlobalNotas: "",
    constanciaServicioSocial: "",
  });

  const [rutaInscripcion, setRutaInscripcion] = useState(null);
  const [rutaCertificacion, setRutaCertificacion] = useState(null);
  const [rutaServicioSocial, setRutaServicioSocial] = useState(null);
  const [rutaCartaAceptacion, setRutaCartaAceptacion] = useState(null);

  const [archivosSubidos, setArchivosSubidos] = useState({
    carta_aceptacion: false,
    inscripcion_trabajo_graduacion: false,
    certificacion_global_notas: false,
    constancia_servicio_social: false,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Trabajo de Graduación",
    "Datos del Proyecto",
    "Objetivos",
    "Alumnos Encargados",
    "Actores y Carta Aceptación",
    "Documentos",
  ];

  function nextStep() {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function prevStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  function handleTrabajoChange(e) {
    const { name, value } = e.target;
    setTrabajoData((prev) => ({ ...prev, [name]: value }));
  }

  function handleProyectoChange(e) {
    const { name, value } = e.target;
    setProyectoData((prev) => ({ ...prev, [name]: value }));
  }

  function handleCartaAceptacionChange(field, value, index = 0) {
    setProyectoData((prev) => {
      const updated = [...prev.cartaAceptacion];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, cartaAceptacion: updated };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!rutaInscripcion || !rutaCertificacion || !rutaServicioSocial || !rutaCartaAceptacion) {
      alert("Por favor, sube todos los documentos requeridos (Inscripción, Certificación, Constancia y Carta).");
      return;
    }

    if (countWords(trabajoData.descripcion) > MAX_DESC_TRABAJO) {
      alert("La descripción del trabajo excede el máximo de 900 palabras.");
      return;
    }
    if (countWords(proyectoData.problema) > MAX_PROBLEMA) {
      alert("El 'Problema' excede el máximo de 900 palabras.");
      return;
    }
    if (countWords(proyectoData.justificacion) > MAX_JUSTIFICACION) {
      alert("La 'Justificación' excede el máximo de 900 palabras.");
      return;
    }
    if (countWords(proyectoData.alcance) > MAX_ALCANCE) {
      alert("El 'Alcance' excede el máximo de 300 palabras.");
      return;
    }
    if (countWords(proyectoData.descripcionObjetivos) > MAX_DESCR_OBJETIVOS) {
      alert("La 'Descripción de Objetivos' excede el máximo de 900 palabras.");
      return;
    }

    const bodyData = {
      trabajoGraduacion: {
        titulo: trabajoData.titulo.trim(),
        descripcion: trabajoData.descripcion.trim(),
        tipoTrabajo: trabajoData.tipoTrabajo,
        fechaInicio: trabajoData.fechaInicio,
        fechaFin: trabajoData.fechaFin,
        estado: trabajoData.estado,
      },
      proyecto: {
        problema: proyectoData.problema.trim(),
        justificacion: proyectoData.justificacion.trim(),
        alcance: proyectoData.alcance.trim(),
        objetivos: proyectoData.objetivos.filter((o) => o.trim() !== ""),
        descripcionObjetivos: proyectoData.descripcionObjetivos.trim(),
        metodologia: proyectoData.metodologia,
        entregables: proyectoData.entregables.filter((e) => e.trim() !== ""),
        cronograma: proyectoData.cronograma.map((c) => ({
          actividad: c.actividad.trim(),
          fechaInicio: c.fechaInicio,
          fechaFin: c.fechaFin,
        })),
        actores: proyectoData.actores.filter((a) => a.trim() !== ""),
        asesoresPropuestos: proyectoData.asesoresPropuestos
          .filter((asesor) => asesor.nombre.trim() !== "")
          .map((asesor) => ({ nombre: asesor.nombre.trim() })),
        cartaAceptacion: [
          {
            documento: rutaCartaAceptacion,
            fecha: proyectoData.cartaAceptacion[0].fecha,
          },
        ],
        inscripcionTrabajoGraduacion: rutaInscripcion,
        certificacion_global_notas: rutaCertificacion,
        constanciaServicioSocial: rutaServicioSocial,
      },
    };

    try {
      const response = await authFetch(`${API_URL}/api/proyectos/crear-completo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(bodyData),
      });
      if (!response.ok) {
        throw new Error("Error al enviar los datos al backend");
      }
      const result = await response.json();
      const trabajoId = result.trabajoGraduacion.id;
      const segundoPost = await authFetch(
        `${API_URL}/api/miembros-trabajo/add?trabajoId=${trabajoId}&usuarioId=${userId}`,
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (!segundoPost.ok) {
        throw new Error("Error al asociar el usuario al trabajo de graduación");
      }
      alert("Formulario enviado y usuario asociado correctamente.");
      navigate("/inicio");
    } catch (err) {
      alert("Ocurrió un error al enviar el formulario. Intenta de nuevo.");
    }
  }

  return (
    <div className="form-container">
      <h2>Formulario de Investigación</h2>
      <div className="tabs">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`tab ${idx === currentStep ? "active" : ""}`}
            onClick={() => setCurrentStep(idx)}
          >
            {step}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 0 && (
          <div className="form-step">
            <label>Título</label>
            <p className="help-text">
              Escribe el nombre oficial de tu Investigación.
            </p>
            <input
              type="text"
              name="titulo"
              value={trabajoData.titulo}
              onChange={handleTrabajoChange}
              required
            />

            <label>Descripción (máx 900 palabras)</label>
            <p className="help-text">
              Breve introducción o descripción general de tu proyecto.
            </p>
            <textarea
              name="descripcion"
              rows="5"
              value={trabajoData.descripcion}
              onChange={handleTrabajoChange}
              required
            />
            <small>
              Palabras: {countWords(trabajoData.descripcion)} / {MAX_DESC_TRABAJO}
            </small>

            <label>Fecha de Inicio</label>
            <p className="help-text">
              Indica cuándo iniciarás oficialmente tu proyecto.
            </p>
            <input
              type="date"
              name="fechaInicio"
              value={trabajoData.fechaInicio}
              onChange={handleTrabajoChange}
              required
            />

            <label>Fecha de Fin</label>
            <p className="help-text">
              Estimación de finalización (fecha límite).
            </p>
            <input
              type="date"
              name="fechaFin"
              value={trabajoData.fechaFin}
              onChange={handleTrabajoChange}
              required
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="form-step">
            <label>Descripción del problema (máx 900)</label>
            <p className="help-text">
              Explica detalladamente el problema o la oportunidad que se abordará.
            </p>
            <textarea
              name="problema"
              rows="4"
              value={proyectoData.problema}
              onChange={handleProyectoChange}
              required
            />
            <small>
              Palabras: {countWords(proyectoData.problema)} / {MAX_PROBLEMA}
            </small>

            <label>Justificación (máx 900)</label>
            <p className="help-text">
              ¿Por qué es importante este proyecto? Beneficios y relevancia.
            </p>
            <textarea
              name="justificacion"
              rows="4"
              value={proyectoData.justificacion}
              onChange={handleProyectoChange}
              required
            />
            <small>
              Palabras: {countWords(proyectoData.justificacion)} / {MAX_JUSTIFICACION}
            </small>

            <label>Alcance (máx 300)</label>
            <p className="help-text">
              Define el alcance específico de tu proyecto (qué incluye y hasta dónde llega).
            </p>
            <textarea
              name="alcance"
              rows="3"
              value={proyectoData.alcance}
              onChange={handleProyectoChange}
              required
            />
            <small>
              Palabras: {countWords(proyectoData.alcance)} / {MAX_ALCANCE}
            </small>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <label>Descripción Narrativa de Objetivos (máx 900)</label>
            <p className="help-text">
              Explica cada objetivo, por qué es importante y cómo se abordará.
            </p>
            <textarea
              name="descripcionObjetivos"
              rows="4"
              value={proyectoData.descripcionObjetivos}
              onChange={handleProyectoChange}
              required
            />
            <small>
              Palabras: {countWords(proyectoData.descripcionObjetivos)} / {MAX_DESCR_OBJETIVOS}
            </small>

            <label>Objetivos (lista)</label>
            <p className="help-text">
              Indica al menos 4 objetivos específicos (puedes tener hasta 6).
            </p>
            {proyectoData.objetivos.map((obj, idx) => (
              <div key={idx} style={{ marginBottom: "5px" }}>
                <input
                  type="text"
                  placeholder={`Objetivo ${idx + 1}`}
                  value={obj}
                  onChange={(e) =>
                    setProyectoData((prev) => ({
                      ...prev,
                      objetivos: prev.objetivos.map((o, i) =>
                        i === idx ? e.target.value : o
                      ),
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setProyectoData((prev) => ({
                      ...prev,
                      objetivos: prev.objetivos.filter((_, i) => i !== idx),
                    }))
                  }
                  disabled={proyectoData.objetivos.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setProyectoData((prev) => ({
                  ...prev,
                  objetivos: [...prev.objetivos, ""],
                }))
              }
            >
              + Agregar Objetivo
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <label>Alumnos Encargados (Correos)</label>
            <p className="help-text">
              Si eres el único, deja estos campos vacíos. Si hay otros alumnos, ingresa sus correos.
            </p>
            <input
              type="text"
              placeholder="ejemplo1@catolica.edu.sv"
              value={correosExtras.uno}
              onChange={(e) =>
                setCorreosExtras((prev) => ({ ...prev, uno: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="ejemplo2@catolica.edu.sv"
              value={correosExtras.dos}
              onChange={(e) =>
                setCorreosExtras((prev) => ({ ...prev, dos: e.target.value }))
              }
            />

            <label>Asesores Propuestos</label>
            <p className="help-text">
              Máximo 3 asesores. Agrega sus nombres completos.
            </p>
            {proyectoData.asesoresPropuestos.map((asesor, index) => (
              <div key={index} style={{ marginBottom: "5px" }}>
                <input
                  type="text"
                  placeholder={`Asesor ${index + 1}`}
                  value={asesor.nombre}
                  onChange={(e) =>
                    setProyectoData((prev) => ({
                      ...prev,
                      asesoresPropuestos: prev.asesoresPropuestos.map((a, i) =>
                        i === index ? { ...a, nombre: e.target.value } : a
                      ),
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setProyectoData((prev) => ({
                      ...prev,
                      asesoresPropuestos: prev.asesoresPropuestos.filter(
                        (_, i) => i !== index
                      ),
                    }))
                  }
                  disabled={proyectoData.asesoresPropuestos.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                if (proyectoData.asesoresPropuestos.length < 3) {
                  setProyectoData((prev) => ({
                    ...prev,
                    asesoresPropuestos: [...prev.asesoresPropuestos, { nombre: "" }],
                  }));
                } else {
                  alert("Máximo 3 asesores.");
                }
              }}
              disabled={proyectoData.asesoresPropuestos.length >= 3}
            >
              + Agregar Asesor
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-step">
            <label>Actores</label>
            <p className="help-text">
              Lista de actores (patrocinador, beneficiarios, equipo, etc.).
            </p>
            {proyectoData.actores.map((actor, idx) => (
              <div key={idx} style={{ marginBottom: "5px" }}>
                <input
                  type="text"
                  placeholder={`Actor ${idx + 1}`}
                  value={actor}
                  onChange={(e) =>
                    setProyectoData((prev) => ({
                      ...prev,
                      actores: prev.actores.map((a, i) =>
                        i === idx ? e.target.value : a
                      ),
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setProyectoData((prev) => ({
                      ...prev,
                      actores: prev.actores.filter((_, i) => i !== idx),
                    }))
                  }
                  disabled={proyectoData.actores.length <= 1}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setProyectoData((prev) => ({
                  ...prev,
                  actores: [...prev.actores, ""],
                }))
              }
            >
              + Agregar Actor
            </button>

            <label>Fecha de Aceptación (Carta)</label>
            <p className="help-text">
              Fecha en la que la carta de aceptación fue firmada.
            </p>
            <input
              type="date"
              value={proyectoData.cartaAceptacion[0].fecha}
              onChange={(e) => handleCartaAceptacionChange("fecha", e.target.value)}
              required
            />
          </div>
        )}

        {currentStep === 5 && (
          <div className="form-step">
            <h4>Documentos</h4>

            <label>Inscripción de Trabajo de Graduación</label>
            <p className="help-text">
              Subir comprobante de la inscripción.
            </p>
            <FileUpload
              fileName="inscripcion_trabajo_graduacion"
              initialUploaded={archivosSubidos["inscripcion_trabajo_graduacion"]}
              onSuccess={(ruta) => {
                setRutaInscripcion(ruta);
                setArchivosSubidos((prev) => ({
                  ...prev,
                  inscripcion_trabajo_graduacion: true,
                }));
              }}
            />
            {rutaInscripcion && <p>{rutaInscripcion}</p>}

            <label>Certificación Global de Notas</label>
            <p className="help-text">
              Subir la copia de certificación de notas.
            </p>
            <FileUpload
              fileName="certificacion_global_notas"
              initialUploaded={archivosSubidos["certificacion_global_notas"]}
              onSuccess={(ruta) => {
                setRutaCertificacion(ruta);
                setArchivosSubidos((prev) => ({
                  ...prev,
                  certificacion_global_notas: true,
                }));
              }}
            />
            {rutaCertificacion && <p>{rutaCertificacion}</p>}

            <label>Constancia de Servicio Social</label>
            <p className="help-text">
              Subir constancia emitida por el decanato.
            </p>
            <FileUpload
              fileName="constancia_servicio_social"
              initialUploaded={archivosSubidos["constancia_servicio_social"]}
              onSuccess={(ruta) => {
                setRutaServicioSocial(ruta);
                setArchivosSubidos((prev) => ({
                  ...prev,
                  constancia_servicio_social: true,
                }));
              }}
            />
            {rutaServicioSocial && <p>{rutaServicioSocial}</p>}

            <label>Carta de Aceptación</label>
            <p className="help-text">
              Subir la carta de aceptación firmada y sellada.
            </p>
            <FileUpload
              fileName="carta_aceptacion"
              initialUploaded={archivosSubidos["carta_aceptacion"]}
              onSuccess={(ruta) => {
                setRutaCartaAceptacion(ruta);
                setArchivosSubidos((prev) => ({
                  ...prev,
                  carta_aceptacion: true,
                }));
              }}
            />
            {rutaCartaAceptacion && <p>{rutaCartaAceptacion}</p>}
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
