import React, { useState } from 'react';
import { generarRecomendaciones } from '../services/IAservice';

export default function IAChat({
  userPosition,
  interesesUsuario,
  onActividadesGeneradas,
  onSugerenciasGeneradas,
  justificacionIA,
  setJustificacionIA,
  actividadesVisiblesIA // ✅ usamos esta prop en vez de estado local
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

        const agrupadas = new Map();
        const seleccionadas = [];
        const sugerencias = [];

        for (const lugar of data.lugares) {
          const cat = lugar.categoria;
          if (!agrupadas.has(cat)) agrupadas.set(cat, []);
          agrupadas.get(cat).push(lugar);
        }

        for (const [categoria, lista] of agrupadas.entries()) {
          const primera = lista[0];
          if (primera) seleccionadas.push(primera);
          sugerencias.push(...lista.slice(1));
        }

        onActividadesGeneradas(seleccionadas);       // se guarda en App
        onSugerenciasGeneradas(sugerencias);         // también
      })
      .catch((err) => console.error('Error IA:', err))
      .finally(() => setLoading(false));
  };

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

      {actividadesVisiblesIA.length > 0 && (
        <div
          style={{
            marginBottom: '20px',
            background: '#f9f9f9',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}
        >
          <h4 style={{ marginBottom: '8px' }}>🎯 Principales actividades recomendadas:</h4>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {actividadesVisiblesIA.map((act, index) => (
              <li key={index} style={{ marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                <strong>{act.nombre}</strong> ({act.categoria})
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={consultarIA} disabled={loading}>
        {loading ? 'Generando...' : '¿Qué puedo hacer hoy?'}
      </button>
    </div>
  );
}
