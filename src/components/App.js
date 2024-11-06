import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Login from './Auth/Login';
import Proyectos from './Proyectos';
import Sidebar from './SideBar/Sidebar';
import UploadProject from './docs/UploadProject';
import Entregas from './Entregas/Entregas';
import Dashboard from './Dashboard/Dashboard';
import Usuario from './usuario/Usuario';
import FormularioCrearUsuario from './usuario/FormularioCrearUsuario';
import './App.css';
import PropuestasSinAprobar from './AprobarPropuesta/PropuestasSinAprobar';
import ProyectosAceptados from './ProyectosAceptados/ProyectosAceptados';
import AuditoriaList from './AuditoriaList/AuditoriaList';
import AlumnosActivos from './AlumnosActivos/AlumnosActivos';
import DetalleAlumno from './DetalleAlumno/DetalleAlumno';
import EntregasAprobadas from './EntregasAprobadas/EntregasAprobadas';
import RegistroUsuario from './Registro/RegistroUsuario';
import PrivateRoute from './Auth/Context/PrivateRoute';
import { AuthProvider } from '../components/Auth/Context/AutProvider';
import PublicRoute from './Auth/Context/PublicRoute';

function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/registro';

    return (
        <div className="app-container">
            {!isAuthPage && <Sidebar />}

            <div className={`main-content ${!isAuthPage ? 'content-shift' : ''}`}>
                <Routes>
                    {/* Rutas públicas */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/registro"
                        element={
                            <PublicRoute>
                                <RegistroUsuario />
                            </PublicRoute>
                        }
                    />

                    {/* Rutas privadas con roles */}
                    <Route
                        path="/inicio"
                        element={
                            <PrivateRoute allowedRoles={['admin', 'editor']}>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/proyectos"
                        element={
                            <PrivateRoute allowedRoles={['admin', 'editor','Estudiante']}>
                                <Proyectos />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/propuestas"
                        element={
                            <PrivateRoute allowedRoles={['editor']}>
                                <UploadProject />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/entregas"
                        element={
                            <PrivateRoute allowedRoles={['Estudiante']}>
                                <Entregas />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/gestion-usuarios"
                        element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <Usuario />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/crear-usuarios"
                        element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <FormularioCrearUsuario />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/aprobar-propuesta"
                        element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <PropuestasSinAprobar />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/propuesta-aprobadas"
                        element={
                            <PrivateRoute allowedRoles={['viewer']}>
                                <ProyectosAceptados />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/historial"
                        element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <AuditoriaList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/alumnos-activos"
                        element={
                            <PrivateRoute allowedRoles={['editor']}>
                                <AlumnosActivos />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/detalles-alumno/:alumnoId"
                        element={
                            <PrivateRoute allowedRoles={['viewer']}>
                                <DetalleAlumno />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/entregas-aprobadas"
                        element={
                            <PrivateRoute allowedRoles={['viewer', 'editor']}>
                                <EntregasAprobadas />
                            </PrivateRoute>
                        }
                    />

                    {/* Ruta de acceso denegado */}
                    <Route path="/no-autorizado" element={<div>No tienes autorización para ver esta página.</div>} />

                    {/* Ruta por defecto */}
                    <Route path="*" element={<Navigate to="/login" />} />
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
