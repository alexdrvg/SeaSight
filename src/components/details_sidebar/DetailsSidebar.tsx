import React, { useState, useEffect } from 'react';
import './DetailsSidebar.css';
import { fetchBiodiversityByCoords, type EspecieBiodiversidad } from '../../services/Biodiversity';

export type TabType = 'fauna-flora' | 'alertas' | 'estado';
export type FilterType = 'todos' | 'fauna' | 'flora' | 'protegidas';

export interface DetailsSidebarProps {
  isOpen?: boolean;
  beachName?: string;
  location?: string;
  latitud?: number;
  longitud?: number;
  flagStatus?: 'green' | 'yellow' | 'red';
  flagLabel?: string;
  lastUpdated?: string;
  activeSensor?: boolean;
  environmentalNotice?: {
    title: string;
    description: string;
    tagLabel?: string;
  };
  onClose?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export const DetailsSidebar: React.FC<DetailsSidebarProps> = ({
  isOpen = false,
  beachName = '',
  location = '',
  latitud,
  longitud,
  flagStatus = 'green',
  flagLabel = '',
  lastUpdated = '',
  environmentalNotice,
  onClose,
  onShare,
  onBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('fauna-flora');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('todos');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Estados dinámicos para la biodiversidad
  const [speciesList, setSpeciesList] = useState<EspecieBiodiversidad[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Consulta automática a GBIF al cambiar las coordenadas de la playa
  useEffect(() => {
    if (!isOpen || latitud === undefined || longitud === undefined) return;

    const loadBiodiversity = async () => {
      setLoading(true);
      const data = await fetchBiodiversityByCoords(latitud, longitud);
      setSpeciesList(data);
      setLoading(false);
    };

    loadBiodiversity();
  }, [isOpen, latitud, longitud]);

  if (!isOpen) return null;

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  // Filtrado de la lista devuelta por la API
  const filteredSpecies = speciesList.filter((item) => {
    if (selectedFilter === 'fauna') return item.categoria === 'fauna';
    if (selectedFilter === 'flora') return item.categoria === 'flora';
    if (selectedFilter === 'protegidas') return item.badgeText === 'Protegida';
    return true;
  });

  return (
    <div className="seasight-drawer-overlay" onClick={onClose}>
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
              <span className="seasight-drawer__tab-count">{loading ? '...' : speciesList.length}</span>
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

        {/* Contenido con Scroll */}
        <div className="seasight-drawer__body">
          {activeTab === 'fauna-flora' ? (
            <>
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

              {/* Píldoras de Filtro */}
              <div className="seasight-drawer__filters" role="group" aria-label="Filtrar especies">
                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'todos' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('todos')}
                >
                  <span>Todos</span>
                </button>

                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'fauna' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('fauna')}
                >
                  <span>Fauna</span>
                </button>

                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'flora' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('flora')}
                >
                  <span>Flora</span>
                </button>

                <button
                  type="button"
                  className={`seasight-drawer__pill ${selectedFilter === 'protegidas' ? 'seasight-drawer__pill--active' : ''}`}
                  onClick={() => setSelectedFilter('protegidas')}
                >
                  <span>Especies Protegidas</span>
                </button>
              </div>

              {/* Indicador de carga */}
              {loading && (
                <div className="seasight-drawer__empty">
                  <p>Buscando especies en el radio de esta playa...</p>
                </div>
              )}

              {/* Renderizado dinámico de tarjetas de GBIF */}
              {!loading && filteredSpecies.length > 0 && (
                <div className="seasight-drawer__species-list">
                  {filteredSpecies.map((especie) => (
                    <div key={especie.id} className="seasight-species-card">
                      <div className="seasight-species-card__body">
                        <div className="seasight-species-card__media">
                          <img 
                            src={especie.imagenUrl} 
                            alt={especie.nombreComun} 
                            className="seasight-species-card__img" 
                          />
                  
                        </div>

                        <div className="seasight-species-card__content">
                          <div className="seasight-species-card__head">
                            <div>
                              <h4 className="seasight-species-card__title">
                                {especie.nombreComun}
                              </h4>
                              <span className="seasight-species-card__scientific">
                                {especie.nombreCientifico}
                              </span>
                            </div>

                            <span className={`seasight-species-card__badge seasight-species-card__badge--${especie.categoria}`}>
                              {especie.badgeText}
                            </span>
                          </div>

                          <p className="seasight-species-card__desc">
                            {especie.descripcion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sin resultados */}
              {!loading && filteredSpecies.length === 0 && (
                <div className="seasight-drawer__empty">
                  <p>No se encontraron especies observadas para esta selección.</p>
                </div>
              )}
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