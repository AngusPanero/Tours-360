import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import { UseLanguage, LANDING, type LandingLocale, type LandingTexts, type TextsConfig } from "../contexts/LanguageContext";
import "./products.css";

/**
 * Products — DeepDev
 * ---------------------------------------------------------
 * 1. Portada con el índice de productos (cada uno salta a su capítulo).
 * 2. Productos: sección fija con el nombre gigante detrás, un bloque
 *    isométrico por producto a pantalla completa y la ficha por delante.
 * 3. Despegue: un cohete de bloques que se arma con el scroll, cuenta
 *    regresiva, despega y sube marcando las fases de un proyecto.
 * 4. Cierre hacia contacto.
 * Motor isométrico propio en canvas (resortes y gravedad, paso fijo 1/240).
 * Todos los textos salen del contexto de idioma (landing.products).
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
   ESCENAS DE PRODUCTO
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
interface Scene {
    bodies: Body[];
    targets: (on: boolean, t: number) => void;
    draw: (R: Rend, env: Env) => void;
    visible: () => boolean;
    poke?: () => void;
    step?: (dt: number, t: number) => void;
}
/* cámara común: la escena (≈ 6×6 unidades) entra en el hueco libre */
const frame = (R: Rend, env: Env, span = 6.4, tall = 5.6) => {
    const A = env.area;
    const S = Math.max(14, Math.min(A.h / tall, A.w / (span * 1.15), env.limit / (span * 0.55)));
    R.cam.set(38 + env.mx * 9, 36 - env.my * 4, S, R.W * 0.5, A.y + A.h * 0.6);
    return S;
};
/* arranque escalonado: cada pieza entra unos milisegundos después de la anterior */
const stagger = () => {
    let since = -1;
    return (on: boolean, t: number) => {
        if (on && since < 0) since = t;
        if (!on) since = -1;
        return (i: number, gap = 0.12) => on && t - since > i * gap;
    };
};

/* 01 · Webs: una ventana de navegador donde caen los componentes de la página */
function webScene(): Scene {
    const plate = part();
    const win = part();
    const hero = part();
    const btn = part();
    const cardA = part();
    const cardB = part();
    const all = [plate, win, hero, btn, cardA, cardB];
    const st = stagger();
    let hop = 0;
    return {
        bodies: bodiesOf(all),
        visible: () => all.some((p) => p.v.x > 0.01),
        targets(on, t) {
            const go = st(on, t);
            all.forEach((p, i) => setPart(p, go(i)));
            const k = Math.floor(t / 3.2);
            if (on && k !== hop && cardB.z.x < 0.01 && cardB.z.t === 0) {
                hop = k;
                cardB.z.v = 4.5;
                if (btn.z.x < 0.01) btn.z.v = 3.2;
            }
        },
        poke() {
            all.slice(2).forEach((p, i) => p.z.t === 0 && p.z.x < 0.05 && (p.z.v = 4 + i));
        },
        draw(R, env) {
            const S = frame(R, env);
            const M = matsFor(env.light);
            const Q: Item[] = [];
            const pv = clamp(plate.v.x);
            const pz = plate.z.x;
            Q.push({ l: 0, d: 0, f: () => (shadowRect(R, 0.12, 0.12, 0, 5.6, 4.4, S * 0.4, M.sha * pv * 0.7, M.shc), box(R, 0, 0, pz, 5.6, 4.4, 0.25, M.plate, pv)) });
            const wz = 0.25 + win.z.x;
            const wv = clamp(win.v.x);
            Q.push({
                l: 1,
                d: 0,
                f: () => {
                    shadowRect(R, 0.08, 0.08, 0.25, 4.5, 3.3, (wz - 0.25) * S * 0.3 + S * 0.08, (M.sha * wv) / (1 + win.z.x * 0.5), M.shc);
                    box(R, 0, 0, wz, 4.5, 3.3, 0.16, env.light ? WHITE_M : SLATE_M, wv);
                    box(R, 0, -1.37, wz + 0.16, 4.5, 0.56, 0.04, env.light ? NAVY_M : WHITE_M, wv);
                    [PAL.blue, PAL.sky, PAL.white].forEach((c, i) => cyl(R, -1.95 + i * 0.28, -1.37, wz + 0.2, 0.075, 0.03, mkMat(c, c, mix(c, PAL.navy, 0.5), c), wv));
                },
            });
            const top = 0.25 + 0.16;
            const piece = (p: Part, x: number, y: number, base: number, w: number, d: number, h: number, m: Mat, layer: number, nx = 0, ny = 0) => {
                const v = clamp(p.v.x);
                if (v < 0.01) return;
                const z = base + p.z.x;
                const hh = h * (1 - 0.2 * p.z.imp);
                Q.push({ l: layer - 0.3, d: 0, f: () => shadowRect(R, x + 0.06, y + 0.06, base, w, d, p.z.x * S * 0.3 + S * 0.05, (M.sha * v) / (1 + p.z.x * 0.6), M.shc) });
                Q.push({ l: layer, d: R.cam.p(x, y, z)[2], f: () => (box(R, x, y, z, w, d, hh, m, v), nx && studs(R, x, y, z + hh, w, d, nx, ny, m === BLUE_M ? WHITE_M : m, v)) });
            };
            piece(hero, 0.25, -0.42, top, 3.7, 0.95, 0.26, BLUE_M, 2);
            piece(btn, -0.95, -0.42, top + 0.26, 0.95, 0.34, 0.16, WHITE_M, 3);
            piece(cardA, -1.05, 0.82, top, 1.95, 1.2, 0.22, SKY_M, 2);
            piece(cardB, 1.05, 0.82, top, 1.95, 1.2, 0.22, M.body, 2, 2, 1);
            run(Q);
        },
    };
}

