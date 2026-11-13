// ─────────────────────────────────────────────────────────────────────
// Home — Umbral · estudio de tours virtuales 360
//
// Idea central: la cámara 360 ve con DOS lentes y el tour lo une todo en
// un solo espacio. El hero arranca con el video dentro de dos lentes
// redondos; al bajar se juntan en uno y se abren a pantalla completa.
//
// Solo el contenido del Home: la barra y el pie van en sus propios componentes.
// El tema sale de UseTheme() y se escopea a .umb (oscuro / claro), sin tocar :root.
// ─────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
    MotionConfig,
    motion,
    useMotionTemplate,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./home.css";

// ─── Datos de marca ──────────────────────────────────────────────────
// TODO (Angus): marca provisoria "Umbral". Contacto y video del hero, abajo.
const HERO_VIDEO = "https://res.cloudinary.com/dhqzn8gwi/video/upload/v1794603143/s2vaovokylgqqtbzvt5o.mp4";        // TODO (Angus): video del hero (mp4 H.264, 1920×1080, sin audio, 10–20 s en loop)
const HERO_POSTER = "https://res.cloudinary.com/dhqzn8gwi/image/upload/v1794603140/rwx1caarfoktjq0islqv.jpg";       // TODO (Angus): primer fotograma del video
const CONTACT_MAIL = "hola@umbral.studio";          // TODO (Angus): mail real
const WHATSAPP = "https://wa.me/5491171187463";     // TODO (Angus): número del estudio
const DEMO_TOUR = "/tour/alsina-419-ramos-mejia-8a9961"; // TODO (Angus): tour de muestra publicado

const T = {
    hero: {
        kicker: "Tours virtuales 360 · Buenos Aires",        // TODO (Angus): ciudad o región
        title: ["Entrá antes", "de llegar."],
        body: "Recorridos 360 de propiedades, hoteles y locales que se caminan desde el celular. Un link y el espacio entero.",
        primary: "Ver un recorrido",
        secondary: "Pedir propuesta",
        scroll: "Bajá para entrar",
        lensA: "Lente frontal",
        lensB: "Lente trasero",
        merged: "Un solo espacio",
    },
    manifesto: {
        kicker: "Estudio",
        text: "Una foto muestra un ambiente. Un recorrido deja caminarlo. Quien entra a tu espacio desde el sillón llega a la visita sabiendo qué busca y con ganas de verlo en persona. Eso es lo que hacemos: abrir la puerta antes de que alguien toque el timbre.",
    },
    process: {
        kicker: "Proceso",
        title: "Del lente al link",
        steps: [
            { word: "Captura", text: "Una cámara 360 en cada ambiente, a la altura de los ojos. Dos lentes que ven todo a la vez: piso, techo y cada rincón." },
            { word: "Unión", text: "Las dos mitades se cosen en una sola imagen esférica, nivelada, con la luz corregida y el trípode tapado." },
            { word: "Mapeo", text: "Unimos los ambientes con pasos, sumamos puntos de información y elegimos qué se ve primero en cada escena." },
            { word: "Link", text: "Una dirección propia y un iframe para tu web. Se abre en cualquier navegador, sin descargar nada." },
        ],
    },
    sectors: {
        kicker: "Rubros",
        title: "Para espacios que se eligen con los ojos",
        rows: [
            { name: "Inmobiliarias", text: "Menos visitas en frío: el comprador llega habiendo recorrido." },
            { name: "Hoteles", text: "La habitación exacta, no la mejor foto del folleto." },
            { name: "Gastronomía", text: "El salón, la barra y la terraza antes de reservar." },
            { name: "Locales y showrooms", text: "Una vidriera abierta las 24 horas." },
            { name: "Salones de eventos", text: "Espacios que se recorren antes de firmar." },
            { name: "Educación", text: "Campus y aulas para quien todavía no puede viajar." },
        ],
    },
    facts: {
        kicker: "En un link",
        title: "Todo lo que entra en una dirección",
        rows: [
            { value: "360°", label: "Sin puntos ciegos", text: "Piso, techo y cada rincón del ambiente." },
            { value: "72", unit: "MP", label: "Por escena", text: "Detalle suficiente para acercarse a una terminación." },
            { value: "1", unit: "link", label: "Para todo", text: "Tu web, un portal, una historia o un WhatsApp." },
            { value: "0", unit: "apps", label: "Para verlo", text: "Abre en el navegador, del celular o de la compu." },
        ],
    },
    cta: {
        kicker: "Contacto",
        title: ["¿Tu espacio merece", "ser recorrido?"],
        body: "Contanos qué querés mostrar y te armamos una propuesta con fechas y alcance.",
        mail: "Escribinos",
        whatsapp: "WhatsApp",
    },
    aria: {
        heroVideo: "Video de un recorrido 360 por una propiedad",
        steps: "Pasos del proceso",
    },
};

