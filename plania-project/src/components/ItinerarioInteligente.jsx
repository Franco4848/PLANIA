import React from 'react';
import { guardarRuta } from '../services/rutaService';

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

  const guardarRutaEnBD = async () => {
    if (actividades.length === 0) return;

    const destino = actividades[actividades.length - 1].coordenadas;
    const waypoints = actividades.slice(0, -1).map((act) => ({
      location: act.coordenadas,
      stopover: true
    }));

    try {
      await guardarRuta({ destino, waypoints });
      alert('Ruta guardada correctamente');
    } catch (err) {
      console.error('Error al guardar ruta:', err);
      alert('No se pudo guardar la ruta');
    }
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

      {/* Actividades recomendadas */}
      <div style={{ marginTop: '20px' }}>
        <h3>🧠 Actividades recomendadas por la IA</h3>
        {actividades.length === 0 ? (
          <p>⚠️ No hay actividades en el itinerario.</p>
        ) : (
          <ul>
            {actividades.map((act, index) => {
              const costo = extraerCosto(act.nombre, justificacionIA);
              return (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span>
                    <strong>{act.nombre}</strong> ({act.categoria}) {costo && <span>– <strong>{costo}</strong></span>}
                  </span>
                  <button onClick={() => eliminarActividad(index)} style={{ marginLeft: '10px' }}>Eliminar</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Actividades sugeridas */}
      <div style={{ marginTop: '30px' }}>
        <h3>➕ Otras actividades cercanas a ti</h3>
        {actividades.length === 0 ? (
          <p>⚠️ No hay actividades en el itinerario.</p>
        ) : (
          <>
            {sugerenciasIA.length === 0 ? (
              <p>✅ Ya se agregaron todas las actividades sugeridas.</p>
            ) : (
              <ul>
                {sugerenciasIA.map((act, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>
                      <strong>{act.nombre}</strong> ({act.categoria}) – <strong>${act.costo} USD</strong>
                    </span>
                    <button onClick={agregarActividadExtra}>Agregar actividad</button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Botones de acción */}
      {actividades.length > 0 && (
        <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
          <button onClick={mostrarRutaEnMapa}>Mostrar ruta</button>
          <button onClick={guardarRutaEnBD}>Guardar ruta</button>
        </div>
      )}
    </div>
  );
}