/* 02 · Apps: dos teléfonos con apps que aparecen en grilla y una notificación que salta */
function appScene(): Scene {
    const plate = part();
    const phA = part();
    const phB = part();
    const tilesA = Array.from({ length: 12 }, () => part(3));
    const tilesB = Array.from({ length: 12 }, () => part(3));
    const notif = part();
    const all = [plate, phA, phB, ...tilesA, ...tilesB, notif];
    const st = stagger();
    let hop = 0;
    const TILE = [BLUE_M, SKY_M, WHITE_M, SKY_M, BLUE_M, WHITE_M];
    return {
        bodies: bodiesOf(all),
        visible: () => all.some((p) => p.v.x > 0.01),
        targets(on, t) {
            const go = st(on, t);
            setPart(plate, go(0));
            setPart(phA, go(1));
            setPart(phB, go(2));
            tilesA.forEach((p, i) => setPart(p, go(3 + i * 0.35), 3));
            tilesB.forEach((p, i) => setPart(p, go(4 + i * 0.35), 3));
            setPart(notif, go(10));
            const k = Math.floor(t / 3);
            if (on && k !== hop && notif.z.x < 0.01 && notif.z.t === 0) {
                hop = k;
                notif.z.v = 5;
            }
        },
        poke() {
            [...tilesA, ...tilesB, notif].forEach((p, i) => p.z.t === 0 && p.z.x < 0.05 && (p.z.v = 2.5 + (i % 4)));
        },
        draw(R, env) {
            const S = frame(R, env);
            const M = matsFor(env.light);
            const { t, rm } = env;
            const Q: Item[] = [];
            const pv = clamp(plate.v.x);
            Q.push({ l: 0, d: 0, f: () => (shadowRect(R, 0.12, 0.12, 0, 5.4, 4.4, S * 0.4, M.sha * pv * 0.7, M.shc), box(R, 0, 0, plate.z.x, 5.4, 4.4, 0.25, M.plate, pv)) });
            const phone = (p: Part, cx: number, cy: number, rz: number, lift: number, m: Mat, screen: string, tiles: Part[], layer: number) => {
                const v = clamp(p.v.x);
                if (v < 0.01) return;
                const z = 0.25 + lift + p.z.x;
                Q.push({ l: layer - 0.4, d: 0, f: () => shadowRect(R, cx + 0.1, cy + 0.12, 0.25, 1.8, 3.4, (z - 0.25) * S * 0.35 + S * 0.08, (M.sha * v) / (1 + (z - 0.25) * 0.7), M.shc, rz) });
                Q.push({
                    l: layer,
                    d: 0,
                    f: () => {
                        box(R, cx, cy, z, 1.8, 3.4, 0.2, m, v, rz);
                        onPlane(R, z + 0.2, (c) => {
                            c.globalAlpha = v;
                            c.translate(cx, cy);
                            c.rotate(rz);
                            c.fillStyle = screen;
                            c.fillRect(-0.76, -1.5, 1.52, 3);
                            c.fillStyle = "rgba(145,190,246,0.5)";
                            c.fillRect(-0.24, -1.42, 0.48, 0.08);
                        });
                        const items: { x: number; y: number; p: Part; i: number }[] = [];
                        tiles.forEach((tp, i) => {
                            const [lx, ly] = rot(-0.42 + (i % 3) * 0.42, -0.95 + Math.floor(i / 3) * 0.55, rz);
                            items.push({ x: cx + lx, y: cy + ly, p: tp, i });
                        });
                        items.sort((a, b) => R.cam.p(a.x, a.y, 0)[2] - R.cam.p(b.x, b.y, 0)[2]);
                        for (const it of items) {
                            const tv = clamp(it.p.v.x) * v;
                            if (tv < 0.01) continue;
                            box(R, it.x, it.y, z + 0.2 + it.p.z.x, 0.3, 0.3, 0.1 * (1 - 0.2 * it.p.z.imp), TILE[it.i % TILE.length], tv, rz);
                        }
                    },
                });
            };
            const bob = rm ? 0 : Math.sin(t * 1.4) * 0.12;
            phone(phA, -1.2, 0.15, -0.14, 0, M.body, env.light ? "#E7F3F7" : "#0A1421", tilesA, 1);
            phone(phB, 1.25, -0.1, 0.12, 0.45 + bob, env.light ? WHITE_M : SLATE_M, env.light ? "#0A1421" : "#E7F3F7", tilesB, 2);
            const nv = clamp(notif.v.x);
            if (nv > 0.01) {
                const [lx, ly] = rot(0, -1.2, 0.12);
                const z = 0.25 + 0.45 + bob + 0.2 + notif.z.x;
                Q.push({ l: 3, d: 0, f: () => (box(R, 1.25 + lx, -0.1 + ly, z, 1.5, 0.42, 0.12 * (1 - 0.2 * notif.z.imp), BLUE_M, nv, 0.12), studs(R, 1.25 + lx - 0.5, -0.1 + ly, z + 0.12, 0.4, 0.4, 1, 1, WHITE_M, nv)) });
            }
            run(Q);
        },
    };
}

