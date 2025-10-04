export interface ActividadDto {
  tipo: string;
  nombre: string;
  nombreReal?: string;
  direccion?: string;
  rating?: number | string;
  coordenadas?: {
    lat: number;
    lng: number;
  } | null;
  horario: string;
  presupuesto_estimado: number;
  descripcion?: string;
  dia: number;
}

export interface DiaDto {
  dia: number;
  tema?: string;
  actividades: any[];
}

export interface ItinerarioResponseDto {
  itinerario: {
    dias: DiaDto[];
    presupuesto_total: number;
  };
  lugares: ActividadDto[];
  destino: {
    lat: number;
    lng: number;
  };
  waypoints: Array<{
    location: {
      lat: number;
      lng: number;
    };
    stopover: boolean;
  }>;
  presupuesto_total: number;
}
