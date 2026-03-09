import React, { useState } from 'react';
import { useCrearSugerencia } from '../hook/useCrearSugerencia';
import './Sugerencias.css';

export default function Sugerencias() {
  const [mensaje, setMensaje] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const { crearSugerencia, loading, error } = useCrearSugerencia();

  const enviarSugerencia = async () => {
    if (mensaje.trim() === '') return;

    try {
      await crearSugerencia({ variables: { mensaje } });
      setConfirmacion('Gracias por tu sugerencia. La tendremos en cuenta.');
      setMensaje('');
    } catch (err) {
      console.error('Error al enviar sugerencia:', err);
      setConfirmacion('Hubo un problema al enviar tu sugerencia.');
    }
  };

  return (
    <div className="sugerencias-container">
      <h2>💬 Sugerencias</h2>
      <p>¿Tenés alguna mejora o problema que quieras reportar?</p>
      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Escribí tu sugerencia aquí..."
        rows={5}
        className="sugerencias-textarea"
      />
      <button
        onClick={enviarSugerencia}
        disabled={loading}
        className="sugerencias-button"
      >
        {loading ? 'Enviando...' : 'Enviar sugerencia'}
      </button>
      {confirmacion && (
        <p
          className={`sugerencias-confirmacion ${
            error ? 'error' : 'ok'
          }`}
        >
          {confirmacion}
        </p>
      )}
    </div>
  );
}
