import React, { useState } from "react";
import { generarRecomendaciones } from "../services/IAservice";
import "./IAChat.css";

export default function IAChat({
  userPosition,
  interesesUsuario,
  onActividadesGeneradas,
  onSugerenciasGeneradas,
  justificacionIA,
  setJustificacionIA,
  presupuesto,
  setPresupuesto,
  cantidadPersonas,
  setCantidadPersonas,
  cantidadDias,
  setCantidadDias
}) {
  const [loading, setLoading] = useState(false);

  const validarCampos = () => {
    if (!userPosition || interesesUsuario.length === 0) return false;
    if (presupuesto < 10 || presupuesto > 200) return false;
    if (cantidadPersonas < 1 || cantidadPersonas > 4) return false;
    if (cantidadDias < 1 || cantidadDias > 3) return false;
    return true;
  };

  const consultarIA = () => {
    if (!validarCampos()) {
      alert(
        "Completá correctamente los campos.\nPresupuesto: $10-$200\nPersonas: máximo 4\nDías: máximo 3"
      );
      return;
    }

    setLoading(true);

    generarRecomendaciones({
      lat: userPosition.lat.toString(),
      lng: userPosition.lng.toString(),
      intereses: interesesUsuario,
      presupuesto: Number(presupuesto),
      personas: cantidadPersonas,
      dias: cantidadDias
    })
      .then((data) => {
        if (!data || !data.respuesta || !Array.isArray(data.lugares)) {
          console.error("Respuesta incompleta de IA:", data);
          return;
        }

        setJustificacionIA(data.respuesta);

        const agrupadas = new Map();
        const seleccionadas = [];
        const sugerencias = [];

        for (const lugar of data.lugares) {
          const categoria = lugar.categoria;
          if (!agrupadas.has(categoria)) {
            agrupadas.set(categoria, []);
          }
          agrupadas.get(categoria).push(lugar);
        }

        for (const lista of agrupadas.values()) {
          if (lista[0]) seleccionadas.push(lista[0]);
          sugerencias.push(...lista.slice(1));
        }

        onActividadesGeneradas(seleccionadas);
        onSugerenciasGeneradas(sugerencias);
      })
      .catch((err) => console.error("Error IA:", err))
      .finally(() => setLoading(false));
  };

  const renderJustificacion = (texto) => {
    return texto
      .split("\n")
      .filter((linea) => linea.trim() !== "")
      .map((linea, index) => (
        <div key={index} className="ia-linea">
          {linea}
        </div>
      ));
  };

  const reiniciarConsulta = () => {
    setJustificacionIA(null);
    setPresupuesto(10);
    setCantidadPersonas(1);
    setCantidadDias(1);
  };

  return (
    <div className="ia-container">
      <div className="ia-scroll">
        <h2 className="ia-titulo">🤖 Planificador Inteligente</h2>
        <p className="ia-subtitle">
          La inteligencia artificial analizará tu presupuesto,
          tiempo disponible y preferencias para generar
          un itinerario personalizado.
        </p>

        {!justificacionIA ? (
          <>
            <div className="ia-cards-row">
              {/* Tarjeta Presupuesto */}
              <div className="ia-card">
                <h3 className="ia-card-title">💵 Presupuesto</h3>
                <p className="ia-card-subtitle">(10 a 200 USD)</p>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(Number(e.target.value))}
                  className="ia-slider"
                />
                <div className="ia-rango-info">
                  Seleccionado: <strong>${presupuesto}</strong>
                </div>
              </div>

              {/* Tarjeta Personas */}
              <div className="ia-card">
                <h3 className="ia-card-title">🧑‍🤝‍🧑 Personas</h3>
                <p className="ia-card-subtitle">(máximo 4)</p>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={cantidadPersonas}
                  onChange={(e) => setCantidadPersonas(Number(e.target.value))}
                  className="ia-input-number"
                />
              </div>

              {/* Tarjeta Días */}
              <div className="ia-card">
                <h3 className="ia-card-title">📅 Días</h3>
                <p className="ia-card-subtitle">(máximo 3)</p>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={cantidadDias}
                  onChange={(e) => setCantidadDias(Number(e.target.value))}
                  className="ia-input-number"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="ia-parametros">
              <h4>Parámetros seleccionados</h4>
              <ul>
                <li>💵 Presupuesto: ${presupuesto}</li>
                <li>🧑‍🤝‍🧑 Personas: {cantidadPersonas}</li>
                <li>📅 Días: {cantidadDias}</li>
              </ul>
            </div>

            <div className="ia-justificacion">
              <h4>🧠 Recomendación de la IA</h4>
              {renderJustificacion(justificacionIA)}
            </div>
          </>
        )}
      </div>

      <div className="ia-footer">
        {!justificacionIA ? (
          <button
            onClick={consultarIA}
            disabled={loading}
            className="boton-azul"
          >
            {loading ? "Generando itinerario..." : "Generar itinerario"}
          </button>
        ) : (
          <button onClick={reiniciarConsulta} className="boton-azul">
            Regenerar recomendación
          </button>
        )}
      </div>
    </div>
  );
}
