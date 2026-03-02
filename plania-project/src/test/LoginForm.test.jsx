import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/Login';
import axios from 'axios';

vi.mock('axios');

describe('LoginForm', () => {
  it('renderiza los campos de email y contraseña', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
  });

  it('muestra error si se envía vacío', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/completá todos los campos/i);
  });

  it('muestra error si el backend responde con 401', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 401,
        data: { message: 'Credenciales inválidas' },
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/correo electrónico/i), {
      target: { value: 'usuario@correo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: '123456' },
    });

    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/credenciales inválidas/i);
  });
});
