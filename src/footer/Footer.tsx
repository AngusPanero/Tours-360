import { useEffect, useRef, useState, type CSSProperties } from "react";
import { NavLink } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./footer.css";

/**
 * Footer — Umbral
 * ---------------------------------------------------------
 * Frase gigante + mail. En el medio, una regla de rumbo 360° (como la brújula
 * de un tour) que gira mientras se baja por la página: la página entera es una
 * vuelta completa. Abajo, navegación en tipografía grande y el cierre.
 */

// TODO (Angus): marca provisoria y datos reales de contacto.
const BRAND = "Umbral";
const CONTACT = {
    email: "hola@umbral.studio",
    whatsapp: "https://wa.me/5491171187463",
    phone: "+54 9 11 7118 7463",
    tel: "tel:+5491171187463",
};

// TODO (Angus): completá las redes; las que queden vacías no se muestran.
const SOCIALS = [
    { name: "Instagram", href: "" },
    { name: "LinkedIn", href: "" },
    { name: "WhatsApp", href: CONTACT.whatsapp },
].filter((s) => s.href);

// TODO (Angus): rutas reales de privacidad y términos.
const LEGAL = { privacy: "/policy-privacy", terms: "/policy-terms", cookies: "/policy-cookies" };

const PAGES = [
    { to: "/estudio", label: "Estudio" },
    { to: "/proceso", label: "Proceso" },
    { to: "/rubros", label: "Rubros" },
    { to: "/contact", label: "Contacto" },
];

