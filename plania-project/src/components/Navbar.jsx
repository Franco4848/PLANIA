import React from 'react';
import { NavLink } from 'react-router-dom';
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

const Navbar = () => {
  const navItems = [
    { to: '/mapa', icon: <FaMapMarkedAlt size={22} />, label: 'Mapa Interactivo' },
    { to: '/ia', icon: <FaRobot size={22} />, label: 'IA' },
    { to: '/itinerario', icon: <FaListAlt size={22} />, label: 'Itinerario' },
    { to: '/filtro', icon: <FaMapMarkerAlt size={22} />, label: 'Actividades cercanas' },
    { to: '/nube', icon: <FaCloud size={22} />, label: 'Clima' },
    { to: '/perfil', icon: <FaUser size={22} />, label: 'Mi Perfil' },
    { to: '/sugerencias', icon: <FaCommentDots size={22} />, label: 'Sugerencias' }
  ];

  return (
    <nav className="navbar-container">
      <div className="navbar-header">
        <img src="/plania.png" className="logo" alt="logo de PlanIA" />
      </div>

      <div className="navbar-body">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {icon}
            <span className="nav-text">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
