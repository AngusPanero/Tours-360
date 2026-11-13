import { useEffect, useRef, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import "./error404.css";
import { UseTheme } from "../contexts/ThemeContext";
import { UseSession } from "../contexts/SessionContext";
import { UseLanguage, LANDING, type LandingLocale, type TextsConfig } from "../contexts/LanguageContext";

const REDIRECT_S = 5;

// Textos fijos del idioma activo (con el mismo respaldo que el resto del sitio)
const systemTexts = (texts: TextsConfig, language: string) => {
    const own = texts[language]?.landing;
    if (own) return own.system;
    const fb: LandingLocale = language.startsWith("de") ? "de-CH" : language.startsWith("es") ? "es-AR" : "en";
    return LANDING[fb].system;
};

// Letras en ola del botón tipo línea (aria-hidden; el botón lleva aria-label)
const wave = (label: string) => (
    <span className="nf-line-txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? "\u00A0" : ch}</span>
        ))}
    </span>
);

const Error404 = () => {
    const { theme } = UseTheme()
    const { setError } = UseSession()
    const { texts, language } = UseLanguage()
    const t = systemTexts(texts, language)
    const navigate = useNavigate()
    const secRef = useRef<HTMLSpanElement>(null)
    const [redirectPre, redirectPost = ""] = t.redirect.split("{s}")
    const themeClass = theme === "light" ? "theme-light" : "theme-dark"
    const words = t.notFoundTitle.split(" ")

    // Cuenta regresiva: el número se actualiza por ref (no re-renderiza cada segundo)
    useEffect(() => {
        const start = Date.now()
        const tick = window.setInterval(() => {
            const left = Math.max(0, REDIRECT_S - Math.floor((Date.now() - start) / 1000))
            if (secRef.current) secRef.current.textContent = String(left)
        }, 250)
        const timer = window.setTimeout(() => {
            setError(null)
            navigate("/")
        }, REDIRECT_S * 1000)
        return () => {
            window.clearInterval(tick)
            window.clearTimeout(timer)
        }
    }, [navigate, setError])

    const handleGoHome = () => {
        setError(null)
        navigate("/")
    }

    return (
        <main className={`nf-page ${themeClass}`}>
            <div className="nf-inner">
                <p className="nf-label">
                    <span className="nf-dash" aria-hidden="true" />
                    {t.notFoundKicker}
                </p>

                {/* Número gigante: cada cifra sube desde atrás de una línea */}
                <p className="nf-code" aria-hidden="true">
                    {["4", "0", "4"].map((d, i) => (
                        <span key={i} className="nf-mask">
                            <span className={`nf-digit${i === 1 ? " nf-accent" : ""}`} style={{ "--d": i } as CSSProperties}>{d}</span>
                        </span>
                    ))}
                </p>

                <h1 className={`nf-title${t.notFoundTitle.length > 48 ? " nf-title--long" : ""}`} aria-label={t.notFoundTitle}>
                    {words.map((w, i) => (
                        <span key={i} className="nf-mask" aria-hidden="true">
                            <span className={`nf-in${i === words.length - 1 ? " nf-accent" : ""}`} style={{ "--d": i } as CSSProperties}>
                                {w}
                            </span>
                        </span>
                    ))}
                </h1>
                <div className="nf-timer" aria-hidden="true"><span /></div>

                <div className="nf-foot">
                    <p className="nf-redirect">
                        {redirectPre}<span ref={secRef} className="nf-sec">{REDIRECT_S}</span>{redirectPost}
                    </p>
                    {/* Respaldo por si la redirección automática no dispara */}
                    <button type="button" className="nf-line" onClick={handleGoHome} aria-label={t.home}>
                        {wave(t.home)}
                        <svg className="nf-arrow" viewBox="0 0 26 26" aria-hidden="true">
                            <path d="M4 13h18M15 6l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </main>
    )
}

export default Error404