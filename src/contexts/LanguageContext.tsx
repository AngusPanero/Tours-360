import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export interface Translation {
    landing?: LandingTexts;
    home: {
        reinventing: string;
        boost: string;
        real: string;
        ai: string;
        automate: string;
    };
    products: {
        webTitle: string;
        webText: string;
        appTitle: string;
        appText: string;
        customTitle: string;
        customText: string;
        AiTitle: string;
        AiText: string;
        automationTitle: string;
        automationText: string;
    };
    company: {
        dna: string;
        dnaTitle: string;
        dnaText: string;
        projects: string;
        uptime: string;
        support: string;
        title2022: string;
        text2022: string;
        title2024: string;
        text2024: string;
        title2026: string;
        text2026: string;
        global: string;
        globalTitle: string;
        globalText: string;
        flagSpain: string;
        flagArgentina: string;
        talk: string;
        talkButton: string;
    };
    raffles: {
        premiere: string;
        premiereTitle: string;
        premiereText: string;
        performance: string;
        performanceText: string;
        design: string;
        designText: string;
        raffleTitle: string;
        raffleText: string;
        days: string;
        hours: string;
        minutes: string;
        seconds: string;
        name: string;
        email: string;
        project: string;
        conditions: object;
        error: string
        processing: string
        verify: string
        analyzing: string
        status: string
        registered: string,
        thanks: object,
        premio: string,
        buttonBack: string,
        button: string;
    };
    contact: {
        name: string;
        lastName: string;
        companyName: string;
        role: string;
        email: string;
        phone: string;
        project: string,
        projectOption: string,
        projectNew: string;
        projectRedisign: string;
        current: string;
        type: string[];
        projectGoal: string[];
        range: string[];
        available: string[];
        descriptionPlace: string[];
        button: string;
    };
    nav: {
        promo: string;
        products: string;
        sales: string;
        company: string;
        raffles: string;
        contact: string;
        login: string;
    };
    login: {
        title: string;
        text: string;
        email: string;
        password: string;
        button: string;
        register: {
            before: string;
            after: string;
        },
        forgot: string;
    };
    register:{
        title: string
        email: string
        password: string
        verifyPassword: string
        passMismatch: string
        passError: string
        btnRegister: string
        footerText: string
        footerLink: string
        reqMinChars: string
        reqUpper: string
        reqNumber: string
        reqSpecial: string
        errorRegister: string
    };
    footer: {
        deepdev: string[];
        navigation: string[];
        expertise: string[];
        connect: string[];
        rights: string;
        privacy: string;
        terms: string;
        navigationTitle: string,
        expertiseTitle: string,
        connectTitle: string,
    };
    language: string;
    raffleTerm:{
        terms_title: string;
        terms_subtitle: string
        term1_title: string;
        term1_text: string;   
        term2_title: string;
        term2_text: string;   
        term3_title: string;
        term3_text: string;   
        term4_title: string;
        term4_text: string;   
        term5_title: string;
        term5_text: string;   
        terms_footer: string;
    };
    error404:{
        title: string
        errorMessage: string
    };
    cookies: {
    title: string;
    intro: string;
    questionWhat: string;
    answerWhat: string;
    questionTypes: string;
    typeEssential: string;
    typePerformance: string;
    typeFunctionality: string;
    typeThirdParty: string;
    questionManage: string;
    answerManage: string;
    };
    sessionErrors: {
        loginBanned: string,
        loginTooManyAttempts: string
        loginInvalidCredentials: string
        loginAttemptsLeft: string
        loginGeneralError: string
        resetEmailRequired: string
        resetEmailSent: string
        resetUserNotFound: string
        resetInvalidEmail: string
        resetTooManyRequests: string
        logoutError: string
        }
}

export interface TextsConfig {
    [key: string]: Translation; 
}

export interface LanguageContextType {
    language: string;
    texts: TextsConfig; 
    handleLanguage: (lang: string) => void;
}
/* ============================================================
   HOME (nueva web) — textos por región + detección de país
   Idiomas activos del Home: es-AR, es-ES, de-CH.
   Los idiomas anteriores (en, es, it, fr, de, ru) siguen intactos.
   ============================================================ */
export type LandingLocale = "es-AR" | "es-ES" | "de-CH" | "en";

export interface LandingStep {
    title: string;
    text: string;
}

export interface LandingTexts {
    lang: { title: string; detected: string; detectedUnknown: string; suggested: string; confirm: string; note: string };
    hero: { eyebrow: string; title: string[]; text: string; cta: string; ctaSecondary: string; scroll: string };
    manifesto: { kicker: string; text: string };
    identity: { kicker: string; title: string; steps: LandingStep[] };
    power: { kicker: string; title: string; steps: LandingStep[] };
    global: { kicker: string; title: string; text: string; cities: string[]; live: string };
    stats: { kicker: string; items: { value: string; label: string }[] };
    cta: { kicker: string; title: string; text: string; button: string };
    aria: { hero: string; identity: string; power: string; global: string };
    lab: {
        kicker: string;
        title: string;
        text: string;
        hint: string;
        madeWith: string;
        open: string;
        close: string;
        reset: string;
        experiments: { name: string; text: string; hint: string; tech: string[] }[];
        controls: {
            gravity: string;
            bounce: string;
            drop: string;
            depth: string;
            split: string;
            join: string;
            placeholder: string;
            samples: string[];
            height: string;
            best: string;
            level: string;
            time: string;
            place: string;
            speed: string;
            damping: string;
            rainOn: string;
            rainOff: string;
            calm: string;
            newMaze: string;
            start: string;
            soundOn: string;
            soundOff: string;
            status: { towerReady: string; towerPlay: string; towerPerfect: string; towerOver: string; mazePlay: string; mazeWin: string; simonIdle: string; simonWatch: string; simonTurn: string; simonFail: string };
        };
        stack: { kicker: string; title: string; layers: { name: string; tools: string[]; text: string }[] };
        cta: { title: string; button: string };
        aria: { hero: string; stack: string; experiment: string };
    };
    about: {
        kicker: string;
        title: string;
        text: string;
        facts: { label: string; value: string }[];
        origin: { kicker: string; title: string; paragraphs: string[] };
        mission: { kicker: string; text: string; values: { title: string; text: string }[] };
        why: { kicker: string; title: string; items: { title: string; text: string }[] };
        process: { kicker: string; title: string; steps: { title: string; text: string }[] };
        presence: { kicker: string; title: string; text: string; offices: { city: string; country: string; role: string }[] };
        cta: { title: string; primary: string; secondary: string };
        aria: { process: string; presence: string };
    };
    products: {
        kicker: string;
        title: string;
        text: string;
        indexLabel: string;
        productsKicker: string;
        products: { name: string; tagline: string; text: string; points: string[] }[];
        rocket: { kicker: string; title: string; text: string; liftoff: string; altitude: string; phases: { title: string; text: string }[] };
        cta: { title: string; button: string };
        aria: { products: string; rocket: string };
    };
    contact: {
        kicker: string;
        title: string;
        text: string;
        mailLabel: string;
        fields: { name: string; lastName: string; email: string; country: string; phone: string; budget: string; message: string };
        placeholders: { name: string; lastName: string; email: string; country: string; phone: string; message: string };
        budgetNote: string;
        upTo: string;
        from: string;
        errors: { required: string; email: string; phone: string; country: string; budget: string; message: string; consent: string };
        consent: string;
        privacyLink: string;
        termsLink: string;
        progress: string;
        progressOf: string;
        submit: string;
        sending: string;
        successTitle: string;
        successText: string;
        again: string;
        errorSend: string;
        privacy: string;
        aria: string;
    };
    session: {
        registerCreatedSent: string;
        registerCreatedRateLimited: string;
        registerCreated: string;
        registerExists: string;
        registerInvalid: string;
        registerTooMany: string;
        registerError: string;
        registerLegalRequired: string;
        loginTooMany: string;
        loginTooManyNoTime: string;
        loginBanned: string;
        loginNotFound: string;
        loginNotVerifiedSent: string;
        loginNotVerifiedRateLimited: string;
        loginNotVerified: string;
        loginInvalid: string;
        loginInvalidLeft: string;
        loginError: string;
        pinLabel: string;
        pinHint: string;
        pinChecking: string;
        pinWrong: string;
        pinWrongLeft: string;
        pinLocked: string;
        pinLockedNoTime: string;
        pinError: string;
        logoutError: string;
        resetEmailRequired: string;
        resetSent: string;
        resetInvalidEmail: string;
        resetTooMany: string;
        resetError: string;
        banConfirm: string;
        unbanConfirm: string;
    };
    system: {
        errorKicker: string;
        okKicker: string;
        notFoundKicker: string;
        notFoundTitle: string;
        redirect: string;
        home: string;
        loading: string;
    };
    footer: {
        statement: string;
        tagline: string;
        description: string;
        follow: string;
        presenceTitle: string;
        countries: string[];
        call: string;
        localTime: string;
        email: string;
        backTop: string;
        madeIn: string;
        available: string;
        away: string;
        yourZone: string;
        coverage: string;
        now: string;
        copy: string;
        copied: string;
        hours: string;
    };
    navbar: {
        home: string;
        cta: string;
        logout: string;
        admin: string;
        themeLight: string;
        themeDark: string;
        menu: string;
        language: string;
        open: string;
        close: string;
        regions: string;
        startTitle: string;
        lab: string;
    };
}

export const LANDING_LOCALES: { code: LandingLocale; name: string; region: string; tag: string }[] = [
    { code: "es-AR", name: "Español AR", region: "Argentina", tag: "AR" },
    { code: "es-ES", name: "Español ES", region: "España", tag: "ES" },
    { code: "de-CH", name: "Deutsch CH", region: "Schweiz", tag: "CH" },
    { code: "en", name: "English EN", region: "International", tag: "EN" },
];

export const isLandingLocale = (v: string | null | undefined): v is LandingLocale =>
    v === "es-AR" || v === "es-ES" || v === "de-CH" || v === "en";

/* Detecta el país por la zona horaria del navegador (sin llamadas externas)
   y, si no alcanza, por la región del idioma del navegador. */
export const detectLocale = (): { locale: LandingLocale; country: string | null } => {
    let tz = "";
    try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
        tz = "";
    }
    const langs: string[] =
        typeof navigator === "undefined"
            ? []
            : navigator.languages && navigator.languages.length
              ? [...navigator.languages]
              : [navigator.language];
    const regionOf = (l: string) => (l.split("-")[1] || "").toUpperCase();

    let country: string | null = null;
    if (/^America\/(Argentina\/|Buenos_Aires$|Cordoba$|Mendoza$|Catamarca$|Jujuy$|Rosario$)/.test(tz)) country = "AR";
    else if (/^(Europe\/Madrid|Atlantic\/Canary|Africa\/Ceuta)$/.test(tz)) country = "ES";
    else if (tz === "Europe/Zurich") country = "CH";
    else {
        for (const l of langs) {
            const r = regionOf(l);
            if (r.length === 2) {
                country = r;
                break;
            }
        }
    }

    const primary = (langs[0] || "").toLowerCase();
    const speaksGerman = langs.some((l) => l.toLowerCase().startsWith("de"));
    const locale: LandingLocale =
        country === "AR" ? "es-AR"
        : country === "ES" ? "es-ES"
        : country === "CH" || country === "DE" || country === "AT" || speaksGerman ? "de-CH"
        : primary.startsWith("es") ? (tz.startsWith("America/") ? "es-AR" : "es-ES")
        : "en";

    return { locale, country };
};

