import { useEffect, useRef, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import "./error.css";
import { UseTheme } from "../contexts/ThemeContext";
import { UseSession } from "../contexts/SessionContext";
import { UseLanguage, LANDING, type LandingLocale, type TextsConfig } from "../contexts/LanguageContext";

interface ErrorProps {
    errorMessage: string
}

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
    <span className="error-line-txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? "\u00A0" : ch}</span>
        ))}
    </span>
);

const Error = ({ errorMessage }: ErrorProps) => {
    const { theme } = UseTheme()
    const { setError } = UseSession()
    const { texts, language } = UseLanguage()
    const t = systemTexts(texts, language)
    const navigate = useNavigate()
    const secRef = useRef<HTMLSpanElement>(null)
    const [redirectPre, redirectPost = ""] = t.redirect.split("{s}")
    const themeClass = theme === "light" ? "theme-light" : "theme-dark"
    const words = errorMessage.split(" ")

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
        <main className={`error-page ${themeClass}`}>
            <div className="error-inner">
                <p className="error-label">
                    <span className="error-dash" aria-hidden="true" />
                    {t.errorKicker}
                </p>

                <h1 className={`error-title${errorMessage.length > 48 ? " error-title--long" : ""}`} aria-label={errorMessage}>
                    {words.map((w, i) => (
                        <span key={i} className="error-mask" aria-hidden="true">
                            <span className={`error-in${i === words.length - 1 ? " error-accent" : ""}`} style={{ "--d": i } as CSSProperties}>
                                {w}
                            </span>
                        </span>
                    ))}
                </h1>
                <div className="error-timer" aria-hidden="true"><span /></div>

                <div className="error-foot">
                    <p className="error-redirect">
                        {redirectPre}<span ref={secRef} className="error-sec">{REDIRECT_S}</span>{redirectPost}
                    </p>
                    {/* Respaldo por si la redirección automática no dispara */}
                    <button type="button" className="error-line" onClick={handleGoHome} aria-label={t.home}>
                        {wave(t.home)}
                        <svg className="error-arrow" viewBox="0 0 26 26" aria-hidden="true">
                            <path d="M4 13h18M15 6l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </main>
    )
}

export default Error