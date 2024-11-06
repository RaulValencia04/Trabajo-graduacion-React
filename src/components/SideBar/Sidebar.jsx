import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Importa tu CSS aquí

const Sidebar = () => {
  const [role, setRole] = useState('admin'); // 'user', 'admin', 'asesor'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para controlar la visibilidad del sidebar

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const adminLinks = [
    { to: '/gestion-usuarios', icon: 'fas fa-user-plus', text: 'GESTION USUARIOS' },
    { to: '/aprobar-propuesta', icon: 'fas fa-file-alt', text: 'VER PROPUESTA SIN APROBAR' },
    { to: '/propuesta-aprobadas', icon: 'fas fa-tasks', text: 'VER PROGRESO DE PROYECTOS ACTIVOS' },
    { to: '/historial', icon: 'fas fa-history', text: 'VER HISTORIAL' }
  ];

  const userLinks = [
    { to: '/inicio', icon: 'fas fa-clock', text: 'INICIO' },
    { to: '/propuestas', icon: 'fas fa-file-upload', text: 'SUBIR PROPUESTA' },
    { to: '/entregas', icon: 'fas fa-calendar-alt', text: 'ENTREGAS DE AVANCE' },
  ];

  const asesorLinks = [
    { to: '/inicio', icon: 'fas fa-home', text: 'PÁGINA DE INICIO' },
    { to: '/alumnos-activos', icon: 'fas fa-users', text: 'VER LISTADO DE ALUMNOS' },
    { to: '/entregas-aprobadas', icon: 'fas fa-upload', text: 'SUBIR INFORME A DECANATO' },
  ];

  const linksToDisplay = role === 'admin' ? adminLinks : role === 'asesor' ? asesorLinks : userLinks;

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
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
              </svg>
              Nombre_Usuario
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#!">Perfil</a></li>
              <li><a className="dropdown-item" href="#!">Cerrar Sesion</a></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
