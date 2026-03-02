import React, { useState, useEffect } from 'react';
import { generarRecomendaciones } from '../services/IAservice';
import './IAChat.css';

export default function IAChat({
  userPosition,
  interesesUsuario,
  onActividadesGeneradas,
  onSugerenciasGeneradas,
  justificacionIA,
  setJustificacionIA,
  actividadesVisiblesIA,
  presupuesto,
  setPresupuesto,
  cantidadPersonas,
  setCantidadPersonas,
  cantidadDias,
  setCantidadDias
}) {
  const [loading, setLoading] = useState(false);

  const consultarIA = () => {
    if (!userPosition || interesesUsuario.length === 0) return;

    if (
      presupuesto < 10 || presupuesto > 200 ||
      cantidadPersonas < 1 || cantidadPersonas > 4 ||
      cantidadDias < 1 || cantidadDias > 3
    ) {
      alert('Completá todos los campos obligatorios con valores válidos (presupuesto entre $10 y $200, máximo 4 personas, máximo 3 días).');
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

  const actualizarSliderEstilo = (valor) => {
    const porcentaje = ((valor - 10) / (200 - 10)) * 100;
    const slider = document.querySelector('.ia-slider');
    if (slider) {
      slider.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${porcentaje}%, #fff ${porcentaje}%, #fff 100%)`;
    }
  };

  useEffect(() => {
    actualizarSliderEstilo(presupuesto);
  }, [presupuesto]);

  const renderJustificacionNumerada = (texto) => {
    return texto
      .split('\n')
      .filter((linea) => linea.trim() !== '')
      .map((linea, index) => (
        <div key={index} className="ia-linea">
          {linea}
        </div>
      ));
  };

  const reiniciarConsulta = () => {
    setJustificacionIA(null);
    setPresupuesto(10);
    setCantidadPersonas(1);
    setCantidadDias(1);
  };

  return (
    <div className="ia-container">
      <h2 className="ia-titulo">🤖 Asistente Inteligente</h2>

      {!justificacionIA ? (
        <>
          <div className="ia-input-group">
            <label className="ia-label">
              💵 Presupuesto disponible (USD) <span className="ia-aviso">(obligatorio, entre $10 y $200)</span>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={presupuesto}
              onChange={(e) => {
                const nuevo = parseInt(e.target.value);
                setPresupuesto(nuevo);
                actualizarSliderEstilo(nuevo);
              }}
              className="ia-slider"
            />
            <div className="ia-rango-info">
              Seleccionado: <strong>{presupuesto > 0 ? `$${presupuesto}` : 'No definido'}</strong>
            </div>
          </div>

          <div className="ia-input-group">
            <label className="ia-label">
              🧑‍🤝‍🧑 Cantidad de personas <span className="ia-aviso">(obligatorio) (máximo 4)</span>
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={cantidadPersonas}
              onChange={(e) => setCantidadPersonas(parseInt(e.target.value))}
              className="ia-input-number"
            />
          </div>

          <div className="ia-input-group">
            <label className="ia-label">
              📅 Cantidad de días <span className="ia-aviso">(obligatorio) (máximo 3)</span>
            </label>
            <input
              type="number"
              min="1"
              max="3"
              value={cantidadDias}
              onChange={(e) => setCantidadDias(parseInt(e.target.value))}
              className="ia-input-number"
            />
          </div>

          <div className="ia-campos-obligatorios">
            Campos obligatorios para generar el itinerario.
          </div>

          <button onClick={consultarIA} disabled={loading} className="boton-azul">
            {loading ? 'Generando...' : '¿Qué puedo hacer hoy?'}
          </button>
        </>
      ) : (
        <div className="ia-parametros">
          <h4>Parámetros seleccionados:</h4>
          <ul>
            <li>💵 Presupuesto: <strong>${presupuesto}</strong></li>
            <li>🧑‍🤝‍🧑 Personas: <strong>{cantidadPersonas}</strong></li>
            <li>📅 Días: <strong>{cantidadDias}</strong></li>
          </ul>
        </div>
      )}

      {justificacionIA && (
        <>
          <div className="ia-justificacion">
            <h4>🧠 Recomendación de la IA:</h4>
            {renderJustificacionNumerada(justificacionIA)}
          </div>

          <button onClick={reiniciarConsulta} className="boton-azul">
            Regenerar recomendación
          </button>
        </>
      )}
    </div>
  );
}
