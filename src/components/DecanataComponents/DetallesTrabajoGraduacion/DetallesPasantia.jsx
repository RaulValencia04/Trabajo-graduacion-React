import React from 'react';

const DetallesPasantia = ({ trabajo }) => {
  const { titulo, descripcion, tipoTrabajo, pasantia, miembrosTrabajo = [] } = trabajo;

  return (
    <div>
      <h2>Detalles de la Pasantía</h2>
      <h3>{titulo}</h3>
      <p><strong>Descripción:</strong> {descripcion}</p>
      <p><strong>Tipo de Trabajo:</strong> {tipoTrabajo}</p>

      {pasantia && (
        <div>
          <h4>Información de la Pasantía</h4>
          <p><strong>Antecedentes de la Institución:</strong> {pasantia.antecedentes_institucion}</p>
          <p><strong>Descripción de la Empresa:</strong> {pasantia.descripcion_empresa}</p>
          {/* Agrega más campos específicos de pasantía según tu entidad */}
        </div>
      )}

      {miembrosTrabajo.length > 0 && (
        <div>
          <h4>Miembros del Trabajo</h4>
          <ul>
            {miembrosTrabajo.map((miembro) => (
              <li key={miembro.id}>
                {miembro.usuario.nombreUsuario} - {miembro.usuario.correo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetallesPasantia;
