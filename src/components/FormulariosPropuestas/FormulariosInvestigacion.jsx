import React, { useState, useContext } from "react";
import FileUpload from "../docs/FileUpload";
import "./FormulariosPropuestas.css";
import { AuthContext } from "../Auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function FormulariosInvestigacion() {
  const { state } = useContext(AuthContext);
  const { token, userId } = state;

  const [trabajoData, setTrabajoData] = useState({
    titulo: "",
    descripcion: "",
    tipoTrabajo: "Proyecto",
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
    asesoresPropuestos: [{ nombre: "" }], // Inicializa con un asesor vacío
    cartaAceptacion: [
      {
        documento: "",
        fecha: "",
      },
    ],
    inscripcionTrabajoGraduacion: "",
    certificacionGlobalNotas: "",
    constanciaServicioSocial: "",
  });
  

  const [rutaInscripcion, setRutaInscripcion] = useState(null);
  const [rutaCertificacion, setRutaCertificacion] = useState(null);
  const [rutaServicioSocial, setRutaServicioSocial] = useState(null);
  const [rutaCartaAceptacion, setRutaCartaAceptacion] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);

  const [archivosSubidos, setArchivosSubidos] = useState({
    carta_aceptacion: false,
    inscripcion_trabajo_graduacion: false,
    certificacion_global_notas: false,
    constancia_servicio_social: false,
  });

  const steps = [
    "Trabajo de Graduación",
    "Datos del Proyecto",
    "Objetivos",
    "Alumnos Encargados",
    "Actores y Carta Aceptación",
    "Documentos",
  ];

  const navigate = useNavigate();

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleTrabajoChange = (e) => {
    const { name, value } = e.target;
    setTrabajoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProyectoChange = (e) => {
    const { name, value } = e.target;
    setProyectoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (setter, index, value) => {
    setter((prev) => {
      if (!Array.isArray(prev)) throw new Error("El estado no es un array");
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addField = (setter, defaultValue) =>
    setter((prev) => [...prev, defaultValue]);
  const removeField = (setter, index) =>
    setter((prev) => prev.filter((_, i) => i !== index));

  const handleCronogramaChange = (index, field, value) => {
    setProyectoData((prev) => {
      const updated = [...prev.cronograma];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, cronograma: updated };
    });
  };

  const handleCartaAceptacionChange = (field, value, index = 0) => {
    setProyectoData((prev) => {
      const updated = [...prev.cartaAceptacion];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, cartaAceptacion: updated };
    });
  };

  const handleFileUploadSuccess = (fileName) => {
    setArchivosSubidos((prev) => ({
      ...prev,
      [fileName]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (
      !rutaInscripcion ||
      !rutaCertificacion ||
      !rutaServicioSocial ||
      !rutaCartaAceptacion
    ) {
      alert("Por favor, asegúrate de subir todos los documentos requeridos.");
      return;
    }
  
    const jsonData = {
      trabajoGraduacion: {
        titulo: trabajoData.titulo.trim(),
        descripcion: trabajoData.descripcion.trim(),
        tipoTrabajo: trabajoData.tipoTrabajo,
        fechaInicio: trabajoData.fechaInicio, // Asegúrate que no sea vacío
        fechaFin: trabajoData.fechaFin,       // Asegúrate que no sea vacío
        estado: trabajoData.estado,
      },
      proyecto: {
        problema: proyectoData.problema.trim(),
        justificacion: proyectoData.justificacion.trim(),
        alcance: proyectoData.alcance.trim(),
        objetivos: proyectoData.objetivos.filter((o) => o.trim() !== ""),
        descripcionObjetivos: proyectoData.descripcionObjetivos.trim(),
        metodologia: proyectoData.metodologia, // Metodología vacía si no es necesaria
        entregables: proyectoData.entregables.filter((e) => e.trim() !== ""), // Array vacío si no es necesario
        cronograma: proyectoData.cronograma.map((c) => ({
          actividad: c.actividad.trim(),
          fechaInicio: c.fechaInicio, // Validar fechas antes de enviar
          fechaFin: c.fechaFin,
        })),
        actores: proyectoData.actores.filter((a) => a.trim() !== ""),
        asesoresPropuestos: proyectoData.asesoresPropuestos
          .filter((asesor) => asesor.nombre.trim() !== "") // Filtrar asesores vacíos
          .map((asesor) => ({
            nombre: asesor.nombre.trim(), // Solo se necesita el nombre
          })),
        cartaAceptacion: [
          {
            documento: rutaCartaAceptacion,
            fecha: proyectoData.cartaAceptacion[0].fecha, // Fecha en formato YYYY-MM-DD
          },
        ],
        inscripcionTrabajoGraduacion: rutaInscripcion,
        certificacionGlobalNotas: rutaCertificacion,
        constanciaServicioSocial: rutaServicioSocial,
      },
    };
    
    
  
    console.log("JSON para enviar:", jsonData);
  
    try {
      const response = await fetch(
        "http://localhost:8080/api/proyectos/crear-completo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jsonData),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al enviar los datos:", errorText);
        throw new Error("Error al enviar los datos al backend");
      }
  
      const result = await response.json();
      console.log("Respuesta del backend:", result);
  
      // Segundo POST para asociar el usuario al trabajo de graduación
      const trabajoId = result.trabajoGraduacion.id;
      const segundoPostResponse = await fetch(
        `http://localhost:8080/api/miembros-trabajo/add?trabajoId=${trabajoId}&usuarioId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!segundoPostResponse.ok) {
        const errorText = await segundoPostResponse.text();
        console.error("Error al asociar usuario:", errorText);
        throw new Error("Error al asociar el usuario al trabajo de graduación");
      }
  
      const segundoResult = await segundoPostResponse.json();
      console.log("Usuario asociado al trabajo de graduación:", segundoResult);
  
      alert("Formulario enviado correctamente y usuario asociado al trabajo.");
      navigate("/inicio");
    } catch (error) {
      console.error("Error al enviar el formulario:", error.message);
      alert(
        "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo."
      );
    }
  };
  

  return (
    <div className="form-container">
      <h2>Formulario de Proyecto</h2>
      <div className="tabs">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`tab ${index === currentStep ? "active" : ""}`}
            onClick={() => setCurrentStep(index)}
          >
            {step}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Paso 0: Datos del Trabajo de Graduación */}
        {currentStep === 0 && (
          <div className="form-step">
            <h3>{steps[0]}</h3>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                name="titulo"
                value={trabajoData.titulo}
                onChange={handleTrabajoChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={trabajoData.descripcion}
                onChange={handleTrabajoChange}
                rows="5"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Fecha de Inicio</label>
              <input
                type="date"
                name="fechaInicio"
                value={trabajoData.fechaInicio}
                onChange={handleTrabajoChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha de Fin</label>
              <input
                type="date"
                name="fechaFin"
                value={trabajoData.fechaFin}
                onChange={handleTrabajoChange}
                required
              />
            </div>
          </div>
        )}

        {/* Paso 1: Datos del Proyecto */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3>{steps[1]}</h3>
            <div className="form-group">
              <label>Problema</label>
              <textarea
                name="problema"
                value={proyectoData.problema}
                onChange={handleProyectoChange}
                rows="5"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Justificación</label>
              <textarea
                name="justificacion"
                value={proyectoData.justificacion}
                onChange={handleProyectoChange}
                rows="5"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Alcance</label>
              <textarea
                name="alcance"
                value={proyectoData.alcance}
                onChange={handleProyectoChange}
                rows="5"
                required
              ></textarea>
            </div>
          </div>
        )}

        {/* Paso 2: Objetivos */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3>{steps[2]}</h3>
            <div className="form-group">
              <label>Descripción de Objetivos</label>
              <textarea
                name="descripcionObjetivos"
                value={proyectoData.descripcionObjetivos}
                onChange={handleProyectoChange}
                rows="4"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Objetivos</label>
              {proyectoData.objetivos.map((obj, index) => (
                <div key={index} className="dynamic-field">
                  <input
                    type="text"
                    value={obj}
                    placeholder={`Objetivo ${index + 1}`}
                    onChange={(e) =>
                      setProyectoData((prev) => ({
                        ...prev,
                        objetivos: prev.objetivos.map((o, i) =>
                          i === index ? e.target.value : o
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
                        objetivos: prev.objetivos.filter((_, i) => i !== index),
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
          </div>
        )}

        {/* Paso 3: Metodología y Entregables */}
{/* Paso 3: Metodología, Entregables y Asesores Propuestos */}
{currentStep === 3 && (
  <div className="form-step">
    <h3>{steps[3]}</h3>
    <div className="form-group">
      <label>Alumnos Encargados de Desarrollar el Proyecto</label>
      <p>
        Nota: Si usted es el único que realizará el proyecto, debe dejar
        los espacios vacíos.
      </p>
      <input
        type="text"
        placeholder="ejemplo.correo@catolica.edu.sv"
        value={correosExtras.uno}
        onChange={(e) =>
          setCorreosExtras((prev) => ({ ...prev, uno: e.target.value }))
        }
      />
      <input
        type="text"
        placeholder="ejemplo.correo@catolica.edu.sv"
        value={correosExtras.dos}
        onChange={(e) =>
          setCorreosExtras((prev) => ({ ...prev, dos: e.target.value }))
        }
      />
    </div>

    {/* Asesores Propuestos */}
    <div className="form-group">
      <label>Asesores Propuestos</label>
      {proyectoData.asesoresPropuestos?.map((asesor, index) => (
        <div key={index} className="dynamic-field">
          <input
            type="text"
            value={asesor.nombre || ""}
            placeholder={`Asesor ${index + 1}`}
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
            disabled={proyectoData.asesoresPropuestos.length <= 1} // Evita eliminar si queda solo uno
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
            asesoresPropuestos: [
              ...prev.asesoresPropuestos,
              { nombre: "" },
            ], // Agrega un nuevo asesor vacío
          }))
        }
        disabled={proyectoData.asesoresPropuestos.length >= 3} // Limita a 3 asesores
      >
        + Agregar Asesor
      </button>
      {proyectoData.asesoresPropuestos.length >= 3 && (
        <p style={{ color: "red" }}>Solo puedes agregar hasta 3 asesores.</p>
      )}
    </div>
  </div>
)}

        {/* Paso 4: Cronograma
        {currentStep === 4 && (
          <div className="form-step">
            <h3>{steps[4]}</h3>
            <div className="form-group">
              <label>Cronograma</label>
              {proyectoData.cronograma.map((c, index) => (
                <div key={index} className="dynamic-field-multiple">
                  <input
                    type="text"
                    placeholder="Actividad"
                    value={c.actividad}
                    onChange={(e) =>
                      handleCronogramaChange(index, "actividad", e.target.value)
                    }
                    required
                  />
                  <input
                    type="date"
                    value={c.fechaInicio}
                    onChange={(e) =>
                      handleCronogramaChange(
                        index,
                        "fechaInicio",
                        e.target.value
                      )
                    }
                    required
                  />
                  <input
                    type="date"
                    value={c.fechaFin}
                    onChange={(e) =>
                      handleCronogramaChange(index, "fechaFin", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setProyectoData((prev) => ({
                        ...prev,
                        cronograma: prev.cronograma.filter(
                          (_, i) => i !== index
                        ),
                      }))
                    }
                    disabled={proyectoData.cronograma.length <= 1}
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
                    cronograma: [
                      ...prev.cronograma,
                      { actividad: "", fechaInicio: "", fechaFin: "" },
                    ],
                  }))
                }
              >
                + Agregar Actividad
              </button>
            </div>
          </div>
        )} */}

        {/* Paso 5: Actores y Carta Aceptación */}
        {currentStep === 4 && (
          <div className="form-step">
            <h3>{steps[4]}</h3>
            <div className="form-group">
              <label>Actores</label>
              {proyectoData.actores.map((actor, index) => (
                <div key={index} className="dynamic-field">
                  <input
                    type="text"
                    placeholder={`Actor ${index + 1}`}
                    value={actor}
                    onChange={(e) =>
                      setProyectoData((prev) => ({
                        ...prev,
                        actores: prev.actores.map((a, i) =>
                          i === index ? e.target.value : a
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
                        actores: prev.actores.filter((_, i) => i !== index),
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
            </div>
            
          </div>
        )}

        {/* Paso 6: Documentos */}
        {currentStep === 5 && (
          <div className="form-step">
            <h3>{steps[5]}</h3>
            <div className="form-group">
              <h4>Subir Documentos</h4>

              <h6>Inscripción de trabajo de graduación</h6>
              <FileUpload
                fileName="inscripcion_trabajo_graduacion"
                initialUploaded={
                  archivosSubidos["inscripcion_trabajo_graduacion"]
                }
                onSuccess={(ruta) => {
                  setRutaInscripcion(ruta);
                  setArchivosSubidos((prev) => ({
                    ...prev,
                    inscripcion_trabajo_graduacion: true,
                  }));
                }}
              />
              {rutaInscripcion && <p>Ruta: {rutaInscripcion}</p>}

              <h6>Certificación Global de Notas</h6>
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
              {rutaCertificacion && <p>Ruta: {rutaCertificacion}</p>}

              <h6>Constancia de servicio social</h6>
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
              {rutaServicioSocial && <p>Ruta: {rutaServicioSocial}</p>}

              <h6>Carta de Aceptación</h6>
              <div className="form-group">
              <label>Fecha de Aceptación (Carta)</label>
              <input
                type="date"
                value={proyectoData.cartaAceptacion[0].fecha}
                onChange={(e) =>
                  handleCartaAceptacionChange("fecha", e.target.value)
                }
                required
              />
            </div>
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
              {rutaCartaAceptacion && <p>Ruta: {rutaCartaAceptacion}</p>}
            </div>
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
