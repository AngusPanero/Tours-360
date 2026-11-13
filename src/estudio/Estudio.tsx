// ─────────────────────────────────────────────────────────────────────
// Estudio — Umbral
// Idea central: los principios del estudio se recorren como un panorama.
// Al bajar, la franja gira (como mirar alrededor en un 360) y cada
// principio tiene su rumbo: 0°, 90°, 180°, 270°.
// ─────────────────────────────────────────────────────────────────────
import { useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { MotionConfig, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./estudio.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const T = {
    kicker: "Estudio",
    title: ["Mostramos espacios", "como se caminan."],
    intro: "Somos un estudio de tours virtuales 360. Visitamos cada lugar, lo capturamos ambiente por ambiente y lo publicamos como un recorrido que se abre desde cualquier pantalla.",
    panTitle: "Cuatro rumbos de trabajo",
    panHint: "Bajá para mirar alrededor",
    principles: [
        { deg: "000°", dir: "N", title: "A la altura de los ojos", text: "La cámara va donde iría una persona: a la altura de la mirada y en el centro del ambiente. Así el recorrido se siente como estar ahí, no como mirar una maqueta." },
        { deg: "090°", dir: "E", title: "Con la luz que hay", text: "Abrimos persianas y prendemos lo que se usa. Corregimos la exposición, pero no inventamos un espacio que no existe: lo que se ve es lo que se va a encontrar." },
        { deg: "180°", dir: "S", title: "Lo que no se ve", text: "Caras, patentes, fotos familiares y documentos se difuminan antes de publicar. El trípode queda tapado con tu logo en el piso." },
        { deg: "270°", dir: "O", title: "Un link, no una app", text: "Cada tour tiene su dirección y un iframe para tu web. Se abre en el navegador del celular o de la compu, sin descargar nada y sin cuentas." },
    ],
    gearKicker: "Equipo",
    gearTitle: "Lo que llevamos a cada visita",
    gear: [
        { name: "Cámara 360 de dos lentes", text: "Ve todo el ambiente en una sola toma: piso, techo y cada rincón." },
        { name: "Trípode fino y palo invisible", text: "Queda fuera de la imagen; lo que asoma abajo lo tapa el logo." },
        { name: "Disparo remoto", text: "Nadie del equipo aparece en la toma." },
        { name: "Panel propio de mapeo", text: "Unimos escenas, sumamos puntos de información y publicamos." },
    ],
    cta: "Hablemos de tu espacio",
};

const lineText = (label: string) => (
    <span className="est-line__txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>
        ))}
    </span>
);

const Masked = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
    const words = text.split(" ");
    return (
        <motion.span className={`est-mask ${className}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
            {words.map((w, i) => (
                <span key={i} className="est-mask__clip">
                    <motion.span
                        className="est-mask__word"
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

const Estudio = () => {
    const { theme } = UseTheme();
    const panRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const degRef = useRef<HTMLSpanElement>(null);
    const { scrollYProgress } = useScroll({ target: panRef, offset: ["start start", "end end"] });

    // La franja se corre de derecha a izquierda; el ancho real se mide en vivo
    const x = useTransform(scrollYProgress, (v) => {
        const track = trackRef.current;
        if (!track) return "0px";
        const max = Math.max(0, track.scrollWidth - track.clientWidth);
        return `${-v * max}px`;
    });
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        if (degRef.current) degRef.current.textContent = `${String(Math.round(v * 270)).padStart(3, "0")}°`;
    });

    return (
        <MotionConfig reducedMotion="user">
            <main className={`est ${theme === "light" ? "theme-light" : "theme-dark"}`}>
                {/* ── Hero ── */}
                <section className="est-hero" aria-labelledby="est-title">
                    <p className="est-label"><span>01</span><i>/</i>{T.kicker}</p>
                    <h1 id="est-title" className="est-hero__title">
                        <Masked text={T.title[0]} />
                        <Masked text={T.title[1]} className="est-hero__accent" delay={0.12} />
                    </h1>
                    <motion.p
                        className="est-hero__intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
                    >
                        {T.intro}
                    </motion.p>
                </section>

                {/* ── Panorama de principios ── */}
                <section ref={panRef} className="est-pan" aria-labelledby="est-pan-title">
                    <div className="est-pan__sticky">
                        <div className="est-pan__head">
                            <h2 id="est-pan-title" className="est-pan__title">{T.panTitle}</h2>
                            <p className="est-pan__heading" aria-hidden="true">
                                Rumbo <span ref={degRef}>000°</span>
                            </p>
                        </div>

                        <div ref={trackRef} className="est-pan__viewport">
                            <motion.ol className="est-pan__track" style={{ x }}>
                                {T.principles.map((p) => (
                                    <li key={p.deg} className="est-pan__item">
                                        <p className="est-pan__deg">
                                            <b>{p.dir}</b>
                                            <span>{p.deg}</span>
                                        </p>
                                        <h3 className="est-pan__name">{p.title}</h3>
                                        <p className="est-pan__text">{p.text}</p>
                                    </li>
                                ))}
                            </motion.ol>
                        </div>

                        <p className="est-pan__hint" aria-hidden="true">
                            <span className="est-pan__hint-line" />
                            {T.panHint}
                        </p>
                    </div>
                </section>

                {/* ── Equipo: una fila por cosa ── */}
                <section className="est-gear" aria-labelledby="est-gear-title">
                    <div className="est-head">
                        <p className="est-label"><span>02</span><i>/</i>{T.gearKicker}</p>
                        <h2 id="est-gear-title" className="est-h2"><Masked text={T.gearTitle} /></h2>
                    </div>
                    <ul className="est-gear__rows">
                        {T.gear.map((g, i) => (
                            <motion.li
                                key={g.name}
                                className="est-gear__row"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 }}
                            >
                                <span className="est-gear__n">{String(i + 1).padStart(2, "0")}</span>
                                <span className="est-gear__name">{g.name}</span>
                                <span className="est-gear__text">{g.text}</span>
                            </motion.li>
                        ))}
                    </ul>
                </section>

                {/* ── Cierre ── */}
                <section className="est-cta">
                    <Link to="/contact" className="est-line est-line--xl" aria-label={T.cta}>
                        {lineText(T.cta)}
                        <svg className="est-line__arrow" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13h18M15 6l7 7-7 7" /></svg>
                    </Link>
                </section>
            </main>
        </MotionConfig>
    );
};

export default Estudio;