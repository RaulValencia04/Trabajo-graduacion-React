import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/Context/AuthContext'; 
import './Sidebar.css'; 
import logo from '../../img/icon.png'; // Logo en la barra lateral

const Sidebar = () => {
    const { state, logout } = useContext(AuthContext); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const adminLinks = [
        { to: '/alumnos-activos', icon: 'fas fa-user-graduate', text: 'Gestión de Usuarios' },
        { to: '/aprobar-propuesta', icon: 'fas fa-file-signature', text: 'Aprobar Propuestas' },
        { to: '/propuestas', icon: 'fas fa-tasks', text: 'Progreso de Proyectos' },
        { to: '/historial', icon: 'fas fa-history', text: 'Historial' },
    ];

    const userLinks = [
        { to: '/inicio', icon: 'fas fa-home', text: 'Inicio' },
        { to: '/propuestas', icon: 'fas fa-upload', text: 'Subir Propuesta' },
        { to: '/plan-trabajo', icon: 'fas fa-calendar-alt', text: 'Plan de Trabajo' },
        { to: '/entregas', icon: 'fas fa-folder-open', text: 'Entregas de Avance' },
    ];

    const asesorLinks = [
        { to: '/inicio', icon: 'fas fa-home', text: 'Página de Inicio' },
        { to: '/peticiones_asesoria', icon: 'fas fa-comments', text: 'Solicitudes de Asesoría' },
        { to: '/lista-planes', icon: 'fas fa-list-ul', text: 'Planes de Trabajo' },
        { to: '/entregas-aprobadas', icon: 'fas fa-check-circle', text: 'Informes Aprobados' },
    ];

    const role = state.role;
    const linksToDisplay = role === 'Decano' ? adminLinks : role === 'Asesor' ? asesorLinks : userLinks;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <>
            <button className="menu-button" onClick={toggleSidebar}>
                ☰
            </button>

            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                {/* Logo en la barra lateral */}
                <div className="sidebar-header">
                    <img src={logo} alt="Logo" className="sidebar-logo" />
                </div>

                <div className="sidebar-links">
                    {linksToDisplay.map((link, index) => (
                        <div className="sidebar-item" key={index}>
                            <NavLink to={link.to} className={({ isActive }) => (isActive ? 'active-link' : '')}>
                                <i className={link.icon}></i> {link.text}
                            </NavLink>
                        </div>
                    ))}
                </div>

                {/* Perfil y Cerrar Sesión */}
                <div className="sidebar-footer">
                    <div className="profile">
                        <span className="profile-name">{state.email || 'Usuario'}</span>
                        <button className="logout-button" onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
