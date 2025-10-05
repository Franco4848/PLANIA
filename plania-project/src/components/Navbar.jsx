// import React from 'react';
// import './Navbar.css';
// import {FaMapMarkedAlt, FaWineGlassAlt, FaUser } from 'react-icons/fa';

// const Navbar = ({ activeTab, setActiveTab }) => {
//     return (
//         <nav className='navbar-container'>

//             {/* Opción 1: Mapa */}
//             <div 
//                 claseName = {`nav-item ${activeTab === 'mapa' ? 'active' : ''}`}
//                 onClick ={() => setActiveTab('mapa')}
//                 title = "Mapa"
//                 >
//                     < FaMapMarkedAlt size={28} />
//                 </div>

//             {/* Opción 2: Bodegas para el futuro */}
//             <div
//                 className={`nav-item ${activeTab === 'bodegas' ? 'active' : '' }`}
//                 onClick = {() => setActiveTab('bodegas')}
//                 title="Bodegas"
//                 >
//                     <FaWineGlassAlt size={28} />
//                 </div>

//             {/* Opción 2: Bodegas para el futuro */}
//             <div
//                 className = {`nav-item ${activeTab === 'perfil' ? 'acive' : ''}`}
//                 onClick={ () => setActiveTab ('perfil')}
//                 title = "Mi Perfil"
//                 >
//                 <FaUser size={28}/>
//             </div>
//         </nav>
//     );
// };
// export default Navbar;

// src/components/Navbar.jsx
// src/components/Navbar.jsx

import React from 'react';
import './Navbar.css';
import {
  FaMapMarkedAlt,
  FaListAlt,
  FaUser,
  FaCompass,
  FaCloud,
  FaFilter,
  FaRobot // ✅ ícono de IA
} from 'react-icons/fa';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar-container">
      {/* Encabezado o Logo de la App */}
      <div className="navbar-header">
        <img src='/plania.png' className="logo" alt='logo de PlanIA' />
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

        {/* 4. Filtro */}
        <div
          className={`nav-item ${activeTab === 'filtro' ? 'active' : ''}`}
          onClick={() => setActiveTab('filtro')}
        >
          <FaFilter size={22} />
          <span className="nav-text">Filtro</span>
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
      </div>
    </nav>
  );
};

export default Navbar;