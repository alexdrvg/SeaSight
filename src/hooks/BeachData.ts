import { useState, useEffect } from 'react';
import { fetchAllPlayasCat, type Playa } from '../services/PlatgesCatalunya';
import { fetchMarineData, type MarineData } from '../services/OpenMeteoMarineAPI';
import { setCoastPoints } from '../services/coastGeometry';

export function BeachData(centerLat: number, centerLng: number) {
  const [playas, setPlayas] = useState<Playa[]>([]);
  const [loadingPlayas, setLoadingPlayas] = useState<boolean>(true);
  const [marineData, setMarineData] = useState<MarineData | null>(null);

  useEffect(() => {
    const loadPlayas = async () => {
      setLoadingPlayas(true);
      const dataApi = await fetchAllPlayasCat();
      setPlayas(dataApi);

      // Luego de leer las playas, ponemos y adaptamos las coordenadas de la lista a { lat, lng } para coastGeometry 
      setCoastPoints(
        dataApi.map((p) => ({
          lat: p.latitud ?? p.latitud,
          lng: p.longitud ?? p.longitud,
        }))
      );

      setLoadingPlayas(false);
    };

    loadPlayas();
  }, []);

  useEffect(() => {
    const loadMarine = async () => {
      const data = await fetchMarineData(centerLat, centerLng);
      setMarineData(data);
    };

    loadMarine();
  }, [centerLat, centerLng]);

  return { playas, loadingPlayas, marineData };
}