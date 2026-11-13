import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./loginCorporate.css";
import { UseTheme } from "../contexts/ThemeContext";
import { UseSession } from "../contexts/SessionContext";
import { UseLanguage, LANDING, type LandingLocale } from "../contexts/LanguageContext";

interface LoginProps {
    closeLogin: () => void
    openRegister: () => void
}

const EXIT_MS = 400;
const PIN_LENGTH = 4;

// Letras en ola del botón tipo línea (las letras son aria-hidden, el botón lleva aria-label)
const wave = (label: string) => (
    <span className="log-corp-line-txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>
        ))}
    </span>
);

const Arrow = () => (
    <svg className="log-corp-arrow" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M4 13h18M15 6l7 7-7 7" />
    </svg>
);

const LoginCorporate = ({ closeLogin, openRegister }: LoginProps) => {
    const { theme } = UseTheme()
    const { handleLogin, handleResetPassword, loading, error, emailNotVerified, errorIsInfo, adminPinRequired, cancelAdminPin } = UseSession()
    const { texts, language } = UseLanguage()
    const tx = (texts[language]?.landing ?? LANDING[(language.startsWith("de") ? "de-CH" : language.startsWith("es") ? "es-AR" : "en") as LandingLocale]).session

    const [ exit, setExit ] = useState(false);
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ visiblePassword, setVisiblePassword ] = useState<boolean>(false)

    // ── Clave de firma (solo admin, segundo paso) ─────────────────────────────
    // El campo aparece recién cuando el servidor confirmó la contraseña y dijo
    // que la cuenta firma. Para una cuenta común no cambia nada.
    const [ pin, setPin ] = useState("")
    const pinRef = useRef<HTMLInputElement>(null)
    const pinStep = adminPinRequired

    const isLoading = loading === true;
    const errorText = typeof error === "string" ? error : "";
    // Aviso positivo (ej: "Cuenta creada…"): lo marca el contexto, en cualquier idioma
    const isInfo = errorIsInfo;
    const themeClass = theme === "light" ? "theme-light" : "theme-dark";
    // Estado del campo de la clave: verificando / con error / esperando
    const pinStatus = !pinStep ? "idle" : isLoading ? "checking" : errorText ? "error" : "idle";

    // Cierra con animación y después ejecuta la acción (cerrar o pasar al registro)
    const leaveThen = (action: () => void) => {
        setExit(true);
        setTimeout(action, EXIT_MS);
    };

    const handleClose = () => leaveThen(closeLogin);
    const goToRegister = () => leaveThen(openRegister);

    // Pantalla completa: cierra con Escape o con "Cerrar" (no hay "afuera")
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, []);

    // Cuando el servidor pide la clave: el campo aparece y toma el foco
    useEffect(() => {
        if (!pinStep) { setPin(""); return; }
        setTimeout(() => pinRef.current?.focus(), 0);
    }, [pinStep]);

    // Cambiar email o contraseña vuelve al primer paso (la clave es de esa cuenta)
    const onEmailChange = (value: string) => {
        setEmail(value);
        if (pinStep) cancelAdminPin();
    };
    const onPasswordChange = (value: string) => {
        setPassword(value);
        if (pinStep) cancelAdminPin();
    };

    const sendPin = async (value: string) => {
        const response = await handleLogin(email, password, value);
        if (response) {
            closeLogin();
            return;
        }
        // Clave incorrecta o bloqueada: se limpia y vuelve el foco
        setPin("");
        setTimeout(() => pinRef.current?.focus(), 0);
    };

    // Solo dígitos; con 4 se envía sola
    const onPinChange = (raw: string) => {
        if (isLoading) return;
        const value = raw.replace(/\D/g, "").slice(0, PIN_LENGTH);
        setPin(value);
        if (value.length === PIN_LENGTH) sendPin(value);
    };

    // handleLogin navega solo (/admin o /dashboard) y devuelve true si entró
    const loginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        if (pinStep) {
            if (pin.length === PIN_LENGTH) sendPin(pin);
            else pinRef.current?.focus();
            return;
        }
        const response = await handleLogin(email, password);
        if (response) {
            closeLogin();
        }
    }

    // Reenviar verificación: el backend la reenvía al intentar entrar con la
    // contraseña correcta, así solo puede pedirla el dueño de la cuenta
    const resendVerification = async () => {
        if (!email || !password) return;
        const response = await handleLogin(email, password);
        if (response) {
            closeLogin();
        }
    }

    const submitLabel = isLoading ? "Ingresando…" : "Ingresar";

    return (
        <div
            className={`log-corp ${themeClass} ${exit ? "is-exit" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-corp-title"
        >
            {/* ── BARRA ── */}
            <div className="log-corp-bar">
                {/* TODO (Angus): marca provisoria */}
                <span className="log-corp-brand" aria-label="Umbral">
                    <svg className="log-corp-mark" viewBox="0 0 32 32" aria-hidden="true">
                        <circle cx="16" cy="16" r="13.5" />
                        <path d="M12.5 29.5V13a3.5 3.5 0 0 1 7 0v16.5" />
                    </svg>
                    Umbral
                </span>
                <button type="button" className="log-corp-close" onClick={handleClose} aria-label="Cerrar">
                    <span className="log-corp-close-txt" aria-hidden="true">Cerrar</span>
                    <span className="log-corp-close-x" aria-hidden="true"><span /><span /></span>
                </button>
            </div>

            {/* ── CUERPO ── */}
            <div className="log-corp-body">
                <div className="log-corp-intro">
                    <p className="log-corp-label">
                        <span className="log-corp-label-num">01</span>
                        <span className="log-corp-label-slash" aria-hidden="true">/</span>
                        Iniciar sesión
                    </p>

                    <h2 className="log-corp-title" id="log-corp-title">
                        <span className="log-corp-row">
                            <span className="log-corp-in" style={{ "--d": 0 } as CSSProperties}>Bienvenido</span>
                        </span>
                        <span className="log-corp-row log-corp-row--2">
                            <span className="log-corp-in" style={{ "--d": 1 } as CSSProperties}>de nuevo.</span>
                        </span>
                    </h2>

                    <p className="log-corp-desc">
                        Ingresá con tu email y contraseña para entrar al panel de tours.
                    </p>
                </div>

                <form className="log-corp-form" onSubmit={loginSubmit}>

                    {/* 01 · Email */}
                    <div className="log-corp-field">
                        <label htmlFor="log-corp-email">
                            <span className="log-corp-field-num">01</span>
                            Email
                        </label>
                        <div className="log-corp-control">
                            <input
                                id="log-corp-email"
                                type="email"
                                autoComplete="email"
                                placeholder="nombre@empresa.com"
                                value={email}
                                onChange={(e) => onEmailChange(e.target.value)}
                                required
                                autoFocus
                            />
                            <span className="log-corp-underline" aria-hidden="true" />
                        </div>
                    </div>

                    {/* 02 · Contraseña */}
                    <div className="log-corp-field">
                        <label htmlFor="log-corp-password">
                            <span className="log-corp-field-num">02</span>
                            Contraseña
                        </label>
                        <div className="log-corp-control">
                            <input
                                id="log-corp-password"
                                type={visiblePassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => onPasswordChange(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="log-corp-toggle"
                                onClick={() => setVisiblePassword(!visiblePassword)}
                                aria-pressed={visiblePassword}
                            >
                                {visiblePassword ? "Ocultar" : "Mostrar"}
                            </button>
                            <span className="log-corp-underline" aria-hidden="true" />
                        </div>
                    </div>

                    {/* 03 · Clave de firma: solo si la contraseña fue correcta y la cuenta es admin */}
                    {pinStep && (
                        <div className={`log-corp-field log-corp-pin is-${pinStatus}`}>
                            <label htmlFor="log-corp-pin">
                                <span className="log-corp-field-num">03</span>
                                {tx.pinLabel}
                            </label>
                            <div className="log-corp-control">
                                <input
                                    ref={pinRef}
                                    id="log-corp-pin"
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="one-time-code"
                                    maxLength={PIN_LENGTH}
                                    placeholder="····"
                                    value={pin}
                                    onChange={(e) => onPinChange(e.target.value)}
                                    readOnly={isLoading}
                                    aria-describedby="log-corp-pin-msg"
                                    aria-invalid={pinStatus === "error" || undefined}
                                />
                                {/* Cuatro rayas que se completan con cada dígito */}
                                <span className="log-corp-pin-steps" aria-hidden="true">
                                    {Array.from({ length: PIN_LENGTH }, (_, i) => (
                                        <span key={i} className={i < pin.length ? "on" : ""} />
                                    ))}
                                </span>
                                <span className="log-corp-underline" aria-hidden="true" />
                            </div>
                            <p className="log-corp-pin-msg" id="log-corp-pin-msg" aria-live="polite">
                                <span className="log-corp-msg-dash" aria-hidden="true" />
                                {pinStatus === "checking" ? tx.pinChecking : errorText || tx.pinHint}
                            </p>
                        </div>
                    )}

                    <button type="button" className="log-corp-forgot" onClick={() => handleResetPassword(email)}>
                        ¿Olvidaste tu contraseña?
                    </button>

                    {/* ── Mensaje genérico / aviso de cuenta creada ── */}
                    {errorText && !emailNotVerified && !pinStep && (
                        <p className={`log-corp-msg ${isInfo ? "is-info" : "is-error"}`} role="alert">
                            <span className="log-corp-msg-dash" aria-hidden="true" />
                            {errorText}
                        </p>
                    )}

                    {/* ── Email no verificado ── */}
                    {emailNotVerified && (
                        <div className="log-corp-verify" role="alert">
                            <p className="log-corp-verify-title">
                                <span className="log-corp-msg-dash" aria-hidden="true" />
                                Verificá tu email
                            </p>
                            <p className="log-corp-verify-text">
                                {errorText || "Revisá tu casilla y hacé click en el link de activación que te enviamos."}
                            </p>
                            <button
                                type="button"
                                className="log-corp-verify-btn"
                                onClick={resendVerification}
                                disabled={!email || !password || isLoading}
                            >
                                {isLoading ? "Enviando…" : "Reenviar email de verificación"}
                            </button>
                        </div>
                    )}

                    <div className="log-corp-actions">
                        <button
                            type="submit"
                            className="log-corp-submit"
                            disabled={isLoading}
                            aria-label={submitLabel}
                        >
                            {wave(submitLabel)}
                            {isLoading ? <span className="log-corp-loading" aria-hidden="true" /> : <Arrow />}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── PIE: pasar al registro ── */}
            <div className="log-corp-foot">
                <span className="log-corp-foot-hint">¿Usuario nuevo?</span>
                <button type="button" className="log-corp-link" onClick={goToRegister} aria-label="Registrate">
                    {wave("Registrate")}
                    <Arrow />
                </button>
            </div>
        </div>
    );
};

export default LoginCorporate;