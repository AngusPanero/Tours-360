import { useEffect, type CSSProperties } from "react";
import "./maintenanceScreen.css";

// Pantalla única de mantenimiento. No usa contextos ni navbar/footer:
// se muestra sola y únicamente esto. El idioma sale del que el visitante
// eligió en el sitio (localStorage "userLanguage") o, si no hay, del navegador.

type Lang = "es-AR" | "es-ES" | "de-CH" | "en";

const TEXTS: Record<Lang, { docTitle: string; kicker: string; title: string[]; text: string; status: string; mailLabel: string }> = {
    "es-AR": {
        docTitle: "DeepDev · En mantenimiento",
        kicker: "Mantenimiento",
        title: ["Estamos", "ajustando", "detalles."],
        text: "Estamos haciendo mejoras en el sitio. Volvé en unos minutos: la página se actualiza sola cuando terminemos.",
        status: "Volvemos en breve",
        mailLabel: "¿Es urgente? Escribinos",
    },
    "es-ES": {
        docTitle: "DeepDev · En mantenimiento",
        kicker: "Mantenimiento",
        title: ["Estamos", "ajustando", "detalles."],
        text: "Estamos haciendo mejoras en la web. Vuelve en unos minutos: la página se actualizará sola cuando terminemos.",
        status: "Volvemos en breve",
        mailLabel: "¿Es urgente? Escríbenos",
    },
    "de-CH": {
        docTitle: "DeepDev · Wartung",
        kicker: "Wartung",
        title: ["Wir feilen", "gerade an", "Details."],
        text: "Wir verbessern gerade unsere Website. Schauen Sie in ein paar Minuten wieder vorbei – die Seite lädt automatisch neu, sobald wir fertig sind.",
        status: "Bald wieder da",
        mailLabel: "Dringend? Schreiben Sie uns",
    },
    en: {
        docTitle: "DeepDev · Maintenance",
        kicker: "Maintenance",
        title: ["We're", "fine-tuning", "the details."],
        text: "We're making improvements to the site. Check back in a few minutes — the page will refresh on its own when we're done.",
        status: "Back shortly",
        mailLabel: "Urgent? Write to us",
    },
};

const CONTACT_MAIL = "contact@deepdevstudio.com";

const pickLang = (): Lang => {
    let stored: string | null = null;
    try {
        stored = localStorage.getItem("userLanguage");
    } catch {
        stored = null;
    }
    const l = (stored || (typeof navigator !== "undefined" ? navigator.language : "") || "en").toLowerCase();
    if (l === "es-es") return "es-ES";
    if (l.startsWith("es")) return "es-AR";
    if (l.startsWith("de")) return "de-CH";
    return "en";
};

const MaintenanceScreen = () => {
    const lang = pickLang();
    const t = TEXTS[lang];

    useEffect(() => {
        const prev = document.title;
        document.title = t.docTitle;
        return () => {
            document.title = prev;
        };
    }, [t.docTitle]);

    return (
        <main className="mt-wrap" lang={lang}>
            <header className="mt-top">
                <span className="mt-brand" aria-label="DeepDev">
                    Deep<span>Dev</span>
                </span>
                <p className="mt-label">
                    <span className="mt-num">503</span>
                    <span className="mt-slash" aria-hidden="true">/</span>
                    {t.kicker}
                </p>
            </header>

            <h1 className="mt-title" aria-label={t.title.join(" ")}>
                {t.title.map((line, i) => (
                    <span key={i} className={`mt-row mt-row--${i + 1}`} aria-hidden="true">
                        <span className="mt-mask">
                            <span className="mt-in" style={{ "--d": i } as CSSProperties}>{line}</span>
                        </span>
                    </span>
                ))}
            </h1>

            <div className="mt-sweep" aria-hidden="true"><span /></div>

            <div className="mt-foot">
                <p className="mt-text">{t.text}</p>
                <p className="mt-status">
                    <span className="mt-dash" aria-hidden="true" />
                    {t.status}
                </p>
                <div className="mt-mail">
                    <span className="mt-mail-label">{t.mailLabel}</span>
                    <a className="mt-line" href={`mailto:${CONTACT_MAIL}`} aria-label={CONTACT_MAIL}>
                        <span className="mt-line-txt" aria-hidden="true">
                            {[...CONTACT_MAIL].map((ch, i) => (
                                <span key={i} style={{ "--i": i } as CSSProperties}>{ch}</span>
                            ))}
                        </span>
                        <svg className="mt-arrow" viewBox="0 0 26 26" aria-hidden="true">
                            <path d="M4 13h18M15 6l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </main>
    );
};

export default MaintenanceScreen;