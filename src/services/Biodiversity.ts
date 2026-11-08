import { estimateSeaBearing } from './coastGeometry';

export type GrupoId = 'peces' | 'invertebrados' | 'plantas' | 'vertebrados';

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
  fuente?: 'minka' | 'inaturalist' | 'gbif';
  creditoImagen?: string; // atribución de la foto (obligatoria con licencias CC de Minka)
  grupo?: GrupoId;
}

// ───────────────────────── Configuración ─────────────────────────

const API_BASE = {
  minka: 'https://api.minka-sdg.org/v1',
  inaturalist: 'https://api.inaturalist.org/v1',
} as const;

type NaturalistSource = keyof typeof API_BASE;

const USE_INATURALIST = true; // false = solo MINKA
const USE_GBIF = true; // false = solo observaciones validadas por la comunidad
const QUALITY_GRADE = 'research'; // solo observaciones validadas
const PER_PAGE = 200;

// Caja de búsqueda hacia el mar (valores por defecto)
const DEFAULT_SEA_DISTANCE_KM = 8;
const DEFAULT_HALF_WIDTH_KM = 4;
const LAND_MARGIN_KM = 0.2;
const DEFAULT_SEA_BEARING = 135; // 90 = este, 135 = sureste, 180 = sur

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80';

/**
 * Límite por grupo (suman 200 por playa). Cada grupo se pide aparte para que los
 * peces no queden tapados por las especies más repetidas (gaviotas, etc.).
 * `pages` = cuántas páginas de 200 se piden. Plantas pide 2 porque entre las más
 * observadas hay muchas terrestres y las marinas quedan más abajo.
 */
interface GrupoTaxonomico {
  id: GrupoId;
  iconicTaxa: string[];
  max: number;
  pages: number;
}

const GRUPOS: GrupoTaxonomico[] = [
  { id: 'peces', iconicTaxa: ['Actinopterygii'], max: 80, pages: 1 },
  { id: 'invertebrados', iconicTaxa: ['Animalia', 'Mollusca'], max: 70, pages: 1 },
  { id: 'plantas', iconicTaxa: ['Plantae', 'Chromista'], max: 20, pages: 2 },
  { id: 'vertebrados', iconicTaxa: ['Aves', 'Reptilia', 'Mammalia'], max: 30, pages: 1 },
];

interface ZonaMarina {
  municipios: string[]; // sin tildes y en minúsculas
  projectSlug?: string; // proyecto de MINKA, si existe
  seaBearing?: number; // opcional: solo para forzar un rumbo donde el automático falle
  seaDistanceKm?: number;
  halfWidthKm?: number; // ancho de la caja a cada lado de la playa
}

const ZONAS: ZonaMarina[] = [
  {
    municipios: ['barcelona'],
    projectSlug: 'biodiversitat-marina-de-les-platges-de-barcelona',
    halfWidthKm: 2.5,
  },
  {
    municipios: ['sant adria de besos'],
    projectSlug: 'biodiversitat-marina-de-les-platges-de-sant-adria-del-besos',
    halfWidthKm: 2.5,
  },
  {
    municipios: ['badalona'],
    projectSlug: 'biodiversitat-marina-de-les-platges-de-badalona',
    halfWidthKm: 2.5,
  },
  {
    municipios: ['montgat'],
    projectSlug: 'biodiversitat-marina-a-les-platges-de-montgat',
    halfWidthKm: 2.5,
  },
  // Aquí puedes añadir más proyectos de MINKA o forzar un rumbo, por ejemplo:
  // { municipios: ['deltebre'], seaBearing: 100 },
];

// ───────────────────────── Listas de filtrado (marino vs. terrestre) ─────────────────────────
// Entradas en minúsculas y sin tildes. Un nombre de una palabra es un género;
// de dos palabras, una especie concreta. Se pueden ampliar sin tocar nada más.

const set = (...names: string[]) => new Set<string>(names);

