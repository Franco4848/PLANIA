import React, { useState } from 'react';
import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import Itinerario from './components/Itinerario';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [filtroTipo, setFiltroTipo] = useState('todas');

  const tipoParaMapa = filtroTipo;

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ✅ El mapa se renderiza tanto en 'mapa' como en 'itinerario' */}
      {(activeTab === 'mapa' || activeTab === 'itinerario') && (
        <Mapa filtroTipo={tipoParaMapa} activeTab={activeTab} />
      )}

      {/* ✅ Solo se muestra la lista textual si estás en 'itinerario' */}
      {activeTab === 'itinerario' && (
        <Itinerario filtroTipo={filtroTipo} />
      )}

      {/* ✅ Filtro de actividades */}
      {activeTab === 'filtro' && (
        <div className='overlay-content'>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="restaurant">Restaurantes</option>
            <option value="museo">Museos</option>
            <option value="parque">Parques</option>
            <option value="cafetería">Cafeterías</option>
            <option value="cine">Cines</option>
            <option value="galería">Galerías</option>
            <option value="atracción">Atracciones</option>
            <option value="plaza">Plazas</option>
            <option value="bodega">Bodegas</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default App;