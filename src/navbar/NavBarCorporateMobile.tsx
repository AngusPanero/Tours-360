import { forwardRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { NavLink } from "react-router-dom";
import { UseSession } from "../contexts/SessionContext";
import type { TextsConfig } from "../contexts/LanguageContext";
import "./navBarCorporate.css";

/**
 * NavBarCorporateMobile — Umbral
 * ---------------------------------------------------------
 * Panel de menú mobile para quien lo monte aparte del NavBarCorporate
 * (el NavBarCorporate ya trae su propio overlay).
 * Las props de idioma se mantienen por compatibilidad con la plantilla,
 * pero el sitio de Umbral está solo en castellano.
 */

interface NavBarMobileProps {
    closeMenu: () => void;
    texts: TextsConfig;
    language: string;
    theme: string;
    toggleThemeWithAnimation: (e: ReactMouseEvent<HTMLButtonElement>) => void;
    handleLanguage: (e: string) => void;
    openLogin: () => void;
}

// TODO (Angus): marca provisoria.
const BRAND = "Umbral";

const LINKS = [
    { label: "Inicio", to: "/" },
    { label: "Estudio", to: "/estudio" },
    { label: "Proceso", to: "/proceso" },
    { label: "Rubros", to: "/rubros" },
    { label: "Contacto", to: "/contact" },
];

const T = {
    menu: "Menú",
    close: "Cerrar",
    admin: "Tours",
    login: "Ingresar",
    logout: "Salir",
    themeLight: "Modo claro",
    themeDark: "Modo oscuro",
    region: "Tours virtuales 360 · Buenos Aires", // TODO (Angus): ciudad o región
};

const pad = (n: number) => String(n).padStart(2, "0");

const NavBarCorporateMobile = forwardRef<HTMLDivElement, NavBarMobileProps>(
    ({ closeMenu, theme, toggleThemeWithAnimation, openLogin }, ref) => {
        const { user, handleLogout } = UseSession();

        const items = [...LINKS, ...(user && user.admin === true ? [{ label: T.admin, to: "/admin" }] : [])];

        return (
            <div className={`nav-umb-panel ${theme === "dark" ? "theme-dark" : "theme-light"}`} ref={ref}>
                <div className="nav-umb-panel-head">
                    <span className="nav-umb-panel-title">{T.menu} · {BRAND}</span>
                    <button type="button" className="nav-umb-panel-close" onClick={closeMenu} aria-label={T.close}>
                        <span />
                        <span />
                    </button>
                </div>

                <nav className="nav-umb-panel-links" aria-label={T.menu}>
                    {items.map((link, i) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === "/"}
                            onClick={closeMenu}
                            className={({ isActive }) => `nav-umb-panel-link ${isActive ? "is-active" : ""}`}
                            style={{ "--i": i } as CSSProperties}
                        >
                            <span className="nav-umb-overlay-index">{pad(i)}</span>
                            <span className="nav-umb-overlay-label"><span>{link.label}</span></span>
                        </NavLink>
                    ))}
                </nav>

                <div className="nav-umb-overlay-foot">
                    <button type="button" className="nav-umb-overlay-action" onClick={toggleThemeWithAnimation}>
                        <svg viewBox="0 0 24 24" fill="none" className={`nav-umb-theme-icon ${theme === "dark" ? "is-dark" : "is-light"}`} aria-hidden="true">
                            <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5Z" fill="currentColor" />
                        </svg>
                        <span>{theme === "dark" ? T.themeLight : T.themeDark}</span>
                    </button>

                    {user ? (
                        <button
                            type="button"
                            className="nav-umb-overlay-action"
                            onClick={() => {
                                handleLogout();
                                closeMenu();
                            }}
                        >
                            {T.logout}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="nav-umb-overlay-action"
                            onClick={() => {
                                openLogin();
                                closeMenu();
                            }}
                        >
                            {T.login} →
                        </button>
                    )}

                    <span className="nav-umb-overlay-region">{T.region}</span>
                </div>
            </div>
        );
    }
);

NavBarCorporateMobile.displayName = "NavBarCorporateMobile";

export default NavBarCorporateMobile;