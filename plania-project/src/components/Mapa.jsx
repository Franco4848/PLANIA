import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const initialCenter = {
  lat: -32.89084,
  lng: -68.82717,
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Mapa = ({ filtroTipo, activeTab }) => {
  const [userPosition, setUserPosition] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📍 Obtener ubicación del usuario
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error al obtener ubicación:', error);
        setUserPosition(initialCenter);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  // 🔄 Obtener actividades cercanas cuando se activa 'itinerario'
  useEffect(() => {
    if (userPosition && activeTab === 'itinerario') {
      setLoading(true);
      const tipoConsulta = filtroTipo || 'todas';

      fetch(`http://localhost:3000/actividades/buscar?lat=${userPosition.lat}&lng=${userPosition.lng}&tipo=${tipoConsulta}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Actividades recibidas:', data);
          setLugares(data);
        })
        .catch((err) => {
          console.error('Error al obtener actividades:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [activeTab, userPosition, filtroTipo]);

  if (!userPosition) {
    return <div>Obteniendo tu ubicación...</div>;
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userPosition}
        zoom={16}
      >
        {/* 📍 Marcador del usuario */}
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

        {/* 📌 Marcadores de actividades */}
        {activeTab === 'itinerario' && !loading && lugares.length > 0 &&
          lugares.map((lugar, index) => {
            if (
              !lugar ||
              !lugar.coordenadas ||
              typeof lugar.coordenadas.lat !== 'number' ||
              typeof lugar.coordenadas.lng !== 'number'
            ) {
              console.warn('Lugar inválido:', lugar);
              return null;
            }

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

        {/* 🗨️ InfoWindow con detalles */}
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

        {/* 🛑 Mensaje si no hay actividades */}
        {activeTab === 'itinerario' && !loading && lugares.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'white',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}>
            No se encontraron actividades cercanas.
          </div>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Mapa;