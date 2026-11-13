// ─────────────────────────────────────────────────────────────────────
// Proceso — Umbral
// Idea central: los pasos se unen como las escenas de un tour. Una línea de
// recorrido se dibuja al bajar y cada paso se enciende cuando la línea llega.
// Suma la lista "antes de la visita" (se puede tildar) y preguntas frecuentes.
// ─────────────────────────────────────────────────────────────────────
import { useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { MotionConfig, motion, useScroll, useTransform } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./proceso.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const T = {
    kicker: "Proceso",
    title: ["De la primera charla", "al link publicado."],
    intro: "Seis pasos, siempre los mismos. Vos sabés en cada momento qué falta y qué tenés que preparar.",
    steps: [
        { name: "Coordinación", text: "Nos contás qué espacio es, cuántos ambientes tiene y para qué lo vas a usar. Armamos la propuesta y acordamos el día." },
        { name: "Preparación", text: "Te pasamos la lista de qué dejar listo antes de la visita. Un espacio ordenado y con luz cambia todo el resultado." },
        { name: "Captura", text: "Una toma 360 por ambiente, a la altura de los ojos. En los espacios grandes, una cada pocos metros para que el paso entre escenas sea natural." },
        { name: "Edición", text: "Unimos las dos mitades de cada foto, nivelamos el horizonte, corregimos la luz y difuminamos lo que no debe verse." },
        { name: "Mapeo", text: "Unimos los ambientes con pasos, ordenamos las plantas, sumamos puntos de información y elegimos qué se ve primero." },
        { name: "Publicación", text: "Te entregamos el link propio y el iframe para tu web. Cualquier ajuste posterior se hace sobre el mismo link." },
    ],
    prepKicker: "Antes de la visita",
    prepTitle: "Lo que conviene dejar listo",
    prepHint: "Tildá lo que ya tengas resuelto.",
    prep: [
        "Luces prendidas en todos los ambientes",
        "Persianas y cortinas abiertas",
        "Camas hechas y superficies despejadas",
        "Puertas interiores abiertas",
        "Fotos familiares y papeles guardados",
        "Mascotas y autos fuera de la toma",
    ],
    prepDone: "Todo listo para la visita.",
    faqKicker: "Preguntas",
    faqTitle: "Lo que más nos preguntan",
    faq: [
        { q: "¿Cuánto tarda la visita?", a: "Depende de la cantidad de ambientes y del tamaño del espacio. Al coordinar te damos una estimación para que reserves ese rato." },
        { q: "¿Necesito estar presente?", a: "Alguien tiene que abrirnos, pero durante cada toma no puede haber nadie en el ambiente: la cámara ve todo alrededor." },
        { q: "¿Se puede cambiar algo después de publicado?", a: "Sí. Nombres, puntos de información, el orden y la escena inicial se ajustan sobre el mismo link, sin que cambie la dirección." },
        { q: "¿Funciona en el celular?", a: "Sí, se abre en el navegador del celular, la tablet o la compu. No hay que descargar nada." },
        { q: "¿Qué pasa con las caras o las patentes?", a: "Las difuminamos antes de subir las fotos. La versión sin difuminar nunca se publica." },
    ],
    cta: "Coordinemos una visita",
};

const lineText = (label: string) => (
    <span className="pro-line__txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>
        ))}
    </span>
);

