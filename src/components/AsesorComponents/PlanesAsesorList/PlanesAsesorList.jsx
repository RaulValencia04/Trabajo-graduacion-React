import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Auth/Context/AuthContext";
import { useApi } from "../../Auth/Helpers/api";
import { useNavigate } from "react-router-dom";
import "./PlanesAsesorList.css";

const PlanesAsesorList = () => {
  const { state } = useContext(AuthContext);
  const { userId, token } = state;
  const API_URL = process.env.REACT_APP_API_URL;
  const { authFetch } = useApi();
  const navigate = useNavigate();

  const [planes, setPlanes] = useState([]);
  const [filteredPlanes, setFilteredPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtroValidado, setFiltroValidado] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchPlanes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authFetch(
          `${API_URL}/api/planes-trabajo/asesor/${userId}`,
          { method: "GET" }
        );

        if (!response.ok) {
          throw new Error(`Error al obtener planes (status ${response.status})`);
        }

        const data = await response.json();
        setPlanes(data);
        setFilteredPlanes(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchPlanes();
    }
  }, [API_URL, userId, token, authFetch]);

  
  useEffect(() => {
    let filtrados = planes;

    
    if (filtroValidado !== "Todos") {
      filtrados = filtrados.filter((plan) =>
        filtroValidado === "Sí" ? plan.planValidado : !plan.planValidado
      );
    }

    
    if (filtroTipo !== "Todos") {
      filtrados = filtrados.filter((plan) => plan.planTipo === filtroTipo);
    }

    
    if (busqueda.trim() !== "") {
      const lowerSearch = busqueda.toLowerCase();
      filtrados = filtrados.filter(
        (plan) =>
          plan.planId.toString().includes(lowerSearch) ||
          plan.trabajoId.toString().includes(lowerSearch) ||
          (plan.trabajoTitulo && plan.trabajoTitulo.toLowerCase().includes(lowerSearch)) ||
          (plan.nombreEmpresa && plan.nombreEmpresa.toLowerCase().includes(lowerSearch)) ||
          (plan.planObservaciones && plan.planObservaciones.toLowerCase().includes(lowerSearch))
      );
    }

    setFilteredPlanes(filtrados);
  }, [filtroValidado, filtroTipo, busqueda, planes]);

  const handleVerDetalle = (planId) => {
    navigate(`/lista-planes/detalle/${planId}`);
  };

  const MAX_CHARACTERS = 50;

  if (loading) return <p className="loading-text">Cargando planes...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className="planes-container">
      <h2 className="planes-title">Planes de Trabajo Asignados</h2>

      
      <div className="filtros-container">
        <div className="form-group">
          <label>Filtrar por Validación:</label>
          <select className="form-control" value={filtroValidado} onChange={(e) => setFiltroValidado(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="form-group">
          <label>Filtrar por Tipo de Trabajo:</label>
          <select className="form-control" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Pasantía">Pasantía</option>
            <option value="Proyecto">Proyecto</option>
            <option value="Investigación">Investigación</option>
          </select>
        </div>

        <div className="form-group">
          <label>Buscar:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por ID, título, empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {filteredPlanes.length === 0 ? (
        <p className="no-planes">No se encontraron resultados.</p>
      ) : (
        <table className="planes-table">
          <thead>
            <tr>
              <th>ID Plan</th>
              <th>Trabajo ID</th>
              <th>Tipo Trabajo</th>
              <th>Validado</th>
              <th>Observaciones</th>
              <th>Información Adicional</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlanes.map((plan) => {
              let infoAdicional =
                plan.planTipo === "Pasantía" && plan.nombreEmpresa
                  ? `Empresa: ${plan.nombreEmpresa}`
                  : (plan.planTipo === "Proyecto" || plan.planTipo === "Investigación") && plan.tituloProyecto
                  ? `Título del Proyecto: ${plan.tituloProyecto}`
                  : `Título: ${plan.trabajoTitulo || "N/A"}`;

              const displayInfo =
                infoAdicional.length > MAX_CHARACTERS
                  ? infoAdicional.substring(0, MAX_CHARACTERS) + "..."
                  : infoAdicional;

              return (
                <tr key={plan.planId}>
                  <td>{plan.planId}</td>
                  <td>{plan.trabajoId}</td>
                  <td>{plan.planTipo}</td>
                  <td>{plan.planValidado ? "Sí" : "No"}</td>
                  <td>{plan.planObservaciones || "--"}</td>
                  <td title={infoAdicional} className="info-adicional">
                    {displayInfo}
                  </td>
                  <td>
                    <button className="btn-detalle" onClick={() => handleVerDetalle(plan.planId)}>
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PlanesAsesorList;
