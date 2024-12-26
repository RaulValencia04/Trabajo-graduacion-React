import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDebounce } from "use-debounce";
import "./EvaluarTrabajo.css";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useApi } from "../../Auth/Helpers/api";

const EvaluarTrabajo = ({ trabajoId }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { authFetch } = useApi();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [usuarios, setUsuarios] = useState([]);
  const [asesorSeleccionado, setAsesorSeleccionado] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [decision, setDecision] = useState(false);
  const [comentarios, setComentarios] = useState("");

  const { state } = useContext(AuthContext);
  const { token, userId, role, email} = state;
  const evaluadoPorId = userId;

  useEffect(() => {
    if (!trabajoId) {
      console.warn("trabajoId no está definido.");
    }
  }, [trabajoId]);

  const buscarUsuarios = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setUsuarios([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(
        `${API_URL}/api/usuarios/asesores?q=${debouncedQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al buscar usuarios");

      const data = await response.json();
      setUsuarios(data); // Se asume que data es un array de objetos { asesor, totalProyectosEnProceso }
    } catch (error) {
      setError("Error al buscar asesores. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, debouncedQuery, authFetch]);

  useEffect(() => {
    if (role === "Decano") {
      buscarUsuarios();
    }
  }, [role, buscarUsuarios]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleEnviar = async () => {
    if (role === "Decano" && decision && !asesorSeleccionado) {
      alert("Debes seleccionar un asesor antes de aprobar la propuesta.");
      return;
    }

    try {
      if (role === "Decano") {
        const actualizarResponse = await authFetch(
          `${API_URL}/api/trabajos/${trabajoId}/actualizar`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              estado: decision ? "En espera asesor" : "Rechazado",
              comentarios,
              evaluadoPorId,
            }),
          }
        );

        if (!actualizarResponse.ok) {
          throw new Error("Error al actualizar el trabajo");
        }
      }

      if (role === "Decano" && decision && asesorSeleccionado) {
        const asignarResponse = await authFetch(
          `${API_URL}/api/asignaciones?trabajoId=${trabajoId}&asesorId=${asesorSeleccionado.asesor.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      
        if (!asignarResponse.ok) {
          throw new Error("Error al asignar el asesor");
        }
      
        setModalOpen(false);
      }
      
      if (role === "Asesor") {
        if (decision) {
          console.log("uno");
          const responseAsesor = await authFetch(
            `${API_URL}/api/trabajos/${trabajoId}/evaluar`, 
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                estado: "En Progreso", 
                comentariosAsesor: comentarios, 
              }),
            }
          );
          const responseActAsig = await authFetch(
            `${API_URL}/api/asignaciones/trabajo/${trabajoId}/estado?nuevoEstado=Aceptado`,
            {
              method: "PATCH", // Cambiado a PATCH para coincidir con el método del servidor
     
            }
          ); 
          if (!responseActAsig.ok) {
            console.error("Error al actualizar el estado de la asignación.");
            return;
          }
          
          if (!responseAsesor.ok) {
            console.error("Error al actualizar comentarios del asesor.");
            return;
          }
        } else {
          console.log("dos")
        
          
          const responseActAsig = await authFetch(
            `${API_URL}/api/asignaciones/trabajo/${trabajoId}/estado?nuevoEstado=Rechazado`,
            {
              method: "PATCH",
            }
          );  
          const responseComen = await authFetch(`${API_URL}/api/trabajos/${trabajoId}/actualizarComentAsesor`,{

            method:"PUT",
            body: JSON.stringify({
              comentariosAsesor: `${comentarios} - ${email}`,
            })
          })   
          if (!responseComen.ok) {
            console.error("Error al actualizar el Comentario de la asignación.");
            return;
          }
      
          if (!responseActAsig.ok) {
            console.error("Error al actualizar el estado de la asignación.");
            return;
          }
        }
      }
      
      alert("Trabajo actualizado exitosamente.");
      setModalOpen(false);
      setDecision(false);
      setComentarios("");
      setAsesorSeleccionado(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="evaluar-trabajo-container">
      <div className="custom-accordion">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <span>Evaluar Trabajo</span>
          </h2>
          <div className="accordion-body">
            <div className="actions">
              <button className="action-button" onClick={toggleModal}>
                Evaluar Propuesta
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content animate-modal">
            <h3>Evaluar Propuesta</h3>

            <textarea
              rows="5"
              placeholder="Escribe tus comentarios aquí..."
              className="evaluar-textarea"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            ></textarea>

            <div className="switch-container">
              <span>Rechazar</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={decision}
                  onChange={() => setDecision(!decision)}
                />
                <span className="slider"></span>
              </label>
              <span>Aprobar</span>
            </div>

            {role === "Decano" && decision && (
              <>
                <div className="selected-asesor">
                  {asesorSeleccionado ? (
                    <div>
                      <h5>Asesor Seleccionado:</h5>
                      <p>
                        <strong>
                          {asesorSeleccionado.asesor.nombreUsuario}
                        </strong>
                      </p>
                      <p>{asesorSeleccionado.asesor.correo}</p>
                      <button
                        className="action-button btn-danger btn-remove"
                        onClick={() => setAsesorSeleccionado(null)}
                      >
                        Quitar Asesor
                      </button>
                    </div>
                  ) : (
                    <p>No se ha seleccionado un asesor aún.</p>
                  )}
                </div>

                <div className="search-container">
                  <label htmlFor="searchAsesor" className="search-label">
                    Buscar Asesor:
                  </label>
                  <input
                    type="text"
                    id="searchAsesor"
                    placeholder="Escribe para buscar asesores..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                  />
                  {loading ? (
                    <p>Cargando asesores...</p>
                  ) : error ? (
                    <p className="error">{error}</p>
                  ) : (
                    <div className="user-list">
                      {usuarios.map(({ asesor, totalProyectosEnProceso,totalProyectosEnEspera}) => (
                        <div
                          key={asesor.id}
                          className={`user-card ${
                            asesorSeleccionado?.asesor?.id === asesor.id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setAsesorSeleccionado({
                              asesor,
                              totalProyectosEnProceso,
                            });
                            setQuery(""); // Limpia el input después de seleccionar un asesor
                          }}
                        >
                          <p className="user-name">
                            {asesor.nombreUsuario}{" "}
                            Proyectos
                            <span className="project-count">
                              ({totalProyectosEnProceso || 0} Activos )
                            </span>
                            <br />
                            <span className="project-count">
                              ({totalProyectosEnEspera || 0} Pendientes Respuesta )
                            </span>
                          </p>
                          <p className="user-email">{asesor.correo}</p>
                          <p className="user-career">{asesor.carrera}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="modal-actions">
              <button
                className="action-button btn-success"
                onClick={handleEnviar}
              >
                Enviar
              </button>
              <button
                className="action-button btn-danger"
                onClick={toggleModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluarTrabajo;
