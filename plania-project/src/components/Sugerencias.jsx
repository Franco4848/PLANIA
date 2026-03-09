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

    <div className="sugerencias-wrapper">

      <div className="sugerencias-container">

        <div className="sugerencias-header">

          <h1>💬 Sugerencias</h1>

          <p>
            ¿Tenés alguna mejora o problema que quieras reportar?
            Tu feedback nos ayuda a mejorar la plataforma.
          </p>

        </div>

        <div className="sugerencias-card">

          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribí tu sugerencia aquí..."
            rows={6}
            className="sugerencias-textarea"
          />

          <button
            onClick={enviarSugerencia}
            disabled={loading}
            className="sugerencias-btn"
          >

            {loading ? 'Enviando...' : 'Enviar sugerencia'}

          </button>

          {confirmacion && (
            <p className={`sugerencias-msg ${error ? 'error' : 'ok'}`}>
              {confirmacion}
            </p>
          )}

        </div>

      </div>

    </div>

  );
}