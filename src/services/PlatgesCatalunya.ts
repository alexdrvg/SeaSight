export interface Playa {
  id: string;
  nom: string;
  municipi: string;
  costa: string;
  latitud: number;
  longitud: number;
  banderaStatus: 'green' | 'yellow' | 'red';
  banderaLabel: string;
  lastUpdated: string;
}

interface ApiItem {
  codiplatja?: string;
  platja?: string;
  municipi_municipi?: string;
  municipi_costa?: string;
  coordenada_x?: string;
  coordenada_y?: string;
  estat_bandera?: string;
  bandera?: string;
  estat_data?: string;
  ultima_fecha?: string;
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

/* Formateador universal de fechas con SQL */
const formatFechaSoQL = (rawDate?: string): string => {
  if (!rawDate) return 'Sin datos de temporada';

  try {
    let dia = '';
    let mes = '';
    let anio = 0;
    let horas = '';
    let minutos = '';

    // Caso 1: Formato "DD/MM/YYYY HH:mm:ss" o "DD/MM/YYYY"
    if (rawDate.includes('/')) {
      const parts = rawDate.split(' ');
      const dateParts = parts[0].split('/'); // [DD, MM, YYYY]
      
      if (dateParts.length === 3) {
        dia = dateParts[0].padStart(2, '0');
        mes = dateParts[1].padStart(2, '0');
        anio = parseInt(dateParts[2], 10);
      }

      if (parts[1]) {
        const timeParts = parts[1].split(':');
        horas = timeParts[0]?.padStart(2, '0') || '00';
        minutos = timeParts[1]?.padStart(2, '0') || '00';
      }
    } else {
      // Caso 2: Formato ISO "YYYY-MM-DDTHH:mm:ss.sssZ"
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj.getTime())) {
        dia = String(dateObj.getDate()).padStart(2, '0');
        mes = String(dateObj.getMonth() + 1).padStart(2, '0');
        anio = dateObj.getFullYear();
        horas = String(dateObj.getHours()).padStart(2, '0');
        minutos = String(dateObj.getMinutes()).padStart(2, '0');
      }
    }

    if (!anio || isNaN(anio)) {
      return 'Sin datos de temporada';
    }

    const currentYear = new Date().getFullYear(); // 2026

    // Si el registro es de un año anterior a 2026, lo indicamos de forma limpia
    if (anio < currentYear) {
      return `${dia}/${mes}/${anio} (Último parte disponible)`;
    }

    const horaStr = horas ? ` a las ${horas}:${minutos}` : '';
    return `${dia}/${mes}/${anio}${horaStr}`;
  } catch {
    return 'Sin datos de temporada';
  }
};

/* Función para extraer únicamente el año de un string de fecha SoQL */
const getYearFromSoQLDate = (rawDate?: string): number => {
  if (!rawDate) return 0;

  // Si viene en formato "DD/MM/YYYY..."
  if (rawDate.includes('/')) {
    const parts = rawDate.split(' ')[0].split('/');
    if (parts.length === 3) {
      return parseInt(parts[2], 10);
    }
  } 
  
  // Si viene en formato ISO "YYYY-MM-DD..."
  const rawYear = parseInt(rawDate.substring(0, 4), 10);
  if (!isNaN(rawYear) && rawYear > 1900) {
    return rawYear;
  }

  const dateObj = new Date(rawDate);
  return !isNaN(dateObj.getTime()) ? dateObj.getFullYear() : 0;
};

export const fetchAllPlayasCat = async (): Promise<Playa[]> => {
  try {
    const endpoint = 'https://analisi.transparenciacatalunya.cat/resource/4baz-cjv2.json';

    const params = new URLSearchParams({
      '$select': 'codiplatja,platja,municipi_municipi,municipi_costa,coordenada_x,coordenada_y,estat_bandera,estat_data',
      '$order': 'estat_data DESC',
      '$limit': '50000'
    });

    const response = await fetch(`${endpoint}?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Error al conectar con la API de la Generalitat');
    }

    const data: ApiItem[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    const mapPlayas = new Map<string, Playa>();
    const currentYear = new Date().getFullYear(); // 2026

    data.forEach((item, index) => {
      if (!item.coordenada_x || !item.coordenada_y) return;

      // 1. Extraemos el año real sin importar el formato del string
      const itemYear = getYearFromSoQLDate(item.estat_data);

      // 2. FILTRO CLAVE: Si el año del registro es anterior al actual (o no existe), se descarta
      if (itemYear < currentYear) {
        return;
      }

      const rawLat = String(item.coordenada_x).replace(',', '.');
      const rawLng = String(item.coordenada_y).replace(',', '.');

      let lat = parseFloat(rawLat);
      let lng = parseFloat(rawLng);

      if (lat < 10 && lng > 30) {
        const temp = lat;
        lat = lng;
        lng = temp;
      }

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
            costa: item.municipi_costa || 'Catalunya',
            latitud: lat,
            longitud: lng,
            banderaStatus: banderaInfo.status,
            banderaLabel: banderaInfo.label,
            lastUpdated: formatFechaSoQL(item.estat_data),
          });
        }
      }
    });

    return Array.from(mapPlayas.values());
  } catch (error) {
    console.error('Error cargando playas desde la API de la Generalitat:', error);
    return [];
  }
};