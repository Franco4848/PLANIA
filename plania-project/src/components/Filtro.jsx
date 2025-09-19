import React from 'react';

const Filtro = ({ filtroTipo, setFiltroTipo }) => {
  return (
    <div className="filtro-container">
      <h4>Filtrar actividades cercanas</h4>
      <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
        <option value="todas">Todas</option>
        <option value="restaurant">Restaurantes</option>
        <option value="museo">Museos</option>
        <option value="parque">Parques y Plazas</option>
        <option value="cafetería">Cafeterías</option>
        <option value="cine">Cines</option>
        <option value="galería">Galerías</option>
        <option value="atracción">Atracciones</option>
        <option value="bodega">Bodegas</option>
      </select>
    </div>
  );
};

export default Filtro;
