import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useParams } from 'react-router-dom';
import DetallesTrabajoGraduacion from './DetallesTrabajoGraduacion';

const TrabajoContainer = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { token } = state;
  const { id } = useParams(); 

  const [trabajo, setTrabajo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrabajo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trabajos/usuario_completo/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los detalles del trabajo");
      }

      const data = await response.json();
      console.log(data);
      setTrabajo(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del trabajo.");
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
