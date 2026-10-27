import React, { useState } from 'react';
import { MapView } from '../components/map/MapView';
import { DetailsSidebar } from '../components/details_sidebar/DetailsSidebar';
import type { Playa } from '../services/PlatgesCatalunya';

export interface InteractiveMapPageProps {
  onReportIncident?: () => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({
  onReportIncident,
}) => {
  const [selectedBeach, setSelectedBeach] = useState<Playa | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Al hacer clic en "Ver detalles" dentro de la popup del mapa
  const handleSelectBeach = (beach: Playa) => {
    setSelectedBeach(beach);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div 
      className="page-interactive-map" 
      style={{ 
        flex: 1, 
        display: 'flex', 
        position: 'relative', 
        height: '100%', 
        minHeight: 0, 
        overflow: 'hidden' 
      }}
    >
      {/* Mapa interactivo */}
      <MapView
        onSelectBeach={handleSelectBeach}
        onReportIncident={onReportIncident}
      />

      {/* Panel derecho de los detalles de l aplaya y su biodiversidad */}
      <DetailsSidebar
        isOpen={isSidebarOpen}
        beachName={selectedBeach?.nom || ''}
        location={`${selectedBeach?.municipi?.toUpperCase() || ''} • ${selectedBeach?.costa?.toUpperCase() || ''}`}
        flagStatus={selectedBeach?.banderaStatus || 'green'}
        flagLabel={selectedBeach?.banderaLabel || 'Bandera Verde'}
        lastUpdated={
          selectedBeach?.lastUpdated 
            ? `Última actualización: ${selectedBeach.lastUpdated}`
            : 'Última actualización: En directo'
        }
        activeSensor={true}
        onClose={handleCloseSidebar}
      />
    </div>
  );
};

export default InteractiveMapPage;