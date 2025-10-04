export async function generarRecomendaciones({ lat, lng, intereses }) {
  const res = await fetch('http://localhost:3000/ia/recomendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, intereses })
  });
  const data = await res.json();
  return data.respuesta;
}
