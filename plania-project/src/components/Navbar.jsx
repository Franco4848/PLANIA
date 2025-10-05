import React from 'react';
import './Navbar.css';
import {
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaListAlt,
  FaUser,
  FaCloud,
  FaRobot,
  FaCommentDots
} from 'react-icons/fa';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar-container">
      {/* Encabezado o Logo de la App */}
      <div className="navbar-header">
        <img src='./public/plania.png' className="logo" alt='logo de PlanIA' />
      </div>

      {/* Cuerpo de la navegación */}
      <div className="navbar-body">
        {/* 1. Mapa */}
        <div
          className={`nav-item ${activeTab === 'mapa' ? 'active' : ''}`}
          onClick={() => setActiveTab('mapa')}
        >
          <FaMapMarkedAlt size={22} />
          <span className="nav-text">Mapa Interactivo</span>
        </div>

        {/* 2. IA */}
        <div
          className={`nav-item ${activeTab === 'ia' ? 'active' : ''}`}
          onClick={() => setActiveTab('ia')}
        >
          <FaRobot size={22} />
          <span className="nav-text">IA</span>
        </div>

        {/* 3. Itinerario */}
        <div
          className={`nav-item ${activeTab === 'itinerario' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerario')}
        >
          <FaListAlt size={22} />
          <span className="nav-text">Itinerario</span>
        </div>

        {/* 4. Actividades cercanas */}
        <div
          className={`nav-item ${activeTab === 'filtro' ? 'active' : ''}`}
          onClick={() => setActiveTab('filtro')}
        >
          <FaMapMarkerAlt size={22} />
          <span className="nav-text">Actividades cercanas</span>
        </div>

        {/* 5. Clima */}
        <div
          className={`nav-item ${activeTab === 'nube' ? 'active' : ''}`}
          onClick={() => setActiveTab('nube')}
        >
          <FaCloud size={22} />
          <span className="nav-text">Clima</span>
        </div>

        {/* 6. Perfil */}
        <div
          className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfil')}
        >
          <FaUser size={22} />
          <span className="nav-text">Mi Perfíl</span>
        </div>

        {/* 7. Sugerencias */}
        <div
          className={`nav-item ${activeTab === 'sugerencias' ? 'active' : ''}`}
          onClick={() => setActiveTab('sugerencias')}
        >
          <FaCommentDots size={22} />
          <span className="nav-text">Sugerencias</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
