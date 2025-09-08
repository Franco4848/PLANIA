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

import React from 'react';
import './Navbar.css';
import {
  FaMapMarkedAlt,
  FaListAlt,
  FaUser,
  FaCompass,
  FaCloud,
  FaFilter
} from 'react-icons/fa'; // Íconos 

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navbar-container">
      {/* Encabezado o Logo de la App */}
      <div className="navbar-header">
        <img src='./public/plania.png' className="logo" alt='logo de PlanIA' />
        {/* <span className="navbar-title">PlanIA</span> */}
      </div>

      {/* Cuerpo de la navegación */}
      <div className="navbar-body">
        <div
          className={`nav-item ${activeTab === 'mapa' ? 'active' : ''}`}
          onClick={() => setActiveTab('mapa')}
        >
          <FaMapMarkedAlt size={22} />
          <span className="nav-text">Mapa Interactivo</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'itinerario' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerario')}
        >
          <FaListAlt size={22} />
          <span className="nav-text">Itinerario</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'filtro' ? 'active' : ''}`}
          onClick={() => setActiveTab('filtro')}
        >
          <FaFilter size={22} />
          <span className="nav-text">Filtro</span>
        </div>

        <div
          className={`nav-item ${activeTab === 'clima' ? 'active' : ''}`}
          onClick={() => setActiveTab('nube')}
        >
          <FaCloud size={22} />
          <span className="nav-text">Clima</span>
        </div>

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