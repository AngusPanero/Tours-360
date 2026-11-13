import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import axios from "axios";
import Loader from "../loader/Loader";
import Error from "../processMessages/Error";
import "./userDashboard.css";
import { UseTheme } from "../contexts/ThemeContext";

// Datos de la cuenta tal como los devuelve el servidor (/me). Nunca se toman
// del contexto: el user del front se puede falsear con un proxy (Burp).
interface ServerUser {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    admin: boolean;
}

// Secciones del panel. El orden del array es el orden de las pestañas,
// y la primera es la que se abre si no hay nada guardado.
// Para sumar una sección nueva, agregá un objeto acá y listo: con dos o más
// secciones aparecen las pestañas solas.
const SECTIONS = [
    {
        id: "inicio",
        label: "Inicio",
        render: (me: ServerUser) => (
            <section className="ud-empty">
                <p className="ud-label">
                    <span className="ud-label-num">01</span>
                    <span className="ud-label-slash" aria-hidden="true">/</span>
                    Tu cuenta
                </p>
                <h1 className="ud-title">Dashboard</h1>
                {me.email && (
                    <p className="ud-account">
                        <span className="ud-account-dash" aria-hidden="true" />
                        {me.email}
                    </p>
                )}
            </section>
        ),
    },
] as const satisfies ReadonlyArray<{ id: string; label: string; render: (me: ServerUser) => ReactNode }>;

type SectionId = (typeof SECTIONS)[number]["id"];

const STORAGE_KEY = "dd_user_section";
const DEFAULT_SECTION: SectionId = SECTIONS[0].id;

const isSectionId = (value: unknown): value is SectionId =>
    SECTIONS.some((s) => s.id === value);

// Lee la última sección usada. Si no existe, quedó una que ya no está
// o el navegador bloquea el storage (Safari privado), usa la primera.
function readStoredSection(): SectionId {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return isSectionId(stored) ? stored : DEFAULT_SECTION;
    } catch {
        return DEFAULT_SECTION;
    }
}

// "checking"     → esperando al servidor · "ok" → sesión válida
// "banned"       → la cuenta está suspendida
// "not-verified" → email sin verificar
// "denied"       → sin sesión válida o error de red: no se muestra nada
type AccessStatus = "checking" | "ok" | "banned" | "not-verified" | "denied";

export default function UserDashboard() {
    const { theme } = UseTheme();
    const [active, setActive] = useState<SectionId>(readStoredSection);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // ── Verificación contra el servidor ───────────────────────────────────────
    // El panel no muestra nada hasta que /me confirme la sesión con el token
    // firmado. Toda sección nueva que pida datos lo hace a rutas con
    // authMiddleware que buscan por req.user.uid (nunca un uid que mande el front).
    const [access, setAccess] = useState<AccessStatus>("checking");
    const [me, setMe] = useState<ServerUser | null>(null);

    useEffect(() => {
        let cancelled = false;

        axios
            .get(`${import.meta.env.VITE_API_URL}/me`, { withCredentials: true, timeout: 60000 }) // Render puede tardar en despertar
            .then((res) => {
                if (cancelled) return;
                const user = res.data?.user as ServerUser | undefined;
                if (!user?.uid) {
                    setAccess("denied");
                    return;
                }
                setMe(user);
                setAccess("ok");
            })
            .catch((err) => {
                if (cancelled) return;
                const code = err.response?.data?.code;
                if (code === "USER_BANNED") setAccess("banned");
                else if (code === "auth/email-not-verified") setAccess("not-verified");
                else setAccess("denied");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const selectSection = (id: SectionId) => {
        setActive(id);
        try {
            localStorage.setItem(STORAGE_KEY, id);
        } catch {
            // Sin storage disponible: la sección cambia igual, solo no se recuerda
        }
    };

    // Flechas, Inicio y Fin para moverse entre pestañas con el teclado
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const last = SECTIONS.length - 1;
        let next: number | null = null;
        if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
        if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = last;
        if (next === null) return;
        e.preventDefault();
        selectSection(SECTIONS[next].id);
        tabRefs.current[next]?.focus();
    };

    const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
    const showTabs = SECTIONS.length > 1;

    // ── Esperando confirmación del servidor: no se muestra nada del panel ─────
    if (access === "checking") return <Loader />;

    if (access === "banned") return (
        <Error errorMessage={"Esta cuenta está suspendida. Contactate con DeepDev."} />
    );

    if (access === "not-verified") return (
        <Error errorMessage={"Verificá tu email antes de ingresar."} />
    );

    if (access !== "ok" || !me) return (
        <Error errorMessage={"No autorizado, por favor inicia sesión."} />
    );

    return (
        <div className={`ud-page ${theme === "light" ? "theme-light" : "theme-dark"}`}>
            <div className="ud-bar">
                <div className="ud-bar-inner">
                    <p className="ud-brand" aria-label="DeepDev">
                        Deep<span>Dev</span>
                        <span className="ud-brand-tag">Mi cuenta</span>
                    </p>

                    {showTabs && (
                        <nav className="ud-tabs" role="tablist" aria-label="Secciones de tu cuenta">
                            {SECTIONS.map((section, index) => {
                                const selected = section.id === active;
                                return (
                                    <button
                                        key={section.id}
                                        ref={(el) => { tabRefs.current[index] = el; }}
                                        id={`ud-tab-${section.id}`}
                                        role="tab"
                                        type="button"
                                        aria-selected={selected}
                                        aria-controls={`ud-panel-${section.id}`}
                                        tabIndex={selected ? 0 : -1}
                                        className={`ud-tab ${selected ? "ud-tab--active" : ""}`}
                                        onClick={() => selectSection(section.id)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                    >
                                        {section.label}
                                    </button>
                                );
                            })}
                        </nav>
                    )}
                </div>
            </div>

            <div
                className="ud-content"
                {...(showTabs
                    ? { role: "tabpanel", id: `ud-panel-${current.id}`, "aria-labelledby": `ud-tab-${current.id}` }
                    : {})}
            >
                {current.render(me)}
            </div>
        </div>
    );
}