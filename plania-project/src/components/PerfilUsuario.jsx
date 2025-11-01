import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const decodePayload = (token) => {
      try {
        const base64 = token.split('.')[1];
        const json = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(json);
      } catch (err) {
        console.error('Error al decodificar el token:', err);
        return null;
      }
    };

    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = decodePayload(token);
    if (!payload) return;

    const datos = {
      nombre: payload.name || '',
      correo: payload.email || '',
      intereses: Array.isArray(payload.interests) ? payload.interests : [],
    };

    setUsuario(datos);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="perfil-wrapper">
      <h2>Mis datos</h2>

      {usuario ? (
        <div className="perfil-datos">
          <p><strong>Nombre de usuario:</strong> {usuario.nombre || 'No definido'}</p>
          <p><strong>Correo electrónico:</strong> {usuario.correo || 'No definido'}</p>
          {usuario.intereses.length > 0 ? (
            <p><strong>Intereses:</strong> {usuario.intereses.join(', ')}</p>
          ) : (
            <p><strong>Intereses:</strong> No definidos</p>
          )}
        </div>
      ) : (
        <p>No se pudo cargar la información del usuario.</p>
      )}

      <h3 style={{ marginTop: '30px' }}>🗂️ Historial de rutas</h3>
      {/* Aquí se mostrará el historial de itinerarios guardados */}

      <button
        onClick={cerrarSesion}
        style={{
          marginTop: '40px',
          padding: '10px 20px',
          backgroundColor: '#d9534f',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