/** Plantas y algas aceptadas (las algas pardas, Chromista, pasan todas aparte) */
const COASTAL_FLORA = set(
  // Fanerógamas marinas y algas
  'posidonia', 'cymodocea', 'zostera', 'nanozostera', 'halophila', 'ruppia',
  'caulerpa', 'codium', 'ulva', 'enteromorpha', 'acetabularia', 'halimeda', 'flabellia',
  'valonia', 'anadyomene', 'udotea', 'cladophora', 'chaetomorpha', 'bryopsis',
  'padina', 'dictyota', 'dictyopteris', 'halopteris', 'cystoseira', 'ericaria', 'gongolaria',
  'sargassum', 'laurencia', 'osmundea', 'corallina', 'jania', 'ellisolandia', 'lithophyllum',
  'lithothamnion', 'mesophyllum', 'phymatolithon', 'peyssonnelia', 'gelidium', 'pterocladiella',
  'gracilaria', 'asparagopsis', 'womersleyella', 'lophocladia', 'rhodymenia', 'plocamium',
  'ceramium', 'polysiphonia', 'sphaerococcus', 'hypnea', 'liagora', 'nemalion', 'rugulopteryx',
  // Flora de dunas y marismas
  'ammophila arenaria', 'elymus farctus', 'thinopyrum junceiforme', 'sporobolus pungens',
  'pancratium maritimum', 'eryngium maritimum', 'cakile maritima', 'crithmum maritimum',
  'salsola kali', 'echinophora spinosa', 'medicago marina', 'euphorbia paralias',
  'lotus creticus', 'otanthus maritimus', 'calystegia soldanella', 'glaucium flavum',
  'juncus maritimus', 'halimione portulacoides', 'atriplex halimus', 'polygonum maritimum',
  'cyperus capitatus', 'crucianella maritima', 'anthemis maritima', 'achillea maritima',
  'limonium', 'sarcocornia', 'salicornia', 'suaeda', 'arthrocnemum', 'halocnemum', 'spartina'
);

/** Aves, reptiles y mamíferos marinos o de costa */
const MARINE_VERTEBRATES = set(
  // Aves marinas y limícolas
  'larus', 'ichthyaetus', 'chroicocephalus', 'hydrocoloeus', 'thalasseus', 'sterna', 'sternula',
  'chlidonias', 'gelochelidon', 'hydroprogne', 'calonectris', 'puffinus', 'ardenna', 'hydrobates',
  'morus', 'sula', 'phalacrocorax', 'gulosus', 'haematopus', 'charadrius', 'calidris', 'arenaria',
  'tringa', 'numenius', 'limosa', 'actitis', 'himantopus', 'recurvirostra', 'egretta', 'ardea',
  'phoenicopterus', 'podiceps', 'gavia', 'mergus', 'melanitta', 'stercorarius', 'alca', 'uria',
  'fratercula', 'pandion',
  // Tortugas marinas y cetáceos
  'caretta', 'chelonia', 'dermochelys', 'eretmochelys', 'lepidochelys',
  'tursiops', 'stenella', 'delphinus', 'balaenoptera', 'physeter', 'globicephala', 'grampus',
  'phocoena', 'ziphius', 'orcinus', 'megaptera', 'pseudorca', 'monachus'
);

/** Géneros terrestres que se cuelan entre los invertebrados */
const LAND_INVERTEBRATES = set(
  'helix', 'cornu', 'cepaea', 'otala', 'eobania', 'cantareus', 'theba', 'cochlicella', 'cernuella',
  'xerosecta', 'xerotricha', 'trochoidea', 'rumina', 'oxychilus', 'limax', 'arion', 'deroceras',
  'milax', 'tandonia', 'pomatias', 'sphincterochila', 'iberus', 'candidula', 'cecilioides',
  'pupilla', 'granaria',
  'armadillidium', 'porcellio', 'oniscus', 'porcellionides', 'trachelipus', 'lumbricus', 'eisenia',
  'aporrectodea', 'scolopendra', 'scutigera', 'cryptops'
);

