import React from 'react';

const Filtro = ({ filtroTipo, setFiltroTipo }) => {
  return (
    <div style={{
      padding: '0.8rem',
      border: '1px solid #ccc',
      borderRadius: '6px',
      fontSize: '0.9rem'
    }}>
      <h4>Filtrar actividades</h4>

      <select
        value={filtroTipo}
        onChange={(e) => setFiltroTipo(e.target.value)}
        style={{ marginBottom: '0.6rem', width: '100%' }}
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
