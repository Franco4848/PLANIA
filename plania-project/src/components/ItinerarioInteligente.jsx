import React from 'react';

export default function ItinerarioInteligente({ actividades, setActividades, onRutaGenerada }) {
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

  return (
    <div>
      <h2>📋 Itinerario</h2>

      {actividades.length === 0 ? (
        <p>⚠️ No hay actividades en el itinerario.</p>
      ) : (
        <>
          <ul>
            {actividades.map((act, index) => (
              <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{act.nombre} ({act.categoria})</strong>
                <button onClick={() => eliminarActividad(index)} style={{ marginLeft: '10px' }}>Eliminar</button>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={mostrarRutaEnMapa}>Mostrar ruta</button>
          </div>
        </>
      )}
    </div>
  );
}
