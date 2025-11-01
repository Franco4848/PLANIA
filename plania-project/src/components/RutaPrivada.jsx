import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RutaPrivada({ children, requiredRole }) {
  const token = localStorage.getItem('token');

  const getPayload = () => {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1];
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const payload = getPayload();
  const ahora = Date.now(); // milisegundos
  const exp = payload?.exp ? payload.exp * 1000 : null;

  if (!payload || (exp && exp < ahora - 5000)) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && payload.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}