/** Géneros de agua dulce que se cuelan entre los peces (desembocaduras de ríos) */
const FRESHWATER_FISH = set(
  'gambusia', 'cyprinus', 'carassius', 'micropterus', 'silurus', 'esox', 'lepomis', 'squalius',
  'barbus', 'luciobarbus', 'salmo', 'oncorhynchus', 'cobitis', 'misgurnus', 'pseudorasbora',
  'alburnus', 'rutilus', 'tinca', 'perca', 'sander', 'ameiurus', 'ictalurus', 'oreochromis',
  'poecilia', 'xiphophorus', 'scardinius', 'phoxinus', 'gobio', 'abramis'
);

// ───────────────────────── Utilidades ─────────────────────────

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

const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const normalizeText = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/** Clave única de especie: género + especie, sin tildes ni mayúsculas */
const speciesKey = (scientificName: string): string =>
  normalizeText(scientificName).split(/\s+/).slice(0, 2).join(' ');

const genusOf = (scientificName: string): string =>
  normalizeText(scientificName).split(/\s+/)[0] ?? '';

/** ¿Está el género o la especie en la lista? */
const inList = (list: Set<string>, scientificName: string): boolean =>
  list.has(genusOf(scientificName)) || list.has(speciesKey(scientificName));

const findZona = (municipio?: string): ZonaMarina | undefined => {
  if (!municipio) return undefined;
  const m = normalizeText(municipio);
  return ZONAS.find((z) => z.municipios.some((x) => m.includes(x)));
};

/** Filtro rápido por palabras clave (nombre científico y común) */
const isMarineSpecies = (scientificName: string, vernacularName: string = ''): boolean => {
  const scLower = scientificName.toLowerCase();
  const vernLower = vernacularName.toLowerCase();

  const blacklist = [
    'sus scrofa', 'jabalí', 'boar', 'olea europaea', 'olive', 'olivo', 'pinus', 'pino',
    'canis', 'felis', 'equus', 'oryctolagus', 'conejo', 'cervus', 'vulpes', 'zorro',
    'helix', 'iberus', 'candidula', 'theba', 'snails', 'caracol', 'quercus', 'encina',
    'zerynthia', 'papilio', 'mariposa', 'butterfly', 'moth', 'insecta', 'rosmarinus',
  ];

  return !blacklist.some((w) => scLower.includes(w) || vernLower.includes(w));
};

/** Regla de cada grupo: qué se acepta como marino o de costa */
const passesGroupPolicy = (grupo: GrupoId, scientificName: string, isChromista = false): boolean => {
  switch (grupo) {
    case 'peces':
      return !inList(FRESHWATER_FISH, scientificName);
    case 'invertebrados':
      return !inList(LAND_INVERTEBRATES, scientificName);
    case 'plantas':
      return isChromista || inList(COASTAL_FLORA, scientificName);
    case 'vertebrados':
      return inList(MARINE_VERTEBRATES, scientificName);
  }
};

// ───────────────────────── Wikipedia (por lotes, con caché) ─────────────────────────

interface WikiDetails {
  nombreComun: string;
  descripcion: string;
  imagenUrl?: string;
}

interface WikiPage {
  title: string;
  extract?: string;
  missing?: string;
  thumbnail?: { source: string };
  pageprops?: { disambiguation?: string };
}

const WIKI_BATCH_SIZE = 20; // límite de títulos con extractos por petición

// null = consultado y sin artículo útil. Si no está en el mapa, aún no se ha consultado.
const wikiCache = new Map<string, WikiDetails | null>();

