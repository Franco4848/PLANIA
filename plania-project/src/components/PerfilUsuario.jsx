import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerRutasDelUsuario,
  eliminarRuta
} from '../services/rutaService';

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [rutas, setRutas] = useState([]);
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

    obtenerRutasDelUsuario()
      .then((res) => setRutas(res.data))
      .catch((err) => console.error('Error al cargar rutas:', err));
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEliminarRuta = async (id) => {
    try {
      await eliminarRuta(id);
      setRutas((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error('Error al eliminar ruta:', err);
      alert('No se pudo eliminar la ruta');
    }
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

      <h3 style={{ marginTop: '30px' }}>Historial de rutas</h3>

      {rutas.length > 0 ? (
        <ul style={{ marginTop: '10px' }}>
          {rutas.map((ruta) => (
            <li key={ruta._id} style={{ marginBottom: '12px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}>
              <p><strong>Destino:</strong> {`Lat: ${ruta.destino.lat}, Lng: ${ruta.destino.lng}`}</p>
              <p><strong>Paradas:</strong> {ruta.waypoints.length}</p>
              <p><strong>Fecha:</strong> {new Date(ruta.fecha).toLocaleString()}</p>
              <button
                onClick={() => handleEliminarRuta(ruta._id)}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
              Eliminar ruta
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tenés rutas guardadas aún.</p>
      )}

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
