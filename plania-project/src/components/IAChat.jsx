import React, { useState } from 'react';
import { generarRecomendaciones } from '../services/IAservice';

export default function IAChat({
  userPosition,
  interesesUsuario,
  onActividadesGeneradas,
  onSugerenciasGeneradas,
  justificacionIA,
  setJustificacionIA,
  actividadesVisiblesIA
}) {
  const [loading, setLoading] = useState(false);
  const [presupuesto, setPresupuesto] = useState(0);
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [cantidadDias, setCantidadDias] = useState(1);

  const consultarIA = () => {
    if (!userPosition || interesesUsuario.length === 0) return;

    if (
      presupuesto <= 0 ||
      cantidadPersonas < 1 || cantidadPersonas > 4 ||
      cantidadDias < 1 || cantidadDias > 3
    ) {
      alert('Completá todos los campos obligatorios con valores válidos (máximo 4 personas, máximo 3 días).');
      return;
    }

    setLoading(true);
    generarRecomendaciones({
      lat: userPosition.lat.toString(),
      lng: userPosition.lng.toString(),
      intereses: interesesUsuario,
      presupuesto: Number(presupuesto),
      personas: cantidadPersonas,
      dias: cantidadDias
    })
      .then((data) => {
        if (!data || !data.respuesta || !Array.isArray(data.lugares)) {
          console.error('Respuesta incompleta de IA:', data);
          return;
        }

        console.log('🧠 Texto IA recibido:', data.respuesta);
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

        onActividadesGeneradas(seleccionadas);
        onSugerenciasGeneradas(sugerencias);
      })
      .catch((err) => console.error('Error IA:', err))
      .finally(() => setLoading(false));
  };

  const renderJustificacionNumerada = (texto) => {
    return texto
      .split('\n')
      .filter((linea) => linea.trim() !== '')
      .map((linea, index) => (
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
          {linea}
        </div>
      ));
  };

  const extraerCosto = (nombre, texto) => {
    const lineas = texto.split('\n');
    for (const linea of lineas) {
      if (linea.toLowerCase().includes(nombre.toLowerCase())) {
        const match = linea.match(/\$\d+(\.\d{1,2})?/);
        return match ? match[0] : 'Gratis';
      }
    }
    return null;
  };

  return (
    <div>
      <h2>🤖 Asistente Inteligente</h2>

      {/* 💵 Presupuesto disponible */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          💵 Presupuesto disponible (USD) <span style={{ fontSize: '12px', color: '#c00' }}>(obligatorio)</span>
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={presupuesto}
          onChange={(e) => setPresupuesto(parseInt(e.target.value))}
        />
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          Seleccionado: <strong>{presupuesto > 0 ? `$${presupuesto}` : 'No definido'}</strong>
        </div>
      </div>

      {/* 🧑‍🤝‍🧑 Cantidad de personas */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          🧑‍🤝‍🧑 Cantidad de personas <span style={{ fontSize: '12px', color: '#c00' }}>(obligatorio) (máximo 4)</span>
        </label>
        <input
          type="number"
          min="1"
          max="4"
          value={cantidadPersonas}
          onChange={(e) => setCantidadPersonas(parseInt(e.target.value))}
          style={{ width: '60px', marginLeft: '10px' }}
        />
      </div>

      {/* 📅 Cantidad de días */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          📅 Cantidad de días <span style={{ fontSize: '12px', color: '#c00' }}>(obligatorio) (máximo 3)</span>
        </label>
        <input
          type="number"
          min="1"
          max="3"
          value={cantidadDias}
          onChange={(e) => setCantidadDias(parseInt(e.target.value))}
          style={{ width: '60px', marginLeft: '10px' }}
        />
      </div>

      {/* 📝 Mensaje unificado */}
      <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
        Campos obligatorios para generar el itinerario.
      </div>

      {/* 🧠 Justificación IA */}
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

      {/* 🎯 Actividades principales */}
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
            {actividadesVisiblesIA.map((act, index) => {
              const costo = extraerCosto(act.nombre, justificacionIA);
              return (
                <li key={index} style={{ marginBottom: '4px', fontSize: '14px', color: '#333' }}>
                  <strong>{act.nombre}</strong> ({act.categoria}) {costo && <span>– <strong>{costo}</strong></span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 🚀 Botón de consulta */}
      <button onClick={consultarIA} disabled={loading}>
        {loading ? 'Generando...' : '¿Qué puedo hacer hoy?'}
      </button>
    </div>
  );
}
