import { useEffect, useMemo, useState } from 'react';
import {
  fetchBiodiversityByCoords,
  loadWikipediaFor,
  applyWikipedia,
  type EspecieBiodiversidad,
} from '../services/Biodiversity';

export type FiltroEspecies = 'todos' | 'fauna' | 'flora' | 'protegidas';

export const PAGE_SIZE = 10; // tarjetas por página (20 = justo un lote de Wikipedia)

interface ListState {
  key: string | null; // a qué playa pertenece esta lista
  species: EspecieBiodiversidad[];
  ready: boolean; // ya hay algo que enseñar
}

export const useBiodiversity = (
  isOpen: boolean,
  lat: number | undefined,
  lng: number | undefined,
  municipio: string | undefined,
  filter: FiltroEspecies,
  pageIndex: number // 0 = primera página
) => {
  const key =
    isOpen && lat !== undefined && lng !== undefined
      ? `${lat},${lng},${municipio ?? ''}`
      : null;

  const [state, setState] = useState<ListState>({ key: null, species: [], ready: false });
  const [wikiVersion, setWikiVersion] = useState(0);

  // 1) Lista completa de especies (ligera: nombres, fotos, recuentos)
  useEffect(() => {
    if (key === null || lat === undefined || lng === undefined) return;

    let cancelled = false; // evita que una playa anterior pise a la actual

    (async () => {
      const list = await fetchBiodiversityByCoords(lat, lng, municipio, (partial) => {
        if (cancelled) return;
        setState({ key, species: partial, ready: true });
      });
      if (cancelled) return;
      setState({ key, species: list, ready: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [key, lat, lng, municipio]);

  // Si el estado es de otra playa, se ignora
  const current = state.key === key ? state : null;
  const loading = key !== null && !current?.ready;

  // 2) Filtro y paginación
  const filtered = useMemo(
    () =>
      (current?.species ?? []).filter((item) => {
        if (filter === 'fauna') return item.categoria === 'fauna';
        if (filter === 'flora') return item.categoria === 'flora';
        if (filter === 'protegidas') return item.badgeText === 'Protegida';
        return true;
      }),
    [current, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(pageIndex, 0), totalPages - 1);

  const pageItems = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page]
  );

  // Página actual + la siguiente: así la siguiente ya está lista al pulsarla
  const toPrefetch = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 2) * PAGE_SIZE),
    [filtered, page]
  );

  // 3) Wikipedia solo de esas dos páginas (una petición de 20 títulos)
  useEffect(() => {
    if (toPrefetch.length === 0) return;
    let cancelled = false;

    loadWikipediaFor(toPrefetch).then(() => {
      if (!cancelled) setWikiVersion((v) => v + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [toPrefetch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => pageItems.map(applyWikipedia), [pageItems, wikiVersion]);

  return {
    items, // tarjetas de la página actual, con Wikipedia aplicada
    page, // página actual (0-based)
    totalPages,
    totalItems: filtered.length, // con el filtro aplicado
    totalSpecies: current?.species.length ?? 0, // sin filtrar
    loading,
  };
};