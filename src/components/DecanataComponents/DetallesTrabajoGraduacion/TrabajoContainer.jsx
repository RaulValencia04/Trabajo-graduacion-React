import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Auth/Context/AuthContext";
import DetallesTrabajoGraduacion from "./DetallesTrabajoGraduacion";
import { useLocation, useParams } from "react-router-dom";

const TrabajoContainer = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { token } = state;
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tipoTrabajo = queryParams.get("q");

  const [trabajo, setTrabajo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrabajo = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (tipoTrabajo === "Pasantía") {
        response = await fetch(`${API_URL}/api/trabajos/${id}/pasantia`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (tipoTrabajo === "Proyecto" || tipoTrabajo === "Investigación") {
        response = await fetch(`${API_URL}/api/trabajos/usuario_completo/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {

        console.log(tipoTrabajo);
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
  };

  useEffect(() => {
    fetchTrabajo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;
  if (!trabajo) return <p>No se encontró el trabajo.</p>;

  return <DetallesTrabajoGraduacion trabajo={trabajo} />;
};

export default TrabajoContainer;
