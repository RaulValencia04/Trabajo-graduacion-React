import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

function PrivateRoute({ children, requiredRole }) {
    const { state } = useContext(AuthContext);

    if (!state.logged) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && state.role !== requiredRole) {
        return <Navigate to="/no-autorizado" />; // Redirige a una página de acceso denegado si el rol no coincide
    }

    return children;
}

export default PrivateRoute;