export const LANDING: Record<LandingLocale, LandingTexts> = {
    "es-AR": {
        lang: {
            title: "Elegí tu idioma",
            detected: "Detectamos que estás en {country}.",
            detectedUnknown: "Elegí el idioma con el que querés navegar.",
            suggested: "Sugerido",
            confirm: "Continuar",
            note: "Podés cambiarlo cuando quieras desde el menú.",
        },
        hero: {
            eyebrow: "Estudio digital · Argentina · España · Suiza",
            title: ["Marcas que se ven", "tan bien como", "funcionan."],
            text: "Unimos estrategia, diseño e ingeniería en un solo equipo para construir la identidad de tu marca y el producto digital que la lleva a tus clientes.",
            cta: "Hablemos de tu proyecto",
            ctaSecondary: "Cómo trabajamos",
            scroll: "Bajá",
        },
        manifesto: {
            kicker: "Manifiesto",
            text: "La mayoría de las marcas se parecen porque se construyen igual. Nosotros empezamos por entender qué te hace *distinto* y lo convertimos en algo que se puede usar: una identidad *clara,* una experiencia que se siente *tuya* y una tecnología que te *sostiene* mientras crecés.",
        },
        identity: {
            kicker: "Identidad de marca",
            title: "Una marca es un sistema, no un logo.",
            steps: [
                { title: "Escuchamos", text: "Antes de diseñar entendemos tu negocio, a tu público y lo que querés que sientan cuando te ven." },
                { title: "Definimos", text: "Color, tipografía, tono y forma. Cada decisión tiene un motivo y una regla." },
                { title: "Sistematizamos", text: "Convertimos la identidad en piezas reutilizables para que se vea igual en una web, una app o una historia de Instagram." },
                { title: "La llevamos a producto", text: "Tu marca cobra vida donde tus clientes la usan: en cada pantalla, cada botón y cada mensaje." },
            ],
        },
        power: {
            kicker: "Por qué DeepDev",
            title: "Todo el poder de un equipo completo. Sin intermediarios.",
            steps: [
                { title: "Un solo equipo", text: "Estrategia, diseño, desarrollo y automatización trabajan juntos desde el primer día. Nadie se pasa la pelota." },
                { title: "Ingeniería de verdad", text: "Código propio, seguro y medible. Nada de plantillas que se rompen cuando tu negocio crece." },
                { title: "Pensado para escalar", text: "Construimos hoy la base que vas a necesitar mañana, para crecer sin tener que rehacer todo." },
                { title: "Socios, no proveedores", text: "Seguimos con vos después del lanzamiento: medimos, ajustamos y mejoramos." },
            ],
        },
        global: {
            kicker: "Presencia",
            title: "Cerca tuyo, en tu idioma y en tu horario.",
            text: "Trabajamos con marcas de Argentina, España y Suiza. Entendemos cada mercado y nos organizamos para que tu proyecto avance todos los días.",
            cities: ["Buenos Aires", "Madrid", "Zúrich"],
            live: "Hora local",
        },
        stats: {
            kicker: "En números",
            items: [
                { value: "3", label: "Países" },
                { value: "1", label: "Equipo de punta a punta" },
                { value: "100%", label: "Código a medida" },
                { value: "24/7", label: "Soporte" },
            ],
        },
        cta: {
            kicker: "Empecemos",
            title: "¿Tenés una idea? Hagámosla marca.",
            text: "Contanos qué querés construir y te proponemos el primer paso.",
            button: "Empezar un proyecto",
        },
        navbar: {
            home: "Inicio",
            cta: "Empezar proyecto",
            logout: "Cerrar sesión",
            admin: "Administrador",
            themeLight: "Modo claro",
            themeDark: "Modo oscuro",
            menu: "Menú",
            language: "Idioma",
            open: "Abrir menú",
            close: "Cerrar menú",
            regions: "Argentina · España · Suiza",
            startTitle: "¿Tenés una idea?",
            lab: "Laboratorio",
        },
        lab: {
            kicker: "Lab",
            title: "Donde probamos lo que todavía no existe.",
            text: "Experimentos, demos y prototipos hechos sin cliente de por medio. Es nuestro taller: acá ponemos a prueba el motor gráfico, la física y las ideas que después llegan a los productos.",
            hint: "Abrí cualquier experimento y jugá con él.",
            madeWith: "Hecho con",
            open: "Abrir",
            close: "Cerrar",
            reset: "Reiniciar",
            experiments: [
                {
                    name: "Gravedad",
                    text: "Una placa de encastre y piezas que caen con física real. Cambiá la gravedad y el rebote, y mirá cómo se apilan.",
                    hint: "Tocá la escena para soltar piezas.",
                    tech: [
                        "Canvas 2D",
                        "TypeScript",
                        "Física propia",
                    ],
                },
                {
                    name: "Eslabones",
                    text: "Nuestro logo extruido en tiempo real. Giralo, cambiale la profundidad y separá los dos eslabones.",
                    hint: "Arrastrá para girarlo.",
                    tech: [
                        "Canvas 2D",
                        "Extrusión en tiempo real",
                        "Resortes",
                    ],
                },
                {
                    name: "Escribí y construí",
                    text: "Cada letra que escribís es un ladrillo nuevo en el muro. Borrá y se va.",
                    hint: "Escribí hasta 16 letras.",
                    tech: [
                        "Canvas 2D",
                        "React",
                        "Física propia",
                    ],
                },
                {
                    name: "Microinteracciones",
                    text: "Las animaciones de los botones del sitio: letras en ola, líneas que se dibujan y flechas que se redibujan.",
                    hint: "Pasá el cursor o tocá cada botón.",
                    tech: [
                        "CSS",
                        "Framer Motion",
                        "SVG",
                    ],
                },
                {
                    name: "Torre",
                    text: "Un bloque va y viene sobre la torre. Soltalo en el momento justo: lo que sobresale se corta y se cae. Si lo clavás exacto, sumás racha.",
                    hint: "Tocá la escena o apretá espacio para soltar.",
                    tech: ["Canvas 2D", "Física propia", "TypeScript"],
                },
                {
                    name: "Ondas",
                    text: "Un campo de columnas que se comporta como agua. Cada toque es una gota: las ondas se cruzan, rebotan en los bordes y se calman.",
                    hint: "Tocá cualquier columna.",
                    tech: ["Canvas 2D", "Ecuación de onda", "Física propia"],
                },
                {
                    name: "Laberinto",
                    text: "Inclinás la placa y la bola rueda con inercia hasta la salida azul. Cada laberinto es nuevo y se genera al instante.",
                    hint: "Mantené apretado hacia donde querés inclinar, o usá las flechas.",
                    tech: ["Canvas 2D", "Generación procedural", "Colisiones"],
                },
                {
                    name: "Secuencia",
                    text: "Cuatro bloques se encienden en orden. Repetí la secuencia: cada ronda suma un paso más.",
                    hint: "Tocá los bloques o usá las teclas 1 a 4.",
                    tech: ["Canvas 2D", "Web Audio", "React"],
                },
            ],
            controls: {
                gravity: "Gravedad",
                bounce: "Rebote",
                drop: "Soltar pieza",
                depth: "Profundidad",
                split: "Separar",
                join: "Unir",
                placeholder: "Escribí algo",
                samples: [
                    "Empezar proyecto",
                    "Ver casos",
                    "Escribinos",
                    "Conocé el equipo",
                ],
                height: "Altura",
                best: "Récord",
                level: "Nivel",
                time: "Tiempo",
                place: "Soltar bloque",
                speed: "Velocidad",
                damping: "Calma",
                rainOn: "Parar la lluvia",
                rainOff: "Que llueva",
                calm: "Calmar el agua",
                newMaze: "Otro laberinto",
                start: "Empezar",
                soundOn: "Sonido: sí",
                soundOff: "Sonido: no",
                status: {
                    towerReady: "Soltá el primer bloque.",
                    towerPlay: "",
                    towerPerfect: "¡Exacto! Seguí la racha.",
                    towerOver: "Se terminó la torre. Tocá para empezar otra.",
                    mazePlay: "",
                    mazeWin: "¡Salida! Ya viene otro laberinto.",
                    simonIdle: "Tocá Empezar o cualquier bloque.",
                    simonWatch: "Mirá la secuencia…",
                    simonTurn: "Tu turno.",
                    simonFail: "Te equivocaste. Tocá Empezar para otra.",
                },
            },
            stack: {
                kicker: "Stack",
                title: "Las herramientas detrás de cada proyecto.",
                layers: [
                    {
                        name: "Frontend",
                        tools: [
                            "React",
                            "TypeScript",
                            "Vite",
                            "Framer Motion",
                        ],
                        text: "Interfaces rápidas y tipadas, con animaciones fluidas sin perder rendimiento.",
                    },
                    {
                        name: "Backend",
                        tools: [
                            "Node.js",
                            "Express",
                            "MongoDB",
                        ],
                        text: "APIs propias, flexibles y fáciles de escalar a medida que crece el producto.",
                    },
                    {
                        name: "Servicios",
                        tools: [
                            "Firebase Auth",
                            "Stripe",
                            "MercadoPago",
                            "Brevo",
                            "Cloudinary",
                        ],
                        text: "Autenticación, pagos, correo e imágenes con plataformas probadas: no reinventamos lo que ya funciona.",
                    },
                    {
                        name: "Infraestructura",
                        tools: [
                            "Render",
                            "Cloudflare",
                        ],
                        text: "Despliegues automáticos, DNS y protección en el borde para que todo esté siempre en línea.",
                    },
                ],
            },
            cta: {
                title: "¿Querés esto en tu producto?",
                button: "Hablemos de tu proyecto",
            },
            aria: {
                hero: "Campo de bloques que ondula",
                stack: "Torre de capas con las herramientas que usamos",
                experiment: "Experimento interactivo",
            },
        },
        about: {
            kicker: "Sobre DeepDev",
            title: "Un estudio de desarrollo de alta gama.",
            text: "Diseñamos y desarrollamos productos digitales para marcas que no se conforman con lo de siempre. Un equipo que diseña y programa con obsesión por el detalle, trabajando desde tres países.",
            facts: [
                {
                    label: "Estudio",
                    value: "Desarrollo de alta gama",
                },
                {
                    label: "Presencia",
                    value: "Argentina · España · Suiza",
                },
                {
                    label: "Modelo",
                    value: "Diseño e ingeniería en un solo equipo",
                },
            ],
            origin: {
                kicker: "Origen",
                title: "Nacimos para hacer las cosas bien, no rápido.",
                paragraphs: [
                    "DeepDev nació en Buenos Aires con una idea simple: las marcas merecen software hecho con el mismo cuidado con el que construyen su identidad. Veíamos proyectos armados con plantillas, apurados y difíciles de mantener, y quisimos hacer lo contrario.",
                    "Con el tiempo, el trabajo nos llevó a Europa. Hoy acompañamos marcas en Argentina, España y Suiza con la misma forma de trabajar: entender a fondo, diseñar con intención y construir para que dure.",
                ],
            },
            mission: {
                kicker: "Misión",
                text: "Construir productos digitales que hagan *crecer* a las marcas, con el cuidado de un *estudio* y la ingeniería de una empresa de *tecnología.*",
                values: [
                    {
                        title: "Profundidad",
                        text: "Antes de diseñar una pantalla, entendemos el negocio. El nombre DeepDev viene de ahí.",
                    },
                    {
                        title: "Precisión",
                        text: "Cada detalle tiene un motivo: tipografía, movimiento, rendimiento y código.",
                    },
                    {
                        title: "Compromiso",
                        text: "No desaparecemos al entregar: medimos, ajustamos y crecemos con vos.",
                    },
                ],
            },
            why: {
                kicker: "Por qué nosotros",
                title: "Lo que nos hace distintos.",
                items: [
                    {
                        title: "Alta gama de verdad",
                        text: "Diseño de nivel internacional y código escrito a mano, sin plantillas ni atajos.",
                    },
                    {
                        title: "Un solo equipo",
                        text: "Diseño, desarrollo e infraestructura bajo el mismo techo, con un único interlocutor de principio a fin.",
                    },
                    {
                        title: "Tecnología moderna",
                        text: "Trabajamos con stacks actuales y probados, pensados para crecer, y el código es tuyo.",
                    },
                    {
                        title: "Tres husos horarios",
                        text: "Entre Buenos Aires, Madrid y Zúrich cubrimos más de doce horas de trabajo por día.",
                    },
                    {
                        title: "Socios, no proveedores",
                        text: "Nos involucramos en tu producto como si fuera nuestro, antes y después del lanzamiento.",
                    },
                ],
            },
            process: {
                kicker: "Cómo operamos",
                title: "Vamos a fondo, capa por capa.",
                steps: [
                    {
                        title: "Descubrir",
                        text: "Entendemos tu negocio, tus usuarios y tus objetivos. Definimos alcance, plazos y un presupuesto cerrado.",
                    },
                    {
                        title: "Diseñar",
                        text: "Creamos la identidad y la experiencia: prototipos navegables que validás antes de escribir una línea de código.",
                    },
                    {
                        title: "Construir",
                        text: "Desarrollamos con avances visibles en cada etapa, pruebas continuas y comunicación directa con el equipo.",
                    },
                    {
                        title: "Lanzar y cuidar",
                        text: "Publicamos, medimos y acompañamos: mantenimiento, mejoras y la infraestructura para escalar.",
                    },
                ],
            },
            presence: {
                kicker: "Dónde estamos",
                title: "Tres países, un mismo estándar.",
                text: "Operamos desde Argentina, España y Suiza. Estar en tres husos horarios nos permite responder rápido y avanzar mientras otros duermen.",
                offices: [
                    {
                        city: "Buenos Aires",
                        country: "Argentina",
                        role: "Donde nació DeepDev y el corazón de nuestro equipo de ingeniería.",
                    },
                    {
                        city: "Madrid",
                        country: "España",
                        role: "Nuestra base en Europa y el puente con el mercado hispanohablante.",
                    },
                    {
                        city: "Zúrich",
                        country: "Suiza",
                        role: "Cerca de las marcas de la región DACH y de su exigencia de calidad.",
                    },
                ],
            },
            cta: {
                title: "Construyamos algo que dure.",
                primary: "Hablemos de tu proyecto",
                secondary: "Ver qué hacemos",
            },
            aria: {
                process: "Capas que se separan y muestran cada etapa de trabajo",
                presence: "Tres torres conectadas que representan las sedes de DeepDev",
            },
        },
        products: {
            kicker: "Compañía",
            title: "Todo lo que podemos construir con vos.",
            text: "Somos un estudio de producto digital. Diseñamos, desarrollamos y acompañamos cada proyecto de punta a punta, desde la primera idea hasta que crece.",
            indexLabel: "Productos",
            productsKicker: "Qué hacemos",
            products: [
                {
                    name: "Webs y aplicaciones web",
                    tagline: "Tu marca, en su mejor versión online.",
                    text: "Sitios corporativos, e-commerce y plataformas web hechas a medida: rápidas, accesibles y pensadas para convertir visitas en clientes.",
                    points: [
                        "Sitios corporativos y landing pages",
                        "E-commerce con pagos integrados",
                        "Plataformas y paneles a medida",
                    ],
                },
                {
                    name: "Apps iOS y Android",
                    tagline: "En el bolsillo de tus clientes.",
                    text: "Aplicaciones nativas y multiplataforma con la misma calidad en los dos sistemas, publicadas en App Store y Google Play y listas para crecer.",
                    points: [
                        "iOS y Android desde una sola base",
                        "Notificaciones, pagos y mapas",
                        "Publicación en las tiendas",
                    ],
                },
                {
                    name: "Software a medida",
                    tagline: "Hecho para cómo trabaja tu equipo.",
                    text: "Cuando ninguna herramienta encaja, la construimos. Sistemas internos que ordenan procesos, conectan áreas y automatizan lo repetitivo.",
                    points: [
                        "Sistemas de gestión internos",
                        "Integraciones entre plataformas",
                        "Automatización de procesos",
                    ],
                },
                {
                    name: "CRM",
                    tagline: "Cada cliente, en un solo lugar.",
                    text: "Un CRM diseñado alrededor de tu proceso de venta: contactos, oportunidades y seguimiento, con la información que tu equipo necesita para cerrar más.",
                    points: [
                        "Embudo de ventas a tu medida",
                        "Historial y seguimiento de clientes",
                        "Reportes y métricas en tiempo real",
                    ],
                },
                {
                    name: "Mantenimiento y escalamiento",
                    tagline: "Lanzar es el comienzo.",
                    text: "Cuidamos tu producto después del lanzamiento: actualizaciones, seguridad, monitoreo y la infraestructura para que crezca sin frenarse.",
                    points: [
                        "Monitoreo y soporte continuo",
                        "Seguridad y actualizaciones",
                        "Infraestructura que escala con vos",
                    ],
                },
            ],
            rocket: {
                kicker: "La fuerza de un proyecto",
                title: "Cada proyecto es un despegue.",
                text: "Armamos cada pieza con precisión para que, cuando llegue el momento, tu producto despegue con fuerza y siga subiendo.",
                liftoff: "Despegue",
                altitude: "Altitud",
                phases: [
                    {
                        title: "Lanzamiento",
                        text: "Tu producto sale al mundo, probado y listo.",
                    },
                    {
                        title: "Tracción",
                        text: "Llegan los primeros usuarios y medimos todo.",
                    },
                    {
                        title: "Escala",
                        text: "Crecemos la infraestructura junto con tu negocio.",
                    },
                ],
            },
            cta: {
                title: "¿Listo para el despegue?",
                button: "Hablemos de tu proyecto",
            },
            aria: {
                products: "Bloque animado que representa el producto activo",
                rocket: "Cohete de bloques que se arma y despega con el scroll",
            },
        },
        contact: {
            kicker: "Contacto",
            title: "Contanos qué querés construir.",
            text: "Completá el brief y te respondemos desde la sede más cercana con los próximos pasos. Sin formularios eternos: siete datos y listo.",
            mailLabel: "¿Preferís escribirnos directo?",
            fields: {
                name: "Nombre",
                lastName: "Apellido",
                email: "Email",
                country: "País",
                phone: "Teléfono",
                budget: "Presupuesto del proyecto",
                message: "Mensaje",
            },
            placeholders: {
                name: "Tu nombre",
                lastName: "Tu apellido",
                email: "nombre@empresa.com",
                country: "Elegí un país",
                phone: "11 2345 6789",
                message: "Contanos qué querés lograr, para cuándo y qué tenés hoy.",
            },
            budgetNote: "Montos en {currency}: para Argentina cotizamos en dólares y para Europa en euros.",
            upTo: "Hasta {v}",
            from: "Más de {v}",
            errors: {
                required: "Completá este campo.",
                email: "Revisá el email.",
                phone: "Revisá el teléfono.",
                country: "Elegí un país.",
                budget: "Elegí un rango.",
                message: "Contanos un poco más (mínimo 20 caracteres).",
                consent: "Tenés que aceptar para enviar el brief.",
            },
            consent: "Leí y acepto la {privacy} y los {terms}.",
            privacyLink: "política de privacidad",
            termsLink: "términos y condiciones",
            progress: "Tu brief",
            progressOf: "{n} de {total} piezas",
            submit: "Enviar brief",
            sending: "Enviando…",
            successTitle: "Gracias, {name}.",
            successText: "Recibimos tu brief y ya está en manos del equipo. Te escribimos pronto desde la sede más cercana.",
            again: "Enviar otra consulta",
            errorSend: "No pudimos enviar el mensaje. Probá de nuevo o escribinos por mail.",
            privacy: "Usamos tus datos solo para responder esta consulta.",
            aria: "Muro de ladrillos que se arma a medida que completás el formulario",
        },
        session: {
            registerCreatedSent: "Cuenta creada. Te enviamos un mail para verificarla: revisá tu casilla (y spam) antes de ingresar.",
            registerCreatedRateLimited: "Cuenta creada. Ya te enviamos un mail de verificación hace poco: revisá tu casilla (y spam).",
            registerCreated: "Cuenta creada. Al iniciar sesión te vamos a enviar el mail de verificación.",
            registerExists: "Este email ya está registrado. Iniciá sesión o restablecé tu contraseña.",
            registerInvalid: "Revisá el email y la contraseña: mínimo 10 caracteres, una mayúscula, un número y un símbolo.",
            registerTooMany: "Demasiados intentos seguidos. Probá de nuevo en unos minutos.",
            registerError: "No pudimos crear la cuenta. Intentá más tarde.",
            registerLegalRequired: "Para crear la cuenta tenés que aceptar los términos, la privacidad y las cookies.",
            loginTooMany: "Demasiados intentos fallidos. Probá de nuevo en {minutes} min.",
            loginTooManyNoTime: "Demasiados intentos fallidos. Probá de nuevo más tarde.",
            loginBanned: "Esta cuenta está suspendida. Escribinos a contact@deepdevstudio.com.",
            loginNotFound: "No existe ninguna cuenta registrada con ese email.",
            loginNotVerifiedSent: "Tu email todavía no está verificado. Te reenviamos el mail: revisá tu casilla (y spam).",
            loginNotVerifiedRateLimited: "Tu email todavía no está verificado. Ya te enviamos el mail hace poco: revisá tu casilla (y spam) o probá en unos minutos.",
            loginNotVerified: "Tu email todavía no está verificado. Revisá el mail que te enviamos al registrarte.",
            loginInvalid: "Email o contraseña incorrectos.",
            loginInvalidLeft: "Email o contraseña incorrectos. Te quedan {n} intento(s).",
            loginError: "No pudimos iniciar sesión. Intentá más tarde.",
            pinLabel: "Clave de firma",
            pinHint: "Contraseña correcta. Firmá con tu clave de 4 dígitos para entrar.",
            pinChecking: "Verificando la clave…",
            pinWrong: "Clave incorrecta.",
            pinWrongLeft: "Clave incorrecta. Te quedan {n} intento(s).",
            pinLocked: "Demasiados intentos con la clave. Probá de nuevo en {minutes} min.",
            pinLockedNoTime: "Demasiados intentos con la clave. Probá de nuevo más tarde.",
            pinError: "No pudimos verificar la clave. Intentá más tarde.",
            logoutError: "No pudimos cerrar la sesión.",
            resetEmailRequired: "Escribí tu email para restablecer la contraseña.",
            resetSent: "Si el email está registrado, vas a recibir un link para restablecer la contraseña.",
            resetInvalidEmail: "El formato del email no es válido.",
            resetTooMany: "Demasiados intentos. Probá más tarde.",
            resetError: "No pudimos enviar el mail. Intentá más tarde.",
            banConfirm: "¿Seguro que querés suspender a este usuario?",
            unbanConfirm: "¿Seguro que querés reactivar a este usuario?",
        },
        system: {
            errorKicker: "Algo salió mal",
            okKicker: "Listo",
            notFoundKicker: "Error 404",
            notFoundTitle: "Esta página no existe.",
            redirect: "Te llevamos al inicio en {s} s",
            home: "Volver al inicio",
            loading: "Cargando",
        },
        footer: {
            statement: "Hagamos algo que se recuerde.",
            tagline: "Estrategia · Diseño · Ingeniería",
            description: "Construimos marcas y los productos digitales que las llevan a sus clientes: webs, apps, software a medida y automatizaciones.",
            follow: "Seguinos",
            presenceTitle: "Presencia",
            countries: ["Argentina", "España", "Suiza"],
            call: "Llamar",
            localTime: "Hora local",
            email: "Escribinos",
            backTop: "Volver arriba",
            madeIn: "Hecho entre Buenos Aires, Madrid y Zúrich",
            available: "Disponible ahora",
            away: "Fuera de horario",
            yourZone: "Tu zona",
            coverage: "Cuándo encontrarnos, en tu hora",
            now: "Ahora",
            copy: "Copiar",
            copied: "Copiado",
            hours: "Lunes a viernes · 9 a 18 h de cada país",
        },
        aria: {
            hero: "Logo de DeepDev en 3D: dos eslabones que se arman y flotan",
            identity: "Ilustración: sobre una placa se arma un sistema de marca con colores, tipografía, logo, tarjeta y pantalla de celular",
            power: "Ilustración: cuatro módulos se unen, se abren en capas y crecen en una torre",
            global: "Ilustración: tres torres conectadas, una por Argentina, España y Suiza",
        },
    },
    "es-ES": {
        lang: {
            title: "Elige tu idioma",
            detected: "Detectamos que estás en {country}.",
            detectedUnknown: "Elige el idioma con el que quieres navegar.",
            suggested: "Sugerido",
            confirm: "Continuar",
            note: "Puedes cambiarlo cuando quieras desde el menú.",
        },
        hero: {
            eyebrow: "Estudio digital · Argentina · España · Suiza",
            title: ["Marcas que se ven", "tan bien como", "funcionan."],
            text: "Unimos estrategia, diseño e ingeniería en un solo equipo para construir la identidad de tu marca y el producto digital que la lleva a tus clientes.",
            cta: "Hablemos de tu proyecto",
            ctaSecondary: "Cómo trabajamos",
            scroll: "Desliza",
        },
        manifesto: {
            kicker: "Manifiesto",
            text: "La mayoría de las marcas se parecen porque se construyen igual. Nosotros empezamos por entender qué te hace *distinto* y lo convertimos en algo que se puede usar: una identidad *clara,* una experiencia que se siente *tuya* y una tecnología que te *sostiene* mientras creces.",
        },
        identity: {
            kicker: "Identidad de marca",
            title: "Una marca es un sistema, no un logo.",
            steps: [
                { title: "Escuchamos", text: "Antes de diseñar entendemos tu negocio, a tu público y lo que quieres que sientan cuando te ven." },
                { title: "Definimos", text: "Color, tipografía, tono y forma. Cada decisión tiene un motivo y una regla." },
                { title: "Sistematizamos", text: "Convertimos la identidad en piezas reutilizables para que se vea igual en una web, una app o una historia de Instagram." },
                { title: "La llevamos a producto", text: "Tu marca cobra vida donde tus clientes la usan: en cada pantalla, cada botón y cada mensaje." },
            ],
        },
        power: {
            kicker: "Por qué DeepDev",
            title: "Todo el poder de un equipo completo. Sin intermediarios.",
            steps: [
                { title: "Un solo equipo", text: "Estrategia, diseño, desarrollo y automatización trabajan juntos desde el primer día. Nadie se pasa la pelota." },
                { title: "Ingeniería de verdad", text: "Código propio, seguro y medible. Nada de plantillas que se rompen cuando tu negocio crece." },
                { title: "Pensado para escalar", text: "Construimos hoy la base que vas a necesitar mañana, para crecer sin tener que rehacerlo todo." },
                { title: "Socios, no proveedores", text: "Seguimos contigo después del lanzamiento: medimos, ajustamos y mejoramos." },
            ],
        },
        global: {
            kicker: "Presencia",
            title: "Cerca de ti, en tu idioma y en tu horario.",
            text: "Trabajamos con marcas de Argentina, España y Suiza. Entendemos cada mercado y nos organizamos para que tu proyecto avance cada día.",
            cities: ["Buenos Aires", "Madrid", "Zúrich"],
            live: "Hora local",
        },
        stats: {
            kicker: "En cifras",
            items: [
                { value: "3", label: "Países" },
                { value: "1", label: "Equipo de principio a fin" },
                { value: "100%", label: "Código a medida" },
                { value: "24/7", label: "Soporte" },
            ],
        },
        cta: {
            kicker: "Empecemos",
            title: "¿Tienes una idea? Hagámosla marca.",
            text: "Cuéntanos qué quieres construir y te proponemos el primer paso.",
            button: "Empezar un proyecto",
        },
        navbar: {
            home: "Inicio",
            cta: "Empezar proyecto",
            logout: "Cerrar sesión",
            admin: "Administrador",
            themeLight: "Modo claro",
            themeDark: "Modo oscuro",
            menu: "Menú",
            language: "Idioma",
            open: "Abrir menú",
            close: "Cerrar menú",
            regions: "Argentina · España · Suiza",
            startTitle: "¿Tienes una idea?",
            lab: "Laboratorio",
        },
        lab: {
            kicker: "Lab",
            title: "Donde probamos lo que todavía no existe.",
            text: "Experimentos, demos y prototipos hechos sin cliente de por medio. Es nuestro taller: aquí ponemos a prueba el motor gráfico, la física y las ideas que después llegan a los productos.",
            hint: "Abre cualquier experimento y juega con él.",
            madeWith: "Hecho con",
            open: "Abrir",
            close: "Cerrar",
            reset: "Reiniciar",
            experiments: [
                {
                    name: "Gravedad",
                    text: "Una placa de encaje y piezas que caen con física real. Cambia la gravedad y el rebote, y mira cómo se apilan.",
                    hint: "Toca la escena para soltar piezas.",
                    tech: [
                        "Canvas 2D",
                        "TypeScript",
                        "Física propia",
                    ],
                },
                {
                    name: "Eslabones",
                    text: "Nuestro logo extruido en tiempo real. Gíralo, cámbiale la profundidad y separa los dos eslabones.",
                    hint: "Arrastra para girarlo.",
                    tech: [
                        "Canvas 2D",
                        "Extrusión en tiempo real",
                        "Resortes",
                    ],
                },
                {
                    name: "Escribe y construye",
                    text: "Cada letra que escribes es un ladrillo nuevo en el muro. Bórrala y se va.",
                    hint: "Escribe hasta 16 letras.",
                    tech: [
                        "Canvas 2D",
                        "React",
                        "Física propia",
                    ],
                },
                {
                    name: "Microinteracciones",
                    text: "Las animaciones de los botones de la web: letras en ola, líneas que se dibujan y flechas que se redibujan.",
                    hint: "Pasa el cursor o toca cada botón.",
                    tech: [
                        "CSS",
                        "Framer Motion",
                        "SVG",
                    ],
                },
                {
                    name: "Torre",
                    text: "Un bloque va y viene sobre la torre. Suéltalo en el momento justo: lo que sobresale se corta y se cae. Si lo clavas, sumas racha.",
                    hint: "Toca la escena o pulsa espacio para soltar.",
                    tech: ["Canvas 2D", "Física propia", "TypeScript"],
                },
                {
                    name: "Ondas",
                    text: "Un campo de columnas que se comporta como agua. Cada toque es una gota: las ondas se cruzan, rebotan en los bordes y se calman.",
                    hint: "Toca cualquier columna.",
                    tech: ["Canvas 2D", "Ecuación de onda", "Física propia"],
                },
                {
                    name: "Laberinto",
                    text: "Inclinas la placa y la bola rueda con inercia hasta la salida azul. Cada laberinto es nuevo y se genera al instante.",
                    hint: "Mantén pulsado hacia donde quieres inclinar, o usa las flechas.",
                    tech: ["Canvas 2D", "Generación procedural", "Colisiones"],
                },
                {
                    name: "Secuencia",
                    text: "Cuatro bloques se encienden en orden. Repite la secuencia: cada ronda suma un paso más.",
                    hint: "Toca los bloques o usa las teclas 1 a 4.",
                    tech: ["Canvas 2D", "Web Audio", "React"],
                },
            ],
            controls: {
                gravity: "Gravedad",
                bounce: "Rebote",
                drop: "Soltar pieza",
                depth: "Profundidad",
                split: "Separar",
                join: "Unir",
                placeholder: "Escribe algo",
                samples: [
                    "Empezar proyecto",
                    "Ver casos",
                    "Escríbenos",
                    "Conoce al equipo",
                ],
                height: "Altura",
                best: "Récord",
                level: "Nivel",
                time: "Tiempo",
                place: "Soltar bloque",
                speed: "Velocidad",
                damping: "Calma",
                rainOn: "Parar la lluvia",
                rainOff: "Que llueva",
                calm: "Calmar el agua",
                newMaze: "Otro laberinto",
                start: "Empezar",
                soundOn: "Sonido: sí",
                soundOff: "Sonido: no",
                status: {
                    towerReady: "Suelta el primer bloque.",
                    towerPlay: "",
                    towerPerfect: "¡Exacto! Sigue la racha.",
                    towerOver: "Se acabó la torre. Toca para empezar otra.",
                    mazePlay: "",
                    mazeWin: "¡Salida! Ya viene otro laberinto.",
                    simonIdle: "Pulsa Empezar o cualquier bloque.",
                    simonWatch: "Mira la secuencia…",
                    simonTurn: "Tu turno.",
                    simonFail: "Te has equivocado. Pulsa Empezar para otra.",
                },
            },
            stack: {
                kicker: "Stack",
                title: "Las herramientas detrás de cada proyecto.",
                layers: [
                    {
                        name: "Frontend",
                        tools: [
                            "React",
                            "TypeScript",
                            "Vite",
                            "Framer Motion",
                        ],
                        text: "Interfaces rápidas y tipadas, con animaciones fluidas sin perder rendimiento.",
                    },
                    {
                        name: "Backend",
                        tools: [
                            "Node.js",
                            "Express",
                            "MongoDB",
                        ],
                        text: "APIs propias, flexibles y fáciles de escalar a medida que crece el producto.",
                    },
                    {
                        name: "Servicios",
                        tools: [
                            "Firebase Auth",
                            "Stripe",
                            "MercadoPago",
                            "Brevo",
                            "Cloudinary",
                        ],
                        text: "Autenticación, pagos, correo e imágenes con plataformas probadas: no reinventamos lo que ya funciona.",
                    },
                    {
                        name: "Infraestructura",
                        tools: [
                            "Render",
                            "Cloudflare",
                        ],
                        text: "Despliegues automáticos, DNS y protección en el borde para que todo esté siempre en línea.",
                    },
                ],
            },
            cta: {
                title: "¿Quieres esto en tu producto?",
                button: "Hablemos de tu proyecto",
            },
            aria: {
                hero: "Campo de bloques que ondula",
                stack: "Torre de capas con las herramientas que usamos",
                experiment: "Experimento interactivo",
            },
        },
        about: {
            kicker: "Sobre DeepDev",
            title: "Un estudio de desarrollo de alta gama.",
            text: "Diseñamos y desarrollamos productos digitales para marcas que no se conforman con lo de siempre. Un equipo que diseña y programa con obsesión por el detalle, trabajando desde tres países.",
            facts: [
                {
                    label: "Estudio",
                    value: "Desarrollo de alta gama",
                },
                {
                    label: "Presencia",
                    value: "Argentina · España · Suiza",
                },
                {
                    label: "Modelo",
                    value: "Diseño e ingeniería en un solo equipo",
                },
            ],
            origin: {
                kicker: "Origen",
                title: "Nacimos para hacer las cosas bien, no rápido.",
                paragraphs: [
                    "DeepDev nació en Buenos Aires con una idea sencilla: las marcas merecen software hecho con el mismo cuidado con el que construyen su identidad. Veíamos proyectos montados con plantillas, con prisas y difíciles de mantener, y quisimos hacer lo contrario.",
                    "Con el tiempo, el trabajo nos llevó a Europa. Hoy acompañamos a marcas en Argentina, España y Suiza con la misma forma de trabajar: entender a fondo, diseñar con intención y construir para que dure.",
                ],
            },
            mission: {
                kicker: "Misión",
                text: "Construir productos digitales que hagan *crecer* a las marcas, con el cuidado de un *estudio* y la ingeniería de una empresa de *tecnología.*",
                values: [
                    {
                        title: "Profundidad",
                        text: "Antes de diseñar una pantalla, entendemos el negocio. El nombre DeepDev viene de ahí.",
                    },
                    {
                        title: "Precisión",
                        text: "Cada detalle tiene un motivo: tipografía, movimiento, rendimiento y código.",
                    },
                    {
                        title: "Compromiso",
                        text: "No desaparecemos al entregar: medimos, ajustamos y crecemos contigo.",
                    },
                ],
            },
            why: {
                kicker: "Por qué nosotros",
                title: "Lo que nos hace diferentes.",
                items: [
                    {
                        title: "Alta gama de verdad",
                        text: "Diseño de nivel internacional y código escrito a mano, sin plantillas ni atajos.",
                    },
                    {
                        title: "Un solo equipo",
                        text: "Diseño, desarrollo e infraestructura bajo el mismo techo, con un único interlocutor de principio a fin.",
                    },
                    {
                        title: "Tecnología moderna",
                        text: "Trabajamos con stacks actuales y probados, pensados para crecer, y el código es tuyo.",
                    },
                    {
                        title: "Tres husos horarios",
                        text: "Entre Buenos Aires, Madrid y Zúrich cubrimos más de doce horas de trabajo al día.",
                    },
                    {
                        title: "Socios, no proveedores",
                        text: "Nos implicamos en tu producto como si fuera nuestro, antes y después del lanzamiento.",
                    },
                ],
            },
            process: {
                kicker: "Cómo trabajamos",
                title: "Vamos a fondo, capa por capa.",
                steps: [
                    {
                        title: "Descubrir",
                        text: "Entendemos tu negocio, tus usuarios y tus objetivos. Definimos alcance, plazos y un presupuesto cerrado.",
                    },
                    {
                        title: "Diseñar",
                        text: "Creamos la identidad y la experiencia: prototipos navegables que validas antes de escribir una línea de código.",
                    },
                    {
                        title: "Construir",
                        text: "Desarrollamos con avances visibles en cada etapa, pruebas continuas y comunicación directa con el equipo.",
                    },
                    {
                        title: "Lanzar y cuidar",
                        text: "Publicamos, medimos y acompañamos: mantenimiento, mejoras y la infraestructura para escalar.",
                    },
                ],
            },
            presence: {
                kicker: "Dónde estamos",
                title: "Tres países, un mismo estándar.",
                text: "Operamos desde Argentina, España y Suiza. Estar en tres husos horarios nos permite responder rápido y avanzar mientras otros duermen.",
                offices: [
                    {
                        city: "Buenos Aires",
                        country: "Argentina",
                        role: "Donde nació DeepDev y el corazón de nuestro equipo de ingeniería.",
                    },
                    {
                        city: "Madrid",
                        country: "España",
                        role: "Nuestra base en Europa y el puente con el mercado hispanohablante.",
                    },
                    {
                        city: "Zúrich",
                        country: "Suiza",
                        role: "Cerca de las marcas de la región DACH y de su exigencia de calidad.",
                    },
                ],
            },
            cta: {
                title: "Construyamos algo que dure.",
                primary: "Hablemos de tu proyecto",
                secondary: "Ver qué hacemos",
            },
            aria: {
                process: "Capas que se separan y muestran cada etapa de trabajo",
                presence: "Tres torres conectadas que representan las sedes de DeepDev",
            },
        },
        products: {
            kicker: "Compañía",
            title: "Todo lo que podemos construir contigo.",
            text: "Somos un estudio de producto digital. Diseñamos, desarrollamos y acompañamos cada proyecto de principio a fin, desde la primera idea hasta que crece.",
            indexLabel: "Productos",
            productsKicker: "Qué hacemos",
            products: [
                {
                    name: "Webs y aplicaciones web",
                    tagline: "Tu marca, en su mejor versión online.",
                    text: "Webs corporativas, e-commerce y plataformas web a medida: rápidas, accesibles y pensadas para convertir visitas en clientes.",
                    points: [
                        "Webs corporativas y landing pages",
                        "E-commerce con pagos integrados",
                        "Plataformas y paneles a medida",
                    ],
                },
                {
                    name: "Apps iOS y Android",
                    tagline: "En el bolsillo de tus clientes.",
                    text: "Aplicaciones nativas y multiplataforma con la misma calidad en los dos sistemas, publicadas en App Store y Google Play y listas para crecer.",
                    points: [
                        "iOS y Android desde una sola base",
                        "Notificaciones, pagos y mapas",
                        "Publicación en las tiendas",
                    ],
                },
                {
                    name: "Software a medida",
                    tagline: "Hecho para cómo trabaja tu equipo.",
                    text: "Cuando ninguna herramienta encaja, la construimos. Sistemas internos que ordenan procesos, conectan áreas y automatizan lo repetitivo.",
                    points: [
                        "Sistemas de gestión internos",
                        "Integraciones entre plataformas",
                        "Automatización de procesos",
                    ],
                },
                {
                    name: "CRM",
                    tagline: "Cada cliente, en un solo lugar.",
                    text: "Un CRM diseñado alrededor de tu proceso de venta: contactos, oportunidades y seguimiento, con la información que tu equipo necesita para cerrar más.",
                    points: [
                        "Embudo de ventas a tu medida",
                        "Historial y seguimiento de clientes",
                        "Informes y métricas en tiempo real",
                    ],
                },
                {
                    name: "Mantenimiento y escalado",
                    tagline: "Lanzar es solo el comienzo.",
                    text: "Cuidamos tu producto después del lanzamiento: actualizaciones, seguridad, monitorización y la infraestructura para que crezca sin frenarse.",
                    points: [
                        "Monitorización y soporte continuo",
                        "Seguridad y actualizaciones",
                        "Infraestructura que escala contigo",
                    ],
                },
            ],
            rocket: {
                kicker: "La fuerza de un proyecto",
                title: "Cada proyecto es un despegue.",
                text: "Montamos cada pieza con precisión para que, cuando llegue el momento, tu producto despegue con fuerza y siga subiendo.",
                liftoff: "Despegue",
                altitude: "Altitud",
                phases: [
                    {
                        title: "Lanzamiento",
                        text: "Tu producto sale al mundo, probado y listo.",
                    },
                    {
                        title: "Tracción",
                        text: "Llegan los primeros usuarios y lo medimos todo.",
                    },
                    {
                        title: "Escala",
                        text: "Hacemos crecer la infraestructura junto con tu negocio.",
                    },
                ],
            },
            cta: {
                title: "¿Listo para el despegue?",
                button: "Hablemos de tu proyecto",
            },
            aria: {
                products: "Bloque animado que representa el producto activo",
                rocket: "Cohete de bloques que se monta y despega con el scroll",
            },
        },
        contact: {
            kicker: "Contacto",
            title: "Cuéntanos qué quieres construir.",
            text: "Completa el brief y te respondemos desde la sede más cercana con los próximos pasos. Sin formularios eternos: siete datos y listo.",
            mailLabel: "¿Prefieres escribirnos directamente?",
            fields: {
                name: "Nombre",
                lastName: "Apellidos",
                email: "Email",
                country: "País",
                phone: "Teléfono",
                budget: "Presupuesto del proyecto",
                message: "Mensaje",
            },
            placeholders: {
                name: "Tu nombre",
                lastName: "Tus apellidos",
                email: "nombre@empresa.com",
                country: "Elige un país",
                phone: "612 34 56 78",
                message: "Cuéntanos qué quieres conseguir, para cuándo y qué tienes hoy.",
            },
            budgetNote: "Importes en {currency}: para Argentina presupuestamos en dólares y para Europa en euros.",
            upTo: "Hasta {v}",
            from: "Más de {v}",
            errors: {
                required: "Rellena este campo.",
                email: "Revisa el email.",
                phone: "Revisa el teléfono.",
                country: "Elige un país.",
                budget: "Elige un rango.",
                message: "Cuéntanos un poco más (mínimo 20 caracteres).",
                consent: "Debes aceptarlos para enviar el brief.",
            },
            consent: "He leído y acepto la {privacy} y los {terms}.",
            privacyLink: "política de privacidad",
            termsLink: "términos y condiciones",
            progress: "Tu brief",
            progressOf: "{n} de {total} piezas",
            submit: "Enviar brief",
            sending: "Enviando…",
            successTitle: "Gracias, {name}.",
            successText: "Hemos recibido tu brief y ya está en manos del equipo. Te escribiremos pronto desde la sede más cercana.",
            again: "Enviar otra consulta",
            errorSend: "No hemos podido enviar el mensaje. Inténtalo de nuevo o escríbenos por email.",
            privacy: "Usamos tus datos solo para responder a esta consulta.",
            aria: "Muro de ladrillos que se construye a medida que completas el formulario",
        },
        session: {
            registerCreatedSent: "Cuenta creada. Te hemos enviado un email para verificarla: revisa tu bandeja (y spam) antes de acceder.",
            registerCreatedRateLimited: "Cuenta creada. Ya te enviamos un email de verificación hace poco: revisa tu bandeja (y spam).",
            registerCreated: "Cuenta creada. Al iniciar sesión te enviaremos el email de verificación.",
            registerExists: "Este email ya está registrado. Inicia sesión o restablece tu contraseña.",
            registerInvalid: "Revisa el email y la contraseña: mínimo 10 caracteres, una mayúscula, un número y un símbolo.",
            registerTooMany: "Demasiados intentos seguidos. Prueba de nuevo en unos minutos.",
            registerError: "No hemos podido crear la cuenta. Inténtalo más tarde.",
            registerLegalRequired: "Para crear la cuenta tienes que aceptar los términos, la privacidad y las cookies.",
            loginTooMany: "Demasiados intentos fallidos. Prueba de nuevo en {minutes} min.",
            loginTooManyNoTime: "Demasiados intentos fallidos. Prueba de nuevo más tarde.",
            loginBanned: "Esta cuenta está suspendida. Escríbenos a contact@deepdevstudio.com.",
            loginNotFound: "No existe ninguna cuenta registrada con ese email.",
            loginNotVerifiedSent: "Tu email aún no está verificado. Te hemos reenviado el email: revisa tu bandeja (y spam).",
            loginNotVerifiedRateLimited: "Tu email aún no está verificado. Ya te enviamos el email hace poco: revisa tu bandeja (y spam) o prueba en unos minutos.",
            loginNotVerified: "Tu email aún no está verificado. Revisa el email que te enviamos al registrarte.",
            loginInvalid: "Email o contraseña incorrectos.",
            loginInvalidLeft: "Email o contraseña incorrectos. Te quedan {n} intento(s).",
            loginError: "No hemos podido iniciar sesión. Inténtalo más tarde.",
            pinLabel: "Clave de firma",
            pinHint: "Contraseña correcta. Firma con tu clave de 4 dígitos para acceder.",
            pinChecking: "Verificando la clave…",
            pinWrong: "Clave incorrecta.",
            pinWrongLeft: "Clave incorrecta. Te quedan {n} intento(s).",
            pinLocked: "Demasiados intentos con la clave. Prueba de nuevo en {minutes} min.",
            pinLockedNoTime: "Demasiados intentos con la clave. Prueba de nuevo más tarde.",
            pinError: "No hemos podido verificar la clave. Inténtalo más tarde.",
            logoutError: "No hemos podido cerrar la sesión.",
            resetEmailRequired: "Escribe tu email para restablecer la contraseña.",
            resetSent: "Si el email está registrado, recibirás un enlace para restablecer la contraseña.",
            resetInvalidEmail: "El formato del email no es válido.",
            resetTooMany: "Demasiados intentos. Prueba más tarde.",
            resetError: "No hemos podido enviar el email. Inténtalo más tarde.",
            banConfirm: "¿Seguro que quieres suspender a este usuario?",
            unbanConfirm: "¿Seguro que quieres reactivar a este usuario?",
        },
        system: {
            errorKicker: "Algo ha fallado",
            okKicker: "Listo",
            notFoundKicker: "Error 404",
            notFoundTitle: "Esta página no existe.",
            redirect: "Te llevamos al inicio en {s} s",
            home: "Volver al inicio",
            loading: "Cargando",
        },
        footer: {
            statement: "Hagamos algo que se recuerde.",
            tagline: "Estrategia · Diseño · Ingeniería",
            description: "Construimos marcas y los productos digitales que las llevan a sus clientes: webs, apps, software a medida y automatizaciones.",
            follow: "Síguenos",
            presenceTitle: "Presencia",
            countries: ["Argentina", "España", "Suiza"],
            call: "Llamar",
            localTime: "Hora local",
            email: "Escríbenos",
            backTop: "Volver arriba",
            madeIn: "Hecho entre Buenos Aires, Madrid y Zúrich",
            available: "Disponible ahora",
            away: "Fuera de horario",
            yourZone: "Tu zona",
            coverage: "Cuándo encontrarnos, en tu hora",
            now: "Ahora",
            copy: "Copiar",
            copied: "Copiado",
            hours: "Lunes a viernes · 9 a 18 h de cada país",
        },
        aria: {
            hero: "Logo de DeepDev en 3D: dos eslabones que se montan y flotan",
            identity: "Ilustración: sobre una placa se monta un sistema de marca con colores, tipografía, logo, tarjeta y pantalla de móvil",
            power: "Ilustración: cuatro módulos se unen, se abren en capas y crecen en una torre",
            global: "Ilustración: tres torres conectadas, una por Argentina, España y Suiza",
        },
    },
    "de-CH": {
        lang: {
            title: "Sprache wählen",
            detected: "Erkannter Standort: {country}",
            detectedUnknown: "Wählen Sie die Sprache, in der Sie die Seite sehen möchten.",
            suggested: "Empfohlen",
            confirm: "Weiter",
            note: "Sie können die Sprache jederzeit im Menü ändern.",
        },
        hero: {
            eyebrow: "Digitalstudio · Argentinien · Spanien · Schweiz",
            title: ["Marken, die so gut", "aussehen, wie sie", "funktionieren."],
            text: "Wir vereinen Strategie, Design und Engineering in einem Team – für Ihre Markenidentität und das digitale Produkt, das sie zu Ihren Kundinnen und Kunden bringt.",
            cta: "Projekt besprechen",
            ctaSecondary: "So arbeiten wir",
            scroll: "Scrollen",
        },
        manifesto: {
            kicker: "Manifest",
            text: "Die meisten Marken ähneln sich, weil sie gleich gebaut werden. Wir beginnen damit, zu verstehen, was Sie *unverwechselbar* macht, und machen daraus etwas Greifbares: eine *klare* Identität, ein Erlebnis, das sich nach *Ihnen* anfühlt, und eine Technologie, die Ihr Wachstum *trägt.*",
        },
        identity: {
            kicker: "Markenidentität",
            title: "Eine Marke ist ein System, kein Logo.",
            steps: [
                { title: "Zuhören", text: "Bevor wir gestalten, verstehen wir Ihr Geschäft, Ihr Publikum und das Gefühl, das Ihre Marke auslösen soll." },
                { title: "Definieren", text: "Farbe, Typografie, Tonalität und Form. Jede Entscheidung hat einen Grund und eine Regel." },
                { title: "Systematisieren", text: "Wir übersetzen die Identität in wiederverwendbare Bausteine, damit sie auf der Website, in der App und auf Instagram gleich wirkt." },
                { title: "Ins Produkt bringen", text: "Ihre Marke wird dort lebendig, wo Ihre Kundschaft sie nutzt: auf jedem Screen, in jedem Button, in jeder Nachricht." },
            ],
        },
        power: {
            kicker: "Warum DeepDev",
            title: "Die ganze Kraft eines kompletten Teams. Ohne Umwege.",
            steps: [
                { title: "Ein Team", text: "Strategie, Design, Entwicklung und Automatisierung arbeiten vom ersten Tag an zusammen. Niemand schiebt Verantwortung weiter." },
                { title: "Echtes Engineering", text: "Eigener Code, sicher und messbar. Keine Vorlagen, die brechen, sobald Ihr Unternehmen wächst." },
                { title: "Gebaut zum Skalieren", text: "Wir bauen heute das Fundament, das Sie morgen brauchen – damit Sie wachsen, ohne alles neu zu machen." },
                { title: "Partner statt Lieferant", text: "Wir bleiben nach dem Launch an Ihrer Seite: messen, anpassen, verbessern." },
            ],
        },
        global: {
            kicker: "Präsenz",
            title: "Nah bei Ihnen. In Ihrer Sprache und Ihrer Zeitzone.",
            text: "Wir arbeiten mit Marken in Argentinien, Spanien und der Schweiz. Wir kennen jeden Markt und organisieren uns so, dass Ihr Projekt jeden Tag vorankommt.",
            cities: ["Buenos Aires", "Madrid", "Zürich"],
            live: "Ortszeit",
        },
        stats: {
            kicker: "In Zahlen",
            items: [
                { value: "3", label: "Länder" },
                { value: "1", label: "Team von A bis Z" },
                { value: "100%", label: "Massgeschneiderter Code" },
                { value: "24/7", label: "Support" },
            ],
        },
        cta: {
            kicker: "Los geht’s",
            title: "Sie haben eine Idee? Machen wir eine Marke daraus.",
            text: "Erzählen Sie uns, was Sie bauen möchten – wir schlagen Ihnen den ersten Schritt vor.",
            button: "Projekt starten",
        },
        navbar: {
            home: "Start",
            cta: "Projekt starten",
            logout: "Abmelden",
            admin: "Administration",
            themeLight: "Heller Modus",
            themeDark: "Dunkler Modus",
            menu: "Menü",
            language: "Sprache",
            open: "Menü öffnen",
            close: "Menü schliessen",
            regions: "Argentinien · Spanien · Schweiz",
            startTitle: "Sie haben eine Idee?",
            lab: "Labor",
        },
        lab: {
            kicker: "Lab",
            title: "Wo wir testen, was es noch nicht gibt.",
            text: "Experimente, Demos und Prototypen ohne Kundenauftrag. Das ist unsere Werkstatt: Hier testen wir die Grafik-Engine, die Physik und die Ideen, die später in Produkte einfliessen.",
            hint: "Öffnen Sie ein Experiment und probieren Sie es aus.",
            madeWith: "Gebaut mit",
            open: "Öffnen",
            close: "Schliessen",
            reset: "Zurücksetzen",
            experiments: [
                {
                    name: "Schwerkraft",
                    text: "Eine Bauplatte und Steine, die mit echter Physik fallen. Ändern Sie Schwerkraft und Abprall und sehen Sie zu, wie sie sich stapeln.",
                    hint: "Tippen Sie auf die Szene, um Steine fallen zu lassen.",
                    tech: [
                        "Canvas 2D",
                        "TypeScript",
                        "Eigene Physik",
                    ],
                },
                {
                    name: "Kettenglieder",
                    text: "Unser Logo, in Echtzeit extrudiert. Drehen Sie es, ändern Sie die Tiefe und trennen Sie die beiden Glieder.",
                    hint: "Ziehen, um es zu drehen.",
                    tech: [
                        "Canvas 2D",
                        "Echtzeit-Extrusion",
                        "Federn",
                    ],
                },
                {
                    name: "Schreiben und bauen",
                    text: "Jeder Buchstabe, den Sie tippen, wird ein neuer Stein in der Mauer. Löschen Sie ihn, und er verschwindet.",
                    hint: "Bis zu 16 Buchstaben.",
                    tech: [
                        "Canvas 2D",
                        "React",
                        "Eigene Physik",
                    ],
                },
                {
                    name: "Mikrointeraktionen",
                    text: "Die Animationen der Buttons dieser Website: Buchstaben in Wellen, Linien, die sich zeichnen, und Pfeile, die sich neu zeichnen.",
                    hint: "Mit der Maus darüberfahren oder antippen.",
                    tech: [
                        "CSS",
                        "Framer Motion",
                        "SVG",
                    ],
                },
                {
                    name: "Turm",
                    text: "Ein Block gleitet über dem Turm hin und her. Lassen Sie ihn im richtigen Moment fallen: Was übersteht, wird abgeschnitten und fällt. Treffen Sie genau, wächst die Serie.",
                    hint: "Tippen Sie auf die Szene oder drücken Sie die Leertaste.",
                    tech: ["Canvas 2D", "Eigene Physik", "TypeScript"],
                },
                {
                    name: "Wellen",
                    text: "Ein Feld aus Säulen, das sich wie Wasser verhält. Jede Berührung ist ein Tropfen: Die Wellen kreuzen sich, prallen an den Rändern ab und beruhigen sich.",
                    hint: "Tippen Sie auf eine beliebige Säule.",
                    tech: ["Canvas 2D", "Wellengleichung", "Eigene Physik"],
                },
                {
                    name: "Labyrinth",
                    text: "Sie neigen die Platte, und die Kugel rollt mit Schwung zum blauen Ausgang. Jedes Labyrinth ist neu und entsteht sofort.",
                    hint: "Gedrückt halten in die gewünschte Richtung oder die Pfeiltasten nutzen.",
                    tech: ["Canvas 2D", "Prozedurale Generierung", "Kollisionen"],
                },
                {
                    name: "Sequenz",
                    text: "Vier Blöcke leuchten der Reihe nach auf. Wiederholen Sie die Folge: Jede Runde kommt ein Schritt dazu.",
                    hint: "Tippen Sie auf die Blöcke oder nutzen Sie die Tasten 1 bis 4.",
                    tech: ["Canvas 2D", "Web Audio", "React"],
                },
            ],
            controls: {
                gravity: "Schwerkraft",
                bounce: "Abprall",
                drop: "Stein fallen lassen",
                depth: "Tiefe",
                split: "Trennen",
                join: "Verbinden",
                placeholder: "Etwas schreiben",
                samples: [
                    "Projekt starten",
                    "Fälle ansehen",
                    "Schreiben Sie uns",
                    "Das Team",
                ],
                height: "Höhe",
                best: "Rekord",
                level: "Level",
                time: "Zeit",
                place: "Block fallen lassen",
                speed: "Tempo",
                damping: "Ruhe",
                rainOn: "Regen stoppen",
                rainOff: "Regen starten",
                calm: "Wasser beruhigen",
                newMaze: "Neues Labyrinth",
                start: "Starten",
                soundOn: "Ton: an",
                soundOff: "Ton: aus",
                status: {
                    towerReady: "Lassen Sie den ersten Block fallen.",
                    towerPlay: "",
                    towerPerfect: "Genau! Weiter so.",
                    towerOver: "Der Turm ist zu Ende. Tippen Sie für einen neuen.",
                    mazePlay: "",
                    mazeWin: "Ausgang erreicht! Das nächste Labyrinth kommt.",
                    simonIdle: "Tippen Sie auf Starten oder einen Block.",
                    simonWatch: "Schauen Sie sich die Folge an …",
                    simonTurn: "Sie sind dran.",
                    simonFail: "Daneben. Tippen Sie auf Starten für eine neue Runde.",
                },
            },
            stack: {
                kicker: "Stack",
                title: "Die Werkzeuge hinter jedem Projekt.",
                layers: [
                    {
                        name: "Frontend",
                        tools: [
                            "React",
                            "TypeScript",
                            "Vite",
                            "Framer Motion",
                        ],
                        text: "Schnelle, typisierte Oberflächen mit flüssigen Animationen – ohne Leistungseinbussen.",
                    },
                    {
                        name: "Backend",
                        tools: [
                            "Node.js",
                            "Express",
                            "MongoDB",
                        ],
                        text: "Eigene APIs, flexibel und leicht skalierbar, während das Produkt wächst.",
                    },
                    {
                        name: "Dienste",
                        tools: [
                            "Firebase Auth",
                            "Stripe",
                            "MercadoPago",
                            "Brevo",
                            "Cloudinary",
                        ],
                        text: "Authentifizierung, Zahlungen, E-Mail und Bilder mit bewährten Plattformen: Wir erfinden nicht neu, was funktioniert.",
                    },
                    {
                        name: "Infrastruktur",
                        tools: [
                            "Render",
                            "Cloudflare",
                        ],
                        text: "Automatische Deployments, DNS und Schutz am Netzwerkrand, damit alles immer online ist.",
                    },
                ],
            },
            cta: {
                title: "Möchten Sie das in Ihrem Produkt?",
                button: "Sprechen wir über Ihr Projekt",
            },
            aria: {
                hero: "Feld aus Bausteinen, das sich wellt",
                stack: "Turm aus Schichten mit unseren Werkzeugen",
                experiment: "Interaktives Experiment",
            },
        },
        about: {
            kicker: "Über DeepDev",
            title: "Ein Entwicklungsstudio der Spitzenklasse.",
            text: "Wir gestalten und entwickeln digitale Produkte für Marken, die sich nicht mit dem Üblichen zufriedengeben. Ein Team, das mit Liebe zum Detail gestaltet und programmiert – aus drei Ländern.",
            facts: [
                {
                    label: "Studio",
                    value: "Entwicklung der Spitzenklasse",
                },
                {
                    label: "Präsenz",
                    value: "Argentinien · Spanien · Schweiz",
                },
                {
                    label: "Modell",
                    value: "Design und Engineering in einem Team",
                },
            ],
            origin: {
                kicker: "Ursprung",
                title: "Gegründet, um Dinge richtig zu machen – nicht schnell.",
                paragraphs: [
                    "DeepDev entstand in Buenos Aires aus einer einfachen Idee: Marken verdienen Software, die mit derselben Sorgfalt gebaut wird wie ihre Identität. Wir sahen Projekte aus Vorlagen, unter Zeitdruck und schwer wartbar – und wollten das Gegenteil.",
                    "Mit der Zeit führte uns die Arbeit nach Europa. Heute begleiten wir Marken in Argentinien, Spanien und der Schweiz – mit derselben Arbeitsweise: gründlich verstehen, bewusst gestalten und für die Dauer bauen.",
                ],
            },
            mission: {
                kicker: "Mission",
                text: "Digitale Produkte bauen, die Marken *wachsen* lassen – mit der Sorgfalt eines *Studios* und dem Engineering eines *Technologieunternehmens.*",
                values: [
                    {
                        title: "Tiefe",
                        text: "Bevor wir einen Screen gestalten, verstehen wir das Geschäft. Daher kommt der Name DeepDev.",
                    },
                    {
                        title: "Präzision",
                        text: "Jedes Detail hat einen Grund: Typografie, Bewegung, Performance und Code.",
                    },
                    {
                        title: "Verbindlichkeit",
                        text: "Nach der Übergabe sind wir nicht weg: Wir messen, verbessern und wachsen mit Ihnen.",
                    },
                ],
            },
            why: {
                kicker: "Warum wir",
                title: "Was uns unterscheidet.",
                items: [
                    {
                        title: "Echte Spitzenklasse",
                        text: "Design auf internationalem Niveau und handgeschriebener Code, ohne Vorlagen und Abkürzungen.",
                    },
                    {
                        title: "Ein Team",
                        text: "Design, Entwicklung und Infrastruktur unter einem Dach – mit einer Ansprechperson von Anfang bis Ende.",
                    },
                    {
                        title: "Moderne Technologie",
                        text: "Wir arbeiten mit aktuellen, bewährten Stacks, die mitwachsen – und der Code gehört Ihnen.",
                    },
                    {
                        title: "Drei Zeitzonen",
                        text: "Zwischen Buenos Aires, Madrid und Zürich decken wir mehr als zwölf Arbeitsstunden pro Tag ab.",
                    },
                    {
                        title: "Partner, nicht Lieferanten",
                        text: "Wir kümmern uns um Ihr Produkt, als wäre es unseres – vor und nach dem Launch.",
                    },
                ],
            },
            process: {
                kicker: "So arbeiten wir",
                title: "Wir gehen in die Tiefe, Schicht für Schicht.",
                steps: [
                    {
                        title: "Verstehen",
                        text: "Wir verstehen Ihr Geschäft, Ihre Nutzer und Ihre Ziele. Wir definieren Umfang, Termine und ein festes Budget.",
                    },
                    {
                        title: "Gestalten",
                        text: "Wir entwickeln Identität und Erlebnis: klickbare Prototypen, die Sie freigeben, bevor eine Zeile Code entsteht.",
                    },
                    {
                        title: "Bauen",
                        text: "Wir entwickeln mit sichtbaren Fortschritten in jeder Phase, laufenden Tests und direktem Draht zum Team.",
                    },
                    {
                        title: "Launchen und betreuen",
                        text: "Wir veröffentlichen, messen und begleiten: Wartung, Verbesserungen und die Infrastruktur zum Skalieren.",
                    },
                ],
            },
            presence: {
                kicker: "Wo wir sind",
                title: "Drei Länder, ein Standard.",
                text: "Wir arbeiten aus Argentinien, Spanien und der Schweiz. Drei Zeitzonen erlauben uns, schnell zu antworten und weiterzukommen, während andere schlafen.",
                offices: [
                    {
                        city: "Buenos Aires",
                        country: "Argentinien",
                        role: "Hier entstand DeepDev – das Herz unseres Engineering-Teams.",
                    },
                    {
                        city: "Madrid",
                        country: "Spanien",
                        role: "Unsere Basis in Europa und die Brücke zum spanischsprachigen Markt.",
                    },
                    {
                        city: "Zürich",
                        country: "Schweiz",
                        role: "Nah an den Marken der DACH-Region und ihrem Anspruch an Qualität.",
                    },
                ],
            },
            cta: {
                title: "Bauen wir etwas, das bleibt.",
                primary: "Sprechen wir über Ihr Projekt",
                secondary: "Was wir machen",
            },
            aria: {
                process: "Schichten, die sich trennen und jede Arbeitsphase zeigen",
                presence: "Drei verbundene Türme, die die Standorte von DeepDev darstellen",
            },
        },
        products: {
            kicker: "Unternehmen",
            title: "Alles, was wir mit Ihnen bauen können.",
            text: "Wir sind ein Studio für digitale Produkte. Wir gestalten, entwickeln und begleiten jedes Projekt von Anfang bis Ende – von der ersten Idee bis zum Wachstum.",
            indexLabel: "Produkte",
            productsKicker: "Was wir machen",
            products: [
                {
                    name: "Websites und Web-Apps",
                    tagline: "Ihre Marke, online in Bestform.",
                    text: "Unternehmenswebsites, E-Commerce und massgeschneiderte Webplattformen: schnell, barrierearm und darauf ausgelegt, aus Besuchern Kunden zu machen.",
                    points: [
                        "Unternehmenswebsites und Landingpages",
                        "E-Commerce mit integrierten Zahlungen",
                        "Plattformen und Dashboards nach Mass",
                    ],
                },
                {
                    name: "Apps für iOS und Android",
                    tagline: "In der Tasche Ihrer Kunden.",
                    text: "Native und plattformübergreifende Apps in gleicher Qualität auf beiden Systemen – veröffentlicht im App Store und bei Google Play, bereit zu wachsen.",
                    points: [
                        "iOS und Android aus einer Codebasis",
                        "Push-Mitteilungen, Zahlungen und Karten",
                        "Veröffentlichung in den Stores",
                    ],
                },
                {
                    name: "Software nach Mass",
                    tagline: "Gebaut für die Arbeitsweise Ihres Teams.",
                    text: "Wenn kein Tool passt, bauen wir es. Interne Systeme, die Prozesse ordnen, Abteilungen verbinden und Wiederkehrendes automatisieren.",
                    points: [
                        "Interne Verwaltungssysteme",
                        "Integrationen zwischen Plattformen",
                        "Prozessautomatisierung",
                    ],
                },
                {
                    name: "CRM",
                    tagline: "Jeder Kunde an einem Ort.",
                    text: "Ein CRM, das um Ihren Verkaufsprozess herum gestaltet ist: Kontakte, Opportunities und Nachverfolgung – mit den Informationen, die Ihr Team zum Abschluss braucht.",
                    points: [
                        "Verkaufstrichter nach Mass",
                        "Kundenhistorie und Nachverfolgung",
                        "Berichte und Kennzahlen in Echtzeit",
                    ],
                },
                {
                    name: "Wartung und Skalierung",
                    tagline: "Der Launch ist erst der Anfang.",
                    text: "Wir betreuen Ihr Produkt nach dem Launch: Updates, Sicherheit, Monitoring und eine Infrastruktur, die ohne Bremse mitwächst.",
                    points: [
                        "Monitoring und laufender Support",
                        "Sicherheit und Updates",
                        "Infrastruktur, die mit Ihnen skaliert",
                    ],
                },
            ],
            rocket: {
                kicker: "Die Kraft eines Projekts",
                title: "Jedes Projekt ist ein Start.",
                text: "Wir setzen jedes Teil präzise zusammen, damit Ihr Produkt im richtigen Moment kraftvoll abhebt – und weiter steigt.",
                liftoff: "Start",
                altitude: "Höhe",
                phases: [
                    {
                        title: "Launch",
                        text: "Ihr Produkt geht live – getestet und bereit.",
                    },
                    {
                        title: "Traktion",
                        text: "Die ersten Nutzer kommen, und wir messen alles.",
                    },
                    {
                        title: "Skalierung",
                        text: "Die Infrastruktur wächst mit Ihrem Geschäft.",
                    },
                ],
            },
            cta: {
                title: "Bereit für den Start?",
                button: "Sprechen wir über Ihr Projekt",
            },
            aria: {
                products: "Animierter Baustein, der das aktive Produkt darstellt",
                rocket: "Rakete aus Bausteinen, die sich beim Scrollen zusammensetzt und abhebt",
            },
        },
        contact: {
            kicker: "Kontakt",
            title: "Erzählen Sie uns, was Sie bauen möchten.",
            text: "Füllen Sie das Briefing aus – wir melden uns vom nächstgelegenen Standort mit den nächsten Schritten. Kein endloses Formular: sieben Angaben, fertig.",
            mailLabel: "Lieber direkt schreiben?",
            fields: {
                name: "Vorname",
                lastName: "Nachname",
                email: "E-Mail",
                country: "Land",
                phone: "Telefon",
                budget: "Projektbudget",
                message: "Nachricht",
            },
            placeholders: {
                name: "Ihr Vorname",
                lastName: "Ihr Nachname",
                email: "name@firma.ch",
                country: "Land wählen",
                phone: "79 123 45 67",
                message: "Was möchten Sie erreichen, bis wann, und was besteht heute schon?",
            },
            budgetNote: "Beträge in {currency}: Für Argentinien offerieren wir in Dollar, für Europa in Euro.",
            upTo: "Bis {v}",
            from: "Über {v}",
            errors: {
                required: "Bitte ausfüllen.",
                email: "Bitte E-Mail prüfen.",
                phone: "Bitte Telefonnummer prüfen.",
                country: "Bitte ein Land wählen.",
                budget: "Bitte einen Bereich wählen.",
                message: "Bitte etwas ausführlicher (mindestens 20 Zeichen).",
                consent: "Bitte akzeptieren Sie diese, um das Briefing zu senden.",
            },
            consent: "Ich habe die {privacy} und die {terms} gelesen und akzeptiere sie.",
            privacyLink: "Datenschutzerklärung",
            termsLink: "Nutzungsbedingungen",
            progress: "Ihr Briefing",
            progressOf: "{n} von {total} Bausteinen",
            submit: "Briefing senden",
            sending: "Wird gesendet …",
            successTitle: "Danke, {name}.",
            successText: "Ihr Briefing ist bei uns angekommen. Wir melden uns bald vom nächstgelegenen Standort.",
            again: "Weitere Anfrage senden",
            errorSend: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns per E-Mail.",
            privacy: "Wir verwenden Ihre Angaben nur, um diese Anfrage zu beantworten.",
            aria: "Mauer aus Bausteinen, die mit jedem ausgefüllten Feld wächst",
        },
        session: {
            registerCreatedSent: "Konto erstellt. Wir haben Ihnen eine E-Mail zur Bestätigung gesendet: Bitte prüfen Sie Ihren Posteingang (und den Spam-Ordner), bevor Sie sich anmelden.",
            registerCreatedRateLimited: "Konto erstellt. Wir haben Ihnen vor Kurzem bereits eine Bestätigungs-E-Mail gesendet: Bitte prüfen Sie Ihren Posteingang (und den Spam-Ordner).",
            registerCreated: "Konto erstellt. Bei der Anmeldung senden wir Ihnen die Bestätigungs-E-Mail.",
            registerExists: "Diese E-Mail-Adresse ist bereits registriert. Melden Sie sich an oder setzen Sie Ihr Passwort zurück.",
            registerInvalid: "Bitte prüfen Sie E-Mail und Passwort: mindestens 10 Zeichen, ein Grossbuchstabe, eine Zahl und ein Sonderzeichen.",
            registerTooMany: "Zu viele Versuche in kurzer Zeit. Bitte versuchen Sie es in ein paar Minuten erneut.",
            registerError: "Das Konto konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.",
            registerLegalRequired: "Um ein Konto zu erstellen, müssen Sie die AGB, die Datenschutzerklärung und die Cookie-Richtlinie akzeptieren.",
            loginTooMany: "Zu viele Fehlversuche. Bitte versuchen Sie es in {minutes} Min. erneut.",
            loginTooManyNoTime: "Zu viele Fehlversuche. Bitte versuchen Sie es später erneut.",
            loginBanned: "Dieses Konto ist gesperrt. Schreiben Sie uns an contact@deepdevstudio.com.",
            loginNotFound: "Mit dieser E-Mail-Adresse ist kein Konto registriert.",
            loginNotVerifiedSent: "Ihre E-Mail-Adresse ist noch nicht bestätigt. Wir haben Ihnen die E-Mail erneut gesendet: Bitte prüfen Sie Ihren Posteingang (und den Spam-Ordner).",
            loginNotVerifiedRateLimited: "Ihre E-Mail-Adresse ist noch nicht bestätigt. Wir haben Ihnen die E-Mail vor Kurzem gesendet: Bitte prüfen Sie Ihren Posteingang (und den Spam-Ordner) oder versuchen Sie es in ein paar Minuten erneut.",
            loginNotVerified: "Ihre E-Mail-Adresse ist noch nicht bestätigt. Bitte prüfen Sie die E-Mail, die wir Ihnen bei der Registrierung gesendet haben.",
            loginInvalid: "E-Mail oder Passwort ist falsch.",
            loginInvalidLeft: "E-Mail oder Passwort ist falsch. Sie haben noch {n} Versuch(e).",
            loginError: "Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es später erneut.",
            pinLabel: "Signatur-PIN",
            pinHint: "Passwort korrekt. Bestätigen Sie die Anmeldung mit Ihrem 4-stelligen PIN.",
            pinChecking: "PIN wird geprüft…",
            pinWrong: "Falscher PIN.",
            pinWrongLeft: "Falscher PIN. Sie haben noch {n} Versuch(e).",
            pinLocked: "Zu viele PIN-Versuche. Bitte versuchen Sie es in {minutes} Min. erneut.",
            pinLockedNoTime: "Zu viele PIN-Versuche. Bitte versuchen Sie es später erneut.",
            pinError: "Der PIN konnte nicht geprüft werden. Bitte versuchen Sie es später erneut.",
            logoutError: "Die Abmeldung ist fehlgeschlagen.",
            resetEmailRequired: "Bitte geben Sie Ihre E-Mail-Adresse ein, um das Passwort zurückzusetzen.",
            resetSent: "Falls die E-Mail-Adresse registriert ist, erhalten Sie einen Link zum Zurücksetzen des Passworts.",
            resetInvalidEmail: "Das E-Mail-Format ist ungültig.",
            resetTooMany: "Zu viele Versuche. Bitte versuchen Sie es später erneut.",
            resetError: "Die E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
            banConfirm: "Möchten Sie diesen Benutzer wirklich sperren?",
            unbanConfirm: "Möchten Sie diesen Benutzer wirklich wieder freischalten?",
        },
        system: {
            errorKicker: "Etwas ist schiefgelaufen",
            okKicker: "Erledigt",
            notFoundKicker: "Fehler 404",
            notFoundTitle: "Diese Seite gibt es nicht.",
            redirect: "Weiter zur Startseite in {s} s",
            home: "Zur Startseite",
            loading: "Wird geladen",
        },
        footer: {
            statement: "Schaffen wir etwas, das bleibt.",
            tagline: "Strategie · Design · Engineering",
            description: "Wir bauen Marken und die digitalen Produkte, die sie zu ihren Kundinnen und Kunden bringen: Websites, Apps, massgeschneiderte Software und Automatisierungen.",
            follow: "Folgen Sie uns",
            presenceTitle: "Präsenz",
            countries: ["Argentinien", "Spanien", "Schweiz"],
            call: "Anrufen",
            localTime: "Ortszeit",
            email: "Schreiben Sie uns",
            backTop: "Nach oben",
            madeIn: "Gemacht zwischen Buenos Aires, Madrid und Zürich",
            available: "Jetzt erreichbar",
            away: "Ausserhalb der Bürozeiten",
            yourZone: "Ihre Zone",
            coverage: "Wann Sie uns erreichen – in Ihrer Zeit",
            now: "Jetzt",
            copy: "Kopieren",
            copied: "Kopiert",
            hours: "Montag bis Freitag · 9–18 Uhr Ortszeit",
        },
        aria: {
            hero: "DeepDev-Logo in 3D: zwei Kettenglieder, die sich zusammensetzen und schweben",
            identity: "Illustration: Auf einer Platte entsteht ein Markensystem mit Farben, Typografie, Logo, Visitenkarte und Smartphone",
            power: "Illustration: Vier Module verbinden sich, öffnen sich in Schichten und wachsen zu einem Turm",
            global: "Illustration: Drei verbundene Türme für Argentinien, Spanien und die Schweiz",
        },
    },
    en: {
        lang: {
            title: "Choose your language",
            detected: "We detected you're in {country}.",
            detectedUnknown: "Choose the language you'd like to browse in.",
            suggested: "Suggested",
            confirm: "Continue",
            note: "You can change it anytime from the menu.",
        },
        hero: {
            eyebrow: "Digital studio · Argentina · Spain · Switzerland",
            title: ["Brands that look", "as good as they", "work."],
            text: "We bring strategy, design and engineering together in one team to build your brand identity and the digital product that takes it to your customers.",
            cta: "Let's talk about your project",
            ctaSecondary: "How we work",
            scroll: "Scroll",
        },
        manifesto: {
            kicker: "Manifesto",
            text: "Most brands look alike because they're built the same way. We start by understanding what makes you *different* and turn it into something people can use: a *clear* identity, an experience that feels like *yours* and technology that *supports* you as you grow.",
        },
        identity: {
            kicker: "Brand identity",
            title: "A brand is a system, not a logo.",
            steps: [
                { title: "We listen", text: "Before we design, we get to know your business, your audience and what you want them to feel when they see you." },
                { title: "We define", text: "Color, typography, tone and form. Every decision has a reason and a rule." },
                { title: "We systematize", text: "We turn the identity into reusable pieces so it looks the same on a website, an app or an Instagram story." },
                { title: "We bring it to product", text: "Your brand comes alive where your customers use it: on every screen, every button and every message." },
            ],
        },
        power: {
            kicker: "Why DeepDev",
            title: "The full power of a complete team. No middlemen.",
            steps: [
                { title: "One team", text: "Strategy, design, development and automation work together from day one. Nobody passes the buck." },
                { title: "Real engineering", text: "Our own code, secure and measurable. No templates that break as your business grows." },
                { title: "Built to scale", text: "We build today the foundation you'll need tomorrow, so you can grow without starting over." },
                { title: "Partners, not vendors", text: "We stay with you after launch: we measure, adjust and improve." },
            ],
        },
        global: {
            kicker: "Presence",
            title: "Close to you, in your language and your time zone.",
            text: "We work with brands in Argentina, Spain and Switzerland. We understand each market and organize ourselves so your project moves forward every day.",
            cities: ["Buenos Aires", "Madrid", "Zurich"],
            live: "Local time",
        },
        stats: {
            kicker: "In numbers",
            items: [
                { value: "3", label: "Countries" },
                { value: "1", label: "End-to-end team" },
                { value: "100%", label: "Custom code" },
                { value: "24/7", label: "Support" },
            ],
        },
        cta: {
            kicker: "Let's start",
            title: "Got an idea? Let's make it a brand.",
            text: "Tell us what you want to build and we'll propose the first step.",
            button: "Start a project",
        },
        navbar: {
            home: "Home",
            cta: "Start a project",
            logout: "Log out",
            admin: "Admin",
            themeLight: "Light mode",
            themeDark: "Dark mode",
            menu: "Menu",
            language: "Language",
            open: "Open menu",
            close: "Close menu",
            regions: "Argentina · Spain · Switzerland",
            startTitle: "Got an idea?",
            lab: "Laboratory",
        },
        lab: {
            kicker: "Lab",
            title: "Where we test what doesn't exist yet.",
            text: "Experiments, demos and prototypes made with no client involved. This is our workshop: where we put the graphics engine, the physics and the ideas that later reach our products to the test.",
            hint: "Open any experiment and play with it.",
            madeWith: "Made with",
            open: "Open",
            close: "Close",
            reset: "Reset",
            experiments: [
                {
                    name: "Gravity",
                    text: "A building plate and bricks that fall with real physics. Change the gravity and the bounce, and watch them stack.",
                    hint: "Tap the scene to drop bricks.",
                    tech: [
                        "Canvas 2D",
                        "TypeScript",
                        "Custom physics",
                    ],
                },
                {
                    name: "Chain links",
                    text: "Our logo, extruded in real time. Spin it, change its depth and pull the two links apart.",
                    hint: "Drag to spin it.",
                    tech: [
                        "Canvas 2D",
                        "Real-time extrusion",
                        "Springs",
                    ],
                },
                {
                    name: "Type and build",
                    text: "Every letter you type becomes a new brick in the wall. Delete it and it's gone.",
                    hint: "Type up to 16 letters.",
                    tech: [
                        "Canvas 2D",
                        "React",
                        "Custom physics",
                    ],
                },
                {
                    name: "Microinteractions",
                    text: "The button animations on this site: letters in a wave, lines that draw themselves and arrows that redraw.",
                    hint: "Hover or tap each button.",
                    tech: [
                        "CSS",
                        "Framer Motion",
                        "SVG",
                    ],
                },
                {
                    name: "Tower",
                    text: "A block slides back and forth over the tower. Drop it at the right moment: whatever hangs over is cut off and falls. Nail it exactly to build a streak.",
                    hint: "Tap the scene or press space to drop.",
                    tech: ["Canvas 2D", "Custom physics", "TypeScript"],
                },
                {
                    name: "Ripples",
                    text: "A field of columns that behaves like water. Every tap is a drop: the waves cross, bounce off the edges and settle.",
                    hint: "Tap any column.",
                    tech: ["Canvas 2D", "Wave equation", "Custom physics"],
                },
                {
                    name: "Maze",
                    text: "Tilt the board and the ball rolls with momentum to the blue exit. Every maze is new and generated on the spot.",
                    hint: "Press and hold where you want to tilt, or use the arrow keys.",
                    tech: ["Canvas 2D", "Procedural generation", "Collisions"],
                },
                {
                    name: "Sequence",
                    text: "Four blocks light up in order. Repeat the sequence: every round adds one more step.",
                    hint: "Tap the blocks or use keys 1 to 4.",
                    tech: ["Canvas 2D", "Web Audio", "React"],
                },
            ],
            controls: {
                gravity: "Gravity",
                bounce: "Bounce",
                drop: "Drop a brick",
                depth: "Depth",
                split: "Split",
                join: "Join",
                placeholder: "Type something",
                samples: [
                    "Start a project",
                    "See our work",
                    "Write to us",
                    "Meet the team",
                ],
                height: "Height",
                best: "Best",
                level: "Level",
                time: "Time",
                place: "Drop block",
                speed: "Speed",
                damping: "Calm",
                rainOn: "Stop the rain",
                rainOff: "Make it rain",
                calm: "Calm the water",
                newMaze: "New maze",
                start: "Start",
                soundOn: "Sound: on",
                soundOff: "Sound: off",
                status: {
                    towerReady: "Drop the first block.",
                    towerPlay: "",
                    towerPerfect: "Exact! Keep the streak going.",
                    towerOver: "The tower is done. Tap to start another.",
                    mazePlay: "",
                    mazeWin: "Exit reached! Another maze is on its way.",
                    simonIdle: "Tap Start or any block.",
                    simonWatch: "Watch the sequence…",
                    simonTurn: "Your turn.",
                    simonFail: "Wrong one. Tap Start to try again.",
                },
            },
            stack: {
                kicker: "Stack",
                title: "The tools behind every project.",
                layers: [
                    {
                        name: "Frontend",
                        tools: [
                            "React",
                            "TypeScript",
                            "Vite",
                            "Framer Motion",
                        ],
                        text: "Fast, typed interfaces with smooth animation and no performance cost.",
                    },
                    {
                        name: "Backend",
                        tools: [
                            "Node.js",
                            "Express",
                            "MongoDB",
                        ],
                        text: "Our own APIs, flexible and easy to scale as the product grows.",
                    },
                    {
                        name: "Services",
                        tools: [
                            "Firebase Auth",
                            "Stripe",
                            "MercadoPago",
                            "Brevo",
                            "Cloudinary",
                        ],
                        text: "Authentication, payments, email and images on proven platforms: we don't reinvent what already works.",
                    },
                    {
                        name: "Infrastructure",
                        tools: [
                            "Render",
                            "Cloudflare",
                        ],
                        text: "Automated deploys, DNS and edge protection so everything stays online.",
                    },
                ],
            },
            cta: {
                title: "Want this in your product?",
                button: "Let's talk about your project",
            },
            aria: {
                hero: "Field of blocks rippling",
                stack: "Tower of layers with the tools we use",
                experiment: "Interactive experiment",
            },
        },
        about: {
            kicker: "About DeepDev",
            title: "A high-end development studio.",
            text: "We design and build digital products for brands that won't settle for the usual. A team that designs and codes with an obsession for detail, working from three countries.",
            facts: [
                {
                    label: "Studio",
                    value: "High-end development",
                },
                {
                    label: "Presence",
                    value: "Argentina · Spain · Switzerland",
                },
                {
                    label: "Model",
                    value: "Design and engineering in one team",
                },
            ],
            origin: {
                kicker: "Origin",
                title: "Born to do things right, not fast.",
                paragraphs: [
                    "DeepDev was born in Buenos Aires from a simple idea: brands deserve software built with the same care they put into their identity. We kept seeing projects built from templates, rushed and hard to maintain, and we set out to do the opposite.",
                    "Over time, the work took us to Europe. Today we partner with brands in Argentina, Spain and Switzerland with the same approach: understand deeply, design with intent and build to last.",
                ],
            },
            mission: {
                kicker: "Mission",
                text: "To build digital products that help brands *grow*, with the care of a *studio* and the engineering of a *technology* company.",
                values: [
                    {
                        title: "Depth",
                        text: "Before designing a single screen, we understand the business. That's where the name DeepDev comes from.",
                    },
                    {
                        title: "Precision",
                        text: "Every detail has a reason: typography, motion, performance and code.",
                    },
                    {
                        title: "Commitment",
                        text: "We don't disappear after delivery: we measure, refine and grow with you.",
                    },
                ],
            },
            why: {
                kicker: "Why us",
                title: "What sets us apart.",
                items: [
                    {
                        title: "Truly high-end",
                        text: "World-class design and hand-written code, with no templates and no shortcuts.",
                    },
                    {
                        title: "One team",
                        text: "Design, development and infrastructure under one roof, with a single point of contact from start to finish.",
                    },
                    {
                        title: "Modern technology",
                        text: "We build on current, proven stacks designed to grow, and the code is yours.",
                    },
                    {
                        title: "Three time zones",
                        text: "Between Buenos Aires, Madrid and Zurich we cover more than twelve working hours a day.",
                    },
                    {
                        title: "Partners, not vendors",
                        text: "We treat your product as if it were our own, before and after launch.",
                    },
                ],
            },
            process: {
                kicker: "How we work",
                title: "We go deep, layer by layer.",
                steps: [
                    {
                        title: "Discover",
                        text: "We understand your business, your users and your goals. We define scope, timelines and a fixed budget.",
                    },
                    {
                        title: "Design",
                        text: "We create the identity and the experience: clickable prototypes you approve before a single line of code.",
                    },
                    {
                        title: "Build",
                        text: "We develop with visible progress at every stage, continuous testing and direct contact with the team.",
                    },
                    {
                        title: "Launch and care",
                        text: "We ship, measure and stay with you: maintenance, improvements and the infrastructure to scale.",
                    },
                ],
            },
            presence: {
                kicker: "Where we are",
                title: "Three countries, one standard.",
                text: "We operate from Argentina, Spain and Switzerland. Working across three time zones lets us reply fast and keep moving while others sleep.",
                offices: [
                    {
                        city: "Buenos Aires",
                        country: "Argentina",
                        role: "Where DeepDev was born, and the heart of our engineering team.",
                    },
                    {
                        city: "Madrid",
                        country: "Spain",
                        role: "Our base in Europe and the bridge to the Spanish-speaking market.",
                    },
                    {
                        city: "Zurich",
                        country: "Switzerland",
                        role: "Close to brands in the DACH region and their high standards.",
                    },
                ],
            },
            cta: {
                title: "Let's build something that lasts.",
                primary: "Let's talk about your project",
                secondary: "See what we do",
            },
            aria: {
                process: "Layers that separate to show each stage of work",
                presence: "Three connected towers representing DeepDev's offices",
            },
        },
        products: {
            kicker: "Company",
            title: "Everything we can build with you.",
            text: "We're a digital product studio. We design, build and support every project end to end, from the first idea until it grows.",
            indexLabel: "Products",
            productsKicker: "What we do",
            products: [
                {
                    name: "Websites and web apps",
                    tagline: "Your brand, at its best online.",
                    text: "Corporate sites, e-commerce and custom web platforms: fast, accessible and built to turn visitors into customers.",
                    points: [
                        "Corporate sites and landing pages",
                        "E-commerce with integrated payments",
                        "Custom platforms and dashboards",
                    ],
                },
                {
                    name: "iOS and Android apps",
                    tagline: "In your customers' pockets.",
                    text: "Native and cross-platform apps with the same quality on both systems, published on the App Store and Google Play and ready to grow.",
                    points: [
                        "iOS and Android from one codebase",
                        "Notifications, payments and maps",
                        "App Store and Google Play publishing",
                    ],
                },
                {
                    name: "Custom software",
                    tagline: "Built around how your team works.",
                    text: "When no tool fits, we build it. Internal systems that organise processes, connect teams and automate the repetitive.",
                    points: [
                        "Internal management systems",
                        "Integrations between platforms",
                        "Process automation",
                    ],
                },
                {
                    name: "CRM",
                    tagline: "Every customer, in one place.",
                    text: "A CRM designed around your sales process: contacts, opportunities and follow-up, with the information your team needs to close more.",
                    points: [
                        "A sales pipeline that fits you",
                        "Customer history and follow-up",
                        "Real-time reports and metrics",
                    ],
                },
                {
                    name: "Maintenance and scaling",
                    tagline: "Launch is just the beginning.",
                    text: "We look after your product after launch: updates, security, monitoring and infrastructure that lets it grow without slowing down.",
                    points: [
                        "Monitoring and ongoing support",
                        "Security and updates",
                        "Infrastructure that scales with you",
                    ],
                },
            ],
            rocket: {
                kicker: "The force of a project",
                title: "Every project is a launch.",
                text: "We put every piece together with precision so that, when the moment comes, your product lifts off with force and keeps climbing.",
                liftoff: "Liftoff",
                altitude: "Altitude",
                phases: [
                    {
                        title: "Launch",
                        text: "Your product goes live, tested and ready.",
                    },
                    {
                        title: "Traction",
                        text: "The first users arrive and we measure everything.",
                    },
                    {
                        title: "Scale",
                        text: "The infrastructure grows with your business.",
                    },
                ],
            },
            cta: {
                title: "Ready for liftoff?",
                button: "Let's talk about your project",
            },
            aria: {
                products: "Animated block representing the active product",
                rocket: "Block rocket that assembles and lifts off as you scroll",
            },
        },
        contact: {
            kicker: "Contact",
            title: "Tell us what you want to build.",
            text: "Fill in the brief and we'll reply from the nearest office with next steps. No endless forms: seven details and you're done.",
            mailLabel: "Prefer to write directly?",
            fields: {
                name: "First name",
                lastName: "Last name",
                email: "Email",
                country: "Country",
                phone: "Phone",
                budget: "Project budget",
                message: "Message",
            },
            placeholders: {
                name: "Your first name",
                lastName: "Your last name",
                email: "name@company.com",
                country: "Choose a country",
                phone: "20 7946 0958",
                message: "Tell us what you want to achieve, by when, and what you have today.",
            },
            budgetNote: "Amounts in {currency}: we quote in US dollars for Argentina and in euros for Europe.",
            upTo: "Up to {v}",
            from: "Over {v}",
            errors: {
                required: "Please fill in this field.",
                email: "Please check the email.",
                phone: "Please check the phone number.",
                country: "Please choose a country.",
                budget: "Please choose a range.",
                message: "Tell us a bit more (at least 20 characters).",
                consent: "Please accept them to send your brief.",
            },
            consent: "I have read and accept the {privacy} and the {terms}.",
            privacyLink: "privacy policy",
            termsLink: "terms and conditions",
            progress: "Your brief",
            progressOf: "{n} of {total} pieces",
            submit: "Send brief",
            sending: "Sending…",
            successTitle: "Thank you, {name}.",
            successText: "We've received your brief and it's with the team. We'll get back to you soon from the nearest office.",
            again: "Send another enquiry",
            errorSend: "We couldn't send your message. Please try again or email us.",
            privacy: "We only use your details to reply to this enquiry.",
            aria: "Brick wall that builds as you complete the form",
        },
        session: {
            registerCreatedSent: "Account created. We've sent you an email to verify it: check your inbox (and spam) before signing in.",
            registerCreatedRateLimited: "Account created. We sent you a verification email a moment ago: check your inbox (and spam).",
            registerCreated: "Account created. We'll send you the verification email when you sign in.",
            registerExists: "This email is already registered. Sign in or reset your password.",
            registerInvalid: "Check your email and password: at least 10 characters, one uppercase letter, one number and one symbol.",
            registerTooMany: "Too many attempts in a row. Please try again in a few minutes.",
            registerError: "We couldn't create your account. Please try again later.",
            registerLegalRequired: "To create your account you need to accept the terms, the privacy policy and the cookie policy.",
            loginTooMany: "Too many failed attempts. Try again in {minutes} min.",
            loginTooManyNoTime: "Too many failed attempts. Please try again later.",
            loginBanned: "This account is suspended. Write to us at contact@deepdevstudio.com.",
            loginNotFound: "There's no account registered with that email.",
            loginNotVerifiedSent: "Your email isn't verified yet. We've sent the email again: check your inbox (and spam).",
            loginNotVerifiedRateLimited: "Your email isn't verified yet. We sent the email a moment ago: check your inbox (and spam) or try again in a few minutes.",
            loginNotVerified: "Your email isn't verified yet. Check the email we sent you when you signed up.",
            loginInvalid: "Incorrect email or password.",
            loginInvalidLeft: "Incorrect email or password. You have {n} attempt(s) left.",
            loginError: "We couldn't sign you in. Please try again later.",
            pinLabel: "Signing PIN",
            pinHint: "Password correct. Sign with your 4-digit PIN to continue.",
            pinChecking: "Checking PIN…",
            pinWrong: "Incorrect PIN.",
            pinWrongLeft: "Incorrect PIN. You have {n} attempt(s) left.",
            pinLocked: "Too many PIN attempts. Try again in {minutes} min.",
            pinLockedNoTime: "Too many PIN attempts. Please try again later.",
            pinError: "We couldn't check the PIN. Please try again later.",
            logoutError: "We couldn't sign you out.",
            resetEmailRequired: "Enter your email to reset your password.",
            resetSent: "If the email is registered, you'll receive a link to reset your password.",
            resetInvalidEmail: "The email format isn't valid.",
            resetTooMany: "Too many attempts. Please try again later.",
            resetError: "We couldn't send the email. Please try again later.",
            banConfirm: "Are you sure you want to suspend this user?",
            unbanConfirm: "Are you sure you want to reactivate this user?",
        },
        system: {
            errorKicker: "Something went wrong",
            okKicker: "Done",
            notFoundKicker: "Error 404",
            notFoundTitle: "This page doesn't exist.",
            redirect: "Taking you home in {s}s",
            home: "Back to home",
            loading: "Loading",
        },
        footer: {
            statement: "Let's make something memorable.",
            tagline: "Strategy · Design · Engineering",
            description: "We build brands and the digital products that take them to their customers: websites, apps, custom software and automations.",
            follow: "Follow us",
            presenceTitle: "Presence",
            countries: ["Argentina", "Spain", "Switzerland"],
            call: "Call",
            localTime: "Local time",
            email: "Write to us",
            backTop: "Back to top",
            madeIn: "Made between Buenos Aires, Madrid and Zurich",
            available: "Available now",
            away: "Outside office hours",
            yourZone: "Your zone",
            coverage: "When to reach us, in your time",
            now: "Now",
            copy: "Copy",
            copied: "Copied",
            hours: "Monday to Friday · 9am–6pm local time",
        },
        aria: {
            hero: "DeepDev logo in 3D: two chain links that assemble and float",
            identity: "Illustration: a brand system builds up on a plate with colors, typography, logo, business card and phone screen",
            power: "Illustration: four modules join, open into layers and grow into a tower",
            global: "Illustration: three connected towers, one each for Argentina, Spain and Switzerland",
        },
    },
};

