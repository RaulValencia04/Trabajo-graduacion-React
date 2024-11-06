import React, { useContext } from 'react';
import './Dashboard.css';
import { AuthContext } from '../Auth/Context/AuthContext';

export const Dashboard = () => {
    const { state } = useContext(AuthContext);

    return (
        <>
            <h1 className='title col-6 mb-3 pl-3'>Bienvenido {state.email || 'Usuario'}</h1>
            <br />

            <div className='container'>
                <div className='video pt-4'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-play-circle-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                    </svg>
                </div>
            </div>

            <p className='intro-text'>
                Hola {state.email || 'usuario'}, bienvenido a esta plataforma donde podrás llevar el seguimiento de tu trabajo de graduación. Arriba tienes un video introductorio para que comprendas cómo usar la plataforma de manera efectiva.
            </p>
        </>
    );
};

export default Dashboard;
