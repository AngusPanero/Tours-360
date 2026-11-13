import React from 'react';
import { createPortal } from 'react-dom';
import './loader.css';
import { UseTheme } from '../contexts/ThemeContext';
import { UseLanguage, LANDING, type LandingLocale } from '../contexts/LanguageContext';

interface LoaderProps {
  /** Texto debajo de la marca. Si no se pasa, sale del idioma activo. */
  message?: string;
  /** Si es false, se muestra inline en vez de pantalla completa. */
  fullScreen?: boolean;
}

// "Cargando" en el idioma activo. Si el Loader se usa fuera del
// LanguageProvider (ej: antes de que monte la app), cae a castellano.
const useLoadingText = (): string => {
  try {
    const { texts, language } = UseLanguage();
    const own = texts[language]?.landing;
    if (own) return own.system.loading;
    const fb: LandingLocale = language.startsWith('de') ? 'de-CH' : language.startsWith('es') ? 'es-AR' : 'en';
    return LANDING[fb].system.loading;
  } catch {
    return LANDING['es-AR'].system.loading;
  }
};

// Si el Loader se monta fuera del ThemeProvider, arranca en oscuro.
const useThemeSafe = (): string => {
  try {
    return UseTheme().theme;
  } catch {
    return 'dark';
  }
};

/**
 * Loader — Umbral
 * ---------------------------------------------------------
 * La marca de Umbral cargando: el círculo (la vista 360) da la vuelta
 * completa mientras la puerta se enciende desde abajo, como una luz
 * que entra por el umbral. Debajo, el horizonte se recorre de punta a punta.
 *
 * Cuando fullScreen=true (default), se renderiza vía createPortal
 * directo en document.body. Esto es a propósito: si el Loader se
 * llama desde dentro de un contenedor que tenga `transform`,
 * `filter` o `will-change` en algún ancestro (una animación de
 * Framer Motion, un modal, etc.), ese ancestro se convierte en el
 * "containing block" de cualquier hijo con position:fixed — y el
 * loader queda atrapado dentro de esa caja en vez de cubrir toda
 * la pantalla. El portal lo saca de ese árbol por completo y lo
 * cuelga directo del <body>, así siempre es 100vw x 100vh de
 * verdad, sin importar desde dónde se lo llame.
 */
const Loader: React.FC<LoaderProps> = ({ message, fullScreen = true }) => {
  const theme = useThemeSafe();
  const fallback = useLoadingText();
  const label = message ?? fallback;

  const content = (
    <div
      className={[
        'ld-loader',
        fullScreen ? 'ld-loader--fullscreen' : 'ld-loader--inline',
        theme === 'light' ? 'theme-light' : 'theme-dark',
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg className="ld-loader-mark" viewBox="0 0 32 32" aria-hidden="true">
        {/* Vista 360: base tenue + arco que da la vuelta */}
        <circle className="ld-loader-ring-base" cx="16" cy="16" r="13.5" />
        <circle className="ld-loader-ring" cx="16" cy="16" r="13.5" pathLength="100" />
        {/* Umbral: la luz sube desde el piso y después se dibuja la puerta */}
        <path className="ld-loader-light" d="M12.5 29.5V13a3.5 3.5 0 0 1 7 0v16.5Z" />
        <path className="ld-loader-door" d="M12.5 29.5V13a3.5 3.5 0 0 1 7 0v16.5" pathLength="100" />
      </svg>

      {label && (
        <span className="ld-loader-message" aria-hidden="true">
          {label}
        </span>
      )}

      <span className="ld-loader-track" aria-hidden="true">
        <span />
      </span>
    </div>
  );

  if (!fullScreen) return content;

  return createPortal(content, document.body);
};

export default Loader;