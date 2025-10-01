import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsRenderer
} from '@react-google-maps/api';
import { FaCrosshairs } from 'react-icons/fa';
import './PrecisionButton.css';

const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Mapa = ({ filtroTipo, activeTab, userPosition, rutaDatos }) => {
  const [lugares, setLugares] = useState([]);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rutaCalculada, setRutaCalculada] = useState(null);
  const [mapRef, setMapRef] = useState(null);

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

  if (!userPosition) return <div>Obteniendo tu ubicación...</div>;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userPosition}
        zoom={16}
        onLoad={(map) => setMapRef(map)}
        options={{ gestureHandling: 'greedy', fullscreenControl: false }}
      >
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
              {selectedLugar.presupuesto && (
                <p>💰 Presupuesto: {selectedLugar.presupuesto}</p>
              )}
            </div>
          </InfoWindow>
        )}

        {rutaCalculada && (
          <DirectionsRenderer directions={rutaCalculada} />
        )}
      </GoogleMap>

      <div
        className="precision-button"
        onClick={() => {
          if (mapRef && userPosition) {
            mapRef.panTo(userPosition);
            mapRef.setZoom(16);
          }
        }}
      >
        <FaCrosshairs size={22} className="precision-icon" />
      </div>
    </LoadScript>
  );
};

export default Mapa;
