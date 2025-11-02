import React, { useState } from 'react';
import { useCrearSugerencia } from '../hook/useCrearSugerencia';

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
    <div style={{ padding: '20px' }}>
      <h2>💬 Sugerencias</h2>
      <p>¿Tenés alguna mejora o problema que quieras reportar?</p>
      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Escribí tu sugerencia aquí..."
        rows={5}
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <button onClick={enviarSugerencia} disabled={loading} style={{ marginTop: '10px' }}>
        {loading ? 'Enviando...' : 'Enviar sugerencia'}
      </button>
      {confirmacion && <p style={{ marginTop: '10px', color: error ? 'red' : 'green' }}>{confirmacion}</p>}
    </div>
  );
}
