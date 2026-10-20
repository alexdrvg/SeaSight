import React from 'react';
import './BeachCard.css';

export interface BeachCardProps {
  beachName: string;
  municipality: string;
  flagStatus: 'green' | 'yellow' | 'red';
  flagLabel?: string;
  onViewDetails?: () => void;
  onClose?: () => void;
}

export const BeachCard: React.FC<BeachCardProps> = ({
  beachName,
  municipality,
  flagStatus,
  flagLabel,
  onViewDetails,
  onClose,
}) => {
  const getFlagDetails = () => {
    switch (flagStatus) {
      case 'red':
        return {
          defaultText: 'Bandera Roja',
          badgeClass: 'beach-popup__badge--red',
          dotClass: 'beach-popup__badge-dot--red',
        };
      case 'yellow':
        return {
          defaultText: 'Bandera Amarilla',
          badgeClass: 'beach-popup__badge--yellow',
          dotClass: 'beach-popup__badge-dot--yellow',
        };
      case 'green':
      default:
        return {
          defaultText: 'Bandera Verde',
          badgeClass: 'beach-popup__badge--green',
          dotClass: 'beach-popup__badge-dot--green',
        };
    }
  };

  const flagInfo = getFlagDetails();
  const displayFlagLabel = flagLabel || flagInfo.defaultText;

  // Manejador del botón "Explorar playa" para evitar saltos en el mapa
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que el clic atraviese hacia el mapa Leaflet
    if (onViewDetails) {
      onViewDetails();
    }
  };

  // Maneja del botón de cierre
  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return (
    <article 
      className="beach-popup" 
      role="dialog" 
      aria-labelledby="beach-title"
      onClick={(e) => e.stopPropagation()} // Detiene eventos dentro del mapa
    >
      {/* Botón Cerrar (x) */}
      {onClose && (
        <button
          type="button"
          className="beach-popup__close-btn"
          onClick={handleCloseClick}
          aria-label="Cerrar ficha de playa"
        >
          <svg
            className="beach-popup__close-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Identificación de la playa */}
      <header className="beach-popup__header">
        <h3 id="beach-title" className="beach-popup__name">
          {beachName || 'Playa sin nombre'}
        </h3>
        <div className="beach-popup__location">
          <span className="beach-popup__pin-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </span>
          <span className="beach-popup__municipality">{(municipality || '').toUpperCase()}</span>
        </div>
      </header>

      {/* Estado de Bandera / Señalética */}
      <div className="beach-popup__status-wrap">
        <div className={`beach-popup__badge ${flagInfo.badgeClass}`}>
          <span className={`beach-popup__badge-dot ${flagInfo.dotClass}`} />
          <span className="beach-popup__badge-text">{displayFlagLabel}</span>
        </div>
      </div>

      {/* Botón Principal que llevará al panel derecha de la información de cada playa */}
      <footer className="beach-popup__footer">
        <button
          type="button"
          className="beach-popup__cta-btn"
          onClick={handleButtonClick}
        >
          <span className="beach-popup__cta-label">Explorar playa</span>
          <span className="beach-popup__cta-arrow" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </button>
      </footer>
    </article>
  );
};

export default BeachCard;