import React, { useState, useEffect } from 'react';
import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import Filtro from './components/Filtro';
import Clima from './components/Clima';
import IAChat from './components/IAChat';
import ItinerarioInteligente from './components/ItinerarioInteligente';
import Sugerencias from './components/Sugerencias'; // ✅ nuevo componente
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [userPosition, setUserPosition] = useState(null);
  const [rutaDatos, setRutaDatos] = useState(null);
  const [actividadesIA, setActividadesIA] = useState([]);
  const [justificacionIA, setJustificacionIA] = useState('');
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      () => setUserPosition({ lat: -32.89, lng: -68.82 }) // fallback Maipú
    );
  }, []);

  useEffect(() => {
    if (activeTab !== 'itinerario') {
      setRutaDatos(null);
      setMapKey((prev) => prev + 1);
    }
  }, [activeTab]);

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ✅ Mostrar mapa en todas las secciones relevantes */}
      {(activeTab === 'mapa' ||
        activeTab === 'filtro' ||
        activeTab === 'itinerario' ||
        activeTab === 'nube' ||
        activeTab === 'ia' ||
        activeTab === 'sugerencias') && (
        <Mapa
          key={mapKey}
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
          <IAChat
            userPosition={userPosition}
            interesesUsuario={['cine', 'parque', 'museo']}
            onActividadesGeneradas={setActividadesIA}
            justificacionIA={justificacionIA}
            setJustificacionIA={setJustificacionIA}
          />
        </div>
      )}

      {activeTab === 'itinerario' && (
        <div className="overlay-content">
          <ItinerarioInteligente
            actividades={actividadesIA}
            setActividades={setActividadesIA}
            onRutaGenerada={setRutaDatos}
          />
        </div>
      )}

      {activeTab === 'sugerencias' && (
        <div className="overlay-content">
          <Sugerencias />
        </div>
      )}
    </div>
  );
}

export default App;
