import { useEffect, useRef, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import "./processOk.css";
import { UseTheme } from "../contexts/ThemeContext";
import { UseLanguage, LANDING, type LandingLocale, type TextsConfig } from "../contexts/LanguageContext";

interface ProcessProps {
    processMessage: string;
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
    <span className="process-line-txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? "\u00A0" : ch}</span>
        ))}
    </span>
);

const ProcessOk = ({ processMessage }: ProcessProps) => {
    const { theme } = UseTheme()
    const { texts, language } = UseLanguage()
    const t = systemTexts(texts, language)
    const navigate = useNavigate()
    const secRef = useRef<HTMLSpanElement>(null)
    const [redirectPre, redirectPost = ""] = t.redirect.split("{s}")
    const themeClass = theme === "light" ? "theme-light" : "theme-dark"
    const words = processMessage.split(" ")

    // Cuenta regresiva: el número se actualiza por ref (no re-renderiza cada segundo)
    useEffect(() => {
        const start = Date.now()
        const tick = window.setInterval(() => {
            const left = Math.max(0, REDIRECT_S - Math.floor((Date.now() - start) / 1000))
            if (secRef.current) secRef.current.textContent = String(left)
        }, 250)
        const timer = window.setTimeout(() => {
            navigate("/")
        }, REDIRECT_S * 1000)
        return () => {
            window.clearInterval(tick)
            window.clearTimeout(timer)
        }
    }, [navigate])

    const handleGoHome = () => {
        navigate("/")
    }

    return (
        <main className={`process-page ${themeClass}`}>
            <div className="process-inner">
                <p className="process-label">
                    {/* La raya se convierte en tilde: proceso terminado */}
                    <svg className="process-mark" viewBox="0 0 26 26" aria-hidden="true">
                        <path className="process-mark-dash" d="M4 13h18" />
                        <path className="process-mark-tick" d="M5 13.5l5.2 5.2L21.5 7" />
                    </svg>
                    {t.okKicker}
                </p>

                <h1 className={`process-title${processMessage.length > 48 ? " process-title--long" : ""}`} aria-label={processMessage}>
                    {words.map((w, i) => (
                        <span key={i} className="process-mask" aria-hidden="true">
                            <span className={`process-in${i === words.length - 1 ? " process-accent" : ""}`} style={{ "--d": i } as CSSProperties}>
                                {w}
                            </span>
                        </span>
                    ))}
                </h1>
                <div className="process-timer" aria-hidden="true"><span /></div>

                <div className="process-foot">
                    <p className="process-redirect">
                        {redirectPre}<span ref={secRef} className="process-sec">{REDIRECT_S}</span>{redirectPost}
                    </p>
                    {/* Respaldo por si la redirección automática no dispara */}
                    <button type="button" className="process-line" onClick={handleGoHome} aria-label={t.home}>
                        {wave(t.home)}
                        <svg className="process-arrow" viewBox="0 0 26 26" aria-hidden="true">
                            <path d="M4 13h18M15 6l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </main>
    )
}

export default ProcessOk