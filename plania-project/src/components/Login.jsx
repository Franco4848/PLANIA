import React, { useState, useEffect } from 'react';
import './login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/AuthService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/mapa');
    }
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor completá todos los campos.');
      return;
    }

    try {
      const res = await login({ email, password });
      const { access_token } = res;

      if (!access_token) {
        setErrorMessage('No se recibió token. Verificá credenciales o conexión.');
        return;
      }

      localStorage.setItem('token', access_token);

      const base64 = access_token.split('.')[1];
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);

      navigate('/mapa');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      const msg = err?.response?.data?.message || 'Credenciales inválidas o error de conexión';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img src="/PLANIA-LOGOTIPO.png" alt="PLANIA" className="login-logo" />
        <h2>Iniciar sesión</h2>

        {errorMessage && (
          <p className="error-message" role="alert">{errorMessage}</p>
        )}

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
