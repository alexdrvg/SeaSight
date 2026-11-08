export interface CoastPoint {
  lat: number;
  lng: number;
}

let coastPoints: CoastPoint[] = [];
const bearingCache = new Map<string, number | null>();

/** Radios (km) en los que se buscan playas vecinas, de menor a mayor */
const NEIGHBOR_RADII_KM = [6, 12, 20];
const MIN_POINTS = 3; // incluida la propia playa
const MIN_SPREAD_KM = 0.5; // si las playas están casi en el mismo punto, no hay dirección fiable

/** Registrar una vez las coordenadas de todas las playas cargadas */
export const setCoastPoints = (points: CoastPoint[]): void => {
  coastPoints = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  bearingCache.clear();
};

const KM_PER_DEG = 111.32;

/**
 * Rumbo (grados, 0 = norte, 90 = este, 180 = sur) hacia el mar desde una playa,
 * o null si no hay suficientes playas cercanas para estimarlo.
 */
export const estimateSeaBearing = (lat: number, lng: number): number | null => {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (bearingCache.has(cacheKey)) return bearingCache.get(cacheKey)!;

  const cosLat = Math.cos((lat * Math.PI) / 180);
  // Coordenadas locales en km: x hacia el este, y hacia el norte
  const local = coastPoints.map((p) => ({
    x: (p.lng - lng) * KM_PER_DEG * cosLat,
    y: (p.lat - lat) * KM_PER_DEG,
  }));

  let result: number | null = null;

  for (const radius of NEIGHBOR_RADII_KM) {
    const near = local.filter((p) => Math.hypot(p.x, p.y) <= radius);
    if (near.length < MIN_POINTS) continue;

    // Eje principal de los puntos = dirección de la costa
    const mx = near.reduce((s, p) => s + p.x, 0) / near.length;
    const my = near.reduce((s, p) => s + p.y, 0) / near.length;
    let sxx = 0;
    let syy = 0;
    let sxy = 0;
    for (const p of near) {
      const dx = p.x - mx;
      const dy = p.y - my;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }

    const spread = Math.sqrt((sxx + syy) / near.length);
    if (spread < MIN_SPREAD_KM) continue; // casi un solo punto: probar un radio mayor

    const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy); // ángulo de la costa
    // Las dos perpendiculares a la costa: una mira al mar y la otra a tierra
    const candidates = [
      { vx: -Math.sin(theta), vy: Math.cos(theta) },
      { vx: Math.sin(theta), vy: -Math.cos(theta) },
    ];
    // En Catalunya la tierra queda al oeste y al norte: el mar es la que mira al este/sur
    const score = (c: { vx: number; vy: number }) => c.vx - 0.5 * c.vy;
    const sea = score(candidates[0]) >= score(candidates[1]) ? candidates[0] : candidates[1];

    result = ((Math.atan2(sea.vx, sea.vy) * 180) / Math.PI + 360) % 360;
    break;
  }

  bearingCache.set(cacheKey, result);
  return result;
};