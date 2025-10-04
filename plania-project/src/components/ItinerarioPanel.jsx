import React, { useState, useEffect } from 'react';

const ItinerarioPanel = ({ itinerario, lugares, onLugarClick, onRegenerar, onActualizarRuta }) => {
  const [diaSeleccionado, setDiaSeleccionado] = useState(1);
  const [lugaresEditables, setLugaresEditables] = useState(lugares);

  useEffect(() => {
    setLugaresEditables(lugares);
  }, [lugares]);

  if (!itinerario || !itinerario.dias) {
    return null;
  }

  const lugaresDelDia = lugaresEditables.filter((l) => l.dia === diaSeleccionado);

  const eliminarActividad = (index) => {
    const lugarAEliminar = lugaresDelDia[index];
    const nuevosLugares = lugaresEditables.filter((l) => l !== lugarAEliminar);
    setLugaresEditables(nuevosLugares);
    actualizarRuta(nuevosLugares);
  };

  const actualizarRuta = (nuevosLugares) => {
    if (nuevosLugares.length === 0 || !onActualizarRuta) return;

    const lugaresConCoordenadas = nuevosLugares.filter((l) => l.coordenadas);
    if (lugaresConCoordenadas.length === 0) return;

    const destino = lugaresConCoordenadas[lugaresConCoordenadas.length - 1].coordenadas;
    const waypoints = lugaresConCoordenadas.slice(0, -1).map((lugar) => ({
      location: lugar.coordenadas,
      stopover: true,
    }));

    onActualizarRuta({ destino, waypoints });
  };

  const mostrarRutaCompleta = () => {
    actualizarRuta(lugaresEditables);
  };

  return (
    <div className="itinerario-panel">
      <div className="panel-header">
        <h3>Tu itinerario de {itinerario.dias.length} días</h3>
        <button onClick={onRegenerar} className="btn-regenerar">
          Regenerar
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
            >
              <div className="actividad-header">
                <h4 onClick={() => onLugarClick(lugar)} style={{ cursor: 'pointer' }}>
                  {lugar.nombreReal || lugar.nombre}
                </h4>
                <button
                  onClick={() => eliminarActividad(index)}
                  className="btn-eliminar"
                  title="Eliminar actividad"
                >
                  ✕
                </button>
              </div>
              <span className="horario">{lugar.horario}</span>
              <p className="direccion">{lugar.direccion}</p>
              <div className="actividad-footer">
                <span className="rating">⭐ {lugar.rating}</span>
                {/*<span className="presupuesto">
                  ${lugar.presupuesto_estimado?.toLocaleString()}
                </span>*/}
              </div>
              {/*lugar.descripcion && (
                <p className="descripcion">{lugar.descripcion}</p>
              )*/}
            </div>
          ))
        ) : (
          <p className="no-lugares">No hay lugares para este día</p>
        )}
      </div>

      {/* Resumen y acciones */}
      <div className="itinerario-footer">
        <p>
          <strong>Presupuesto total estimado:</strong> $
          {lugaresEditables.reduce((sum, l) => sum + (l.presupuesto_estimado || 0), 0).toLocaleString()}
        </p>
        <button onClick={mostrarRutaCompleta} className="btn-mostrar-ruta">
          Mostrar ruta
        </button>
      </div>
    </div>
  );
};

export default ItinerarioPanel;
