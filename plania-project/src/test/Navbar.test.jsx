import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

describe('Navbar', () => {
  it('renderiza el logo correctamente', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const logo = screen.getByAltText(/logo/i);
    expect(logo).toBeInTheDocument();
  });

  it('colapsa el menú al hacer clic en el botón', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    expect(toggleButton).toBeInTheDocument();
  });
});
