import React from 'react';
import { guardarRuta } from '../services/rutaService';
import './ItinerarioInteligente.css';

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
    <div className="itinerario-container">
      <h2>📋 Itinerario</h2>

      <div className="itinerario-section">
        <h3>🧠 Actividades recomendadas por la IA</h3>
        {actividades.length === 0 ? (
          <p>No hay actividades en el itinerario.</p>
        ) : (
          <ul className="itinerario-list">
            {actividades.map((act, index) => {
              const costo = extraerCosto(act.nombre, justificacionIA);
              return (
                <li key={index} className="itinerario-item">
                  <span>
                    <strong>{act.nombre}</strong> ({act.categoria}) {costo && <span>– <strong>{costo}</strong></span>}
                  </span>
                  <button onClick={() => eliminarActividad(index)} className="boton-eliminar">Eliminar</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="itinerario-section">
        <h3>➕ Otras actividades cercanas a ti</h3>
        {actividades.length === 0 ? (
          <p>No hay actividades en el itinerario.</p>
        ) : (
          <>
            {sugerenciasIA.length === 0 ? (
              <p>✅ Ya se agregaron todas las actividades sugeridas.</p>
            ) : (
              <ul className="itinerario-list">
                {sugerenciasIA.map((act, i) => (
                  <li key={i} className="itinerario-item">
                    <span>
                      <strong>{act.nombre}</strong> ({act.categoria}) – <strong>${act.costo} USD</strong>
                    </span>
                    <button onClick={agregarActividadExtra} className="boton-agregar">Agregar actividad</button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {actividades.length > 0 && (
        <div className="botones-acciones">
          <button onClick={mostrarRutaEnMapa} className="boton-mostrar">Mostrar ruta</button>
          <button onClick={guardarRutaEnBD} className="boton-guardar">Guardar ruta</button>
        </div>
      )}
    </div>
  );
}
