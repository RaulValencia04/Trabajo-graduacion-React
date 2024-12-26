// PropuestasAsesoria.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import "./PropuestasAsesoria.css";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Auth/Helpers/api";

const PropuestasAsesoria = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { token, userId } = state;
  const navigate = useNavigate();
  const { authFetch } = useApi();

  const [propuestas, setPropuestas] = useState([]);
  const [error, setError] = useState(null); // Estado para manejar errores

  const fetchPropuestas = useCallback(async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not available');
      }

      const response = await authFetch(`${API_URL}/api/trabajos/asignacion/${userId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al obtener las propuestas");
      }
      const data = await response.json();
      setPropuestas(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Hubo un problema al cargar las propuestas. Por favor, intenta nuevamente más tarde.");
    }
  }, [API_URL, userId, authFetch]);

  useEffect(() => {
    if (state.logged && token && userId) { 
      fetchPropuestas();
    }
  }, [fetchPropuestas, state.logged, token, userId]);

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

  const handleVerPropuesta = (id, tipoTrabajo) => {
    navigate(`/detalle_propuesta/${id}?q=${tipoTrabajo}`);
  };

  return (
    <div className="container">
      <h2 className="title">Trabajos con Usuarios</h2>
      {error && <div className="error-message">{error}</div>} {/* Mostrar mensaje de error si existe */}
      <table className="tabla-propuestas">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Tipo de Trabajo</th>
            <th>Nombre Usuario</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {propuestas.length > 0 ? (
            propuestas.map((propuesta) => (
              <tr
                key={propuesta.id}
                className={
                  propuesta.estadoAsignacion === 'Rechazado' ? 'warning-row' : ''
                }
              >
                <td>{propuesta.id}</td>
                <td>{propuesta.titulo}</td>
                <td>{truncateText(propuesta.descripcion, 75)}</td>
                <td>{propuesta.tipoTrabajo}</td>
                <td>{propuesta.nombreUsuario}</td>
                <td>{propuesta.carrera}</td>
                <td>
                  <button
                    className="btn-ver-detalle"
                    onClick={() =>
                      handleVerPropuesta(propuesta.id, propuesta.tipoTrabajo)
                    }
                  >
                    Ver propuesta completa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No hay propuestas disponibles</td> {/* Ajustar colspan */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PropuestasAsesoria;