// ─── Helpers ─────────────────────────────────────────────────────────
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Mapeo lineal con tope. Se usa en lugar de useTransform(p, [a, b], [x, y]) para
// la opacidad ligada al scroll: framer-motion intenta acelerarla con la animación
// nativa del navegador y, con un objetivo (target), calcula mal el rango.
const lerp = (v: number, a: number, b: number, from: number, to: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return from + (to - from) * t;
};

// Botón / enlace tipo línea: las letras suben en ola dejando ver una copia en acento
const lineText = (label: string) => (
    <span className="umb-line__txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>
        ))}
    </span>
);

const Arrow = ({ external = false }: { external?: boolean }) =>
    external ? (
        <span className="umb-line__ext" aria-hidden="true">↗</span>
    ) : (
        <svg className="umb-line__arrow" viewBox="0 0 26 26" aria-hidden="true">
            <path d="M4 13h18M15 6l7 7-7 7" />
        </svg>
    );

// Palabras que suben desde atrás de una línea.
// El disparo lo hace el contenedor: la palabra empieza recortada por su máscara
// y el navegador nunca la vería "en pantalla".
const Masked = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
    const words = text.split(" ");
    return (
        <motion.span
            className={`umb-mask ${className || ""}`}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
        >
            {words.map((w, i) => (
                <span key={i} className="umb-mask__clip">
                    <motion.span
                        className="umb-mask__word"
                        variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
                        transition={{ duration: 1.1, ease: EASE_OUT, delay: delay + i * 0.06 }}
                    >
                        {w}
                    </motion.span>
                    {i < words.length - 1 ? "\u00A0" : ""}
                </span>
            ))}
        </motion.span>
    );
};

const Label = ({ n, text }: { n: string; text: string }) => (
    <p className="umb-label">
        <span className="umb-label__n">{n}</span>
        <span className="umb-label__sep">/</span>
        <span>{text}</span>
    </p>
);

// ═════════════════════════════════════════════════════════════════════
const Home = () => {
    const { theme } = UseTheme();
    const tone = theme === "light" ? "light" : "dark";

    return (
        <MotionConfig reducedMotion="user">
            <div className={`umb umb--${tone}`}>
                <Hero />
                <Manifesto />
                <Process />
                <Sectors />
                <Facts />
                <Closing />
            </div>
        </MotionConfig>
    );
};

export default Home;

