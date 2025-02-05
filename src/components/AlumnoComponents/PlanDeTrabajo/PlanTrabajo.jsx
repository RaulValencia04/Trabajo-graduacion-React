import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useApi } from "../../Auth/Helpers/api";
import FormulariosPlanesTrabajo from "./FormulariosPlanesTrabajo";
import Modal from "react-modal";

Modal.setAppElement("#root");

export const PlanTrabajo = () => {
  const { state } = useContext(AuthContext);
  const { userId, token } = state;
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authFetch } = useApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trabajoEnProgreso, setTrabajoEnProgreso] = useState(null);
  const [planValidado, setPlanValidado] = useState(false);
  // const [modalOpen, setModalOpen] = useState(false);
  const [planDetalle, setPlanDetalle] = useState(null);

  /**
   * 🚀 Función para obtener detalles del plan de trabajo si ya existe.
   * Se usa `useCallback` para evitar cambios innecesarios en `useEffect`.
   */
  const fetchPlanDetalle = useCallback(
    async (planId) => {
      try {
        const response = await authFetch(
          `${API_URL}/api/planes-trabajo/${planId}/detalle`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok)
          throw new Error(
            `Error al obtener detalles del plan (status ${response.status}).`
          );

        const data = await response.json();
        setPlanDetalle(data);
      } catch (err) {
        console.error("Error al cargar los detalles del plan:", err.message);
      }
    },
    [API_URL, token, authFetch]
  );


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const respTrabajo = await authFetch(
          `${API_URL}/api/trabajos/usuario/${userId}/trabajo-id-y-tipo`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!respTrabajo.ok) {
          throw new Error(
            respTrabajo.status === 404
              ? "No tienes un proyecto en 'En Progreso'."
              : `Error al buscar el trabajo (status ${respTrabajo.status}).`
          );
        }

        const data = await respTrabajo.json();
        const { trabajoId, tipoTrabajo } = data;

        // 🚀 Validación del estado del plan
        const respEstadoPlan = await authFetch(
          `${API_URL}/api/planes-trabajo/trabajo/${trabajoId}/estado-plan`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!respEstadoPlan.ok)
          throw new Error(
            `Error al verificar estado del plan (status ${respEstadoPlan.status}).`
          );
        const { existe, planId } = await respEstadoPlan.json();

        if (existe) {
          // Si el plan existe y fue rechazado, obtenemos los detalles
          await fetchPlanDetalle(planId);
        }

        // 🚀 Verificar si el plan ya está validado
        const respPlan = await authFetch(
          `${API_URL}/api/planes-trabajo/trabajo/${trabajoId}/validado`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const planVal = respPlan.ok ? await respPlan.json() : false;
        setTrabajoEnProgreso({ trabajo_id: trabajoId, tipoTrabajo });
        setPlanValidado(planVal);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchData();
    } else {
      setLoading(false);
      setError("No hay usuario o token disponible en el contexto.");
    }
  }, [API_URL, userId, token, authFetch, fetchPlanDetalle]);

  return (
    <div className="plan-trabajo-container">
      {loading ? (
        <div className="loading-container">
          <h3>Cargando...</h3>
          <p>Por favor, espera mientras verificamos tu trabajo.</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h3>¡Ops!</h3>
          <p>{error}</p>
          <button onClick={() => navigate("/inicio")}>Volver al inicio</button>
        </div>
      ) : !trabajoEnProgreso ? (
        <div className="message-container">
          <h3>No tienes un trabajo en estado 'En Progreso'.</h3>
          <p>Necesitas un trabajo activo para crear/ver el plan.</p>
          <button onClick={() => navigate("/inicio")}>Volver al inicio</button>
        </div>
      ) : (
        <div>
          <h2>Plan de Trabajo</h2>
        

          {planDetalle?.observaciones && (
            <div className={`alert ${planValidado ? "alert-success" : "alert-danger"}`}>
              <h4>Observaciones del Asesor:</h4>
              <p>{planDetalle.observaciones}</p>
            </div>
          )}


          {planValidado ? (
            <div>
              <h4>Ya tienes un plan validado.</h4>
              <p>No es posible editar uno nuevo en este momento.</p>
            </div>
          ) : (
            <FormulariosPlanesTrabajo
              trabajoId={trabajoEnProgreso.trabajo_id}
              tipoTrabajo={trabajoEnProgreso.tipoTrabajo}
              trabajoData={trabajoEnProgreso}
              planData={planDetalle}
            />
          )}
          
        </div>
      )}
    </div>
  );
};

export default PlanTrabajo;
