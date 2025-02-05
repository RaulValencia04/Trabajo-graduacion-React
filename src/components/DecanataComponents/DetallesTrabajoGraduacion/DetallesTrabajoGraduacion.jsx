import React from "react";
import DetallesPasantia from "./DetallesPasantia";
import DetallesProyectoOInvestigacion from "./DetallesProyectoOInvestigacion";

const DetallesTrabajoGraduacion = ({ trabajo }) => {
  // Extraer el primer objeto si el trabajo está envuelto
  const trabajoFinal = trabajo[0] ? trabajo[0] : trabajo;

  // Destructuring seguro
  const { tipoTrabajo } = trabajoFinal;

// En DetallesTrabajoGraduacion.js
const parseField = (field) => {
  // 1. Si ya es un array, devuélvelo
  if (Array.isArray(field)) {
    return field;
  }

  // 2. Si es string, intenta parsear
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.error("Error al parsear campo JSON:", field, error);
      return []; // Devuelve array vacío si falla
    }
  }

  // 3. Si es null, undefined, objeto, etc.
  return field || [];
};


  // Campos específicos que requieren parseo
  const actividades = parseField(trabajoFinal.actividades);
  const asesoresPropuestos = parseField(trabajoFinal.asesoresPropuestos);
  const cartaAceptacion = parseField(trabajoFinal.cartaAceptacion);
  const supervisor = trabajoFinal.supervisor
    ? JSON.parse(trabajoFinal.supervisor)
    : {};

  const trabajoParseado = {
    ...trabajoFinal,
    actividades,
    asesoresPropuestos,
    cartaAceptacion,
    supervisor,
  };

 

  if (tipoTrabajo === "Pasantía") {
    return <DetallesPasantia trabajo={trabajoParseado} />;
  } else if (tipoTrabajo === "Proyecto" || tipoTrabajo === "Investigación") {
    return <DetallesProyectoOInvestigacion trabajo={trabajoParseado} />;
  } else {
    
    return <p>No se reconoce el tipo de trabajo</p>;
  }
};

export default DetallesTrabajoGraduacion;
