import React, { useState, useEffect } from 'react';
import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import Itinerario from './components/Itinerario';
import Filtro from './components/Filtro';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      () => setUserPosition({ lat: -32.89, lng: -68.82 })
    );
  }, []);

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {(activeTab === 'mapa' || activeTab === 'filtro' || activeTab === 'itinerario') && (
        <Mapa
          filtroTipo={filtroTipo}
          activeTab={activeTab}
          userPosition={userPosition}
        />
      )}

      {activeTab === 'filtro' && (
        <div className="overlay-content">
          <Filtro filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} />
        </div>
      )}

      {activeTab === 'itinerario' && <Itinerario />}
    </div>
  );
}

export default App;
