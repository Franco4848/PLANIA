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
            Explorá, planificá y optimizá tu experiencia enoturística con
            inteligencia artificial.
          </p>
        </div>

        <div
          className="hero-card"
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
  );
}

export default Dashboard;