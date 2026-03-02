import React from 'react';
import { useSugerenciasAdmin } from '../hook/useSugerenciasAdmin';
import './SugerenciasAdmin.css';

const SugerenciasAdmin = () => {
  const { sugerencias, loading, error } = useSugerenciasAdmin();

  return (
    <div className="admin-panel">
      <h2>Gestión de Sugerencias</h2>

      {loading && <p>Cargando sugerencias...</p>}
      {error && <p className="error">Error al cargar sugerencias.</p>}

      {!loading && !error && sugerencias.length === 0 && (
        <p>No hay sugerencias registradas.</p>
      )}

      {!loading && !error && sugerencias.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {sugerencias.map((s) => (
              <tr key={s._id}>
                <td>{s.emailAutor}</td>
                <td>{s.mensaje}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SugerenciasAdmin;
