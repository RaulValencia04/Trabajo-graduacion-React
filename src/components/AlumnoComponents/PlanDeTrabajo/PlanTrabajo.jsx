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
  const [planDetalle, setPlanDetalle] = useState(null);
  const [enRevision, setEnRevision] = useState(false); // Nuevo estado para controlar si está en revisión

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

        // 🚀 Verificar si está en revisión (Sin observaciones y no validado aún)
        if (
          !data.validado &&
          (!data.observaciones || data.observaciones.trim() === "")
        ) {
          setEnRevision(true);
        }
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
          // Si el plan existe y fue rechazado o en revisión, obtenemos los detalles
          await fetchPlanDetalle(planId);
        }

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

          {enRevision ? (
            <div className="alert alert-warning">
              <h4>Tu plan de trabajo está en revisión.</h4>
              <p>
                Tu asesor aún no ha evaluado tu plan. Por favor, espera su
                revisión.
              </p>
            </div>
          ) : planDetalle?.observaciones ? (
            <div>
              {/* Mostrar la alerta de observaciones si existen */}
              <div
                className={`alert ${
                  planValidado ? "alert-success" : "alert-danger"
                }`}
              >
                <h4>Observaciones del Asesor:</h4>
                <p>{planDetalle.observaciones}</p>
              </div>

              {/* Mostrar la alerta de "espera aprobación" solo si el plan NO está validado */}
              {!planValidado && (
                <div className="alert alert-warning">
                  <h6>
                    Nota: si ya realizaste los cambios, solo espera la
                    aprobación de tu asesor.
                  </h6>
                </div>
              )}
            </div>
          ) : null}

          {planValidado ? (
            <div>
              <h4>Ya tienes un plan validado.</h4>
              <p>No es posible editar uno nuevo en este momento.</p>
            </div>
          ) : !enRevision ? (
            <FormulariosPlanesTrabajo
              trabajoId={trabajoEnProgreso.trabajo_id}
              tipoTrabajo={trabajoEnProgreso.tipoTrabajo}
              trabajoData={trabajoEnProgreso}
              planData={planDetalle}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PlanTrabajo;