// ═════════════════════════════════════════════════════════════════════
//  HERO — dos lentes que se vuelven un espacio
// ═════════════════════════════════════════════════════════════════════
function Hero() {
    const ref = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoOk, setVideoOk] = useState(true);
    const reduced = useReducedMotion();
    const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

    // Lentes: se acercan, se funden y el círculo crece hasta cubrir todo
    const sep = useTransform(p, [0, 0.32], [15.5, 0]);          // vmin desde el centro
    const base = useTransform(p, [0, 0.32], [14, 17]);           // radio en vmin
    const grow = useTransform(p, [0.3, 0.82], [0, 95]);          // vmax extra
    const mask = useMotionTemplate`radial-gradient(circle calc(${base}vmin + ${grow}vmax) at calc(50% - ${sep}vmin) 50%, #000 99.4%, transparent 100%), radial-gradient(circle calc(${base}vmin + ${grow}vmax) at calc(50% + ${sep}vmin) 50%, #000 99.4%, transparent 100%)`;
    const ringA = useMotionTemplate`calc(50% - ${sep}vmin)`;
    const ringB = useMotionTemplate`calc(50% + ${sep}vmin)`;
    const ringSize = useMotionTemplate`calc((${base}vmin + ${grow}vmax) * 2)`;
    const ringOpacity = useTransform(p, (v) => lerp(v, 0.25, 0.4, 1, 0));
    const lensLabels = useTransform(p, (v) => lerp(v, 0, 0.18, 1, 0));
    const merged = useTransform(p, (v) => (v < 0.5 ? lerp(v, 0.3, 0.42, 0, 1) : lerp(v, 0.62, 0.72, 1, 0)));
    const titleY = useTransform(p, [0, 0.6], ["0%", "-18%"]);
    const shade = useTransform(p, (v) => lerp(v, 0.55, 0.95, 0, 0.55));
    // La interfaz se va antes de que el video tape todo (en modo claro el texto quedaría oscuro sobre el video)
    const uiFade = useTransform(p, (v) => lerp(v, 0.2, 0.34, 1, 0));

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        if (reduced) v.pause();
        else v.play().catch(() => {});
    }, [reduced]);

    return (
        <section ref={ref} className="umb-hero" id="top" aria-labelledby="umb-hero-title">
            <div className="umb-hero__sticky">
                {/* Título DETRÁS de los lentes */}
                <motion.h1 id="umb-hero-title" className="umb-hero__title" style={{ y: titleY }}>
                    <span className="umb-hero__l1">
                        {T.hero.title[0].split(" ").map((w, i) => (
                            <span key={i} className="umb-mask__clip">
                                <motion.span
                                    className="umb-mask__word"
                                    initial={{ y: "110%" }}
                                    animate={{ y: "0%" }}
                                    transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.15 + i * 0.07 }}
                                >
                                    {w}
                                </motion.span>
                                {" "}
                            </span>
                        ))}
                    </span>
                    <span className="umb-hero__l2">
                        {T.hero.title[1].split(" ").map((w, i) => (
                            <span key={i} className="umb-mask__clip">
                                <motion.span
                                    className="umb-mask__word"
                                    initial={{ y: "110%" }}
                                    animate={{ y: "0%" }}
                                    transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.32 + i * 0.07 }}
                                >
                                    {w}
                                </motion.span>
                                {i < T.hero.title[1].split(" ").length - 1 ? " " : ""}
                            </span>
                        ))}
                    </span>
                </motion.h1>

                {/* Video recortado por los lentes */}
                <motion.div className="umb-hero__lens" style={{ maskImage: mask, WebkitMaskImage: mask }}>
                    {videoOk ? (
                        <video
                            ref={videoRef}
                            className="umb-hero__video"
                            src={HERO_VIDEO}
                            poster={HERO_POSTER}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-label={T.aria.heroVideo}
                            onError={() => setVideoOk(false)}
                        />
                    ) : (
                        <div className="umb-hero__fallback" aria-hidden="true" />
                    )}
                    <motion.div className="umb-hero__shade" style={{ opacity: shade }} />
                </motion.div>

                {/* Aros finos sobre cada lente (desaparecen al fundirse) */}
                <motion.span className="umb-hero__ring" style={{ left: ringA, width: ringSize, height: ringSize, opacity: ringOpacity }} aria-hidden="true" />
                <motion.span className="umb-hero__ring" style={{ left: ringB, width: ringSize, height: ringSize, opacity: ringOpacity }} aria-hidden="true" />

                <motion.p className="umb-hero__lens-label is-a" style={{ opacity: lensLabels, left: ringA }} aria-hidden="true">
                    {T.hero.lensA}
                </motion.p>
                <motion.p className="umb-hero__lens-label is-b" style={{ opacity: lensLabels, left: ringB }} aria-hidden="true">
                    {T.hero.lensB}
                </motion.p>
                <motion.p className="umb-hero__merged" style={{ opacity: merged }} aria-hidden="true">
                    <span>360°</span> {T.hero.merged}
                </motion.p>

                {/* Interfaz DELANTE */}
                <motion.div style={{ opacity: uiFade }}>
                    <motion.p
                        className="umb-hero__kicker"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        {T.hero.kicker}
                    </motion.p>
                </motion.div>

                <motion.div className="umb-hero__foot-wrap" style={{ opacity: uiFade }}>
                <motion.div
                    className="umb-hero__foot"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: EASE_OUT, delay: 0.75 }}
                >
                    <p className="umb-hero__body">{T.hero.body}</p>
                    <div className="umb-hero__ctas">
                        <a className="umb-line umb-line--main" href={DEMO_TOUR} aria-label={T.hero.primary}>
                            {lineText(T.hero.primary)}
                            <Arrow />
                        </a>
                        <a className="umb-line" href="#contacto" aria-label={T.hero.secondary}>
                            {lineText(T.hero.secondary)}
                        </a>
                    </div>
                    <p className="umb-hero__scroll" aria-hidden="true">
                        <span className="umb-hero__scroll-line" />
                        {T.hero.scroll}
                    </p>
                </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

