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
    // Pedimos 15.000 filas ordenadas descendentemente por fecha para asegurarnos de traer los registros más recientes de toda la costa
    const response = await fetch(
      'https://analisi.transparenciacatalunya.cat/resource/4baz-cjv2.json?$limit=15000&$order=estat_data%20DESC'
    );

    if (!response.ok) {
      throw new Error('Error al conectar con la API de Platges de la Generalitat');
    }

    const data: ApiItem[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    const mapPlayas = new Map<string, Playa>();

    data.forEach((item, index) => {
      if (!item.coordenada_x || !item.coordenada_y) return;

      const lat = parseFloat(item.coordenada_x);
      const lng = parseFloat(item.coordenada_y);

      // Verificación de coordenadas geográficas en el litoral de Cataluña
      if (!isNaN(lat) && !isNaN(lng) && lat >= 40.0 && lat <= 42.9 && lng >= 0.0 && lng <= 3.5) {
        const key = item.codiplatja || item.platja || `platja-${index}`;

        // Como los datos vienen ordenados por fecha más reciente primero, nos quedamos con el primer registro de cada playa
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
    console.log(`Cargadas ${result.length} playas únicas recientes en Cataluña.`);
    return result;
  } catch (error) {
    console.error('Error cargando playas desde la API de la Generalitat:', error);
    return [];
  }
};