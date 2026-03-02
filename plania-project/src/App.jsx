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
import RutaPrivada from './components/RutaPrivada';
import UsuariosAdmin from './components/UsuariosAdmin';
import SugerenciasAdmin from './components/SugerenciasAdmin';

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
  const [interesesUsuario, setInteresesUsuario] = useState([]);

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

    const decodePayload = (token) => {
      try {
        const base64 = token.split('.')[1];
        const json = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(json);
      } catch (err) {
        console.error('Error al decodificar el token:', err);
        return null;
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodePayload(token);
      if (payload && Array.isArray(payload.interests)) {
        setInteresesUsuario(payload.interests);
      }
    }
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
      {location.pathname !== '/login' && location.pathname !== '/register' && (
        <Navbar />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/mapa"
          element={
            <RutaPrivada>
              <Mapa
                key={mapKey}
                filtroTipo={filtroTipo}
                activeTab="mapa"
                userPosition={userPosition}
                rutaDatos={rutaDatos}
              />
            </RutaPrivada>
          }
        />
        <Route
          path="/filtro"
          element={
            <RutaPrivada>
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
            </RutaPrivada>
          }
        />
        <Route
          path="/nube"
          element={
            <RutaPrivada>
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
            </RutaPrivada>
          }
        />
        <Route
          path="/ia"
          element={
            <RutaPrivada>
              {interesesUsuario.length === 0 ? (
                <div className="overlay-content">
                  <p>Cargando intereses del usuario...</p>
                </div>
              ) : (
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
                      interesesUsuario={interesesUsuario}
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
              )}
            </RutaPrivada>
          }
        />
        <Route
          path="/itinerario"
          element={
            <RutaPrivada>
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
                    interesesUsuario={interesesUsuario}
                    justificacionIA={justificacionIA}
                    setJustificacionIA={setJustificacionIA}
                    agregarActividadExtra={agregarActividadExtra}
                    sugerenciasIA={sugerenciasIA}
                    setSugerenciasIA={setSugerenciasIA}
                    cantidadDias={cantidadDias}
                  />
                </div>
              </>
            </RutaPrivada>
          }
        />
        <Route
          path="/sugerencias"
          element={
            <RutaPrivada>
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
            </RutaPrivada>
          }
        />
        <Route
          path="/perfil"
          element={
            <RutaPrivada>
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
            </RutaPrivada>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RutaPrivada requiredRole="admin">
              <UsuariosAdmin />
            </RutaPrivada>
          }
        />
        <Route
          path="/sugerencias-admin"
          element={
            <RutaPrivada requiredRole="admin">
              <SugerenciasAdmin />
            </RutaPrivada>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
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
