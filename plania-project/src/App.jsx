import React, { useState, useEffect } from 'react';
import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import Filtro from './components/Filtro';
import Clima from './components/Clima';
import ItinerarioInteligente from './components/ItinerarioInteligente';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [userPosition, setUserPosition] = useState(null);
  const [lugaresIA, setLugaresIA] = useState([]);
  const [weather, setWeather] = useState({ weathercode: null, temperature: null });
  const [rutaDatos, setRutaDatos] = useState(null);
  const [mapKey, setMapKey] = useState(0); // 🆕 clave para forzar re-render

  // 📍 Obtener ubicación del usuario
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      () => setUserPosition({ lat: -32.89, lng: -68.82 }) // fallback Maipú
    );
  }, []);

  // 🌤️ Obtener clima y lugares si estás en IA
  useEffect(() => {
    if (activeTab !== 'ia' || !userPosition) return;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${userPosition.lat}&longitude=${userPosition.lng}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => {
        const clima = data.current_weather;
        setWeather({ weathercode: clima.weathercode, temperature: clima.temperature });
      })
      .catch((err) => console.error('Error al obtener clima:', err));

    fetch(`http://localhost:3000/actividades/buscar?lat=${userPosition.lat}&lng=${userPosition.lng}&tipo=todas`)
      .then((res) => res.json())
      .then((data) => setLugaresIA(data))
      .catch((err) => console.error('Error al obtener lugares:', err));
  }, [activeTab, userPosition]);

  // 🧹 Limpiar ruta y forzar re-render al volver al mapa
  useEffect(() => {
    if (activeTab === 'mapa') {
      setRutaDatos(null); // Limpia ruta
      setMapKey((prev) => prev + 1); // Fuerza re-render del mapa
    }
  }, [activeTab]);

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {(activeTab === 'mapa' || activeTab === 'filtro' || activeTab === 'itinerario' || activeTab === 'nube' || activeTab === 'ia') && (
        <Mapa
          key={mapKey} //  clave para re-render
          filtroTipo={filtroTipo}
          activeTab={activeTab}
          userPosition={userPosition}
          rutaDatos={rutaDatos}
        />
      )}

      {activeTab === 'filtro' && (
        <div className="overlay-content">
          <Filtro filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} />
        </div>
      )}

      {activeTab === 'nube' && (
        <div className="overlay-content">
          <Clima userPosition={userPosition} />
        </div>
      )}

      {activeTab === 'ia' && (
        <div className="overlay-content">
          <ItinerarioInteligente
            lugares={lugaresIA}
            weathercode={weather.weathercode}
            temperatura={weather.temperature}
            interesesUsuario={['cine', 'parque', 'museo']}
            onRutaGenerada={setRutaDatos}
          />
        </div>
      )}
    </div>
  );
}

export default App;
