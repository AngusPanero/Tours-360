import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import { UseLanguage, LANDING, type LandingLocale, type LandingTexts, type TextsConfig } from "../contexts/LanguageContext";
import "./companyInfo.css";

/**
 * CompanyInfo — DeepDev
 * ---------------------------------------------------------
 * Quiénes somos: portada, origen (el logo se dibuja con el scroll detrás
 * del relato), misión (la frase se enciende mientras se lee), valores,
 * por qué nosotros, cómo operamos (capas que se levantan y dejan ver la
 * etapa de abajo: "ir a fondo"), dónde estamos (tres sedes conectadas)
 * y cierre hacia contacto.
 * Motor isométrico propio en canvas (resortes y gravedad, paso fijo 1/240).
 * Todos los textos salen del contexto de idioma (landing.about).
 */

/* =====================================================================
   UTILIDADES
   ===================================================================== */
type RGB = [number, number, number];
type P3 = [number, number, number];
type P2 = [number, number];
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (x: number) => x * x * (3 - 2 * x);
const pad = (n: number) => String(n).padStart(2, "0");

const PAL = {
    navy: hex("#0A1421"),
    deep: hex("#060C15"),
    blue: hex("#4B92F4"),
    sky: hex("#91BEF6"),
    white: hex("#E7F3F7"),
    pure: [255, 255, 255] as RGB,
};

const landingOf = (texts: TextsConfig, language: string): LandingTexts => {
    const own = texts[language]?.landing;
    if (own) return own;
    const fb: LandingLocale = language.startsWith("de") ? "de-CH" : language === "es" ? "es-AR" : "en";
    return LANDING[fb];
};

/* ---------- física ---------- */
class Spring {
    x: number;
    v = 0;
    t: number;
    k: number;
    c: number;
    constructor(x: number, k = 120, c = 16) {
        this.x = x;
        this.t = x;
        this.k = k;
        this.c = c;
    }
    step(dt: number) {
        const a = this.k * (this.t - this.x) - this.c * this.v;
        this.v += a * dt;
        this.x += this.v * dt;
    }
    snap() {
        this.x = this.t;
        this.v = 0;
    }
}
/* altura sobre su apoyo: con t>0 sube con resorte; con t=0 cae con gravedad, rebota y registra el impacto */
class Drop {
    x: number;
    v = 0;
    t: number;
    imp = 0;
    constructor(x: number) {
        this.x = x;
        this.t = x;
    }
    step(dt: number) {
        if (this.t > 0) {
            const a = 70 * (this.t - this.x) - 11 * this.v;
            this.v += a * dt;
            this.x += this.v * dt;
        } else {
            this.v -= 34 * dt;
            this.x += this.v * dt;
            if (this.x < 0) {
                if (this.v < -1.6) {
                    this.imp = Math.min(1, -this.v / 13);
                    this.v = -this.v * 0.32;
                } else this.v = 0;
                this.x = 0;
            }
        }
        this.imp *= Math.exp(-dt * 9);
    }
    snap() {
        this.x = this.t;
        this.v = 0;
        this.imp = 0;
    }
}
type Body = Spring | Drop;

/* pieza que cae al aparecer y sale volando hacia arriba al desaparecer */
interface Part {
    z: Drop;
    v: Spring;
}
const part = (h = 6): Part => ({ z: new Drop(h), v: new Spring(0, 120, 20) });
const setPart = (p: Part, on: boolean, h = 6) => {
    p.z.t = on ? 0 : h;
    p.v.t = on ? 1 : 0;
};
const bodiesOf = (ps: Part[]): Body[] => ps.flatMap((p) => [p.z, p.v]);

/* ---------- cámara ---------- */
class Cam {
    S = 60;
    ox = 0;
    oy = 0;
    cy = 1;
    sy = 0;
    cp = 1;
    sp = 0;
    set(yaw: number, pitch: number, S: number, ox: number, oy: number) {
        this.cy = Math.cos(yaw * DEG);
        this.sy = Math.sin(yaw * DEG);
        this.cp = Math.cos(pitch * DEG);
        this.sp = Math.sin(pitch * DEG);
        this.S = S;
        this.ox = ox;
        this.oy = oy;
    }
    p(x: number, y: number, z: number): P3 {
        const xr = x * this.cy - y * this.sy;
        const yr = x * this.sy + y * this.cy;
        return [this.ox + xr * this.S, this.oy + (yr * this.sp - z * this.cp) * this.S, yr * this.cp + z * this.sp];
    }
    facing(nx: number, ny: number) {
        return nx * this.sy + ny * this.cy > 2e-3;
    }
}
interface Rend {
    ctx: CanvasRenderingContext2D;
    cam: Cam;
    dpr: number;
    W: number;
    H: number;
}

/* ---------- luz y materiales ---------- */
const LW = (() => {
    const v = [-0.45, 0.7, 0.55];
    const m = Math.hypot(v[0], v[1], v[2]);
    return v.map((c) => c / m);
})();
interface Mat {
    top: RGB;
    side: RGB;
    dark: RGB;
    hi: RGB;
}
const mkMat = (top: RGB, side: RGB, dark: RGB, hi: RGB): Mat => ({ top, side, dark, hi });
const sideCol = (m: Mat, nx: number, ny: number, a = 1) => {
    const k = 0.22 + 0.92 * Math.max(0, nx * LW[0] + ny * LW[1]);
    return rgba(k < 1 ? mix(m.dark, m.side, k) : mix(m.side, m.hi, clamp((k - 1) * 2.5)), a);
};
const NAVY_M = mkMat(hex("#12223A"), hex("#0F1D31"), hex("#03070D"), hex("#2B4670"));
const WHITE_M = mkMat(PAL.pure, hex("#CFE2FB"), hex("#3A6FC4"), PAL.pure);
const BLUE_M = mkMat(PAL.blue, hex("#3F82E6"), hex("#17408C"), PAL.sky);
const SKY_M = mkMat(hex("#B9D6FA"), PAL.sky, hex("#3A6FC4"), PAL.pure);
const SLATE_M = mkMat(hex("#1E3354"), hex("#1A2D4B"), hex("#070E1A"), hex("#3A5A8C"));
const PLATE_DARK = mkMat(hex("#14243A"), hex("#1B3150"), PAL.deep, hex("#2A4468"));
const PLATE_LIGHT = mkMat(PAL.pure, mix(PAL.sky, PAL.white, 0.45), mix(PAL.sky, PAL.navy, 0.35), PAL.pure);
const SH_DARK: RGB = [1, 4, 10];

