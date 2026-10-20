export interface Playa {
  id: string;
  nom: string;
  municipi: string;
  latitud: number;
  longitud: number;
  banderaStatus: 'green' | 'yellow' | 'red';
  banderaLabel: string;
}

interface ApiItem {
  codiplatja?: string;
  platja?: string;
  municipi_municipi?: string;
  coordenada_x?: string;
  coordenada_y?: string;
  estat_bandera?: string;
  bandera?: string;
  estat_data?: string;
}

/* Normalizador del estado de la bandera */
const parseBandera = (banderaInput?: string): { status: 'green' | 'yellow' | 'red'; label: string } => {
  const text = (banderaInput || '').toLowerCase();
  if (text.includes('groga') || text.includes('amarill') || text.includes('precauci')) {
    return { status: 'yellow', label: 'Bandera Amarilla' };
  }
  if (text.includes('vermell') || text.includes('roj') || text.includes('prohib')) {
    return { status: 'red', label: 'Bandera Roja' };
  }
  return { status: 'green', label: 'Bandera Verde' };
};

export const fetchAllPlayasCat = async (): Promise<Playa[]> => {
  try {
    // Pedimos la lista completa de playas activas utilizando SoQL
    const url =
      'https://analisi.transparenciacatalunya.cat/resource/4baz-cjv2.json?' +
      '$select=codiplatja,platja,municipi_municipi,coordenada_x,coordenada_y,estat_bandera,max(estat_data)%20as%20ultima_fecha' + '&$group=codiplatja,platja,municipi_municipi,coordenada_x,coordenada_y,estat_bandera' +
      '&$limit=50000';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error al conectar con la API de la Generalitat');
    }

    const data: ApiItem[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    const mapPlayas = new Map<string, Playa>();

    data.forEach((item, index) => {
      if (!item.coordenada_x || !item.coordenada_y) return;

      // Convertimos comas a puntos por si la API envía cadenas tipo "41,2645"
      const rawLat = String(item.coordenada_x).replace(',', '.');
      const rawLng = String(item.coordenada_y).replace(',', '.');

      let lat = parseFloat(rawLat);
      let lng = parseFloat(rawLng);

      // Si vienen invertidas las coordenadas (x/y), las corregimos
      if (lat < 10 && lng > 30) {
        const temp = lat;
        lat = lng;
        lng = temp;
      }

      // Validamos que la coordenada caiga dentro del mapa de Cataluña
      const esCoordenadaValida =
        !isNaN(lat) && !isNaN(lng) && lat >= 40.0 && lat <= 42.9 && lng >= 0.0 && lng <= 3.5;

      if (esCoordenadaValida) {
        const key = item.codiplatja || `${item.platja}-${item.municipi_municipi}` || `platja-${index}`;
        if (!mapPlayas.has(key)) {
          const banderaInfo = parseBandera(item.estat_bandera || item.bandera);

          mapPlayas.set(key, {
            id: key,
            nom: item.platja || 'Platja de Catalunya',
            municipi: item.municipi_municipi || 'Catalunya',
            latitud: lat,
            longitud: lng,
            banderaStatus: banderaInfo.status,
            banderaLabel: banderaInfo.label,
          });
        }
      }
    });

    const result = Array.from(mapPlayas.values());
    console.log(`Cargadas ${result.length} playas únicas en total de la costa catalana.`);
    return result;
  } catch (error) {
    console.error('Error cargando playas desde la API de la Generalitat:', error);
    return [];
  }
};