// ═════════════════════════════════════════════════════════════════════
//  MANIFIESTO — el texto se enciende palabra por palabra
// ═════════════════════════════════════════════════════════════════════
function Manifesto() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.82", "end 0.45"] });
    const words = useMemo(() => T.manifesto.text.split(" "), []);
    return (
        <section className="umb-manifesto" id="estudio" aria-label={T.manifesto.kicker}>
            <Label n="01" text={T.manifesto.kicker} />
            <div ref={ref} className="umb-manifesto__text">
                <p className="umb-sr">{T.manifesto.text}</p>
                <p aria-hidden="true">
                    {words.map((w, i) => (
                        <LitWord key={i} word={w} progress={scrollYProgress} from={i / words.length} to={(i + 1) / words.length} />
                    ))}
                </p>
            </div>
        </section>
    );
}

function LitWord({ word, progress, from, to }: { word: string; progress: MotionValue<number>; from: number; to: number }) {
    const opacity = useTransform(progress, (v) => lerp(v, from, to, 0.14, 1));
    return (
        <>
            <motion.span style={{ opacity }}>{word}</motion.span>{" "}
        </>
    );
}

// ═════════════════════════════════════════════════════════════════════
//  PROCESO — pin con 4 pasos: palabra gigante detrás, dibujo, HUD
// ═════════════════════════════════════════════════════════════════════
const STEP_DRAWINGS: string[][] = [
    // 01 Captura: dos lentes, trípode y el punto del nadir
    ["M140 104a46 46 0 1 1-0.1 0", "M260 104a46 46 0 1 1-0.1 0", "M200 150v70", "M200 220l-34 18M200 220l34 18", "M186 104h28"],
    // 02 Unión: imagen 2:1 con meridianos y paralelos
    ["M60 50h280v140H60z", "M60 120h280", "M60 85c90 18 190 18 280 0", "M60 155c90-18 190-18 280 0", "M130 50c-22 46-22 94 0 140", "M200 50v140", "M270 50c22 46 22 94 0 140"],
    // 03 Mapeo: escenas unidas por pasos
    ["M96 160a24 24 0 1 1-0.1 0", "M210 70a24 24 0 1 1-0.1 0", "M320 150a24 24 0 1 1-0.1 0", "M112 141l60-48", "M233 82l66 50", "M118 160h178"],
    // 04 Link: ventana del navegador y el iframe
    ["M70 52h260v136H70z", "M70 78h260", "M86 65h8M102 65h8M118 65h8", "M150 112l-24 21 24 21", "M250 112l24 21-24 21", "M212 104l-24 58"],
];

