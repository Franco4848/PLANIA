import React, { useState } from 'react';
import './register.css';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/AuthService';

function Register() {
  const [nombreDeUsuario, setNombreDeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [intereses, setIntereses] = useState([]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const navigate = useNavigate();

  const opcionesInteres = [
    'Atracciones',
    'Bodegas',
    'Cafeterías',
    'Cines',
    'Galerías',
    'Museos',
    'Parques',
    'Restaurantes'
  ];

  const handleRegister = async () => {
    try {
      await register({
        username: nombreDeUsuario,
        email,
        password,
        intereses,
      });
      alert('Cuenta creada correctamente');
      navigate('/login');
    } catch (err) {
      console.error('Error al registrar:', err);
      alert('No se pudo crear la cuenta');
    }
  };

  const toggleInteres = (interes) => {
    if (intereses.includes(interes)) {
      const nuevos = intereses.filter((i) => i !== interes);
      setIntereses(nuevos);
      if (nuevos.length < 4) setSelectorVisible(true);
      if (nuevos.length === 0) setSelectorVisible(true);
    } else if (intereses.length < 4) {
      const nuevos = [...intereses, interes];
      setIntereses(nuevos);
      if (nuevos.length === 4) setSelectorVisible(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <img src="/PLANIA-LOGOTIPO.png" alt="PLANIA" className="register-logo" />
        <h2>Crear cuenta</h2>

        <form className="register-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={nombreDeUsuario}
            onChange={(e) => setNombreDeUsuario(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label className="intereses-label">Tus intereses (máximo 4)</label>
          <div
            className="intereses-selector"
            onClick={() => {
              if (intereses.length < 4) setSelectorVisible((prev) => !prev);
            }}
          >
            {intereses.map((interes) => (
              <span key={interes} className="interes-tag">
                {interes}
                <FaTimes
                  className="remove-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleInteres(interes);
                  }}
                />
              </span>
            ))}
            {intereses.length === 0 && <span className="placeholder">Seleccionar intereses...</span>}
          </div>

          {selectorVisible && (
            <div className="intereses-dropdown">
              {opcionesInteres.map((opcion) => (
                <div
                  key={opcion}
                  className={`dropdown-item ${
                    intereses.includes(opcion) ? 'selected' : ''
                  } ${intereses.length >= 4 && !intereses.includes(opcion) ? 'disabled' : ''}`}
                  onClick={() => toggleInteres(opcion)}
                >
                  {opcion}
                </div>
              ))}
            </div>
          )}

          <button type="submit" onClick={handleRegister}>Crear cuenta</button>
        </form>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate('/login')}
        >
          ¿Ya tienes cuenta?
        </button>
      </div>
    </div>
  );
}

export default Register;
