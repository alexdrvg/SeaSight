import React from 'react';
import { MapView } from '../components/map/MapView';

export interface InteractiveMapPageProps {
  PlayaCatch?: (beachName: string) => void;
  onReportIncident?: () => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({
  onReportIncident,
}) => {
  return (
    <div className="page-interactive-map" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <MapView
        onReportIncident={onReportIncident}
      />
    </div>
  );
};

export default InteractiveMapPage;