/* 03 · Software a medida: una grilla de módulos de distinta altura y la pieza azul que completa el hueco */
function softScene(): Scene {
    const plate = part();
    const N = 4;
    const GAP: P2 = [2, 1];
    const HTS = [0.6, 1.1, 0.8, 1.5, 1.3, 0.5, 0, 0.9, 0.7, 1.6, 1.0, 0.6, 1.2, 0.8, 1.4, 0.7];
    const cols = HTS.map(() => new Spring(0, 140, 11));
    const key = part(5);
    const st = stagger();
    let hop = 0;
    let onNow = false;
    return {
        bodies: [...bodiesOf([plate, key]), ...cols],
        visible: () => plate.v.x > 0.01 || key.v.x > 0.01,
        targets(on, t) {
            onNow = on;
            const go = st(on, t);
            setPart(plate, go(0));
            cols.forEach((s, i) => {
                const gx = i % N;
                const gy = Math.floor(i / N);
                s.t = go(1 + (gx + gy) * 0.6) ? HTS[i] : 0;
            });
            setPart(key, go(9), 5);
            const k = Math.floor(t / 3.6);
            if (on && k !== hop && key.z.x < 0.01 && key.z.t === 0) {
                hop = k;
                key.z.v = 5;
            }
        },
        poke() {
            cols.forEach((s, i) => (s.v += 3 + (i % 3)));
            if (key.z.t === 0 && key.z.x < 0.05) key.z.v = 7;
        },
        draw(R, env) {
            const S = frame(R, env);
            const M = matsFor(env.light);
            const { t, rm } = env;
            const pv = clamp(plate.v.x);
            if (pv < 0.01) return;
            const Q: Item[] = [];
            Q.push({ l: 0, d: 0, f: () => (shadowRect(R, 0.12, 0.12, 0, 5, 5, S * 0.4, M.sha * pv * 0.7, M.shc), box(R, 0, 0, plate.z.x, 5, 5, 0.25, M.plate, pv)) });
            const u = 1.05;
            HTS.forEach((_, i) => {
                const gx = i % N;
                const gy = Math.floor(i / N);
                if (gx === GAP[0] && gy === GAP[1]) return;
                const h = Math.max(0, cols[i].x) * (onNow && !rm ? 1 + 0.06 * Math.sin(t * 1.6 + gx * 0.9 + gy * 0.7) : 1);
                if (h < 0.02) return;
                const x = (gx - 1.5) * u;
                const y = (gy - 1.5) * u;
                const m = (gx + gy) % 2 ? M.alt : M.body;
                Q.push({ l: 1, d: R.cam.p(x, y, h / 2)[2], f: () => (box(R, x, y, 0.25 + plate.z.x, 0.92, 0.92, h, m, pv), cyl(R, x, y, 0.25 + plate.z.x + h, 0.18, 0.001, BLUE_M, pv)) });
            });
            const kv = clamp(key.v.x);
            if (kv > 0.01) {
                const x = (GAP[0] - 1.5) * u;
                const y = (GAP[1] - 1.5) * u;
                const z = 0.25 + key.z.x;
                const h = 1.15 * (1 - 0.2 * key.z.imp);
                const r = key.z.x * 0.32;
                Q.push({ l: 0.5, d: 0, f: () => shadowRect(R, x + 0.05, y + 0.05, 0.25, 0.92, 0.92, key.z.x * S * 0.3 + S * 0.05, (M.sha * kv) / (1 + key.z.x * 0.6), M.shc, r) });
                Q.push({ l: 1, d: R.cam.p(x, y, z + h / 2)[2] + 0.01, f: () => (box(R, x, y, z, 0.92, 0.92, h, BLUE_M, kv, r), studs(R, x, y, z + h, 0.92, 0.92, 2, 2, WHITE_M, kv, r)) });
            }
            run(Q);
        },
    };
}

/* 04 · CRM: etapas del embudo apiladas y un cliente (disco azul) que avanza de etapa en etapa */
function crmScene(): Scene {
    const plate = part();
    const COUNT = [6, 5, 3, 2];
    const XS = [-1.95, -0.65, 0.65, 1.95];
    const fill = COUNT.map(() => new Spring(0, 90, 13));
    const disc = new Spring(0, 60, 14);
    const st = stagger();
    let onNow = false;
    return {
        bodies: [...bodiesOf([plate]), ...fill, disc],
        visible: () => plate.v.x > 0.01,
        targets(on, t) {
            onNow = on;
            const go = st(on, t);
            setPart(plate, go(0));
            fill.forEach((s, i) => (s.t = go(1 + i) ? 1 : 0));
            disc.t = go(6) ? 1 : 0;
        },
        poke() {
            fill.forEach((s, i) => (s.v -= 2 + i));
        },
        draw(R, env) {
            const S = frame(R, env, 6.6);
            const M = matsFor(env.light);
            const { t, rm } = env;
            const pv = clamp(plate.v.x);
            if (pv < 0.01) return;
            const Q: Item[] = [];
            const STAGE = [M.alt, M.body, SKY_M, BLUE_M];
            Q.push({ l: 0, d: 0, f: () => (shadowRect(R, 0.12, 0.12, 0, 5.8, 3.6, S * 0.4, M.sha * pv * 0.7, M.shc), box(R, 0, 0, plate.z.x, 5.8, 3.6, 0.25, M.plate, pv)) });
            /* línea del recorrido sobre la placa */
            Q.push({
                l: 0.5,
                d: 0,
                f: () =>
                    onPlane(R, 0.25 + plate.z.x, (c) => {
                        c.globalAlpha = 0.5 * pv;
                        c.strokeStyle = env.light ? "#0A1421" : "#91BEF6";
                        c.lineWidth = 0.025;
                        c.setLineDash([0.12, 0.1]);
                        c.beginPath();
                        c.moveTo(-2.5, 1.15);
                        c.lineTo(2.5, 1.15);
                        c.stroke();
                    }),
            });
            const CH = 0.13;
            const tops = COUNT.map((n, i) => 0.25 + Math.round(clamp(fill[i].x) * n) * CH);
            COUNT.forEach((n, i) => {
                const k = Math.round(clamp(fill[i].x, 0, 1.2) * n);
                const x = XS[i];
                Q.push({
                    l: 1,
                    d: R.cam.p(x, 0, 0.4)[2],
                    f: () => {
                        for (let j = 0; j < k; j++) box(R, x, 0, 0.25 + j * CH, 1.05, 1.5, CH - 0.025, STAGE[i], pv);
                    },
                });
            });
            const dv = clamp(disc.x);
            if (dv > 0.01 && onNow) {
                const ph = rm ? 0.5 : (t * 0.75) % 4;
                const k = Math.min(3, Math.floor(ph));
                const f = ph - k;
                let x: number;
                let z: number;
                let a = dv;
                if (k < 3) {
                    const e = smooth(f);
                    x = XS[k] + (XS[k + 1] - XS[k]) * e;
                    z = tops[k] + (tops[k + 1] - tops[k]) * e + Math.sin(Math.PI * f) * 0.9;
                } else {
                    x = XS[3];
                    z = tops[3] + smooth(f) * 1.6;
                    a = dv * (1 - smooth(f));
                }
                Q.push({ l: 2, d: R.cam.p(x, 0, z)[2], f: () => cyl(R, x, 0, z, 0.32, 0.14, BLUE_M, a, PAL.sky) });
            }
            run(Q);
        },
    };
}

