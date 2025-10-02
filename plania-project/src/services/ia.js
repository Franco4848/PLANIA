const API_URL = 'http://localhost:3000';

export const generarItinerario = async (prompt, userPosition, filtros) => {
  try {
    const response = await fetch(`${API_URL}/ia/itinerario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        userPosition,
        filtros,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Error al generar itinerario';
      console.error('❌ Error del servidor:', errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error en generarItinerario:', error);
    throw error;
  }
};
