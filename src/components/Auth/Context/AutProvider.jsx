import React, { createContext, useReducer } from 'react';
import { authReducer } from './AuthReducer';

export const AuthContext = createContext();

const initialState = {
    logged: false,
    token: null,
    role: null,
    email: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

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
