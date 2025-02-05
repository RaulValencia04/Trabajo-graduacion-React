// src/components/EvaluarPlanTrabajo/EvaluarPlanTrabajoModal.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import { useApi } from "../../../Auth/Helpers/api";
import "./EvaluarPlanTrabajo.css";

Modal.setAppElement("#root");

const EvaluarPlanTrabajoModal = ({ planId }) => {
  const { authFetch } = useApi();
  const API_URL = process.env.REACT_APP_API_URL;

  const [modalOpen, setModalOpen] = useState(false);
  const [validado, setValidado] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState(null);

  const openModal = () => {
    setModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null);
    setValidado(false);
    setObservaciones("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const body = {
        validado,
        observaciones,
      };

      const response = await authFetch(
        `${API_URL}/api/planes-trabajo/${planId}/evaluar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Error al evaluar el plan.");
      }

      alert("Plan de trabajo evaluado correctamente.");
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Botón para abrir el modal */}
      <button className="btn-abrir-modal" onClick={openModal}>
        Evaluar este Plan
      </button>

      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="evaluar-modal-content"
        overlayClassName="evaluar-modal-overlay"
      >
        <div className="evaluar-container">
          <h2 className="evaluar-title">Evaluar Plan (ID: {planId})</h2>
          {error && <p className="evaluar-error">{error}</p>}

          <form onSubmit={handleSubmit} className="evaluar-form">
            
            <div className="switch-wrapper">
              <p className="switch-instructions">
                Desactiva el switch para <strong>Rechazar</strong> el plan,
                o Actívalo para <strong>Aprobar</strong> el plan.
              </p>
              <div className="switch-container">
                <span className="switch-label">Rechazado</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={validado}
                    onChange={(e) => setValidado(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="switch-label">Aprobado</span>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="obsTextarea">
                Observaciones 
              </label>
              <textarea
                id="obsTextarea"
                rows={5}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="textarea-field"
                placeholder="Escribe tus observaciones aquí..."
              />
            </div>

            <div className="buttons-container">
              <button type="submit" className="btn-guardar">
                Guardar Evaluación
              </button>
              <button type="button" className="btn-cerrar" onClick={closeModal}>
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default EvaluarPlanTrabajoModal;
