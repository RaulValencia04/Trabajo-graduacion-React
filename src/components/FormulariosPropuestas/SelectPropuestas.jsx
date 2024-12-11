import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Auth/Context/AuthContext";
import UploadProject from "../docs/UploadProject";

export const SelectPropuestas = () => {
  const { state } = useContext(AuthContext);
  const { token, userId } = state;
  const [proyecto, setProyecto] = useState(null); 
  const [cargando, setCargando] = useState(true); 
  const navigate = useNavigate();
  useEffect(() => {
    const verificarProyectoActivo = async () => {
      try {
        setCargando(true);
        const response = await fetch(`http://localhost:8080/api/miembros-trabajo/usuario/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        });

        if (response.status === 200) {
          const data = await response.json();
          setProyecto(data); 
        } else {
          setProyecto(null); 
        }
      } catch (error) {
        console.error("Error al verificar el proyecto:", error);
        setProyecto(null); 
      } finally {
        setCargando(false);
      }
    };

    verificarProyectoActivo();
  }, [userId, token]);

  if (cargando) {
    return <p>Cargando...</p>;
  }

  
  if (proyecto) {
    return (
      <div className="message-container mt-5" >
        <h3>Ya tienes un proyecto activo.</h3>
        <p>No puedes crear un nuevo proyecto mientras este esté activo o en revisión.</p>
        <button onClick={() => navigate("/inicio")}>Volver al inicio</button>
      </div>
    );
  }


  return <UploadProject />;
};
