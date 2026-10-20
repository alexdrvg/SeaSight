export interface MarineData {
  waterTemperature: number;
  waveHeight: number;
  windSpeed: number;
}

// Coordenadas por defecto (Castelldefels / Platja del Baixador)
export const fetchMarineData = async (
  lat = 41.2645,
  lon = 1.9800
): Promise<MarineData> => {
  try {
    const response = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,ocean_current_velocity&hourly=aqualink_sea_surface_temperature&timezone=auto`
    );
    
    // Si la API marina tarda o falla, obtenemos también el viento actual desde la API meteorológica
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m&timezone=auto`
    );

    const marineJson = await response.json();
    const weatherJson = await weatherResponse.json();

    return {
      waterTemperature: marineJson.hourly?.aqualink_sea_surface_temperature?.[0] ?? 21.4,
      waveHeight: marineJson.current?.wave_height ?? 0.4,
      windSpeed: weatherJson.current?.wind_speed_10m ?? 12,
    };
  } catch (error) {
    console.error('Error al obtener datos marinos:', error);
    // Valores fallback si la red falla
    return {
      waterTemperature: 21.4,
      waveHeight: 0.4,
      windSpeed: 12,
    };
  }
};