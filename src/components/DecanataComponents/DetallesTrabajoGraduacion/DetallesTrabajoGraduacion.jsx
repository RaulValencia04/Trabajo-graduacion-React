import React from "react";
import DetallesPasantia from "./DetallesPasantia";
import DetallesProyectoOInvestigacion from "./DetallesProyectoOInvestigacion";

const DetallesTrabajoGraduacion = ({ trabajo }) => {
  // Extraer el primer objeto si el trabajo está envuelto
  const trabajoFinal = trabajo[0] ? trabajo[0] : trabajo;

  // Destructuring seguro
  const { tipoTrabajo } = trabajoFinal;

  // Parsear campos JSON si existen
  const parseField = (field) => {
    try {
      return field ? JSON.parse(field) : [];
    } catch (error) {
      console.error(`Error al parsear campo ${field}`, error);
      return [];
    }
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

  console.log("Trabajo parseado:", trabajoParseado);

  if (tipoTrabajo === "Pasantía") {
    return <DetallesPasantia trabajo={trabajoParseado} />;
  } else if (tipoTrabajo === "Proyecto" || tipoTrabajo === "Investigación") {
    return <DetallesProyectoOInvestigacion trabajo={trabajoParseado} />;
  } else {
    console.log(tipoTrabajo);
    return <p>No se reconoce el tipo de trabajo</p>;
  }
};

export default DetallesTrabajoGraduacion;
