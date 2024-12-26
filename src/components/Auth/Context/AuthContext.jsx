
import React, { createContext, useReducer } from 'react';
import { authReducer } from './AuthReducer'; 


export const AuthContext = createContext();


const initialState = {
  logged: false,
  token: null, 
  refreshToken: null,
  role: null,
  email: null,
  userId: null,
};


export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

 
  const logout = () => {
    
    sessionStorage.removeItem('token'); 
    sessionStorage.removeItem('refreshToken');
    dispatch({ type: 'logout' });
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
