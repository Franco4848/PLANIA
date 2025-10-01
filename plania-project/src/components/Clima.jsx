import React, { useEffect, useState } from 'react';

const weatherIcons = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️', 51: '🌦️', 61: '🌧️',
  80: '🌧️', 95: '⛈️', 99: '⛈️'
};

const Clima = ({ userPosition }) => {
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userPosition) return;

    const { lat, lng } = userPosition;
    setLoading(true);

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => setClima(data.current_weather))
      .catch((err) => console.error('Error al obtener clima:', err))
      .finally(() => setLoading(false));
  }, [userPosition]);

  if (loading) return <div className="clima-container">Cargando clima...</div>;
  if (!clima) return <div className="clima-container">No se pudo obtener el clima.</div>;

  const icono = weatherIcons[clima.weathercode] || '🌈';

  return (
    <div className="clima-container">
      <h4>Clima actual</h4>
      <p>{icono} {Math.round(clima.temperature)}°C</p>
      <p>💨 Viento: {clima.windspeed} km/h</p>
      <p>🧭 Dirección: {clima.winddirection}°</p>
    </div>
  );
};

export default Clima;