import React, { useState } from 'react';
import { generarItinerario } from '../services/ia';

const TIPOS_DISPONIBLES = [
  { id: 'museo', label: 'Museos', emoji: '🏛️' },
  { id: 'restaurante', label: 'Restaurantes', emoji: '🍽️' },
  { id: 'parque', label: 'Parques', emoji: '🌳' },
  { id: 'cafetería', label: 'Cafeterías', emoji: '☕' },
  { id: 'galería', label: 'Galerías', emoji: '🎨' },
  { id: 'cine', label: 'Cines', emoji: '🎬' },
];

const ChatIA = ({ userPosition, onItinerarioGenerado }) => {
  const [prompt, setPrompt] = useState('');
  const [filtros, setFiltros] = useState({
    tipos: [],
    presupuesto: { min: 0, max: 100000 },
    dias: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleTipo = (tipo) => {
    setFiltros((prev) => ({
      ...prev,
      tipos: prev.tipos.includes(tipo)
        ? prev.tipos.filter((t) => t !== tipo)
        : [...prev.tipos, tipo],
    }));
  };

  const handleGenerar = async () => {
    if (!prompt.trim()) {
      setError('Por favor, describe tu viaje ideal');
      return;
    }

    if (!userPosition) {
      setError('Esperando ubicación...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await generarItinerario(prompt, userPosition, filtros);
      onItinerarioGenerado(resultado);
    } catch (err) {
      const errorMsg = err.message || 'Error al generar itinerario. Intenta nuevamente.';
      setError(errorMsg);
      console.error('❌ Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-ia-container">
      <div className="filtros-section">
        <h3>🎯 Personaliza tu itinerario</h3>

        {/* Días */}
        <div className="filtro-grupo">
          <label>Días:</label>
          <input
            type="number"
            min="1"
            max="7"
            value={filtros.dias}
            onChange={(e) =>
              setFiltros({ ...filtros, dias: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        {/* Presupuesto */}
        <div className="filtro-grupo">
          <label>
            Presupuesto: ${filtros.presupuesto.min.toLocaleString()} - $
            {filtros.presupuesto.max.toLocaleString()}
          </label>
          <input
            type="range"
            min="0"
            max="200000"
            step="10000"
            value={filtros.presupuesto.max}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                presupuesto: { ...filtros.presupuesto, max: parseInt(e.target.value) },
              })
            }
          />
        </div>

        {/* Tipos */}
        <div className="filtro-grupo">
          <label>Tipos de lugares:</label>
          <div className="tipos-chips">
            {TIPOS_DISPONIBLES.map((tipo) => (
              <button
                key={tipo.id}
                className={`chip ${filtros.tipos.includes(tipo.id) ? 'active' : ''}`}
                onClick={() => toggleTipo(tipo.id)}
              >
                {tipo.emoji} {tipo.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="chat-section">
        <label>💬 Describe tu viaje ideal:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Quiero un itinerario relajado con naturaleza y buena gastronomía"
          rows="4"
          disabled={loading}
        />

        <button onClick={handleGenerar} disabled={loading} className="btn-generar">
          {loading ? 'Generando...' : 'Generar itinerario'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default ChatIA;
