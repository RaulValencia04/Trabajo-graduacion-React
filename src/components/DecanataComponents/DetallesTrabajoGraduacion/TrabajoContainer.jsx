import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../Auth/Context/AuthContext";
import DetallesTrabajoGraduacion from "./DetallesTrabajoGraduacion";
import { useLocation, useParams } from "react-router-dom";
import { useApi } from "../../Auth/Helpers/api";

const TrabajoContainer = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { token } = state;
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tipoTrabajo = queryParams.get("q");
  const { authFetch } = useApi();

  const [trabajo, setTrabajo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Ahora usamos useCallback para memoizar la función fetchTrabajo.
   * Sus dependencias deben ser todas las variables que se usan adentro.
   */
  const fetchTrabajo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try { 
      let response;

      if (tipoTrabajo === "Pasantía") {
        response = await authFetch(`${API_URL}/api/trabajos/${id}/pasantia`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (tipoTrabajo === "Proyecto" || tipoTrabajo === "Investigación") {
        response = await authFetch(`${API_URL}/api/trabajos/usuario_completo/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        throw new Error("Tipo de trabajo no válido.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener los detalles del trabajo.");
      }

      const data = await response.json();
      setTrabajo(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL,authFetch, token, tipoTrabajo, id]);

  /**
   * Ahora, la dependencia real es `fetchTrabajo`.
   */
  useEffect(() => {
    fetchTrabajo();
  }, [fetchTrabajo]);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;
  if (!trabajo) return <p>No se encontró el trabajo.</p>;

  return <DetallesTrabajoGraduacion trabajo={trabajo} />;
};

export default TrabajoContainer;
