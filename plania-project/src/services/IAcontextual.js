const mapaCategorias = {
  museum: 'museo',
  park: 'parque',
  cafe: 'cafeteria',
  movie_theater: 'cine',
  art_gallery: 'galería',
  winery: 'bodega',
  restaurant: 'restaurante',
  tourist_attraction: 'atracción',
  lodging: 'alojamiento'
};

function traducirCategoria(categoria) {
  return mapaCategorias[categoria] || categoria;
}

export function generarItinerarioInteligente({ lugares, weathercode, temperatura, interesesUsuario = [] }) {
  const lugaresFiltrados = interesesUsuario.length
    ? lugares.filter((lugar) => {
        const categoriaTraducida = traducirCategoria(lugar.categoria);
        return interesesUsuario.includes(categoriaTraducida);
      })
    : lugares;

  const seleccionados = [];
  const tiposIncluidos = new Set();

  for (const lugar of lugaresFiltrados) {
    const tipoTraducido = traducirCategoria(lugar.categoria);

    if (!tiposIncluidos.has(tipoTraducido)) {
      seleccionados.push({
        nombre: lugar.nombre,
        descripcion: generarDescripcionAdaptada({ ...lugar, categoria: tipoTraducido }, weathercode, temperatura),
        coordenadas: lugar.coordenadas
      });
      tiposIncluidos.add(tipoTraducido);
    }

    if (seleccionados.length >= 3) break;
  }

  return seleccionados;
}

function generarDescripcionAdaptada(lugar, weathercode, temperatura) {
  const tipo = lugar.categoria;

  if (weathercode === 0 || weathercode === 1) {
    if (tipo === 'parque') return `${lugar.nombre}: ideal para caminar y relajarte bajo el sol.`;
    if (tipo === 'bodega') return `${lugar.nombre}: recorridos guiados y cata de vinos al aire libre.`;
  }

  if (weathercode >= 61 && weathercode <= 82) {
    if (tipo === 'cafeteria') return `${lugar.nombre}: un refugio cálido para disfrutar café y pastelería.`;
    if (tipo === 'museo') return `${lugar.nombre}: exposiciones bajo techo, perfectas para días lluviosos.`;
  }

  if (temperatura < 10) {
    return `${lugar.nombre}: lugar cerrado y acogedor para combatir el frío.`;
  }

  return `${lugar.nombre}: recomendado según tus intereses y el clima actual.`;
}
