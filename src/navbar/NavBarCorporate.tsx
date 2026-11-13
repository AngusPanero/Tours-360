import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { UseTheme } from "../contexts/ThemeContext";
import { UseSession } from "../contexts/SessionContext";
// TODO (Angus): confirmá el path real de tu modal de login.
import LoginCorporate from "./LoginCorporate";
// TODO (Angus): confirmá el path real del registro.
import RegisterMinimal from "./RegisterMinimal";
import "./navBarCorporate.css";

/**
 * NavBarCorporate — Umbral
 * ---------------------------------------------------------
 * Se monta por fuera, en el layout: <NavBarCorporate /> <Home /> <Footer />
 *
 * - Sin cajas: tipografía, líneas finas y aire.
 * - Cada link lleva a su página y marca la que está abierta.
 * - Se esconde al bajar y reaparece al subir; la línea inferior marca el avance del scroll.
 * - Menú mobile a pantalla completa.
 */

// TODO (Angus): marca provisoria.
const BRAND = "Umbral";

const PAGES = [
    { to: "/estudio", label: "Estudio" },
    { to: "/proceso", label: "Proceso" },
    { to: "/rubros", label: "Rubros" },
    { to: "/contact", label: "Contacto" },
];

const T = {
    home: "Inicio",
    menu: "Menú",
    close: "Cerrar",
    open: "Abrir menú",
    login: "Ingresar",
    logout: "Salir",
    admin: "Tours",
    themeLight: "Modo claro",
    themeDark: "Modo oscuro",
    region: "Tours virtuales 360 · Buenos Aires", // TODO (Angus): ciudad o región
};

const pad = (n: number) => String(n).padStart(2, "0");

/* Texto tipo línea: cada letra sube con un pequeño retraso y deja ver su copia en acento */
const Roll = ({ text }: { text: string }) => (
    <span className="nav-umb-roll" aria-hidden="true">
        {[...text].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>
                {ch === " " ? " " : ch}
            </span>
        ))}
    </span>
);

/* Marca: una esfera atravesada por un umbral */
const Mark = () => (
    <svg className="nav-umb-mark" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13.5" />
        <path d="M12.5 29.5V13a3.5 3.5 0 0 1 7 0v16.5" />
    </svg>
);

