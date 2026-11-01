export interface EspecieBiodiversidad {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  categoria: 'fauna' | 'flora';
  badgeText: string;
  descripcion: string;
  imagenUrl: string;
  temporada: string;
  habitad: string;
}

const cleanTitle = (rawTitle: string): string => {
  if (!rawTitle) return '';
  let name = rawTitle.trim();
  name = name.replace(/\s*\(.*?\)\s*/g, '');
  name = name.replace(/\s+[ou]$/i, '');
  name = name.replace(/[,;:]$/, '');
  if (name.includes(' o ')) {
    name = name.split(' o ')[0];
  }
  return name.trim();
};

/**
 * Obtiene imagen y descripción de Wikipedia en español para especies de GBIF sin foto
 */
const fetchWikipediaDetails = async (scientificName: string) => {
  try {
    const term = encodeURIComponent(scientificName);
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${term}?redirect=true`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    return {
      nombreComun: cleanTitle(data.title),
      descripcion: data.extract || '',
      imagenUrl: data.thumbnail?.source
    };
  } catch {
    return null;
  }
};

/**
 * Filtro de seguridad para descartar especies terrestres tanto de GBIF como de iNat
 */
const isMarineSpecies = (scientificName: string, vernacularName: string = ''): boolean => {
  const scLower = scientificName.toLowerCase();
  const vernLower = vernacularName.toLowerCase();

  const blacklist = [
    'sus scrofa', 'jabalí', 'boar', 'olea europaea', 'olive', 'olivo', 'pinus', 'pino',
    'canis', 'felis', 'equus', 'oryctolagus', 'conejo', 'cervus', 'vulpes', 'zorro',
    'helix', 'iberus', 'candidula', 'theba', 'snails', 'caracol', 'quercus', 'encina',
    'zerynthia', 'papilio', 'mariposa', 'butterfly', 'moth', 'insecta', 'rosmarinus'
  ];

  return !blacklist.some(w => scLower.includes(w) || vernLower.includes(w));
};

/**
 * 1. CONSULTA A GBIF (Registros científicos globales)
 */
const fetchFromGBIF = async (lat: number, lng: number): Promise<EspecieBiodiversidad[]> => {
  try {
    const minLat = lat - 0.15;
    const maxLat = lat + 0.05;
    const minLng = lng;
    const maxLng = lng + 0.20;

    const gbifUrl = `https://api.gbif.org/v1/occurrence/search?decimalLatitude=${minLat},${maxLat}&decimalLongitude=${minLng},${maxLng}&hasCoordinate=true&limit=60`;

    const res = await fetch(gbifUrl);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results) return [];

    const list: EspecieBiodiversidad[] = [];
    const seenNames = new Set<string>();

    for (const item of data.results) {
      const speciesName = item.species || item.scientificName;
      if (!speciesName || seenNames.has(speciesName.toLowerCase())) continue;

      if (!isMarineSpecies(speciesName, item.vernacularName || '')) continue;
      seenNames.add(speciesName.toLowerCase());

      const wiki = await fetchWikipediaDetails(speciesName);

      const nombreComun = item.vernacularName || wiki?.nombreComun || speciesName;
      const isPlant = item.kingdom === 'Plantae' || item.phylum === 'Tracheophyta';
      const categoria: 'fauna' | 'flora' = isPlant ? 'flora' : 'fauna';

      list.push({
        id: `gbif-${item.key || Math.random()}`,
        nombreComun: nombreComun.charAt(0).toUpperCase() + nombreComun.slice(1),
        nombreCientifico: speciesName,
        categoria,
        badgeText: isPlant ? 'Flora' : 'Fauna',
        descripcion: wiki?.descripcion || `Especie registrada en muestreos científicos del litoral catalán.`,
        imagenUrl: wiki?.imagenUrl || item.media?.[0]?.identifier || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
        temporada: '',
        habitad: ''
      });

      if (list.length >= 15) break;
    }

    return list;
  } catch {
    return [];
  }
};

/**
 * 2. CONSULTA A INATURALIST (Avistamientos fotográficos comunitarios)
 */
const fetchFromINaturalist = async (lat: number, lng: number): Promise<EspecieBiodiversidad[]> => {
  try {
    const offshoreLat = lat - 0.04;
    const offshoreLng = lng + 0.04;
    const marineTaxaIds = '47178,47223,47115,47534,47124,47125,47126,47273,40151,39532';
    
    const url = `https://api.inaturalist.org/v1/observations?lat=${offshoreLat}&lng=${offshoreLng}&radius=35&taxon_id=${marineTaxaIds}&quality_grade=research&per_page=40&order_by=votes`;
    
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results) return [];

    const list: EspecieBiodiversidad[] = [];
    const seenNames = new Set<string>();

    for (const obs of data.results) {
      if (!obs.taxon || !obs.taxon.name) continue;
      const speciesName = obs.taxon.name;

      if (seenNames.has(speciesName.toLowerCase())) continue;
      if (!isMarineSpecies(speciesName, obs.taxon.preferred_common_name || '')) continue;

      seenNames.add(speciesName.toLowerCase());

      const isPlant = obs.taxon.iconic_taxon_name === 'Plantae';
      const categoria: 'fauna' | 'flora' = isPlant ? 'flora' : 'fauna';
      const photoUrl = obs.photos?.[0]?.url?.replace('square', 'medium') || obs.taxon.default_photo?.medium_url;

      const wiki = await fetchWikipediaDetails(speciesName);
      const nombreComun = obs.taxon.preferred_common_name || wiki?.nombreComun || speciesName;

      list.push({
        id: `inat-${obs.id}`,
        nombreComun: nombreComun.charAt(0).toUpperCase() + nombreComun.slice(1),
        nombreCientifico: speciesName,
        categoria,
        badgeText: isPlant ? 'Flora' : 'Fauna',
        descripcion: wiki?.descripcion || `Observación validada en las aguas de la zona.`,
        imagenUrl: photoUrl || wiki?.imagenUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
        temporada: '',
        habitad: ''
      });
    }

    return list;
  } catch {
    return [];
  }
};

/**
 * FUNCIÓN PRINCIPAL HÍBRIDA: Combina GBIF + iNaturalist desduplicando por nombre científico
 */
export const fetchBiodiversityByCoords = async (
  lat: number,
  lng: number
): Promise<EspecieBiodiversidad[]> => {
  try {
    const [gbifResults, inatResults] = await Promise.all([
      fetchFromGBIF(lat, lng),
      fetchFromINaturalist(lat, lng)
    ]);

    const combinedMap = new Map<string, EspecieBiodiversidad>();

    for (const item of inatResults) {
      combinedMap.set(item.nombreCientifico.toLowerCase(), item);
    }

    for (const item of gbifResults) {
      const key = item.nombreCientifico.toLowerCase();
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    }

    return Array.from(combinedMap.values());
  } catch (error) {
    console.error('Error unificando GBIF e iNaturalist:', error);
    return [];
  }
};