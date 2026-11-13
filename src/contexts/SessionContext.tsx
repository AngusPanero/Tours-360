import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
// Sin SDK cliente de Firebase: todo pasa por el backend (Admin SDK).
// Así la API key de Firebase ya no viaja en el bundle del frontend.
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UseLanguage, LANDING, type LandingLocale, type LandingTexts, type TextsConfig } from "./LanguageContext";

const SessionContext = createContext<SessionContextType | null>(null);

interface ProviderProps {
  children: ReactNode;
}

interface SessionContextType {
    handleRegister: (email: string, password: string, acceptedLegal: boolean, loginOpen: any, registerOpen: any) => Promise<void>;
    // pin: solo para cuentas admin, cuando /login lo pidió (segundo factor)
    handleLogin: (email: string, password: string, pin?: string) => Promise<boolean | undefined>;
    handleLogout: () => Promise<void>;
    handleResetPassword: (email: string) => Promise<void>;
    error: string | boolean | null | number;
    setError: React.Dispatch<React.SetStateAction<string | boolean | null | number>>;
    loading: string | boolean | null | number;
    setLoading: React.Dispatch<React.SetStateAction<string | boolean | null | number>>;
    user: any;
    isAdmin: boolean | null;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    handleUnbanUser: (uid: any) => Promise<void>
    handleBanUser: (email: any) => Promise<void>
    verifyIsAdmin: () => void
    // true si la comprobación de sesión tarda (servidor de Render despertando)
    slowServer: boolean
    // true si el último login falló porque el email no está verificado
    // (el login muestra el botón "Reenviar mail de verificación")
    emailNotVerified: boolean
    // true cuando el mensaje de `error` es un aviso positivo (ej: "Cuenta creada…")
    errorIsInfo: boolean
    // true cuando la contraseña fue correcta y la cuenta (admin) debe firmar con su clave
    adminPinRequired: boolean
    // Vuelve al paso de contraseña (si cambian email o contraseña)
    cancelAdminPin: () => void
}

// Textos de sesión del idioma activo (con el mismo respaldo que el resto del sitio)
const landingOf = (texts: TextsConfig, language: string): LandingTexts => {
    const own = texts[language]?.landing;
    if (own) return own;
    const fb: LandingLocale = language.startsWith("de") ? "de-CH" : language.startsWith("es") ? "es-AR" : "en";
    return LANDING[fb];
};
const fill = (str: string, vars: Record<string, string | number>) => str.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

// Render (plan gratuito) duerme el servidor tras 15 min sin uso y tarda hasta ~50 s en despertar.
const CHECK_AUTH_TIMEOUT_MS = 60_000; // nunca más de 1 minuto "pensando"
const SLOW_SERVER_MS = 4_000;         // a partir de aquí se puede avisar al usuario

