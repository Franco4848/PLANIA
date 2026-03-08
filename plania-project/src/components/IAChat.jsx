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

      <h2 className="ia-titulo">🤖 Planificador Inteligente</h2>

      <p className="ia-subtitle">
        La inteligencia artificial analizará tu presupuesto,
        tiempo disponible y preferencias para generar
        un itinerario personalizado.
      </p>

      {!justificacionIA ? (

        <>
          <div className="ia-input-group">

            <label className="ia-label">
              💵 Presupuesto disponible
              <span className="ia-aviso"> (10 a 200 USD)</span>
            </label>

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

          <div className="ia-input-group">

            <label className="ia-label">
              🧑‍🤝‍🧑 Personas
              <span className="ia-aviso"> (máximo 4)</span>
            </label>

            <input
              type="number"
              min="1"
              max="4"
              value={cantidadPersonas}
              onChange={(e) => setCantidadPersonas(Number(e.target.value))}
              className="ia-input-number"
            />

          </div>

          <div className="ia-input-group">

            <label className="ia-label">
              📅 Días
              <span className="ia-aviso"> (máximo 3)</span>
            </label>

            <input
              type="number"
              min="1"
              max="3"
              value={cantidadDias}
              onChange={(e) => setCantidadDias(Number(e.target.value))}
              className="ia-input-number"
            />

          </div>

          <button
            onClick={consultarIA}
            disabled={loading}
            className="boton-azul"
          >
            {loading ? "Generando itinerario..." : "Generar itinerario"}
          </button>
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

          <button
            onClick={reiniciarConsulta}
            className="boton-azul"
          >
            Regenerar recomendación
          </button>
        </>
      )}

    </div>
  );
}