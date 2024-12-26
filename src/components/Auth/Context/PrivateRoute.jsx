
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; 

function PrivateRoute({ children, allowedRoles }) {
  const { state } = useContext(AuthContext);

  if (!state.logged) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(state.role)) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
}
export default PrivateRoute;


