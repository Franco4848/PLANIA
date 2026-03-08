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
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (token) {
      navigate('/dashboard');
    }

  }, [navigate]);

  const handleLogin = async () => {

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor completá todos los campos.');
      return;
    }

    try {

      setLoading(true);

      const res = await login({ email, password });

      const { access_token } = res;

      if (!access_token) {
        setErrorMessage('No se recibió token.');
        return;
      }

      localStorage.setItem('token', access_token);

      navigate('/dashboard');

    } catch (err) {

      console.error(err);

      const msg =
        err?.response?.data?.message ||
        'Credenciales inválidas o error de conexión';

      setErrorMessage(msg);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="login-wrapper">

      <div className="login-container">

        <img
          src="/PLANIA-LOGOTIPO.png"
          alt="PlanIA"
          className="login-logo"
        />

        <h2>Iniciar sesión</h2>

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >

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

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>

          <button type="submit">

            {loading ? "Ingresando..." : "Ingresar"}

          </button>

        </form>

        <button
          className="secondary-btn"
          onClick={() => navigate('/register')}
        >
          Crear cuenta
        </button>

      </div>

    </div>
  );
}

export default Login;