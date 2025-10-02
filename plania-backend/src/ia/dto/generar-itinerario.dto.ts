export class GenerarItinerarioDto {
  prompt: string;
  userPosition: {
    lat: number;
    lng: number;
  };
  filtros: {
    tipos?: string[];
    presupuesto?: {
      min: number;
      max: number;
    };
    dias: number;
  };
}
