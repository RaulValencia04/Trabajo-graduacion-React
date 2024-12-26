import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Auth/Context/AuthContext";
import UploadProject from "../../docs/UploadProject";
import { useApi } from "../../Auth/Helpers/api";

export const SelectPropuestas = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [proyecto, setProyecto] = useState(null); // Estado del proyecto activo
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error
  const { authFetch } = useApi();
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const { token, userId } = state;

  useEffect(() => {
    const verificarProyectoActivo = async () => {
      
      try {
        const response = await authFetch(
          `${API_URL}/api/miembros-trabajo/usuario/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProyecto(data); // Proyecto encontrado
        } else {
          setProyecto(null); // No hay proyecto activo
          setError("No se pudo verificar el estado del proyecto."); // Error específico
        }
      } catch (error) {
        console.error("Error al verificar el proyecto:", error.message);
        setError("Ocurrió un error al intentar verificar el estado del proyecto.");
      } finally {
        setIsLoading(false); // Finaliza la carga
      }
    };

    verificarProyectoActivo();
  }, [API_URL, authFetch, userId, token]);

  // Si está cargando
  if (isLoading) {
    return (
      <div className="loading-container mt-5">
        <h3>Cargando...</h3>
        <p>Por favor, espera mientras verificamos el estado de tu proyecto.</p>
      </div>
    );
  }

  // Si ocurre un error
  if (error) {
    return (
      <div className="error-container mt-5">
        <h3>Ocurrió un error</h3>
        <p>{error}</p>
        <button onClick={() => navigate("/inicio")}>Volver al inicio</button>
      </div>
    );
  }

  // Si ya existe un proyecto activo
  if (proyecto) {
    return (
      <div className="message-container mt-5">
        <h3>Ya tienes un proyecto activo.</h3>
        <p>No puedes crear un nuevo proyecto mientras este esté activo o en revisión.</p>
        <button onClick={() => navigate("/inicio")}>Volver al inicio</button>
      </div>
    );
  }

  // Si no hay proyecto activo y no hay errores, muestra el componente UploadProject
  return <UploadProject />;
};

export default SelectPropuestas;
