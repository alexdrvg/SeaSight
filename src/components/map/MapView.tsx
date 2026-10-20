import React, { useState, useEffect } from 'react';
import './MapView.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BeachCard } from '../beach_card/BeachCard';
import '../beach_card/BeachCard.css';

// APIS
import { fetchMarineData } from '../../services/OpenMeteoMarineAPI';
import type { MarineData } from '../../services/OpenMeteoMarineAPI';
import { fetchAllPlayasCat } from '../../services/PlatgesCatalunya';
import type { Playa } from '../../services/PlatgesCatalunya';

// Fix de iconos por defecto de Leaflet TEMPORAL
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

Reflect.deleteProperty(L.Icon.Default.prototype, '_getIconUrl');
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface MapViewProps {
  onReportIncident?: () => void;
  onSelectBeach?: (beach: Playa) => void;
}

const CENTER_LAT = 41.2645;
const CENTER_LNG = 1.9800;

// Corrección de redimensionado inicial de Leaflet
const FixMapResize = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Vuela a la posición GPS sl pulsar el botón
const LocateUserHandler = ({ targetCoords }: { targetCoords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 15, { duration: 1.5 });
    }
  }, [targetCoords, map]);
  return null;
};

// Icono TEMPORAL para cada BeachCard según la bandera
const createBeachIcon = (status: 'green' | 'yellow' | 'red') => {
  const colorMap = {
    green: '#10b981',
    yellow: '#eab308',
    red: '#ef4444',
  };

  return L.divIcon({
    className: 'custom-beach-pin',
    html: `
      <div style="
        background-color: white;
        border: 2px solid ${colorMap[status]};
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-size: 14px;
        cursor: pointer;
      ">
        🏖️
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export const MapView: React.FC<MapViewProps> = ({ onReportIncident, onSelectBeach }) => {
  const [playas, setPlayas] = useState<Playa[]>([]);
  const [loadingPlayas, setLoadingPlayas] = useState<boolean>(true);
  const [marineData, setMarineData] = useState<MarineData | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  // Función para manejar la selección de la playa y abrir el panel
  const handleOpenPanel = (platja: Playa) => {
    if (onSelectBeach) {
      onSelectBeach(platja);
    }
  };

  // 1. CARGA AUTOMÁTICA DE PLAYAS ÚNICAS DESDE LA API
  useEffect(() => {
    const cargarPlayas = async () => {
      setLoadingPlayas(true);
      const dataApi = await fetchAllPlayasCat();
      setPlayas(dataApi);
      setLoadingPlayas(false);
    };

    cargarPlayas();
  }, []);

  // Carga los datos marinos en tiempo real
  useEffect(() => {
    const loadApiData = async () => {
      const data = await fetchMarineData(CENTER_LAT, CENTER_LNG);
      setMarineData(data);
    };

    loadApiData();
  }, []);

  const handleGeolocateUser = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador.');
      return;
    }
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords([latitude, longitude]);
        setLocating(false);
      },
      (error) => {
        console.error('Error obteniendo GPS:', error);
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <main className="map-view">
      <div className="map-view__content">
        {/* BARRA SUPERIOR DE ESTADO */}
        <section className="map-status-bar">
          <div className="map-status-bar__location">
            <span className="map-status-bar__region">
              <svg className="map-status-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Litoral de Catalunya
            </span>
            <span className="map-status-bar__separator">›</span>
            <span className="map-status-bar__beach">
              {loadingPlayas ? 'Cargando playas de Catalunya...' : `${playas.length} playas geolocalizadas`}
            </span>
          </div>


        </section>

        {/* CANVAS MAPA LEAFLET */}
        <div className="map-canvas">
          <MapContainer
            center={[CENTER_LAT, CENTER_LNG]}
            zoom={10}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: '24px' }}
          >
            <FixMapResize />
            <LocateUserHandler targetCoords={userCoords} />

            {/* Capa base: OpenStreetMap */}
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Capa náutica: OpenSeaMap */}
            <TileLayer
              attribution='&copy; OpenSeaMap'
              url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            />

            {/* MARCADORES PLAYAS DE LA API GENERALITAT */}
            {playas.map((platja) => (
              <Marker
                key={platja.id}
                position={[platja.latitud, platja.longitud]}
                icon={createBeachIcon(platja.banderaStatus)}
              >
                {/* Usamos 'custom-leaflet-popup' para NO duplicar la clase de tu tarjeta */}
                <Popup className="custom-leaflet-popup">
                  <BeachCard
                    beachName={platja.nom}
                    municipality={platja.municipi}
                    flagStatus={platja.banderaStatus}
                    flagLabel={platja.banderaLabel}
                    onViewDetails={() => handleOpenPanel(platja)}
                  />
                </Popup>
              </Marker>
            ))}

            {/* Marcador GPS del usuario */}
            {userCoords && (
              <Marker position={userCoords}>
                <Popup className="custom-leaflet-popup">
                  <strong>📍 Tu ubicación actual</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* BOTONES FLOTANTES */}
          <div className="map-canvas__footer">
            <div className="map-info-card">
              <div className="map-info-card__header">
                <span className="map-info-card__icon">📡</span>
                <strong>Playas de Catalunya</strong>
              </div>
              <p className="map-info-card__description">
                {playas.length} playas oficiales cargadas en directo
              </p>
            </div>

            <div className="map-fab-stack">
              <button
                type="button"
                className={`map-fab-btn map-fab-btn--gps ${locating ? 'map-fab-btn--loading' : ''}`}
                onClick={handleGeolocateUser}
                title="Ir a mi ubicación actual"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="map-fab-btn__icon">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </button>

              <button
                type="button"
                className="map-fab-btn map-fab-btn--report"
                onClick={onReportIncident}
                title="Reportar incidencia"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="map-fab-btn__icon">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="map-fab-btn__pulse"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MapView;