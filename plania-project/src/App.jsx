import React, { useState, useEffect } from 'react';
import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import Filtro from './components/Filtro';
import Clima from './components/Clima';
import IAChat from './components/IAChat';
import ItinerarioInteligente from './components/ItinerarioInteligente';
import Sugerencias from './components/Sugerencias';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [userPosition, setUserPosition] = useState(null);
  const [rutaDatos, setRutaDatos] = useState(null);
  const [actividadesIA, setActividadesIA] = useState([]);
  const [actividadesVisiblesIA, setActividadesVisiblesIA] = useState([]); // ✅ persistencia visual
  const [sugerenciasIA, setSugerenciasIA] = useState([]);
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

  const recibirActividadesIA = (lista) => {
    setActividadesIA(lista);              // para itinerario
    setActividadesVisiblesIA(lista);      // para IA visual
  };

  const recibirSugerenciasIA = (lista) => {
    setSugerenciasIA(lista);
  };

  const agregarActividadExtra = () => {
    if (sugerenciasIA.length === 0) return;

    const siguiente = sugerenciasIA[0];
    setActividadesIA((prev) => [...prev, siguiente]);
    setSugerenciasIA((prev) => prev.slice(1));
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

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
            interesesUsuario={['cine', 'parque', 'museo', 'restaurante']}
            onActividadesGeneradas={recibirActividadesIA}
            onSugerenciasGeneradas={recibirSugerenciasIA}
            justificacionIA={justificacionIA}
            setJustificacionIA={setJustificacionIA} 
            actividadesVisiblesIA={actividadesVisiblesIA}
          />
        </div>
      )}

      {activeTab === 'itinerario' && (
        <div className="overlay-content">
          <ItinerarioInteligente
            actividades={actividadesIA}
            setActividades={setActividadesIA}
            onRutaGenerada={setRutaDatos}
            userPosition={userPosition}
            interesesUsuario={['cine', 'parque', 'museo', 'restaurante']}
            justificacionIA={justificacionIA}
            setJustificacionIA={setJustificacionIA}
            agregarActividadExtra={agregarActividadExtra}
            sugerenciasIA={sugerenciasIA}
            setSugerenciasIA={setSugerenciasIA}
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
