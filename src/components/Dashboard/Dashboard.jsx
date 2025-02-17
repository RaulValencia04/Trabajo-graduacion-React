import React, { useContext } from 'react';
import './Dashboard.css';
import { AuthContext } from '../Auth/Context/AuthContext';
import logo from '../../img/icon.png'; // Imagen del logo

export const Dashboard = () => {
    const { state } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            {/* Imagen del logo */}
            <img src={logo} alt="Logo" className="dashboard-logo" />

            {/* Mensaje de bienvenida */}
            <h1 className="title">Bienvenido {state.email || 'Usuario'}</h1>

            {/* Texto introductorio */}
            <p className="intro-text">
                Hola {state.email || 'usuario'}, bienvenido a esta plataforma donde podrás llevar el seguimiento de tu trabajo de graduación. 
                Explora las herramientas disponibles y revisa tus avances fácilmente.
            </p>

            {/* Ondas decorativas en la parte inferior */}
            <div className="wave-container">
                <svg className="wave" viewBox="0 0 1440 320">
                    <path fill="#880c09" fillOpacity="1" d="M0,160L80,186.7C160,213,320,267,480,272C640,277,800,235,960,192C1120,149,1280,107,1360,85.3L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                </svg>
                <svg className="wave wave2" viewBox="0 0 1440 320">
                    <path fill="#edbc42" fillOpacity="1" d="M0,256L40,234.7C80,213,160,171,240,149.3C320,128,400,128,480,133.3C560,139,640,149,720,176C800,203,880,245,960,234.7C1040,224,1120,160,1200,144C1280,128,1360,160,1400,176L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
                </svg>
            </div>
        </div>
    );
};

export default Dashboard;
