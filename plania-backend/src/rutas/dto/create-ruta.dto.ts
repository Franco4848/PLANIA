export class CreateRutaDto {
  destino: {
    nombre: string;
    lat: number;
    lng: number;
  };
  waypoints: {
    nombre: string;
    location: {
      lat: number;
      lng: number;
    };
    stopover: boolean;
  }[];
}