export const LanguageProvider = ({ children }: ProviderProps) => {
    const [ language, setLanguage ] = useState<string>(() => {
        try {
            const stored = localStorage.getItem("userLanguage");
            if (stored) return stored;
        } catch {
            /* sin acceso a localStorage: seguimos con la detección */
        }
        return detectLocale().locale;
    });

    useEffect(() => {
        localStorage.setItem('userLanguage', language);
    }, [language]);

    const handleLanguage = (e: string) => {
        setLanguage(e)
        localStorage.setItem("userLanguage", language)
    }
    const texts: TextsConfig = {
    en: {
        home: {
            reinventing: `DeepDev Reinventing Digital
             Experiences.`,
            boost: `We boost your design with the best tools`,
            real: `Real-Time 3D interaction`,
            ai: `AI-Enhanced 
            User experiences`,
            automate: `Automate your work, click and you're done.`,
        },
        products: {
            webTitle: `We Build Web Applications.`,
            webText: `Modern web solutions tailored to your goals from high-impact landing pages and corporate websites to eCommerce platforms and fully custom web systems.

             A web presence is often the first point of contact between your brand and your users. A well-built website not only communicates who you are, but also converts visitors into clients, centralizes your services, and allows your business to grow with flexibility and control. 

             Whether you need to showcase your brand, sell products online or manage information and users through a custom platform, web applications provide a scalable and accessible solution available from any device.`,
            appTitle: `iOS & Android Mobile Apps.`,
            appText: `We design and build mobile applications for iOS and Android from focused business apps and MVPs to fully featured products ready for real users. 
            
            Mobile apps allow your brand to be present where users spend most of their time. A well-crafted app delivers speed, performance and a seamless user experience, creating a direct and constant connection between your product and your audience. 
            
            Whether you need to launch a new idea, extend your digital product to mobile or provide users with a dedicated experience, mobile applications offer a powerful, scalable and native-feeling solution across devices.`,
            customTitle: `Custom Software Solutions.`,
            customText: `We design and develop fully customized software solutions tailored to your business needs. From management and control systems to internal platforms and process automation, we transform ideas into scalable digital tools that empower your company. 
            
            Every business has unique workflows, challenges, and goals. That’s why off-the-shelf solutions often fall short. Custom software allows you to centralize information, automate processes, improve decision-making, and gain full control over your operations. 
            
            Whether you need a management system, a control panel, a custom dashboard, or a platform built around your specific idea, we create flexible and scalable solutions designed to grow with your business.`,
            AiTitle: `Artificial Intelligence Integration.`,
            AiText: `We design and integrate AI-powered solutions tailored to real business needs. From custom chatbots and virtual assistants to intelligent decision flows, we help companies enhance their digital products with practical and reliable artificial intelligence. 
            
            Our approach focuses on building AI that is controlled, secure, and seamlessly integrated into existing systems, data sources, and workflows. 
            
            Instead of generic solutions, we create custom integrations that improve user experience, reduce operational workload, and enable smarter automation at scale.`,
            automationTitle: `Automation & Workflows.`,
            automationText: `We design and implement automated workflows that connect systems, streamline operations, and eliminate repetitive manual tasks. By integrating your website, applications, and internal tools, we help businesses improve efficiency and maintain full control over their processes. 
            
            Our automation solutions connect different platforms—such as CRMs, emails, APIs, and internal systems—allowing data to flow seamlessly and actions to be triggered automatically. This results in faster response times, fewer errors, and more consistent operations across the organization. 
            
            Whether you need to automate lead management, internal notifications, data synchronization, or complex multi-step processes, we build flexible and scalable workflows tailored to your business needs.`,
        },
        company: {
            dna: `Our DNA`,
            dnaTitle: `Commitment 
            to Excellence`,
            dnaText: `At DeepDev, we don't just write code; we build the foundation for your next success. Our journey is defined by technical precision and the confidence of delivering world-class products.`,
            projects: `Projects Delivered`,
            uptime: `Guaranteed Uptime`,
            support: `24/7 Support`,
            title2022: `The Origin`,
            text2022: `Founded in Argentina with the vision of transforming complex ideas into high-performance digital products.`,
            title2024: `European Expansion & AI Focus`,
            text2024: `Established our base in Spain and integrated AI models into our developments, raising the standard for automation.`,
            title2026: `Today: DeepDev Global`,
            text2026: `Consolidated as an international boutique studio, specializing in custom software and scalable digital ecosystems.`,
            global: `GLOBAL PRESENCE`,
            globalTitle: `Talent Without Borders`,
            globalText: `We operate strategically from Spain and Argentina, combining European innovation with the ingenuity and resilience of Latin American talent. This duality allows us to offer exceptional time-zone coverage and a global market perspective.`,
            flagSpain: `Spain 🇪🇸`,
            flagArgentina: `Argentina 🇦🇷`,
            talk: `Ready to start your transformation?`,
            talkButton: `Let's talk about your project`
        },
        raffles: {
            premiere: `2026 Raffle`,
            premiereTitle: `We take your idea to the Next Level`,
            premiereText: `To celebrate the launch of DeepDev, we're giving away a complete Full Stack development project. We want your project to have the digital presence it deserves, with cutting-edge technology and high-impact design.`,
            performance: `Pro Performance`,
            performanceText: `Optimized and ultra-fast websites.`,
            design: `Exclusive Design`,
            designText: `User interface and user experience designed for your brand.`,
            raffleTitle: `FullStack_Raffle`,
            raffleText: `Enter for a chance to win a complete professional website built by DeepDev.`,
            days: `DAYS`,
            hours: `HOURS`,
            minutes: `MIN`,
            seconds: `SEC`,
            name: `Your Full Name`,
            email: `Your Email`,
            project: `What website would you like to develop?`,
            conditions: {
                before: `I agree to the `,
                link: `terms and conditions`,
                after: ` of the raffle.`
            },
            error: `You must accept the terms and conditions to continue.`,
            processing: `Generating ticket...`,
            verify: `Verifying email...`,
            analyzing: `Analyzing request...`,
            status: `Status: Processing...`,
            registered: `Ticket Registered!`,
            thanks: {
                before: `Thank you. `,
                after: `Your entry has been saved. Good luck!`
            },
            premio: `Prize at Stake: Professional Web Development`,
            buttonBack: `Back`,
            button: `GENERATE RAFFLE TICKET`
        },
        contact: {
            name: `Name:`,
            lastName: `Last Name:`,
            companyName: `Company Name:`,
            role: `Role in the company:`,
            email: `Email:`,
            phone: `Phone / WhatsApp:`,
            project: `Project Type:`,
            projectOption: `Select an option`,
            projectNew: `New Project`,
            projectRedisign: `Redesign existing website`,
            current: `Current Web/App:`,
            type: [`Web/App Type:`, `Select an option`, `Landing Page`, `Corporate / Institutional Website`, `E-commerce`, `Portfolio`, `Services Website`, `Web Application / Platform`, `Custom System`, `Not sure yet`],
            projectGoal: [`Project Goal:`, `Select a goal`, `Receive inquiries / Leads`, `Sell products or services`, `Show and strengthen my brand`, `Automate processes`, `Other`],
            range: [`Budget Range:`, `Select a range`, `Less than U$S 500`, `U$S 500 - U$S 1000`, `U$S 1000 - U$S 3000`, `More than U$S 3000`, `Not sure yet`],
            available: [`Time Availability:`, `Select a deadline`, `As soon as possible`, `1-2 months`, `+3 months`, `Flexible`],
            descriptionPlace: [`Project Description:`, `Tell us more about your project or idea`],
            button: `Send`,
        },
        nav: {
            promo: `Check out our sweepstakes section to participate in prize draws and get great discounts on our products.`,
            products: `Products`,
            sales: `Sales`,
            company: `Company`,
            raffles: `Raffles`,
            contact: `Contact`,
            login: `Login`
        },
        login: {
            title: `Welcome Back`,
            text: `Access your DeepDev account`,
            email: `Email`,
            password: `Password`,
            button: `Sign In`,
            register: {
                before: `New to DeepDev? `,
                after: `Create an account`
            },
            forgot: `Forgot your password?`
        },
        register: {
            title: "New User",
            email: "Email",
            password: "Password",
            verifyPassword: "Verify Password:",
            passMismatch: "Passwords do not match!",
            passError: "Password encoding error.",
            btnRegister: "Register",
            footerText: "Already a DeepDev user?",
            footerLink: "Log In",
            reqMinChars: "Minimum 10 characters",
            reqUpper: "One uppercase letter",
            reqNumber: "One number",
            reqSpecial: "Special character (@$!%*?&)",
            errorRegister: "Error registering user."
        },
        footer: {
            deepdev: [`Reinventing Digital Experiences`, `Engineering immersive interfaces where design, motion and intelligence converge.`],
            navigationTitle: `NAVIGATION`,
            expertiseTitle: `EXPERTISE`,
            connectTitle: `CONNECT`,
            navigation: [`Home`, `Products`, `Sales`, `Company`, `Raffles`, `Contact`],
            expertise: [`Frontend Engineering`, `3D Web Experiences`, `AI Integrations`, `Backend Systems`],
            connect: [`Global Remote`, `Phone`],
            rights: `All rights reserved.`,
            privacy: `Privacy Policy`,
            terms: `Terms`
        },
        language: `Lan`,
        raffleTerm:{
            terms_title: "Terms and Conditions",
            terms_subtitle: "By participating in the DeepDev giveaway, you fully accept the terms and conditions detailed below.",
            term1_title: "Participation Requirements",
            term1_text: "To participate, it is mandatory to be over 18 years old. Since a Landing Page or eCommerce can have lucrative and/or economic purposes, the participant must have legal capacity to manage these types of digital assets.",
            term2_title: "The Prize and Scope",
            term2_text: "The prize consists exclusively of the development and delivery of a Landing Page or eCommerce based on our sales section models. DeepDev is responsible only for creating the site. Management costs, hosting, database maintenance, and domain acquisition are solely and exclusively the winner's financial responsibility.",
            term3_title: "Disclaimer",
            term3_text: "DeepDev provides the technical tool but disclaims all responsibility for the purpose, content, or future use of the website. We are not responsible for malicious use, illegal activities, or any economic management derived from the site once delivered.",
            term4_title: "Veracity and Claim",
            term4_text: "Any non-veracious data in the form voids the winner. After notification, the winner has 72 hours to claim the prize; otherwise, a new selection will be made.",
            term5_title: "Data Consent",
            term5_text: "Data will be used only for giveaway and DeepDev advertising purposes. By participating, you consent to the processing of such information and to receive communications from the company.",
            terms_footer: "DeepDev reserves the right of interpretation of these rules."
        },
        error404: {
            title: "404 - Page not found.",
            errorMessage: "You will be automatically redirected to the home page."
        },
        cookies: {
            title: "Cookie Policy",
            intro: "At DeepDev we use cookies to improve your browsing experience and offer you a personalized service. By continuing to browse our site, we understand that you accept their use.",
            questionWhat: "What are cookies?",
            answerWhat: "Cookies are small text files that are stored on your device when you visit a website. They serve to remember your preferences and help you have a smoother experience.",
            questionTypes: "What types of cookies do we use?",
            typeEssential: "Essential cookies: Necessary for the site to function.",
            typePerformance: "Performance cookies: They analyze the use of the site.",
            typeFunctionality: "Functionality cookies: They remember your preferences.",
            typeThirdParty: "Third-party cookies: External services such as social networks.",
            questionManage: "How can I manage cookies?",
            answerManage: "You can configure your browser to accept or reject cookies. Please note that disabling certain cookies may affect the functionality of the site."
        },
        sessionErrors: {
            loginBanned: "User banned. Contact DeepDev.",
            loginTooManyAttempts: "Your account was blocked due to too many failed attempts.",
            loginInvalidCredentials: "Invalid credentials.",
            loginAttemptsLeft: "Invalid credentials. You have {{attempts}} attempt(s) left.",
            loginGeneralError: "Error logging in. Try again later.",
            resetEmailRequired: "Please enter your email to reset your password.",
            resetEmailSent: "Email sent! Check your inbox.",
            resetUserNotFound: "No account linked to this email exists.",
            resetInvalidEmail: "The email format is invalid.",
            resetTooManyRequests: "Too many attempts. Try again later.",
            logoutError: "Error logging out."
        },
    },
    es: {
        home: {
            reinventing: `DeepDev Reinventando
             Experiencias Digitales`,
            boost: `Potenciamos tu diseño con las mejores herramientas.`,
            real: `Interacción 3D en tiempo real`,
            ai: `Experiencias
             mejoradas con IA`,
            automate: `Automatiza tu trabajo, un clic y listo.`,
        },
        products: {
            webTitle: `Hacemos Aplicaciones Web.`,
            webText: `Soluciones web modernas adaptadas a tus objetivos, desde landing pages de alto impacto y sitios corporativos hasta plataformas de eCommerce y sistemas web totalmente personalizados. La presencia web es a menudo el primer punto de contacto entre tu marca y tus usuarios.
            
            Un sitio bien construido no solo comunica quién eres, sino que también convierte visitantes en clientes, centraliza tus servicios y permite que tu negocio crezca con flexibilidad y control. Ya sea que necesites mostrar tu marca, vender productos en línea o gestionar información y usuarios a través de una plataforma a medida, las aplicaciones web proporcionan una solución escalable y accesible desde cualquier dispositivo.`,
            
            appTitle: `Apps para iOS y Android.`,
            appText: `Diseñamos y construimos aplicaciones móviles para iOS y Android, desde apps de negocios enfocadas y MVPs hasta productos completos listos para usuarios reales.
            
            Las aplicaciones móviles permiten que tu marca esté presente donde los usuarios pasan la mayor parte de su tiempo. Una app bien lograda ofrece velocidad, rendimiento y una experiencia de usuario fluida, creando una conexión directa y constante entre tu producto y tu audiencia.
            
            Ya sea que necesites lanzar una nueva idea, extender tu producto digital al móvil o brindar a los usuarios una experiencia dedicada, las aplicaciones móviles ofrecen una solución potente, escalable y con una sensación nativa en todos los dispositivos.`,
            customTitle: `Software Customizado.`,
            customText: `Diseñamos y desarrollamos soluciones de software completamente personalizadas y adaptadas a las necesidades de tu negocio. Desde sistemas de gestión y control hasta plataformas internas y automatización de procesos, transformamos ideas en herramientas digitales escalables que potencian a tu empresa. 
            
            Cada negocio tiene flujos de trabajo, desafíos y objetivos únicos. Es por eso que las soluciones genéricas a menudo se quedan cortas. El software a medida te permite centralizar la información, automatizar procesos, mejorar la toma de decisiones y obtener un control total sobre tus operaciones. 
            
            Ya sea que necesites un sistema de gestión, un panel de control o un dashboard personalizado, creamos soluciones flexibles diseñadas para crecer con tu negocio.`,
            
            AiTitle: `Inteligencia Artificial Integrada.`,
            AiText: `Diseñamos e integramos soluciones impulsadas por IA adaptadas a necesidades comerciales reales. Desde chatbots personalizados y asistentes virtuales hasta flujos de decisión inteligentes, ayudamos a las empresas a mejorar sus productos digitales con inteligencia artificial práctica y confiable. 
            
            Nuestro enfoque se centra en construir una IA controlada, segura e integrada sin problemas en los sistemas, fuentes de datos y flujos de trabajo existentes. 
            
            En lugar de soluciones genéricas, creamos integraciones personalizadas que mejoran la experiencia del usuario, reducen la carga de trabajo operativa y permiten una automatización más inteligente a escala.`,

            automationTitle: `Automatización de Flujos.`,
            automationText: `Diseñamos e implementamos flujos de trabajo automatizados que conectan sistemas, agilizan las operaciones y eliminan tareas manuales repetitivas.
            
            Al integrar tu sitio web, aplicaciones y herramientas internas, ayudamos a las empresas a mejorar la eficiencia y mantener el control total sobre sus procesos. 
            
            Nuestras soluciones de automatización conectan diferentes plataformas —como CRMs, correos electrónicos, APIs y sistemas internos— permitiendo que los datos fluyan sin problemas y las acciones se activen automáticamente. 
            
            Esto resulta en tiempos de respuesta más rápidos, menos errores y operaciones más consistentes en toda la organización.`,
        },
        company: {
            dna: `Nuestro ADN`,
            dnaTitle: `Compromiso 
            con la Excelencia`,
            dnaText: `En DeepDev, no solo escribimos código, construimos los cimientos de tu próximo éxito. Nuestro camino se define por la precisión técnica y la confianza de entregar productos de clase mundial.`,
            projects: `Proyectos Entregados`,
            uptime: `Disponibilidad Garantizada`,
            support: `Soporte 24/7`,
            title2022: `El Origen`,
            text2022: `Fundada en Argentina con la visión de transformar ideas complejas en productos digitales de alto rendimiento.`,
            title2024: `Expansión Europea y Enfoque en IA`,
            text2024: `Establecimos nuestra base en España e integramos modelos de IA en nuestros desarrollos, elevando el estándar de automatización.`,
            title2026: `Hoy: DeepDev Global`,
            text2026: `Consolidado como un estudio boutique internacional, especializado en software a medida y ecosistemas digitales escalables.`,
            global: `PRESENCIA GLOBAL`,
            globalTitle: `Talento sin Fronteras`,
            globalText: `Operamos estratégicamente desde España y Argentina, combinando la innovación europea con el ingenio y la resiliencia del talento latinoamericano. Esta dualidad nos permite ofrecer una cobertura excepcional de zona horaria y una perspectiva de mercado global.`,
            flagSpain: `España 🇪🇸`,
            flagArgentina: `Argentina 🇦🇷`,
            talk: `¿Listo para empezar tu transformación?`,
            talkButton: `Hablemos de tu proyecto`
        },
        raffles: {
            premiere: `Sorteo 2026`,
            premiereTitle: `Llevamos tu idea al Siguiente Nivel`,
            premiereText: `Para celebrar el lanzamiento de DeepDev, estamos sorteando un proyecto completo de desarrollo Full Stack. Queremos que tu proyecto tenga la presencia digital que merece, con tecnología de vanguardia y diseño de alto impacto.`,
            performance: `Rendimiento Pro`,
            performanceText: `Sitios web optimizados y ultrarrápidos.`,
            design: `Diseño Exclusivo`,
            designText: `Interfaz y experiencia de usuario diseñada para tu marca.`,
            raffleTitle: `Sorteo_FullStack`,
            raffleText: `Participa por la oportunidad de ganar un sitio web profesional completo construido por DeepDev.`,
            days: `DÍAS`,
            hours: `HORAS`,
            minutes: `MIN`,
            seconds: `SEG`,
            name: `Nombre Completo`,
            email: `Correo Electrónico`,
            project: `¿Qué sitio web te gustaría desarrollar?`,
            conditions: {
                before: `Acepto los `,
                link: `términos y condiciones`,
                after: ` del sorteo.`
            },
            error: `Debes aceptar los términos y condiciones para continuar.`,
            processing: `Generando ticket...`,
            verify: `Verificando email`,
            analyzing: `Analizando solicitud...`,
            status: `Estado: Procesando...`,
            registered: `¡Ticket Registrado!`,
            thanks: {
                before: `Gracias`,
                after: `Tu entrada ha sido guardada. 
                ¡Buena suerte!`
            },
            premio: `Premio en Juego: Desarrollo Web Profesional`,
            buttonBack: `Regresar`,
            button: `GENERAR TICKET DE SORTEO`
        },
        contact: {
            name: `Nombre:`,
            lastName: `Apellido:`,
            companyName: `Nombre de la Empresa:`,
            role: `Cargo en la empresa:`,
            email: `Email:`,
            phone: `Teléfono / WhatsApp:`,
            project: `Tipo de trabajo:`,
            projectOption: `Selecciona una opción`,
            projectNew: `Nuevo Proyecto`,
            projectRedisign: `Rediseño de sitio existente`,
            current: `Web/App actual:`,
            type: [`Tipo de Web/App:`, `Selecciona una opción`, `Landing Page`, `Sitio Web Corporativo / Institucional`, `E-commerce`, `Portfolio`, `Sitio de Servicios`, `Aplicación Web / Plataforma`, `Sistema Customizado`, `No estoy seguro todavía`],
            projectGoal: [ `Objetivo del Proyecto:`, `Selecciona un objetivo`, `Recibir consultas / Leads`, `Vender productos o servicios`, `Mostrar y fortalecer mi marca`, `Automatizar procesos`, `Otro`],
            range: [ `Rango de Presupuesto:`, `Selecciona un rango`,  `Menos de U$S 500`, `U$S 500 - U$S 1000`, `U$S 1000 - U$S 3000`, `Más de U$S 3000`, `No estoy seguro todavía`],
            available: [ `Tiempo Disponible:`, `Selecciona un plazo de entrega`, `Lo antes posible`, `1-2 meses`, `+3 meses`, `Flexible`],
            descriptionPlace: [ `Descripción del Proyecto:`, `Cuéntanos más sobre tu proyecto o idea` ],
            button: `Enviar`,
        },
        nav: {
            promo: `Visita nuestra sección de sorteos para participar por premios y obtener grandes descuentos en nuestros productos.`,
            products: `Productos`,
            sales: `Ventas`,
            company: `Compañía`,
            raffles: `Sorteos`,
            contact: `Contacto`,
            login: `Iniciar Sesión`
        },
        login: {
            title: `Bienvenido de nuevo`,
            text: `Accede a tu cuenta DeepDev`,
            email: `Email:`,
            password: `Contraseña:`,
            button: `Ingresar`,
            register: {
                before: `¿Eres nuevo en DeepDev?
                `,
                after: `Crea una cuenta`
            },
            forgot: "¿Olvidaste tu contraseña?"
        },
        register:{
            title: "Nuevo Usuario",
            email: "Email",
            password: "Contraseña",
            verifyPassword: "Verificar Contraseña:",
            passMismatch: "¡Las contraseñas no coinciden!",
            passError: "Error en la codificación de la contraseña.",
            btnRegister: "Registrarse",
            footerText: "Ya eres usuario DeepDev?",
            footerLink: "Iniciar Sesión",
            reqMinChars: "Mínimo 10 caracteres",
            reqUpper: "Una mayúscula",
            reqNumber: "Un número",
            reqSpecial: "Carácter especial (@$!%*?&)",
            errorRegister: "Error al registrar usuario."
        },
        footer: {
            deepdev: [`Reinventando Experiencias Digitales`, `Ingeniería de interfaces inmersivas donde convergen el diseño, el movimiento y la inteligencia.`],
            navigationTitle: `NAVEGACIÓN`,
            expertiseTitle: `EXPERTIZ`,
            connectTitle: `CONTACTO`,
            navigation: [`Inicio`, `Productos`, `Compañía`, `Sorteos`, `Contacto`],
            expertise: [`Ingeniería Frontend`, `Experiencias Web 3D`, `Integraciones de IA`, `Sistemas Backend`],
            connect: [`Remoto Global`, `Teléfono`],
            rights: `Todos los derechos reservados.`,
            privacy: `Política de Privacidad`,
            terms: `Términos y Condiciones`
        },
        language: `Len`,
        raffleTerm:{
            "terms_title": "Términos y Condiciones",
            "terms_subtitle": "Al participar en el sorteo de DeepDev, aceptás de manera íntegra las bases y condiciones detalladas a continuación.",
            "term1_title": "Requisitos de Participación",
            "term1_text": "Para participar, es obligatorio ser mayor de 18 años. Dado que una Landing Page o eCommerce puede tener fines lucrativos y/o económicos, el participante debe contar con capacidad legal para administrar este tipo de activos digitales.",
            "term2_title": "El Premio y Alcance",
            "term2_text": "El premio consiste exclusivamente en el desarrollo y entrega de una Landing Page o eCommerce basado en los modelos de nuestra sección de ventas. DeepDev se encarga únicamente de la creación del sitio. Los gastos de gestión, publicación en servidores (hosting), mantenimiento de bases de datos y adquisición de dominio web son pura y exclusivamente responsabilidad económica del ganador.",
            "term3_title": "Deslinde de Responsabilidad",
            "term3_text": "DeepDev entrega la herramienta técnica, pero se desliga completamente de la finalidad, contenido o uso que el ganador le dé al sitio web en el futuro. No somos responsables por usos malintencionados, actividades ilícitas o cualquier gestión económica derivada del sitio una vez entregado.",
            "term4_title": "Veracidad y Reclamo",
            "term4_text": "Cualquier dato no verídico en el formulario anula al ganador. Tras la notificación, el ganador dispone de 72 horas para reclamar su premio; de lo contrario, se procederá a una nueva selección.",
            "term5_title": "Consentimiento de Datos",
            "term5_text": "Los datos se usarán solo para fines del sorteo y publicidad de DeepDev. Al participar, das tu consentimiento para el tratamiento de dicha información y para recibir comunicaciones de la empresa.",
            "terms_footer": "DeepDev se reserva el derecho de interpretación de las presentes bases."
        },
        error404: {
            title: "404 - Página no encontrada.",
            errorMessage: "Serás redirigido automáticamente al inicio."
        },
        cookies: {
            title: "Política de Cookies",
            intro: "En DeepDev utilizamos cookies para mejorar tu experiencia de navegación y ofrecerte un servicio personalizado. Al continuar navegando en nuestro sitio, entendemos que aceptás su uso.",
            questionWhat: "¿Qué son las cookies?",
            answerWhat: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitás un sitio web. Sirven para recordar tus preferencias y ayudarte a tener una experiencia más fluida.",
            questionTypes: "¿Qué tipos de cookies usamos?",
            typeEssential: "Cookies esenciales: Necesarias para que el sitio funcione.",
            typePerformance: "Cookies de rendimiento: Analizan el uso del sitio.",
            typeFunctionality: "Cookies de funcionalidad: Recuerdan tus preferencias.",
            typeThirdParty: "Cookies de terceros: Servicios externos como redes sociales.",
            questionManage: "¿Cómo puedo gestionar las cookies?",
            answerManage: "Podés configurar tu navegador para aceptar o rechazar cookies. Tené en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del sitio."
        },
        sessionErrors: {
            loginBanned: "Usuario baneado. Contactate con DeepDev.",
            loginTooManyAttempts: "Tu cuenta fue bloqueada por demasiados intentos fallidos.",
            loginInvalidCredentials: "Credenciales inválidas.",
            loginAttemptsLeft: "Credenciales inválidas. Te quedan {{attempts}} intento(s).",
            loginGeneralError: "Error al iniciar sesión. Intentá más tarde.",
            resetEmailRequired: "Por favor, ingresa tu email para restablecer la contraseña.",
            resetEmailSent: "¡Email enviado! Revisa tu bandeja de entrada.",
            resetUserNotFound: "No existe cuenta vinculada a este correo.",
            resetInvalidEmail: "El formato del correo no es válido.",
            resetTooManyRequests:  "Demasiados intentos. Intenta más tarde.",
            logoutError: "Error al cerrar sesión.",
        }
    },
    it: {
        home: {
            reinventing: `DeepDev: Reinventando le 
            Esperienze Digitali.`,
            boost: `Potenziamo il tuo design con i migliori strumenti.`,
            real: `Interazione 3D in tempo reale.`,
            ai: `Esperienze utente 
            potenziate dall'IA.`,
            automate: `Automatizza il tuo lavoro, un clic e il gioco è fatto.`,
        },
        products: {
            webTitle: `Sviluppiamo Applicazioni Web`,
            webText: `Offriamo soluzioni web moderne progettate per i tuoi obiettivi. Dalle landing page ai sistemi eCommerce e piattaforme personalizzate, trasformiamo ogni tua idea in uno strumento digitale potente, funzionale e pronto a scalare.

            La presenza online è il primo contatto tra brand e utenti. Un sito web ben costruito comunica la tua identità e lavora per convertire i visitatori in clienti, centralizzando i servizi e permettendo al tuo business di crescere con controllo.

            Sviluppiamo infrastrutture sicure e veloci utilizzando le tecnologie più avanzate. Garantiamo un'esperienza utente impeccabile su ogni dispositivo, ottimizzando i processi digitali per mantenere il tuo business sempre un passo avanti rispetto alla concorrenza.`,

            appTitle: `App Mobile iOS e Android.`,
            appText: `Progettiamo applicazioni mobili per iOS e Android adattate alle tue esigenze. Dai prodotti MVP per validare la tua idea fino ad app aziendali complesse, creiamo strumenti digitali pronti a offrire prestazioni eccellenti e scalabili per utenti reali in tutto il mondo.

            Le app permettono al tuo brand di essere presente dove gli utenti trascorrono la maggior parte del tempo. Un software ben progettato rafforza la fedeltà del cliente, offrendo accesso immediato ai tuoi servizi e migliorando l'autorità del tuo business nel mercato digitale.

            Creiamo interfacce intuitive che garantiscono un'interazione fluida e naturale. Utilizziamo tecnologie moderne per assicurare che la tua applicazione sia veloce e sicura, trasformando ogni tocco sullo schermo in un'opportunità strategica di crescita per la tua azienda.`,

            customTitle: `Soluzioni Software su Misura.`,
            customText: `Sviluppiamo soluzioni software personalizzate in base alle esigenze specifiche della tua azienda. Dai sistemi gestionali all'automazione dei processi, trasformiamo le tue idee in strumenti digitali scalabili che potenziano l'efficienza operativa e la crescita della tua impresa.

            Ogni business ha obiettivi unici per i quali i software standard non bastano. Una soluzione su misura offre la flessibilità necessaria per adattarsi ai tuoi processi interni, eliminando i limiti dei sistemi generici e fornendo un vantaggio competitivo reale nel tuo settore.

            Creiamo architetture solide e sicure progettate per integrarsi con le tue tecnologie attuali. Ci assicuriamo che ogni software sia intuitivo e pronto a evolversi, trasformando la complessità tecnica in strumenti semplici che ottimizzano le prestazioni e il ritorno sull'investimento.`,

            AiTitle: `Integrazione di Intelligenza 
            Artificiale.`,
            AiText: `Progettiamo soluzioni di intelligenza artificiale adattate alle reali esigenze della tua azienda. Dai chatbot agli assistenti virtuali e sistemi decisionali, aiutiamo le imprese a potenziare i prodotti digitali con un'IA pratica, affidabile e orientata ai risultati.

            L'integrazione dell'IA ottimizza tempo e risorse automatizzando compiti complessi e analizzando dati in tempo reale. Implementiamo algoritmi avanzati per offrire precisione operativa, permettendo al tuo team di concentrarsi su attività ad alto valore strategico.

            Creiamo strumenti sicuri e scalabili che si evolvono con il tuo business trasformando i dati in intuizioni chiare. Il nostro approccio garantisce un'IA facile da usare che migliora l'esperienza utente e porta l'efficienza della tua impresa a un livello superiore.`,
            
            automationTitle: `Automazione dei flussi`,
            automationText: `Progettiamo e implementiamo flussi di lavoro automatizzati che connettono i tuoi sistemi, ottimizzano le operazioni ed eliminano le attività manuali ripetitive. Trasformiamo i processi frammentati in ecosistemi fluidi, riducendo gli errori e i costi operativi della tua azienda.

Integrando il tuo sito web e i tuoi strumenti interni, aiutiamo le imprese a migliorare l'efficienza e a mantenere il pieno controllo sui processi. Creiamo soluzioni che liberano tempo prezioso, permettendo al tuo team di concentrarsi sulle attività che generano vero valore.

Il nostro approccio assicura che ogni informazione arrivi nel posto giusto al momento giusto. Automatizzare significa costruire una struttura digitale agile e reattiva, capace di adattarsi alle sfide del mercato e di massimizzare la produttività complessiva del tuo business.`,
        },
        company: {
            dna: `Il Nostro DNA`,
            dnaTitle: `Impegno per l'Eccellenza`,
            dnaText: `In DeepDev non scriviamo solo codice; costruiamo le fondamenta per il tuo prossimo successo. Il nostro percorso è definito dalla precisione tecnica e dalla fiducia nel consegnare prodotti di classe mondiale.`,
            projects: `Progetti Consegnati`,
            uptime: `Uptime Garantito`,
            support: `Supporto 24/7`,
            title2022: `L'Origine`,
            text2022: `Fondata in Argentina con la visione di trasformare idee complesse in prodotti digitali ad alte prestazioni.`,
            title2024: `Espansione Europea e Focus sull'IA`,
            text2024: `Sede stabilita in Spagna e integrazione di modelli di IA nei nostri sviluppi, elevando lo standard dell'automazione.`,
            title2026: `Oggi: DeepDev Global`,
            text2026: `Consolidato come studio boutique internazionale, specializzato in software personalizzato ed ecosistemi digitali scalabili.`,
            global: `PRESENZA GLOBALE`,
            globalTitle: `Talento Senza Confini`,
            globalText: `Operiamo strategicamente da Spagna e Argentina, unendo l'innovazione europea con l'ingegno e la resilienza del talento latinoamericano.`,
            flagSpain: `Spagna 🇪🇸`,
            flagArgentina: `Argentina 🇦🇷`,
            talk: `Pronto a iniziare la tua trasformazione?`,
            talkButton: `Parliamo del tuo progetto`
        },
        raffles: {
            premiere: `Sorteggio 2026`,
            premiereTitle: `Portiamo la tua idea al Livello Successivo`,
            premiereText: `Per celebrare il lancio di DeepDev, mettiamo in palio un progetto completo di sviluppo Full Stack. Vogliamo che il tuo progetto abbia la presenza digitale che merita, con tecnologia all'avanguardia e design ad alto impatto.`,
            performance: `Prestazioni Pro`,
            performanceText: `Siti web ottimizzati e ultra-veloci.`,
            design: `Design Esclusivo`,
            designText: `Interfaccia e esperienza utente progettate per il tuo brand.`,
            raffleTitle: `Sorteggio_FullStack`,
            raffleText: `Partecipa per avere la possibilità di vincere un sito web professionale completo realizzato da DeepDev.`,
            days: `GIORNI`,
            hours: `ORE`,
            minutes: `MIN`,
            seconds: `SEC`,
            name: `Nome Completo`,
            email: `Email`,
            project: `Quale sito web ti piacerebbe sviluppare?`,
            conditions: {
                before: `Accetto i `,
                link: `termini e le condizioni`,
                after: ` del sorteggio.`
            },
            error: `Devi accettare i termini e le condizioni per continuare.`,
            processing: `Generazione del ticket...`,
            verify: `Verifica e-mail...`,
            analyzing: `Analisi della richiesta...`,
            status: `Stato: In elaborazione...`,
            registered: `Ticket Registrato!`,
            thanks: {
                before: `Grazie. `,
                after: `La tua iscrizione è stata salvata. Buona fortuna!`
            },
            premio: `Premio in Palio: Sviluppo Web Professionale`,
            buttonBack: `Indietro`,
            button: `GENERA BIGLIETTO DEL SORTEGGIO`
        },
        contact: {
            name: `Nome:`,
            lastName: `Cognome:`,
            companyName: `Nome Azienda:`,
            role: `Ruolo in azienda:`,
            email: `Email:`,
            phone: `Telefono / WhatsApp:`,
            project: `Tipo di progetto:`,
            projectOption: `Seleziona un'opzione`,
            projectNew: `Nuovo Progetto`,
            projectRedisign: `Restyling sito esistente`,
            current: `Sito Web/App attuale:`,
            type: [`Tipo di Web/App:`, `Seleziona un'opzione`, `Landing Page`, `Sito Aziendale / Istituzionale`, `E-commerce`, `Portfolio`, `Sito di Servizi`, `Applicazione Web / Piattaforma`, `Sistema Personalizzato`, `Non sono ancora sicuro`],
            projectGoal: [`Obiettivo del Progetto:`, `Seleziona un obiettivo`, `Ricevere richieste / Lead`, `Vendere prodotti o servizi`, `Mostrare e rafforzare il brand`, `Automatizzare i processi`, `Altro`],
            range: [`Budget stimato:`, `Seleziona un range`, `Meno di U$S 500`, `U$S 500 - U$S 1000`, `U$S 1000 - U$S 3000`, `Più di U$S 3000`, `Non sono ancora sicuro`],
            available: [`Disponibilità di tempo:`, `Seleziona una scadenza`, `Il prima possibile`, `1-2 mesi`, `+3 mesi`, `Flessibile`],
            descriptionPlace: [`Descrizione del Progetto:`, `Raccontaci di più sul tuo progetto o idea`],
            button: `Invia Messaggio`,
        },
        nav: {
            promo: `Visita la nostra sezione sorteggi per partecipare all'estrazione di premi e ottenere grandi sconti sui nostri prodotti.`,
            products: `Prodotti`,
            sales: `Vendite`,
            company: `Azienda`,
            raffles: `Sorteggi`,
            contact: `Contatti`,
            login: `Accedi`
        },
        login: {
            title: `Bentornato`,
            text: `Accedi al tuo account DeepDev`,
            email: `Email`,
            password: `Password`,
            button: `Accedi`,
            register: {
                before: `Nuovo in DeepDev? `,
                after: `Crea un account`
            },
            forgot: "Password dimenticata?"
        },
        register:{
            title: "Nuovo Utente",
            email: "Email",
            password: "Password",
            verifyPassword: "Verifica Password:",
            passMismatch: "Le password non corrispondono!",
            passError: "Errore di codifica della password.",
            btnRegister: "Registrati",
            footerText: "Sei già un utente DeepDev?",
            footerLink: "Accedi",
            reqMinChars: "Minimo 10 caratteri",
            reqUpper: "Una lettera maiuscola",
            reqNumber: "Un numero",
            reqSpecial: "Carattere speciale (@$!%*?&)",
            errorRegister: "Errore durante la registrazione."
        },
        footer: {
            deepdev: [`Reinventando le Esperienze Digitali`, `Ingegneria di interfacce immersive dove convergono design, movimento e intelligenza.`],
            navigationTitle: `NAVIGAZIONE`,
            expertiseTitle: `COMPETENZE`,
            connectTitle: `CONTATTI`,
            navigation: [`Home`, `Prodotti`, "Vendite", `Azienda`, `Sorteggi`, `Contatti`],
            expertise: [`Ingegneria Frontend`, `Esperienze Web 3D`, `Integrazioni IA`, `Sistemas Backend`],
            connect: [`Remoto Globale`, `Telefono`],
            rights: `Tutti i diritti riservati.`,
            privacy: `Informativa sulla Privacy`,
            terms: `Termini e Condizioni`
        },
        language: `Lin`,
        raffleTerm:{
            "terms_title": "Termini e Condizioni",
            "terms_subtitle": "Partecipando al sorteggio di DeepDev, accetti integralmente i termini e le condizioni dettagliate di seguito.",
            "term1_title": "Requisiti di Partecipazione",
            "term1_text": "Per partecipare è obbligatorio essere maggiorenni (18+). Poiché una Landing Page o un eCommerce possono avere scopi lucrativi e/o economici, il partecipante deve avere la capacità legale di gestire questo tipo di asset digitali.",
            "term2_title": "Il Premio e l'Ambito",
            "term2_text": "Il premio consiste esclusivamente nello sviluppo e nella consegna di una Landing Page o eCommerce basata sui modelli della nostra sezione vendite. DeepDev si occupa solo della creazione del sito. I costi di gestione, hosting, manutenzione del database e acquisizione del dominio sono pura ed esclusiva responsabilità economica del vincitore.",
            "term3_title": "Esclusione di Responsabilità",
            "term3_text": "DeepDev fornisce lo strumento tecnico, ma declina ogni responsabilità per lo scopo, il contenuto o l'uso futuro del sito web. Non siamo responsabili per usi malevoli, attività illecite o qualsiasi gestione economica derivante dal sito dopo la consegna.",
            "term4_title": "Veridicità e Reclamo",
            "term4_text": "Qualsiasi dato non veritiero nel modulo annulla il vincitore. Dopo la notifica, il vincitore ha 72 ore per richiedere il premio, altrimenti si procederà a una nuova selezione.",
            "term5_title": "Consenso ai Dati",
            "term5_text": "I dati verranno utilizzati solo per il sorteggio e la pubblicità di DeepDev. Partecipando, acconsenti al trattamento di tali informazioni e a ricevere comunicazioni dall'azienda.",
            "terms_footer": "DeepDev si riserva il diritto di interpretazione delle presenti basi."
        },
        error404: {
            title: "404 - Pagina non trovata.",
            errorMessage: "Verrai reindirizzato automaticamente alla pagina iniziale."
        },
        cookies: {
            title: "Politica sui Cookie",
            intro: "In DeepDev utilizziamo i cookie per migliorare la tua esperienza di navigazione e offrirti un servizio personalizzato. Continuando a navigare sul nostro sito, intendiamo che ne accetti l'utilizzo.",
            questionWhat: "Cosa sono i cookie?",
            answerWhat: "I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. Servono a ricordare le tue preferenze e ad aiutarti ad avere un'esperienza più fluida.",
            questionTypes: "Che tipi di cookie utilizziamo?",
            typeEssential: "Cookie essenziali: Necessari per il funzionamento del sito.",
            typePerformance: "Cookie di prestazione: Analizzano l'utilizzo del sito.",
            typeFunctionality: "Cookie di funzionalità: Ricordano le tue preferenze.",
            typeThirdParty: "Cookie di terze parti: Servizi esterni come i social network.",
            questionManage: "Come posso gestire i cookie?",
            answerManage: "Puoi configurare il tuo browser per accettare o rifiutare i cookie. Tieni presente che la disattivazione di alcuni cookie potrebbe influire sulla funzionalità del sito."
        },
        sessionErrors: {
            loginBanned: "Utente bannato. Contatta DeepDev.",
            loginTooManyAttempts: "Il tuo account è stato bloccato per troppi tentativi falliti.",
            loginInvalidCredentials: "Credenziali non valide.",
            loginAttemptsLeft: "Credenziali non valide. Ti rimangono {{attempts}} tentativi.",
            loginGeneralError: "Errore durante l'accesso. Riprova più tardi.",
            resetEmailRequired: "Per favore, inserisci la tua email per reimpostare la password.",
            resetEmailSent: "Email inviata! Controlla la tua posta in arrivo.",
            resetUserNotFound: "Non esiste un account collegato a questa email.",
            resetInvalidEmail: "Il formato dell'email non è valido.",
            resetTooManyRequests: "Troppi tentativi. Riprova più tardi.",
            logoutError: "Errore durante la disconnessione."
        },
    },
    fr: {
        home: {
            reinventing: `DeepDev : Réinventer les 
            Expériences Numériques.`,
            boost: `Boostez votre design avec les meilleurs outils.`,
            real: `Interaction 3D en temps réel.`,
            ai: `Expériences utilisateur 
            optimisées par l'IA.`,
            automate: `Automatisez votre travail, un clic et c'est fait.`,
        },
        products: {
            webTitle: `Développement d'apps web`,
            webText: `Des solutions adaptées à vos objectifs : des landing pages à fort impact aux sites institutionnels, en passant par l’e-commerce et les systèmes web sur mesure. Votre présence en ligne est souvent le premier point de contact avec vos clients.

            Un site bien conçu ne se contente pas de présenter votre marque ; il convertit vos visiteurs, centralise vos services et soutient votre croissance avec flexibilité. Que vous souhaitiez vendre en ligne, promouvoir votre image ou gérer des données via une plateforme dédiée, nos applications web offrent une solution évolutive et accessible sur tous les supports.`,
            appTitle: `Apps Mobiles iOS & Android.`,
            appText: `Nous concevons et développons des applications mobiles pour iOS et Android, des MVP ciblés aux produits complets prêts pour le marché.

            Une application mobile permet à votre marque d'être présente là où vos utilisateurs passent le plus clair de leur temps. Une application performante offre rapidité, efficacité et une expérience utilisateur fluide, créant ainsi un lien direct et constant entre votre produit et votre audience.

            Que vous souhaitiez lancer une nouvelle idée, adapter votre produit au format mobile ou offrir une expérience dédiée, nos solutions mobiles sont puissantes, évolutives et offrent un ressenti natif sur tous les appareils.`,

            customTitle: `Software sur mesure.`,
            customText: `Nous concevons des solutions logicielles adaptées à vos besoins : des systèmes de gestion à l'automatización de processus. Nous transformons vos idées en outils numériques évolutifs pour renforcer votre entreprise.

            Les solutions génériques sont souvent limitées face à vos défis uniques. Le logiciel sur mesure permet de centraliser vos données, d'automatiser vos tâches et de garder le contrôle total sur vos opérations.

            Qu'il s'agisse d'un système de gestion ou d'un tableau de bord personnalisé, nous créons des solutions flexibles conçues para accompagner votre croissance.`,

            AiTitle: `Intégration d'IA`,
            AiText: `Nous concevons et intégrons des solutions d'IA adaptées aux besoins réels de votre entreprise. Des chatbots personnalisés aux flux de décision intelligents, nous renforçons vos produits avec une intelligence artificielle pratique et fiable.

            Notre approche repose sur une IA contrôlée, sécurisée et parfaitement intégrée à vos systèmes, données et flux de travail existants.

            Plutôt que des solutions génériques, nous créons des intégrations sur mesure qui améliorent l'expérience utilisateur, réduisent la charge opérationnelle et permettent une automatisation intelligente à grande échelle.`,

            automationTitle: `Automatisation Process`,
            automationText: `Nous concevons et implémentons des flux de travail automatisés qui connectent intelligemment vos systèmes, simplifient vos opérations quotidiennes et éliminent les tâches manuelles répétitives. En intégrant votre site web, vos applications et vos outils internes, nous aidons votre entreprise à gagner en efficacité tout en conservant un contrôle total sur chaque processus.

            Nos solutions d'automatisation permettent de relier des plateformes hétérogènes — telles que vos CRM, services de messagerie, API et systèmes propriétaires — pour assurer une circulation fluide des données et le déclenchement automatique d'actions stratégiques.

            Cette architecture se traduit par une réactivité accrue, une réduction drastique des erreurs humaines et une cohérence opérationnelle parfaite sur l'ensemble de votre organisation. Qu'il s'agisse de synchronisation de données ou de processus multi-étapes complexes, nous bâtissons des workflows évolutifs adaptés à vos besoins spécifiques.`,
        },
        company: {
            dna: `Notre ADN`,
            dnaTitle: `Engagement vers l'Excellence`,
            dnaText: `Chez DeepDev, nous n'écrivons pas seulement du code ; nous bâtissons les fondations de votre futur succès. Notre parcours se définit par la précision technique et la confiance de livrer des produits de classe mondiale.`,
            projects: `Projets Livrés`,
            uptime: `Disponibilité Garantie`,
            support: `Support 24/7`,
            title2022: `L'Origine`,
            text2022: `Fondée en Argentine avec la vision de transformer des idées complexes en produits numériques de haute performance.`,
            title2024: `Expansion Européenne & Focus IA`,
            text2024: `Établissement de notre base en Espagne et intégration de modèles d'IA dans nos développements, élevant les standards de l'automatisation.`,
            title2026: `Aujourd'hui : DeepDev Global`,
            text2026: `Consolidé comme un studio boutique international, spécialisé dans les logiciels sur mesure et les écosystèmes numériques évolutifs.`,
            global: `PRÉSENCE GLOBALE`,
            globalTitle: `Le Talent sans Frontières`,
            globalText: `Nous opérons stratégiquement depuis l'Espagne et l'Argentine, alliant l'innovation européenne à l'ingéniosité et la résilience du talent latino-américain.`,
            flagSpain: `Espagne 🇪🇸`,
            flagArgentina: `Argentine 🇦🇷`,
            talk: `Prêt à commencer votre transformation ?`,
            talkButton: `Parlons de votre projet`
        },
        raffles: {
            premiere: `Tirage au sort 2026`,
            premiereTitle: `Propulsez votre idée au Niveau Supérieur`,
            premiereText: `Pour célébrer le lancement de DeepDev, nous offrons un projet de développement Full Stack complet. Nous voulons que votre projet ait la présence numérique qu'il mérite.`,
            performance: `Performance Pro`,
            performanceText: `Sites web optimisés et ultra-rapides.`,
            design: `Design Exclusif`,
            designText: `Interface et expérience utilisateur conçues pour votre marque.`,
            raffleTitle: `Tirage_FullStack`,
            raffleText: `Participez pour tenter de gagner un site web professionnel complet conçu par DeepDev.`,
            days: `JOURS`,
            hours: `HEURES`,
            minutes: `MIN`,
            seconds: `SEC`,
            name: `Nom Complet`,
            email: `E-mail`,
            project: `Quel site web aimeriez-vous développer ?`,
            conditions: {
                before: `J'accepte les `,
                link: `termes et conditions`,
                after: ` du tirage au sort.`
            },
            error: `Vous devez accepter les termes et conditions pour continuer.`,
            processing: `Génération du ticket...`,
            verify: `Vérification de l'e-mail...`,
            analyzing: `Analyse de la demande...`,
            status: `État : En cours...`,
            registered: `Ticket Enregistré !`,
            thanks: {
                before: `Merci. `,
                after: `Votre participation a été enregistrée. Bonne chance !`
            },
            premio: `Prix en Jeu : Développement Web Professionnel`,
            buttonBack: `Retour`,
            button: `GÉNÉRER MON TICKET`
        },
        contact: {
            name: `Nom :`,
            lastName: `Prénom :`,
            companyName: `Nom de l'entreprise :`,
            role: `Poste dans l'entreprise :`,
            email: `E-mail :`,
            phone: `Téléphone / WhatsApp :`,
            project: `Type de projet :`,
            projectOption: `Sélectionnez une option`,
            projectNew: `Nouveau Projet`,
            projectRedisign: `Refonte d'un site existant`,
            current: `Site Web/App actuel :`,
            type: [`Type de Web/App :`, `Sélectionnez une option`, `Landing Page`, `Site Institutionnel`, `E-commerce`, `Portfolio`, `Site de Services`, `Application Web / Plateforme`, `Système personnalisé`, `Pas encore sûr`],
            projectGoal: [`Objectif du projet :`, `Sélectionnez un objectif`, `Recevoir des demandes / Leads`, `Vendre des produits ou services`, `Renforcer mon image de marque`, `Automatiser des processus`, `Autre`],
            range: [`Budget prévu :`, `Sélectionnez une fourchette`, `Moins de 500 U$S`, `500 - 1000 U$S`, `1000 - 3000 U$S`, `Plus de 3000 U$S`, `Pas encore sûr`],
            available: [`Délai souhaité :`, `Sélectionnez un délai`, `Dès que possible`, `1-2 mois`, `+3 mois`, `Flexible`],
            descriptionPlace: [`Description du projet :`, `Dites-nous en plus sur votre projet ou votre idée`],
            button: `Envoyer le Message`,
        },
        nav: {
            promo: `Consultez notre section concours pour participer aux tirages au sort et obtenir des réductions.`,
            products: `Produits`,
            sales: `Ventes`,
            company: `Entreprise`,
            raffles: `Concours`,
            contact: `Contact`,
            login: `Connexion`
        },
        login: {
            title: `Bon retour`,
            text: `Accédez à votre compte DeepDev`,
            email: `E-mail`,
            password: `Mot de passe`,
            button: `Se connecter`,
            register: {
                before: `Nouveau chez DeepDev ? 
                `,
                after: `Créer un compte`
            },
            forgot: "Mot de passe oublié ?"
        },
        register:{
            title: "Nouvel Utilisateur",
            email: "E-mail",
            password: "Mot de passe",
            verifyPassword: "Vérifier le mot de passe :",
            passMismatch: "Les mots de passe ne correspondent pas !",
            passError: "Erreur d'encodage du mot de passe.",
            btnRegister: "S'inscrire",
            footerText: "Déjà utilisateur DeepDev ?",
            footerLink: "Se connecter",
            reqMinChars: "Minimum 10 caractères",
            reqUpper: "Une majuscule",
            reqNumber: "Un chiffre",
            reqSpecial: "Caractère spécial (@$!%*?&)",
            errorRegister: "Erreur lors de l'inscription."
        },
        footer: {
            deepdev: [`Réinventer les Expériences Numériques`, `Ingénierie d'interfaces inmersives où convergent design, mouvement et intelligence.`],
            navigationTitle: `NAVIGATION`,
            expertiseTitle: `EXPERTISE`,
            connectTitle: `CONTACT`,
            navigation: [`Accueil`, `Produits`, "Ventes", `Entreprise`, `Concours`, `Contact`],
            expertise: [`Ingénierie Frontend`, `Expériences Web 3D`, `Intégrations IA`, `Systèmes Backend`],
            connect: [`Remote Global`, `Téléphone`],
            rights: `Tous droits réservés.`,
            privacy: `Politique de Confidentialité`,
            terms: `Conditions Générales`
        },
        language: `Lan`,
        raffleTerm:{
            "terms_title": "Conditions Générales",
            "terms_subtitle": "En participant au tirage au sort de DeepDev, vous acceptez pleinement les conditions générales détaillées ci-dessous.",
            "term1_title": "Conditions de Participation",
            "term1_text": "Pour participer, il est obligatoire d'avoir plus de 18 ans. Étant donné qu'une Landing Page ou un eCommerce peut avoir des fins lucratives et/ou économiques, le participant doit avoir la capacité juridique de gérer ce type d'actifs numériques.",
            "term2_title": "Le Prix et la Portée",
            "term2_text": "Le prix consiste exclusivement en le développement et la livraison d'une Landing Page ou d'un eCommerce basé sur les modèles de notre section de vente. DeepDev est responsable uniquement de la création du site. Les frais de gestion, d'hébergement, de maintenance et d'acquisition de domaine sont exclusivement la responsabilité financière du gagnant.",
            "term3_title": "Exclusion de Responsabilité",
            "term3_text": "DeepDev fournit l'outil technique mais décline toute responsabilité quant à la finalité, au contenu ou à l'utilisation future du site web. Nous ne sommes pas responsables des utilisations malveillantes, activités illicites ou gestion économique découlant du site après livraison.",
            "term4_title": "Véracité et Réclamation",
            "term4_text": "Toute donnée non véridique dans le formulaire annule le gagnant. Après notification, le gagnant dispose de 72 heures pour réclamer son prix, faute de quoi une nouvelle sélection sera effectuée.",
            "term5_title": "Consentement des Données",
            "term5_text": "Les données seront utilisées uniquement pour le tirage au sort et la publicité de DeepDev. En participant, vous consentez au traitement de ces informations et à la réception de communications de l'entreprise.",
            "terms_footer": "DeepDev se réserve le droit d'interprétation des présentes bases."
        },
        error404: {
            title: "404 - Page non trouvée.",
            errorMessage: "Vous serez automatiquement redirigé vers la page d'accueil."
        },
         cookies: {
            title: "Politique relative aux Cookies",
            intro: "Chez DeepDev, nous utilisons des cookies pour améliorer votre expérience de navigation et vous offrir un service personnalisé. En continuant à naviguer sur notre site, nous considérons que vous acceptez leur utilisation.",
            questionWhat: "Que sont les cookies ?",
            answerWhat: "Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils servent à mémoriser vos préférences et à vous aider à avoir une expérience plus fluide.",
            questionTypes: "Quels types de cookies utilisons-nous ?",
            typeEssential: "Cookies essentiels : Nécessaires au fonctionnement du site.",
            typePerformance: "Cookies de performance : Ils analysent l'utilisation du site.",
            typeFunctionality: "Cookies de fonctionnalité : Ils mémorisent vos préférences.",
            typeThirdParty: "Cookies tiers : Services externes tels que les réseaux sociaux.",
            questionManage: "Comment puis-je gérer les cookies ?",
            answerManage: "Vous pouvez configurer votre navigateur pour accepter ou refuser les cookies. Notez que la désactivation de certains cookies peut affecter la fonctionnalité du site."
        },
        sessionErrors: {
            loginBanned: "Utilisateur banni. Contactez DeepDev.",
            loginTooManyAttempts: "Votre compte a été bloqué suite à trop de tentatives infructueuses.",
            loginInvalidCredentials: "Identifiants invalides.",
            loginAttemptsLeft: "Identifiants invalides. Il vous reste {{attempts}} tentative(s).",
            loginGeneralError: "Erreur lors de la connexion. Réessayez plus tard.",
            resetEmailRequired: "Veuillez saisir votre e-mail pour réinitialiser le mot de passe.",
            resetEmailSent: "E-mail envoyé ! Vérifiez votre boîte de réception.",
            resetUserNotFound: "Aucun compte n'est lié à cet e-mail.",
            resetInvalidEmail: "Le format de l'e-mail n'est pas valide.",
            resetTooManyRequests: "Trop de tentatives. Réessayez plus tard.",
            logoutError: "Erreur lors de la déconnexion."
        },
    },
    de: {
        home: {
            reinventing: `DeepDev: Digitale Erlebnisse 
            neu definiert.`,
            boost: `Wir optimieren Ihr Design mit den besten Tools.`,
            real: `3D-Interaktion in Echtzeit.`,
            ai: `KI-gestützte 
            Benutzererlebnisse.`,
            automate: `Automatisieren Sie Ihre Arbeit – ein Klick genügt.`,
        },
        products: {
            webTitle: `Wir bauen Webanwendungen.`,
            webText: `Wir entwickeln moderne Weblösungen, die strategisch auf Ihre Ziele zugeschnitten sind. Von Landingpages bis zu E-Commerce-Plattformen verwandeln wir Ihre Ideen in leistungsstarke digitale Werkzeuge, die flexibel mit Ihrem Unternehmen mitwachsen.

            Ihre Website ist der zentrale Kontaktpunkt zu Ihren Kunden. Ein gut strukturiertes System kommuniziert Ihre Identität, konvertiert Besucher effektiv und ermöglicht Ihnen die volle Kontrolle über Ihr digitales Wachstum.

            Wir setzen auf modernste Technologien für maximale Leistung und Sicherheit. Dies garantiert eine einwandfreie Benutzererfahrung auf allen Geräten und optimiert Ihre Prozesse, damit Sie dem Wettbewerb immer einen Schritt voraus bleiben.`,
            appTitle: `Mobile Apps für iOS & Android.`,
            appText: `Wir entwickeln fortschrittliche Apps für iOS und Android, passgenau für Ihre Bedürfnisse. Von MVPs bis zu komplexen Business-Lösungen schaffen wir digitale Werkzeuge, die durch exzellente Leistung und weltweite Skalierbarkeit überzeugen.

            Apps stärken Ihre Markenpräsenz dort, wo Ihre Kunden sind. Als direkter Kommunikationskanal verbessern sie die Kundenbindung, bieten sofortigen Zugang zu Ihren Diensten und erhöhen Ihre Autorität im digitalen Markt.

            Unser Fokus liegt auf intuitiven Interfaces für eine flüssige User Experience. Mit moderner Technologie stellen wir sicher, dass Ihre Anwendung schnell und sicher bleibt – so wird jede Interaktion zu einer strategischen Wachstumschance.`,

            customTitle: `Maßgeschneiderte Softwarelösungen.`,
            customText: `Wir entwickeln maßgeschneiderte Softwarelösungen, die exakt auf Ihre Anforderungen zugeschnitten sind. Von Managementsystemen bis zur Prozessautomatisierung schaffen wir skalierbare digitale Werkzeuge, die Ihre betriebliche Effizienz und das Wachstum Ihres Unternehmens nachhaltig steigern.

            Da Standardsoftware oft an ihre Grenzen stößt, bietet Individualsoftware die nötige Flexibilität für Ihre einzigartigen Abläufe. So eliminieren Sie die Einschränkungen generischer Systeme und gewinnen einen echten Wettbewerbsvorteil in Ihrer Branche.

            Wir setzen auf sichere Architekturen, die sich nahtlos in Ihre Infrastruktur integrieren. Unsere intuitiven Lösungen wachsen mit Ihrem Unternehmen und verwandeln technische Komplexität in einfache Werkzeuge, die Ihre Leistung und Ihren Erfolg maximieren.`,

            AiTitle: `KI-Systemintegration.`,
            AiText: `Wir konzipieren maßgeschneiderte KI-Lösungen von Chatbots bis zu Entscheidungssystemen. So optimieren wir Ihre digitalen Produkte mit einer praktischen und zuverlässigen KI, die echten geschäftlichen Mehrwert bietet.

            Die Integration automatisiert komplexe Aufgaben und analysiert Daten in Echtzeit. Das spart wertvolle Ressourcen und ermöglicht es Ihrem Team, sich auf strategische Aktivitäten mit hoher Priorität zu konzentrieren.

            Unsere skalierbaren KI-Tools verwandeln Informationen in klare Erkenntnisse. Wir schaffen intuitive Systeme, die das Nutzererlebnis verbessern und die Effizienz Ihres Unternehmens nachhaltig auf ein neues Niveau heben.`,
            automationTitle: `Prozess-Automation.`,
            automationText: `Wir implementieren automatisierte Workflows, die Ihre Systeme nahtlos verbinden, Abläufe rationalisieren und repetitive manuelle Aufgaben eliminieren. So schaffen wir effiziente digitale Prozesse, die menschliche Fehler reduzieren und die Betriebskosten senken.

Durch die Integration Ihrer Tools helfen wir Ihrem Unternehmen, die Effizienz zu steigern und die volle Kontrolle über alle Arbeitsabläufe zu behalten. Das Ergebnis ist eine agile Struktur, die wertvolle Zeit für strategische Aufgaben freisetzt und Ihr Wachstum beschleunigt.`,
        },
        company: {
            dna: `Unsere DNA`,
            dnaTitle: `Verpflichtung 
            zu Exzellenz`,
            dnaText: `Bei DeepDev schreiben wir nicht nur Code; wir bauen das Fundament für Ihren nächsten Erfolg. Unser Weg ist geprägt von technischer Präzision und dem Vertrauen, erstklassige Produkte zu liefern.`,
            projects: `Abgeschlossene Projekte`,
            uptime: `Garantierte Verfügbarkeit`,
            support: `24/7 Support`,
            title2022: `Der Ursprung`,
            text2022: `Gegründet in Argentinien mit der Vision, komplexe Ideen in leistungsstarke digitale Produkte zu verwandeln.`,
            title2024: `Europäische Expansion & KI-Fokus`,
            text2024: `Gründung unseres Standorts in Spanien und Integration von KI-Modellen, um neue Standards in der Automatisierung zu setzen.`,
            title2026: `Heute: DeepDev Global`,
            text2026: `Konsolidiert als internationales Boutique-Studio, spezialisiert auf Individualsoftware und skalierbare digitale Ökosysteme.`,
            global: `GLOBALE PRÄSENZ`,
            globalTitle: `Talent ohne Grenzen`,
            globalText: `Wir agieren strategisch von Spanien und Argentinien aus und kombinieren europäische Innovation mit dem Scharfsinn und der Resilienz lateinamerikanischer Talente.`,
            flagSpain: `Spanien 🇪🇸`,
            flagArgentina: `Argentinien 🇦🇷`,
            talk: `Bereit für Ihre Transformation?`,
            talkButton: `Lassen Sie uns über Ihr Projekt sprechen`
        },
        raffles: {
            premiere: `Gewinnspiel 2026`,
            premiereTitle: `Wir bringen Ihre Idee auf das nächste`,
            premiereText: `Zur Feier des Launchs von DeepDev verlosen wir ein komplettes Full-Stack-Entwicklungsprojekt. Wir möchten, dass Ihr Projekt die digitale Präsenz erhält, die es verdient.`,
            performance: `Pro Performance`,
            performanceText: `Optimierte und ultraschnelle Websites.`,
            design: `Exklusives Design`,
            designText: `Benutzeroberfläche und UX, maßgeschneidert für Ihre Marke.`,
            raffleTitle: `FullStack_Gewinnspiel`,
            raffleText: `Nehmen Sie teil und gewinnen Sie eine professionelle Website von DeepDev.`,
            days: `TAGE`,
            hours: `STD`,
            minutes: `MIN`,
            seconds: `SEK`,
            name: `Vollständiger Name`,
            email: `E-Mail`,
            project: `Welches Webprojekt möchten Sie entwickeln?`,
            conditions: {
                before: `Ich akzeptiere die `,
                link: `Teilnahmebedingungen`,
                after: ` des Gewinnspiels.`
            },
            error: `Sie müssen die Teilnahmebedingungen akzeptieren, um fortzufahren.`,
            processing: `Ticket wird generiert...`,
            verify: `E-Mail wird verifiziert...`,
            analyzing: `Anfrage wird analysiert...`,
            status: `Status: In Bearbeitung...`,
            registered: `Ticket Registriert!`,
            thanks: {
                before: `Danke. `,
                after: `Dein Eintrag wurde gespeichert. Viel Glück!`
            },
            premio: `Gewinnspiel-Preis: Professionelle Webentwicklung`,
            buttonBack: `Zurück`,
            button: `GEWINNSPIEL-TICKET GENERIEREN`
        },
        contact: {
            name: `Vorname:`,
            lastName: `Nachname:`,
            companyName: `Firmenname:`,
            role: `Position im Unternehmen:`,
            email: `E-Mail:`,
            phone: `Telefon / WhatsApp:`,
            project: `Projekttyp:`,
            projectOption: `Wählen Sie eine Option`,
            projectNew: `Neues Projekt`,
            projectRedisign: `Redesign einer bestehenden Website`,
            current: `Aktuelle Web/App:`,
            type: [`Web/App Typ:`, `Wählen Sie eine Option`, `Landingpage`, `Unternehmenswebsite`, `E-Commerce`, `Portfolio`, `Service-Website`, `Web-Anwendung / Plattform`, `Individuelles System`, `Noch nicht sicher`],
            projectGoal: [`Projektziel:`, `Wählen Sie ein Ziel`, `Anfragen generieren / Leads`, `Produkte oder Dienstleistungen verkaufen`, `Marke stärken`, `Prozesse automatisieren`, `Sonstiges`],
            range: [`Budgetrahmen:`, `Wählen Sie einen Bereich`, `Weniger als 500 U$S`, `500 - 1000 U$S`, `1000 - 3000 U$S`, `Mehr als 3000 U$S`, `Noch nicht sicher`],
            available: [`Zeitrahmen:`, `Wählen Sie eine Frist`, `So schnell wie möglich`, `1-2 Monate`, `+3 Monate`, `Flexibel`],
            descriptionPlace: [`Projektbeschreibung:`, `Erzählen Sie uns mehr über Ihr Projekt oder Ihre Idee`],
            button: `Nachricht Senden`,
        },
        nav: {
            promo: `Besuchen Sie unseren Gewinnspiel-Bereich und gewinnen Sie tolle Preise oder Rabatte auf unsere Produkte.`,
            products: `Produkte`,
            sales: `Verkäufe`,
            company: `Unternehmen`,
            raffles: `Gewinnspiele`,
            contact: `Kontakt`,
            login: `Login`
        },
        login: {
            title: `Willkommen zurück`,
            text: `Melden Sie sich bei Ihrem DeepDev-Konto an`,
            email: `E-mail`,
            password: `Passwort`,
            button: `Anmelden`,
            register: {
                before: `Neu bei DeepDev? `,
                after: `Konto erstellen`
            },
            forgot: "Passwort vergessen?"
        },
        register:{
            title: "Neuer Benutzer",
            email: "E-Mail",
            password: "Passwort",
            verifyPassword: "Passwort bestätigen:",
            passMismatch: "Passwörter stimmen nicht überein!",
            passError: "Fehler bei der Passwortkodierung.",
            btnRegister: "Registrieren",
            footerText: "Bereits DeepDev-Nutzer?",
            footerLink: "Anmelden",
            reqMinChars: "Mindestens 10 Zeichen",
            reqUpper: "Ein Großbuchstabe",
            reqNumber: "Eine Zahl",
            reqSpecial: "Sonderzeichen (@$!%*?&)",
            errorRegister: "Fehler bei der Registrierung."
        },
        footer: {
            deepdev: [`Digitale Erlebnisse neu definiert`, `Engineering von immersiven Interfaces, in denen Design, Motion und Intelligenz verschmelzen.`],
            navigationTitle: `NAVIGATION`,
            expertiseTitle: `EXPERTISE`,
            connectTitle: `KONTAKT`,
            navigation: [`Home`, `Produkte`,"Verkäufe", `Unternehmen`, `Gewinnspiele`, `Kontakt`],
            expertise: [`Frontend Engineering`, `3D Web Experiences`, `KI-Integration`, `Backend Systeme`],
            connect: [`Global Remote`, `Telefon`],
            rights: `Alle Rechte vorbehalten.`,
            privacy: `Datenschutzerklärung`,
            terms: `AGB`
        },
        language: `Spr`,
        raffleTerm:{
            "terms_title": "Allgemeine Geschäftsbedingungen",
            "terms_subtitle": "Durch die Teilnahme am Gewinnspiel von DeepDev akzeptieren Sie die unten aufgeführten Bedingungen in vollem Umfang.",
            "term1_title": "Teilnahmevoraussetzungen",
            "term1_text": "Um teilzunehmen, ist ein Mindestalter von 18 Jahren erforderlich. Da eine Landingpage oder ein eCommerce lukrativen Zwecken dienen kann, muss der Teilnehmer über die Rechtsfähigkeit verfügen, diese Art von digitalen Vermögenswerten zu verwalten.",
            "term2_title": "Der Preis und Umfang",
            "term2_text": "Der Preis besteht ausschließlich aus der Entwicklung und Lieferung einer Landingpage oder eines eCommerce basierend auf den Modellen unserer Verkaufsabteilung. DeepDev ist nur für die Erstellung der Website verantwortlich. Kosten für Verwaltung, Hosting, Datenbankpflege und Domainregistrierung liegen einzig und allein in der finanziellen Verantwortung des Gewinners.",
            "term3_title": "Haftungsausschluss",
            "term3_text": "DeepDev stellt das technische Werkzeug zur Verfügung, lehnt jedoch jede Verantwortung für den Zweck, den Inhalt oder die zukünftige Nutzung der Website ab. Wir haften nicht für missbräuchliche Verwendung, rechtswidrige Aktivitäten oder die wirtschaftliche Verwaltung nach der Übergabe.",
            "term4_title": "Wahrhaftigkeit und Anspruch",
            "term4_text": "Falsche Angaben im Formular führen zum Ausschluss des Gewinners. Nach der Benachrichtigung hat der Gewinner 72 Stunden Zeit, den Preis zu beanspruchen; andernfalls erfolgt eine Neuauswahl.",
            "term5_title": "Dateneinwilligung",
            "term5_text": "Die Daten werden nur für Gewinnspiel- und Werbezwecke von DeepDev verwendet. Durch die Teilnahme willigen Sie in die Verarbeitung dieser Informationen und den Erhalt von Mitteilungen des Unternehmens ein.",
            "terms_footer": "DeepDev behält sich das Recht zur Interpretation dieser Regeln vor."
        },
        error404:{
            title: "404 - Seite nicht gefunden.",
            errorMessage: "Sie werden automatisch zur Startseite weitergeleitet."
        },
        cookies: {
            title: "Cookie-Richtlinie",
            intro: "Bei DeepDev verwenden wir Cookies, um Ihr Surferlebnis zu verbessern und Ihnen einen personalisierten Service zu bieten. Durch die weitere Nutzung unserer Website gehen wir davon aus, dass Sie deren Verwendung akzeptieren.",
            questionWhat: "Was sind Cookies?",
            answerWhat: "Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie eine Website besuchen. Sie dienen dazu, Ihre Präferenzen zu speichern und Ihnen ein reibungsloses Erlebnis zu ermöglichen.",
            questionTypes: "Welche Arten von Cookies verwenden wir?",
            typeEssential: "Essenziell Cookies: Notwendig für das Funktionieren der Website.",
            typePerformance: "Leistungs-Cookies: Sie analysieren die Nutzung der Website.",
            typeFunctionality: "Funktionalitäts-Cookies: Sie speichern Ihre Präferenzen.",
            typeThirdParty: "Cookies von Drittanbietern: Externe Dienste wie soziale Netzwerke.",
            questionManage: "Wie kann ich Cookies verwalten?",
            answerManage: "Sie können Ihren Browser so konfigurieren, dass er Cookies akzeptiert oder ablehnt. Bitte beachten Sie, dass die Deaktivierung bestimmter Cookies die Funktionalität der Website beeinträchtigen kann."
        },
        sessionErrors: {
            loginBanned: "Benutzer gesperrt. Kontaktieren Sie DeepDev.",
            loginTooManyAttempts: "Ihr Konto wurde wegen zu vieler fehlgeschlagener Versuche gesperrt.",
            loginInvalidCredentials: "Ungültige Anmeldedaten.",
            loginAttemptsLeft: "Ungültige Anmeldedaten. Sie haben noch {{attempts}} Versuch(e).",
            loginGeneralError: "Fehler beim Anmelden. Versuchen Sie es später erneut.",
            resetEmailRequired: "Bitte geben Sie Ihre E-Mail ein, um das Passwort zurückzusetzen.",
            resetEmailSent: "E-Mail gesendet! Überprüfen Sie Ihren Posteingang.",
            resetUserNotFound: "Es gibt kein mit dieser E-Mail verknüpftes Konto.",
            resetInvalidEmail: "Das E-Mail-Format ist ungültig.",
            resetTooManyRequests: "Zu viele Versuche. Versuchen Sie es später erneut.",
            logoutError: "Fehler beim Abmelden."
        },
    },
    ru: {
        home: {
            reinventing: `DeepDev: Переосмысление 
            цифрового опыта.`,
            boost: `Мы улучшаем ваш дизайн с помощью лучших инструментов.`,
            real: `3D-взаимодействие в реальном времени.`,
            ai: `Пользовательский опыт 
            на базе ИИ.`,
            automate: `Автоматизируйте свою работу — один клик, и готово.`,
        },
        products: {
            webTitle: `Разработка веб-систем`,
            webText: `От высокоэффективных лендингов и корпоративных сайтов до eCommerce-платформ и сложных заказных систем.

            Веб-ресурс — это зачастую первый контакт бренда с пользователем. Качественный сайт не только рассказывает о вас, но и превращает посетителей в клиентов, централизует сервисы и позволяет вашему бизнесу гибко расти под полным контролем.

            Нужно ли вам представить бренд, продавать товары онлайн или управлять данными через уникальную платформу — веб-приложения станут масштабируемым и доступным решением на любом устройстве.`,
            appTitle: `Мобильные приложения для iOS и Android.`,
            appText: `От целевых бизнес-приложений и MVP до полнофункциональных продуктов, готовых к выходу на рынок.

            Мобильные приложения позволяют вашему бренду присутствовать там, где пользователи проводят больше всего времени. Качественное приложение обеспечивает скорость, производительность и безупречный пользовательский опыт, создавая прямую и постоянную связь между вашим продуктом и аудиторией.

            Хотите ли вы запустить новую идею, расширить цифровой продукт или предложить пользователям выделенный сервис — мобильные приложения станут мощным и масштабируемым решением с нативным интерфейсом для любого устройства.`,
            customTitle: `Индивидуальные программные решения.`,
            customText: `Мы создаем программные решения под ваши задачи: от систем управления до автоматизации процессов. Превращаем ваши идеи в масштабируемые инструменты для развития компании.

            Готовых решений часто недостаточно для уникальных процессов. Заказное ПО помогает централизовать данные, автоматизировать задачи и получить полный контроль над операциями.

            Нужна ли вам панель управления или сложная платформа — мы создаем гибкие решения, которые будут расти вместе с вашим бизнесом.`,
            AiTitle: `Интеграция ИИ.`,
            AiText: `Мы внедряем ИИ, адаптированный под ваши задачи: от умных чат-ботов до систем принятия решений. Помогаем компаниям усилить их продукты с помощью надежного и практичного искусственного интеллекта.

            Наш приоритет — создание безопасного ИИ, который легко интегрируется в ваши текущие системы, данные и рабочие процессы.

            Вместо шаблонов мы предлагаем решения, которые улучшают опыт пользователей, снижают нагрузку на персонал и обеспечивают умную автоматизацию любого масштаба.`,
            automationTitle: `Поток задач.`,
            automationText: `Мы создаем автоматизированные рабочие процессы, которые объединяют системы и устраняют рутину. Интеграция сайтов, приложений и внутренних инструментов повышает эффективность и обеспечивает полный контроль над бизнесом.

            Наши решения связывают CRM, почту и API, обеспечивая бесшовный обмен данными. Это ускоряет работу, минимизирует ошибки и делает бизнес-процессы стабильными.

            Нужна ли вам синхронизация данных или сложные многоступенчатые сценарии — мы строим масштабируемые процессы, адаптированные под ваши задачи.`,
        },
        company: {
            dna: `Наш ДНК`,
            dnaTitle: `Стремление к совершенству`,
            dnaText: `В DeepDev мы не просто пишем код; мы строим фундамент для вашего следующего успеха. Наш путь определяется технической точностью и уверенностью в предоставлении продуктов мирового уровня.`,
            projects: `Проектов реализовано`,
            uptime: `Гарантированная доступность`,
            support: `Поддержка 24/7`,
            title2022: `Истоки`,
            text2022: `Основана в Аргентине с видением превращения сложных идей в высокопроизводительные цифровые продукты.`,
            title2024: `Европейская экспансия и фокус на ИИ`,
            text2024: `Открытие базы в Испании и интеграция моделей ИИ в наши разработки, устанавливающая новые стандарты автоматизации.`,
            title2026: `Сегодня: DeepDev Global`,
            text2026: `Международная бутик-студия, специализирующаяся на заказном ПО и масштабируемых цифровых экосистемах.`,
            global: `ГЛОБАЛЬНОЕ ПРИСУТСТВИЕ`,
            globalTitle: `Талант без границ`,
            globalText: `Мы работаем из Испании и Аргентины, сочетая европейские инновации с изобретательностью и стойкостью латиноамериканских талантов.`,
            flagSpain: `Испания 🇪🇸`,
            flagArgentina: `Аргентина 🇦🇷`,
            talk: `Готовы начать трансформацию?`,
            talkButton: `Обсудить ваш проект`
        },
        raffles: {
            premiere: `Розыгрыш 2026`,
            premiereTitle: `Выводим вашу идею на новый уровень`,
            premiereText: `В честь запуска DeepDev мы разыгрываем проект по разработке Full Stack. Мы хотим, чтобы ваш проект получил достойное цифровое присутствие.`,
            performance: `Pro производительность`,
            performanceText: `Оптимизированные и сверхбыстрые сайты.`,
            design: `Эксклюзивный дизайн`,
            designText: `Интерфейс и пользовательский опыт, разработанные специально для вашего бренда.`,
            raffleTitle: `FullStack_Розыгрыш`,
            raffleText: `Участвуйте и получите шанс выиграть профессиональный сайт от DeepDev.`,
            days: `ДНЕЙ`,
            hours: `ЧАСОВ`,
            minutes: `МИН`,
            seconds: `СЕК`,
            name: `Полное имя`,
            email: `Email`,
            project: `Какой сайт вы хотите разработать?`,
            conditions: {
                before: `Я принимаю `,
                link: `условия и положения`,
                after: ` розыгрыша.`
            },
            error: `Вы должны принять условия и положения, чтобы продолжить.`,
            processing: `Генерация билета...`,
            verify: `Проверка email...`,
            analyzing: `Анализ запроса...`,
            status: `Статус: В процессе...`,
            registered: `Билет зарегистрирован!`,
            thanks: {
                before: `Спасибо. `,
                after: `Ваша заявка сохранена. Удачи!`
            },
            premio: `Приз в игре: Профессиональная веб-разработка`,
            buttonBack: `Назад`,
            button: `ПОЛУЧИТЬ БИЛЕТ УЧАСТНИКА`
        },
        contact: {
            name: `Имя:`,
            lastName: `Фамилия:`,
            companyName: `Название компании:`,
            role: `Должность в компании:`,
            email: `Email:`,
            phone: `Телефон / WhatsApp:`,
            project: `Тип проекта:`,
            projectOption: `Выберите вариант`,
            projectNew: `Новый проект`,
            projectRedisign: `Редизайн существующего сайта`,
            current: `Текущий сайт/приложение:`,
            type: [`Тип сайта/приложения:`, `Выберите вариант`, `Лендинг`, `Корпоративный сайт`, `E-commerce`, `Портфолио`, `Сайт услуг`, `Веб-платформа`, `Индивидуальная система`, `Пока не уверен`],
            projectGoal: [`Цель проекта:`, `Выберите цель`, `Получение заявок / Лидов`, `Продажа товаров или услуг`, `Укрепление бренда`, `Автоматизация процессов`, `Другое`],
            range: [`Бюджет:`, `Выберите диапазон`, `Меньше U$S 500`, `U$S 500 - U$S 1000`, `U$S 1000 - U$S 3000`, `Больше U$S 3000`, `Пока не уверен`],
            available: [`Сроки:`, `Выберите срок`, `Как можно скорее`, `1-2 месяца`, `+3 месяца`, `Гибкие сроки`],
            descriptionPlace: [`Описание проекта:`, `Расскажите подробнее о вашем проекте или идее`],
            button: `Отправить сообщение`,
        },
        nav: {
            promo: `Загляните в раздел розыгрышей, чтобы выиграть призы и получить скидки.`,
            products: `Продукты`,
            sales: `Продажи`,
            company: `Компания`,
            raffles: `Розыгрыши`,
            contact: `Контакты`,
            login: `Вход`
        },
        login: {
            title: `С возвращением`,
            text: `Войдите в свой аккаунт DeepDev`,
            email: `Email`,
            password: `Пароль`,
            button: `Войти`,
            register: {
                before: `Впервые в DeepDev? 
                `,
                after: `Создать аккаунт`
            },
            forgot: "Забыли пароль?"
        },
        register:{
            title: "Новый пользователь",
            email: "Email",
            password: "Пароль",
            verifyPassword: "Подтвердите пароль:",
            passMismatch: "Пароли не совпадают!",
            passError: "Ошибка кодирования пароля.",
            btnRegister: "Зарегистрироваться",
            footerText: "Уже есть аккаунт DeepDev?",
            footerLink: "Войти",
            reqMinChars: "Минимум 10 символов",
            reqUpper: "Одна заглавная буква",
            reqNumber: "Одна цифра",
            reqSpecial: "Спецсимвол (@$!%*?&)",
            errorRegister: "Ошибка при регистрации."
        },
        footer: {
            deepdev: [`Переосмысление цифрового опыта`, `Инженерия иммерсивных интерфейсов: дизайн, движение и интеллект.`],
            navigationTitle: `НАВИГАЦИЯ`,
            expertiseTitle: `ЭКСПЕРТИЗА`,
            connectTitle: `СВЯЗЬ`,
            navigation: [`Главная`, `Продукты`,"Продажи", `Компания`, `Розыгрыши`, `Контакты`],
            expertise: [`Frontend-инженерия`, `3D Web-опыт`, `Интеграция ИИ`, `Backend-системы`],
            connect: [`Удаленно по всему миру`, `Телефон`],
            rights: `Все права защищены.`,
            privacy: `Политика конфиденциальности`,
            terms: `Условия использования`
        },
        language: `Язы`,
        raffleTerm: {
            "terms_title": "Условия и положения",
            "terms_subtitle": "Участвуя в розыгрыше от DeepDev, вы полностью принимаете условия и положения, изложенные ниже.",
            "term1_title": "Требования к участию",
            "term1_text": "Для участия необходимо быть старше 18 лет. Поскольку целевая страница или интернет-магазин могут преследовать коммерческие цели, участник должен обладать дееспособностью для управления такими цифровыми активами.",
            "term2_title": "Приз и сфера действия",
            "term2_text": "Приз заключается исключительно в разработке и предоставлении целевой страницы или интернет-магазина на основе моделей нашего раздела продаж. DeepDev отвечает только за создание сайта. Расходы на управление, хостинг, обслуживание баз данных и приобретение домена являются исключительной финансовой ответственностью победителя.",
            "term3_title": "Отказ от ответственности",
            "term3_text": "DeepDev предоставляет технический инструмент, но снимает с себя всякую ответственность за цель, контент или дальнейшее использование веб-сайта. Мы не несем ответственности за неправомерное использование или незаконную деятельность после передачи сайта.",
            "term4_title": "Достоверность и претензии",
            "term4_text": "Любые недостоверные данные в форме аннулируют победу. После уведомления у победителя есть 72 часа, чтобы заявить права на приз; в противном случае будет выбран новый победитель.",
            "term5_title": "Согласие на обработку данных",
            "term5_text": "Данные будут использоваться только для целей розыгрыша и рекламы DeepDev. Участвуя, вы даете согласие на обработку информации и получение сообщений от компании.",
            "terms_footer": "DeepDev оставляет за собой право толкования данных правил."
        },
        error404: {
            title: "404 - Страница не найдена.",
            errorMessage: "Вы будете автоматически перенаправлены на главную страницу."
        },
        cookies: {
            title: "Политика в отношении файлов cookie",
            intro: "В DeepDev мы используем файлы cookie для улучшения вашего опыта просмотра и предложения персонализированного обслуживания. Продолжая просматривать наш сайт, вы подтверждаете свое согласие на их использование.",
            questionWhat: "Что такое файлы cookie?",
            answerWhat: "Файлы cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении веб-сайта. Они служат для запоминания ваших предпочтений и помогают сделать работу с сайтом более удобной.",
            questionTypes: "Какие типы файлов cookie мы используем?",
            typeEssential: "Основные файлы cookie: Необходимы для работы сайта.",
            typePerformance: "Эксплуатационные файлы cookie: Анализируют использование сайта.",
            typeFunctionality: "Функциональные файлы cookie: Запоминают ваши предпочтения.",
            typeThirdParty: "Файлы cookie сторонних лиц: Внешние сервисы, такие как социальные сети.",
            questionManage: "Как я могу управлять файлами cookie?",
            answerManage: "Вы можете настроить свой браузер так, чтобы он принимал или отклонял файлы cookie. Имейте в виду, что отключение определенных файлов cookie может повлияen на функциональность сайта."
        },
        sessionErrors: {
            loginBanned: "Пользователь заблокирован. Свяжитесь с DeepDev.",
            loginTooManyAttempts: "Ваш аккаунт заблокирован из-за слишком большого количества неудачных попыток.",
            loginInvalidCredentials: "Неверные учетные данные.",
            loginAttemptsLeft: "Неверные учетные данные. У вас осталось {{attempts}} попыток.",
            loginGeneralError: "Ошибка при входе в систему. Попробуйте позже.",
            resetEmailRequired: "Пожалуйста, введите свой email для сброса пароля.",
            resetEmailSent: "Email отправлен! Проверьте папку входящие.",
            resetUserNotFound: "Аккаунта с такой почтой не существует.",
            resetInvalidEmail: "Неверный формат электронной почты.",
            resetTooManyRequests: "Слишком много попыток. Попробуйте позже.",
            logoutError: "Ошибка при выходе из системы."
        }
    }
};
    // Idiomas regionales del Home: heredan el resto del sitio de "es" / "de" y suman sus textos propios
    texts["es-AR"] = { ...texts.es, landing: LANDING["es-AR"] };
    texts["es-ES"] = { ...texts.es, landing: LANDING["es-ES"] };
    texts["de-CH"] = { ...texts.de, landing: LANDING["de-CH"] };
    texts.en = { ...texts.en, landing: LANDING.en };
    return(
        <LanguageContext.Provider value={{ texts, language, handleLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const UseLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage debe ser usado dentro de un ThemeProvider");
  }
  return context; 
};