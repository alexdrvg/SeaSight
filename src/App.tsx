import { useState } from 'react';
import { Header } from './components/header/Header';
import { Footer } from './components/footer/Footer';
import { InteractiveMapPage } from './pages/InteractiveMapPage';
import './App.css';

export function App() {
  // Estado básico de navegación para cuando añadamos el resto de páginas
  const [currentPage, setCurrentPage] = useState<'home' | 'mapa' | 'incidencias'>('mapa');

  const handleSearch = (query: string) => {
    console.log('Buscando:', query);
  };

  //Conjunto de valores que puede ser PageType y fallará si no es ninguno de estos
  type PageType = 'home' | 'mapa' | 'incidencias';
  const handleNavigate = (route: string) => {
    console.log('Navegando a:', route);
    if (route === 'mapa' || route === 'incidencias' || route === 'home') {
      setCurrentPage(route as PageType);
    }
  };

  const handleLoginClick = () => {
    console.log('Abrir modal de inicio de sesión');
  };

  const handleSelectBeach = (beachName: string) => {
    console.log('Playa seleccionada (se abrirá el panel lateral):', beachName);
  };

  const handleReportIncident = () => {
    console.log('Abrir formulario/página de nueva incidencia');
  };

  return (
    <div className="app-container">
      <Header
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        onLoginClick={handleLoginClick}
      />

      {/* Renderizado condicional de páginas */}
      {currentPage === 'mapa' && (
        <InteractiveMapPage
          onSelectBeach={handleSelectBeach}
          onReportIncident={handleReportIncident}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;