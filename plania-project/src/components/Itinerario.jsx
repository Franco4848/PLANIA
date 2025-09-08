import React, { useEffect, useState } from 'react';

const Itinerario = ({ filtroTipo }) => {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerLugares = async () => {
      try {
        const res = await fetch(`http://localhost:3000/actividades/buscar?lat=-32.99&lng=-68.79&tipo=${filtroTipo}`);
        const data = await res.json();
        setLugares(data);
      } catch (error) {
        console.error('Error al obtener lugares:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerLugares();
  }, [filtroTipo]);

  if (loading) return <p>Cargando actividades cercanas...</p>;
  if (!lugares.length) return <p>No se encontraron actividades.</p>;

  return (
    <div className="itinerario-lista">
      <h4>Actividades cercanas</h4>
      <ul>
        {lugares.map((lugar, index) => (
          <li key={index}>
            <strong>{lugar.nombre}</strong><br />
            {lugar.direccion}<br />
            Rating: {lugar.rating}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Itinerario;