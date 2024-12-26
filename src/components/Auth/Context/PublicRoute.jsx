
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; 

const PublicRoute = ({ children }) => {
  const { state } = useContext(AuthContext);

  if (state.logged) {
    return <Navigate to="/inicio" />;
  }

  return children;
};

export default PublicRoute;
