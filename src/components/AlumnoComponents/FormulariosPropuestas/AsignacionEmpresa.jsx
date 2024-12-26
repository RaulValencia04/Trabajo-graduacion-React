import React, { useState } from "react";
import "./FormulariosPropuestas.css";
import {useApi} from "../../Auth/Helpers/api"

const AsignacionEmpresa = () => {
  const { authFetch } = useApi();
  const API_URL = process.env.REACT_APP_API_URL;
 
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    problemaOportunidad: "",
    justificacion: "",
    alcance: "",
    antecedentes: "",
    descripcionEmpresa: "",
  });

  const [objetivos, setObjetivos] = useState([""]);
  const [actores, setActores] = useState([{ nombre: "", rol: "" }]);
  const [actividades, setActividades] = useState([""]);
  const [datosSupervisor, setDatosSupervisor] = useState([{ nombre: "", contacto: "" }]);
  const [asesoresPropuestos, setAsesoresPropuestos] = useState([""]);
  const [cartaAceptacion, setCartaAceptacion] = useState([{ documento: "" }]);

  const [asignacionEmpresa, setAsignacionEmpresa] = useState({
    nombreEmpresa: "",
    contactoEmpresa: "",
    direccionEmpresa: "",
    evaluacion: "aprobada",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAsignacionChange = (e) => {
    const { name, value } = e.target;
    setAsignacionEmpresa({ ...asignacionEmpresa, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tipoTrabajo: "Pasantía",
      estado: "En Progreso",
      objetivos: objetivos.filter((o) => o.trim() !== ""),
      actores: actores.filter((a) => a.nombre.trim() !== "" && a.rol.trim() !== ""),
      actividades: actividades.filter((a) => a.trim() !== ""),
      datosSupervisor: datosSupervisor.filter((d) => d.nombre.trim() !== "" && d.contacto.trim() !== ""),
      asesoresPropuestos: asesoresPropuestos.filter((a) => a.trim() !== ""),
      cartaAceptacion: cartaAceptacion.filter((c) => c.documento.trim() !== ""),
      asignacionEmpresa,
    };

    authFetch(`${API_URL}/api/pasantias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al enviar la información");
        }
        return response.json();
      })
      .then(() => {
        setSuccessMessage("Pasantía y asignación de empresa creadas con éxito.");
        setErrorMessage("");
        resetForm();
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setSuccessMessage("");
      });
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      problemaOportunidad: "",
      justificacion: "",
      alcance: "",
      antecedentes: "",
      descripcionEmpresa: "",
    });
    setObjetivos([""]);
    setActores([{ nombre: "", rol: "" }]);
    setActividades([""]);
    setDatosSupervisor([{ nombre: "", contacto: "" }]);
    setAsesoresPropuestos([""]);
    setCartaAceptacion([{ documento: "" }]);
    setAsignacionEmpresa({
      nombreEmpresa: "",
      contactoEmpresa: "",
      direccionEmpresa: "",
      evaluacion: "aprobada",
    });
  };

  return (
    <div className="form-container">
      <h2>Formulario de Pasantías y Asignación de Empresa</h2>
      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        {/* Campos principales de la pasantía */}
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Problema u Oportunidad</label>
          <textarea
            name="problemaOportunidad"
            value={formData.problemaOportunidad}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Justificación</label>
          <textarea
            name="justificacion"
            value={formData.justificacion}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Alcance</label>
          <textarea
            name="alcance"
            value={formData.alcance}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        {/* Datos de Asignación de Empresa */}
        <div className="form-group">
          <label>Nombre de la Empresa</label>
          <input
            type="text"
            name="nombreEmpresa"
            value={asignacionEmpresa.nombreEmpresa}
            onChange={handleAsignacionChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Contacto de la Empresa</label>
          <input
            type="text"
            name="contactoEmpresa"
            value={asignacionEmpresa.contactoEmpresa}
            onChange={handleAsignacionChange}
          />
        </div>
        <div className="form-group">
          <label>Dirección de la Empresa</label>
          <textarea
            name="direccionEmpresa"
            value={asignacionEmpresa.direccionEmpresa}
            onChange={handleAsignacionChange}
            rows="3"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Evaluación</label>
          <select
            name="evaluacion"
            value={asignacionEmpresa.evaluacion}
            onChange={handleAsignacionChange}
          >
            <option value="aprobada">Aprobada</option>
            <option value="en revisión">En Revisión</option>
            <option value="lista negra">Lista Negra</option>
          </select>
        </div>

        {/* Botón de envío */}
        <button type="submit" className="btn-submit">
          Enviar
        </button>
      </form>
    </div>
  );
};

export default AsignacionEmpresa;

