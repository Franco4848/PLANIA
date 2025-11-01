import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RutaPrivada({ children }) {
  const token = localStorage.getItem('token');

  const isTokenValido = () => {
    if (!token) return false;
    try {
      const base64 = token.split('.')[1];
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      const ahora = Math.floor(Date.now() / 1000);
      return !payload.exp || payload.exp > ahora;
    } catch {
      return false;
    }
  };

  return isTokenValido() ? children : <Navigate to="/login" replace />;
}
