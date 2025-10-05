import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ActividadesService } from '../actividades/actividades.service';
import { GenerarItinerarioDto } from './dto/generar-itinerario.dto';
import { ItinerarioResponseDto, ActividadDto, DiaDto } from './dto/itinerario-response.dto';

type ItinerarioGroq = {
  dias: DiaDto[];
  presupuesto_total: number;
};

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
      // (se omite variable no usada 'tiposPermitidos')

      const systemPrompt = `Eres un asistente experto en planificación de viajes. Genera itinerarios en formato JSON estricto.

          RESTRICCIONES:
          - Días: ${filtros.dias}
          - Tipos de lugares permitidos: (usa solo los nombres EXACTOS de esta lista, sin inventar nuevos): cafetería, restaurante, museo, parque, galería, cine, atracción, plaza, bodega
          - Presupuesto MÁXIMO TOTAL: $${filtros.presupuesto?.min || 0} - $${filtros.presupuesto?.max || 1000000}
          - ⚠️ CRÍTICO: El presupuesto_total de tu respuesta NO PUEDE SUPERAR $${filtros.presupuesto?.max || 100000}

          ⚠️ IMPORTANTE:
          - SOLO debes incluir actividades de los tipos que el usuario haya indicado explícitamente (por ejemplo, si pidió "museos", no agregues cafeterías, restaurantes, parques ni ningún otro tipo).
          - NO incluyas lugares de descanso, comida o entretenimiento si no fueron solicitados.
          - Si se piden únicamente museos, genera solo visitas a museos y exposiciones culturales.
          - Cada actividad debe ser coherente con el tipo indicado y el tema general del día.
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
          6. ⚠️ CRÍTICO: El campo "presupuesto_total" DEBE ser menor o igual a $${filtros.presupuesto?.max || 100000}
          7. IMPORTANTE: Responde SOLO con el JSON, sin texto adicional ni markdown
          8. NO incluyas campo "recomendaciones" en la respuesta
          9.IMPORTANTE: No uses sinónimos o variaciones, solo los tipos listados exactamente.`;

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
        const parsed = JSON.parse(jsonLimpio) as ItinerarioGroq;
        return parsed;
      } catch (parseError) {
        console.error('Error parseando respuesta de Groq:', parseError, 'respuesta:', respuesta);
        throw new Error('La IA no generó un JSON válido');
      }
    } catch (error) {
      console.error(' Error llamando a Groq:', error);

      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Invalid API Key')) {
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
    const variacion = precioBase * 0.1;
    const precioFinal = Math.round(precioBase + (Math.random() * variacion * 2 - variacion));

    return Math.max(0, precioFinal); // No puede ser negativo
  }

  

  private async enriquecerConLugares(
    itinerario: ItinerarioGroq,
    userPosition: { lat: number; lng: number },
    filtros: GenerarItinerarioDto['filtros'],
  ): Promise<ItinerarioResponseDto> {
    const lugaresEnriquecidos: ActividadDto[] = [];
    const waypoints: Array<{ location: { lat: number; lng: number }; stopover: boolean }> = [];
    const lugaresUsados = new Set<string>(); // Trackear lugares ya usados

    type ItinerarioActividad = {
      tipo: string;
      nombre: string;
      horario: string;
      presupuesto_estimado: number;
      descripcion?: string;
    };

    type LugarReal = {
      nombre: string;
      direccion?: string;
      rating?: number | string;
      tipos?: string[];
      price_level?: number;
      coordenadas?: { lat: number; lng: number } | null;
    };

    console.log('Iniciando enriquecimiento con Google Places...');
    console.log('Itinerario generado por Groq:', JSON.stringify(itinerario, null, 2));

    for (const dia of itinerario.dias) {
      console.log(`\n Procesando Día ${dia.dia} - ${dia.tema || 'Sin tema'}`);
      const actividades = (dia.actividades || []) as ItinerarioActividad[];

      for (const actividad of actividades) {
        console.log(`\n   Actividad: ${actividad.nombre} (${actividad.tipo})`);
        console.log(`     Horario: ${actividad.horario}`);
        console.log(`     Presupuesto estimado: $${actividad.presupuesto_estimado}`);
        
        // Buscar lugar real en Google Places
        let lugaresReales = (await this.actividadesService.buscarEnGooglePlaces(
          userPosition.lat.toString(),
          userPosition.lng.toString(),
          actividad.tipo,
        )) as Array<LugarReal | null>;

        console.log(`      Encontrados ${lugaresReales.length} lugares de tipo "${actividad.tipo}"`);

        lugaresReales = lugaresReales.filter((lugar): lugar is LugarReal => !!lugar && !!lugar.nombre && !lugaresUsados.has(lugar.nombre));
        
        if (lugaresReales.length === 0) {
          console.log(`      ⚠️ No se encontraron lugares nuevos de tipo "${actividad.tipo}".`);
          continue; // simplemente omite esta actividad, sin ampliar radio
        }
        
        // 🔹 Seleccionar el primer lugar válido y marcarlo como usado
  const lugarReal = lugaresReales[0];
        
        if (!lugarReal) {
          console.log(`      🚫 No se pudo seleccionar un lugar válido para "${actividad.tipo}"`);
          continue;
        }
        
  lugaresUsados.add(lugarReal.nombre);
  console.log(`      ✅ Lugar seleccionado: ${lugarReal.nombre} (${lugarReal.rating ?? 'Sin rating'})`);

          if (lugarReal && lugarReal.coordenadas) {
            // Calcular precio realista basado en price_level de Google
            const precioRealista = this.calcularPrecioRealista(
              actividad.tipo,
              lugarReal.price_level,
              actividad.presupuesto_estimado
            );
            
            console.log(`      Precio: Groq estimó $${actividad.presupuesto_estimado}, ajustado a $${precioRealista} (price_level: ${lugarReal.price_level ?? 'N/A'})`);

            const actividadEnriquecida: ActividadDto = {
              tipo: actividad.tipo,
              nombre: actividad.nombre,
              nombreReal: lugarReal.nombre,
              direccion: lugarReal.direccion,
              rating: lugarReal.rating,
              coordenadas: lugarReal.coordenadas || null,
              horario: actividad.horario,
              presupuesto_estimado: precioRealista,
              descripcion: actividad.descripcion,
              dia: dia.dia,
            } as ActividadDto;

            lugaresEnriquecidos.push(actividadEnriquecida);

            waypoints.push({ location: { lat: lugarReal.coordenadas.lat, lng: lugarReal.coordenadas.lng }, stopover: true });
          }
        else {
          console.log(`      No se encontraron lugares de tipo "${actividad.tipo}"`);
        }
      }
    }

    console.log(`\n Enriquecimiento completado. Total de lugares: ${lugaresEnriquecidos.length}`);
    console.log(` Lugares únicos usados: ${lugaresUsados.size}`);

    // Último lugar como destino
  const ultimoLugar = lugaresEnriquecidos[lugaresEnriquecidos.length - 1];
  const destino = ultimoLugar?.coordenadas ?? userPosition;

    if (lugaresEnriquecidos.length === 0) {
      throw new Error(`No se encontraron lugares de tipo "${filtros.tipos?.join(', ')}" en tu área. Intenta con otros tipos o amplía tu búsqueda.`);
    }

    // Recalcular presupuesto total con precios ajustados
    const presupuestoTotalAjustado = lugaresEnriquecidos.reduce((sum, lugar) => sum + (lugar.presupuesto_estimado || 0), 0);
    
    console.log(`Presupuesto total ajustado: $${presupuestoTotalAjustado}`);
      
    console.log(`Presupuesto total ajustado: $${presupuestoTotalAjustado}`);

// Validar que no exceda el presupuesto máximo
    const presupuestoMaximo = filtros.presupuesto?.max || 1000000;
    if (presupuestoTotalAjustado > presupuestoMaximo) {
      console.log(`⚠️ Presupuesto excedido ($${presupuestoTotalAjustado} > $${presupuestoMaximo}). Ajustando...`);
      
      // Calcular factor de reducción proporcional
      const factorReduccion = presupuestoMaximo / presupuestoTotalAjustado;
      
      // Ajustar todos los precios proporcionalmente
      lugaresEnriquecidos.forEach((lugar) => {
        const precioOriginal = lugar.presupuesto_estimado || 0;
        lugar.presupuesto_estimado = Math.round(precioOriginal * factorReduccion);
        console.log(`   Ajustado: ${lugar.nombreReal} de $${precioOriginal} a $${lugar.presupuesto_estimado}`);
      });
      
      // Recalcular presupuesto total
      const presupuestoFinal = lugaresEnriquecidos.reduce((sum, lugar) => sum + (lugar.presupuesto_estimado || 0), 0);
      
      console.log(`Presupuesto ajustado a: $${presupuestoFinal}`);
      
      return {
        itinerario,
        lugares: lugaresEnriquecidos,
        destino: destino as { lat: number; lng: number },
        waypoints: waypoints.slice(0, -1),
        presupuesto_total: presupuestoFinal,
      };
    }
    return {
      itinerario,
      lugares: lugaresEnriquecidos,
      destino: destino as { lat: number; lng: number },
      waypoints: waypoints.slice(0, -1), // Todos menos el último (que es el destino)
      presupuesto_total: presupuestoTotalAjustado,
    };
  }
}
