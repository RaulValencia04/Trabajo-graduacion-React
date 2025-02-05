import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/Context/AuthContext'; // Importa el contexto de autenticación
import './Sidebar.css'; // Importa tu CSS aquí

const Sidebar = () => {
    const { state, logout } = useContext(AuthContext); // Accede al estado y la función logout desde el contexto
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para controlar la visibilidad del sidebar
    const navigate = useNavigate();
   

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Define los enlaces basados en el rol del usuario
    const adminLinks = [
        { to: '/alumnos-activos', icon: 'fas fa-user-plus', text: 'GESTIÓN USUARIOS' },
        { to: '/aprobar-propuesta', icon: 'fas fa-file-alt', text: 'VER PROPUESTA SIN APROBAR' },
        { to: '/propuestas', icon: 'fas fa-tasks', text: 'VER PROGRESO DE PROYECTOS ACTIVOS' },
        { to: '/historial', icon: 'fas fa-history', text: 'VER HISTORIAL' },
    ];

    const userLinks = [
        { to: '/inicio', icon: 'fas fa-clock', text: 'INICIO' },
        { to: '/propuestas', icon: 'fas fa-file-upload', text: 'SUBIR PROPUESTA' },
        { to: '/plan-trabajo', icon: 'fas fa-file-upload', text: 'PLAN DE TRABAJO' },
        { to: '/progreso', icon: 'fas fa-file-upload', text: 'MI PROGRESO' },
        { to: '/entregas', icon: 'fas fa-calendar-alt', text: 'ENTREGAS DE AVANCE' },
    ];

    const asesorLinks = [
        { to: '/inicio', icon: 'fas fa-home', text: 'PÁGINA DE INICIO' },
        { to: '/peticiones_asesoria', icon: 'fas fa-users', text: 'VER SOLICITUDES' },
        { to: '/lista-planes', icon: 'fas fa-users', text: 'VER PLANES DE TRABAJO' },
        { to: '/entregas-aprobadas', icon: 'fas fa-upload', text: 'SUBIR INFORME A DECANATO' },
    ];

    // Determina los enlaces a mostrar en función del rol del usuario
    const role = state.role;
    const linksToDisplay =
        role === 'Decano' ? adminLinks : role === 'Asesor' ? asesorLinks : userLinks;

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <>
            {/* Botón de menú para abrir/ocultar el sidebar */}
            <button className="menu-button" onClick={toggleSidebar}>
                ☰
            </button>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-links">
                    {linksToDisplay.map((link, index) => (
                        <div className="sidebar-item" key={index}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) => (isActive ? 'active-link' : '')}
                            >
                                <i className={link.icon}></i> {link.text}
                            </NavLink>
                        </div>
                    ))}
                </div>

                {/* Opción adicional al final del sidebar */}
                <div className="sidebar-bottom">
                    <div className="dropdown">
                        <button type="button" className="dropdown-btn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="30"
                                height="30"
                                fill="currentColor"
                                className="bi bi-person-circle"
                                viewBox="0 0 16 16"
                            >
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                <path
                                    fillRule="evenodd"
                                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                                />
                            </svg>
                            {state.email || 'Nombre_Usuario'}
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a className="dropdown-item" href="#!">
                                    Perfil
                                </a>
                            </li>
                            <li>
                                <button className="dropdown-item" onClick={handleLogout}>
                                    Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
