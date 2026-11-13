// ─────────────────────────────────────────────────────────────────────
// Contact — Umbral
// Idea central: el formulario es una frase que se completa
// ("Hola, soy ___ y tengo ___ en ___…"). Se lee como un mensaje,
// no como una planilla, y pide solo lo necesario para cotizar un tour.
// ─────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import axios from "axios";
import { MotionConfig, motion } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import "./contact.css";

const EASE = [0.16, 1, 0.3, 1] as const;

// TODO (Angus): datos reales de contacto.
const CONTACT = {
    email: "hola@umbral.studio",
    whatsapp: "https://wa.me/5491171187463",
    phone: "+54 9 11 7118 7463",
};
const LEGAL = { privacy: "/policy-privacy", terms: "/policy-terms" };

const SPACES = ["un departamento", "una casa", "un hotel", "un restaurante", "un local", "un salón de eventos", "otro espacio"];
const ROOMS = ["1 a 3", "4 a 6", "7 a 10", "más de 10"];

const T = {
    kicker: "Contacto",
    title: ["Contanos qué espacio", "querés mostrar."],
    intro: "Completá la frase y te respondemos con una propuesta: fecha, alcance y precio. Si preferís, escribinos directo.",
    s1: "Hola, soy",
    s2: "y tengo",
    s3: "en",
    s4: ", con",
    s5: "ambientes. Escribime a",
    s6: "o llamame al",
    s7: ".",
    ph: { name: "tu nombre", zone: "barrio o ciudad", email: "tu email", phone: "tu teléfono (opcional)" },
    more: "¿Algo más que debamos saber?",
    morePh: "Plantas, fecha ideal, para qué lo vas a usar…",
    legal: ["Acepto la ", "Política de Privacidad", " y los ", "Términos y Condiciones", "."],
    send: "Enviar consulta",
    sending: "Enviando…",
    ok: "Recibimos tu consulta. Te respondemos a la brevedad.",
    again: "Enviar otra",
    direct: "Directo",
    errors: {
        name: "Escribí tu nombre (2 a 60 letras).",
        zone: "Contanos el barrio o la ciudad.",
        email: "Revisá el email.",
        phone: "Revisá el teléfono.",
        legal: "Tenés que aceptar la política de privacidad.",
        rate: "Mandaste varias consultas seguidas. Probá en unos minutos o escribinos por WhatsApp.",
        server: "No pudimos enviar la consulta. Probá de nuevo o escribinos por WhatsApp.",
    },
};

const NAME_RE = /^[\p{L}][\p{L}' .-]{1,59}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{5,19}$/;

interface FormState {
    name: string;
    space: string;
    zone: string;
    rooms: string;
    email: string;
    phone: string;
    message: string;
    accepted: boolean;
    website: string; // trampa para bots: una persona nunca lo ve
}

const EMPTY: FormState = { name: "", space: SPACES[0], zone: "", rooms: ROOMS[1], email: "", phone: "", message: "", accepted: false, website: "" };

// TODO (Angus): si tu POST /contact espera otros nombres de campos, ajustalos solo acá.
const toPayload = (f: FormState, elapsed: number) => ({
    name: f.name.trim(),
    email: f.email.trim().toLowerCase(),
    phone: f.phone.trim(),
    message: [
        `Tour 360 · ${f.space} en ${f.zone.trim()} · ${f.rooms} ambientes`,
        f.message.trim(),
    ].filter(Boolean).join("\n\n"),
    acceptedLegal: f.accepted,
    website: f.website,
    elapsed,
});

const lineText = (label: string) => (
    <span className="con-line__txt" aria-hidden="true">
        {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>{ch === " " ? " " : ch}</span>
        ))}
    </span>
);

