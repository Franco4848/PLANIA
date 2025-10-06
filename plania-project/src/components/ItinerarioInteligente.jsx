import React from 'react';

export default function ItinerarioInteligente({
  actividades,
  setActividades,
  onRutaGenerada,
  userPosition,
  interesesUsuario,
  justificacionIA,
  setJustificacionIA,
  agregarActividadExtra,
  sugerenciasIA,
  setSugerenciasIA
}) {
  const eliminarActividad = (index) => {
    const nuevas = [...actividades];
    nuevas.splice(index, 1);
    setActividades(nuevas);
  };

  const mostrarRutaEnMapa = () => {
    if (actividades.length === 0) return;

    const destino = actividades[actividades.length - 1].coordenadas;
    const waypoints = actividades.slice(0, -1).map((act) => ({
      location: act.coordenadas,
      stopover: true
    }));

    onRutaGenerada({ destino, waypoints });
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
      <h2>📋 Itinerario</h2>

      {actividades.length === 0 ? (
        <p>⚠️ No hay actividades en el itinerario.</p>
      ) : (
        <>
          <ul>
            {actividades.map((act, index) => {
              const costo = extraerCosto(act.nombre, justificacionIA);
              return (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <strong>{act.nombre}</strong> ({act.categoria}) {costo && <span>– <strong>{costo}</strong></span>}
                  </span>
                  <button onClick={() => eliminarActividad(index)} style={{ marginLeft: '10px' }}>Eliminar</button>
                </li>
              );
            })}
          </ul>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={agregarActividadExtra} disabled={sugerenciasIA.length === 0}>
              Agregar actividad
            </button>
            <button onClick={mostrarRutaEnMapa}>Mostrar ruta</button>
          </div>

          {sugerenciasIA.length === 0 && (
            <p style={{ marginTop: '10px' }}>✅ Ya se agregaron todas las actividades sugeridas.</p>
          )}
        </>
      )}
    </div>
  );
}
