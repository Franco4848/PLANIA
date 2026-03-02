import { useEffect, useState } from 'react';
import axios from 'axios';
import './UsuariosAdmin.css';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', interests: [] });
  const [modoEdicion, setModoEdicion] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const token = localStorage.getItem('token');

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios', err);
      setMensaje('Error al cargar usuarios.');
    }
  };

  const handleSubmit = async () => {
    try {
      if (modoEdicion) {
        await axios.put(`http://localhost:3000/users/${modoEdicion}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Usuario actualizado correctamente.');
      } else {
        await axios.post('http://localhost:3000/users/register', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Usuario creado correctamente.');
      }
      setForm({ name: '', email: '', password: '', role: '', interests: [] });
      setModoEdicion(null);
      fetchUsuarios();
    } catch (err) {
      console.error('Error al guardar usuario', err);
      setMensaje('Error al guardar usuario.');
    }
  };

  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de que querés eliminar este usuario?');
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('Usuario eliminado correctamente.');
      fetchUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario', err);
      setMensaje('Error al eliminar usuario.');
    }
  };

  const handleEdit = (usuario) => {
    setForm({
      name: usuario.name || '',
      email: usuario.email || '',
      password: '',
      role: usuario.role || '',
      interests: usuario.interests || []
    });
    setModoEdicion(usuario._id);
    setMensaje('Editando usuario...');
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="usuarios-admin-container">
      <h2>Gestón de usuarios</h2>

      {mensaje && <div className="mensaje-alerta">{mensaje}</div>}

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Intereses</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{u.interests?.join(', ')}</td>
              <td>
                <button className="btn-editar" onClick={() => handleEdit(u)}>Editar</button>
                <button className="btn-eliminar" onClick={() => eliminarUsuario(u._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{modoEdicion ? 'Editar usuario' : 'Agregar nuevo usuario'}</h3>
      <form className="usuario-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
        <input
          type="text"
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        {!modoEdicion && (
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        )}
        <input
          placeholder="Rol"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          required
        />
        <input
          placeholder="Intereses (separados por coma)"
          value={form.interests.join(', ')}
          onChange={e => setForm({ ...form, interests: e.target.value.split(',').map(i => i.trim()) })}
        />
        <button className="btn-confirmar" type="submit">{modoEdicion ? 'Actualizar' : 'Crear'}</button>
      </form>
    </div>
  );
}
