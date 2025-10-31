import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import Filtro from './components/Filtro';
import Clima from './components/Clima';
import IAChat from './components/IAChat';
import ItinerarioInteligente from './components/ItinerarioInteligente';
import Sugerencias from './components/Sugerencias';
import PerfilUsuario from './components/PerfilUsuario';
import './App.css';

function App() {
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [userPosition, setUserPosition] = useState(null);
  const [rutaDatos, setRutaDatos] = useState(null);
  const [actividadesIA, setActividadesIA] = useState([]);
  const [actividadesVisiblesIA, setActividadesVisiblesIA] = useState([]);
  const [sugerenciasIA, setSugerenciasIA] = useState([]);
  const [justificacionIA, setJustificacionIA] = useState('');
  const [mapKey, setMapKey] = useState(0);

  // Parámetros persistentes para sección IA
  const [presupuesto, setPresupuesto] = useState(10);
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [cantidadDias, setCantidadDias] = useState(1);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      () => setUserPosition({ lat: -32.89, lng: -68.82 }) // fallback Maipú
    );
  }, []);

  const recibirActividadesIA = (lista) => {
    setActividadesIA(lista);
    setActividadesVisiblesIA(lista);
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
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route
            path="/mapa"
            element={
              <Mapa
                key={mapKey}
                filtroTipo={filtroTipo}
                activeTab="mapa"
                userPosition={userPosition}
                rutaDatos={rutaDatos}
              />
            }
          />
          <Route
            path="/filtro"
            element={
              <>
                <Mapa
                  key={mapKey}
                  filtroTipo={filtroTipo}
                  activeTab="filtro"
                  userPosition={userPosition}
                  rutaDatos={rutaDatos}
                />
                <div className="overlay-content">
                  <Filtro filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} />
                </div>
              </>
            }
          />
          <Route
            path="/nube"
            element={
              <>
                <Mapa
                  key={mapKey}
                  filtroTipo={filtroTipo}
                  activeTab="nube"
                  userPosition={userPosition}
                  rutaDatos={rutaDatos}
                />
                <div className="overlay-content">
                  <Clima userPosition={userPosition} />
                </div>
              </>
            }
          />
          <Route
            path="/ia"
            element={
              <>
                <Mapa
                  key={mapKey}
                  filtroTipo={filtroTipo}
                  activeTab="ia"
                  userPosition={userPosition}
                  rutaDatos={rutaDatos}
                />
                <div className="overlay-content">
                  <IAChat
                    userPosition={userPosition}
                    interesesUsuario={['cine', 'parque', 'museo', 'restaurante']}
                    onActividadesGeneradas={recibirActividadesIA}
                    onSugerenciasGeneradas={recibirSugerenciasIA}
                    justificacionIA={justificacionIA}
                    setJustificacionIA={setJustificacionIA}
                    actividadesVisiblesIA={actividadesVisiblesIA}
                    presupuesto={presupuesto}
                    setPresupuesto={setPresupuesto}
                    cantidadPersonas={cantidadPersonas}
                    setCantidadPersonas={setCantidadPersonas}
                    cantidadDias={cantidadDias}
                    setCantidadDias={setCantidadDias}
                  />
                </div>
              </>
            }
          />
          <Route
            path="/itinerario"
            element={
              <>
                <Mapa
                  key={mapKey}
                  filtroTipo={filtroTipo}
                  activeTab="itinerario"
                  userPosition={userPosition}
                  rutaDatos={rutaDatos}
                />
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
                    cantidadDias={cantidadDias}
                  />
                </div>
              </>
            }
          />
          <Route
            path="/sugerencias"
            element={
              <>
                <Mapa
                  key={mapKey}
                  filtroTipo={filtroTipo}
                  activeTab="sugerencias"
                  userPosition={userPosition}
                  rutaDatos={rutaDatos}
                />
                <div className="overlay-content">
                  <Sugerencias />
                </div>
              </>
            }
          />
          <Route
            path="/perfil"
            element={
              <>
                <Mapa
                  key={mapKey}
                  filtroTipo={filtroTipo}
                  activeTab="perfil"
                  userPosition={userPosition}
                  rutaDatos={rutaDatos}
                />
                <div className="overlay-content">
                  <PerfilUsuario />
                </div>
              </>
            }
          />
          <Route
            path="*"
            element={
              <Mapa
                key={mapKey}
                filtroTipo={filtroTipo}
                activeTab="mapa"
                userPosition={userPosition}
                rutaDatos={rutaDatos}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;