const loadWikipediaChunk = async (names: string[]): Promise<void> => {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*', // necesario para CORS
    redirects: '1',
    titles: names.join('|'),
    prop: 'extracts|pageimages|pageprops',
    ppprop: 'disambiguation',
    exintro: '1',
    explaintext: '1',
    exsentences: '3',
    exlimit: 'max',
    piprop: 'thumbnail',
    pithumbsize: '600',
  });

  try {
    const res = await fetch(`https://es.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) return; // sin cachear: se reintentará

    const data = await res.json();
    const query = data.query ?? {};

    const alias = new Map<string, string>();
    for (const n of query.normalized ?? []) alias.set(n.from.toLowerCase(), n.to);
    for (const r of query.redirects ?? []) alias.set(r.from.toLowerCase(), r.to);

    const pagesByTitle = new Map<string, WikiPage>();
    for (const page of Object.values(query.pages ?? {}) as WikiPage[]) {
      pagesByTitle.set(page.title.toLowerCase(), page);
    }

    for (const name of names) {
      let title = name;
      for (let i = 0; i < 2; i++) {
        const next = alias.get(title.toLowerCase());
        if (next) title = next;
      }

      const page = pagesByTitle.get(title.toLowerCase());
      const useful =
        page && page.missing === undefined && !page.pageprops?.disambiguation && !!page.extract;

      wikiCache.set(
        name.toLowerCase(),
        useful
          ? {
              nombreComun: cleanTitle(page.title),
              descripcion: page.extract!.trim(),
              imagenUrl: page.thumbnail?.source,
            }
          : null
      );
    }
  } catch {
    // Error de red: no cacheamos, se reintentará
  }
};

/** Descarga de Wikipedia las especies que aún no están en caché (lotes de 20). */
export const loadWikipediaFor = async (items: EspecieBiodiversidad[]): Promise<void> => {
  const pending = Array.from(new Set(items.map((i) => i.nombreCientifico))).filter(
    (n) => !wikiCache.has(n.toLowerCase())
  );

  const chunks: string[][] = [];
  for (let i = 0; i < pending.length; i += WIKI_BATCH_SIZE) {
    chunks.push(pending.slice(i, i + WIKI_BATCH_SIZE));
  }
  await Promise.all(chunks.map(loadWikipediaChunk));
};

/** Aplica lo que haya en caché (síncrono, no hace peticiones). */
export const applyWikipedia = (item: EspecieBiodiversidad): EspecieBiodiversidad => {
  const wiki = wikiCache.get(item.nombreCientifico.toLowerCase());
  if (!wiki) return item;

  const sinNombreComun = item.nombreComun.toLowerCase() === item.nombreCientifico.toLowerCase();

  return {
    ...item,
    nombreComun:
      sinNombreComun && wiki.nombreComun ? capitalize(wiki.nombreComun) : item.nombreComun,
    descripcion: wiki.descripcion || item.descripcion,
    // Solo sustituye la imagen si la especie no tenía foto propia
    imagenUrl: item.creditoImagen ? item.imagenUrl : wiki.imagenUrl || item.imagenUrl,
  };
};

// ───────────────────────── Geometría: caja hacia el mar ─────────────────────────

const toRad = (deg: number) => (deg * Math.PI) / 180;

const offsetPoint = (lat: number, lng: number, bearingDeg: number, km: number) => ({
  lat: lat + (km * Math.cos(toRad(bearingDeg))) / 111.32,
  lng: lng + (km * Math.sin(toRad(bearingDeg))) / (111.32 * Math.cos(toRad(lat))),
});

const buildSeaBox = (
  lat: number,
  lng: number,
  bearing: number,
  distanceKm: number,
  halfWidthKm: number
) => {
  const start = offsetPoint(lat, lng, bearing + 180, LAND_MARGIN_KM);
  const far = offsetPoint(lat, lng, bearing, distanceKm);

  const corners = [start, far].flatMap((p) => [
    offsetPoint(p.lat, p.lng, bearing + 90, halfWidthKm),
    offsetPoint(p.lat, p.lng, bearing - 90, halfWidthKm),
  ]);

  const lats = corners.map((c) => c.lat);
  const lngs = corners.map((c) => c.lng);
  return {
    swlat: Math.min(...lats),
    swlng: Math.min(...lngs),
    nelat: Math.max(...lats),
    nelng: Math.max(...lngs),
  };
};

// ───────────────────────── 1. MINKA + iNaturalist ─────────────────────────

interface NaturalistTaxon {
  id: number;
  name: string;
  rank?: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  default_photo?: {
    medium_url?: string;
    attribution?: string;
    license_code?: string | null;
  };
}

interface SpeciesRow {
  taxon: NaturalistTaxon;
  count: number;
  source: NaturalistSource;
  photoUrl?: string;
  attribution?: string;
  trusted?: boolean; // viene de un proyecto revisado: no pasa por las listas blancas
}

/** Pide species_counts, página a página, hasta agotar resultados o llegar a `maxPages` */
const fetchSpeciesRows = async (
  source: NaturalistSource,
  filters: Record<string, string>,
  maxPages: number
): Promise<SpeciesRow[]> => {
  const rows: SpeciesRow[] = [];

  try {
    for (let page = 1; page <= maxPages; page++) {
      const params = new URLSearchParams({
        quality_grade: QUALITY_GRADE,
        locale: 'es',
        per_page: String(PER_PAGE),
        page: String(page),
        ...filters,
      });

      const res = await fetch(`${API_BASE[source]}/observations/species_counts?${params}`);
      if (!res.ok) {
        console.warn(`${source} species_counts HTTP ${res.status}`);
        break;
      }

      const data = await res.json();
      const results = (data.results ?? []) as Array<{ count: number; taxon: NaturalistTaxon }>;

      for (const r of results) {
        rows.push({
          taxon: r.taxon,
          count: r.count,
          source,
          photoUrl: r.taxon.default_photo?.medium_url,
          attribution: r.taxon.default_photo?.attribution,
        });
      }

      if (results.length < PER_PAGE || page * PER_PAGE >= (data.total_results ?? 0)) break;
    }
  } catch (error) {
    console.warn(`Error consultando ${source} (¿CORS o red?):`, error);
  }

  return rows;
};

const isValidRow = (row: SpeciesRow, grupo: GrupoId): boolean => {
  const t = row.taxon;
  if (!t?.name) return false;

  const isSpecies = t.rank ? t.rank === 'species' : t.name.includes(' ');
  if (!isSpecies) return false;
  if (!isMarineSpecies(t.name, t.preferred_common_name || '')) return false;

  return row.trusted || passesGroupPolicy(grupo, t.name, t.iconic_taxon_name === 'Chromista');
};

/** Une la misma especie venida de varias fuentes: una sola fila, recuentos sumados */
const aggregate = (rows: SpeciesRow[]): SpeciesRow[] => {
  const map = new Map<string, SpeciesRow>();
  // MINKA primero: si hay duplicado, mandan sus datos
  const ordered = [...rows].sort((a, b) => Number(b.source === 'minka') - Number(a.source === 'minka'));

  for (const row of ordered) {
    if (!row.taxon?.name) continue;
    const key = speciesKey(row.taxon.name);
    const existing = map.get(key);
    if (existing) existing.count += row.count;
    else map.set(key, { ...row });
  }
  return Array.from(map.values());
};

const toSpecies = (row: SpeciesRow, grupo: GrupoId): EspecieBiodiversidad => {
  const taxon = row.taxon;
  const isPlant = grupo === 'plantas';

  return {
    id: `${row.source}-${taxon.id}`,
    nombreComun: capitalize(taxon.preferred_common_name || taxon.name),
    nombreCientifico: taxon.name,
    categoria: isPlant ? 'flora' : 'fauna',
    badgeText: isPlant ? 'Flora' : 'Fauna',
    descripcion: 'Especie observada y validada por la comunidad de naturalistas.',
    imagenUrl: row.photoUrl || FALLBACK_IMAGE,
    temporada: '',
    habitad: '',
    fuente: row.source,
    creditoImagen: row.photoUrl ? row.attribution || row.source : undefined,
    grupo,
  };
};

const fetchFromNaturalists = async (
  lat: number,
  lng: number,
  municipio?: string
): Promise<EspecieBiodiversidad[]> => {
  
  const zona = findZona(municipio);
  const bearing = zona?.seaBearing ?? estimateSeaBearing(lat, lng) ?? DEFAULT_SEA_BEARING;
  const box = buildSeaBox(
    lat,
    lng,
    bearing,
    zona?.seaDistanceKm ?? DEFAULT_SEA_DISTANCE_KM,
    zona?.halfWidthKm ?? DEFAULT_HALF_WIDTH_KM
  );

  if (import.meta.env.DEV) {
    console.debug('[Biodiversity] rumbo al mar:', Math.round(bearing), '°', box);
  }

  const boxFilters = {
    swlat: String(box.swlat),
    swlng: String(box.swlng),
    nelat: String(box.nelat),
    nelng: String(box.nelng),
  };
  const sources: NaturalistSource[] = USE_INATURALIST ? ['minka', 'inaturalist'] : ['minka'];

  const [groupRows, projectRows] = await Promise.all([
    Promise.all(
      GRUPOS.map(async (grupo) => {
        const lists = await Promise.all(
          sources.map((s) =>
            fetchSpeciesRows(s, { ...boxFilters, iconic_taxa: grupo.iconicTaxa.join(',') }, grupo.pages)
          )
        );
        return lists.flat();
      })
    ),
    zona?.projectSlug
      ? fetchSpeciesRows('minka', { project_id: zona.projectSlug }, 2)
      : Promise.resolve([] as SpeciesRow[]),
  ]);

  const result: EspecieBiodiversidad[] = [];

  GRUPOS.forEach((grupo, i) => {
    const map = new Map<string, SpeciesRow>();
    for (const row of aggregate(groupRows[i])) map.set(speciesKey(row.taxon.name), row);

    // Especies del proyecto local: se aceptan sin listas blancas (ya están revisadas)
    for (const r of projectRows) {
      const iconic = r.taxon?.iconic_taxon_name;
      if (!r.taxon?.name || !iconic || !grupo.iconicTaxa.includes(iconic)) continue;
      const key = speciesKey(r.taxon.name);
      const existing = map.get(key);
      if (existing) existing.trusted = true;
      else map.set(key, { ...r, trusted: true });
    }

    Array.from(map.values())
      .filter((row) => isValidRow(row, grupo.id))
      .sort((a, b) => b.count - a.count) // las más observadas primero
      .slice(0, grupo.max)
      .forEach((row) => result.push(toSpecies(row, grupo.id)));
  });

  return result;
};

// ───────────────────────── 2. GBIF ─────────────────────────

interface GbifOccurrence {
  key?: number;
  species?: string;
  vernacularName?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  media?: Array<{ identifier?: string; rightsHolder?: string }>;
}

/** GBIF trae la taxonomía completa: la usamos para asignar grupo (o descartar) */
const groupFromGbif = (item: GbifOccurrence): GrupoId | null => {
  const cls = item.class;
  const phylum = item.phylum;
  const kingdom = item.kingdom;

  if (cls === 'Actinopterygii' || cls === 'Elasmobranchii' || cls === 'Holocephali') return 'peces';
  if (cls === 'Aves' || cls === 'Mammalia' || cls === 'Reptilia' || cls === 'Testudines') {
    return 'vertebrados';
  }
  if (kingdom === 'Plantae' || kingdom === 'Chromista') return 'plantas';

  if (kingdom === 'Animalia') {
    if (phylum && ['Mollusca', 'Cnidaria', 'Echinodermata', 'Annelida', 'Porifera', 'Bryozoa'].includes(phylum)) {
      return 'invertebrados';
    }
    if (
      phylum === 'Arthropoda' &&
      cls &&
      ['Malacostraca', 'Thecostraca', 'Hexanauplia', 'Ostracoda', 'Pycnogonida', 'Branchiopoda'].includes(cls)
    ) {
      return 'invertebrados';
    }
    if (cls === 'Ascidiacea') return 'invertebrados';
  }

  return null; // insectos, arácnidos, anfibios, hongos...: fuera
};

const fetchFromGBIF = async (lat: number, lng: number): Promise<EspecieBiodiversidad[]> => {
  if (!USE_GBIF) return [];

  try {
    const minLat = lat - 0.15;
    const maxLat = lat + 0.05;
    const minLng = lng;
    const maxLng = lng + 0.2;

    const url =
      `https://api.gbif.org/v1/occurrence/search?decimalLatitude=${minLat},${maxLat}` +
      `&decimalLongitude=${minLng},${maxLng}&hasCoordinate=true` +
      `&hasGeospatialIssue=false&occurrenceStatus=PRESENT&limit=300`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const results = (data.results ?? []) as GbifOccurrence[];

    const seen = new Set<string>();
    const list: EspecieBiodiversidad[] = [];

    for (const item of results) {
      // Solo `species`: ya viene normalizado (sin autor), a diferencia de `scientificName`
      const speciesName = item.species;
      if (!speciesName) continue;

      const key = speciesKey(speciesName);
      if (seen.has(key)) continue;
      if (!isMarineSpecies(speciesName, item.vernacularName || '')) continue;

      const grupo = groupFromGbif(item);
      if (!grupo || !passesGroupPolicy(grupo, speciesName, item.kingdom === 'Chromista')) continue;

      seen.add(key);
      const isPlant = grupo === 'plantas';
      const gbifPhoto = item.media?.[0]?.identifier;

      list.push({
        id: `gbif-${item.key ?? speciesName}`,
        nombreComun: capitalize(item.vernacularName || speciesName),
        nombreCientifico: speciesName,
        categoria: isPlant ? 'flora' : 'fauna',
        badgeText: isPlant ? 'Flora' : 'Fauna',
        descripcion: 'Especie registrada en muestreos científicos del litoral catalán.',
        imagenUrl: gbifPhoto || FALLBACK_IMAGE,
        temporada: '',
        habitad: '',
        fuente: 'gbif',
        creditoImagen: gbifPhoto ? item.media?.[0]?.rightsHolder || 'GBIF' : undefined,
        grupo,
      });
    }

    return list;
  } catch (error) {
    console.warn('Error consultando GBIF:', error);
    return [];
  }
};

