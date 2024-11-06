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

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
