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

  return (
    <div>
      <h2>🤖 Asistente Inteligente</h2>

      {justificacionIA && (
        <div style={{ marginBottom: '20px', background: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
          <h4>🧠 Recomendación de la IA:</h4>
          <div dangerouslySetInnerHTML={{ __html: justificacionIA }} />
        </div>
      )}

      <button onClick={consultarIA} disabled={loading}>
        {loading ? 'Generando...' : '¿Qué puedo hacer hoy?'}
      </button>
    </div>
  );
}

