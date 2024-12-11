import React from 'react';
import DetallesPasantia from './DetallesPasantia';
import DetallesProyectoOInvestigacion from './DetallesProyectoOInvestigacion';

const DetallesTrabajoGraduacion = ({ trabajo }) => {
  const { tipoTrabajo } = trabajo;

  if (tipoTrabajo === 'Pasantía') {
    return <DetallesPasantia trabajo={trabajo} />;
  } else if (tipoTrabajo === 'Proyecto' || tipoTrabajo === 'Investigación') {
    return <DetallesProyectoOInvestigacion trabajo={trabajo} />;
  } else {
    return <p>No se reconoce el tipo de trabajo</p>;
  }
};

export default DetallesTrabajoGraduacion;
