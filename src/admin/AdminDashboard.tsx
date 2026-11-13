import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import axios from "axios";
import Loader from "../loader/Loader";
import Error from "../processMessages/Error";
import "./adminDashboard.css";
import { UseTheme } from "../contexts/ThemeContext";
import TourAdmin from "../tours/TourAdmin";

const SECTIONS = [
    {
        id: "inicio",
        label: "Inicio",
        render: () => (
            <section className="ad-empty">
                <p className="ad-label">
                    <span className="ad-label-num">01</span>
                    <span className="ad-label-slash" aria-hidden="true">/</span>
                    Panel de administración
                </p>
                <h1 className="ad-title">Admin</h1>
            </section>
        ),
    },
] as const satisfies ReadonlyArray<{ id: string; label: string; render: () => ReactNode }>;

type SectionId = (typeof SECTIONS)[number]["id"];

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || "dd_admin_section";
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

// "checking"     → esperando al servidor · "ok" → admin real
// "threat"       → el servidor detectó que NO es admin (incidente registrado + ban)
// "refresh"      → le acaban de dar admin y su sesión es vieja: tiene que reloguearse
// "blocked"      → demasiados intentos desde esta IP: bloqueo temporal
// "banned"       → la cuenta está suspendida
// "not-verified" → email sin verificar
// "denied"       → sin sesión válida o error de red: no se muestra nada
type AccessStatus = "checking" | "ok" | "threat" | "refresh" | "blocked" | "banned" | "not-verified" | "denied";

export default function AdminDashboard() {
    const { theme } = UseTheme();
    const [active, setActive] = useState<SectionId>(readStoredSection);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // ── Verificación de acceso contra el servidor ─────────────────────────────
    // El panel NO se renderiza ni pide datos hasta que el servidor confirme con
    // el token firmado que la cuenta es admin. El user del contexto se puede
    // falsear con un proxy (Burp): si alguien llega acá así, el servidor lo banea.
    const [access, setAccess]           = useState<AccessStatus>("checking");
    const [incidentId, setIncidentId]   = useState<string | null>(null);
    const [blockedMin, setBlockedMin]   = useState<number | null>(null);
    const verifyStartedRef              = useRef(false);

    useEffect(() => {
        // Evita el doble pedido de React StrictMode en desarrollo
        if (verifyStartedRef.current) return;
        verifyStartedRef.current = true;

        axios.post(
            `${import.meta.env.VITE_API_URL}/security/verify-admin-access`,
            { path: window.location.pathname, tab: readStoredSection() },
            { withCredentials: true, timeout: 60000 } // Render puede tardar en despertar
        )
            .then((res) => {
                setAccess(res.data?.ok === true ? "ok" : "denied");
            })
            .catch((err) => {
                const data = err.response?.data;
                switch (data?.code) {
                    case "SECURITY_THREAT":
                        setIncidentId(data.incidentId ?? null);
                        setAccess("threat");
                        return;
                    case "SESSION_REFRESH_REQUIRED":
                        setAccess("refresh");
                        return;
                    case "IP_BLOCKED":
                        setBlockedMin(typeof data.retryAfterMinutes === "number" ? data.retryAfterMinutes : null);
                        setAccess("blocked");
                        return;
                    case "USER_BANNED":
                        setAccess("banned");
                        return;
                    case "auth/email-not-verified":
                        setAccess("not-verified");
                        return;
                    default:
                        setAccess("denied");
                }
            });
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

    // ── Amenaza detectada: el servidor ya registró el incidente y baneó ───────
    if (access === "threat") return (
        <Error errorMessage={
            "Amenaza de seguridad detectada: intento de acceso no autorizado al panel de administración. " +
            "El incidente fue registrado con los datos de tu sesión y tu cuenta fue suspendida." +
            (incidentId ? ` Incidente: ${incidentId}` : "")
        } />
    );

    if (access === "refresh") return (
        <Error errorMessage={"Tu cuenta se actualizó. Cerrá sesión y volvé a ingresar para acceder al panel."} />
    );

    if (access === "blocked") return (
        <Error errorMessage={
            "Se detectaron demasiados intentos de acceso a esta zona desde tu conexión. El acceso quedó bloqueado temporalmente" +
            (blockedMin ? `: probá de nuevo en ${blockedMin} min.` : ".")
        } />
    );

    if (access === "banned") return (
        <Error errorMessage={"Esta cuenta está suspendida. Contactate con DeepDev."} />
    );

    if (access === "not-verified") return (
        <Error errorMessage={"Verificá tu email antes de ingresar."} />
    );

    if (access !== "ok") return (
        <Error errorMessage={"No autorizado, por favor inicia sesión."} />
    );

    return (
        <TourAdmin />
    );
}