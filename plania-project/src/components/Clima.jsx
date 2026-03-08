import React, { useEffect, useState } from "react";
import "./Clima.css";

const weatherIcons = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  61: "🌧️",
  80: "🌧️",
  95: "⛈️",
  99: "⛈️",
};

const Clima = ({ userPosition }) => {
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userPosition) return;

    const { lat, lng } = userPosition;
    setLoading(true);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    )
      .then((res) => res.json())
      .then((data) => setClima(data.current_weather))
      .catch((err) => console.error("Error al obtener clima:", err))
      .finally(() => setLoading(false));
  }, [userPosition]);

  if (loading) {
    return (
      <div className="clima-card">
        <p>Cargando clima...</p>
      </div>
    );
  }

  if (!clima) {
    return (
      <div className="clima-card">
        <p>No se pudo obtener el clima.</p>
      </div>
    );
  }

  const icono = weatherIcons[clima.weathercode] || "🌈";

  return (
    <div className="clima-card">
      <h3 className="clima-title">Clima actual</h3>

      <div className="clima-main">
        <span className="clima-icon">{icono}</span>
        <span className="clima-temp">{Math.round(clima.temperature)}°C</span>
      </div>

      <div className="clima-details">
        <p>💨 Viento: {clima.windspeed} km/h</p>
        <p>🧭 Dirección: {clima.winddirection}°</p>
      </div>
    </div>
  );
};

export default Clima;