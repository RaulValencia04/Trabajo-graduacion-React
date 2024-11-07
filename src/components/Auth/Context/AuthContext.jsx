import React, { createContext, useReducer } from 'react';
import { authReducer } from './AuthReducer';

// Crear el contexto de autenticación
export const AuthContext = createContext();

// Estado inicial
const initialState = {
    logged: false,
    token: null,
    role: null,
    email: null,
};

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Función de logout
    const logout = () => {
        // Remover el token de sessionStorage
        sessionStorage.removeItem('token');
        // Despachar la acción de logout
        dispatch({ type: 'logout' });
    };

    return (
        <AuthContext.Provider value={{ state, dispatch, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