const Masked = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
    const words = text.split(" ");
    return (
        <motion.span className={`pro-mask ${className}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
            {words.map((w, i) => (
                <span key={i} className="pro-mask__clip">
                    <motion.span
                        className="pro-mask__word"
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

const Proceso = () => {
    const { theme } = UseTheme();
    const pathRef = useRef<HTMLOListElement>(null);
    const { scrollYProgress } = useScroll({ target: pathRef, offset: ["start 0.6", "end 0.6"] });
    const scaleY = useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, v)));
    const [done, setDone] = useState<boolean[]>(() => T.prep.map(() => false));
    const [open, setOpen] = useState<number | null>(0);
    const doneCount = done.filter(Boolean).length;

    return (
        <MotionConfig reducedMotion="user">
            <main className={`pro ${theme === "light" ? "theme-light" : "theme-dark"}`}>
                {/* ── Hero ── */}
                <section className="pro-hero" aria-labelledby="pro-title">
                    <p className="pro-label"><span>01</span><i>/</i>{T.kicker}</p>
                    <h1 id="pro-title" className="pro-hero__title">
                        <Masked text={T.title[0]} />
                        <Masked text={T.title[1]} className="pro-hero__accent" delay={0.12} />
                    </h1>
                    <motion.p
                        className="pro-hero__intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
                    >
                        {T.intro}
                    </motion.p>
                </section>

                {/* ── Recorrido de pasos ── */}
                <section className="pro-path-wrap" aria-label={T.kicker}>
                    {/* La línea va fuera de la lista: dentro de un <ol> solo pueden ir <li> */}
                    <span className="pro-path__rail" aria-hidden="true">
                        <motion.i style={{ scaleY }} />
                    </span>
                    <ol ref={pathRef} className="pro-path">
                        {T.steps.map((s, i) => (
                            <Step key={s.name} index={i} total={T.steps.length} name={s.name} text={s.text} />
                        ))}
                    </ol>
                </section>

                {/* ── Antes de la visita ── */}
                <section className="pro-prep" aria-labelledby="pro-prep-title">
                    <div className="pro-head">
                        <p className="pro-label"><span>02</span><i>/</i>{T.prepKicker}</p>
                        <h2 id="pro-prep-title" className="pro-h2"><Masked text={T.prepTitle} /></h2>
                        <p className="pro-prep__hint">
                            {T.prepHint}
                            <span className="pro-prep__count" aria-live="polite">
                                {doneCount === T.prep.length ? T.prepDone : `${doneCount} / ${T.prep.length}`}
                            </span>
                        </p>
                    </div>
                    <ul className="pro-prep__list">
                        {T.prep.map((item, i) => (
                            <li key={item}>
                                <label className={`pro-check ${done[i] ? "is-done" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={done[i]}
                                        onChange={() => setDone((d) => d.map((v, k) => (k === i ? !v : v)))}
                                    />
                                    <span className="pro-check__n">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="pro-check__text"><span>{item}</span></span>
                                    <span className="pro-check__mark" aria-hidden="true" />
                                </label>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* ── Preguntas ── */}
                <section className="pro-faq" aria-labelledby="pro-faq-title">
                    <div className="pro-head">
                        <p className="pro-label"><span>03</span><i>/</i>{T.faqKicker}</p>
                        <h2 id="pro-faq-title" className="pro-h2"><Masked text={T.faqTitle} /></h2>
                    </div>
                    <dl className="pro-faq__list">
                        {T.faq.map((f, i) => {
                            const isOpen = open === i;
                            return (
                                <div key={f.q} className={`pro-faq__item ${isOpen ? "is-open" : ""}`}>
                                    <dt>
                                        <button
                                            type="button"
                                            className="pro-faq__q"
                                            aria-expanded={isOpen}
                                            aria-controls={`pro-faq-${i}`}
                                            onClick={() => setOpen(isOpen ? null : i)}
                                        >
                                            <span className="pro-faq__n">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="pro-faq__text">{f.q}</span>
                                            <span className="pro-faq__sign" aria-hidden="true" />
                                        </button>
                                    </dt>
                                    <dd id={`pro-faq-${i}`} className="pro-faq__a" hidden={!isOpen}>
                                        <p>{f.a}</p>
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                </section>

                {/* ── Cierre ── */}
                <section className="pro-cta">
                    <Link to="/contact" className="pro-line pro-line--xl" aria-label={T.cta}>
                        {lineText(T.cta)}
                        <svg className="pro-line__arrow" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13h18M15 6l7 7-7 7" /></svg>
                    </Link>
                </section>
            </main>
        </MotionConfig>
    );
};

export default Proceso;

function Step({ index, total, name, text }: { index: number; total: number; name: string; text: string }) {
    return (
        <motion.li
            className="pro-step"
            initial="off"
            whileInView="on"
            viewport={{ once: false, margin: "0px 0px -40% 0px" }}
        >
            <motion.span
                className="pro-step__node"
                aria-hidden="true"
                variants={{ off: { scale: 0.55 }, on: { scale: 1 } }}
                transition={{ duration: 0.6, ease: EASE }}
            />
            <p className="pro-step__index">
                <span>{String(index + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
            </p>
            <h2 className="pro-step__name">
                <span className="pro-mask__clip">
                    <motion.span
                        className="pro-mask__word"
                        variants={{ off: { y: "110%" }, on: { y: "0%" } }}
                        transition={{ duration: 1, ease: EASE }}
                    >
                        {name}
                    </motion.span>
                </span>
            </h2>
            <motion.p
                className="pro-step__text"
                variants={{ off: { opacity: 0.2 }, on: { opacity: 1 } }}
                transition={{ duration: 0.8, ease: EASE }}
            >
                {text}
            </motion.p>
        </motion.li>
    );
}