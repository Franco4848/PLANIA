import axios from 'axios';

const API_URL = 'http://localhost:3000/rutas';

export const guardarRuta = async (rutaDatos) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/guardar`, rutaDatos, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const obtenerRutasDelUsuario = async () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/mias`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const eliminarRuta = async (id) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
