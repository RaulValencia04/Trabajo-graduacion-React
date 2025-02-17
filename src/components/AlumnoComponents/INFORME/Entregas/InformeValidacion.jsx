import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../Auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../Auth/Helpers/api";
import Entregas from "./Entregas";

export const InformeValidacion = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const { state } = useContext(AuthContext);
  const { userId } = state;
  
  const [datap, setDatap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validar = async () => {
      try {
        const response = await authFetch(`${API_URL}/api/trabajos/usuario/${userId}/trabajo-id-y-tipo`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Error al intentar cargar los datos. Intente más tarde.");
        }

        const data = await response.json();  
        console.log("Datos recibidos:", data);
        setDatap(data);
      } catch (err) {
        console.error("Error en la carga de datos:", err);
        setError(err.message);
      }
    };

    validar();
  }, [API_URL, authFetch,userId]);

  if (error) {
    return (
      <div className="error-container mt-5">
        <h3>Ocurrió un error</h3>
        <p>{error}</p>
        <button onClick={() => navigate("/inicio")}>Volver al inicio</button>
      </div>
    );
  }

  if (!datap) {
    return <p className="loading-message">Cargando datos...</p>;
  }

  return <Entregas tipoTrabajo={datap.tipoTrabajo} trabajoId={datap.trabajoId} usuarioId={userId} />;
};
