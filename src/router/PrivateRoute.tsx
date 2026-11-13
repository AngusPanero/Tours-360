import { useEffect, useRef, useState, type ReactNode } from "react";
import axios from "axios";
import { UseSession } from "../contexts/SessionContext.js";
import Error from "../processMessages/Error.js";
import Loader from "../loader/Loader.js";

type Role = "admin" | "user";

interface PrivateRouteProps {
    children: ReactNode;
    // role="admin" → solo admin · role="user" → solo usuarios normales
    // Sin role → cualquier usuario logueado
    role?: Role;
    // Compatibilidad con <PrivateRoute adminOnly> (equivale a role="admin")
    adminOnly?: boolean;
}

const getUserRole = (user: any): Role => (user?.admin === true ? "admin" : "user");

// IMPORTANTE: este guard es solo UX. La seguridad real está en el backend:
// cada endpoint de admin tiene que tener adminMiddleware. Una respuesta HTTP
// se puede modificar con un proxy (Burp), así que el frontend nunca es una barrera.
const PrivateRoute = ({ children, role, adminOnly = false }: PrivateRouteProps) => {
    const { user, loading } = UseSession();
    const [status, setStatus] = useState<string>("loading");
    const [blockedMinutes, setBlockedMinutes] = useState<number | null>(null);
    // Evita contar dos veces la misma visita (React StrictMode corre los efectos dos veces)
    const visitReported = useRef(false);
    const requiredRole: Role | null = role ?? (adminOnly ? "admin" : null);

    useEffect(() => {
        let cancelled = false;
        setStatus("loading");

        if (loading) return;

        if (!user) {
            // Zona admin sin sesión: se le avisa al servidor, que cuenta la visita
            // por IP (10 en 1 hora → bloqueo temporal). No manda la cookie a
            // propósito, así nunca puede banear una cuenta desde acá.
            if (requiredRole === "admin" && !visitReported.current) {
                visitReported.current = true;
                axios
                    .post(`${import.meta.env.VITE_API_URL}/security/admin-visit`, { path: window.location.pathname }, { withCredentials: false })
                    .catch((error) => {
                        if (cancelled) return;
                        if (error.response?.data?.code === "IP_BLOCKED") {
                            setBlockedMinutes(error.response.data.retryAfterMinutes ?? null);
                            setStatus("ip-blocked");
                        }
                    });
            }
            setStatus("unauth");
            return;
        }

        const verifyAccess = async () => {
            try {
                // El rol se toma SIEMPRE de lo que devuelve el servidor (/me),
                // nunca del user del contexto (que viene de /login o /check-auth
                // y pudo haber sido manipulado).
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/me`, {
                    withCredentials: true
                });

                if (cancelled) return;

                const serverUser = response.data?.user;
                if (response.status !== 200 || !serverUser?.uid) {
                    setStatus("unauth");
                    return;
                }

                // Si el uid del servidor no coincide con el del contexto, algo está mal
                if (serverUser.uid !== user?.uid) {
                    setStatus("unauth");
                    return;
                }

                if (requiredRole && getUserRole(serverUser) !== requiredRole) {
                    setStatus("wrong-role");
                    return;
                }

                setStatus("ok");
            } catch (error: any) {
                if (cancelled) return;
                const code = error.response?.data?.code;
                if (code === "USER_BANNED" || error.response?.data?.message === "Banned") {
                    setStatus("banned");
                } else if (code === "auth/email-not-verified") {
                    setStatus("not-verified");
                } else {
                    setStatus("unauth");
                }
            }
        };

        verifyAccess();

        return () => {
            cancelled = true;
        };
    }, [user, loading, requiredRole]);

    if (loading || status === "loading") {
        return <Loader />;
    }

    if (status === "ip-blocked") {
        return <Error errorMessage={
            "Se detectaron demasiados intentos de acceso a esta zona desde tu conexión. " +
            "El acceso quedó bloqueado temporalmente" +
            (blockedMinutes ? `: probá de nuevo en ${blockedMinutes} min.` : ".")
        } />;
    }

    if (status === "wrong-role") {
        return <Error errorMessage={
            requiredRole === "admin"
                ? "Acceso Restringido: Se requieren permisos de Administrador."
                : "Acceso Restringido: No corresponde a tu tipo de cuenta."
        } />;
    }

    if (status === "banned") {
        return <Error errorMessage={"Usuario Baneado, contactate con DeepDev."} />;
    }

    if (status === "not-verified") {
        return <Error errorMessage={"Verificá tu email antes de ingresar."} />;
    }

    if (status === "unauth" || !user) {
        return <Error errorMessage={"No autorizado, por favor inicia sesión."} />;
    }

    // Solo si todo está OK, renderizamos los children (el dashboard o la vista protegida)
    return status === "ok" ? <>{children}</> : null;
};

export default PrivateRoute;