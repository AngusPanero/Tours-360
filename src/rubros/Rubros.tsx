// ─────────────────────────────────────────────────────────────────────
// Rubros — Umbral
// Idea central: cada rubro tiene su recorrido típico. Al elegir uno en el
// índice tipográfico, se abre y muestra sus escenas unidas como en el mapa
// de un tour, más qué cambia para ese negocio y qué puntos de info sumamos.
// ─────────────────────────────────────────────────────────────────────
import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./rubros.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const T = {
    kicker: "Rubros",
    title: ["Para espacios que", "se eligen con los ojos."],
    intro: "Cada rubro se recorre distinto. Elegí el tuyo y mirá cómo armamos el recorrido.",
    route: "Recorrido típico",
    gain: "Qué cambia",
    points: "Puntos de información que sumamos",
    cta: "Contanos de tu espacio",
    sectors: [
        {
            name: "Inmobiliarias",
            gain: "El interesado llega a la visita habiendo recorrido la propiedad. Menos visitas en frío y consultas más concretas.",
            scenes: ["Fachada", "Living", "Cocina", "Dormitorios", "Baños", "Patio"],
            points: ["Metros cubiertos y totales", "Orientación y luz", "Terminaciones y materiales", "Expensas e impuestos"],
        },
        {
            name: "Hoteles y alojamientos",
            gain: "El huésped ve la habitación exacta que reserva, no la mejor foto del folleto. Menos sorpresas al llegar.",
            scenes: ["Entrada", "Recepción", "Habitación", "Baño", "Desayunador", "Pileta"],
            points: ["Tipo de cama y capacidad", "Vista desde la ventana", "Servicios incluidos", "Horarios de check-in"],
        },
        {
            name: "Gastronomía",
            gain: "Quien reserva elige su mesa con los ojos: salón, barra o terraza. Ideal para eventos y grupos.",
            scenes: ["Vereda", "Salón", "Barra", "Terraza", "Privado"],
            points: ["Capacidad por sector", "Menú y especialidades", "Accesibilidad", "Link de reserva"],
        },
        {
            name: "Locales y showrooms",
            gain: "Una vidriera abierta las 24 horas: el cliente recorre el local y llega sabiendo qué quiere ver.",
            scenes: ["Vidriera", "Salón de ventas", "Exhibición", "Probadores", "Caja"],
            points: ["Productos destacados", "Horarios", "Link a la tienda online", "Cómo llegar"],
        },
        {
            name: "Salones de eventos",
            gain: "Los organizadores recorren el espacio antes de firmar y comparten el link con quien decide.",
            scenes: ["Acceso", "Recepción", "Salón principal", "Pista", "Jardín", "Cocina"],
            points: ["Capacidad por formato", "Medidas del salón", "Equipamiento técnico", "Catering"],
        },
        {
            name: "Educación",
            gain: "Familias y estudiantes que todavía no pueden viajar conocen el campus, las aulas y los espacios comunes.",
            scenes: ["Ingreso", "Patio", "Aula", "Laboratorio", "Biblioteca", "Gimnasio"],
            points: ["Niveles y horarios", "Equipamiento", "Actividades", "Inscripciones"],
        },
    ],
};

const lineText = (label: string) => (
    <span className="rub-line__txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>
        ))}
    </span>
);

const Masked = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
    const words = text.split(" ");
    return (
        <motion.span className={`rub-mask ${className}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
            {words.map((w, i) => (
                <span key={i} className="rub-mask__clip">
                    <motion.span
                        className="rub-mask__word"
                        variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
                        transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.06 }}
                    >
                        {w}
                    </motion.span>
                    {i < words.length - 1 ? " " : ""}
                </span>
            ))}
        </motion.span>
    );
};

const Rubros = () => {
    const { theme } = UseTheme();
    const [active, setActive] = useState(0);

    return (
        <MotionConfig reducedMotion="user">
            <main className={`rub ${theme === "light" ? "theme-light" : "theme-dark"}`}>
                {/* ── Hero ── */}
                <section className="rub-hero" aria-labelledby="rub-title">
                    <p className="rub-label"><span>01</span><i>/</i>{T.kicker}</p>
                    <h1 id="rub-title" className="rub-hero__title">
                        <Masked text={T.title[0]} />
                        <Masked text={T.title[1]} className="rub-hero__accent" delay={0.12} />
                    </h1>
                    <motion.p
                        className="rub-hero__intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
                    >
                        {T.intro}
                    </motion.p>
                </section>

                {/* ── Índice de rubros ── */}
                <ul className="rub-index">
                    {T.sectors.map((s, i) => {
                        const isOpen = active === i;
                        return (
                            <li key={s.name} className={`rub-row ${isOpen ? "is-open" : ""}`}>
                                <button
                                    type="button"
                                    className="rub-row__head"
                                    aria-expanded={isOpen}
                                    aria-controls={`rub-panel-${i}`}
                                    onClick={() => setActive(isOpen ? -1 : i)}
                                >
                                    <span className="rub-row__n">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="rub-row__name">{s.name}</span>
                                    <span className="rub-row__count">{s.scenes.length} escenas</span>
                                    <span className="rub-row__sign" aria-hidden="true" />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={`rub-panel-${i}`}
                                            className="rub-panel"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.7, ease: EASE }}
                                        >
                                            <div className="rub-panel__inner">
                                                {/* Mapa de escenas */}
                                                <div className="rub-map">
                                                    <p className="rub-map__label">{T.route}</p>
                                                    <ol className="rub-map__scenes">
                                                        {s.scenes.map((scene, k) => (
                                                            <motion.li
                                                                key={scene}
                                                                initial={{ opacity: 0, y: 12 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.6, ease: EASE, delay: 0.15 + k * 0.08 }}
                                                            >
                                                                <motion.span
                                                                    className="rub-map__link"
                                                                    aria-hidden="true"
                                                                    initial={{ scaleX: 0 }}
                                                                    animate={{ scaleX: 1 }}
                                                                    transition={{ duration: 0.6, ease: EASE, delay: 0.2 + k * 0.08 }}
                                                                />
                                                                <span className="rub-map__node" aria-hidden="true" />
                                                                <span className="rub-map__n">{String(k + 1).padStart(2, "0")}</span>
                                                                <span className="rub-map__name">{scene}</span>
                                                            </motion.li>
                                                        ))}
                                                    </ol>
                                                </div>

                                                <div className="rub-panel__cols">
                                                    <div>
                                                        <p className="rub-panel__label">{T.gain}</p>
                                                        <p className="rub-panel__gain">{s.gain}</p>
                                                    </div>
                                                    <div>
                                                        <p className="rub-panel__label">{T.points}</p>
                                                        <ul className="rub-panel__points">
                                                            {s.points.map((p) => (
                                                                <li key={p}>{p}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </li>
                        );
                    })}
                </ul>

                {/* ── Cierre ── */}
                <section className="rub-cta">
                    <Link to="/contact" className="rub-line rub-line--xl" aria-label={T.cta}>
                        {lineText(T.cta)}
                        <svg className="rub-line__arrow" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13h18M15 6l7 7-7 7" /></svg>
                    </Link>
                </section>
            </main>
        </MotionConfig>
    );
};

export default Rubros;