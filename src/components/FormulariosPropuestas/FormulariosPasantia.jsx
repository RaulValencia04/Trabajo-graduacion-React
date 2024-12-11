import React, { useState, useContext} from "react";
import FileUpload from "../docs/FileUpload"; // Importación del componente personalizado de carga de archivos
import "./FormulariosPropuestas.css";
import { AuthContext } from "../Auth/Context/AuthContext";

const FormularioPasantia = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    antecedentesInstitucion: "",
    descripcionEmpresa: "",
    supervisor: { nombre: "", cargo: "", contacto: "" },
    asesores: ["", "", ""],
    cartaAceptacion: "",
    correosInstitucionales: "",
    Fecha_inicio: "",
    Fecha_fin: "",
    nombreEmpresa: "",
    contactoEmpresa: "",
    direccionEmpresa: "",

    evaluacionEmpresa: "Pendiente",
  });
  const { state } = useContext(AuthContext);
  const { token } = state;

  const [actividades, setActividades] = useState([""]);
  const [archivosSubidos, setArchivosSubidos] = useState({
    carta_aceptacion: false,
    inscripcion_trabajo_graduacion: false,
    certificacion_global_notas: false,
    constancia_servicio_social: false,
  }); // Estado para rastrear el estado de los archivos subidos
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
  const [rutaInscripcion, setRutaInscripcion] = useState(null);
  const [rutaCertificacion, setRutaCertificacion] = useState(null);
  const [rutaServicioSocial, setRutaServicioSocial] = useState(null);
  const [rutaCartaAceptacion, setRutaCartaAceptacion] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("supervisor.")) {
      const field = name.split(".")[1]; // Extrae el campo (e.g., "nombre", "cargo", etc.)
      setFormData((prev) => ({
        ...prev,
        supervisor: {
          ...prev.supervisor,
          [field]: value, // Actualiza solo el campo correspondiente del supervisor
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value, // Actualiza cualquier otro campo
      }));
    }
  };

  const handleArrayChange = (setter, index, value) => {
    setter((prev) => {
      if (!Array.isArray(prev)) {
        throw new Error("El estado no es un array");
      }
      const updated = [...prev];
      updated[index] = value; // Actualiza el índice correspondiente
      return updated;
    });
  };

  const addField = (setter, defaultValue) =>
    setter((prev) => [...prev, defaultValue]);
  const removeField = (setter, index) =>
    setter((prev) => prev.filter((_, i) => i !== index));

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleFileUploadSuccess = (fileName) => {
    setArchivosSubidos((prev) => ({
      ...prev,
      [fileName]: true, // Marca el archivo como subido
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const jsonData = {
      trabajoGraduacion: {
        titulo: formData.titulo,
        descripcion: formData.descripcionEmpresa,
        tipoTrabajo: "Pasantía", // Puedes hacerlo dinámico si es necesario
        fechaInicio: formData.Fecha_inicio,
        fechaFin: formData.Fecha_fin,
        estado: "En espera",
      },
      pasantia: {
        antecedentesInstitucion: formData.antecedentesInstitucion,
        descripcionEmpresa: formData.descripcionEmpresa,
        actividades: actividades,
        supervisor: {
          nombre: formData.supervisor.nombre,
          contacto: formData.supervisor.contacto,
          cargo: formData.supervisor.cargo,
        },
        asesoresPropuestos: formData.asesores
          .filter((asesor) => asesor.trim() !== "") // Filtra asesores vacíos
          .map((asesor) => ({
            nombre: asesor,
          })),
        cartaAceptacion: [
          {
            documento: rutaCartaAceptacion,
            fecha: formData.cartaAceptacionFecha,
          },
        ],
        inscripcionTrabajoGraduacion: rutaInscripcion,
        certificacionGlobalNotas: rutaCertificacion,
        constanciaServicioSocial: rutaServicioSocial,
      },
      asignacionEmpresa: {
        nombreEmpresa: formData.nombreEmpresa,
        contactoEmpresa: formData.contactoEmpresa,
        direccionEmpresa: formData.direccionEmpresa,
        evaluacion: "En Revisión", // Estado inicial
      },
    };
  
    console.log("JSON para enviar:", jsonData);
  
    if (
      !rutaInscripcion ||
      !rutaCertificacion ||
      !rutaServicioSocial ||
      !rutaCartaAceptacion
    ) {
      alert("Por favor, asegúrate de subir todos los documentos requeridos.");
      return;
    }
  
    // Enviar al backend
    try {
      const response = await fetch(
        "http://localhost:8080/api/pasantias/crear-completa",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Incluye el token JWT aquí
          },
          body: JSON.stringify(jsonData),
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al enviar los datos al backend");
      }
  
      const result = await response.json();
      console.log("Respuesta del backend:", result);
      console.log(result.trabajoGraduacion.id);
  
      // Realizar el segundo POST con el id del trabajo de graduación y el userId
      const segundoPostResponse = await fetch(
        `http://localhost:8080/api/miembros-trabajo/add?trabajoId=${result.trabajoGraduacion.id}&usuarioId=${state.userId}`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
          // Aquí ya no necesitas un cuerpo JSON.
        }
      );
      
  
      if (!segundoPostResponse.ok) {
        throw new Error("Error al asociar el usuario al trabajo de graduación");
      }
  
      const segundoResult = await segundoPostResponse.json();
      console.log("Usuario asociado al trabajo de graduación:", segundoResult);
  
      alert("Formulario enviado correctamente y usuario asociado al trabajo.");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert(
        "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo."
      );
    }
  };
  

  return (
    <div className="form-container">
      <h2>Formulario de Pasantías</h2>
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
        {currentStep === 0 && (
          <div className="form-step">
            <h3>{steps[0]}</h3>
            <div className="form-group">
              {/* <label>Nombre de la Empresa</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
              /> */}
              <label>Fecha de Inicio de la Pasantía</label>
              <input
                type="date"
                name="Fecha_inicio"
                value={formData.Fecha_inicio} // Usar valor del estado
                onChange={handleChange} // Actualizar el estado
                required
              />
              <label>Fecha de Finalización de la Pasantía</label>
              <input
                type="date"
                name="Fecha_fin"
                value={formData.Fecha_fin} // Usar valor del estado
                onChange={handleChange} // Actualizar el estado
                required
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="form-step">
            <h3>{steps[1]}</h3>
            <div className="form-group">
              <label>Antecedentes de la Institución</label>
              <textarea
                name="antecedentesInstitucion"
                value={formData.antecedentesInstitucion}
                onChange={handleChange}
                rows="5"
                placeholder="Describe el impacto de la institución en palabras propias."
                required
              ></textarea>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <h3>{steps[2]}</h3>
            <div className="form-group">
              <label>Descripción General de la Empresa</label>
              <textarea
                name="descripcionEmpresa"
                value={formData.descripcionEmpresa}
                onChange={handleChange}
                rows="5"
                placeholder="Describe los departamentos, actividades, procesos, etc., en palabras propias."
                required
              ></textarea>
            </div>
            <div className="form-group">
              <h4>Datos de la Empresa</h4>
              {formData.empresaValidada ? (
                // Mostrar datos si la empresa ya está validada
                <div className="empresa-validada">
                  <p>
                    <strong>Nombre:</strong> {formData.nombreEmpresa}
                  </p>
                  <p>
                    <strong>Contacto:</strong> {formData.contactoEmpresa}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {formData.direccionEmpresa}
                  </p>
                  <p>
                    <strong>Estado de Validación:</strong>{" "}
                    {formData.evaluacionEmpresa}
                  </p>
                </div>
              ) : (
                // Formulario para ingresar datos de una nueva empresa
                <div>
                  <div className="form-group">
                    <label>Nombre de la Empresa</label>
                    <input
                      type="text"
                      name="nombreEmpresa" // Atributo name correcto
                      value={formData.nombreEmpresa} // Valor tomado del estado
                      onChange={handleChange} // Manejador de cambios
                      placeholder="Ingresa el nombre de la empresa"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contacto de la Empresa</label>
                    <input
                      type="text"
                      name="contactoEmpresa"
                      value={formData.contactoEmpresa}
                      onChange={handleChange}
                      placeholder="Ingresa el contacto de la empresa"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección de la Empresa</label>
                    <textarea
                      name="direccionEmpresa"
                      value={formData.direccionEmpresa}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Ingresa la dirección de la empresa"
                      required
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h3>{steps[3]}</h3>
            <div className="form-group">
              <label>Actividades a Desarrollar</label>
              {actividades.map((actividad, index) => (
                <div key={index} className="dynamic-field">
                  <input
                    type="text"
                    placeholder={`Actividad ${index + 1}`}
                    value={actividad}
                    onChange={(e) =>
                      handleArrayChange(setActividades, index, e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeField(setActividades, index)}
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(setActividades, "")}
              >
                + Agregar Actividad
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-step">
            <h3>{steps[4]}</h3>
            <div className="form-group">
              <label>Nombre del Supervisor</label>
              <input
                type="text"
                name="supervisor.nombre"
                value={formData.supervisor.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Cargo del Supervisor</label>
              <input
                type="text"
                name="cargo"
                value={formData.supervisor.cargo}
                onChange={(e) =>
                  handleChange({
                    target: { name: "supervisor.cargo", value: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Contacto del Supervisor</label>
              <input
                type="text"
                name="contacto"
                value={formData.supervisor.contacto}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "supervisor.contacto",
                      value: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="form-step">
            <h3>{steps[5]}</h3>
            <div className="form-group">
              <label>Asesores Propuestos</label>
              {formData.asesores.map((asesor, index) => (
                <div key={index} className="dynamic-field">
                  <input
                    type="text"
                    value={asesor}
                    placeholder={`Asesor ${index + 1}`}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        asesores: prev.asesores.map((a, i) =>
                          i === index ? e.target.value : a
                        ), // Actualiza el índice correspondiente
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        asesores: prev.asesores.filter((_, i) => i !== index), // Elimina el índice correspondiente
                      }))
                    }
                    disabled={formData.asesores.length <= 1} // No permite eliminar si queda solo uno
                  >
                    -
                  </button>
                </div>
              ))}

              {/* Botón para agregar un nuevo asesor */}
              <button
                type="button"
                onClick={() => {
                  if (formData.asesores.length < 3) {
                    setFormData((prev) => ({
                      ...prev,
                      asesores: [...prev.asesores, ""], // Agrega un nuevo asesor vacío
                    }));
                  } else {
                    alert("Solo puedes agregar hasta 3 asesores.");
                  }
                }}
                disabled={formData.asesores.length >= 3} // Deshabilita el botón si ya hay 3 asesores
              >
                + Agregar Asesor
              </button>
            </div>
          </div>
        )}

{currentStep === 6 && (
  <div className="form-step">
    <h3>{steps[6]}</h3>
    <div className="form-group">
      <h4>Subir Documentos</h4>

      {/* Inscripción de trabajo de graduación */}
      <h6>Inscripción de trabajo de graduación</h6>
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
      {rutaInscripcion && <p>Ruta: {rutaInscripcion}</p>}

      {/* Certificación Global de Notas */}
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

      {/* Constancia de servicio social */}
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

      {/* Carta de Aceptación */}
      <h6>Carta de Aceptación</h6>
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

      {/* Fecha de Aceptación */}
      <label>Fecha de Aceptación</label>
      <input
        type="date"
        name="cartaAceptacionFecha"
        value={formData.cartaAceptacionFecha || ""}
        onChange={handleChange}
        required
      />
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
};

export default FormularioPasantia;
