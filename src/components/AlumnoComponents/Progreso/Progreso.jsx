import React, { useState, useEffect } from "react";
import "./Progreso.css";
import { FaCheckCircle, FaTimesCircle, FaCircle } from "react-icons/fa";

const Step = ({ title, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "Aprobada":
        return <FaCheckCircle className="icon success" />;
      case "Rechazada":
        return <FaTimesCircle className="icon error" />;
      default:
        return <FaCircle className="icon pending" />;
    }
  };

  return (
    <div className="step">
      {getStatusIcon()}
      <span className="step-title">{title}</span>
      <span className={`step-status ${status.toLowerCase()}`}>{status}</span>
    </div>
  );
};

const Progreso = () => {
  const [states, setStates] = useState({
    propuesta: "Vacío",
    planTrabajo: "Vacío",
    avance1: "Vacío",
    avance2: "Vacío",
    avance3: "Vacío",
    avance4: "Vacío",
    avance5: "Vacío",
    entregaFinal: "Vacío",
  });

  const fetchStatus = async (key, endpoint) => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Error al obtener el estado");
      const data = await response.json();
      setStates((prev) => ({ ...prev, [key]: data.status || "Vacío" }));
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
    }
  };

  useEffect(() => {
    fetchStatus("propuesta", "/api/propuesta/estado");
    fetchStatus("planTrabajo", "/api/plan-trabajo/estado");
    fetchStatus("avance1", "/api/avance/1/estado");
    fetchStatus("avance2", "/api/avance/2/estado");
    fetchStatus("avance3", "/api/avance/3/estado");
    fetchStatus("avance4", "/api/avance/4/estado");
    fetchStatus("avance5", "/api/avance/5/estado");
    fetchStatus("entregaFinal", "/api/entrega-final/estado");
  }, []);

  return (
    <div className="progreso-container">
      <h2>Progreso de la Propuesta</h2>
      <div className="steps">
        <Step title="Propuesta" status={states.propuesta} />
        <Step title="Plan de Trabajo" status={states.planTrabajo} />
        <Step title="Avance 1" status={states.avance1} />
        <Step title="Avance 2" status={states.avance2} />
        <Step title="Avance 3" status={states.avance3} />
        <Step title="Avance 4" status={states.avance4} />
        <Step title="Avance 5" status={states.avance5} />
        <Step title="Entrega Final" status={states.entregaFinal} />
      </div>
    </div>
  );
};

export default Progreso;