/* Contraste: un círculo mitad lleno que gira media vuelta al cambiar de tema */
const ThemeIcon = ({ theme }: { theme: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={`nav-umb-theme-icon ${theme === "dark" ? "is-dark" : "is-light"}`} aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5Z" fill="currentColor" />
    </svg>
);

const NavBarCorporate = () => {
    const { theme, handleTheme } = UseTheme();
    const { user, handleLogout } = UseSession();
    const { pathname, hash } = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const lastY = useRef(0);
    const headerRef = useRef<HTMLElement>(null);

    const isAdmin = !!user && user.admin === true;

    // El círculo del nuevo tema nace donde se hizo clic (las reglas viven en navBarCorporate.css)
    const toggleThemeWithAnimation = (e: ReactMouseEvent<HTMLButtonElement>) => {
        document.documentElement.style.setProperty("--x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--y", `${e.clientY}px`);
        const nextTheme = theme === "dark" ? "light" : "dark";
        if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            handleTheme(nextTheme);
            return;
        }
        document.startViewTransition(() => handleTheme(nextTheme));
    };

    // Cada página nueva arranca arriba y con el menú cerrado
    // (si la dirección trae #ancla, se deja que el navegador baje hasta ahí)
    useEffect(() => {
        setMobileOpen(false);
        if (!hash) window.scrollTo(0, 0);
    }, [pathname, hash]);

    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 40);
            // Se esconde al bajar, aparece al subir
            if (y > 160 && y > lastY.current + 4) setHidden(true);
            else if (y < lastY.current - 4 || y <= 160) setHidden(false);
            lastY.current = y;

            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                headerRef.current?.style.setProperty("--nv-p", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    // Bloquea el scroll del body mientras el menú mobile está abierto
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    // Escape cierra el menú mobile
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    const closeMobile = () => setMobileOpen(false);
    const themeClass = theme === "dark" ? "theme-dark" : "theme-light";

    return (
        <>
            <header
                ref={headerRef}
                className={[
                    "nav-umb",
                    scrolled ? "is-scrolled" : "",
                    hidden && !mobileOpen ? "is-hidden" : "",
                    mobileOpen ? "is-menu-open" : "",
                    themeClass,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <nav className="nav-umb-bar" aria-label="Principal">
                    <NavLink to="/" className="nav-umb-logo" onClick={closeMobile} aria-label={`${BRAND} — ${T.home}`}>
                        <Mark />
                        <span className="nav-umb-wordmark" aria-hidden="true">{BRAND}</span>
                    </NavLink>

                    {/* ---------- Links desktop ---------- */}
                    <ul className="nav-umb-links">
                        {PAGES.map((p, i) => (
                            <li key={p.to}>
                                <NavLink to={p.to} className={({ isActive }) => `nav-umb-link ${isActive ? "is-active" : ""}`}>
                                    <span className="nav-umb-link-index">{pad(i + 1)}</span>
                                    <span className="nav-umb-sr">{p.label}</span>
                                    <Roll text={p.label} />
                                </NavLink>
                            </li>
                        ))}
                        {isAdmin && (
                            <li>
                                <NavLink to="/admin" className={({ isActive }) => `nav-umb-link ${isActive ? "is-active" : ""}`}>
                                    <span className="nav-umb-link-index">{pad(PAGES.length + 1)}</span>
                                    <span className="nav-umb-sr">{T.admin}</span>
                                    <Roll text={T.admin} />
                                </NavLink>
                            </li>
                        )}
                    </ul>

                    <div className="nav-umb-actions">
                        <button
                            type="button"
                            className="nav-umb-theme"
                            onClick={toggleThemeWithAnimation}
                            aria-label={theme === "dark" ? T.themeLight : T.themeDark}
                        >
                            <ThemeIcon theme={theme} />
                        </button>

                        {user ? (
                            <button type="button" className="nav-umb-ghost" onClick={handleLogout}>
                                <span className="nav-umb-sr">{T.logout}</span>
                                <Roll text={T.logout} />
                            </button>
                        ) : (
                            <button type="button" className="nav-umb-ghost" onClick={() => setLoginOpen(true)}>
                                <span className="nav-umb-sr">{T.login}</span>
                                <Roll text={T.login} />
                            </button>
                        )}

                        {/* ---------- Menú (mobile): palabra + dos líneas ---------- */}
                        <button
                            type="button"
                            className="nav-umb-burger"
                            aria-label={mobileOpen ? T.close : T.open}
                            aria-expanded={mobileOpen}
                            aria-controls="nav-umb-overlay"
                            onClick={() => setMobileOpen((o) => !o)}
                        >
                            <span className="nav-umb-burger-label" aria-hidden="true">
                                {mobileOpen ? T.close : T.menu}
                            </span>
                            <span className="nav-umb-burger-lines" aria-hidden="true">
                                <span />
                                <span />
                            </span>
                        </button>
                    </div>
                </nav>

                <span className="nav-umb-progress" aria-hidden="true" />
            </header>

            {/* ---------- Overlay mobile (fuera del header para no heredar el hide) ---------- */}
            <div
                id="nav-umb-overlay"
                className={`nav-umb-overlay ${mobileOpen ? "is-open" : ""} ${themeClass}`}
                aria-hidden={!mobileOpen}
                inert={!mobileOpen}
            >
                <p className="nav-umb-overlay-kicker">{T.menu} · {BRAND}</p>

                <ul className="nav-umb-overlay-links">
                    <li style={{ "--i": 0 } as CSSProperties}>
                        <NavLink to="/" end className="nav-umb-overlay-link" onClick={closeMobile}>
                            <span className="nav-umb-overlay-index">00</span>
                            <span className="nav-umb-overlay-label"><span>{T.home}</span></span>
                        </NavLink>
                    </li>
                    {PAGES.map((p, i) => (
                        <li key={p.to} style={{ "--i": i + 1 } as CSSProperties}>
                            <NavLink to={p.to} className={({ isActive }) => `nav-umb-overlay-link ${isActive ? "is-active" : ""}`} onClick={closeMobile}>
                                <span className="nav-umb-overlay-index">{pad(i + 1)}</span>
                                <span className="nav-umb-overlay-label"><span>{p.label}</span></span>
                            </NavLink>
                        </li>
                    ))}
                    {isAdmin && (
                        <li style={{ "--i": PAGES.length + 1 } as CSSProperties}>
                            <NavLink to="/admin" className="nav-umb-overlay-link" onClick={closeMobile}>
                                <span className="nav-umb-overlay-index">{pad(PAGES.length + 1)}</span>
                                <span className="nav-umb-overlay-label"><span>{T.admin}</span></span>
                            </NavLink>
                        </li>
                    )}
                </ul>

                <div className="nav-umb-overlay-foot">
                    <button type="button" className="nav-umb-overlay-action" onClick={toggleThemeWithAnimation}>
                        <ThemeIcon theme={theme} />
                        <span>{theme === "dark" ? T.themeLight : T.themeDark}</span>
                    </button>
                    {user ? (
                        <button
                            type="button"
                            className="nav-umb-overlay-action"
                            onClick={() => {
                                handleLogout();
                                closeMobile();
                            }}
                        >
                            {T.logout}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="nav-umb-overlay-action"
                            onClick={() => {
                                setLoginOpen(true);
                                closeMobile();
                            }}
                        >
                            {T.login} →
                        </button>
                    )}
                    <span className="nav-umb-overlay-region">{T.region}</span>
                </div>
            </div>

            {loginOpen && (
                <LoginCorporate
                    closeLogin={() => setLoginOpen(false)}
                    openRegister={() => {
                        setLoginOpen(false);
                        setRegisterOpen(true);
                    }}
                />
            )}

            {registerOpen && <RegisterMinimal closeRegister={() => setRegisterOpen(false)} openLogin={() => setLoginOpen(true)} />}
        </>
    );
};

export default NavBarCorporate;