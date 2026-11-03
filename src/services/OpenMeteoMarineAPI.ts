export interface MarineData {
  waterTemperature: number | null;
  waveHeight: number | null;
  wavePeriod: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  uvIndex: number | null;
  tempAmbiente: number | null;
  failed?: boolean;
}

const getWindDirectionLabel = (degree: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return directions[Math.round(degree / 45) % 8];
};

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    // Muestra el motivo real del error (Open-Meteo devuelve { reason: "..." })
    console.error(`HTTP ${res.status} en ${url}`, await res.text());
    return null;
  }
  return res.json();
};

export const fetchMarineData = async (lat: number, lon: number): Promise<MarineData> => {
  const marineUrl =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&current=wave_height,wave_period,sea_surface_temperature` +
    `&cell_selection=sea&timezone=auto`;

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,wind_speed_10m,wind_direction_10m,uv_index&timezone=auto`;

  try {
    const [marine, weather] = await Promise.all([
      fetchJson(marineUrl),
      fetchJson(weatherUrl),
    ]);

    const windDeg = weather?.current?.wind_direction_10m;

    return {
      waterTemperature: marine?.current?.sea_surface_temperature ?? null,
      waveHeight: marine?.current?.wave_height ?? null,
      wavePeriod: marine?.current?.wave_period ?? null,
      windSpeed: weather?.current?.wind_speed_10m ?? null,
      windDirection:
        typeof windDeg === 'number'
          ? `${getWindDirectionLabel(windDeg)} (${Math.round(windDeg)}°)`
          : null,
      uvIndex: weather?.current?.uv_index ?? null,
      tempAmbiente: weather?.current?.temperature_2m ?? null,
      failed: !marine && !weather,
    };
  } catch (error) {
    console.error('Error de red en fetchMarineData:', error);
    return {
      waterTemperature: null, waveHeight: null, wavePeriod: null,
      windSpeed: null, windDirection: null, uvIndex: null,
      tempAmbiente: null, failed: true,
    };
  }
};