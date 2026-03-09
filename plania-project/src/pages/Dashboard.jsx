import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard({ sidebarCollapsed }) {
  const navigate = useNavigate();

  return (
    <div
      className={`dashboard-wrapper ${
        sidebarCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Bienvenida 👋</h1>
          <p>
            Explorá, planificá y optimizá tu experiencia turística con
            inteligencia artificial.
          </p>
        </div>

        {/* Contenedor en dos columnas */}
        <div className="cards-row">
          {/* Tarjeta: Tutorial interactivo */}
          <div className="hero-card">
            <div className="hero-content">
              <h2>📘 Manual de usuario</h2>
              <p>
                Aprendé cómo navegar y aprovechar todas las funciones de la app web
                con este tutorial interactivo.
              </p>
              <div className="iframe-wrapper">
                <iframe
                  src="https://view.genially.com/69a8badbc0c6893083d3b516"
                  title="Tutorial interactivo"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Tarjeta: Planificar con IA */}
          <div
            className="hero-card planificar-ia"
            onClick={() => navigate("/ia")}
          >
            <div className="hero-content">
              <h2>🤖 Planificar con IA</h2>
              <p>
                Generá un itinerario inteligente adaptado a tus intereses,
                presupuesto y disponibilidad.
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/ia");
                }}
              >
                Comenzar planificación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
