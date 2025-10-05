import React, { useState } from 'react';

export default function Sugerencias() {
  const [mensaje, setMensaje] = useState('');
  const [confirmacion, setConfirmacion] = useState('');

  const enviarSugerencia = () => {
    if (mensaje.trim() === '') return;
    console.log('Sugerencia enviada:', mensaje);
    setConfirmacion('Gracias por tu sugerencia. La tendremos en cuenta.');
    setMensaje('');
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
      <button onClick={enviarSugerencia} style={{ marginTop: '10px' }}>
        Enviar sugerencia
      </button>
      {confirmacion && <p style={{ marginTop: '10px', color: 'green' }}>{confirmacion}</p>}
    </div>
  );
}
