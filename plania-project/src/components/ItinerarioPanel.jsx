import React, { useState } from 'react';

const ItinerarioPanel = ({ itinerario, lugares, onLugarClick, onRegenerar }) => {
  const [diaSeleccionado, setDiaSeleccionado] = useState(1);

  if (!itinerario || !itinerario.dias) {
    return null;
  }

  const lugaresDelDia = lugares.filter((l) => l.dia === diaSeleccionado);

  return (
    <div className="itinerario-panel">
      <div className="panel-header">
        <h3>📅 Tu itinerario de {itinerario.dias.length} días</h3>
        <button onClick={onRegenerar} className="btn-regenerar">
          🔄 Regenerar
        </button>
      </div>

      {/* Selector de días */}
      <div className="dias-tabs">
        {itinerario.dias.map((dia) => (
          <button
            key={dia.dia}
            className={`dia-tab ${diaSeleccionado === dia.dia ? 'active' : ''}`}
            onClick={() => setDiaSeleccionado(dia.dia)}
          >
            Día {dia.dia}
            {dia.tema && <span className="tema">({dia.tema})</span>}
          </button>
        ))}
      </div>

      {/* Actividades del día */}
      <div className="actividades-lista">
        {lugaresDelDia.length > 0 ? (
          lugaresDelDia.map((lugar, index) => (
            <div
              key={index}
              className="actividad-card"
              onClick={() => onLugarClick(lugar)}
            >
              <div className="actividad-header">
                <h4>{lugar.nombreReal || lugar.nombre}</h4>
                <span className="horario">{lugar.horario}</span>
              </div>
              <p className="direccion">{lugar.direccion}</p>
              <div className="actividad-footer">
                <span className="rating">⭐ {lugar.rating}</span>
                <span className="presupuesto">
                  ${lugar.presupuesto_estimado?.toLocaleString()}
                </span>
              </div>
              {lugar.descripcion && (
                <p className="descripcion">{lugar.descripcion}</p>
              )}
            </div>
          ))
        ) : (
          <p className="no-lugares">No hay lugares para este día</p>
        )}
      </div>

      {/* Resumen */}
      <div className="itinerario-footer">
        <p>
          <strong>Presupuesto total:</strong> $
          {itinerario.presupuesto_total?.toLocaleString()}
        </p>
        {itinerario.recomendaciones && itinerario.recomendaciones.length > 0 && (
          <div className="recomendaciones">
            <strong>💡 Recomendaciones:</strong>
            <ul>
              {itinerario.recomendaciones.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItinerarioPanel;
