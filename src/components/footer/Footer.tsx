import './Footer.css';

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__status">
        <span className="app-footer__dot"></span>
        <span>Red de sensores en vivo (AEMET / ICGC)</span>
      </div>

      <div className="app-footer__info">
        <span>Última sincro: Hace 2 min</span>
        <span className="app-footer__divider">•</span>
        <a href="#terms">Aviso Legal</a>
        <span className="app-footer__divider">•</span>
        <a href="#privacy">Privacidad</a>
        <span className="app-footer__divider">•</span>
        <span>© 2026 SeaSight</span>
      </div>
    </footer>
  );
}