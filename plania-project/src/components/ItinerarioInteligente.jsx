import React, { useEffect, useState } from 'react';
import { generarItinerarioInteligente } from '../services/IAcontextual';

export default function ItinerarioInteligente({ lugares, weathercode, temperatura, interesesUsuario, onRutaGenerada }) {
  const [itinerario, setItinerario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [datosListos, setDatosListos] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDatosListos(false);

    if (!lugares || lugares.length === 0) return;

    const generado = generarItinerarioInteligente({ lugares, weathercode, temperatura, interesesUsuario });
    setItinerario(generado);
    setLoading(false);
    setDatosListos(true);
  }, [lugares, weathercode, temperatura, interesesUsuario]);

  const recalcularRuta = (nuevoItinerario) => {
    if (nuevoItinerario.length === 0) return;

    const destino = nuevoItinerario[nuevoItinerario.length - 1].coordenadas;
    const waypoints = nuevoItinerario.slice(0, -1).map((lugar) => ({
      location: lugar.coordenadas,
      stopover: true
    }));

    onRutaGenerada({ destino, waypoints });
  };

  const mostrarRutaEnMapa = () => {
    recalcularRuta(itinerario);
  };

  const eliminarActividad = (index) => {
    const nuevoItinerario = [...itinerario];
    nuevoItinerario.splice(index, 1);
    setItinerario(nuevoItinerario);
  };

  const obtenerActividadContextual = () => {
    const nombresActuales = itinerario.map((lugar) => lugar.nombre);
    const lugaresDisponibles = lugares.filter((lugar) => !nombresActuales.includes(lugar.nombre));

    const recomendados = generarItinerarioInteligente({
      lugares: lugaresDisponibles,
      weathercode,
      temperatura,
      interesesUsuario
    });

    return recomendados.length > 0 ? recomendados[0] : null;
  };

  const agregarActividad = () => {
    const nueva = obtenerActividadContextual();
    if (!nueva) return;

    const nuevoItinerario = [...itinerario, nueva];
    setItinerario(nuevoItinerario);
  };

  return (
    <div>
      <h2>🧭 Itinerario Inteligente</h2>

      {!datosListos ? (
        <p>🔄 Generando recomendaciones...</p>
      ) : itinerario.length === 0 ? (
        <p>⚠️ No se encontraron lugares recomendados.</p>
      ) : (
        <ul>
          {itinerario.map((lugar, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{lugar.nombre}</strong>
              <button onClick={() => eliminarActividad(index)} style={{ marginLeft: '10px' }}>Eliminar actividad</button>
            </li>
          ))}
        </ul>
      )}

      {itinerario.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={mostrarRutaEnMapa}>Mostrar ruta</button>
          <button onClick={agregarActividad}>Agregar actividad</button>
        </div>
      )}
    </div>
  );
}
