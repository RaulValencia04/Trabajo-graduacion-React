// PropuestasSinAprobar.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import './PropuestasSinAprobar.css';
import { AuthContext } from '../../Auth/Context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Auth/Helpers/api";
import { Tooltip } from "react-tooltip"; // Importación nombrada

const PropuestasSinAprobar = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { token } = state;
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const [propuestas, setPropuestas] = useState([]);
  const [error, setError] = useState(null); // Estado para manejar errores

  // Envolvemos fetchPropuestas con useCallback para que no cambie referencia en cada render
  const fetchPropuestas = useCallback(async () => {
    try {
      const response = await authFetch(`${API_URL}/api/trabajos/usuarios`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
  }, [API_URL, token, authFetch]);

  useEffect(() => {
    fetchPropuestas();
  }, [fetchPropuestas]); 

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
    <div className='container'>
      <h2 className='title'>Trabajos con Usuarios</h2>
      {error && <div className="error-message">{error}</div>} 
      <table className='tabla-propuestas'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Tipo de Trabajo</th>
            <th>Nombre Usuario</th>
            <th>Carrera</th>
            <th>Estado Asignación</th> {/* Nueva Columna */}
            <th>Motivo Rechazo</th> {/* Nueva Columna Opcional */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {propuestas.length > 0 ? (
            propuestas.map((propuesta) => (
              <tr
                key={propuesta.id}
                className={
                  propuesta.estadoAsignacion && propuesta.estadoAsignacion.trim().toLowerCase() === 'rechazado' ? 'warning-row' : ''
                }
              >
                <td>{propuesta.id}</td>
                <td>{propuesta.titulo}</td>
                <td>{truncateText(propuesta.descripcion, 75)}</td>
                <td>{propuesta.tipoTrabajo}</td>
                <td>{propuesta.nombreUsuario}</td>
                <td>{propuesta.carrera}</td>
                <td>{propuesta.estadoAsignacion}</td> {/* Nueva Columna */}
                <td>
                  {propuesta.estadoAsignacion && propuesta.estadoAsignacion.trim().toLowerCase() === 'rechazado' ? (
                    <>
                      <span
                        data-tooltip-id={`motivo-${propuesta.id}`}
                        data-tooltip-content={propuesta.comentariosAsesor}
                        className="motivo-rechazo"
                      >
                        {truncateText(propuesta.comentariosAsesor, 30)}
                      </span>
                      <Tooltip id={`motivo-${propuesta.id}`} place="top" effect="solid" />
                    </>
                  ) : (
                    '-'
                  )}
                </td> {/* Nueva Columna Opcional */}
                <td>
                  <button 
                    className='btn-ver-detalle' 
                    onClick={() => handleVerPropuesta(propuesta.id, propuesta.tipoTrabajo)}
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

export default PropuestasSinAprobar;