function Process() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const [active, setActive] = useState(0);
    const steps = T.process.steps;
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length))));
    });

    return (
        <section ref={ref} className="umb-process" id="proceso" aria-labelledby="umb-process-title">
            <div className="umb-process__sticky">
                <div className="umb-process__head">
                    <Label n="02" text={T.process.kicker} />
                    <h2 id="umb-process-title" className="umb-process__title">{T.process.title}</h2>
                </div>

                {/* Palabra gigante DETRÁS */}
                <div className="umb-process__giant" aria-hidden="true">
                    {steps.map((s, i) => (
                        <span key={s.word} className={i === active ? "is-active" : ""}>{s.word}</span>
                    ))}
                </div>

                {/* Dibujo del paso */}
                <svg className="umb-process__draw" viewBox="0 0 400 260" aria-hidden="true">
                    {STEP_DRAWINGS.map((paths, si) => (
                        <g key={si} className={si === active ? "is-active" : ""}>
                            {paths.map((d, pi) => (
                                <motion.path
                                    key={pi}
                                    d={d}
                                    initial={false}
                                    animate={{ pathLength: si === active ? 1 : 0, opacity: si === active ? 1 : 0 }}
                                    transition={{ duration: 1.1, ease: EASE_OUT, delay: si === active ? 0.08 * pi : 0 }}
                                />
                            ))}
                        </g>
                    ))}
                    {/* Nadir del paso 1, en acento */}
                    <motion.circle
                        cx="200" cy="232" r="5"
                        className="umb-process__dot"
                        initial={false}
                        animate={{ scale: active === 0 ? 1 : 0 }}
                        transition={{ duration: 0.6, ease: EASE_OUT, delay: active === 0 ? 0.5 : 0 }}
                    />
                </svg>

                {/* HUD delante */}
                <div className="umb-process__hud">
                    <p className="umb-process__index" aria-hidden="true">
                        <span>{String(active + 1).padStart(2, "0")}</span> / {String(steps.length).padStart(2, "0")}
                    </p>
                    <div className="umb-process__copy" aria-live="polite">
                        <h3 key={steps[active].word} className="umb-process__step">
                            <span className="umb-mask__clip">
                                <motion.span
                                    className="umb-mask__word"
                                    initial={{ y: "110%" }}
                                    animate={{ y: "0%" }}
                                    transition={{ duration: 0.9, ease: EASE_OUT }}
                                >
                                    {steps[active].word}
                                </motion.span>
                            </span>
                        </h3>
                        <motion.p
                            key={`t-${active}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
                        >
                            {steps[active].text}
                        </motion.p>
                    </div>
                    <ol className="umb-process__timeline" aria-label={T.aria.steps}>
                        {steps.map((s, i) => (
                            <li key={s.word} className={i < active ? "is-done" : i === active ? "is-active" : ""}>
                                <StepBar progress={scrollYProgress} index={i} total={steps.length} />
                                <span>{s.word}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

function StepBar({ progress, index, total }: { progress: MotionValue<number>; index: number; total: number }) {
    const scaleX = useTransform(progress, [index / total, (index + 1) / total], [0, 1]);
    return (
        <span className="umb-process__bar" aria-hidden="true">
            <motion.i style={{ scaleX }} />
        </span>
    );
}

// ═════════════════════════════════════════════════════════════════════
//  RUBROS — índice tipográfico, una fila por rubro
// ═════════════════════════════════════════════════════════════════════
function Sectors() {
    return (
        <section className="umb-sectors" id="rubros" aria-labelledby="umb-sectors-title">
            <div className="umb-section-head">
                <Label n="03" text={T.sectors.kicker} />
                <h2 id="umb-sectors-title" className="umb-h2">
                    <Masked text={T.sectors.title} />
                </h2>
            </div>
            <ul className="umb-sectors__rows">
                {T.sectors.rows.map((r, i) => (
                    <motion.li
                        key={r.name}
                        className="umb-sector"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: i * 0.04 }}
                    >
                        <span className="umb-sector__n">{String(i + 1).padStart(2, "0")}</span>
                        <span className="umb-sector__name">{r.name}</span>
                        <span className="umb-sector__text">{r.text}</span>
                        <span className="umb-sector__line" aria-hidden="true" />
                    </motion.li>
                ))}
            </ul>
        </section>
    );
}

// ═════════════════════════════════════════════════════════════════════
//  DATOS — una fila por dato: número enorme, barra, etiqueta
// ═════════════════════════════════════════════════════════════════════
function Facts() {
    return (
        <section className="umb-facts" aria-labelledby="umb-facts-title">
            <div className="umb-section-head">
                <Label n="04" text={T.facts.kicker} />
                <h2 id="umb-facts-title" className="umb-h2">
                    <Masked text={T.facts.title} />
                </h2>
            </div>
            <div className="umb-facts__rows">
                {T.facts.rows.map((f, i) => (
                    <div key={f.label} className="umb-fact">
                        <span className="umb-fact__n">{String(i + 1).padStart(2, "0")}</span>
                        <p className="umb-fact__value">
                            <Masked text={f.value} />
                            {f.unit && <span className="umb-fact__unit">{f.unit}</span>}
                        </p>
                        <motion.span
                            className="umb-fact__bar"
                            aria-hidden="true"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.15 }}
                        />
                        <p className="umb-fact__label">
                            <strong>{f.label}</strong>
                            <span>{f.text}</span>
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ═════════════════════════════════════════════════════════════════════
//  CIERRE
// ═════════════════════════════════════════════════════════════════════
function Closing() {
    return (
        <section className="umb-closing" id="contacto" aria-labelledby="umb-closing-title">
            <Label n="05" text={T.cta.kicker} />
            <h2 id="umb-closing-title" className="umb-closing__title">
                <Masked text={T.cta.title[0]} />
                <Masked text={T.cta.title[1]} className="umb-closing__accent" delay={0.15} />
            </h2>
            <p className="umb-closing__body">{T.cta.body}</p>
            <div className="umb-closing__ctas">
                <a className="umb-line umb-line--xl" href={`mailto:${CONTACT_MAIL}`} aria-label={`${T.cta.mail}: ${CONTACT_MAIL}`}>
                    {lineText(CONTACT_MAIL)}
                    <Arrow />
                </a>
                <a className="umb-line" href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label={T.cta.whatsapp}>
                    {lineText(T.cta.whatsapp)}
                    <Arrow external />
                </a>
            </div>
        </section>
    );
}