/* 05 · Mantenimiento y escalamiento: un servidor que crece capa por capa con satélites que lo cuidan */
function opsScene(): Scene {
    const plate = part();
    const layers = Array.from({ length: 5 }, () => part(5));
    const ring = new Spring(0, 60, 14);
    const st = stagger();
    return {
        bodies: [...bodiesOf([plate, ...layers]), ring],
        visible: () => plate.v.x > 0.01,
        targets(on, t) {
            const go = st(on, t);
            setPart(plate, go(0));
            layers.forEach((p, i) => setPart(p, go(1 + i * 2.2), 5));
            ring.t = go(13) ? 1 : 0;
        },
        poke() {
            layers.forEach((p, i) => p.z.t === 0 && p.z.x < 0.05 && (p.z.v = 2 + i * 0.8));
        },
        draw(R, env) {
            const S = frame(R, env, 6.6, 6.4);
            const M = matsFor(env.light);
            const { t, rm } = env;
            const pv = clamp(plate.v.x);
            if (pv < 0.01) return;
            const Q: Item[] = [];
            Q.push({ l: 0, d: 0, f: () => (shadowRect(R, 0.12, 0.12, 0, 4.6, 4.6, S * 0.4, M.sha * pv * 0.7, M.shc), box(R, 0, 0, plate.z.x, 4.6, 4.6, 0.25, M.plate, pv)) });
            const LH = 0.44;
            let base = 0.25;
            const stack: (() => void)[] = [];
            layers.forEach((p, i) => {
                const v = clamp(p.v.x);
                if (v < 0.01) return;
                const z = base + p.z.x;
                const last = i === layers.length - 1;
                const m = last ? BLUE_M : i % 2 ? M.alt : M.body;
                const b0 = base;
                stack.push(() => {
                    shadowRect(R, 0.06, 0.06, b0, 2.6, 2.6, p.z.x * S * 0.3 + S * 0.05, (M.sha * v) / (1 + p.z.x * 0.6), M.shc);
                    box(R, 0, 0, z, 2.6, 2.6, LH - 0.05, m, v);
                    if (!last) {
                        /* luces de estado en las dos caras visibles */
                        const blink = rm ? 1 : 0.55 + 0.45 * Math.sin(t * 3 + i * 1.3);
                        box(R, 0.2, 1.31, z + 0.16, 1.6, 0.03, 0.08, mkMat(PAL.blue, PAL.blue, hex("#2C5FB8"), PAL.sky), v * blink);
                        box(R, 1.31, 0.2, z + 0.16, 0.03, 1.6, 0.08, mkMat(PAL.sky, PAL.sky, hex("#4F7FC4"), PAL.pure), v * blink);
                    } else studs(R, 0, 0, z + LH - 0.05, 2.6, 2.6, 2, 2, WHITE_M, v);
                });
                base += LH;
            });
            Q.push({ l: 1, d: 0, f: () => stack.forEach((fn) => fn()) });
            const rv = clamp(ring.x);
            if (rv > 0.01) {
                const zc = 0.25 + base * 0.5;
                const dc = R.cam.p(0, 0, zc)[2];
                Q.push({
                    l: 0.9,
                    d: 0,
                    f: () =>
                        onPlane(R, zc, (c) => {
                            c.globalAlpha = 0.4 * rv;
                            c.strokeStyle = env.light ? "#0A1421" : "#91BEF6";
                            c.lineWidth = 0.02;
                            c.setLineDash([0.12, 0.1]);
                            c.beginPath();
                            c.arc(0, 0, 2.65, 0, TAU);
                            c.stroke();
                        }),
                });
                for (let i = 0; i < 8; i++) {
                    const a = (rm ? 0 : t * 0.5) + (i * TAU) / 8;
                    const x = Math.cos(a) * 2.65;
                    const y = Math.sin(a) * 2.65;
                    const z = zc - 0.12 + Math.sin(a * 2 + i) * 0.25;
                    const d = R.cam.p(x, y, z)[2];
                    Q.push({ l: d < dc ? 0.95 : 8, d, f: () => box(R, x, y, z, 0.28, 0.28, 0.28, i % 3 === 0 ? BLUE_M : M.body, rv, a) });
                }
            }
            run(Q);
        },
    };
}

/* =====================================================================
   COHETE
   ===================================================================== */
