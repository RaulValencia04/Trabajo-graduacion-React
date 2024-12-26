// App.js
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./Auth/Context/AuthContext";
import PrivateRoute from "./Auth/Context/PrivateRoute";
import PublicRoute from "./Auth/Context/PublicRoute";

// Component imports
import Login from "./Auth/Login";
import RegistroUsuario from "./Registro/RegistroUsuario";
import Sidebar from "./SideBar/Sidebar";
import Dashboard from "./Dashboard/Dashboard";
import Entregas from "./Entregas/Entregas";
import Usuario from "./usuario/Usuario";
import FormularioCrearUsuario from "./usuario/FormularioCrearUsuario";
import PropuestasSinAprobar from "./DecanataComponents/AprobarPropuesta/PropuestasSinAprobar";
// import ProyectosAceptados from "./ProyectosAceptados/ProyectosAceptados";
import AuditoriaList from "./AuditoriaList/AuditoriaList";
import AlumnosActivos from "./DecanataComponents/AlumnosActivos/AlumnosActivos";
import EntregasAprobadas from "./EntregasAprobadas/EntregasAprobadas";
import FormulariosPasantia from "./AlumnoComponents/FormulariosPropuestas/FormulariosPasantia";
import AsignacionEmpresa from "./AlumnoComponents/FormulariosPropuestas/AsignacionEmpresa";
import { SelectPropuestas } from "./AlumnoComponents/FormulariosPropuestas/SelectPropuestas";
import FormulariosProyecto from "./AlumnoComponents/FormulariosPropuestas/FormulariosProyecto";
import FormulariosInvestigacion from "./AlumnoComponents/FormulariosPropuestas/FormulariosInvestigacion";
import TrabajoContainer from "./DecanataComponents/DetallesTrabajoGraduacion/TrabajoContainer";
import PropuestasAsesoria from "./AsesorComponents/PropuestasAsesoria/PropuestasAsesoria";
import Progreso from "./AlumnoComponents/Progreso/Progreso";

import "./App.css";

function App() {
  const { state } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = ["/login", "/registro"].includes(location.pathname);

  return (
    <div className="app-container">
      {/* Sidebar solo se muestra si NO estás en /login o /registro */}
      {!isAuthPage && <Sidebar />}

      <div className={`main-content ${!isAuthPage ? "content-shift" : ""}`}>
        <Routes>
          {/* Rutas Públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                {state.logged ? <Navigate to="/inicio" replace /> : <Login />}
              </PublicRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicRoute>
                {state.logged ? <Navigate to="/inicio" replace /> : <RegistroUsuario />}
              </PublicRoute>
            }
          />

          {/* Rutas Privadas */}
          <Route
            path="/inicio"
            element={
              <PrivateRoute allowedRoles={["Estudiante", "Decano", "Asesor"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/opciones_proyecto"
            element={
              <PrivateRoute allowedRoles={["Estudiante"]}>
                <FormulariosPasantia />
              </PrivateRoute>
            }
          />
          <Route
            path="/formulario_pasantia"
            element={
              <PrivateRoute allowedRoles={["Estudiante"]}>
                <FormulariosPasantia />
              </PrivateRoute>
            }
          />
          <Route
            path="/formulario_empresa"
            element={
              <PrivateRoute allowedRoles={["Estudiante"]}>
                <AsignacionEmpresa />
              </PrivateRoute>
            }
          />
          <Route
            path="/formulario_proyecto"
            element={
              <PrivateRoute allowedRoles={["Estudiante"]}>
                <FormulariosProyecto />
              </PrivateRoute>
            }
          />
          <Route
            path="/formulario_investigacion"
            element={
              <PrivateRoute allowedRoles={["Estudiante"]}>
                <FormulariosInvestigacion />
              </PrivateRoute>
            }
          />

          <Route
            path="/aprobar-propuesta"
            element={
              <PrivateRoute allowedRoles={["Decano"]}>
                <PropuestasSinAprobar />
              </PrivateRoute>
            }
          />
          <Route
            path="/detalle_propuesta/:id"
            element={
              <PrivateRoute allowedRoles={["Decano", "Asesor"]}>
                <TrabajoContainer />
              </PrivateRoute>
            }
          />
          <Route
            path="/peticiones_asesoria"
            element={
              <PrivateRoute allowedRoles={["Asesor"]}>
                <PropuestasAsesoria />
              </PrivateRoute>
            }
          />
          <Route
            path="/progreso"
            element={
              <PrivateRoute allowedRoles={["Estudiante"]}>
                <Progreso />
              </PrivateRoute>
            }
          />

          <Route
            path="/propuestas"
            element={
              <PrivateRoute allowedRoles={["Estudiante"]}>
                <SelectPropuestas />
              </PrivateRoute>
            }
          />
          <Route
            path="/entregas"
            element={
              <PrivateRoute allowedRoles={["Estudiante", "Decano"]}>
                <Entregas />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestion-usuarios"
            element={
              <PrivateRoute allowedRoles={["Decano"]}>
                <Usuario />
              </PrivateRoute>
            }
          />
          <Route
            path="/crear-usuarios"
            element={
              <PrivateRoute allowedRoles={["Decano"]}>
                <FormularioCrearUsuario />
              </PrivateRoute>
            }
          />

          {/* <Route
            path="/propuesta-aprobadas"
            element={
              <PrivateRoute allowedRoles={["Decano", "Asesor"]}>
                <ProyectosAceptados />
              </PrivateRoute>
            }
          /> */}
          <Route
            path="/historial"
            element={
              <PrivateRoute allowedRoles={["Decano"]}>
                <AuditoriaList />
              </PrivateRoute>
            }
          />
          <Route
            path="/alumnos-activos"
            element={
              <PrivateRoute allowedRoles={["Decano", "Asesor"]}>
                <AlumnosActivos />
              </PrivateRoute>
            }
          />
          <Route
            path="/entregas-aprobadas"
            element={
              <PrivateRoute allowedRoles={["Decano", "Asesor", "Estudiante"]}>
                <EntregasAprobadas />
              </PrivateRoute>
            }
          />

          {/* Ruta para Acceso Denegado */}
          <Route
            path="/no-autorizado"
            element={<div>No tienes autorización para ver esta página.</div>}
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/inicio" />} />
        </Routes>
      </div>
    </div>
  );
}

// Envoltorio principal para proveer Router y AuthProvider
export default function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}