const Masked = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
    const words = text.split(" ");
    return (
        <motion.span className={`con-mask ${className}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
            {words.map((w, i) => (
                <span key={i} className="con-mask__clip">
                    <motion.span
                        className="con-mask__word"
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

// El ancho del campo sigue a lo que se escribe, como una palabra más de la frase.
// "ch" mide el ancho del 0, más ancho que una letra promedio: por eso el 0.86.
const fit = (value: string, placeholder: string) => {
    const n = Math.max(3, (value || placeholder).length);
    return { width: `calc(${n}ch * 0.86 + 0.6ch)` };
};

type Errors = Partial<Record<"name" | "zone" | "email" | "phone" | "legal", string>>;

const Contact = () => {
    const { theme } = UseTheme();
    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
    const [serverError, setServerError] = useState("");
    const startedAt = useRef(Date.now());

    useEffect(() => {
        startedAt.current = Date.now();
    }, []);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        // La casilla legal se valida con la clave "legal"
        const errKey = key === "accepted" ? "legal" : key;
        if (errKey in errors) setErrors((e) => ({ ...e, [errKey]: undefined }));
    };

    const validate = (f: FormState): Errors => {
        const e: Errors = {};
        if (!NAME_RE.test(f.name.trim())) e.name = T.errors.name;
        if (f.zone.trim().length < 2 || f.zone.trim().length > 80) e.zone = T.errors.zone;
        if (f.email.trim().length > 254 || !EMAIL_RE.test(f.email.trim())) e.email = T.errors.email;
        if (f.phone.trim() && !PHONE_RE.test(f.phone.trim())) e.phone = T.errors.phone;
        if (!f.accepted) e.legal = T.errors.legal;
        return e;
    };

    const onSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        if (status === "sending") return;
        const e = validate(form);
        setErrors(e);
        if (Object.keys(e).length) {
            const first = document.querySelector<HTMLElement>(`[data-field="${Object.keys(e)[0]}"]`);
            first?.focus();
            return;
        }
        setStatus("sending");
        setServerError("");
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/contact`, toPayload(form, Date.now() - startedAt.current), { timeout: 15000 });
            setStatus("ok");
            setForm(EMPTY);
        } catch (err) {
            setStatus("error");
            setServerError(axios.isAxiosError(err) && err.response?.status === 429 ? T.errors.rate : T.errors.server);
        }
    };

    const errorList = Object.values(errors).filter(Boolean) as string[];

    return (
        <MotionConfig reducedMotion="user">
            <main className={`con ${theme === "light" ? "theme-light" : "theme-dark"}`}>
                {/* ── Hero ── */}
                <section className="con-hero" aria-labelledby="con-title">
                    <p className="con-label"><span>01</span><i>/</i>{T.kicker}</p>
                    <h1 id="con-title" className="con-hero__title">
                        <Masked text={T.title[0]} />
                        <Masked text={T.title[1]} className="con-hero__accent" delay={0.12} />
                    </h1>
                    <motion.p
                        className="con-hero__intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
                    >
                        {T.intro}
                    </motion.p>
                </section>

                <section className="con-body">
                    {status === "ok" ? (
                        <motion.div
                            className="con-done"
                            role="status"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: EASE }}
                        >
                            <p className="con-done__text">{T.ok}</p>
                            <button type="button" className="con-line" onClick={() => setStatus("idle")} aria-label={T.again}>
                                {lineText(T.again)}
                            </button>
                        </motion.div>
                    ) : (
                        <form className="con-form" onSubmit={onSubmit} noValidate>
                            {/* La frase */}
                            <p className="con-sentence">
                                {T.s1}{" "}
                                <label className={`con-slot ${errors.name ? "is-wrong" : ""}`}>
                                    <span className="con-sr">Nombre</span>
                                    <input
                                        data-field="name"
                                        value={form.name}
                                        onChange={(e) => set("name", e.target.value)}
                                        placeholder={T.ph.name}
                                        maxLength={60}
                                        autoComplete="name"
                                        style={fit(form.name, T.ph.name)}
                                        aria-invalid={!!errors.name || undefined}
                                    />
                                </label>{" "}
                                {T.s2}{" "}
                                <label className="con-slot con-slot--select">
                                    <span className="con-sr">Tipo de espacio</span>
                                    <select value={form.space} onChange={(e) => set("space", e.target.value)} style={fit(form.space, "")} data-select="">
                                        {SPACES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </label>{" "}
                                {T.s3}{" "}
                                <label className={`con-slot ${errors.zone ? "is-wrong" : ""}`}>
                                    <span className="con-sr">Barrio o ciudad</span>
                                    <input
                                        data-field="zone"
                                        value={form.zone}
                                        onChange={(e) => set("zone", e.target.value)}
                                        placeholder={T.ph.zone}
                                        maxLength={80}
                                        autoComplete="address-level2"
                                        style={fit(form.zone, T.ph.zone)}
                                        aria-invalid={!!errors.zone || undefined}
                                    />
                                </label>
                                {T.s4}{" "}
                                <label className="con-slot con-slot--select">
                                    <span className="con-sr">Cantidad de ambientes</span>
                                    <select value={form.rooms} onChange={(e) => set("rooms", e.target.value)} style={fit(form.rooms, "")} data-select="">
                                        {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </label>{" "}
                                {T.s5}{" "}
                                <label className={`con-slot ${errors.email ? "is-wrong" : ""}`}>
                                    <span className="con-sr">Email</span>
                                    <input
                                        data-field="email"
                                        type="email"
                                        inputMode="email"
                                        value={form.email}
                                        onChange={(e) => set("email", e.target.value)}
                                        placeholder={T.ph.email}
                                        maxLength={254}
                                        autoComplete="email"
                                        style={fit(form.email, T.ph.email)}
                                        aria-invalid={!!errors.email || undefined}
                                    />
                                </label>{" "}
                                {T.s6}{" "}
                                <label className={`con-slot ${errors.phone ? "is-wrong" : ""}`}>
                                    <span className="con-sr">Teléfono (opcional)</span>
                                    <input
                                        data-field="phone"
                                        type="tel"
                                        inputMode="tel"
                                        value={form.phone}
                                        onChange={(e) => set("phone", e.target.value)}
                                        placeholder={T.ph.phone}
                                        maxLength={20}
                                        autoComplete="tel"
                                        style={fit(form.phone, T.ph.phone)}
                                        aria-invalid={!!errors.phone || undefined}
                                    />
                                </label>
                                {T.s7}
                            </p>

                            {/* Mensaje opcional */}
                            <label className="con-more">
                                <span className="con-more__label">{T.more}</span>
                                <textarea
                                    rows={3}
                                    value={form.message}
                                    onChange={(e) => set("message", e.target.value)}
                                    placeholder={T.morePh}
                                    maxLength={1500}
                                />
                            </label>

                            {/* Trampa para bots: fuera de pantalla y fuera del orden de tabulación */}
                            <label className="con-trap" aria-hidden="true">
                                Website
                                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
                            </label>

                            <label className={`con-legal ${errors.legal ? "is-wrong" : ""}`}>
                                <input
                                    data-field="legal"
                                    type="checkbox"
                                    checked={form.accepted}
                                    onChange={(e) => set("accepted", e.target.checked)}
                                />
                                <span className="con-legal__box" aria-hidden="true">
                                    <svg viewBox="0 0 16 16" width="12" height="12"><path d="M3 8.5L6.5 12L13 4.5" /></svg>
                                </span>
                                <span>
                                    {T.legal[0]}
                                    <a href={LEGAL.privacy} target="_blank" rel="noopener noreferrer">{T.legal[1]}</a>
                                    {T.legal[2]}
                                    <a href={LEGAL.terms} target="_blank" rel="noopener noreferrer">{T.legal[3]}</a>
                                    {T.legal[4]}
                                </span>
                            </label>

                            <div className="con-feedback" role="alert" aria-live="assertive">
                                {errorList.map((m) => (
                                    <p key={m} className="con-msg"><span aria-hidden="true" />{m}</p>
                                ))}
                                {status === "error" && serverError && (
                                    <p className="con-msg"><span aria-hidden="true" />{serverError}</p>
                                )}
                            </div>

                            <div className="con-actions">
                                <button type="submit" className="con-line con-line--xl" disabled={status === "sending"} aria-label={status === "sending" ? T.sending : T.send}>
                                    {lineText(status === "sending" ? T.sending : T.send)}
                                    <svg className="con-line__arrow" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13h18M15 6l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Directo */}
                    <aside className="con-direct" aria-label={T.direct}>
                        <p className="con-label"><span>02</span><i>/</i>{T.direct}</p>
                        <a className="con-line" href={`mailto:${CONTACT.email}`} aria-label={`Email: ${CONTACT.email}`}>
                            {lineText(CONTACT.email)}
                        </a>
                        <a className="con-line" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            {lineText("WhatsApp")}
                            <span className="con-line__ext" aria-hidden="true">↗</span>
                        </a>
                        <a className="con-line" href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`} aria-label={`Teléfono: ${CONTACT.phone}`}>
                            {lineText(CONTACT.phone)}
                        </a>
                    </aside>
                </section>
            </main>
        </MotionConfig>
    );
};

export default Contact;