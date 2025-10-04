import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ActividadesService } from '../actividades/actividades.service';
import { GenerarItinerarioDto } from './dto/generar-itinerario.dto';
import { ItinerarioResponseDto } from './dto/itinerario-response.dto';

interface Actividad {
  tipo: string;
  nombre: string;
  horario: string;
  presupuesto_estimado: number;
  descripcion?: string;
}

interface Dia {
  dia: number;
  tema?: string;
  actividades: Actividad[];
}

interface ItinerarioGroq {
  dias: Dia[];
  presupuesto_total: number;
}

@Injectable()
export class IaService {
  private groq: Groq;

  constructor(private readonly actividadesService: ActividadesService) {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    
    if (!apiKey) {
      console.error('GROQ_API_KEY no está configurada en .env');
      throw new Error('GROQ_API_KEY no está configurada. Crea un archivo .env con tu API key de Groq.');
    }

    console.log('API Key detectada (primeros 10 caracteres):', apiKey.substring(0, 10) + '...');
    console.log('Longitud de la API Key:', apiKey.length);

    this.groq = new Groq({
      apiKey: apiKey,
    });
    
    console.log('Groq SDK inicializado correctamente');
  }

  async generarItinerario(dto: GenerarItinerarioDto): Promise<ItinerarioResponseDto> {
    try {
      const { prompt, userPosition, filtros } = dto;

      console.log('Generando itinerario con:', { prompt, filtros });

      // 1. Generar itinerario con Groq
      const itinerarioGroq = await this.llamarGroq(prompt, filtros);
      console.log('Itinerario generado por Groq');

      // 2. Enriquecer con datos reales de Google Places
      const itinerarioEnriquecido = await this.enriquecerConLugares(
        itinerarioGroq,
        userPosition,
        filtros,
      );
      console.log('Itinerario enriquecido con lugares reales');

      return itinerarioEnriquecido;
    } catch (error) {
      console.error('Error en generarItinerario:', error);
      throw error;
    }
  }

  private async llamarGroq(
    prompt: string,
    filtros: GenerarItinerarioDto['filtros'],
  ): Promise<ItinerarioGroq> {
    try {
      const tiposPermitidos = filtros.tipos?.length
        ? filtros.tipos.join(', ')
        : 'museo, restaurante, parque, cafetería, galería, cine, atracción turística';

      const systemPrompt = `Eres un asistente experto en planificación de viajes. Genera itinerarios en formato JSON estricto.

RESTRICCIONES:
- Días: ${filtros.dias}
- Tipos de lugares permitidos: ${tiposPermitidos}
- Presupuesto total: $${filtros.presupuesto?.min || 0} - $${filtros.presupuesto?.max || 1000000}

FORMATO DE SALIDA (JSON válido, sin markdown):
{
  "dias": [
    {
      "dia": 1,
      "tema": "Cultura y arte",
      "actividades": [
        {
          "tipo": "museo",
          "nombre": "Nombre sugerido del lugar",
          "horario": "10:00-13:00",
          "presupuesto_estimado": 5000,
          "descripcion": "Breve descripción de por qué incluirlo"
        }
      ]
    }
  ],
  "presupuesto_total": 45000
}

REGLAS:
1. Solo usa tipos de la lista permitida
2. Nombres de lugares deben ser genéricos o conocidos (ej: "Museo de arte moderno", "Restaurante de parrilla")
3. Horarios realistas (formato HH:MM-HH:MM)
4. Presupuestos en pesos argentinos (usa rangos: cafetería 8000-10000, restaurante 20000-40000, museo 0-2000, parque 0-2000, atracción 2000-12000, bodega 5000-15000)
5. 3-5 actividades por día
6. Respeta el presupuesto total
7. IMPORTANTE: Responde SOLO con el JSON, sin texto adicional ni markdown
8. NO incluyas campo "recomendaciones" en la respuesta`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      });

      const respuesta = chatCompletion.choices[0]?.message?.content || '{}';