interface Puff {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    max: number;
    s: number;
    r: number;
}
interface RocketScene {
    bodies: Body[];
    targets: (p: number, t: number, rm: boolean) => void;
    step: (dt: number, t: number) => void;
    draw: (R: Rend, env: Env) => void;
    poke: () => void;
    altitude: () => number;
}
const PAD_TOP = 0.3;
function rocketScene(): RocketScene {
    const parts = {
        pad: part(4),
        engine: part(6),
        fins: part(6),
        body: part(6),
        band: part(6),
        capsule: part(6),
        nose: part(6),
    };
    const list = Object.values(parts);
    const lift = new Spring(0, 40, 13);
    const arm = new Spring(0, 60, 14);
    const thrust = new Spring(0, 30, 10);
    const shake = new Spring(0, 200, 8);
    const puffs: Puff[] = [];
    let spawn = 0;
    let burst = 0;
    let rmNow = false;
    const emit = (n: number, atZ: number, spread: number, up: number) => {
        for (let i = 0; i < n && puffs.length < 180; i++) {
            const a = Math.random() * TAU;
            const sp = spread * (0.4 + Math.random() * 0.8);
            puffs.push({
                x: Math.cos(a) * 0.3,
                y: Math.sin(a) * 0.3,
                z: atZ,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                vz: up * (0.4 + Math.random()),
                life: 0,
                max: 1.4 + Math.random() * 1.6,
                s: 0.16 + Math.random() * 0.18,
                r: Math.random() * TAU,
            });
        }
    };
    return {
        bodies: [...bodiesOf(list), lift, arm, thrust, shake],
        altitude: () => Math.max(0, lift.x),
        targets(p, _t, rm) {
            rmNow = rm;
            const TH = { pad: 0.0, engine: 0.05, fins: 0.1, body: 0.15, band: 0.2, capsule: 0.24, nose: 0.29 };
            (Object.keys(parts) as (keyof typeof parts)[]).forEach((k) => setPart(parts[k], p > TH[k], k === "pad" ? 4 : 6));
            arm.t = p > 0.4 ? 1 : 0;
            thrust.t = p > 0.42 ? (p > 0.52 ? 1 : 0.35) : 0;
            const lp = clamp((p - 0.52) / 0.46);
            lift.t = Math.pow(lp, 1.7) * 17;
        },
        step(dt) {
            if (rmNow) return;
            /* tiembla mientras carga potencia, antes y durante el despegue */
            if (thrust.x > 0.2 && lift.x < 4) shake.v += (Math.random() - 0.5) * 60 * thrust.x * dt * 60;
            const zR = Math.max(0, lift.x);
            spawn += dt * (thrust.x > 0.05 ? 26 + 50 * thrust.x : 0);
            while (spawn > 1) {
                spawn -= 1;
                if (zR < 2.5) emit(1, PAD_TOP + 0.05, 1.6 + thrust.x * 1.8, 0.4);
                else emit(1, PAD_TOP + zR - 0.2, 0.35, -0.8);
            }
            if (burst > 0) {
                emit(burst, PAD_TOP + 0.1, 2.2, 0.8);
                burst = 0;
            }
            for (let i = puffs.length - 1; i >= 0; i--) {
                const q = puffs[i];
                q.life += dt;
                if (q.life > q.max) {
                    puffs.splice(i, 1);
                    continue;
                }
                q.x += q.vx * dt;
                q.y += q.vy * dt;
                q.z = Math.max(PAD_TOP, q.z + q.vz * dt);
                q.vx *= Math.exp(-dt * 1.4);
                q.vy *= Math.exp(-dt * 1.4);
                q.vz = q.vz * Math.exp(-dt * 1.2) + 0.25 * dt;
                q.s += dt * 0.35;
            }
        },
        poke() {
            burst = 18;
            shake.v += 18;
        },
        draw(R, env) {
            const { ctx, W } = R;
            const A = env.area;
            const M = matsFor(env.light);
            const { t, rm } = env;
            /* encuadre: placa + cohete armado (≈ 5.3 de alto) dentro del hueco libre */
            const yaw = 34 + env.mx * 8;
            const pitch = 30 - env.my * 3;
            R.cam.set(yaw, pitch, 1, 0, 0);
            let x0 = Infinity;
            let x1 = -Infinity;
            let y0 = Infinity;
            let y1 = -Infinity;
            for (const bx of [-2.4, 2.4])
                for (const by of [-2.4, 2.4])
                    for (const bz of [0, 5.6]) {
                        const q = R.cam.p(bx, by, bz);
                        x0 = Math.min(x0, q[0]);
                        x1 = Math.max(x1, q[0]);
                        y0 = Math.min(y0, q[1]);
                        y1 = Math.max(y1, q[1]);
                    }
            const S = Math.max(12, Math.min((Math.min(W, env.limit * 2) * 0.86) / (x1 - x0), (A.h * 0.92) / (y1 - y0), 120));
            const sx = rm ? 0 : shake.x * 0.04 * S * 0.05;
            R.cam.set(yaw, pitch, S, W * 0.5 - ((x0 + x1) / 2) * S + sx, A.y + A.h * 0.5 - ((y0 + y1) / 2) * S);

            const Q: Item[] = [];
            const pd = parts.pad;
            const pv = clamp(pd.v.x);
            const pz = pd.z.x;
            /* plataforma con su anillo y la torre de servicio */
            Q.push({
                l: 0,
                d: 0,
                f: () => {
                    shadowRect(R, 0.14, 0.14, 0, 4.8, 4.8, S * 0.45, M.sha * pv * 0.7, M.shc);
                    box(R, 0, 0, pz, 4.8, 4.8, PAD_TOP, M.plate, pv);
                    onPlane(R, PAD_TOP + pz, (c) => {
                        c.globalAlpha = 0.55 * pv;
                        c.strokeStyle = env.light ? "#0A1421" : "#91BEF6";
                        c.lineWidth = 0.025;
                        c.beginPath();
                        c.arc(0, 0, 1.25, 0, TAU);
                        c.stroke();
                        c.setLineDash([0.1, 0.1]);
                        c.beginPath();
                        c.arc(0, 0, 1.75, 0, TAU);
                        c.stroke();
                        /* resplandor del motor sobre la plataforma */
                        const g = c.createRadialGradient(0, 0, 0, 0, 0, 2.2);
                        const k = clamp(thrust.x) * clamp(1 - lift.x / 5);
                        g.addColorStop(0, `rgba(145,190,246,${0.55 * k})`);
                        g.addColorStop(1, "rgba(145,190,246,0)");
                        c.setLineDash([]);
                        c.fillStyle = g;
                        c.beginPath();
                        c.arc(0, 0, 2.2, 0, TAU);
                        c.fill();
                    });
                },
            });
            const tx = 1.75;
            const ty = -1.55;
            const towerD = R.cam.p(tx, ty, 2)[2];
            Q.push({
                l: 1,
                d: towerD,
                f: () => {
                    box(R, tx, ty, PAD_TOP + pz, 0.42, 0.42, 4.4, M.alt, pv);
                    const ar = arm.x;
                    for (const hz of [1.6, 3.3]) box(R, tx - 0.65 * (1 - ar) - 0.25, ty + 0.55 * (1 - ar), PAD_TOP + pz + hz, 1.1 * (1 - ar * 0.6), 0.16, 0.12, BLUE_M, pv, -0.72);
                    cyl(R, tx, ty, PAD_TOP + pz + 4.4, 0.1, 0.12, BLUE_M, pv * (rm ? 1 : 0.4 + 0.6 * (Math.sin(t * 4) > 0 ? 1 : 0)), PAL.sky);
                },
            });

            /* cohete */
            const zR = Math.max(0, lift.x);
            const base = PAD_TOP + zR;
            const rocketD = R.cam.p(0, 0, base + 2)[2];
            const v = (p: Part) => clamp(p.v.x);
            const zz = (p: Part) => p.z.x;
            /* llama: de blanco a azul, titila */
            const thr = clamp(thrust.x);
            if (thr > 0.02) {
                Q.push({
                    l: 1,
                    d: rocketD - 0.5,
                    f: () => {
                        const b = R.cam.p(0, 0, base + zz(parts.engine));
                        const len = (0.6 + thr * (zR > 0.05 ? 2.4 : 1.1)) * S * (rm ? 1 : 0.85 + Math.random() * 0.3);
                        const w = 0.42 * S;
                        ctx.save();
                        ctx.globalCompositeOperation = env.light ? "source-over" : "lighter";
                        const g = ctx.createLinearGradient(b[0], b[1], b[0], b[1] + len);
                        g.addColorStop(0, "rgba(255,255,255,0.95)");
                        g.addColorStop(0.25, "rgba(145,190,246,0.9)");
                        g.addColorStop(0.7, "rgba(75,146,244,0.45)");
                        g.addColorStop(1, "rgba(75,146,244,0)");
                        ctx.fillStyle = g;
                        ctx.beginPath();
                        ctx.moveTo(b[0] - w, b[1]);
                        ctx.quadraticCurveTo(b[0] - w * 0.6, b[1] + len * 0.6, b[0], b[1] + len);
                        ctx.quadraticCurveTo(b[0] + w * 0.6, b[1] + len * 0.6, b[0] + w, b[1]);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    },
                });
            }
            const FINS: { x: number; y: number; w: number; d: number }[] = [
                { x: 0.72, y: 0, w: 0.62, d: 0.1 },
                { x: -0.72, y: 0, w: 0.62, d: 0.1 },
                { x: 0, y: 0.72, w: 0.1, d: 0.62 },
                { x: 0, y: -0.72, w: 0.1, d: 0.62 },
            ];
            const winPt = (z: number) => {
                const n = [R.cam.sy, R.cam.cy];
                return R.cam.p(n[0] * 0.6, n[1] * 0.6, z);
            };
            Q.push({
                l: 1,
                d: rocketD,
                f: () => {
                    const fv = v(parts.fins);
                    const fz = base + zz(parts.fins);
                    const finDraw = (front: boolean) =>
                        FINS.filter((f) => R.cam.p(f.x, f.y, 0)[2] > R.cam.p(0, 0, 0)[2] === front).forEach((f) => box(R, f.x, f.y, fz, f.w, f.d, 1.05, BLUE_M, fv));
                    finDraw(false);
                    cyl(R, 0, 0, base + zz(parts.engine), 0.5, 0.42, NAVY_M, v(parts.engine));
                    cyl(R, 0, 0, base + 0.42 + zz(parts.body), 0.6, 2.0, WHITE_M, v(parts.body));
                    finDraw(true);
                    cyl(R, 0, 0, base + 1.55 + zz(parts.band), 0.62, 0.26, BLUE_M, v(parts.band));
                    cyl(R, 0, 0, base + 2.42 + zz(parts.capsule), 0.6, 0.78, WHITE_M, v(parts.capsule));
                    /* ventana del módulo */
                    const cv = v(parts.capsule);
                    if (cv > 0.01) {
                        const w = winPt(base + 2.82 + zz(parts.capsule));
                        ctx.save();
                        ctx.globalAlpha = cv;
                        ctx.beginPath();
                        ctx.ellipse(w[0], w[1], 0.2 * S, 0.21 * S, 0, 0, TAU);
                        ctx.fillStyle = "#4B92F4";
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(w[0] + 0.03 * S, w[1] - 0.03 * S, 0.11 * S, 0.12 * S, 0, 0, TAU);
                        ctx.fillStyle = "#0A1421";
                        ctx.fill();
                        ctx.restore();
                    }
                    cone(R, 0, 0, base + 3.2 + zz(parts.nose), 0.6, 1.05, BLUE_M, v(parts.nose));
                },
            });
            /* humo: cubos que se abren sobre la plataforma y dejan estela */
            const smokeM = env.light ? SKY_M : WHITE_M;
            for (const q of puffs) {
                const a = clamp(1 - q.life / q.max) * 0.85;
                Q.push({ l: 1, d: R.cam.p(q.x, q.y, q.z)[2], f: () => box(R, q.x, q.y, q.z, q.s, q.s, q.s, smokeM, a, q.r) });
            }
            run(Q);
        },
    };
}