const T = {
    statement: "Abrí la puerta antes del timbre.",
    tagline: "Tours virtuales 360",
    description: "Recorremos propiedades, hoteles, locales y salones para que quien los busca los camine antes de ir.",
    email: "Escribinos",
    copy: "Copiar",
    copied: "Copiado",
    heading: "Rumbo",
    headingHint: "La página entera es una vuelta",
    navigation: "Navegación",
    connect: "Contacto",
    access: "Acceso",
    rights: "Todos los derechos reservados",
    made: "Un estudio de DeepDev",            // TODO (Angus): confirmar crédito
    privacy: "Privacidad",
    terms: "Términos",
    cookies: "Cookies",
    backTop: "Volver arriba",
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const CARDINAL: Record<number, string> = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SO", 270: "O", 315: "NO" };
// Marcas de la regla, de -180° a 540°: siempre hay regla a los dos lados de la aguja
const MARKS = Array.from({ length: 17 }, (_, i) => -180 + i * 45);

const pad = (n: number) => String(n).padStart(2, "0");

const Footer = () => {
    const { theme } = UseTheme();
    const headingRef = useRef<HTMLDivElement>(null);
    const readoutRef = useRef<HTMLSpanElement>(null);
    const [copied, setCopied] = useState(false);

    /* rumbo: el avance del scroll se pasa a grados por variable CSS (sin re-render) */
    useEffect(() => {
        let raf = 0;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const deg = max > 0 ? (window.scrollY / max) * 360 : 0;
            headingRef.current?.style.setProperty("--h", deg.toFixed(2));
            if (readoutRef.current) readoutRef.current.textContent = `${String(Math.round(deg) % 360).padStart(3, "0")}°`;
        };
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(id);
    }, [copied]);

    const copyMail = async () => {
        try {
            await navigator.clipboard.writeText(CONTACT.email);
            setCopied(true);
        } catch {
            window.location.href = `mailto:${CONTACT.email}`;
        }
    };

    const scrollTop = () => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    };

    /* enlace tipo línea: las letras suben en ola y el subrayado se completa */
    const line = (label: string) => (
        <span className="footer-umb-line-txt" aria-hidden="true">
            {[...label].map((ch, i) => (
                <span key={i} style={{ "--i": i } as CSSProperties}>
                    {ch === " " ? " " : ch}
                </span>
            ))}
        </span>
    );

    const reveal = (delay = 0) => ({
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.9, ease: EASE, delay },
    });

    const words = T.statement.split(" ");

    return (
        <MotionConfig reducedMotion="user">
            <footer className={`footer-umb ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
                {/* ---------- frase + mail ---------- */}
                <div className="footer-umb-head">
                    <motion.p
                        className="footer-umb-statement"
                        aria-label={T.statement}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-40px" }}
                    >
                        {words.map((w, i) => (
                            <span className="footer-umb-word" key={i} aria-hidden="true">
                                <motion.span
                                    className={i === words.length - 1 ? "is-accent" : undefined}
                                    variants={{ hidden: { y: "112%" }, show: { y: "0%" } }}
                                    transition={{ duration: 1.1, ease: EASE, delay: i * 0.07 }}
                                >
                                    {w}
                                </motion.span>
                            </span>
                        ))}
                    </motion.p>

                    <div className="footer-umb-lead">
                        <motion.div {...reveal(0.1)}>
                            <p className="footer-umb-tagline">{T.tagline}</p>
                            <p className="footer-umb-description">{T.description}</p>
                        </motion.div>
                        <motion.div className="footer-umb-mail" {...reveal(0.18)}>
                            <span className="footer-umb-label">{T.email}</span>
                            <a className="footer-umb-line footer-umb-line--xl" href={`mailto:${CONTACT.email}`} aria-label={`${T.email}: ${CONTACT.email}`}>
                                {line(CONTACT.email)}
                            </a>
                            <button type="button" className={`footer-umb-copy-btn${copied ? " is-done" : ""}`} onClick={copyMail} aria-live="polite">
                                <svg viewBox="0 0 16 16" aria-hidden="true">
                                    <path className="footer-umb-copy-a" d="M5.5 5.5v-3h8v8h-3M2.5 5.5h8v8h-8z" />
                                    <path className="footer-umb-copy-b" d="M3 8.5l3.2 3.2L13 4.8" />
                                </svg>
                                {copied ? T.copied : T.copy}
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* ---------- regla de rumbo 360° ---------- */}
                <section className="footer-umb-heading" aria-label={T.heading} ref={headingRef}>
                    <div className="footer-umb-heading-head">
                        <span className="footer-umb-label">
                            <span className="footer-umb-label-n">{T.heading}</span>
                            <span className="footer-umb-readout" ref={readoutRef} aria-hidden="true">000°</span>
                        </span>
                        <span className="footer-umb-label">{T.headingHint}</span>
                    </div>
                    <div className="footer-umb-dial" aria-hidden="true">
                        <div className="footer-umb-ruler">
                            {MARKS.map((d) => {
                                const n = ((d % 360) + 360) % 360;
                                return (
                                    <span key={d} className={`footer-umb-mark${n % 90 === 0 ? " is-major" : ""}`} style={{ "--d": d } as CSSProperties}>
                                        <b>{CARDINAL[n]}</b>
                                        <i>{String(n).padStart(3, "0")}</i>
                                    </span>
                                );
                            })}
                        </div>
                        <span className="footer-umb-needle" />
                    </div>
                </section>

                {/* ---------- navegación ---------- */}
                <div className="footer-umb-base">
                    <motion.nav className="footer-umb-nav" aria-label={T.navigation} {...reveal()}>
                        <span className="footer-umb-label">{T.navigation}</span>
                        <ul>
                            <li>
                                <NavLink to="/" end className="footer-umb-line footer-umb-line--nav" aria-label="Inicio">
                                    <sup aria-hidden="true">00</sup>
                                    {line("Inicio")}
                                </NavLink>
                            </li>
                            {PAGES.map((p, i) => (
                                <li key={p.to}>
                                    <NavLink to={p.to} className="footer-umb-line footer-umb-line--nav" aria-label={p.label}>
                                        <sup aria-hidden="true">{pad(i + 1)}</sup>
                                        {line(p.label)}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </motion.nav>

                    <motion.div className="footer-umb-side" {...reveal(0.1)}>
                        <div>
                            <span className="footer-umb-label">{T.connect}</span>
                            <ul>
                                <li>
                                    <a className="footer-umb-line" href={CONTACT.tel} aria-label={`Llamar: ${CONTACT.phone}`}>
                                        {line(CONTACT.phone)}
                                    </a>
                                </li>
                                {SOCIALS.map((s) => (
                                    <li key={s.name}>
                                        <a className="footer-umb-line footer-umb-line--ext" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${BRAND} — ${s.name}`}>
                                            {line(s.name)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <NavLink to="/admin" className="footer-umb-line footer-umb-line--cta" aria-label={T.access}>
                            {line(T.access)}
                            <svg viewBox="0 0 26 26" aria-hidden="true">
                                <path d="M4 13h18M15 6l7 7-7 7" />
                            </svg>
                        </NavLink>
                    </motion.div>
                </div>

                {/* ---------- cierre ---------- */}
                <div className="footer-umb-bottom">
                    <NavLink to="/" className="footer-umb-logo" aria-label={`${BRAND} — Inicio`}>
                        <svg className="footer-umb-logo-mark" viewBox="0 0 32 32" aria-hidden="true">
                            <circle cx="16" cy="16" r="13.5" />
                            <path d="M12.5 29.5V13a3.5 3.5 0 0 1 7 0v16.5" />
                        </svg>
                        <span className="footer-umb-wordmark" aria-hidden="true">{BRAND}</span>
                    </NavLink>

                    <p className="footer-umb-copy">
                        <span>© {new Date().getFullYear()} {BRAND} · {T.rights}</span>
                        <span>{T.made}</span>
                    </p>

                    <nav className="footer-umb-legal" aria-label="Legales">
                        <NavLink to={LEGAL.privacy}>{T.privacy}</NavLink>
                        <NavLink to={LEGAL.terms}>{T.terms}</NavLink>
                        <NavLink to={LEGAL.cookies}>{T.cookies}</NavLink>
                    </nav>

                    <button type="button" className="footer-umb-top" onClick={scrollTop} aria-label={T.backTop}>
                        <span>{T.backTop}</span>
                        <svg viewBox="0 0 26 26" aria-hidden="true">
                            <path d="M13 22V4M6 11l7-7 7 7" />
                        </svg>
                    </button>
                </div>
            </footer>
        </MotionConfig>
    );
};

export default Footer;