import React, { useState, useEffect, useContext } from 'react';
import './PropuestasSinAprobar.css';
import { AuthContext } from '../../Auth/Context/AuthContext';
import { useNavigate } from "react-router-dom";

const PropuestasSinAprobar = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { token } = state;
  const navigate = useNavigate();

  const [propuestas, setPropuestas] = useState([]);

  const fetchPropuestas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trabajos/usuarios`, {
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
    }
  };

  useEffect(() => {
    fetchPropuestas();
  }, []);

  const truncateText = (text, maxLength) => {
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
      <table className='tabla-propuestas'>
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
          {propuestas.map((propuesta) => (
            <tr key={propuesta.id}>
              <td>{propuesta.id}</td>
              <td>{propuesta.titulo}</td>
              <td>{truncateText(propuesta.descripcion, 75)}</td>
              <td>{propuesta.tipoTrabajo}</td>
              <td>{propuesta.nombreUsuario}</td>
              <td>{propuesta.carrera}</td>
              <td>
                <button 
                  className='btn-ver-detalle' 
                  onClick={() => handleVerPropuesta(propuesta.id, propuesta.tipoTrabajo)}
                >
                  Ver propuesta completa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropuestasSinAprobar;
