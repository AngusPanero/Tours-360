import { useState, useEffect, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import "./cookies.css"
import { UseTheme } from "../contexts/ThemeContext";

const STORAGE_KEY = "cookiesAccepted";
const EXIT_MS = 600;

// TODO (Angus): misma ruta que RUTA_COOKIES en legalInfo.ts
const COOKIES_ROUTE = "/policy-cookies";

const T = {
    kicker: "Cookies",
    text: "Solo usamos cookies técnicas: mantienen tu sesión y recuerdan tus preferencias. Nada de seguimiento ni publicidad.",
    brand: "Umbral",
    policy: "Ver política",
    accept: "Entendido",
};

// Letras en ola del botón tipo línea (aria-hidden; el botón lleva aria-label)
const wave = (label: string) => (
    <span className="cookie-line-txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>
        ))}
    </span>
);

const Cookies = () => {
    const [ visible, setVisible ] = useState(false);
    const [ exit, setExit ] = useState(false);
    const { theme } = UseTheme()
    const themeClass = theme === "light" ? "theme-light" : "theme-dark"

    useEffect(() => {
        localStorage.clear();
        let accepted: string | null = null;
        try {
            accepted = localStorage.getItem(STORAGE_KEY);
        } catch {
            accepted = null;
        }
        if (!accepted) {
            const timer = setTimeout(() => setVisible(true), 4000);
            return () => clearTimeout(timer);
        }
    }, []);

    // "true" = todas las cookies · "essential" = solo las necesarias
    const saveChoice = (value: "true" | "essential") => {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            /* modo privado: no se guarda, pero se cierra igual */
        }
        setExit(true);
        setTimeout(() => setVisible(false), EXIT_MS);
    };

    if (!visible) return null;

    return (
        <div className={`cookie-wrapper ${themeClass} ${exit ? "is-exit" : ""}`} role="dialog" aria-live="polite" aria-label="Aviso de cookies">
            <div className="cookie-banner">
                <span className="cookie-edge" aria-hidden="true" />

                <div className="cookie-content">
                    <span className="cookie-kicker">
                        <span className="cookie-dash" aria-hidden="true" />
                        {T.kicker}
                    </span>
                    <p className="cookie-text">
                        <strong>{T.brand}.</strong> {T.text}{" "}
                        <Link to={COOKIES_ROUTE} className="cookie-link">{T.policy}</Link>
                    </p>
                </div>

                <div className="cookie-actions">
                    {/* <button className="cookie-btn-ghost" onClick={() => saveChoice("essential")}>
                        Solo esenciales
                    </button> */}
                    <button type="button" className="cookie-btn" onClick={() => saveChoice("true")} aria-label={T.accept}>
                        {wave(T.accept)}
                        <svg className="cookie-btn-arrow" viewBox="0 0 26 26" aria-hidden="true">
                            <path d="M4 13h18M15 6l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cookies;