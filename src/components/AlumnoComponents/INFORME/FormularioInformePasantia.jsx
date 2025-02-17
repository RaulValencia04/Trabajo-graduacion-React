import React, { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../../docs/FileUpload";
import { useApi } from "../../Auth/Helpers/api";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useSearchParams } from "react-router-dom";

const FormularioInformePasantia = ({ informeData }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const { state } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const { userId } = state;
  const trabajoId = searchParams.get("trabajo");
  const tipoTrabajo = searchParams.get("tipo");
  const [carnet, setcarnet] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);

  const [cronogramaFile, setCronogramaFile] = useState(null);

  const [cronogramaUploaded, setCronogramaUploaded] = useState(false);

  // const [usuarios, setUsuarios] = useState([]);

  const steps = [
    "Información General",
    "Cronograma",
    "Marco Teórico",
    "Elementos de Soporte",
    "Revisión y Envío",
  ];

  const [informe, setInforme] = useState({
    estudiante: { id: userId },
    asesor: { id: null },
    fechaPresentacion: "",
    periodoInicio: "",
    periodoFin: "",
    tipoTrabajo: tipoTrabajo || "Pasantía",
    empresa: "",
    estado: "Pendiente",
    supervisor: { nombre: "", cargo: "", contacto: "" },
    cronograma: [{ ruta_cronograma: "" }],
    marcoTeorico: [],
    elementosSoporte: [],
  });
  useEffect(() => {
    if (informeData) {
      setInforme((prev) => ({
        ...prev,
        marcoTeorico: informeData.marcoTeorico || [],
        elementosSoporte: informeData.elementosSoporte || [],
      }));
    }
  }, [informeData]);

  const addMarcoTeoricoItem = () => {
    setInforme((prev) => ({
      ...prev,
      marcoTeorico: [
        ...prev.marcoTeorico,
        { semana: "", tema: "", contenido: "", referencia: "" },
      ],
    }));
  };

  const removeMarcoTeoricoItem = (index) => {
    setInforme((prev) => ({
      ...prev,
      marcoTeorico: prev.marcoTeorico.filter((_, i) => i !== index),
    }));
  };

  const handleMarcoTeoricoChange = (index, field, value) => {
    setInforme((prev) => {
      const updated = [...prev.marcoTeorico];
      updated[index][field] = value;
      return { ...prev, marcoTeorico: updated };
    });
  };

  const addElementoSoporteItem = () => {
    setInforme((prev) => ({
      ...prev,
      elementosSoporte: [
        ...prev.elementosSoporte,
        { semana: "", titulo: "", descripcion: "", url: "" },
      ],
    }));
  };
  useEffect(() => {
    setInforme((prev) => ({
      ...prev,
      fechaPresentacion: new Date().toISOString().split("T")[0], // Establece la fecha actual
    }));
  }, []);

  const removeElementoSoporteItem = (index) => {
    setInforme((prev) => ({
      ...prev,
      elementosSoporte: prev.elementosSoporte.filter((_, i) => i !== index),
    }));
  };

  const handleElementoSoporteChange = (index, field, value) => {
    setInforme((prev) => {
      const updated = [...prev.elementosSoporte];
      updated[index][field] = value;
      return { ...prev, elementosSoporte: updated };
    });
  };

  const [rutaCronograma, setRutaCronograma] = useState(
    informe?.ruta_cronograma || ""
  );

  const fetchData = useCallback(async () => {
    try {
      const resEstudiante = await authFetch(
        `${API_URL}/api/usuarios/${userId}`
      );
      const estudianteData = resEstudiante.ok
        ? await resEstudiante.json()
        : null;
      setcarnet(estudianteData.carnet);

      const resAsesor = await authFetch(
        `${API_URL}/api/trabajos/${trabajoId}/asesor`
      );
      const asesorData = resAsesor.ok ? await resAsesor.json() : null;
      console.log(asesorData);

      const resSupervisor = await authFetch(
        `${API_URL}/api/pasantias/${trabajoId}/supervisor`
      );

      const supervisorData = resSupervisor.ok
        ? await resSupervisor.json()
        : null;

      // console.log(supervisorData.cargo);

      const resEmpresa = await authFetch(
        `${API_URL}/api/trabajos/${trabajoId}`
      );
      const empresaData = resEmpresa.ok ? await resEmpresa.json() : null;
      // console.log(empresaData);

      setInforme((prev) => ({
        ...prev,
        estudiante: {
          id: userId,
          nombreUsuario: estudianteData?.nombreUsuario || "",
        },
        asesor: asesorData
          ? {
              id: asesorData.id,  // Asegúrate de incluir el ID
              nombreUsuario: asesorData.nombreUsuario,
              // email: asesorData.email,
              // telefono: asesorData.telefono,
              // rol: asesorData.rol,
              // departamento: asesorData.departamento,
            }
          : null,
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

  useEffect(() => {
    if (informeData) {
      setInforme((prev) => ({ ...prev, ...informeData }));
    }
  }, [informeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInforme((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cleanedInforme = {
        ...informe,
        elementosSoporte: informe.elementosSoporte.map(({ selectedFile, ...rest }) => rest)
    };
      console.log(informe);
      const response = await authFetch(`${API_URL}/api/informe_mensual/pasantia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedInforme),
      });

      if (!response.ok)
        throw new Error(`Error al enviar (status ${response.status})`);

      alert("Informe enviado con éxito");
      navigate("/inicio");
    } catch (error) {
      alert("Error al enviar el informe");
    }
  };

  return (
    <div className="form-container pt-4 pb-4">
      <h2 className="title-form">Informe Mensual de Pasantía</h2>
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

      <form onSubmit={handleSubmit} className="informe-form mt-3">
        {currentStep === 0 && (
          <div className="form-step">
            <h3>Información General</h3>

            {/* Tabla de información */}
            <table className="info-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Fecha de presentación al asesor:</strong>
                  </td>
                  <td>{informe.fechaPresentacion || "dd/mm/yyyy"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Periodo reportado:</strong>
                  </td>
                  <td>
                    <strong>Desde:</strong>{" "}
                    {informe.periodoInicio || "dd/mm/yyyy"}
                  </td>
                  <td>
                    <strong>Hasta:</strong> {informe.periodoFin || "dd/mm/yyyy"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Estudiante:</strong>
                  </td>
                  <td>{informe.estudiante.nombre || "Nombre del alumno"}</td>
                  <td>
                    <strong>Carnet:</strong>
                  </td>
                  <td>{carnet || "# de carnet"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Asesor:</strong>
                  </td>
                  <td colSpan="3">
                    {informe.asesor.nombre || "Nombre del asesor"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Supervisor Empresarial:</strong>
                  </td>
                  <td>
                    {informe.supervisor.nombre || "Nombre del supervisor"}
                  </td>
                  <td>
                    <strong>Cargo:</strong>
                  </td>
                  <td>{informe.supervisor.cargo || "Cargo"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Empresa:</strong>
                  </td>
                  <td colSpan="3">
                    {informe.empresa || "Nombre de la empresa o institución"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Inputs para completar información */}
            <br />
            {/* <div className="form-group">
              <label>Fecha de presentación al asesor:</label>
              <input
                type="date"
                name="fechaPresentacion"
                onChange={handleChange}
                required
              />
            </div> */}

            <div className="form-group">
              <label>Periodo reportado - Desde:</label>
              <input
                type="date"
                name="periodoInicio"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Periodo reportado - Hasta:</label>
              <input
                type="date"
                name="periodoFin"
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {/* Paso 1: Cronograma */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3>Cronograma de actividades del periodo</h3>
            <p>
              Sube una imagen que represente el cronograma de actividades para
              este periodo.
            </p>

            {/* Mostrar la imagen previa si existe y no hemos subido otra */}
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
              onFileSelect={(file) => {
                setCronogramaFile(file);
              }}
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
                Reemplazar otra vez
              </button>
            )}
          </div>
        )}

        {/* Paso 3: Marco Teórico */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3>Marco Teórico</h3>
            <p>
              Describe el contenido teórico de las actividades realizadas cada
              semana.
            </p>

            {informe.marcoTeorico.map((item, idx) => (
              <div key={idx} className="marco-teorico-item">
                <input
                  type="text"
                  placeholder="Semana (Ej: Semana 1 - 05/02/2025 a 11/02/2025)"
                  value={item.semana}
                  onChange={(e) =>
                    handleMarcoTeoricoChange(idx, "semana", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Tema (Ej: Introducción a la Empresa)"
                  value={item.tema}
                  onChange={(e) =>
                    handleMarcoTeoricoChange(idx, "tema", e.target.value)
                  }
                />
                <textarea
                  placeholder="Contenido (Explica el tema abordado y su aplicación en la empresa)"
                  value={item.contenido}
                  onChange={(e) =>
                    handleMarcoTeoricoChange(idx, "contenido", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Referencia (Ej: Libro de Administración, 2024)"
                  value={item.referencia}
                  onChange={(e) =>
                    handleMarcoTeoricoChange(idx, "referencia", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeMarcoTeoricoItem(idx)}
                >
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" onClick={addMarcoTeoricoItem}>
              + Agregar Semana
            </button>
          </div>
        )}

        {/* Paso: Elementos de Soporte */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3>Elementos de Soporte</h3>
            <p>
              Sube imágenes o documentos que respalden las actividades
              realizadas.
            </p>

            {informe.elementosSoporte.map((item, idx) => (
              <div key={idx} className="elemento-soporte-item">
                <input
                  type="text"
                  placeholder="Semana (Ej: Semana 1 - 05/02/2025 a 11/02/2025)"
                  value={item.semana}
                  onChange={(e) =>
                    handleElementoSoporteChange(idx, "semana", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Título (Ej: Informe de actividades)"
                  value={item.titulo}
                  onChange={(e) =>
                    handleElementoSoporteChange(idx, "titulo", e.target.value)
                  }
                />
                <textarea
                  placeholder="Descripción (Explica el documento o imagen de soporte)"
                  value={item.descripcion}
                  onChange={(e) =>
                    handleElementoSoporteChange(
                      idx,
                      "descripcion",
                      e.target.value
                    )
                  }
                />
                <FileUpload
                  fileName={`elemento_soporte_${idx}`}
                  selectedFile={item.selectedFile || null} // Mantiene el archivo seleccionado
                  isUploaded={!!item.url}
                  onFileSelect={(file) => {
                    setInforme((prev) => {
                      const updatedElementos = [...prev.elementosSoporte];
                      updatedElementos[idx] = {
                        ...updatedElementos[idx],
                        selectedFile: file, // Almacena el archivo en el estado
                      };
                      return { ...prev, elementosSoporte: updatedElementos };
                    });
                  }}
                  onSetIsUploaded={(uploaded, url) => {
                    if (uploaded) {
                      setInforme((prev) => {
                        const updatedElementos = [...prev.elementosSoporte];
                        updatedElementos[idx] = {
                          ...updatedElementos[idx],
                          url,
                          selectedFile: null, // Una vez subido, se limpia selectedFile
                        };
                        return { ...prev, elementosSoporte: updatedElementos };
                      });
                    }
                  }}
                />

                {item.url && (
                  <div className="text-center mt-2">
                    <p>Archivo subido:</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.url}
                    </a>
                  </div>
                )}

                {item.url && (
                  <p>
                    Archivo subido:{" "}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.url}
                    </a>
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => removeElementoSoporteItem(idx)}
                >
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" onClick={addElementoSoporteItem}>
              + Agregar Elemento
            </button>
          </div>
        )}

        {currentStep === steps.length - 1 && (
          <div className="form-step">
            <h3>Revisión y Envío</h3>
            <p>Por favor, revisa la información antes de enviarla.</p>

            {/* Sección de Información General */}
            <h4>Información General</h4>
            <table className="info-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Fecha de presentación al asesor:</strong>
                  </td>
                  <td>{informe.fechaPresentacion || "dd/mm/yyyy"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Periodo reportado:</strong>
                  </td>
                  <td>
                    <strong>Desde:</strong>{" "}
                    {informe.periodoInicio || "dd/mm/yyyy"}
                  </td>
                  <td>
                    <strong>Hasta:</strong> {informe.periodoFin || "dd/mm/yyyy"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Estudiante:</strong>
                  </td>
                  <td>{informe.estudiante.nombre || "Nombre del alumno"}</td>
                  <td>
                    <strong>Carnet:</strong>
                  </td>
                  <td>{carnet || "# de carnet"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Asesor:</strong>
                  </td>
                  <td colSpan="3">
                    {informe.asesor.nombre || "Nombre del asesor"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Supervisor Empresarial:</strong>
                  </td>
                  <td>
                    {informe.supervisor.nombre || "Nombre del supervisor"}
                  </td>
                  <td>
                    <strong>Cargo:</strong>
                  </td>
                  <td>{informe.supervisor.cargo || "Cargo"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Empresa:</strong>
                  </td>
                  <td colSpan="3">
                    {informe.empresa || "Nombre de la empresa o institución"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Sección de Cronograma */}
            <h4>Cronograma de Actividades del Periodo</h4>
            {rutaCronograma ? (
              <div className="text-center mb-3">
                <img
                  src={`${API_URL}/uploads/${rutaCronograma}`}
                  alt="Cronograma Actual"
                  style={{ maxWidth: "100%", maxHeight: "300px" }}
                />
              </div>
            ) : (
              <p>No se ha subido un cronograma.</p>
            )}

            {/* Sección de Marco Teórico */}
            <h4>Marco Teórico</h4>
            {informe.marcoTeorico.length > 0 ? (
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th>Tema</th>
                    <th>Contenido</th>
                    <th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {informe.marcoTeorico.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.semana || "Semana no definida"}</td>
                      <td>{item.tema || "Tema no definido"}</td>
                      <td>{item.contenido || "Sin contenido"}</td>
                      <td>{item.referencia || "Sin referencia"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No se ha agregado información al Marco Teórico.</p>
            )}

            {/* Sección de Elementos de Soporte */}
            <h4>Elementos de Soporte</h4>
            {informe.elementosSoporte.length > 0 ? (
              <table className="info-table">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Archivo</th>
                  </tr>
                </thead>
                <tbody>
                  {informe.elementosSoporte.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.semana || "Semana no definida"}</td>
                      <td>{item.titulo || "Título no definido"}</td>
                      <td>{item.descripcion || "Sin descripción"}</td>
                      <td>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver archivo
                          </a>
                        ) : (
                          "No se ha subido un archivo"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No se han agregado elementos de soporte.</p>
            )}

            {/* Botón para enviar el informe */}
            <button type="submit" className="btn-submit ">
              Enviar Informe
            </button>
          </div>
        )}

        <div className="navigation-buttons">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Anterior
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Siguiente
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormularioInformePasantia;

/*
-fecha de presenyacion al asesor(esto se puede tomar del sistema)
-periodo de reporte(fecha inicio a fin) 
-nombre del estudiante se puede obtener mediante un endpoint
-nombre del asesor, se puede obtener mediante un endpoint
-nombre del supervisor empresarial y cargo,  se puede obtener mediante un endpoint
-nombre de la empresa se puede pedir tanto como se puede crear un endpoint para obtenerlo
-Cronograma de actividades del periodo (esta es la porción del cronograma individual que corresponde únicamente al periodo reportado)(puede ser una imgen usando el fileupload)
-ACTIVIDADES REALIZADAS DURANTE EL MES DE xxxx xxxx
  -Marco teórico
    -semana
    -tema
    -contenido
    -referecia
-C.	Elementos de Soporte de las actividades realizadas(IMAGENES CON SU LEYENDA(TITULO))



*/

/* todo 
      {
        "estudiante": { "id": 1 },
        "asesor": { "id": 2 },
        "fechaPresentacion": "2025-03-01",
        "periodoInicio": "2025-02-01",
        "periodoFin": "2025-02-28",
        "tipoTrabajo": "Pasantía",
        "empresa": "Empresa XYZ",
        "estado": "Pendiente",
        "marcoTeorico": [
            {
                "semana": "Semana 1",
                "tema": "Introducción a la Empresa",
                "contenido": "Se explica la estructura organizativa...",
                "referencia": "Libro de Administración, 2024"
            },
            {
                "semana": "Semana 2",
                "tema": "Análisis de Procesos",
                "contenido": "Evaluación de flujos de trabajo...",
                "referencia": "Estudio de caso, 2023"
            }
        ],
        "elementosSoporte": [
            {
                "semana": "Semana 1",
                "titulo": "Reglamento de la Empresa",
                "descripcion": "Documento con las normas y políticas.",
                "url": "https://servidor.com/documento1.pdf"
            },
            {
                "semana": "Semana 2",
                "titulo": "Manuales de Procesos",
                "descripcion": "Manuales detallando los procesos internos.",
                "url": "https://servidor.com/documento2.pdf"
            }
        ]
    }
 */
