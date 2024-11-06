import React, { useReducer } from 'react';
import { AuthContext } from './AuthContext';
import { authReducer } from './AuthReducer';
const InitialState = {
    logged: false,
    role: null, // Añadimos el rol del usuario
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, InitialState);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
