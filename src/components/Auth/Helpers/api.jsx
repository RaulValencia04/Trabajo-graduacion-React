import { useContext, useCallback } from 'react';
import { AuthContext } from '../Context/AuthContext';
import {jwtDecode} from 'jwt-decode'; // Asegúrate de usar la importación correcta

export function useApi() {
  const { state, dispatch, logout } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL;

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const { token, refreshToken } = data;

      const decodedToken = jwtDecode(token);

      
      dispatch({
        type: 'login',
        payload: {
          token,
          refreshToken,
          role: decodedToken.role,
          email: decodedToken.sub,
          userId: decodedToken.userId,
        },
      });

      
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('refreshToken', refreshToken);

      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout(); 
      return null;
    }
  }, [API_URL, state.refreshToken, dispatch, logout]);

  const authFetch = useCallback(
    async (url, options = {}) => {
      try {
        const headers = {
          ...(options.headers || {}),
          'Content-Type': 'application/json',
        };

        // Añadir token de autorización si existe
        if (state.token) {
          headers.Authorization = `Bearer ${state.token}`;
        }

        // Primera solicitud
        let response = await fetch(url, { ...options, headers });

        // Si el token ha expirado, intenta refrescarlo
        if (response.status === 401) {
          const newToken = await refreshToken();

          if (newToken) {
            // Reintentar la solicitud con el nuevo token
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };
            response = await fetch(url, { ...options, headers: retryHeaders });
          }
        }

        return response; // Devuelve la respuesta, incluso en caso de error HTTP
      } catch (error) {
        console.error('Error in authFetch:', error);
        throw error; // Propagar el error
      }
    },
    [refreshToken, state.token]
  );

  return { authFetch };
}
