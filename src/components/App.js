import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import Login from "./Auth/Login";
import Proyectos from "./Proyectos";
import Sidebar from "./SideBar/Sidebar";
import UploadProject from "./docs/UploadProject";
import Entregas from "./Entregas/Entregas";
import Dashboard from "./Dashboard/Dashboard";
import Usuario from "./usuario/Usuario";
import FormularioCrearUsuario from "./usuario/FormularioCrearUsuario";
import "./App.css";
import PropuestasSinAprobar from "./AprobarPropuesta/PropuestasSinAprobar";
import ProyectosAceptados from "./ProyectosAceptados/ProyectosAceptados";
import AuditoriaList from "./AuditoriaList/AuditoriaList";
import AlumnosActivos from "./AlumnosActivos/AlumnosActivos";
import DetalleAlumno from "./DetalleAlumno/DetalleAlumno";
import EntregasAprobadas from "./EntregasAprobadas/EntregasAprobadas";
import RegistroUsuario from "./Registro/RegistroUsuario";
import PrivateRoute from "./Auth/Context/PrivateRoute";
import { AuthProvider } from "./Auth/Context/AutProvider";
import PublicRoute from "./Auth/Context/PublicRoute";
import { AuthContext } from "./Auth/Context/AuthContext";
import { useContext } from 'react';

function App() {
  const { state } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/registro";
  const role = state.role;

  return (
    <div className="app-container">
      {!isAuthPage && <Sidebar />}

      <div className={`main-content ${!isAuthPage ? "content-shift" : ""}`}>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/login"
            element={
              state.logged ? <Navigate to="/inicio" replace /> : <Login />
            }
          />
          <Route
            path="/registro"
            element={
              state.logged ? (
                <Navigate to="/inicio" replace />
              ) : (
                <RegistroUsuario />
              )
            }
          />

          {/* Rutas privadas con roles específicos */}
          <Route
            path="/inicio"
            element={
              <PrivateRoute allowedRoles={["Estudiante", "Decano", "Asesor"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/proyectos"
            element={
              <PrivateRoute allowedRoles={["Estudiante", "Decano", "Asesor"]}>
                <Proyectos />
              </PrivateRoute>
            }
          />
          <Route
            path="/propuestas"
            element={
              <PrivateRoute allowedRoles={["Decano", "Asesor"]}>
                <UploadProject />
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
          <Route
            path="/aprobar-propuesta"
            element={
              <PrivateRoute allowedRoles={["Decano"]}>
                <PropuestasSinAprobar />
              </PrivateRoute>
            }
          />
          <Route
            path="/propuesta-aprobadas"
            element={
              <PrivateRoute allowedRoles={["Decano", "Asesor"]}>
                <ProyectosAceptados />
              </PrivateRoute>
            }
          />
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
            path="/detalles-alumno/:alumnoId"
            element={
              <PrivateRoute allowedRoles={["Decano", "Asesor"]}>
                <DetalleAlumno />
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

          {/* Ruta de acceso denegado */}
          <Route
            path="/no-autorizado"
            element={<div>No tienes autorización para ver esta página.</div>}
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/inicio" />} />
        </Routes>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}
