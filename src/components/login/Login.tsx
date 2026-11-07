import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: { email: string; name?: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login, register, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const finish = (user: { email: string; name: string | null }) => {
    onLoginSuccess?.({ email: user.email, name: user.name ?? undefined });
    onClose();
  };

  // Botón oficial de "Continuar con Google"
  useEffect(() => {
    if (!isOpen) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    const init = () => {
      const gid = window.google?.accounts.id;
      if (!gid || !googleBtnRef.current) return;
      gid.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError(null);
          setIsLoading(true);
          try {
            finish(await loginWithGoogle(credential));
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error con Google');
          } finally {
            setIsLoading(false);
          }
        },
      });
      gid.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        locale: 'es',
        width: Math.min(googleBtnRef.current.offsetWidth || 360, 400),
      });
    };

    if (window.google) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = isRegisterMode
        ? await register(email, password, name || undefined)
        : await login(email, password);
      finish(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
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
        <button
          type="button"
          className="seasight-modal-close"
          onClick={onClose}
          aria-label="Cerrar ventana de inicio de sesión"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <header className="seasight-modal-header">
          <div className="seasight-modal-logo-wrap">
            <div className="seasight-modal-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
                <path d="M2 7c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
                <path d="M2 17c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8" />
              </svg>
            </div>
          </div>
          <h2 id="modal-title" className="seasight-modal-title">SeaSight</h2>
          <p className="seasight-modal-subtitle">
            Accede para guardar tus playas favoritas y reportar avistamientos
          </p>
        </header>

        {/* Botón de Google (lo dibuja Google) */}
        <div className="seasight-modal-social">
          <div ref={googleBtnRef} className="seasight-google-slot" />
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <p className="seasight-form-error">Falta configurar VITE_GOOGLE_CLIENT_ID</p>
          )}
        </div>

        <div className="seasight-modal-divider" role="separator">
          <span className="seasight-divider-line"></span>
          <span className="seasight-divider-text">o bien con tu email</span>
          <span className="seasight-divider-line"></span>
        </div>

        <form className="seasight-modal-form" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="seasight-form-group">
              <label htmlFor="seasight-name" className="seasight-form-label">Nombre</label>
              <div className="seasight-input-wrapper">
                <input
                  id="seasight-name"
                  type="text"
                  className="seasight-input"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="seasight-form-group">
            <label htmlFor="seasight-email" className="seasight-form-label">Correo electrónico</label>
            <div className="seasight-input-wrapper">
              <span className="seasight-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="seasight-email"
                type="email"
                required
                className="seasight-input"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="seasight-form-group">
            <div className="seasight-label-row">
              <label htmlFor="seasight-password" className="seasight-form-label">Contraseña</label>
            </div>
            <div className="seasight-input-wrapper">
              <span className="seasight-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="seasight-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={isRegisterMode ? 8 : undefined}
                className="seasight-input seasight-input--password"
                placeholder={isRegisterMode ? 'Mínimo 8 caracteres' : 'Contraseña'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="seasight-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="seasight-form-error" role="alert">{error}</p>}

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

        <footer className="seasight-modal-footer">
          <p className="seasight-switch-mode-text">
            {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              className="seasight-switch-mode-btn"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
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