import React, { useState } from 'react';
import './DetailsSidebar.css';

export type TabType = 'fauna-flora' | 'alertas' | 'estado';
export type FilterType = 'todos' | 'fauna' | 'flora' | 'protegidas';

export interface BiodiversityCardItem {
  id: string;
  title: string;
  scientificName: string;
  description: string;
  category: 'fauna' | 'flora';
  isProtected?: boolean;
  statusBadge: {
    label: string;
    variant: 'vulnerable' | 'danger' | 'warning' | 'info';
  };
  imageSrc: string;
  metaInfo?: {
    leftText: string;
    rightText: string;
    rightIcon?: 'anchor' | 'first-aid' | 'phone';
  };
}

export interface DetailsSidebarProps {
  isOpen?: boolean;
  beachName?: string;
  location?: string;
  flagStatus?: 'green' | 'yellow' | 'red';
  flagLabel?: string;
  lastUpdated?: string;
  activeSensor?: boolean;
  environmentalNotice?: {
    title: string;
    description: string;
    tagLabel?: string;
  };
  speciesList?: BiodiversityCardItem[];
  onClose?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export const DetailsSidebar: React.FC<DetailsSidebarProps> = ({
  isOpen = false,
  beachName = '',
  location = '',
  flagStatus = 'green',
  flagLabel = '',
  lastUpdated = '',
  environmentalNotice,
  speciesList = [],
  onClose,
  onShare,
  onBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('fauna-flora');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('todos');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  // Filtrado reactivo de tarjetas de especies
  const filteredSpecies = speciesList.filter((item) => {
    if (selectedFilter === 'fauna') return item.category === 'fauna';
    if (selectedFilter === 'flora') return item.category === 'flora';
    if (selectedFilter === 'protegidas') return item.isProtected;
    return true;
  });

  return (
    <div className="seasight-drawer-overlay" onClick={onClose}>
      {/* onClick={(e) => e.stopPropagation()} evita que los clics dentro del panel lo cierren */}
      <aside 
        className="seasight-drawer" 
        role="complementary" 
        aria-label={`Detalles de ${beachName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="seasight-drawer__header">
          <div className="seasight-drawer__status-bar">
            <div className="seasight-drawer__status-left">
              {flagLabel && (
                <span className={`seasight-drawer__flag-badge seasight-drawer__flag-badge--${flagStatus}`}>
                  <svg className="seasight-drawer__icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{flagLabel}</span>
                </span>
              )}

              {lastUpdated && (
                <span className="seasight-drawer__time-meta">
                  <svg className="seasight-drawer__icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{lastUpdated}</span>
                </span>
              )}
            </div>

            <div className="seasight-drawer__header-actions">
              {onShare && (
                <button
                  type="button"
                  className="seasight-drawer__action-btn"
                  onClick={onShare}
                  title="Compartir ficha"
                  aria-label="Compartir ficha"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                className={`seasight-drawer__action-btn ${isBookmarked ? 'seasight-drawer__action-btn--active' : ''}`}
                onClick={handleBookmarkToggle}
                title="Guardar en favoritos"
                aria-label="Guardar en favoritos"
              >
                <svg viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>

              <button
                type="button"
                className="seasight-drawer__close-btn"
                onClick={onClose}
                title="Cerrar panel"
                aria-label="Cerrar panel"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <h2 className="seasight-drawer__title">{beachName}</h2>
          {location && (
            <div className="seasight-drawer__location">
              <svg className="seasight-drawer__pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{location}</span>
            </div>
          )}

          {/* Pestañas principales */}
          <nav className="seasight-drawer__tabs" aria-label="Secciones de la playa">
            <button
              type="button"
              className={`seasight-drawer__tab ${activeTab === 'fauna-flora' ? 'seasight-drawer__tab--active' : ''}`}
              onClick={() => setActiveTab('fauna-flora')}
            >
              <svg className="seasight-drawer__tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>Fauna y Flora</span>
              <span className="seasight-drawer__tab-count">{speciesList.length}</span>
            </button>

            <button
              type="button"
              className={`seasight-drawer__tab ${activeTab === 'alertas' ? 'seasight-drawer__tab--active' : ''}`}
              onClick={() => setActiveTab('alertas')}
            >
              <svg className="seasight-drawer__tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Alertas en Vivo</span>
            </button>

            <button
              type="button"
              className={`seasight-drawer__tab ${activeTab === 'estado' ? 'seasight-drawer__tab--active' : ''}`}
              onClick={() => setActiveTab('estado')}
            >
              <svg className="seasight-drawer__tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Estado Actual</span>
            </button>
          </nav>
        </header>

        {/* Contenido de las pestañas con scroll */}
        <div className="seasight-drawer__body">
          {activeTab === 'fauna-flora' ? (
            <>
              {/* Cabecera de Sección */}
              <div className="seasight-drawer__section-head">
                <div className="seasight-drawer__section-brand">
                  <svg className="seasight-drawer__icon-eco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                  <span className="seasight-drawer__section-title">BIODIVERSIDAD Y ESPECIES COSTERAS</span>
                </div>
                {environmentalNotice?.tagLabel && (
                  <span className="seasight-drawer__tag-natura">{environmentalNotice.tagLabel}</span>
                )}
              </div>

              {/* Banner Aviso Ambiental */}
              {environmentalNotice && (
                <div className="seasight-drawer__notice">
                  <div className="seasight-drawer__notice-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="seasight-drawer__notice-content">
                    <h4 className="seasight-drawer__notice-title">{environmentalNotice.title}</h4>
                    <p className="seasight-drawer__notice-desc">{environmentalNotice.description}</p>
                  </div>
                </div>
              )}

              {/* Filtros */}
              <div className="seasight-drawer__filters" role="group" aria-label="Filtrar especies">
                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'todos' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('todos')}
                >
                  <svg className="seasight-drawer__pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Todos</span>
                </button>

                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'fauna' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('fauna')}
                >
                  <svg className="seasight-drawer__pill-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-4.5 1A2.5 2.5 0 1 0 7.5 4.5 2.5 2.5 0 0 0 7.5 9.5zm9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-4.5 4a6.5 6.5 0 0 0-6.5 6.5 1 1 0 0 0 1 1h11a1 1 0 0 0 1-1 6.5 6.5 0 0 0-6.5-6.5z" />
                  </svg>
                  <span>Fauna</span>
                </button>

                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'flora' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('flora')}
                >
                  <svg className="seasight-drawer__pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" />
                  </svg>
                  <span>Flora</span>
                </button>

                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'protegidas' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('protegidas')}
                >
                  <svg className="seasight-drawer__pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Especies Protegidas</span>
                </button>
              </div>

              {/* Lista de tarjetas de especies */}
              <div className="seasight-drawer__species-list">
                {filteredSpecies.map((species) => (
                  <article key={species.id} className="seasight-species-card">
                    <div className="seasight-species-card__body">
                      <div className="seasight-species-card__media">
                        {species.imageSrc && (
                          <img
                            src={species.imageSrc}
                            alt={species.title}
                            className="seasight-species-card__img"
                            loading="lazy"
                          />
                        )}
                        <span className="seasight-species-card__media-badge">
                          {species.category?.toUpperCase()}
                        </span>
                      </div>

                      <div className="seasight-species-card__content">
                        <div className="seasight-species-card__head">
                          <div>
                            <h5 className="seasight-species-card__title">{species.title}</h5>
                            <span className="seasight-species-card__scientific">
                              {species.scientificName}
                            </span>
                          </div>
                          {species.statusBadge && (
                            <span
                              className={`seasight-species-card__badge seasight-species-card__badge--${species.statusBadge.variant}`}
                            >
                              {species.statusBadge.label}
                            </span>
                          )}
                        </div>

                        <p className="seasight-species-card__desc">{species.description}</p>
                      </div>
                    </div>

                    {species.metaInfo && (
                      <footer className="seasight-species-card__footer">
                        <span className="seasight-species-card__meta-left">
                          {species.metaInfo.leftText}
                        </span>
                        <span className="seasight-species-card__meta-right">
                          {species.metaInfo.rightIcon === 'anchor' && (
                            <svg className="seasight-species-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="5" r="3" />
                              <line x1="12" y1="22" x2="12" y2="8" />
                              <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                            </svg>
                          )}
                          {species.metaInfo.rightIcon === 'first-aid' && (
                            <svg className="seasight-species-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                              <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
                              <line x1="12" y1="11" x2="12" y2="17" />
                              <line x1="9" y1="14" x2="15" y2="14" />
                            </svg>
                          )}
                          {species.metaInfo.rightIcon === 'phone' && (
                            <svg className="seasight-species-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          )}
                          <span>{species.metaInfo.rightText}</span>
                        </span>
                      </footer>
                    )}
                  </article>
                ))}

                {filteredSpecies.length === 0 && (
                  <div className="seasight-drawer__empty">
                    <p>No se encontraron especies para esta selección.</p>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'alertas' ? (
            <div className="seasight-drawer__tab-placeholder">
              <h4 className="seasight-drawer__placeholder-title">Alertas e Incidencias en Vivo</h4>
              <div className="seasight-drawer__empty">
                <p>No hay alertas reportadas actualmente en esta playa.</p>
              </div>
            </div>
          ) : (
            <div className="seasight-drawer__tab-placeholder">
              <h4 className="seasight-drawer__placeholder-title">Estado Actual de la Playa</h4>
              <div className="seasight-drawer__empty">
                <p>Cargando datos meteorológicos y de oleaje...</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default DetailsSidebar;