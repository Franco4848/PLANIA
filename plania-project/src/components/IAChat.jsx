import React, { useState } from 'react';
import { generarRecomendaciones } from '../services/IAservice';

export default function IAChat({
  userPosition,
  interesesUsuario,
  onActividadesGeneradas,
  justificacionIA,
  setJustificacionIA
}) {
  const [loading, setLoading] = useState(false);

  const consultarIA = () => {
    if (!userPosition || interesesUsuario.length === 0) return;

    setLoading(true);
    generarRecomendaciones({
      lat: userPosition.lat.toString(),
      lng: userPosition.lng.toString(),
      intereses: interesesUsuario
    })
      .then((data) => {
        if (!data || !data.respuesta || !data.lugares) {
          console.error('Respuesta incompleta de IA:', data);
          return;
        }
        setJustificacionIA(data.respuesta);
        onActividadesGeneradas(data.lugares);
      })
      .catch((err) => console.error('Error IA:', err))
      .finally(() => setLoading(false));
  };

  // 🧠 Formateador visual de la respuesta IA (compacto y sin doble numeración)
  const renderJustificacionNumerada = (texto) => {
    return texto
      .split('\n')
      .filter((linea) => linea.trim() !== '')
      .map((linea, index) => {
        const yaNumerada = /^\d+\./.test(linea.trim());
        return (
          <div
            key={index}
            style={{
              fontSize: '14px',
              marginBottom: '4px',
              lineHeight: '1.4',
              fontFamily: 'Nunito, sans-serif',
              color: '#333'
            }}
          >
            <strong>{yaNumerada ? '' : `${index + 1}. `}</strong>{linea}
          </div>
        );
      });
  };

  return (
    <div>
      <h2>🤖 Asistente Inteligente</h2>

      {justificacionIA && (
        <div
          style={{
            marginBottom: '20px',
            background: '#f9f9f9',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}
        >
          <h4 style={{ marginBottom: '8px' }}>🧠 Recomendación de la IA:</h4>
          {renderJustificacionNumerada(justificacionIA)}
        </div>
      )}

      <button onClick={consultarIA} disabled={loading}>
        {loading ? 'Generando...' : '¿Qué puedo hacer hoy?'}
      </button>
    </div>
  );
}
