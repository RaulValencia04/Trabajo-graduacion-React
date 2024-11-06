import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';


const PublicRoute = ({ children }) => {
    const { state } = useContext(AuthContext);

    // Si el usuario está autenticado, redirigir al inicio
    if (state.logged) {
        return <Navigate to="/inicio" />;
    }

    return children;
};

export default PublicRoute;
