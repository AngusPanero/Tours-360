import React, { useEffect, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { flushSync } from 'react-dom';
import './politicasPrivacidad.css';
import { UseTheme } from '../contexts/ThemeContext';
import { FECHA_ACTUALIZACION, VERSION, esPendiente } from './legalInfo';

/**
 * LegalPage — Umbral
 * ---------------------------------------------------------
 * Base de la política de privacidad y los términos. Índice fijo a la izquierda
 * que marca la sección que se está leyendo (en celular, plegable arriba).
 * Todo ordenado con líneas finas y escala tipográfica, sin cajas.
 */

export interface LegalSection {
  id: string;
  titulo: string;
  contenido: React.ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  titulo: string;
  intro: React.ReactNode;
  secciones: LegalSection[];
}

/** Muestra un dato de legalInfo.ts; si sigue PENDIENTE, lo resalta para que no se publique así. */
export const Dato: React.FC<{ valor: string }> = ({ valor }) =>
  esPendiente(valor) ? <mark className="legal-pending">[{valor}]</mark> : <>{valor}</>;

const num = (i: number) => String(i + 1).padStart(2, '0');

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LegalPage: React.FC<LegalPageProps> = ({ eyebrow, titulo, intro, secciones }) => {
  const { theme } = UseTheme();
  const themeClass = theme === 'light' ? 'theme-light' : 'theme-dark';
  const [activeId, setActiveId] = useState(secciones[0]?.id ?? '');
  const [tocOpen, setTocOpen] = useState(false);
  const activeIndex = Math.max(0, secciones.findIndex((s) => s.id === activeId));
  const words = titulo.split(' ');

  useEffect(() => {
    // Con ancla (#cancelacion) vamos a ese punto cuando ya está en el DOM; si no, arriba del todo.
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) {
      window.scrollTo(0, 0);
      return;
    }
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, []);

  // Índice: marca la sección que cruza el tercio superior de la pantalla
  useEffect(() => {
    const nodes = secciones.map((s) => document.getElementById(s.id)).filter((n): n is HTMLElement => n !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: '-28% 0px -64% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [secciones]);

  const goTo = (e: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    // Primero se pliega el índice (en celular cambia la altura) y después se mide
    flushSync(() => setTocOpen(false));
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    // La dirección queda compartible (#seccion) sin que el router vuelva arriba
    window.history.replaceState(window.history.state, '', `#${id}`);
    target.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  };

  return (
    <div className={`legal ${themeClass}`}>
      <header className="legal-hero">
        <p className="legal-eyebrow">
          <span className="legal-dash" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="legal-heading" aria-label={titulo}>
          {words.map((w, i) => (
            <span key={i} className="legal-mask" aria-hidden="true">
              <span className={`legal-in${i === words.length - 1 ? ' legal-accent' : ''}`} style={{ '--d': i } as CSSProperties}>
                {w}
              </span>
            </span>
          ))}
        </h1>
        <div className="legal-hero-foot">
          <div className="legal-intro">{intro}</div>
          <dl className="legal-meta">
            <div>
              <dt>Versión</dt>
              <dd>{VERSION}</dd>
            </div>
            <div>
              <dt>Última actualización</dt>
              <dd>{FECHA_ACTUALIZACION}</dd>
            </div>
            <div>
              <dt>Secciones</dt>
              <dd>{String(secciones.length).padStart(2, '0')}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="legal-layout">
        <nav
          className={`legal-toc${tocOpen ? ' is-open' : ''}`}
          aria-label="Índice"
          style={{ '--p': (activeIndex + 1) / secciones.length } as CSSProperties}
        >
          {/* Celular: el índice queda plegado arriba del contenido */}
          <button
            type="button"
            className="legal-toc-toggle"
            aria-expanded={tocOpen}
            aria-controls="legal-toc-list"
            onClick={() => setTocOpen((o) => !o)}
          >
            <span className="legal-toc-current">Índice</span>
            <span className="legal-toc-number">{String(secciones.length).padStart(2, '0')} secciones</span>
            <span className="legal-toc-plus" aria-hidden="true" />
          </button>

          <span className="legal-toc-title">Índice</span>
          <ol className="legal-toc-list" id="legal-toc-list">
            {secciones.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`legal-toc-link${s.id === activeId ? ' is-active' : ''}`}
                  aria-current={s.id === activeId ? 'location' : undefined}
                  onClick={(e) => goTo(e, s.id)}
                >
                  <span className="legal-toc-number">{num(i)}</span>
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
          <span className="legal-toc-rail" aria-hidden="true">
            <i />
          </span>
        </nav>

        <article className="legal-content">
          {secciones.map((s, i) => (
            <section key={s.id} id={s.id} className="legal-section" aria-labelledby={`${s.id}-titulo`}>
              <h2 id={`${s.id}-titulo`} className="legal-section-title" tabIndex={-1}>
                <span className="legal-section-number">
                  {num(i)} <i>/</i>
                </span>
                {s.titulo}
              </h2>
              <div className="legal-body">{s.contenido}</div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
};

export default LegalPage;