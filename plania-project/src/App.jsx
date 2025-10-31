import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';

import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import Filtro from './components/Filtro';
import Clima from './components/Clima';
import IAChat from './components/IAChat';
import ItinerarioInteligente from './components/ItinerarioInteligente';
import Sugerencias from './components/Sugerencias';
import PerfilUsuario from './components/PerfilUsuario';
import Login from './components/Login';
import Register from './components/Register';

import './App.css';

function AppContent() {
  const location = useLocation();

  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [userPosition, setUserPosition] = useState(null);
  const [rutaDatos, setRutaDatos] = useState(null);
  const [actividadesIA, setActividadesIA] = useState([]);
  const [actividadesVisiblesIA, setActividadesVisiblesIA] = useState([]);
  const [sugerenciasIA, setSugerenciasIA] = useState([]);
  const [justificacionIA, setJustificacionIA] = useState('');
  const [mapKey, setMapKey] = useState(0);

  const [presupuesto, setPresupuesto] = useState(10);
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [cantidadDias, setCantidadDias] = useState(1);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      () => setUserPosition({ lat: -32.89, lng: -68.82 })
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
    <div className="app-container">
      {location.pathname !== '/login' && location.pathname !== '/register' && <Navbar />}

      <Routes>
        {/* Redirección desde raíz */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas principales */}
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

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate to="/login" />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
