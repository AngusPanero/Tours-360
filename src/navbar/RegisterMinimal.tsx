import { useEffect, useState, type CSSProperties } from "react";
import "./registerMinimal.css";
import { UseTheme } from "../contexts/ThemeContext";
import { UseSession } from "../contexts/SessionContext";

// Rutas de las páginas legales (las mismas que en AppRouter)
const LEGAL_LINKS = {
    cookies: "/policy-cookies",
    privacy: "/policy-privacy",
    terms: "/policy-terms",
};

const EXIT_MS = 400;

// Mismo criterio que valida el backend en /register
const SPECIAL = /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~-]/;

// Letras en ola del botón tipo línea (las letras son aria-hidden, el botón lleva aria-label)
const wave = (label: string) => (
    <span className="reg-min-line-txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? "\u00A0" : ch}</span>
        ))}
    </span>
);

const Arrow = () => (
    <svg className="reg-min-arrow" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M4 13h18M15 6l7 7-7 7" />
    </svg>
);

interface RegisterProps {
    openLogin: () => void
    closeRegister: () => void
}

const RegisterMinimal = ({ openLogin, closeRegister }: RegisterProps) => {
    const { handleRegister, loading, error, setError } = UseSession();
    const { theme } = UseTheme();

    const [exit, setExit] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [showRequirements, setShowRequirements] = useState(false);
    const [visiblePassword, setVisiblePassword] = useState<boolean>(false);
    const [acceptedLegal, setAcceptedLegal] = useState<boolean>(false);

    const isLoading = loading === true;
    const errorText = typeof error === "string" ? error : "";
    // Con 201 el contexto deja "Cuenta creada..." en `error`: es éxito, no error
    const isInfo = errorText.startsWith("Cuenta creada");
    const themeClass = theme === "light" ? "theme-light" : "theme-dark";

    // Cierra con animación y después ejecuta la acción
    const leaveThen = (action: () => void) => {
        setExit(true);
        setTimeout(action, EXIT_MS);
    };

    const handleClose = () => leaveThen(closeRegister);

    const passwordRequirements = [
        { label: "Mínimo 10 caracteres", test: (pass: string) => pass.length >= 10 },
        { label: "Una mayúscula", test: (pass: string) => /[A-Z]/.test(pass) },
        { label: "Un número", test: (pass: string) => /\d/.test(pass) },
        { label: "Un símbolo", test: (pass: string) => SPECIAL.test(pass) },
    ];

    const metCount = passwordRequirements.filter((r) => r.test(password)).length;
    const nextRequirement = passwordRequirements.find((r) => !r.test(password));
    const mismatch = password !== password2 && password2 !== "";

    const isFormValid =
        email.includes("@") &&
        metCount === passwordRequirements.length &&
        password === password2 &&
        acceptedLegal &&
        !isLoading;

    const validatePassword = (pass: string) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~-]).{10,}$/;
        if (!regex.test(pass)) {
            setPasswordError("La contraseña no cumple con los requisitos.");
            return false;
        }
        setPasswordError("");
        return true;
    };

    // Al abrir, limpia mensajes viejos del contexto
    useEffect(() => {
        setError(null);
    }, []);

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

    // handleRegister(email, password, loginOpen, registerOpen):
    // con 201 llama registerOpen(false) + loginOpen(true) y deja el aviso
    // "Cuenta creada..." en `error`, que el login muestra como info.
    // Acá se traduce a: animación de salida → vuelve al login.
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedLegal || isLoading) return;
        if (!validatePassword(password)) return;
        if (password !== password2) return;

        await handleRegister(
            email,
            password,
            acceptedLegal,
            (open: boolean) => { if (open) leaveThen(goBackToLogin); },
            () => { /* el cierre lo hace leaveThen junto con la vuelta al login */ }
        );
    };

    const goBackToLogin = () => {
        closeRegister();
        openLogin();
    };

    const goToLogin = () => leaveThen(goBackToLogin);

    const submitLabel = isLoading ? "Creando cuenta…" : "Registrarse";

    return (
        <div
            className={`reg-min ${themeClass} ${exit ? "is-exit" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reg-min-title"
        >
            {/* ── BARRA ── */}
            <div className="reg-min-bar">
                {/* TODO (Angus): marca provisoria */}
                <span className="reg-min-brand" aria-label="Umbral">
                    <svg className="reg-min-mark" viewBox="0 0 32 32" aria-hidden="true">
                        <circle cx="16" cy="16" r="13.5" />
                        <path d="M12.5 29.5V13a3.5 3.5 0 0 1 7 0v16.5" />
                    </svg>
                    Umbral
                </span>
                <button type="button" className="reg-min-close" onClick={handleClose} aria-label="Cerrar">
                    <span className="reg-min-close-txt" aria-hidden="true">Cerrar</span>
                    <span className="reg-min-close-x" aria-hidden="true"><span /><span /></span>
                </button>
            </div>

            {/* ── CUERPO ── */}
            <div className="reg-min-body">
                <div className="reg-min-intro">
                    <p className="reg-min-label">
                        <span className="reg-min-label-num">02</span>
                        <span className="reg-min-label-slash" aria-hidden="true">/</span>
                        Crear cuenta
                    </p>

                    <h2 className="reg-min-title" id="reg-min-title">
                        <span className="reg-min-row">
                            <span className="reg-min-in" style={{ "--d": 0 } as CSSProperties}>Creá tu</span>
                        </span>
                        <span className="reg-min-row reg-min-row--2">
                            <span className="reg-min-in" style={{ "--d": 1 } as CSSProperties}>cuenta.</span>
                        </span>
                    </h2>

                    <p className="reg-min-desc">
                        Después de registrarte te enviamos un email para verificar tu cuenta.
                        Vas a poder ingresar una vez que la actives.
                    </p>
                </div>

                <form className="reg-min-form" onSubmit={onSubmit}>

                    {/* 01 · Email */}
                    <div className="reg-min-field">
                        <label htmlFor="reg-min-email">
                            <span className="reg-min-field-num">01</span>
                            Email
                        </label>
                        <div className="reg-min-control">
                            <input
                                id="reg-min-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nombre@empresa.com"
                                required
                                autoFocus
                            />
                            <span className="reg-min-underline" aria-hidden="true" />
                        </div>
                    </div>

                    {/* 02 · Contraseña + fuerza */}
                    <div className="reg-min-field">
                        <label htmlFor="reg-min-pass">
                            <span className="reg-min-field-num">02</span>
                            Contraseña
                        </label>
                        <div className="reg-min-control">
                            <input
                                id="reg-min-pass"
                                type={visiblePassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                                onFocus={() => setShowRequirements(true)}
                                onBlur={() => setShowRequirements(false)}
                                placeholder="••••••••"
                                required
                                aria-describedby="reg-min-reqs"
                            />
                            <button
                                type="button"
                                className="reg-min-toggle"
                                onClick={() => setVisiblePassword(!visiblePassword)}
                                aria-pressed={visiblePassword}
                            >
                                {visiblePassword ? "Ocultar" : "Mostrar"}
                            </button>
                            <span className="reg-min-underline" aria-hidden="true" />
                        </div>

                        {/* Medidor de fuerza: 4 tramos de línea */}
                        <div className="reg-min-meter" aria-hidden="true">
                            {passwordRequirements.map((_, i) => (
                                <span key={i} className={i < metCount ? "on" : ""} />
                            ))}
                        </div>

                        <ul
                            id="reg-min-reqs"
                            className={`reg-min-reqs ${showRequirements || (password && metCount < 4) ? "is-open" : ""}`}
                        >
                            {passwordRequirements.map((req, index) => {
                                const isMet = req.test(password);
                                return (
                                    <li key={index} className={isMet ? "is-met" : ""}>
                                        <span className="reg-min-req-dash" aria-hidden="true" />
                                        {req.label}
                                    </li>
                                );
                            })}
                        </ul>

                        {/* En pantallas bajas la lista se reemplaza por el próximo requisito que falta */}
                        <p className={`reg-min-req-next ${nextRequirement ? "" : "is-met"}`}>
                            <span className="reg-min-req-dash" aria-hidden="true" />
                            {nextRequirement ? nextRequirement.label : "Contraseña segura"}
                        </p>
                    </div>

                    {/* 03 · Verificar contraseña */}
                    <div className="reg-min-field">
                        <label htmlFor="reg-min-pass2">
                            <span className="reg-min-field-num">03</span>
                            Verificar contraseña
                        </label>
                        <div className={`reg-min-control ${mismatch ? "is-wrong" : ""}`}>
                            <input
                                id="reg-min-pass2"
                                type={visiblePassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <span className="reg-min-underline" aria-hidden="true" />
                        </div>
                    </div>

                    {/* ACEPTACIÓN LEGAL */}
                    <label className="reg-min-legal">
                        <input
                            type="checkbox"
                            className="reg-min-legal-input"
                            checked={acceptedLegal}
                            onChange={(e) => setAcceptedLegal(e.target.checked)}
                            required
                        />
                        <span className="reg-min-legal-box" aria-hidden="true">
                            <svg viewBox="0 0 16 16" width="12" height="12">
                                <path d="M3 8.5L6.5 12L13 4.5" />
                            </svg>
                        </span>
                        <span className="reg-min-legal-text">
                            Acepto la{" "}
                            <a href={LEGAL_LINKS.cookies} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                Política de Cookies
                            </a>
                            , la{" "}
                            <a href={LEGAL_LINKS.privacy} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                Política de Privacidad
                            </a>
                            {" "}y los{" "}
                            <a href={LEGAL_LINKS.terms} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                Términos y Condiciones
                            </a>
                            {" "}de Umbral.
                        </span>
                    </label>

                    <div className="reg-min-feedback" role="alert">
                        {mismatch && (
                            <p className="reg-min-msg is-error">
                                <span className="reg-min-msg-dash" aria-hidden="true" />
                                Las contraseñas no coinciden.
                            </p>
                        )}
                        {passwordError && (
                            <p className="reg-min-msg is-error">
                                <span className="reg-min-msg-dash" aria-hidden="true" />
                                {passwordError}
                            </p>
                        )}
                        {errorText && (
                            <p className={`reg-min-msg ${isInfo ? "is-info" : "is-error"}`}>
                                <span className="reg-min-msg-dash" aria-hidden="true" />
                                {errorText}
                            </p>
                        )}
                    </div>

                    <div className="reg-min-actions">
                        <button
                            type="submit"
                            className="reg-min-submit"
                            disabled={!isFormValid}
                            aria-label={submitLabel}
                        >
                            {wave(submitLabel)}
                            {isLoading ? <span className="reg-min-loading" aria-hidden="true" /> : <Arrow />}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── PIE: volver al login ── */}
            <div className="reg-min-foot">
                <span className="reg-min-foot-hint">¿Ya tenés cuenta?</span>
                <button type="button" className="reg-min-link" onClick={goToLogin} aria-label="Iniciá sesión">
                    {wave("Iniciá sesión")}
                    <Arrow />
                </button>
            </div>
        </div>
    );
};

export default RegisterMinimal;