import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Mapa = ({ filtroTipo, activeTab, userPosition }) => {
  const [lugares, setLugares] = useState([]);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userPosition || activeTab !== 'filtro') return;

    setLoading(true);
    const tipoConsulta = filtroTipo || 'todas';

    console.log('Filtro enviado:', tipoConsulta);

    fetch(`http://localhost:3000/actividades/buscar?lat=${userPosition.lat}&lng=${userPosition.lng}&tipo=${tipoConsulta}`)
      .then((res) => res.json())
      .then((data) => setLugares(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeTab, filtroTipo, userPosition]);

  if (!userPosition) return <div>Obteniendo tu ubicación...</div>;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={userPosition} zoom={16}>
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
            </div>
          </InfoWindow>
        )}

        {activeTab === 'filtro' && !loading && lugares.length === 0 && (
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