/* =====================================================================
   COMPONENTE
   ===================================================================== */
const Products = () => {
    const { theme } = UseTheme();
    const { texts, language } = UseLanguage();
    const c = landingOf(texts, language).products;
    const isDark = theme === "dark";
    const themeRef = useRef(isDark);
    themeRef.current = isDark;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const prodRef = useRef<HTMLElement>(null);
    const prodCv = useRef<HTMLCanvasElement>(null);
    const rockRef = useRef<HTMLElement>(null);
    const rockCv = useRef<HTMLCanvasElement>(null);
    const countRef = useRef<HTMLSpanElement>(null);
    const altRef = useRef<HTMLElement>(null);

    /* el índice de la portada lleva directo a cada capítulo de la sección fija */
    const goTo = (i: number) => {
        const sec = prodRef.current;
        if (!sec) return;
        const top = sec.getBoundingClientRect().top + window.scrollY;
        const span = sec.offsetHeight - window.innerHeight;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: top + span * ((i + 0.45) / c.products.length), behavior: reduce ? "auto" : "smooth" });
    };

    /* ---------- motor ---------- */
    useEffect(() => {
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        const scenes: Scene[] = [webScene(), appScene(), softScene(), crmScene(), opsScene()];
        const rocket = rocketScene();
        const mk = (cv: HTMLCanvasElement | null): Rend | null => {
            const ctx = cv?.getContext("2d");
            return ctx ? { ctx, cam: new Cam(), dpr: 1, W: 1, H: 1 } : null;
        };
        const RP = mk(prodCv.current);
        const RR = mk(rockCv.current);
        const pairs: [HTMLCanvasElement | null, Rend | null][] = [
            [prodCv.current, RP],
            [rockCv.current, RR],
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

        const vis = { prod: false, rock: false };
        const io = new IntersectionObserver(
            (es) =>
                es.forEach((e) => {
                    if (e.target === prodRef.current) vis.prod = e.isIntersecting;
                    if (e.target === rockRef.current) vis.rock = e.isIntersecting;
                }),
            { rootMargin: "15% 0px" }
        );
        if (prodRef.current) io.observe(prodRef.current);
        if (rockRef.current) io.observe(rockRef.current);

        /* cursor (en táctil: deriva suave sola) */
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
        let active = 0;
        const pokeProd = () => scenes[active]?.poke?.();
        const pokeRock = () => rocket.poke();
        prodCv.current?.addEventListener("click", pokeProd);
        rockCv.current?.addEventListener("click", pokeRock);

        const rel = (cv: HTMLCanvasElement, el: Element | null) => {
            if (!el) return null;
            const a = cv.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return { top: r.top - a.top, bottom: r.bottom - a.top, left: r.left - a.left, right: r.right - a.left };
        };
        /* hueco libre que deja el texto, medido del DOM en cada frame */
        const prodArea = (R: Rend): { area: Area; limit: number } => {
            const cv = prodCv.current;
            const sec = prodRef.current;
            const full = { area: { x: 0, y: 0, w: R.W, h: R.H }, limit: Infinity };
            if (!cv || !sec) return full;
            const nm = rel(cv, sec.querySelector(".ci-pin__name.is-active"));
            const st = rel(cv, sec.querySelector(".ci-pin__step.is-active"));
            const tl = rel(cv, sec.querySelector(".ci-pin__timeline"));
            if (!nm || !st || !tl) return full;
            const top = nm.bottom + 6;
            let bottom = tl.top - 14;
            let limit = Infinity;
            if (st.right < R.W / 2) limit = R.W / 2 - st.right - 24;
            else bottom = Math.min(bottom, st.top - 10);
            return { area: { x: 0, y: top, w: R.W, h: Math.max(100, bottom - top) }, limit: Math.max(70, limit) };
        };
        const rockArea = (R: Rend): { area: Area; limit: number } => {
            const cv = rockCv.current;
            const sec = rockRef.current;
            const full = { area: { x: 0, y: 0, w: R.W, h: R.H }, limit: Infinity };
            if (!cv || !sec) return full;
            const tt = rel(cv, sec.querySelector(".ci-rocket__title"));
            const tx = rel(cv, sec.querySelector(".ci-rocket__text"));
            const ru = rel(cv, sec.querySelector(".ci-rocket__ruler"));
            if (!tt || !tx || !ru) return full;
            const top = tt.bottom + 8;
            let bottom = R.H - 24;
            let limit = Infinity;
            const right = Math.min(R.W, ru.left - 16);
            if (tx.right < R.W / 2) limit = Math.min(R.W / 2 - tx.right - 16, right - R.W / 2);
            else bottom = Math.min(bottom, tx.top - 10);
            return { area: { x: 0, y: top, w: R.W, h: Math.max(120, bottom - top) }, limit: Math.max(90, limit) };
        };

        let raf = 0;
        let last = performance.now();
        const t0 = last;
        let acc = 0;
        const STEP = 1 / 240;
        const N = scenes.length;
        const loop = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const t = (now - t0) / 1000;
            const vh = window.innerHeight;
            const light = !themeRef.current;
            mx.t = hasPointer ? px : Math.sin(t * 0.4) * 0.35;
            my.t = hasPointer ? py : Math.cos(t * 0.3) * 0.2;

            /* ---- productos ---- */
            const ps = prodRef.current;
            let pp = 0;
            if (ps) {
                const r = ps.getBoundingClientRect();
                pp = clamp(-r.top / Math.max(1, r.height - vh));
                active = Math.min(N - 1, Math.floor(pp * N));
                const inView = r.top < vh && r.bottom > 0;
                ps.querySelectorAll(".ci-pin__name, .ci-pin__step").forEach((el) => {
                    const on = Number((el as HTMLElement).dataset.i) === active;
                    if (el.classList.contains("is-active") !== on) el.classList.toggle("is-active", on);
                });
                ps.querySelectorAll<HTMLElement>(".ci-pin__timeline li").forEach((el, i) => {
                    if (el.classList.contains("is-on") !== i <= active) el.classList.toggle("is-on", i <= active);
                    const b = el.querySelector<HTMLElement>("b");
                    if (b) b.style.transform = `scaleX(${clamp(pp * N - i).toFixed(3)})`;
                });
                const ix = ps.querySelector(".ci-pin__index b");
                if (ix && ix.textContent !== pad(active + 1)) ix.textContent = pad(active + 1);
                scenes.forEach((s, i) => s.targets(inView && i === active, t));
            }
            /* ---- cohete ---- */
            const rs = rockRef.current;
            let rp = 0;
            if (rs) {
                const r = rs.getBoundingClientRect();
                rp = clamp(-r.top / Math.max(1, r.height - vh));
                rocket.targets(rp, t, rm);
                /* cuenta regresiva y altitud */
                const cnt = countRef.current;
                if (cnt) {
                    let label = "";
                    if (rp > 0.36 && rp <= 0.52) label = String(3 - Math.min(2, Math.floor(((rp - 0.36) / 0.16) * 3)));
                    else if (rp > 0.52 && rp < 0.62) label = c.rocket.liftoff;
                    if (cnt.textContent !== label) {
                        cnt.textContent = label;
                        cnt.classList.remove("is-tick");
                        void cnt.offsetWidth;
                        if (label) cnt.classList.add("is-tick");
                    }
                    cnt.parentElement?.classList.toggle("is-word", label === c.rocket.liftoff);
                }
                const km = Math.round(clamp((rp - 0.52) / 0.46) ** 1.7 * 120);
                const alt = altRef.current;
                if (alt) {
                    const s = `${km} km`;
                    const v = alt.querySelector(".ci-rocket__alt b");
                    if (v && v.textContent !== s) v.textContent = s;
                    alt.style.setProperty("--alt", (km / 120).toFixed(3));
                    alt.querySelectorAll<HTMLElement>(".ci-rocket__phase").forEach((el, i) => {
                        const on = km >= [2, 45, 95][i];
                        if (el.classList.contains("is-on") !== on) el.classList.toggle("is-on", on);
                    });
                }
            }

            /* ---- física con paso fijo ---- */
            if (rm) {
                [mx, my].forEach((b) => b.snap());
                scenes.forEach((s) => s.bodies.forEach((b) => b.snap()));
                rocket.bodies.forEach((b) => b.snap());
            } else {
                acc += dt;
                while (acc > STEP) {
                    mx.step(STEP);
                    my.step(STEP);
                    if (vis.prod) scenes.forEach((s) => s.bodies.forEach((b) => b.step(STEP)));
                    if (vis.rock) {
                        rocket.bodies.forEach((b) => b.step(STEP));
                        rocket.step(STEP, t);
                    }
                    acc -= STEP;
                }
            }

            /* ---- dibujo ---- */
            if (RP && vis.prod) {
                const { ctx, dpr, W, H } = RP;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, W, H);
                const lay = prodArea(RP);
                const env: Env = { t, mx: mx.x, my: my.x, rm, light, area: lay.area, limit: lay.limit };
                scenes.forEach((s) => s.visible() && s.draw(RP, env));
            }
            if (RR && vis.rock) {
                const { ctx, dpr, W, H } = RR;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, W, H);
                const lay = rockArea(RR);
                rocket.draw(RR, { t, mx: mx.x, my: my.x, rm, light, area: lay.area, limit: lay.limit });
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener("pointermove", onMove);
            prodCv.current?.removeEventListener("click", pokeProd);
            rockCv.current?.removeEventListener("click", pokeRock);
        };
        // los textos de la cuenta regresiva se leen de "c" en cada frame a través del cierre
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    /* ---------- piezas de interfaz ---------- */
    const line = (label: string) => (
        <span className="ci-line__txt" aria-hidden="true">
            {[...label].map((ch, i) => (
                <span key={i} style={{ "--i": i } as CSSProperties}>
                    {ch === " " ? " " : ch}
                </span>
            ))}
        </span>
    );
    const arrow = (
        <svg className="ci-line__arrow" viewBox="0 0 26 26" aria-hidden="true">
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
    const words = c.title.split(" ");
    const N = c.products.length;

    return (
        <MotionConfig reducedMotion="user">
            <main className={`ci ${isDark ? "theme-dark" : "theme-light"}`}>
                {/* ---------- portada ---------- */}
                <section className="ci-hero">
                    <div className="ci-wrap">
                        <motion.p className="ci-kicker" {...reveal()}>
                            <i aria-hidden="true" />
                            {c.kicker}
                        </motion.p>
                        <h1 className="ci-hero__title" aria-label={c.title} key={language}>
                            {words.map((w, i) => (
                                <span className="ci-mask" key={i} aria-hidden="true">
                                    <motion.span
                                        className={i === words.length - 1 ? "is-accent" : undefined}
                                        initial={{ y: "112%" }}
                                        animate={{ y: "0%" }}
                                        transition={{ duration: 1.15, ease: EASE, delay: 0.15 + i * 0.065 }}
                                    >
                                        {w}
                                    </motion.span>
                                </span>
                            ))}
                        </h1>
                        <div className="ci-hero__foot">
                            <motion.p className="ci-body" {...reveal(0.2)}>
                                {c.text}
                            </motion.p>
                            <motion.nav className="ci-index" aria-label={c.indexLabel} {...reveal(0.3)}>
                                <span className="ci-label">{c.indexLabel}</span>
                                <ol>
                                    {c.products.map((p, i) => (
                                        <li key={i}>
                                            <button type="button" className="ci-line ci-line--index" onClick={() => goTo(i)} aria-label={p.name}>
                                                <sup aria-hidden="true">{pad(i + 1)}</sup>
                                                {line(p.name)}
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            </motion.nav>
                        </div>
                    </div>
                </section>

                {/* ---------- productos: sección fija ---------- */}
                <section className="ci-pin" ref={prodRef} style={{ "--n": N } as CSSProperties}>
                    <div className="ci-pin__sticky">
                        <h2 className="ci-pin__names">
                            {c.products.map((p, i) => (
                                <span className={`ci-pin__name${i === 0 ? " is-active" : ""}`} data-i={i} key={`${language}-${i}`}>
                                    {p.name.split(" ").map((w, j) => (
                                        <span className="ci-mask" key={j}>
                                            <span style={{ "--j": j } as CSSProperties}>{w}</span>
                                        </span>
                                    ))}
                                </span>
                            ))}
                        </h2>
                        <canvas ref={prodCv} className="ci-pin__canvas" role="img" aria-label={c.aria.products} />
                        <div className="ci-pin__hud">
                            <p className="ci-kicker">
                                <span>01</span>
                                {c.productsKicker}
                            </p>
                            <p className="ci-pin__index" aria-hidden="true">
                                <b>01</b>
                                <span>/{pad(N)}</span>
                            </p>
                            <div className="ci-pin__steps">
                                {c.products.map((p, i) => (
                                    <div className={`ci-pin__step${i === 0 ? " is-active" : ""}`} data-i={i} key={`${language}-${i}`}>
                                        <h3 className="ci-pin__tag">{p.tagline}</h3>
                                        <p className="ci-pin__text">{p.text}</p>
                                        <ul className="ci-pin__points">
                                            {p.points.map((pt, j) => (
                                                <li key={j}>{pt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <ol className="ci-pin__timeline">
                                {c.products.map((p, i) => (
                                    <li key={i} className={i === 0 ? "is-on" : ""}>
                                        <i aria-hidden="true">
                                            <b />
                                        </i>
                                        <span>{p.name}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                {/* ---------- despegue ---------- */}
                <section className="ci-rocket" ref={rockRef}>
                    <div className="ci-rocket__sticky">
                        <h2 className="ci-rocket__title">{c.rocket.title}</h2>
                        <canvas ref={rockCv} className="ci-rocket__canvas" role="img" aria-label={c.aria.rocket} />
                        <div className="ci-rocket__hud">
                            <p className="ci-kicker">
                                <span>02</span>
                                {c.rocket.kicker}
                            </p>
                            <p className="ci-rocket__count" aria-live="off">
                                <span ref={countRef} />
                            </p>
                            <p className="ci-rocket__text">{c.rocket.text}</p>
                            <aside className="ci-rocket__ruler" ref={altRef} aria-label={c.rocket.altitude}>
                                <span className="ci-rocket__track" aria-hidden="true">
                                    <i />
                                </span>
                                <ol>
                                    {c.rocket.phases.map((ph, i) => (
                                        <li className="ci-rocket__phase" key={i} style={{ "--y": [0.12, 0.5, 0.92][i] } as CSSProperties}>
                                            <b>{ph.title}</b>
                                            <span>{ph.text}</span>
                                        </li>
                                    ))}
                                </ol>
                                <p className="ci-rocket__alt">
                                    <span>{c.rocket.altitude}</span>
                                    <b>0 km</b>
                                </p>
                            </aside>
                        </div>
                    </div>
                </section>

                {/* ---------- cierre ---------- */}
                <section className="ci-cta">
                    <div className="ci-wrap ci-cta__inner">
                        <motion.h2 className="ci-cta__title" {...reveal()}>
                            {c.cta.title}
                        </motion.h2>
                        <motion.div {...reveal(0.12)}>
                            <Link to="/contact" className="ci-line ci-line--primary ci-line--xl" aria-label={c.cta.button}>
                                {line(c.cta.button)}
                                {arrow}
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </main>
        </MotionConfig>
    );
};

export default Products;