      // Limpiar markdown si existe
      const jsonLimpio = respuesta
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      try {
        return JSON.parse(jsonLimpio);
      } catch (error) {
        console.error('Error parseando respuesta de Groq:', respuesta);
        throw new Error('La IA no generó un JSON válido');
      }
    } catch (error) {
      console.error(' Error llamando a Groq:', error);
      
      // Detectar error de API key inválida
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid API Key')) {
        throw new Error('API Key de Groq inválida. Verifica que tu GROQ_API_KEY en .env sea correcta y no tenga espacios o comillas.');
      }
      
      throw error;
    }
  }

  /**
   * Calcula precio realista basado en price_level de Google Places
   * price_level: 0 = Gratis, 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
   */
  private calcularPrecioRealista(
    tipo: string,
    priceLevel: number | undefined,
    precioGroq: number
  ): number {
    // Si no hay price_level, usar estimación de Groq
    if (priceLevel === undefined || priceLevel === null) {
      return precioGroq;
    }

    // Rangos de precio por tipo y price_level (en pesos argentinos)
    const rangos: Record<string, number[]> = {
      'cafetería': [0, 2000, 3500, 5000, 8000],      // 0-4
      'cafe': [0, 2000, 3500, 5000, 8000],
      'restaurante': [0, 5000, 10000, 15000, 25000],
      'restaurant': [0, 5000, 10000, 15000, 25000],
      'museo': [0, 2000, 4000, 6000, 10000],
      'museum': [0, 2000, 4000, 6000, 10000],
      'parque': [0, 0, 1000, 2000, 3000],
      'park': [0, 0, 1000, 2000, 3000],
      'galería': [0, 1000, 3000, 5000, 8000],
      'art_gallery': [0, 1000, 3000, 5000, 8000],
      'cine': [0, 3000, 4000, 5000, 7000],
      'movie_theater': [0, 3000, 4000, 5000, 7000],
      'atracción': [0, 2000, 5000, 8000, 12000],
      'tourist_attraction': [0, 2000, 5000, 8000, 12000],
      'default': [0, 3000, 6000, 10000, 15000],
    };

    const rangoTipo = rangos[tipo] || rangos['default'];
    const precioBase = rangoTipo[priceLevel] || precioGroq;

    // Agregar variación aleatoria ±20% para más realismo
    const variacion = precioBase * 0.2;
    const precioFinal = Math.round(precioBase + (Math.random() * variacion * 2 - variacion));

    return Math.max(0, precioFinal); // No puede ser negativo
  }

  private async enriquecerConLugares(
    itinerario: ItinerarioGroq,
    userPosition: { lat: number; lng: number },
    filtros: GenerarItinerarioDto['filtros'],
  ) {
    const lugaresEnriquecidos: any[] = [];
    const waypoints: any[] = [];
    const lugaresUsados = new Set<string>(); // Trackear lugares ya usados

    console.log('Iniciando enriquecimiento con Google Places...');
    console.log('Itinerario generado por Groq:', JSON.stringify(itinerario, null, 2));

    for (const dia of itinerario.dias) {
      console.log(`\n Procesando Día ${dia.dia} - ${dia.tema || 'Sin tema'}`);
      
      for (const actividad of dia.actividades) {
        console.log(`\n   Actividad: ${actividad.nombre} (${actividad.tipo})`);
        console.log(`     Horario: ${actividad.horario}`);
        console.log(`     Presupuesto estimado: $${actividad.presupuesto_estimado}`);
        
        // Buscar lugar real en Google Places
        const lugaresReales = await this.actividadesService.buscarEnGooglePlaces(
          userPosition.lat.toString(),
          userPosition.lng.toString(),
          actividad.tipo,
        );

        console.log(`      Encontrados ${lugaresReales.length} lugares de tipo "${actividad.tipo}"`);

        if (lugaresReales.length > 0) {
          // Buscar un lugar que NO hayamos usado antes
          let lugarReal: any = null;
          for (const lugar of lugaresReales) {
            if (lugar && lugar.nombre && !lugaresUsados.has(lugar.nombre)) {
              lugarReal = lugar;
              lugaresUsados.add(lugar.nombre);
              break;
            }
          }

          // Si todos están usados, tomar el primero disponible
          if (!lugarReal && lugaresReales[0]) {
            lugarReal = lugaresReales[0];
            console.log(`       Todos los lugares ya fueron usados, repitiendo: ${lugarReal.nombre}`);
          } else if (lugarReal) {
            console.log(`      Lugar seleccionado: ${lugarReal.nombre} ( ${lugarReal.rating})`);
          }

          if (lugarReal && lugarReal.coordenadas) {
            // Calcular precio realista basado en price_level de Google
            const precioRealista = this.calcularPrecioRealista(
              actividad.tipo,
              lugarReal.price_level,
              actividad.presupuesto_estimado
            );
            
            console.log(`      Precio: Groq estimó $${actividad.presupuesto_estimado}, ajustado a $${precioRealista} (price_level: ${lugarReal.price_level ?? 'N/A'})`);

            lugaresEnriquecidos.push({
              ...actividad,
              nombreReal: lugarReal.nombre,
              direccion: lugarReal.direccion,
              rating: lugarReal.rating,
              coordenadas: lugarReal.coordenadas,
              presupuesto_estimado: precioRealista, // Usar precio ajustado
              dia: dia.dia,
            });

            waypoints.push({
              location: {
                lat: lugarReal.coordenadas.lat,
                lng: lugarReal.coordenadas.lng,
              },
              stopover: true,
            });
          }
        } else {
          console.log(`      No se encontraron lugares de tipo "${actividad.tipo}"`);
          // Si no se encuentra, mantener la sugerencia de la IA
          lugaresEnriquecidos.push({
            ...actividad,
            nombreReal: actividad.nombre,
            direccion: 'Ubicación no encontrada',
            rating: 'N/A',
            coordenadas: null,
            dia: dia.dia,
          });
        }
      }
    }

    console.log(`\n Enriquecimiento completado. Total de lugares: ${lugaresEnriquecidos.length}`);
    console.log(` Lugares únicos usados: ${lugaresUsados.size}`);

    // Último lugar como destino
    const ultimoLugar = lugaresEnriquecidos[lugaresEnriquecidos.length - 1];
    const destino = ultimoLugar?.coordenadas || userPosition;

    // Recalcular presupuesto total con precios ajustados
    const presupuestoTotalAjustado = lugaresEnriquecidos.reduce(
      (sum, lugar) => sum + (lugar.presupuesto_estimado || 0),
      0
    );

    console.log(`Presupuesto total ajustado: $${presupuestoTotalAjustado}`);

    return {
      itinerario: itinerario,
      lugares: lugaresEnriquecidos,
      destino: destino,
      waypoints: waypoints.slice(0, -1), // Todos menos el último (que es el destino)
      presupuesto_total: presupuestoTotalAjustado,
    };
  }
}
