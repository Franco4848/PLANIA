import React from 'react';
import './Filtro.css';

const Filtro = ({ filtroTipo, setFiltroTipo }) => {
  return (

    <div className="filtro-card">

      <h4 className="filtro-titulo">Filtrar actividades</h4>

      <select
        className="filtro-select"
        value={filtroTipo}
        onChange={(e) => setFiltroTipo(e.target.value)}
      >
        <option value="todas">Todas</option>
        <option value="cafeterias">Cafeterías</option>
        <option value="restaurantes">Restaurantes</option>
        <option value="museos">Museos</option>
        <option value="parques">Parques</option>
        <option value="galerías">Galerías</option>
        <option value="cines">Cines</option>
        <option value="atracción">Atracciones</option>
        <option value="bodegas">Bodegas</option>
      </select>

    </div>

  );
};

export default Filtro;