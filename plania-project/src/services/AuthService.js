import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const login = async ({ email, password }) => {
  const payload = { email, password };
  const response = await axios.post(`${API_URL}/auth/login`, payload);
  return response.data; // { access_token: '...' }
};

export const register = async ({ email, password, intereses }) => {
  const payload = {
    name: email.split('@')[0], // nombre de usuario derivado del email
    email,
    password,
    role: 'user',
    interests: intereses.map((i) => i.toLowerCase()), // intereses en minúsculas
  };
  const response = await axios.post(`${API_URL}/users/register`, payload);
  return response.data;
};
