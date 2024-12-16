import React, { useState, useEffect, useContext } from "react";
import { useDebounce } from "use-debounce";
import "./EvaluarTrabajo.css";
import { AuthContext } from "../../Auth/Context/AuthContext";

const EvaluarTrabajo = ({ trabajoId }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [usuarios, setUsuarios] = useState([]);
  const [asesorSeleccionado, setAsesorSeleccionado] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [decision, setDecision] = useState(false); // false => Rechazar, true => Aprobar
  const [comentarios, setComentarios] = useState("");

  const { state } = useContext(AuthContext);
  const { token, userId, role } = state; // Role puede ser 'decano' o 'asesor'
  const evaluadoPorId = userId;

  useEffect(() => {
    if (!trabajoId) {
      console.warn("trabajoId no está definido.");
    }
  }, [trabajoId]);

  // Llamada a la API para buscar asesores (solo para decano)
  const buscarUsuarios = async () => {
    if (!debouncedQuery.trim()) {
      setUsuarios([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
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
      setUsuarios(data);
    } catch (error) {
      setError("Error al buscar asesores. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "decano") {
      buscarUsuarios();
    }
  }, [debouncedQuery]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleEnviar = async () => {
    if (role === "decano" && decision && !asesorSeleccionado) {
      alert("Debes seleccionar un asesor antes de aprobar la propuesta.");
      return;
    }

    try {
      const actualizarResponse = await fetch(
        `${API_URL}/api/trabajos/${trabajoId}/actualizar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            estado: decision ? "En Progreso" : "Rechazado",
            comentarios,
            evaluadoPorId,
          }),
        }
      );

      if (!actualizarResponse.ok) {
        throw new Error("Error al actualizar el trabajo");
      }

      if (role === "decano" && decision && asesorSeleccionado) {
        const asignarResponse = await fetch(
          `${API_URL}/api/asignaciones?trabajoId=${trabajoId}&asesorId=${asesorSeleccionado.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!asignarResponse.ok) {
          const errorData = await asignarResponse.json();
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          throw new Error("Error al asignar el asesor");
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

  const handleQuitarAsesor = () => {
    setAsesorSeleccionado(null);
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
              <button className="action-button btn-dos">
                Descargar Documento
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

            {role === "decano" && decision && (
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
                    {usuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        className={`user-card ${
                          asesorSeleccionado?.id === usuario.id ? "selected" : ""
                        }`}
                        onClick={() => setAsesorSeleccionado(usuario)}
                      >
                        <p>
                          <strong>{usuario.nombreUsuario}</strong>
                        </p>
                        <p>{usuario.correo}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="action-button btn-success"
                onClick={handleEnviar}
              >
                Enviar
              </button>
              <button className="action-button btn-danger" onClick={toggleModal}>
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