export const SessionProvider = ({ children }: ProviderProps) => {
    const navigate = useNavigate()
    const timeRef = useRef<any>(null);
    const { texts, language } = UseLanguage()
    const tx = landingOf(texts, language).session

    const [ error, setError ] = useState<string | boolean | null | number>(false)
    const [ loading, setLoading ] = useState<string | boolean | null | number>(false)
    const [ user, setUser ] = useState<unknown>(null)
    const [ isAdmin, setIsAdmin ] = useState<boolean | null>(null)
    const [ slowServer, setSlowServer ] = useState(false)
    const [ emailNotVerified, setEmailNotVerified ] = useState(false)
    const [ errorIsInfo, setErrorIsInfo ] = useState(false)
    const [ adminPinRequired, setAdminPinRequired ] = useState(false)
    // Sube con cada login/logout: así una comprobación de sesión que llega tarde no pisa el estado nuevo
    const sessionVersion = useRef(0)

    // Auto Logout
    useEffect(() => {
        if (!user) return;

        const timeout = 15 * 60 * 1000; // 15 minutos

        const resetTimer = () => {
            if (timeRef.current) clearTimeout(timeRef.current);
            timeRef.current = setTimeout(async () => {
                handleLogout()
                setUser(null);
                navigate("/");
            }, timeout);
        };
        resetTimer();

        const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
        events.forEach((event) => window.addEventListener(event, resetTimer));

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetTimer));
            if (timeRef.current) clearTimeout(timeRef.current);
        };
    }, [user, navigate]);

    // Register
    const handleRegister = async (email: string, password: string, acceptedLegal: boolean, loginOpen: React.Dispatch<React.SetStateAction<boolean>>, registerOpen: React.Dispatch<React.SetStateAction<boolean>>) => {
        try {
            setError(null)
            setErrorIsInfo(false)
            setLoading(true)
            // El idioma viaja para que el mail de verificación llegue en el mismo idioma.
            // acceptedLegal: el servidor lo exige y guarda la constancia (LegalConsent)
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`, { email, password, acceptedLegal, language })
            if(response.status === 201){
                registerOpen(false)
                loginOpen(true)
                // Se muestra en el login que se abre: tiene que verificar antes de entrar
                setErrorIsInfo(true)
                setError(response.data?.verificationSent
                    ? tx.registerCreatedSent
                    : response.data?.verificationRateLimited
                        ? tx.registerCreatedRateLimited
                        : tx.registerCreated)
            }
        } catch (error: any) {
            if(error.response?.status === 409){
                setError(tx.registerExists)
                return
            }
            if(error.response?.data?.code === "auth/legal-required"){
                setError(tx.registerLegalRequired)
                return
            }
            if(error.response?.status === 400){
                setError(tx.registerInvalid)
                return
            }
            if(error.response?.status === 429){
                setError(tx.registerTooMany)
                return
            }
            setError(tx.registerError)
        } finally {
            setLoading(false)
        }
    }

    // Login
    // El conteo de intentos fallidos y el bloqueo los hace el backend dentro de
    // /login. Antes el navegador llamaba a /login-failed y cualquiera podía
    // banear cualquier cuenta mandando su email 5 veces.
    // Clave de firma del admin. El servidor la pide recién con la contraseña
    // correcta, así nadie que no la sepa puede averiguar qué cuenta es admin.
    const pinMessage = (serverData: any): string | null => {
        const code = serverData?.code;
        if (code === "auth/pin-locked") {
            const minutes = serverData?.retryAfterMinutes;
            return minutes ? fill(tx.pinLocked, { minutes }) : tx.pinLockedNoTime;
        }
        if (code === "auth/pin-invalid") {
            const left = serverData?.attemptsLeft;
            return typeof left === "number" && left > 0 ? fill(tx.pinWrongLeft, { n: left }) : tx.pinWrong;
        }
        if (code === "auth/pin-not-configured") return tx.pinError;
        return null;
    };

    const cancelAdminPin = () => {
        setAdminPinRequired(false);
        setError(null);
    };

    const handleLogin = async (email: string, password: string, pin?: string) => {
    try {
        sessionVersion.current += 1; // desde aquí manda el login, no la comprobación inicial
        setLoading(true);
        setError(null);
        setErrorIsInfo(false);
        setEmailNotVerified(false);
        // Sin clave es un login nuevo: vuelve al paso de contraseña
        if (!pin) setAdminPinRequired(false);

        // La clave viaja solo cuando el login la pidió (cuentas admin)
        const body = pin ? { email, password, pin, language } : { email, password, language };
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, body, { withCredentials: true });

        if (response.status === 200) {
            const { user, isAdmin } = response.data;

            setUser(user);
            setAdminPinRequired(false);
            setLoading(false);

            if (isAdmin) {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
            return true;
        }

    } catch (error: any) {
        const serverData = error.response?.data;
        const serverCode = serverData?.code;

        // Contraseña correcta, falta la clave: no es un error, se muestra el campo
        if (serverCode === "auth/pin-required") {
            setAdminPinRequired(true);
            return;
        }

        // Errores de la clave (van antes que los genéricos: también usan 401 y 429)
        const pinMsg = pinMessage(serverData);
        if (pinMsg) {
            setAdminPinRequired(true);
            setError(pinMsg);
            return;
        }

        if (serverCode === "auth/too-many-attempts" || error.response?.status === 429) {
            const minutes = serverData?.retryAfterMinutes;
            setError(minutes ? fill(tx.loginTooMany, { minutes }) : tx.loginTooManyNoTime);
            return;
        }

        if (serverCode === "auth/user-banned") {
            setError(tx.loginBanned);
            return;
        }

        if (serverCode === "auth/user-not-found" || error.response?.status === 404) {
            setError(tx.loginNotFound);
            return;
        }

        /* if (serverCode === "auth/email-not-verified") {
            setEmailNotVerified(true);
            setError(serverData?.verificationSent
                ? tx.loginNotVerifiedSent
                : serverData?.verificationRateLimited
                    ? tx.loginNotVerifiedRateLimited
                    : tx.loginNotVerified);
            return;
        } */

        if (serverCode === "auth/invalid-credential" || error.response?.status === 401) {
            const left = serverData?.attemptsLeft;
            setError(typeof left === "number" && left > 0 ? fill(tx.loginInvalidLeft, { n: left }) : tx.loginInvalid);
            return;
        }

        console.error("Login error:", error);
        setError(tx.loginError);
    } finally {
        setLoading(false);
    }
};
    // Logout — el backend lee el token de la cookie y la borra
    const handleLogout = async () => {
        try {
            sessionVersion.current += 1;
            setError(false)
            setErrorIsInfo(false)
            setLoading(true);

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {}, { withCredentials: true });

            if (response.status === 200) {
                setUser(null)
                navigate("/");
            }
        } catch (error: any) {
            setError(tx.logoutError);
            console.error("Error logging out session 🔴", error);
        } finally {
            setLoading(false)
        }
    }

    // Reset Password — el backend le pide a Firebase que mande el mail.
    // Siempre responde igual exista o no el email (evita enumerar cuentas).
    const handleResetPassword = async (email: string) => {
        try {
            if(!email){
                alert(tx.resetEmailRequired);
                return;
            }
            await axios.post(`${import.meta.env.VITE_API_URL}/reset-password`, { email, language });
            alert(tx.resetSent);
        } catch (error: any) {
            const status = error.response?.status;
            const code   = error.response?.data?.code;
            console.error("Error al enviar el email:", code || status);
            if (code === "auth/invalid-email" || status === 400) {
                alert(tx.resetInvalidEmail);
            } else if (status === 429) {
                alert(tx.resetTooMany);
            } else {
                alert(tx.resetError);
            }
        }
    }

    const handleBanUser = async (email: string) => {
        const confirmUnban = confirm(tx.banConfirm);
            if(confirmUnban){
                try {
                setError(false)
                setLoading(true)

                const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/ban-user`, { email }, { withCredentials: true })
                if(response.status === 200){
                    navigate("/admin")
                }
            } catch (error: any) {
                setError(true)
                console.error("Error al bannear usuario! 🔴", error)
            } finally{
                setLoading(false)
            }
        }
    }

     const handleUnbanUser = async (uid: any) => {
        const confirmUnban = confirm(tx.unbanConfirm);
        if(confirmUnban){
            try {
            setError(false)
            setLoading(true)

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/unban-user`, { uid }, { withCredentials: true })
            if(response.status === 200){
                navigate("/admin")
            }
        } catch (error: any) {
            setError(true)
            console.error("Error al desbannear usuario! 🔴", error)
        } finally{
            setLoading(false)
        }
        }
    }

    // Para el renderizado del ul li del nav.
    // El rol se pregunta al servidor (token verificado), no al SDK cliente.
    const verifyIsAdmin = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/me`, { withCredentials: true });
            setIsAdmin(data?.user?.admin === true);
        } catch {
            setIsAdmin(false);
        }
    }

   // Refresh
    // Comprueba la cookie al abrir la web y al volver a una pestaña restaurada.
    // - Tiene tiempo máximo: si el servidor no contesta, el loading NO se queda pensando para siempre.
    // - Si mientras tanto el usuario inicia o cierra sesión, la respuesta vieja se descarta.
    useEffect(() => {
        let controller: AbortController | null = null;

        const checkSession = async () => {
            controller?.abort();
            controller = new AbortController();
            const version = sessionVersion.current;
            const slowTimer = setTimeout(() => setSlowServer(true), SLOW_SERVER_MS);

            try {
                setLoading(true);

                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/check-auth`, {
                    withCredentials: true,
                    timeout: CHECK_AUTH_TIMEOUT_MS,
                    signal: controller.signal,
                });

                if (version !== sessionVersion.current) return; // ya hubo login/logout: no pisamos nada
                setUser(data.authenticated ? data.user : null);
            } catch (error) {
                if (axios.isCancel(error)) return;
                if (version !== sessionVersion.current) return;
                setUser(null);
                console.error("Error checking session on refresh 🔴", error);
            } finally {
                clearTimeout(slowTimer);
                setSlowServer(false);
                if (version === sessionVersion.current) setLoading(false);
            }
        };

        checkSession();

        // Safari/Chrome pueden "congelar" la pestaña y restaurarla tal cual (con una
        // petición a medias). En ese caso volvemos a comprobar la sesión.
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) checkSession();
        };
        window.addEventListener("pageshow", onPageShow);

        return () => {
            window.removeEventListener("pageshow", onPageShow);
            controller?.abort();
        };
    }, []);

    return(
        <SessionContext.Provider value={{ handleRegister , handleLogin, handleLogout, handleResetPassword, error, setError, loading, setLoading, user, setUser, handleUnbanUser, verifyIsAdmin, isAdmin, handleBanUser, slowServer, emailNotVerified, errorIsInfo, adminPinRequired, cancelAdminPin }}>
            { children }
        </SessionContext.Provider>
    )
}

export const UseSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession debe ser usado dentro de un SessionProvider");
  }
  return context;
};