// ───────────────────────── Unión, límite y orden ─────────────────────────

/** Une listas sin repetir ninguna especie; la primera lista manda */
const mergeSpecies = (...lists: EspecieBiodiversidad[][]): EspecieBiodiversidad[] => {
  const combined = new Map<string, EspecieBiodiversidad>();
  for (const item of lists.flat()) {
    const k = speciesKey(item.nombreCientifico);
    if (!combined.has(k)) combined.set(k, item);
  }
  return Array.from(combined.values());
};

/**
 * Aplica el límite de cada grupo (200 en total) e intercala los grupos
 * (pez, invertebrado, planta, ave, pez...) para que cada página tenga variedad.
 */
const finalize = (list: EspecieBiodiversidad[]): EspecieBiodiversidad[] => {
  const lists = GRUPOS.map((g) => list.filter((s) => s.grupo === g.id).slice(0, g.max));

  const out: EspecieBiodiversidad[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const l of lists) {
      if (l[i]) out.push(l[i]);
    }
  }
  return out;
};

// ───────────────────────── Función principal ─────────────────────────

const resultCache = new Map<string, Promise<EspecieBiodiversidad[]>>();

/**
 * Devuelve la lista completa (sin Wikipedia, que se carga por páginas aparte).
 * @param onPartial Se llama en cuanto responden MINKA/iNaturalist, sin esperar a GBIF.
 */
export const fetchBiodiversityByCoords = (
  lat: number,
  lng: number,
  municipio?: string,
  onPartial?: (partial: EspecieBiodiversidad[]) => void
): Promise<EspecieBiodiversidad[]> => {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${normalizeText(municipio ?? '')}`;

  if (!resultCache.has(key)) {
    resultCache.set(
      key,
      (async () => {
        const naturalistsPromise = fetchFromNaturalists(lat, lng, municipio);
        const gbifPromise = fetchFromGBIF(lat, lng);

        const naturalists = await naturalistsPromise;
        const first = finalize(naturalists);
        if (first.length > 0) onPartial?.(first);

        const gbif = await gbifPromise;
        const result = finalize(mergeSpecies(naturalists, gbif));

        if (import.meta.env.DEV) {
          console.debug(
            '[Biodiversity] especies por grupo:',
            Object.fromEntries(GRUPOS.map((g) => [g.id, result.filter((s) => s.grupo === g.id).length]))
          );
        }

        if (result.length === 0) resultCache.delete(key); // no cachear fallos
        return result;
      })().catch((error) => {
        console.error('Error unificando fuentes de biodiversidad:', error);
        resultCache.delete(key);
        return [];
      })
    );
  }

  return resultCache.get(key)!;
};