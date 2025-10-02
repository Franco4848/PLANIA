import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Mapa = ({ filtroTipo, activeTab, userPosition, rutaDatos }) => {
  const [lugares, setLugares] = useState([]);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rutaCalculada, setRutaCalculada] = useState(null);

  // 🔄 Cargar lugares si estás en la pestaña "filtro"
  useEffect(() => {
    if (!userPosition || activeTab !== 'filtro') return;

    setLoading(true);
    const tipoConsulta = filtroTipo || 'todas';

    fetch(`http://localhost:3000/actividades/buscar?lat=${userPosition.lat}&lng=${userPosition.lng}&tipo=${tipoConsulta}`)
      .then((res) => res.json())
      .then((data) => setLugares(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeTab, filtroTipo, userPosition]);

  // 🧭 Dibujar ruta si se recibe desde IA
  useEffect(() => {
    if (!userPosition || !rutaDatos) return;

    const { destino, waypoints } = rutaDatos;
    if (!destino || !waypoints || waypoints.length === 0) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userPosition,
        destination: destino,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setRutaCalculada(result);
        } else {
          console.error('Error al calcular ruta:', status);
        }
      }
    );
  }, [rutaDatos, userPosition]);

  if (!userPosition) return <p>Obteniendo tu ubicación...</p>;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={userPosition} zoom={16}>
        {/* 📍 Tu ubicación */}
        <Marker
          position={userPosition}
          title="Tu ubicación"
          icon={{
            url: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue.png',
            scaledSize: typeof window !== 'undefined' && window.google
              ? new window.google.maps.Size(40, 40)
              : undefined,
          }}
        />

        {/* 📌 Marcadores si estás en "filtro" */}
        {activeTab === 'filtro' && !loading && lugares.length > 0 &&
          lugares.map((lugar, index) => {
            if (!lugar?.coordenadas?.lat || !lugar?.coordenadas?.lng) return null;

            return (
              <Marker
                key={index}
                position={{
                  lat: lugar.coordenadas.lat,
                  lng: lugar.coordenadas.lng,
                }}
                onClick={() => setSelectedLugar(lugar)}
              />
            );
          })}

        {/* 🗨️ InfoWindow al hacer clic en un marcador */}
        {selectedLugar && (
          <InfoWindow
            position={{
              lat: selectedLugar.coordenadas.lat,
              lng: selectedLugar.coordenadas.lng,
            }}
            onCloseClick={() => setSelectedLugar(null)}
          >
            <div style={{ maxWidth: '200px' }}>
              <h4>{selectedLugar.nombre}</h4>
              <p>{selectedLugar.direccion}</p>
              <p>⭐ {selectedLugar.rating}</p>
            </div>
          </InfoWindow>
        )}

        {/* 🧭 Ruta dibujada si está disponible */}
        {rutaCalculada && (
          <DirectionsRenderer directions={rutaCalculada} />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Mapa;
