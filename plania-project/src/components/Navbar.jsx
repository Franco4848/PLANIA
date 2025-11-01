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
  FaCommentDots,
  FaUsers,
  FaClipboardCheck
} from 'react-icons/fa';

const Navbar = () => {
  const token = localStorage.getItem('token');
  let rolUsuario = null;

  if (token) {
    try {
      const base64 = token.split('.')[1];
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      rolUsuario = payload.role;
    } catch (err) {
      console.error('Error al decodificar token en Navbar:', err);
    }
  }

  const navItems = [
    { to: '/mapa', icon: <FaMapMarkedAlt size={22} />, label: 'Mapa Interactivo' },
    { to: '/ia', icon: <FaRobot size={22} />, label: 'IA' },
    { to: '/itinerario', icon: <FaListAlt size={22} />, label: 'Itinerario' },
    { to: '/filtro', icon: <FaMapMarkerAlt size={22} />, label: 'Actividades cercanas' },
    { to: '/nube', icon: <FaCloud size={22} />, label: 'Clima' },
    { to: '/perfil', icon: <FaUser size={22} />, label: 'Mi Perfil' }
  ];

  const userItems = [
    { to: '/sugerencias', icon: <FaCommentDots size={22} />, label: 'Sugerencias' }
  ];

  const adminItems = [
    { to: '/usuarios', icon: <FaUsers size={22} />, label: 'Usuarios' },
    { to: '/sugerencias-admin', icon: <FaClipboardCheck size={22} />, label: 'Sugerencias Admin' }
  ];

  const visibleItems = [
    ...navItems,
    ...(rolUsuario === 'admin' ? adminItems : userItems)
  ];

  return (
    <nav className="navbar-container">
      <div className="navbar-header">
        <img src="/plania.png" className="logo" alt="logo de PlanIA" />
      </div>

      <div className="navbar-body">
        {visibleItems.map(({ to, icon, label }) => (
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
