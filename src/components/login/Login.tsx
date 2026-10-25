import React, { useState } from 'react';
import './Login.css';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: { email: string; name?: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          email,
          name: email.split('@')[0],
        });
      }
      onClose();
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          email: 'usuario.demo@gmail.com',
          name: 'Usuario Demo',
        });
      }
      onClose();
    }, 600);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="seasight-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="seasight-modal-card">
        {/* Botón de cierre en esquina superior derecha */}
        <button
          type="button"
          className="seasight-modal-close"
          onClick={onClose}
          aria-label="Cerrar ventana de inicio de sesión"
        >
          <svg
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

        {/* header */}
        <header className="seasight-modal-header">
          <div className="seasight-modal-logo-wrap">
            <div className="seasight-modal-logo-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
                <path d="M2 7c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
                <path d="M2 17c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
              </svg>
            </div>
          </div>
          <h2 id="modal-title" className="seasight-modal-title">
            SeaSight
          </h2>
          <p className="seasight-modal-subtitle">
            Accede para guardar tus playas favoritas y reportar avistamientos
          </p>
        </header>

        {/* Botón de acceso rápido: Continuar con Google */}
        <div className="seasight-modal-social">
          <button
            type="button"
            className="seasight-btn-google"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg
              className="seasight-google-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>

        {/* Separador con texto */}
        <div className="seasight-modal-divider" role="separator">
          <span className="seasight-divider-line"></span>
          <span className="seasight-divider-text">o bien con tu email</span>
          <span className="seasight-divider-line"></span>
        </div>

        {/* Formulario */}
        <form className="seasight-modal-form" onSubmit={handleSubmit}>
          {/* Campo Correo electrónico */}
          <div className="seasight-form-group">
            <label htmlFor="seasight-email" className="seasight-form-label">
              Correo electrónico
            </label>
            <div className="seasight-input-wrapper">
              <span className="seasight-input-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="seasight-email"
                type="email"
                required
                className="seasight-input"
                placeholder="Nombre de usuario o correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div className="seasight-form-group">
            <div className="seasight-label-row">
              <label htmlFor="seasight-password" className="seasight-form-label">
                Contraseña
              </label>
              <a
                href="#recuperar"
                className="seasight-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Recuperación de contraseña enviada');
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="seasight-input-wrapper">
              <span className="seasight-input-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="seasight-password"
                type={showPassword ? 'text' : 'password'}
                required
                className="seasight-input seasight-input--password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="seasight-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón Primario Iniciar Sesión */}
          <button
            type="submit"
            className={`seasight-btn-primary ${isLoading ? 'seasight-btn-primary--loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="seasight-spinner" aria-hidden="true"></span>
            ) : isRegisterMode ? (
              'Crear cuenta en SeaSight'
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Pestaña / Enlace sutil inferior */}
        <footer className="seasight-modal-footer">
          <p className="seasight-switch-mode-text">
            {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              className="seasight-switch-mode-btn"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
              {isRegisterMode ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginModal;
