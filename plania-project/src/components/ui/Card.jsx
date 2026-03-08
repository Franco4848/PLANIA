import "./Card.css";

export default function Card({ title, icon, children }) {
  return (
    <div className="app-card">
      <div className="card-header">
        {icon && <span className="card-icon">{icon}</span>}
        <h3>{title}</h3>
      </div>

      <div className="card-body">
        {children}
      </div>
    </div>
  );
}