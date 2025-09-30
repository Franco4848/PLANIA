import React from 'react';

const Filtro = ({ filtroTipo, setFiltroTipo }) => {
  return (
    <div style={{ padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem' }}>
      <h4>Filtrar actividades</h4>

      <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ marginBottom: '0.6rem', width: '100%' }}>
        <option value="todas">Todas</option>
        <option value="restaurant">Restaurantes</option>
        <option value="museo">Museos</option>
        <option value="parque">Parques</option>
        <option value="cafetería">Cafeterías</option>
        <option value="cine">Cines</option>
        <option value="galería">Galerías</option>
        <option value="atracción">Atracciones</option>
        <option value="bodega">Bodegas</option>
      </select>

      <input type="number" placeholder="Presupuesto (USD)" style={{ marginBottom: '0.6rem', width: '100%' }} />
      <input type="number" placeholder="Días disponibles" style={{ marginBottom: '0.6rem', width: '100%' }} />

      <button disabled style={{ backgroundColor: '#ccc', cursor: 'not-allowed', width: '100%' }}>
        Aplicar filtros
      </button>
    </div>
  );
};

export default Filtro;