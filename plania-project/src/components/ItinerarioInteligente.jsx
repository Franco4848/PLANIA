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

  const mostrarRutaEnMapa = () => {
    if (itinerario.length === 0) return;

    const destino = itinerario[itinerario.length - 1].coordenadas;
    const waypoints = itinerario.slice(0, -1).map((lugar) => ({
      location: lugar.coordenadas,
      stopover: true
    }));

    onRutaGenerada({ destino, waypoints });
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
            <li key={index}>
              <strong>{lugar.nombre}</strong>
            </li>
          ))}
        </ul>
      )}

      {itinerario.length > 0 && (
        <button onClick={mostrarRutaEnMapa}>Mostrar ruta</button>
      )}
    </div>
  );
}
