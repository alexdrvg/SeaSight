import React, { useState } from 'react';
import './Header.css';

export interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigate?: (route: string) => void;
  onLoginClick?: () => void;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNavigate,
  onLoginClick,
  user = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'mapa' | 'incidencias' | 'filtros'>('mapa');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleTabClick = (tab: 'mapa' | 'incidencias' | 'filtros') => {
    setActiveTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="header-container">
      {/* Logo */}
      <div className="header-brand">
        <a href="#home" className="header-logo-link" aria-label="Ir al inicio de SeaSight">
          <div className="header-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
              <path d="M2 7c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
              <path d="M2 17c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
            </svg>
          </div>
          <span className="header-brand-name">SeaSight</span>
        </a>
      </div>

      {/* Buscador rápido */}
      <div className="header-search">
        <form className="header-search-form" onSubmit={handleSearchSubmit} role="search">
          <div className="header-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="search"
            className="header-search-input"
            placeholder="Buscar playa o municipio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar playa o municipio"
          />
          {searchQuery && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </form>
      </div>

      {/* Navegación */}
      <nav className={`header-nav ${isMobileMenuOpen ? 'header-nav--open' : ''}`} aria-label="Navegación principal">
        <ul className="header-nav-list">
          <li className="header-nav-item">
            <button
              type="button"
              className={`header-nav-link ${activeTab === 'mapa' ? 'header-nav-link--active' : ''}`}
              onClick={() => handleTabClick('mapa')}
            >
              <svg className="header-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <span>Mapa</span>
            </button>
          </li>
          <li className="header-nav-item">
            <button
              type="button"
              className={`header-nav-link ${activeTab === 'incidencias' ? 'header-nav-link--active' : ''}`}
              onClick={() => handleTabClick('incidencias')}
            >
              <svg className="header-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Incidencias</span>
            </button>
          </li>
          <li className="header-nav-item">
            <button
              type="button"
              className={`header-nav-link ${activeTab === 'filtros' ? 'header-nav-link--active' : ''}`}
              onClick={() => handleTabClick('filtros')}
            >
              <svg className="header-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Filtros</span>
            </button>
          </li>
        </ul>

        {/* Sesión de usuario */}
        <div className="header-action-group">
          {user ? (
            <div className="header-user-profile">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="header-user-avatar" />
              ) : (
                <div className="header-user-initials">{user.name.charAt(0).toUpperCase()}</div>
              )}
              <span className="header-user-name">{user.name}</span>
            </div>
          ) : (
            <button
              type="button"
              className="header-btn-login"
              onClick={onLoginClick}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      {/* Menú Móvil */}
      <button
        type="button"
        className="header-mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label="Alternar navegación"
        aria-expanded={isMobileMenuOpen}
      >
        <span className={`header-hamburger ${isMobileMenuOpen ? 'header-hamburger--active' : ''}`}></span>
      </button>
    </header>
  );
};

export default Header;