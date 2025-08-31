// src/components/Mapa.jsx

import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// Estilo para el contenedor del mapa
const containerStyle = {
  width: '100wh',
  height: '100vh',
};

// Coordenadas iniciales (Mendoza), se usará si no se obtiene la ubicación del usuario
const initialCenter = {
  lat: -32.89084,
  lng: -68.82717
};

// Clave de API desde el archivo .env (PERSONAL)
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const Mapa = () => {
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    // Lógica para obtener la ubicación del usuario
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error al vigilar la ubicación:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Mientras no tengamos la posición, podemos mostrar un mensaje
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
        {/* Marcador en la posición del usuario */}
        <Marker position={userPosition} />
      </GoogleMap>
    </LoadScript>
  );
};

export default Mapa;