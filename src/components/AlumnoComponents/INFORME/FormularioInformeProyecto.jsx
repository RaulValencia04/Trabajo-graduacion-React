import React, { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FileUpload from "../../docs/FileUpload";
import { useApi } from "../../Auth/Helpers/api";
import { AuthContext } from "../../Auth/Context/AuthContext";

const FormularioInformeProyecto = ({ informeData }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const { state } = useContext(AuthContext);
  const { userId } = state;

  // Leemos los query params
  const [searchParams] = useSearchParams();
  const trabajoId = searchParams.get("trabajo");
  const tipoTrabajo = searchParams.get("tipo") || "Proyecto";

  // Para mostrar el carnet
  const [carnet, setCarnet] = useState(null);

  // Pasos del formulario
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Información General",
    "Cronograma",
    "Objetivos y Macroactividades",
    "Resultados",
    "Elementos de Soporte",
    "Revisión y Envío",
  ];

  // Manejo de archivos
  const [cronogramaFile, setCronogramaFile] = useState(null);
  const [cronogramaUploaded, setCronogramaUploaded] = useState(false);
  const [rutaCronograma, setRutaCronograma] = useState("");

  // Aquí guardaremos los errores de validación
  const [errors, setErrors] = useState({});

  // Estado principal
  const [informe, setInforme] = useState({
    estudiante: { id: userId, nombreUsuario: "" },
    asesor: { id: null, nombreUsuario: "" },
    supervisor: { nombre: "", cargo: "", contacto: "" },
    fechaPresentacion: "",
    periodoInicio: "",
    periodoFin: "",
    tipoTrabajo,
    empresa: "",
    estado: "Pendiente",
    cronograma: [{ ruta_cronograma: "" }],
    marcoTeorico: [],
    elementosSoporte: [],
    desarrolloActividades: {
      objetivoGeneral: { descripcion: "" },
      objetivosEspecificos: [
        {
          titulo: "",
          descripcion: "",
          macroActividades: [
            {
              titulo: "",
              descripcion: "",
              actividades: [
                {
                  nombre: "",
                  fechaInicio: "",
                  fechaFin: "",
                  descripcion: "",
                  acciones: [],
                },
              ],
            },
          ],
        },
      ],
    },
    resultadosActividades: [],
  });

  useEffect(() => {
    // Fecha de presentación por defecto = hoy
    setInforme((prev) => ({
      ...prev,
      fechaPresentacion: new Date().toISOString().split("T")[0],
    }));
  }, []);

  // Si vienen datos previos (edición / rechazado), los mezclamos
  useEffect(() => {
    if (informeData) {
      setInforme((prev) => ({
        ...prev,
        ...informeData,
        // Evitar que sea undefined:
        marcoTeorico: informeData.marcoTeorico || [],
        elementosSoporte: informeData.elementosSoporte || [],
        desarrolloActividades: informeData.desarrolloActividades || {
          objetivoGeneral: { descripcion: "" },
          objetivosEspecificos: [],
        },
      }));
    }
  }, [informeData]);

  // Cargar datos del usuario, asesor, supervisor, etc.
  const fetchData = useCallback(async () => {
    try {
      // Estudiante: Cargar carnet
      const resEstudiante = await authFetch(`${API_URL}/api/usuarios/${userId}`);
      const estudianteData = resEstudiante.ok ? await resEstudiante.json() : null;
      setCarnet(estudianteData?.carnet || "");

      // Asesor
      const resAsesor = await authFetch(`${API_URL}/api/trabajos/${trabajoId}/asesor`);
      const asesorData = resAsesor.ok ? await resAsesor.json() : { id: null, nombreUsuario: "" };

      // Supervisor (si aplica)
      const resSupervisor = await authFetch(`${API_URL}/api/pasantias/${trabajoId}/supervisor`);
      const supervisorData = resSupervisor.ok
        ? await resSupervisor.json()
        : { nombre: "", cargo: "", contacto: "" };

      // Empresa
      const resEmpresa = await authFetch(`${API_URL}/api/trabajos/${trabajoId}`);
      const empresaData = resEmpresa.ok ? await resEmpresa.json() : { titulo: "" };

      // Actualizamos el estado
      setInforme((prev) => ({
        ...prev,
        estudiante: {
          ...prev.estudiante,
          nombreUsuario: estudianteData?.nombreUsuario || "",
        },
        asesor: {
          id: asesorData.id || null,
          nombreUsuario: asesorData.nombreUsuario || "",
        },
        supervisor: {
          nombre: supervisorData?.nombre || "",
          cargo: supervisorData?.cargo || "",
          contacto: supervisorData?.contacto || "",
        },
        empresa: empresaData?.titulo || "",
      }));
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, [authFetch, API_URL, trabajoId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejo de cambios en inputs “simples”
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInforme((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de Supervisor, Cargo, etc. (por si necesitamos inputs)
  const handleSupervisorChange = (field, value) => {
    setInforme((prev) => ({
      ...prev,
      supervisor: {
        ...prev.supervisor,
        [field]: value,
      },
    }));
  };

  // Manejo de “elementosSoporte”
  function handleElementoSoporteChange(index, field, value) {
    setInforme((prev) => {
      const updated = [...prev.elementosSoporte];
      updated[index][field] = value;
      return { ...prev, elementosSoporte: updated };
    });
  }
  function removeElementoSoporteItem(index) {
    setInforme((prev) => ({
      ...prev,
      elementosSoporte: prev.elementosSoporte.filter((_, i) => i !== index),
    }));
  }
  function addElementoSoporteItem() {
    setInforme((prev) => ({
      ...prev,
      elementosSoporte: [
        ...prev.elementosSoporte,
        { semana: "", titulo: "", descripcion: "", url: "" },
      ],
    }));
  }

  // Validación por pasos
  const validateStep = (stepIndex) => {
    let stepErrors = {};

    switch (stepIndex) {
      case 0: {
        // Validar “Información General”
        if (!informe.periodoInicio) {
          stepErrors.periodoInicio = "La fecha de inicio es requerida.";
        }
        if (!informe.periodoFin) {
          stepErrors.periodoFin = "La fecha de fin es requerida.";
        }
        // Podríamos hacer validaciones de rangos de fechas
        if (informe.periodoInicio && informe.periodoFin) {
          const startDate = new Date(informe.periodoInicio);
          const endDate = new Date(informe.periodoFin);
          if (startDate > endDate) {
            stepErrors.periodoFin = "La fecha de fin debe ser posterior a la fecha de inicio.";
          }
        }
        // Supervisor, si es requerido:
        if (!informe.supervisor.nombre) {
          stepErrors.supervisorNombre = "El nombre del supervisor es requerido.";
        }
        // ...
        break;
      }
      case 1:
        // Cronograma: nada especial si no se requiere
        // Podrías obligar a que suban un archivo (rutaCronograma).
        if (!rutaCronograma) {
          stepErrors.cronograma = "Debes subir el cronograma de actividades.";
        }
        break;

      case 2: {
        // Objetivos y Macroactividades
        // Mínimo 1 Objetivo Específico
        const objEsp = informe.desarrolloActividades.objetivosEspecificos;
        if (!objEsp || objEsp.length === 0) {
          stepErrors.objetivos = "Debes ingresar al menos un objetivo específico.";
        } else {
          // Revisar uno x uno
          objEsp.forEach((obj, i) => {
            if (!obj.titulo?.trim()) {
              stepErrors[`objTitulo_${i}`] = `El Título del objetivo específico #${i + 1} es requerido.`;
            }
          });
        }
        break;
      }
      case 3: {
        // Resultados
        // Revisamos “resultadosActividades” => progreso <= 100
        informe.resultadosActividades.forEach((r, i) => {
          if (r.progreso > 100) {
            stepErrors[`progreso_${r.actividad}_${i}`] =
              "El progreso no puede ser mayor que 100.";
          } else if (r.progreso < 0) {
            stepErrors[`progreso_${r.actividad}_${i}`] =
              "El progreso no puede ser negativo.";
          }
        });
        break;
      }
      case 4:
        // Elementos de Soporte. Decide si son obligatorios.
        // Por ejemplo, un check de que el “Título” no esté vacío
        informe.elementosSoporte.forEach((es, i) => {
          if (!es.titulo?.trim()) {
            stepErrors[`elemSoporteTitulo_${i}`] = `El Elemento de Soporte #${i + 1} requiere un título.`;
          }
        });
        break;
      case 5:
        // Revisión final: no se hace gran cosa salvo volver a revalidar
        break;
      default:
        break;
    }

    setErrors(stepErrors);
    // Si no hay “keys”, no hay errores => valid
    return Object.keys(stepErrors).length === 0;
  };

  // Avanzar y Retroceder con validación
  const goNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const goPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Manejo de Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar el último paso (o todos)
    // Si no es válido, no hacemos POST
    if (!validateStep(currentStep)) return;

    try {
      // Eliminamos “selectedFile” en “elementosSoporte”
      const cleanedInforme = {
        ...informe,
        elementosSoporte: informe.elementosSoporte.map(({ selectedFile, ...rest }) => rest),
      };

      const response = await authFetch(`${API_URL}/api/informe_mensual/proyecto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedInforme),
      });

      if (!response.ok) {
        throw new Error(`Error al enviar Informe de Proyecto (status ${response.status})`);
      }
      alert("Informe de Proyecto enviado con éxito");
      navigate("/inicio");
    } catch (error) {
      alert("Error al enviar el informe");
    }
  };

  return (
    <div className="form-container pt-4 pb-4">
      <h2 className="title-form">Informe Mensual de Proyecto</h2>

      <div className="tabs-container">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`tab ${idx === currentStep ? "active-tab" : ""}`}
            onClick={() => {
              // Si quieres que NO se pueda saltar pasos => valida
              if (validateStep(currentStep)) setCurrentStep(idx);
            }}
          >
            {step}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="informe-form mt-3">
        {/* PASO 0: INFORMACION GENERAL */}
        {currentStep === 0 && (
          <div className="form-step">
            <h3>Información General</h3>
            <table className="info-table">
              <tbody>
                <tr>
                  <td><strong>Fecha de presentación al asesor:</strong></td>
                  <td>{informe.fechaPresentacion || "dd/mm/yyyy"}</td>
                </tr>
                <tr>
                  <td><strong>Periodo reportado:</strong></td>
                  <td>
                    <strong>Desde:</strong>{" "}
                    {informe.periodoInicio || "dd/mm/yyyy"}
                  </td>
                  <td>
                    <strong>Hasta:</strong> {informe.periodoFin || "dd/mm/yyyy"}
                  </td>
                </tr>
                <tr>
                  <td><strong>Estudiante:</strong></td>
                  <td>{informe.estudiante.nombreUsuario || "Nombre"}</td>
                  <td><strong>Carnet:</strong></td>
                  <td>{carnet || "# de carnet"}</td>
                </tr>
                <tr>
                  <td><strong>Asesor:</strong></td>
                  <td colSpan="3">
                    {informe.asesor?.nombreUsuario || "Nombre del asesor"}
                  </td>
                </tr>
                <tr>
                  <td><strong>Supervisor Empresarial:</strong></td>
                  <td>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={informe.supervisor?.nombre}
                      onChange={(e) => handleSupervisorChange("nombre", e.target.value)}
                    />
                  </td>
                  <td><strong>Cargo:</strong></td>
                  <td>
                    <input
                      type="text"
                      placeholder="Cargo"
                      value={informe.supervisor?.cargo}
                      onChange={(e) => handleSupervisorChange("cargo", e.target.value)}
                    />
                  </td>
                </tr>

                <tr>
                  <td><strong>Título proyecto:</strong></td>
                  <td colSpan="3">{informe.empresa || "Nombre del Proyecto"}</td>
                </tr>
              </tbody>
            </table>
            <br />
            <label>Periodo reportado - Desde:</label>
            <input
              type="date"
              name="periodoInicio"
              value={informe.periodoInicio}
              onChange={handleChange}
              required
            />
            {errors.periodoInicio && <p className="error-text">{errors.periodoInicio}</p>}

            <label>Periodo reportado - Hasta:</label>
            <input
              type="date"
              name="periodoFin"
              value={informe.periodoFin}
              onChange={handleChange}
              required
            />
            {errors.periodoFin && <p className="error-text">{errors.periodoFin}</p>}

            {errors.supervisorNombre && (
              <p className="error-text">{errors.supervisorNombre}</p>
            )}
          </div>
        )}

        {/* PASO 1: CRONOGRAMA */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3>Cronograma de Actividades del Periodo</h3>
            <p>Sube una imagen que represente el cronograma de actividades.</p>

            {rutaCronograma && !cronogramaFile && !cronogramaUploaded && (
              <div className="text-center mb-3">
                <img
                  src={`${API_URL}/uploads/${rutaCronograma}`}
                  alt="Cronograma Actual"
                  style={{ maxWidth: "100%", maxHeight: "300px" }}
                />
              </div>
            )}
            <FileUpload
              fileName="cronograma"
              selectedFile={cronogramaFile}
              isUploaded={cronogramaUploaded}
              onFileSelect={(file) => setCronogramaFile(file)}
              onSetIsUploaded={(uploaded, ruta) => {
                setCronogramaUploaded(uploaded);
                setRutaCronograma(ruta);
                setInforme((prev) => ({
                  ...prev,
                  cronograma: [{ ruta_cronograma: ruta }],
                }));
              }}
            />
            {cronogramaUploaded && (
              <button
                type="button"
                onClick={() => {
                  setCronogramaUploaded(false);
                  setCronogramaFile(null);
                }}
              >
                Reemplazar
              </button>
            )}
            {errors.cronograma && (
              <p className="error-text">{errors.cronograma}</p>
            )}
          </div>
        )}

        {/* PASO 2: Objetivos y Macroactividades */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3>Objetivos, Macro Actividades y Acciones</h3>
            {/* Objetivo General */}
            <label>Objetivo General (Descripción):</label>
            <textarea
              value={
                informe.desarrolloActividades?.objetivoGeneral?.descripcion ||
                ""
              }
              onChange={(e) => {
                const val = e.target.value;
                setInforme((prev) => ({
                  ...prev,
                  desarrolloActividades: {
                    ...prev.desarrolloActividades,
                    objetivoGeneral: {
                      ...prev.desarrolloActividades.objetivoGeneral,
                      descripcion: val,
                    },
                  },
                }));
              }}
            />
            <hr />
            <h4>Objetivos Específicos</h4>
            {informe.desarrolloActividades.objetivosEspecificos.map(
              (obj, objIndex) => (
                <div key={objIndex} style={{ padding: "10px", border: "1px solid #ddd", marginBottom: "15px" }}>
                  <label>Título del Objetivo Específico:</label>
                  <input
                    type="text"
                    placeholder="Ej: Objetivo Específico 1"
                    value={obj.titulo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInforme((prev) => {
                        const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                        updatedObjs[objIndex].titulo = val;
                        return {
                          ...prev,
                          desarrolloActividades: {
                            ...prev.desarrolloActividades,
                            objetivosEspecificos: updatedObjs,
                          },
                        };
                      });
                    }}
                  />
                  {errors[`objTitulo_${objIndex}`] && (
                    <p className="error-text">{errors[`objTitulo_${objIndex}`]}</p>
                  )}
                  <label>Descripción del Objetivo Específico:</label>
                  <textarea
                    value={obj.descripcion}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInforme((prev) => {
                        const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                        updatedObjs[objIndex].descripcion = val;
                        return {
                          ...prev,
                          desarrolloActividades: {
                            ...prev.desarrolloActividades,
                            objetivosEspecificos: updatedObjs,
                          },
                        };
                      });
                    }}
                  />

                  <h5>Macro Actividades</h5>
                  {obj.macroActividades.map((mac, macIndex) => (
                    <div key={macIndex} style={{ border: "1px dashed #bbb", margin: "10px", padding: "10px" }}>
                      <label>Título de la Macro Actividad:</label>
                      <input
                        type="text"
                        value={mac.titulo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInforme((prev) => {
                            const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                            updatedObjs[objIndex].macroActividades[macIndex].titulo = val;
                            return {
                              ...prev,
                              desarrolloActividades: {
                                ...prev.desarrolloActividades,
                                objetivosEspecificos: updatedObjs,
                              },
                            };
                          });
                        }}
                      />
                      <label>Descripción de la Macro Actividad:</label>
                      <textarea
                        value={mac.descripcion}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInforme((prev) => {
                            const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                            updatedObjs[objIndex].macroActividades[macIndex].descripcion = val;
                            return {
                              ...prev,
                              desarrolloActividades: {
                                ...prev.desarrolloActividades,
                                objetivosEspecificos: updatedObjs,
                              },
                            };
                          });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setInforme((prev) => {
                            const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                            updatedObjs[objIndex].macroActividades = updatedObjs[objIndex].macroActividades.filter((_, i) => i !== macIndex);
                            return {
                              ...prev,
                              desarrolloActividades: {
                                ...prev.desarrolloActividades,
                                objetivosEspecificos: updatedObjs,
                              },
                            };
                          });
                        }}
                      >
                        Eliminar Macro
                      </button>

                      <h6>Actividades</h6>
                      {mac.actividades.map((act, actIndex) => (
                        <div key={actIndex} style={{ marginLeft: "20px", marginBottom: "10px" }}>
                          <label>Nombre Actividad:</label>
                          <input
                            type="text"
                            value={act.nombre}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInforme((prev) => {
                                const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex].nombre = val;
                                return {
                                  ...prev,
                                  desarrolloActividades: {
                                    ...prev.desarrolloActividades,
                                    objetivosEspecificos: updatedObjs,
                                  },
                                };
                              });
                            }}
                          />
                          <label>Fecha Inicio:</label>
                          <input
                            type="date"
                            value={act.fechaInicio}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInforme((prev) => {
                                const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex].fechaInicio = val;
                                return {
                                  ...prev,
                                  desarrolloActividades: {
                                    ...prev.desarrolloActividades,
                                    objetivosEspecificos: updatedObjs,
                                  },
                                };
                              });
                            }}
                          />
                          <label>Fecha Fin:</label>
                          <input
                            type="date"
                            value={act.fechaFin}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInforme((prev) => {
                                const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex].fechaFin = val;
                                return {
                                  ...prev,
                                  desarrolloActividades: {
                                    ...prev.desarrolloActividades,
                                    objetivosEspecificos: updatedObjs,
                                  },
                                };
                              });
                            }}
                          />
                          <label>Descripción de la Actividad:</label>
                          <textarea
                            value={act.descripcion}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInforme((prev) => {
                                const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex].descripcion = val;
                                return {
                                  ...prev,
                                  desarrolloActividades: {
                                    ...prev.desarrolloActividades,
                                    objetivosEspecificos: updatedObjs,
                                  },
                                };
                              });
                            }}
                          />

                          {/* Acciones */}
                          <h6>Acciones</h6>
                          {act.acciones.map((accion, accIndex) => (
                            <div key={accIndex} style={{ marginLeft: "20px" }}>
                              <label>Código:</label>
                              <input
                                type="text"
                                value={accion.codigo}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setInforme((prev) => {
                                    const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                    updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex].acciones[accIndex].codigo = val;
                                    return {
                                      ...prev,
                                      desarrolloActividades: {
                                        ...prev.desarrolloActividades,
                                        objetivosEspecificos: updatedObjs,
                                      },
                                    };
                                  });
                                }}
                              />
                              <label>Detalle:</label>
                              <textarea
                                value={accion.detalle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setInforme((prev) => {
                                    const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                    updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex].acciones[accIndex].detalle = val;
                                    return {
                                      ...prev,
                                      desarrolloActividades: {
                                        ...prev.desarrolloActividades,
                                        objetivosEspecificos: updatedObjs,
                                      },
                                    };
                                  });
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setInforme((prev) => {
                                    const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                    const actRef = updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex];
                                    actRef.acciones = actRef.acciones.filter((_, i) => i !== accIndex);
                                    return {
                                      ...prev,
                                      desarrolloActividades: {
                                        ...prev.desarrolloActividades,
                                        objetivosEspecificos: updatedObjs,
                                      },
                                    };
                                  });
                                }}
                              >
                                Eliminar Acción
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setInforme((prev) => {
                                const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                updatedObjs[objIndex].macroActividades[macIndex].actividades[actIndex].acciones.push({
                                  codigo: "",
                                  detalle: "",
                                });
                                return {
                                  ...prev,
                                  desarrolloActividades: {
                                    ...prev.desarrolloActividades,
                                    objetivosEspecificos: updatedObjs,
                                  },
                                };
                              });
                            }}
                          >
                            + Agregar Acción
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInforme((prev) => {
                                const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                                updatedObjs[objIndex].macroActividades[macIndex].actividades = updatedObjs[objIndex].macroActividades[macIndex].actividades.filter((_, i) => i !== actIndex);
                                return {
                                  ...prev,
                                  desarrolloActividades: {
                                    ...prev.desarrolloActividades,
                                    objetivosEspecificos: updatedObjs,
                                  },
                                };
                              });
                            }}
                          >
                            Eliminar Actividad
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setInforme((prev) => {
                            const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                            updatedObjs[objIndex].macroActividades[macIndex].actividades.push({
                              nombre: "",
                              fechaInicio: "",
                              fechaFin: "",
                              descripcion: "",
                              acciones: [],
                            });
                            return {
                              ...prev,
                              desarrolloActividades: {
                                ...prev.desarrolloActividades,
                                objetivosEspecificos: updatedObjs,
                              },
                            };
                          });
                        }}
                      >
                        + Agregar Actividad
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setInforme((prev) => {
                        const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                        updatedObjs[objIndex].macroActividades.push({
                          titulo: "",
                          descripcion: "",
                          actividades: [],
                        });
                        return {
                          ...prev,
                          desarrolloActividades: {
                            ...prev.desarrolloActividades,
                            objetivosEspecificos: updatedObjs,
                          },
                        };
                      });
                    }}
                  >
                    + Agregar Macro Actividad
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInforme((prev) => {
                        const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                        return {
                          ...prev,
                          desarrolloActividades: {
                            ...prev.desarrolloActividades,
                            objetivosEspecificos: updatedObjs.filter((_, i) => i !== objIndex),
                          },
                        };
                      });
                    }}
                  >
                    Eliminar Objetivo Específico
                  </button>
                </div>
              )
            )}
            <button
              type="button"
              onClick={() => {
                setInforme((prev) => {
                  const updatedObjs = [ ...prev.desarrolloActividades.objetivosEspecificos ];
                  updatedObjs.push({
                    titulo: "",
                    descripcion: "",
                    macroActividades: [
                      {
                        titulo: "",
                        descripcion: "",
                        actividades: [],
                      },
                    ],
                  });
                  return {
                    ...prev,
                    desarrolloActividades: {
                      ...prev.desarrolloActividades,
                      objetivosEspecificos: updatedObjs,
                    },
                  };
                });
              }}
            >
              + Agregar Objetivo Específico
            </button>
          </div>
        )}

        {/* PASO 3: Resultados */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3>Resultados por Actividad</h3>
            <p>
              Indica el porcentaje de avance (0 a 100) de cada actividad.
            </p>
            <table className="table-results">
              <thead>
                <tr>
                  <th>Objetivo Específico</th>
                  <th>Macro Actividad</th>
                  <th>Actividad</th>
                  <th>Progreso (%)</th>
                  <th>Pendiente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {informe.desarrolloActividades.objetivosEspecificos.map(
                  (obj, objIndex) =>
                    obj.macroActividades.map((mac, macIndex) =>
                      mac.actividades.map((act, actIndex) => {
                        const existingResult =
                          informe.resultadosActividades.find(
                            (r) => r.actividad === act.nombre
                          ) || {
                            actividad: act.nombre,
                            estado: "",
                            progreso: 0,
                            pendiente: 100,
                          };

                        const handleProgresoChange = (val) => {
                          const p = parseInt(val, 10) || 0;
                          let stepErrors = { ...errors };
                          if (p > 100) {
                            stepErrors[`progreso_${act.nombre}`] =
                              "No puede ser mayor a 100%";
                          } else {
                            delete stepErrors[`progreso_${act.nombre}`];
                          }
                          setErrors(stepErrors);

                          const newPendiente = p > 100 ? 0 : 100 - p;
                          const newEstado = p >= 100 ? "Finalizado" : "En Avance";

                          setInforme((prev) => {
                            const updated = [...prev.resultadosActividades];
                            const indexFound = updated.findIndex(
                              (x) => x.actividad === act.nombre
                            );
                            if (indexFound >= 0) {
                              updated[indexFound] = {
                                ...updated[indexFound],
                                progreso: p,
                                pendiente: newPendiente,
                                estado: newEstado,
                              };
                            } else {
                              updated.push({
                                actividad: act.nombre,
                                progreso: p,
                                pendiente: newPendiente,
                                estado: newEstado,
                              });
                            }
                            return {
                              ...prev,
                              resultadosActividades: updated,
                            };
                          });
                        };

                        return (
                          <tr key={`${objIndex}-${macIndex}-${actIndex}`}>
                            <td>{obj.titulo}</td>
                            <td>{mac.titulo}</td>
                            <td>{act.nombre}</td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={existingResult.progreso}
                                onChange={(e) => handleProgresoChange(e.target.value)}
                                style={{ width: "70px" }}
                              />
                              {errors[`progreso_${act.nombre}`] && (
                                <p className="error-text">
                                  {errors[`progreso_${act.nombre}`]}
                                </p>
                              )}
                            </td>
                            <td>{existingResult.pendiente}</td>
                            <td>{existingResult.estado}</td>
                          </tr>
                        );
                      })
                    )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PASO 4: Elementos de Soporte */}
        {currentStep === 4 && (
          <div className="form-step">
            <h3>Elementos de Soporte</h3>
            <p>Sube los documentos/archivos que respalden tus actividades.</p>

            {informe.elementosSoporte.map((item, idx) => {
              const errKey = `elemSoporteTitulo_${idx}`;
              return (
                <div key={idx} className="elemento-soporte-item">
                  <input
                    type="text"
                    placeholder="Semana"
                    value={item.semana}
                    onChange={(e) =>
                      handleElementoSoporteChange(idx, "semana", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Título"
                    value={item.titulo}
                    onChange={(e) =>
                      handleElementoSoporteChange(idx, "titulo", e.target.value)
                    }
                  />
                  {errors[errKey] && (
                    <p className="error-text">{errors[errKey]}</p>
                  )}
                  <textarea
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={(e) =>
                      handleElementoSoporteChange(idx, "descripcion", e.target.value)
                    }
                  />
                  <FileUpload
                    fileName={`elemento_soporte_${idx}`}
                    selectedFile={item.selectedFile || null}
                    isUploaded={!!item.url}
                    onFileSelect={(file) => {
                      setInforme((prev) => {
                        const updated = [...prev.elementosSoporte];
                        updated[idx] = {
                          ...updated[idx],
                          selectedFile: file,
                        };
                        return { ...prev, elementosSoporte: updated };
                      });
                    }}
                    onSetIsUploaded={(uploaded, url) => {
                      if (uploaded) {
                        setInforme((prev) => {
                          const updated = [...prev.elementosSoporte];
                          updated[idx] = {
                            ...updated[idx],
                            url,
                            selectedFile: null,
                          };
                          return { ...prev, elementosSoporte: updated };
                        });
                      }
                    }}
                  />
                  {item.url && (
                    <p>
                      Archivo subido:{" "}
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.url}
                      </a>
                    </p>
                  )}

                  <button type="button" onClick={() => removeElementoSoporteItem(idx)}>
                    Eliminar
                  </button>
                </div>
              );
            })}

            <button type="button" onClick={addElementoSoporteItem}>
              + Agregar Elemento
            </button>
          </div>
        )}

        {/* PASO 5: REVISIÓN Y ENVÍO */}
        {currentStep === 5 && (
          <div className="form-step">
            <h3>Revisión y Envío</h3>
            <p>Revisa toda la información antes de enviar.</p>
            <button type="submit" className="btn-submit">
              Enviar Informe
            </button>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="navigation-buttons mt-3">
          {currentStep > 0 && (
            <button type="button" onClick={goPrevStep}>
              Anterior
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button type="button" onClick={goNextStep}>
              Siguiente
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormularioInformeProyecto;

/*
-fecha de presenyacion al asesor(esto se puede tomar del sistema)
-periodo de reporte(fecha inicio a fin) 
-nombre del estudiante se puede obtener mediante un endpoint
-nombre del asesor, se puede obtener mediante un endpoint
-nombre del supervisor empresarial y cargo,  se puede obtener mediante un endpoint
-nombre de la empresa se puede pedir tanto como se puede crear un endpoint para obtenerlo
-Cronograma y PPTO de actividades del periodo  imagen
-INFORME DE AVANCES DE EJECUCION DE PROYECTO XYZ PARA EL PERIODO dd/mm/yy AL dd/mm/yy ()
-Resultados Obtenidos en el periodo XYZ al periodo XYZ jsonb
-anexos
-Elementos de soporte 
-Novedades, modificaciones e imprevistos

*/

//NFORME DE AVANCES DE EJECUCION DE PROYECTO XYZ PARA EL PERIODO dd/mm/yy AL dd/mm/yy ()
// {
//   "objetivoGeneral": {
//     "descripcion": "XYZ nivel de avance XX% del total del proyecto alcanzado en el periodo XYZ"
//   },
//   "objetivosEspecificos": [
//     {
//       "descripcion": "XYZ fecha esperada de finalización dd/mm/yy nivel de avance XX% del total del objetivo",
//       "macroActividades": [
//         {
//           "descripcion": "Se ejecutó el 100% de la actividad obteniendo como resultados XYZ...",
//           "actividades": [
//             {
//               "nombre": "Actividad 1",
//               "fechaInicio": "dd/mm/yy",
//               "fechaFin": "dd/mm/yy",
//               "descripcion": "Fue ejecutada al 100%...",
//               "acciones": [
//                 {
//                   "codigo": "ABC",
//                   "detalle": "yyyyyyyyyyyyyyyyyyyyyyyyyyyy..."
//                 },
//                 {
//                   "codigo": "FGT",
//                   "detalle": "yyyyyyyyyyyyyyyyyyyyyyyyyyyy..."
//                 }
//               ]
//             },
//             {
//               "nombre": "Actividad 2",
//               "fechaInicio": "dd/mm/yy",
//               "fechaFin": "dd/mm/yy",
//               "descripcion": "Fue ejecutada al 100%...",
//               "acciones": [
//                 {
//                   "codigo": "OPQ",
//                   "detalle": "xxxxxxxxxxxxxxxxxxxxxxxxxxx..."
//                 },
//                 {
//                   "codigo": "RTS",
//                   "detalle": "xxxxxxxxxxxxxxxxxxxxxxxxxxx..."
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
