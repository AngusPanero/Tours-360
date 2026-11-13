import React from 'react';
import { createPortal } from 'react-dom';
import './loader.css';
import { UseTheme } from '../contexts/ThemeContext';
import { UseLanguage, LANDING, type LandingLocale } from '../contexts/LanguageContext';

interface LoaderProps {
  /** Texto debajo de los bloques. Si no se pasa, sale del idioma activo. */
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

/**
 * Loader
 * ---------------------------------------------------------
 * Tres bloques que se apilan y se desarman: la misma idea de
 * "construir pieza por pieza" del manifiesto del Home.
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
  const themeContext = UseTheme() as { theme?: 'light' | 'dark' } | undefined;
  const theme = themeContext?.theme ?? 'dark';
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
      <span className="ld-loader-stack" aria-hidden="true">
        <span className="ld-loader-brick ld-loader-brick--1" />
        <span className="ld-loader-brick ld-loader-brick--2" />
        <span className="ld-loader-brick ld-loader-brick--3" />
      </span>

      {label && (
        <span className="ld-loader-message" aria-hidden="true">
          {label}
        </span>
      )}

      <span className="ld-loader-track" aria-hidden="true"><span /></span>
    </div>
  );

  if (!fullScreen) return content;

  return createPortal(content, document.body);
};

export default Loader;