import React, { useState } from 'react';
import './login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log('Login:', email, password);
    navigate('/mapa'); // ← redirección al mapa
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img src="/plania.png" alt="PLANIA" className="login-logo" />
        <h2>Iniciar sesión</h2>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
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

          <button type="submit" onClick={handleLogin}>Ingresar</button>
        </form>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate('/register')}
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default Login;
