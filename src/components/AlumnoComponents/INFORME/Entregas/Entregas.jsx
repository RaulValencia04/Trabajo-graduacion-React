import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Entregas.css";
import { useApi } from "../../../Auth/Helpers/api";

const API_URL = process.env.REACT_APP_API_URL;

const Entregas = ({ tipoTrabajo, trabajoId, usuarioId }) => {
  const { authFetch } = useApi();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  // const [fechaPrimeraEntrega, setFechaPrimeraEntrega] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [errorMessage, setErrorMessage] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [proximaEntrega, setProximaEntrega] = useState(null);

  const fetchFechaPrimeraEntrega = useCallback(() => {
    authFetch(`${API_URL}/api/planes-trabajo/usuario/${usuarioId}/fechas`, {
      method: "GET",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Error al obtener fechas");
  
        const text = await response.text();
        if (!text) return; 
  
        try {
          const data = JSON.parse(text);
          if (data?.length > 0 && data[0]?.fechas_reportes) {
            const fechas = JSON.parse(data[0].fechas_reportes);
            if (Array.isArray(fechas) && fechas.length > 0) {
              const hoy = new Date(); 
  
              const hoyUTC = new Date(
                Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
              );
  
              const fechasOrdenadas = fechas
                .map(dateStr => new Date(dateStr)) 
                .filter(date => !isNaN(date.getTime())) 
                .sort((a, b) => a - b); 
  
              console.log("Fechas ordenadas:", fechasOrdenadas);
              console.log("Hoy (UTC):", hoyUTC);
  
              const siguienteFecha = fechasOrdenadas.find(date => date >= hoyUTC);
  
              console.log("Siguiente fecha:", siguienteFecha);
  
              if (siguienteFecha) {
                setProximaEntrega(
                  `${siguienteFecha.getUTCDate()}/${siguienteFecha.getUTCMonth() + 1}/${siguienteFecha.getUTCFullYear()}`
                );
              } else {
                console.log("No hay fechas futuras disponibles.");
              }
            }
          }
        } catch (error) {
          console.error("Error parseando fechas:", error);
        }
      })
      .catch((error) => console.error("Error obteniendo fechas:", error));
  }, [authFetch, usuarioId]);
  
  

  const fetchMessages = useCallback(() => {
    authFetch(`${API_URL}/api/informe_mensual/estudiante/${usuarioId}`, {
      method: "GET",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Error al cargar las entregas");

        const text = await response.text();
        if (!text) return [];

        try {
          return JSON.parse(text);
        } catch (error) {
          console.error("Error parseando JSON:", error);
          return [];
        }
      })
      .then(setMessages)
      .catch((error) => console.error("Error obteniendo entregas:", error));
  }, [authFetch, usuarioId]);

  useEffect(() => {
    fetchMessages();
    fetchFechaPrimeraEntrega();
  }, [fetchMessages, fetchFechaPrimeraEntrega]);

  const handleUploadClick = () => {
    if (messages.length > 0) {
      const ultimaEntrega = messages[messages.length - 1];

      if (ultimaEntrega.estado === "Pendiente") {
        setModalMessage(
          `Su última entrega aún no ha sido evaluada. El asesor tiene hasta 10 días para revisarla desde que usted realizo la entrega. 
          Si tiene alguna consulta, puede comunicarse con su asesor a través del correo: 
          ${ultimaEntrega.asesor?.correo || "No disponible"}.`
        );
        setShowModal(true);
        return;
      }

      if (ultimaEntrega.estado === "Rechazado") {
        setModalMessage(
          `Debe corregir su última entrega antes de enviar una nueva. 
          Ingrese a la entrega anterior, realice los cambios solicitados y vuelva a enviarla.`
        );
        setShowModal(true);
        return;
      }
    }

    const ruta =
      tipoTrabajo === "Pasantía"
        ? `/formulario-informe-pasantia?trabajo=${trabajoId}&tipo=${tipoTrabajo}`
        : `/formulario-informe-proyecto?trabajo=${trabajoId}&tipo=${tipoTrabajo}`;

    navigate(ruta);
  };

  return (
    <div className="entregas-container">
      <h2 className="title">Seguimiento de Proyecto</h2>
      <div className="next-delivery">
        <h3>Próxima Entrega de Avance</h3>
        {proximaEntrega ? (
          <p>
            <strong>Fecha:</strong> {proximaEntrega}
          </p>
        ) : (
          <p>No hay fechas próximas definidas.</p>
        )}
      </div>

      {/* {errorMessage && <p className="error-message">{errorMessage}</p>} */}

      {/* Mostrar entregas previas si existen */}
      {/* Mostrar entregas previas si existen */}
      {messages.length > 0 ? (
        <>
          <h3>Entregas Realizadas</h3>
          <div className="messages-list">
            {messages.map((msg, index) => {
              const titulo =
                [
                  "Primer Informe",
                  "Segundo Informe",
                  "Tercer Informe",
                  "Cuarto Informe",
                  "Quinto Informe",
                ][index] || `Entrega ${index + 1}`;
              return (
                <div key={msg.id} className="message-item">
                  <div className="message-header">
                    <h3>{titulo}</h3>
                  </div>
                  <div className="message-meta">
                    <p>
                      <strong>Fecha de Presentación:</strong>{" "}
                      {msg.fechaPresentacion
                        ? `${msg.fechaPresentacion[2]}/${msg.fechaPresentacion[1]}/${msg.fechaPresentacion[0]}`
                        : "No disponible"}
                    </p>
                    <p>
                      <strong>Estado:</strong> {msg.estado || "No definido"}
                    </p>
                    <p>
                      <strong>Período de Inicio:</strong>{" "}
                      {msg.periodoInicio
                        ? `${msg.periodoInicio[2]}/${msg.periodoInicio[1]}/${msg.periodoInicio[0]}`
                        : "No especificado"}
                    </p>
                    <p>
                      <strong>Período de Fin:</strong>{" "}
                      {msg.periodoFin
                        ? `${msg.periodoFin[2]}/${msg.periodoFin[1]}/${msg.periodoFin[0]}`
                        : "No especificado"}
                    </p>
                  </div>
                  {msg.file && (
                    <p>
                      <a href={`${API_URL}/uploads/${msg.file}`} download>
                        Descargar archivo
                      </a>
                    </p>
                  )}
                  {msg.estado === "Rechazado" && (
                    <button className="btn-warning">Corregir</button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // Si no hay entregas, mostrar la opción de la primera entrega como un message-item
        <div className="message-item first-delivery">
          <div className="message-header">
            <h3>Primer Informe</h3>
            <div className="message-meta">
              <p>
                <strong>Fecha límite:</strong> {modalMessage || "Por definir"}
              </p>
            </div>
          </div>
          <p>
            No se ha registrado ninguna entrega aún. Envíe su primer informe
            para comenzar.
          </p>
          <button onClick={handleUploadClick} className="primary-button">
            Enviar Primer Informe
          </button>
        </div>
      )}

      {/* Sección para subir la siguiente entrega */}
      <div className="next-delivery">
        <h3>Subir Nueva Entrega</h3>
        <button onClick={handleUploadClick} className="primary-button">
          Subir Siguiente Entrega
        </button>
      </div>

      {/* Modal de advertencia */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button
              className="close-button"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entregas;