/* paleta según el fondo: en oscuro piezas claras, en claro piezas oscuras */
const matsFor = (light: boolean) => ({
    plate: light ? PLATE_LIGHT : PLATE_DARK,
    body: light ? NAVY_M : WHITE_M,
    alt: light ? WHITE_M : SLATE_M,
    shc: light ? PAL.navy : SH_DARK,
    sha: light ? 0.2 : 0.5,
});

/* ---------- primitivas ---------- */
const rot = (x: number, y: number, r: number): P2 => [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
const rectPts = (cx: number, cy: number, w: number, d: number, rz = 0): P2[] =>
    [
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [w / 2, d / 2],
        [-w / 2, d / 2],
    ].map(([a, b]) => {
        const [x, y] = rot(a, b, rz);
        return [cx + x, cy + y] as P2;
    });
function poly(ctx: CanvasRenderingContext2D, pts: P3[] | P2[]) {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
}
/* caja (con giro propio rz) */
function box(R: Rend, cx: number, cy: number, z: number, w: number, d: number, h: number, m: Mat, a = 1, rz = 0) {
    if (a < 0.01 || h < 0.002) return;
    const { ctx, cam } = R;
    const P = rectPts(cx, cy, w, d, rz);
    const N: P2[] = ([[0, -1], [1, 0], [0, 1], [-1, 0]] as P2[]).map(([nx, ny]) => rot(nx, ny, rz));
    for (let i = 0; i < 4; i++) {
        const n = N[i];
        if (!cam.facing(n[0], n[1])) continue;
        const p0 = P[i];
        const p1 = P[(i + 1) % 4];
        ctx.beginPath();
        poly(ctx, [cam.p(p0[0], p0[1], z), cam.p(p1[0], p1[1], z), cam.p(p1[0], p1[1], z + h), cam.p(p0[0], p0[1], z + h)]);
        ctx.fillStyle = sideCol(m, n[0], n[1], a);
        ctx.fill();
    }
    ctx.beginPath();
    poly(ctx, P.map(([x, y]) => cam.p(x, y, z + h)));
    ctx.fillStyle = rgba(m.top, a);
    ctx.fill();
}
function cyl(R: Rend, x: number, y: number, z: number, r: number, h: number, m: Mat, a = 1, topCol?: RGB) {
    if (a < 0.01) return;
    const { ctx, cam } = R;
    const b = cam.p(x, y, z);
    const t = cam.p(x, y, z + h);
    const rx = r * cam.S;
    const ry = Math.max(0.01, r * cam.S * cam.sp);
    if (rx < 0.3) return;
    ctx.save();
    ctx.globalAlpha = clamp(a);
    if (h > 0.003) {
        const g = ctx.createLinearGradient(b[0] - rx, 0, b[0] + rx, 0);
        for (let i = 0; i <= 6; i++) {
            const u = -1 + i / 3;
            const w = Math.sqrt(Math.max(0, 1 - u * u));
            g.addColorStop(i / 6, sideCol(m, u * cam.cy + w * cam.sy, -u * cam.sy + w * cam.cy));
        }
        ctx.beginPath();
        ctx.moveTo(t[0] - rx, t[1]);
        ctx.lineTo(b[0] - rx, b[1]);
        ctx.ellipse(b[0], b[1], rx, ry, 0, Math.PI, 0, true);
        ctx.lineTo(t[0] + rx, t[1]);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(t[0], t[1], rx, ry, 0, 0, TAU);
    ctx.fillStyle = rgba(topCol ?? m.top);
    ctx.fill();
    ctx.restore();
}
function cone(R: Rend, x: number, y: number, z: number, r: number, h: number, m: Mat, a = 1) {
    if (a < 0.01) return;
    const { ctx, cam } = R;
    const b = cam.p(x, y, z);
    const t = cam.p(x, y, z + h);
    const rx = r * cam.S;
    const ry = Math.max(0.01, r * cam.S * cam.sp);
    ctx.save();
    ctx.globalAlpha = clamp(a);
    const g = ctx.createLinearGradient(b[0] - rx, 0, b[0] + rx, 0);
    for (let i = 0; i <= 6; i++) {
        const u = -1 + i / 3;
        const w = Math.sqrt(Math.max(0, 1 - u * u));
        g.addColorStop(i / 6, sideCol(m, u * cam.cy + w * cam.sy, -u * cam.sy + w * cam.cy));
    }
    ctx.beginPath();
    ctx.moveTo(t[0], t[1]);
    ctx.lineTo(b[0] - rx, b[1]);
    ctx.ellipse(b[0], b[1], rx, ry, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
}
/* studs de un ladrillo nx×ny, ordenados por profundidad */
function studs(R: Rend, cx: number, cy: number, z: number, w: number, d: number, nx: number, ny: number, m: Mat, a = 1, rz = 0) {
    const ux = w / nx;
    const uy = d / ny;
    const st: P2[] = [];
    for (let i = 0; i < nx; i++)
        for (let j = 0; j < ny; j++) {
            const [x, y] = rot(-w / 2 + ux * (i + 0.5), -d / 2 + uy * (j + 0.5), rz);
            st.push([cx + x, cy + y]);
        }
    st.sort((p1, p2) => R.cam.p(p1[0], p1[1], 0)[2] - R.cam.p(p2[0], p2[1], 0)[2]);
    for (const [x, y] of st) cyl(R, x, y, z, 0.29 * Math.min(ux, uy), 0.13, m, a);
}
/* sombra suave: se dibuja fuera de pantalla y solo queda su sombra desplazada */
const OFF = 30000;
function shadowPts(R: Rend, pts: P2[], z: number, blur: number, alpha: number, col: RGB) {
    if (alpha < 0.01) return;
    const { ctx, dpr, cam } = R;
    ctx.save();
    ctx.shadowColor = rgba(col, alpha);
    ctx.shadowBlur = Math.max(0, blur) * dpr;
    ctx.shadowOffsetX = OFF * dpr;
    ctx.translate(-OFF, 0);
    ctx.beginPath();
    poly(ctx, pts.map(([x, y]) => cam.p(x, y, z)));
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.restore();
}
const shadowRect = (R: Rend, cx: number, cy: number, z: number, w: number, d: number, blur: number, alpha: number, col: RGB, rz = 0) =>
    shadowPts(R, rectPts(cx, cy, w, d, rz), z, blur, alpha, col);
/* dibuja en coordenadas del mundo sobre el plano horizontal z */
function onPlane(R: Rend, z: number, fn: (c: CanvasRenderingContext2D) => void) {
    const { ctx, cam, dpr } = R;
    const S = cam.S * dpr;
    ctx.save();
    ctx.setTransform(S * cam.cy, S * cam.sy * cam.sp, -S * cam.sy, S * cam.cy * cam.sp, dpr * cam.ox, dpr * (cam.oy - z * cam.S * cam.cp));
    fn(ctx);
    ctx.restore();
}
interface Item {
    l: number;
    d: number;
    f: () => void;
}
const run = (q: Item[]) => {
    q.sort((a, b) => a.l - b.l || a.d - b.d);
    for (const it of q) it.f();
};

/* =====================================================================
   ESCENAS
   ===================================================================== */
interface Area {
    x: number;
    y: number;
    w: number;
    h: number;
}
interface Env {
    t: number;
    mx: number;
    my: number;
    rm: boolean;
    light: boolean;
    area: Area;
    limit: number;
}

/* ---------- CÓMO OPERAMOS: capas que se levantan y dejan ver la etapa de abajo ---------- */
const LAYER_N = 4;
const LW_ = 4.4;
const LH_ = 0.55;
const LGAP = 0.62;
function processScene() {
    const lift = Array.from({ length: LAYER_N }, () => new Spring(0, 70, 12));
    const ghost = Array.from({ length: LAYER_N }, () => new Spring(1, 60, 14));
    const enter = Array.from({ length: LAYER_N }, () => part(5));
    /* contenido de cada capa: aparece solo en la etapa activa */
    const content = Array.from({ length: LAYER_N }, () => Array.from({ length: 5 }, () => part(3)));
    let active = 0;
    let since = 0;
    let hop = 0;
    const bodies: Body[] = [...lift, ...ghost, ...bodiesOf(enter), ...content.flatMap(bodiesOf)];
    return {
        bodies,
        targets(on: boolean, k: number, t: number) {
            if (k !== active) {
                active = k;
                since = t;
            }
            enter.forEach((p, i) => setPart(p, on, 5 + i));
            lift.forEach((s, i) => (s.t = on && i < k ? 2.6 + (k - i) * 0.9 : 0));
            ghost.forEach((s, i) => (s.t = i < k ? 0.12 : 1));
            content.forEach((ps, i) => ps.forEach((p, j) => setPart(p, on && i === k && t - since > 0.35 + j * 0.1, 3)));
            /* sola: la pieza principal de la etapa activa salta cada tanto */
            const h = Math.floor(t / 3.2);
            const main = content[k]?.[4];
            if (on && main && h !== hop && main.z.t === 0 && main.z.x < 0.01) {
                hop = h;
                main.z.v = 4.5;
            }
        },
        poke() {
            content[active]?.forEach((p, j) => p.z.t === 0 && p.z.x < 0.05 && (p.z.v = 3 + j * 0.6));
        },
        draw(R: Rend, env: Env) {
            const A = env.area;
            const M = matsFor(env.light);
            const { t, rm } = env;
            const S = Math.max(14, Math.min(A.h / 6.2, A.w / 7.6, env.limit / 3.4));
            R.cam.set(36 + env.mx * 9, 34 - env.my * 4, S, R.W * 0.5, A.y + A.h * 0.64);
            /* de arriba (0) hacia abajo (3): cada etapa es una capa más profunda */
            const MAT = [env.light ? WHITE_M : SLATE_M, M.body, SKY_M, BLUE_M];
            const Q: Item[] = [];
            const zBase = (i: number) => (LAYER_N - 1 - i) * LGAP;
            shadowRect(R, 0.14, 0.14, 0, LW_, LW_, S * 0.45, M.sha * 0.7 * clamp(enter[LAYER_N - 1].v.x), M.shc);
            for (let i = LAYER_N - 1; i >= 0; i--) {
                const ev = clamp(enter[i].v.x);
                if (ev < 0.01) continue;
                const z = zBase(i) + enter[i].z.x + lift[i].x;
                const a = ev * clamp(ghost[i].x);
                const top = z + LH_;
                Q.push({
                    l: LAYER_N - i,
                    d: 0,
                    f: () => {
                        box(R, 0, 0, z, LW_, LW_, LH_, MAT[i], a);
                        /* filo de la capa: una línea fina en el color de acento */
                        onPlane(R, top, (c) => {
                            c.globalAlpha = a * 0.55;
                            c.strokeStyle = i === 3 ? "#E7F3F7" : "#4B92F4";
                            c.lineWidth = 0.025;
                            c.strokeRect(-LW_ / 2 + 0.2, -LW_ / 2 + 0.2, LW_ - 0.4, LW_ - 0.4);
                        });
                        if (i === active) drawContent(i, top, a);
                    },
                });
            }
            const drawContent = (i: number, z0: number, a: number) => {
                const ps = content[i];
                const v = (j: number) => clamp(ps[j].v.x) * a;
                const zz = (j: number) => z0 + ps[j].z.x;
                const sq = (j: number) => 1 - 0.2 * ps[j].z.imp;
                const sh = (j: number, x: number, y: number, w: number, d: number) => shadowRect(R, x + 0.05, y + 0.05, z0, w, d, ps[j].z.x * S * 0.3 + S * 0.04, (M.sha * v(j)) / (1 + ps[j].z.x * 0.6), M.shc);
                const items: { d: number; f: () => void }[] = [];
                const add = (x: number, y: number, f: () => void) => items.push({ d: R.cam.p(x, y, 0)[2], f });
                if (i === 0) {
                    /* Descubrir: datos que se levantan como barras y la lupa que los recorre */
                    const HS = [0.5, 0.9, 0.7, 1.2];
                    HS.forEach((h, j) => {
                        const x = -1.2 + j * 0.8;
                        const y = 0.6;
                        add(x, y, () => cyl(R, x, y, zz(j), 0.26, h * sq(j) * (rm ? 1 : 1 + 0.06 * Math.sin(t * 2 + j)), M.body, v(j), PAL.sky));
                    });
                    const lx = rm ? 0.4 : Math.sin(t * 0.8) * 0.9;
                    add(lx, -0.7, () => {
                        sh(4, lx, -0.7, 1.2, 1.2);
                        onPlane(R, zz(4) + 0.02, (c) => {
                            c.globalAlpha = v(4);
                            c.strokeStyle = "#4B92F4";
                            c.lineWidth = 0.09;
                            c.beginPath();
                            c.arc(lx, -0.7, 0.5, 0, TAU);
                            c.stroke();
                            c.beginPath();
                            c.moveTo(lx + 0.36, -0.34);
                            c.lineTo(lx + 0.85, 0.15);
                            c.stroke();
                        });
                    });
                } else if (i === 1) {
                    /* Diseñar: la paleta y las piezas de la identidad */
                    const C = [BLUE_M, SKY_M, M.body, M.alt];
                    C.forEach((m, j) => {
                        const x = -1.35 + j * 0.9;
                        const y = 0.85;
                        add(x, y, () => (sh(j, x, y, 0.75, 0.75), box(R, x, y, zz(j), 0.75, 0.75, 0.18 * sq(j), m, v(j))));
                    });
                    add(0, -0.55, () => (sh(4, 0, -0.55, 2.6, 1.1), box(R, 0, -0.55, zz(4), 2.6, 1.1, 0.22 * sq(4), env.light ? NAVY_M : WHITE_M, v(4)), box(R, -0.55, -0.55, zz(4) + 0.22 * sq(4), 1.2, 0.18, 0.06, BLUE_M, v(4))));
                } else if (i === 2) {
                    /* Construir: ladrillos que encastran */
                    const B: [number, number, Mat][] = [
                        [-0.9, 0.6, M.body],
                        [0.9, 0.6, SKY_M],
                        [-0.9, -0.9, M.alt],
                        [0.9, -0.9, M.body],
                    ];
                    B.forEach(([x, y, m], j) => add(x, y, () => (sh(j, x, y, 1.4, 1.2), box(R, x, y, zz(j), 1.4, 1.2, 0.42 * sq(j), m, v(j)), studs(R, x, y, zz(j) + 0.42 * sq(j), 1.4, 1.2, 2, 2, m, v(j)))));
                    const r = ps[4].z.x * 0.32;
                    add(0, -0.15, () => (sh(4, 0, -0.15, 1.4, 1.2), box(R, 0, -0.15, zz(4) + 0.42, 1.4, 1.2, 0.42 * sq(4), BLUE_M, v(4), r), studs(R, 0, -0.15, zz(4) + 0.84 * sq(4), 1.4, 1.2, 2, 2, WHITE_M, v(4), r)));
                } else {
                    /* Lanzar y cuidar: un cohete chico sobre su base y satélites que lo cuidan */
                    for (let j = 0; j < 4; j++) {
                        const ang = (rm ? 0 : t * 0.6) + (j * TAU) / 4;
                        const x = Math.cos(ang) * 1.55;
                        const y = Math.sin(ang) * 1.55;
                        add(x, y, () => box(R, x, y, zz(j) + 0.5 + Math.sin(ang * 2) * 0.12, 0.26, 0.26, 0.26, j % 2 ? WHITE_M : M.alt, v(j), ang));
                    }
                    add(0, 0, () => {
                        sh(4, 0, 0, 1, 1);
                        const z = zz(4);
                        cyl(R, 0, 0, z, 0.38, 1.1 * sq(4), WHITE_M, v(4));
                        cyl(R, 0, 0, z + 0.55, 0.4, 0.14, M.alt, v(4));
                        cone(R, 0, 0, z + 1.1 * sq(4), 0.38, 0.6, M.alt === SLATE_M ? SKY_M : NAVY_M, v(4));
                    });
                }
                items.sort((p1, p2) => p1.d - p2.d).forEach((it) => it.f());
            };
            run(Q);
        },
    };
}

/* ---------- DÓNDE ESTAMOS: tres torres conectadas por arcos con datos que viajan ---------- */
const TOWERS = [
    { x: -2.5, y: 0.45, h: 1.35 },
    { x: 0, y: -0.45, h: 2.05 },
    { x: 2.5, y: 0.4, h: 1.65 },
];
function presenceScene() {
    const plate = part(4);
    const hs = TOWERS.map(() => new Spring(0, 120, 10));
    const arc = new Spring(0, 40, 12);
    return {
        bodies: [...bodiesOf([plate]), ...hs, arc] as Body[],
        targets(p: number) {
            setPart(plate, p > 0.05, 4);
            hs.forEach((s, i) => (s.t = p > 0.12 + i * 0.05 ? TOWERS[i].h : 0));
            arc.t = p > 0.3 ? 1 : 0;
        },
        poke() {
            hs.forEach((s, i) => (s.v += 5 + i * 2));
        },
        draw(R: Rend, env: Env) {
            const { W, H, ctx } = R;
            const M = matsFor(env.light);
            const { t, rm } = env;
            const S = Math.min(W / 9.2, H / 4.6);
            R.cam.set(20 + env.mx * 8, 36 - env.my * 4, S, W * 0.5, H * 0.58);
            const pv = clamp(plate.v.x);
            if (pv < 0.01) return;
            const top = 0.28 + plate.z.x;
            shadowRect(R, 0.14, 0.14, 0, 7.4, 3.4, S * 0.45, M.sha * 0.7 * pv, M.shc);
            box(R, 0, 0, plate.z.x, 7.4, 3.4, 0.28, M.plate, pv);
            onPlane(R, top, (c) => {
                c.globalAlpha = 0.22 * pv;
                c.fillStyle = env.light ? "#0A1421" : "#91BEF6";
                for (let x = -3.4; x <= 3.41; x += 0.4) for (let y = -1.4; y <= 1.41; y += 0.4) c.fillRect(x - 0.012, y - 0.012, 0.024, 0.024);
            });
            const order = TOWERS.map((tw, i) => ({ tw, i })).sort((a, b) => R.cam.p(a.tw.x, a.tw.y, 0)[2] - R.cam.p(b.tw.x, b.tw.y, 0)[2]);
            const tops: P3[] = TOWERS.map((tw, i) => R.cam.p(tw.x, tw.y, top + Math.max(0, hs[i].x) + 0.2));
            for (const { tw, i } of order) {
                const h = Math.max(0, hs[i].x);
                if (h < 0.02) continue;
                const m = i === 1 ? BLUE_M : M.body;
                box(R, tw.x, tw.y, top, 1.1, 1.1, h, m, pv);
                studs(R, tw.x, tw.y, top + h, 1.1, 1.1, 2, 2, i === 1 ? WHITE_M : m, pv);
            }
            /* arcos entre sedes con paquetes que viajan */
            const av = clamp(arc.x);
            if (av > 0.01) {
                const pairs: [number, number][] = [
                    [0, 1],
                    [1, 2],
                    [0, 2],
                ];
                pairs.forEach(([a, b], k) => {
                    const p0 = tops[a];
                    const p1 = tops[b];
                    const lift = (k === 2 ? 1.6 : 0.9) * S;
                    const cx = (p0[0] + p1[0]) / 2;
                    const cy = Math.min(p0[1], p1[1]) - lift;
                    ctx.save();
                    ctx.globalAlpha = av * 0.75;
                    ctx.strokeStyle = env.light ? "#2F78E8" : "#91BEF6";
                    ctx.lineWidth = 1.2;
                    ctx.setLineDash([4, 5]);
                    ctx.lineDashOffset = rm ? 0 : -t * 18;
                    ctx.beginPath();
                    ctx.moveTo(p0[0], p0[1]);
                    ctx.quadraticCurveTo(cx, cy, p1[0], p1[1]);
                    ctx.stroke();
                    const u = rm ? 0.5 : (t * 0.35 + k * 0.33) % 1;
                    const qx = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * cx + u * u * p1[0];
                    const qy = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * cy + u * u * p1[1];
                    ctx.setLineDash([]);
                    ctx.globalAlpha = av;
                    ctx.fillStyle = "#4B92F4";
                    ctx.beginPath();
                    ctx.arc(qx, qy, Math.max(2.5, S * 0.07), 0, TAU);
                    ctx.fill();
                    ctx.restore();
                });
            }
        },
    };
}

/* trazado del logo (dos eslabones) para el dibujo de línea del origen */
const LOGO_PATHS: string[] = [
    "M0.37 -2.86L0.49 -2.97L0.62 -3.05L0.77 -3.11L0.92 -3.15L1.08 -3.16L1.24 -3.15L1.39 -3.11L1.53 -3.05L1.67 -2.97L1.79 -2.86L1.89 -2.75L1.97 -2.61L2.03 -2.47L2.07 -2.31L2.08 -2.16L2.07 -2.00L2.03 -1.85L1.97 -1.70L1.89 -1.57L1.79 -1.45L-0.37 0.71L-0.49 0.81L-0.62 0.89L-0.77 0.95L-0.92 0.99L-1.08 1.00L-1.24 0.99L-1.39 0.95L-1.53 0.89L-1.67 0.81L-1.79 0.71L-1.89 0.59L-1.97 0.45L-2.03 0.31L-2.07 0.16L-2.08 0.00L-2.07 -0.16L-2.03 -0.31L-1.97 -0.45L-1.89 -0.59L-1.79 -0.71ZM-0.65 -0.43L-0.56 -0.32L-0.50 -0.20L-0.47 -0.07L-0.47 0.07L-0.50 0.20L-0.56 0.32L-0.65 0.43L-0.75 0.52L-0.88 0.57L-1.01 0.60L-1.15 0.60L-1.28 0.57L-1.40 0.52L-1.51 0.43L-1.59 0.32L-1.65 0.20L-1.68 0.07L-1.68 -0.07L-1.65 -0.20L-1.59 -0.32L-1.51 -0.43L-1.40 -0.52L-1.28 -0.57L-1.15 -0.60L-1.01 -0.60L-0.88 -0.57L-0.75 -0.52ZM1.51 -2.59L1.59 -2.48L1.65 -2.36L1.68 -2.23L1.68 -2.09L1.65 -1.96L1.59 -1.83L1.51 -1.73L1.40 -1.64L1.28 -1.58L1.15 -1.55L1.01 -1.55L0.88 -1.58L0.75 -1.64L0.65 -1.73L0.56 -1.83L0.50 -1.96L0.47 -2.09L0.47 -2.23L0.50 -2.36L0.56 -2.48L0.65 -2.59L0.75 -2.67L0.88 -2.73L1.01 -2.76L1.15 -2.76L1.28 -2.73L1.40 -2.67ZM0.93 -1.17L0.81 -1.19L0.69 -1.24L0.57 -1.29L0.47 -1.37L0.37 -1.45L0.29 -1.55L0.22 -1.65L0.16 -1.77L0.12 -1.89L0.09 -2.01L-0.93 -0.99L-0.81 -0.96L-0.69 -0.92L-0.57 -0.86L-0.47 -0.79L-0.37 -0.71L-0.29 -0.61L-0.22 -0.50L-0.16 -0.39L-0.12 -0.27L-0.09 -0.14Z",
    "M1.79 1.45L1.89 1.57L1.97 1.70L2.03 1.85L2.07 2.00L2.08 2.16L2.07 2.31L2.03 2.47L1.97 2.61L1.89 2.75L1.79 2.86L1.67 2.97L1.53 3.05L1.39 3.11L1.24 3.15L1.08 3.16L0.92 3.15L0.77 3.11L0.62 3.05L0.49 2.97L0.37 2.86L-1.79 0.71L-1.89 0.59L-1.97 0.45L-2.03 0.31L-2.07 0.16L-2.08 0.00L-2.07 -0.16L-2.03 -0.31L-1.97 -0.45L-1.89 -0.59L-1.79 -0.71L-1.67 -0.81L-1.53 -0.89L-1.39 -0.95L-1.24 -0.99L-1.08 -1.00L-0.92 -0.99L-0.77 -0.95L-0.62 -0.89L-0.49 -0.81L-0.37 -0.71ZM-0.65 0.43L-0.75 0.52L-0.88 0.57L-1.01 0.60L-1.15 0.60L-1.28 0.57L-1.40 0.52L-1.51 0.43L-1.59 0.32L-1.65 0.20L-1.68 0.07L-1.68 -0.07L-1.65 -0.20L-1.59 -0.32L-1.51 -0.43L-1.40 -0.52L-1.28 -0.57L-1.15 -0.60L-1.01 -0.60L-0.88 -0.57L-0.75 -0.52L-0.65 -0.43L-0.56 -0.32L-0.50 -0.20L-0.47 -0.07L-0.47 0.07L-0.50 0.20L-0.56 0.32ZM1.51 2.59L1.40 2.67L1.28 2.73L1.15 2.76L1.01 2.76L0.88 2.73L0.75 2.67L0.65 2.59L0.56 2.48L0.50 2.36L0.47 2.23L0.47 2.09L0.50 1.96L0.56 1.83L0.65 1.73L0.75 1.64L0.88 1.58L1.01 1.55L1.15 1.55L1.28 1.58L1.40 1.64L1.51 1.73L1.59 1.83L1.65 1.96L1.68 2.09L1.68 2.23L1.65 2.36L1.59 2.48ZM0.09 2.01L0.12 1.89L0.16 1.77L0.22 1.65L0.29 1.55L0.37 1.45L0.47 1.37L0.57 1.29L0.69 1.24L0.81 1.19L0.93 1.17L-0.09 0.14L-0.12 0.27L-0.16 0.39L-0.22 0.50L-0.29 0.61L-0.37 0.71L-0.47 0.79L-0.57 0.86L-0.69 0.92L-0.81 0.96L-0.93 0.99Z",
];

/* =====================================================================
   COMPONENTE
   ===================================================================== */
const CompanyInfo = () => {
    const { theme } = UseTheme();
    const { texts, language } = UseLanguage();
    const c = landingOf(texts, language).about;
    const isDark = theme === "dark";
    const themeRef = useRef(isDark);
    themeRef.current = isDark;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const originRef = useRef<HTMLElement>(null);
    const missionRef = useRef<HTMLElement>(null);
    const procRef = useRef<HTMLElement>(null);
    const procCv = useRef<HTMLCanvasElement>(null);
    const presRef = useRef<HTMLElement>(null);
    const presCv = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        const proc = processScene();
        const pres = presenceScene();
        const mk = (cv: HTMLCanvasElement | null): Rend | null => {
            const ctx = cv?.getContext("2d");
            return ctx ? { ctx, cam: new Cam(), dpr: 1, W: 1, H: 1 } : null;
        };
        const RP = mk(procCv.current);
        const RS = mk(presCv.current);
        const pairs: [HTMLCanvasElement | null, Rend | null][] = [
            [procCv.current, RP],
            [presCv.current, RS],
        ];
        const resize = () => {
            for (const [cv, R] of pairs) {
                if (!cv || !R) continue;
                const r = cv.getBoundingClientRect();
                R.dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.75 : 2);
                R.W = Math.max(1, r.width);
                R.H = Math.max(1, r.height);
                cv.width = Math.round(R.W * R.dpr);
                cv.height = Math.round(R.H * R.dpr);
            }
        };
        resize();
        const ro = new ResizeObserver(resize);
        pairs.forEach(([cv]) => cv && ro.observe(cv));
        const vis = { proc: false, pres: false };
        const io = new IntersectionObserver(
            (es) =>
                es.forEach((e) => {
                    if (e.target === procRef.current) vis.proc = e.isIntersecting;
                    if (e.target === presRef.current) vis.pres = e.isIntersecting;
                }),
            { rootMargin: "15% 0px" }
        );
        if (procRef.current) io.observe(procRef.current);
        if (presRef.current) io.observe(presRef.current);

        const mx = new Spring(0, 30, 10);
        const my = new Spring(0, 30, 10);
        let px = 0;
        let py = 0;
        let hasPointer = false;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            px = (e.clientX / window.innerWidth - 0.5) * 2;
            py = (e.clientY / window.innerHeight - 0.5) * 2;
            hasPointer = true;
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        const pokeP = () => proc.poke();
        const pokeS = () => pres.poke();
        procCv.current?.addEventListener("click", pokeP);
        presCv.current?.addEventListener("click", pokeS);

        const rel = (cv: HTMLCanvasElement, el: Element | null) => {
            if (!el) return null;
            const a = cv.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return { top: r.top - a.top, bottom: r.bottom - a.top, left: r.left - a.left, right: r.right - a.left };
        };
        const procArea = (R: Rend): { area: Area; limit: number } => {
            const cv = procCv.current;
            const sec = procRef.current;
            const full = { area: { x: 0, y: 0, w: R.W, h: R.H }, limit: Infinity };
            if (!cv || !sec) return full;
            const tt = rel(cv, sec.querySelector(".ab-pin__title"));
            const st = rel(cv, sec.querySelector(".ab-pin__step.is-active"));
            const tl = rel(cv, sec.querySelector(".ab-pin__timeline"));
            if (!tt || !st || !tl) return full;
            const top = tt.bottom + 6;
            let bottom = tl.top - 14;
            let limit = Infinity;
            if (st.right < R.W / 2) limit = R.W / 2 - st.right - 24;
            else bottom = Math.min(bottom, st.top - 10);
            return { area: { x: 0, y: top, w: R.W, h: Math.max(100, bottom - top) }, limit: Math.max(70, limit) };
        };

        let raf = 0;
        let last = performance.now();
        const t0 = last;
        let acc = 0;
        const STEP = 1 / 240;
        const loop = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const t = (now - t0) / 1000;
            const vh = window.innerHeight;
            const light = !themeRef.current;
            mx.t = hasPointer ? px : Math.sin(t * 0.4) * 0.35;
            my.t = hasPointer ? py : Math.cos(t * 0.3) * 0.2;

            /* origen: el logo se dibuja con el scroll */
            const og = originRef.current;
            if (og) {
                const r = og.getBoundingClientRect();
                if (r.bottom > 0 && r.top < vh) {
                    const q = rm ? 1 : clamp((vh - r.top) / (vh + r.height * 0.55));
                    og.style.setProperty("--draw", smooth(q).toFixed(3));
                }
            }
            /* misión: las palabras se encienden mientras se lee */
            const ms = missionRef.current;
            if (ms) {
                const r = ms.getBoundingClientRect();
                if (r.bottom > 0 && r.top < vh) {
                    const p = clamp(-r.top / Math.max(1, r.height - vh));
                    const words = ms.querySelectorAll<HTMLElement>(".ab-word");
                    const n = words.length;
                    words.forEach((w, i) => {
                        const o = (rm ? 1 : 0.14 + 0.86 * clamp((p * 1.2 * n - i) / 2.5)).toFixed(2);
                        if (w.style.opacity !== o) w.style.opacity = o;
                    });
                }
            }
            /* cómo operamos: sección fija con cuatro etapas */
            const ps = procRef.current;
            if (ps) {
                const r = ps.getBoundingClientRect();
                const p = clamp(-r.top / Math.max(1, r.height - vh));
                const k = Math.min(LAYER_N - 1, Math.floor(p * LAYER_N));
                ps.querySelectorAll<HTMLElement>(".ab-pin__step").forEach((el) => {
                    const on = Number(el.dataset.i) === k;
                    if (el.classList.contains("is-active") !== on) el.classList.toggle("is-active", on);
                });
                ps.querySelectorAll<HTMLElement>(".ab-pin__timeline li").forEach((el, i) => {
                    if (el.classList.contains("is-on") !== i <= k) el.classList.toggle("is-on", i <= k);
                    const b = el.querySelector<HTMLElement>("b");
                    if (b) b.style.transform = `scaleX(${clamp(p * LAYER_N - i).toFixed(3)})`;
                });
                const ix = ps.querySelector(".ab-pin__index b");
                if (ix && ix.textContent !== pad(k + 1)) ix.textContent = pad(k + 1);
                proc.targets(r.top < vh && r.bottom > 0, k, t);
            }
            const sr = presRef.current;
            if (sr) {
                const r = sr.getBoundingClientRect();
                pres.targets(clamp((vh - r.top) / (vh + r.height)));
            }

            if (rm) {
                [mx, my, ...proc.bodies, ...pres.bodies].forEach((b) => b.snap());
            } else {
                acc += dt;
                while (acc > STEP) {
                    mx.step(STEP);
                    my.step(STEP);
                    if (vis.proc) proc.bodies.forEach((b) => b.step(STEP));
                    if (vis.pres) pres.bodies.forEach((b) => b.step(STEP));
                    acc -= STEP;
                }
            }
            if (RP && vis.proc) {
                RP.ctx.setTransform(RP.dpr, 0, 0, RP.dpr, 0, 0);
                RP.ctx.clearRect(0, 0, RP.W, RP.H);
                const lay = procArea(RP);
                proc.draw(RP, { t, mx: mx.x, my: my.x, rm, light, area: lay.area, limit: lay.limit });
            }
            if (RS && vis.pres) {
                RS.ctx.setTransform(RS.dpr, 0, 0, RS.dpr, 0, 0);
                RS.ctx.clearRect(0, 0, RS.W, RS.H);
                pres.draw(RS, { t, mx: mx.x, my: my.x, rm, light, area: { x: 0, y: 0, w: RS.W, h: RS.H }, limit: Infinity });
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener("pointermove", onMove);
            procCv.current?.removeEventListener("click", pokeP);
            presCv.current?.removeEventListener("click", pokeS);
        };
    }, []);

    /* ---------- piezas de interfaz ---------- */
    const line = (label: string) => (
        <span className="ab-line__txt" aria-hidden="true">
            {[...label].map((ch, i) => (
                <span key={i} style={{ "--i": i } as CSSProperties}>
                    {ch === " " ? " " : ch}
                </span>
            ))}
        </span>
    );
    const arrow = (
        <svg className="ab-line__arrow" viewBox="0 0 26 26" aria-hidden="true">
            <path d="M4 13h18M15 6l7 7-7 7" />
        </svg>
    );
    const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
    const reveal = (delay = 0) => ({
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.9, ease: EASE, delay },
    });
    /* título que sube palabra por palabra desde atrás de una línea */
    const masked = (text: string, accentLast = true, inView = false) => {
        const ws = text.split(" ");
        return ws.map((w, i) => (
            <span className="ab-mask" key={`${language}-${i}`} aria-hidden="true">
                <motion.span
                    className={accentLast && i === ws.length - 1 ? "is-accent" : undefined}
                    initial={{ y: "112%" }}
                    {...(inView ? { whileInView: { y: "0%" }, viewport: { once: true, margin: "-60px" } } : { animate: { y: "0%" } })}
                    transition={{ duration: 1.15, ease: EASE, delay: (inView ? 0 : 0.15) + i * 0.065 }}
                >
                    {w}
                </motion.span>
            </span>
        ));
    };

    return (
        <MotionConfig reducedMotion="user">
            <main className={`ab ${isDark ? "theme-dark" : "theme-light"}`}>
                {/* ---------- portada ---------- */}
                <section className="ab-hero">
                    <div className="ab-wrap">
                        <motion.p className="ab-kicker" {...reveal()}>
                            <i aria-hidden="true" />
                            {c.kicker}
                        </motion.p>
                        <h1 className="ab-hero__title" aria-label={c.title}>
                            {masked(c.title)}
                        </h1>
                        <div className="ab-hero__foot">
                            <motion.p className="ab-lead" {...reveal(0.2)}>
                                {c.text}
                            </motion.p>
                            <motion.dl className="ab-facts" {...reveal(0.3)}>
                                {c.facts.map((f, i) => (
                                    <div key={i}>
                                        <dt>{f.label}</dt>
                                        <dd>{f.value}</dd>
                                    </div>
                                ))}
                            </motion.dl>
                        </div>
                    </div>
                </section>

                {/* ---------- origen: el logo se dibuja detrás del relato ---------- */}
                <section className="ab-origin" ref={originRef}>
                    <svg className="ab-origin__mark" viewBox="-2.3 -3.4 4.6 6.8" aria-hidden="true">
                        {/* cada contorno por separado, así cada uno se dibuja de punta a punta */}
                        {LOGO_PATHS.flatMap((d, i) =>
                            d
                                .split(/(?=M)/)
                                .filter(Boolean)
                                .map((sub, j) => <path key={`${i}-${j}`} d={sub} pathLength={1} className={i === 1 ? "is-b" : undefined} />)
                        )}
                    </svg>
                    <div className="ab-wrap ab-origin__inner">
                        <motion.p className="ab-kicker" {...reveal()}>
                            <span>01</span>
                            {c.origin.kicker}
                        </motion.p>
                        <h2 className="ab-title" aria-label={c.origin.title}>
                            {masked(c.origin.title, true, true)}
                        </h2>
                        <div className="ab-origin__cols">
                            {c.origin.paragraphs.map((p, i) => (
                                <motion.p className="ab-body" key={i} {...reveal(0.1 + i * 0.1)}>
                                    {p}
                                </motion.p>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---------- misión: frase que se enciende con el scroll ---------- */}
                <section className="ab-mission" ref={missionRef}>
                    <div className="ab-mission__sticky">
                        <div className="ab-wrap">
                            <p className="ab-kicker">
                                <span>02</span>
                                {c.mission.kicker}
                            </p>
                            <p className="ab-mission__text">
                                {c.mission.text.split(" ").map((w, i) => (
                                    <span key={`${language}-${i}`} className={`ab-word${w.includes("*") ? " is-hl" : ""}`}>
                                        {w.replace(/\*/g, "")}{" "}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>
                </section>
                <section className="ab-values">
                    <div className="ab-wrap">
                        <ol className="ab-values__list">
                            {c.mission.values.map((v, i) => (
                                <motion.li key={i} {...reveal(i * 0.08)}>
                                    <span className="ab-values__n">{pad(i + 1)}</span>
                                    <h3>{v.title}</h3>
                                    <p>{v.text}</p>
                                </motion.li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ---------- por qué nosotros: una fila por razón ---------- */}
                <section className="ab-why">
                    <div className="ab-wrap">
                        <motion.p className="ab-kicker" {...reveal()}>
                            <span>03</span>
                            {c.why.kicker}
                        </motion.p>
                        <h2 className="ab-title" aria-label={c.why.title}>
                            {masked(c.why.title, true, true)}
                        </h2>
                        <ol className="ab-why__list">
                            {c.why.items.map((it, i) => (
                                <motion.li key={i} {...reveal(i * 0.05)}>
                                    <span className="ab-why__n">{pad(i + 1)}</span>
                                    <h3 className="ab-why__t">{it.title}</h3>
                                    <p className="ab-why__p">{it.text}</p>
                                </motion.li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ---------- cómo operamos: capas que se levantan ---------- */}
                <section className="ab-pin" ref={procRef}>
                    <div className="ab-pin__sticky">
                        <h2 className="ab-pin__title">{c.process.title}</h2>
                        <canvas ref={procCv} className="ab-pin__canvas" role="img" aria-label={c.aria.process} />
                        <div className="ab-pin__hud">
                            <p className="ab-kicker">
                                <span>04</span>
                                {c.process.kicker}
                            </p>
                            <p className="ab-pin__index" aria-hidden="true">
                                <b>01</b>
                                <span>/{pad(c.process.steps.length)}</span>
                            </p>
                            <div className="ab-pin__steps">
                                {c.process.steps.map((s, i) => (
                                    <div className={`ab-pin__step${i === 0 ? " is-active" : ""}`} data-i={i} key={`${language}-${i}`}>
                                        <h3 className="ab-pin__tag">{s.title}</h3>
                                        <p className="ab-pin__text">{s.text}</p>
                                    </div>
                                ))}
                            </div>
                            <ol className="ab-pin__timeline">
                                {c.process.steps.map((s, i) => (
                                    <li key={i} className={i === 0 ? "is-on" : ""}>
                                        <i aria-hidden="true">
                                            <b />
                                        </i>
                                        <span>{s.title}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                {/* ---------- dónde estamos ---------- */}
                <section className="ab-presence" ref={presRef}>
                    <div className="ab-wrap ab-presence__head">
                        <motion.p className="ab-kicker" {...reveal()}>
                            <span>05</span>
                            {c.presence.kicker}
                        </motion.p>
                        <h2 className="ab-title" aria-label={c.presence.title}>
                            {masked(c.presence.title, true, true)}
                        </h2>
                    </div>
                    <div className="ab-presence__stage">
                        <canvas ref={presCv} role="img" aria-label={c.aria.presence} />
                    </div>
                    <div className="ab-wrap">
                        <ol className="ab-presence__offices">
                            {c.presence.offices.map((o, i) => (
                                <motion.li key={i} {...reveal(i * 0.08)}>
                                    <span className="ab-presence__country">{o.country}</span>
                                    <h3>{o.city}</h3>
                                    <p>{o.role}</p>
                                </motion.li>
                            ))}
                        </ol>
                        <motion.p className="ab-lead ab-presence__text" {...reveal()}>
                            {c.presence.text}
                        </motion.p>
                    </div>
                </section>

                {/* ---------- cierre ---------- */}
                <section className="ab-cta">
                    <div className="ab-wrap ab-cta__inner">
                        <h2 className="ab-cta__title" aria-label={c.cta.title}>
                            {masked(c.cta.title, true, true)}
                        </h2>
                        <motion.div className="ab-cta__links" {...reveal(0.12)}>
                            <Link to="/contact" className="ab-line ab-line--primary ab-line--xl" aria-label={c.cta.primary}>
                                {line(c.cta.primary)}
                                {arrow}
                            </Link>
                            {/* TODO (Angus): confirmá la ruta real de la página de productos */}
                            <Link to="/products" className="ab-line" aria-label={c.cta.secondary}>
                                {line(c.cta.secondary)}
                                {arrow}
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </main>
        </MotionConfig>
    );
};

export default CompanyInfo;