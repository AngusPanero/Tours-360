import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { UseTheme } from "../contexts/ThemeContext";
import { UseLanguage, LANDING, type LandingLocale, type LandingTexts, type TextsConfig } from "../contexts/LanguageContext";
import "./lab.css";

/**
 * Lab — DeepDev
 * ---------------------------------------------------------
 * El taller del estudio: experimentos jugables con el motor gráfico propio
 * y el stack tecnológico contado como una torre de capas.
 * 1. Portada: un campo de columnas que ondula con el tiempo y el scroll.
 * 2. Experimentos: índice de filas; cada uno se abre a pantalla completa
 *    con sus controles (gravedad, logo extruido, muro de letras, botones)
 *    y cuatro juegos: torre, ondas, laberinto y secuencia.
 * 3. Stack: sección fija con cuatro capas (frontend, backend, servicios,
 *    infraestructura) y las herramientas escritas sobre cada una.
 * 4. Cierre hacia contacto.
 * Todos los textos salen del contexto de idioma (landing.lab).
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
/* =====================================================================
   ESCENAS
   ===================================================================== */
interface Area {
    x: number;
    y: number;
    w: number;
    h: number;
}
const FONT = '"Funnel Display","Geist",system-ui,sans-serif';
function planeText(c: CanvasRenderingContext2D, str: string, x: number, y: number, size: number, weight = 500, align: CanvasTextAlign = "left") {
    c.save();
    c.translate(x, y);
    const k = size / 100;
    c.scale(k, k);
    c.font = `${weight} 100px ${FONT}`;
    c.textAlign = align;
    c.textBaseline = "middle";
    c.fillText(str, 0, 0);
    c.restore();
}

/* ---------- PORTADA: un campo de columnas que ondula ---------- */
function waveScene() {
    const N = 9;
    const rise = new Spring(0, 40, 12);
    return {
        bodies: [rise] as Body[],
        targets(on: boolean) {
            rise.t = on ? 1 : 0;
        },
        draw(R: Rend, area: Area, t: number, light: boolean, rm: boolean, mx: number, my: number, scroll: number) {
            const M = matsFor(light);
            const S = Math.max(10, Math.min(area.w / 15, area.h / 7.2));
            R.cam.set(45 + mx * 8, 35 - my * 4, S, R.W * 0.5, area.y + area.h * 0.58);
            const k = clamp(rise.x);
            if (k < 0.01) return;
            const cells: { x: number; y: number; h: number; m: Mat; top?: boolean }[] = [];
            for (let i = 0; i < N; i++)
                for (let j = 0; j < N; j++) {
                    const x = (i - (N - 1) / 2) * 1.02;
                    const y = (j - (N - 1) / 2) * 1.02;
                    const d = Math.hypot(x, y);
                    const wave = rm ? 0.5 : 0.5 + 0.5 * Math.sin(d * 1.1 - t * 1.6 + scroll * 6);
                    const h = (0.25 + wave * (1.1 - d * 0.07) + (i === 4 && j === 4 ? 0.9 : 0)) * k;
                    const accent = (i === 4 && j === 4) || (i + j * 3) % 11 === 0;
                    cells.push({ x, y, h: Math.max(0.05, h), m: i === 4 && j === 4 ? BLUE_M : accent ? SKY_M : (i + j) % 2 ? M.body : M.alt, top: i === 4 && j === 4 });
                }
            cells.sort((a, b) => R.cam.p(a.x, a.y, 0)[2] - R.cam.p(b.x, b.y, 0)[2]);
            shadowRect(R, 0.2, 0.2, 0, N * 1.02, N * 1.02, S * 0.6, M.sha * 0.6 * k, M.shc);
            for (const c of cells) {
                box(R, c.x, c.y, 0, 0.94, 0.94, c.h, c.m, k);
                if (c.top) studs(R, c.x, c.y, c.h, 0.94, 0.94, 2, 2, WHITE_M, k);
            }
        },
    };
}

/* ---------- STACK: torre de cuatro capas con las herramientas escritas encima ---------- */
const SL = 4.6;
function stackScene() {
    const enter = Array.from({ length: 4 }, () => part(5));
    const gap = new Spring(0, 60, 12);
    const pop = Array.from({ length: 4 }, () => new Spring(0, 120, 12));
    const peelS = Array.from({ length: 4 }, () => new Spring(0, 60, 13));
    let active = 0;
    return {
        bodies: [...bodiesOf(enter), gap, ...pop, ...peelS] as Body[],
        targets(on: boolean, p: number, k: number) {
            active = k;
            enter.forEach((e, i) => setPart(e, on, 5 + i));
            gap.t = on ? 0.25 + smooth(clamp(p * 1.4)) * 0.75 : 0;
            pop.forEach((s, i) => (s.t = on && i === k ? 1 : 0));
            peelS.forEach((s, i) => (s.t = on && i < k ? 1 + (k - i) * 0.35 : 0));
        },
        poke() {
            pop.forEach((s) => (s.v += 4));
        },
        draw(R: Rend, area: Area, limit: number, t: number, light: boolean, rm: boolean, mx: number, my: number, tools: string[][], names: string[]) {
            const M = matsFor(light);
            const S = Math.max(14, Math.min(area.h / 7.4, area.w / 8.2, limit / 3.6));
            R.cam.set(38 + mx * 9, 34 - my * 4, S, R.W * 0.5, area.y + area.h * 0.8);
            const LH = 0.42;
            const MAT = [BLUE_M, SKY_M, M.body, M.alt];
            shadowRect(R, 0.16, 0.16, 0, SL, SL, S * 0.5, M.sha * 0.7 * clamp(enter[3].v.x), M.shc);
            /* de abajo hacia arriba: infraestructura (3) … frontend (0) */
            for (let i = 3; i >= 0; i--) {
                const v = clamp(enter[i].v.x);
                if (v < 0.01) continue;
                const level = 3 - i;
                const peel = peelS[i].x;
                const lift = pop[i].x * 0.35 + peel * 2.6 + (rm ? 0 : Math.sin(t * 1.2 + i) * 0.03);
                const z = level * (LH + gap.x) + enter[i].z.x + lift;
                const on = i === active;
                const a = v * (1 - 0.86 * clamp(peel));
                box(R, 0, 0, z, SL, SL, LH, MAT[i], a);
                onPlane(R, z + LH, (c) => {
                    c.globalAlpha = a;
                    const dark = MAT[i] === BLUE_M || MAT[i] === SLATE_M || MAT[i] === NAVY_M;
                    const ink = dark ? "#E7F3F7" : "#0A1421";
                    c.strokeStyle = on ? (dark ? "#E7F3F7" : "#2F78E8") : "rgba(145,190,246,0.35)";
                    c.lineWidth = on ? 0.035 : 0.02;
                    c.strokeRect(-SL / 2 + 0.22, -SL / 2 + 0.22, SL - 0.44, SL - 0.44);
                    c.fillStyle = ink;
                    planeText(c, names[i], -SL / 2 + 0.45, -SL / 2 + 0.62, 0.42, 600);
                    c.globalAlpha = a * (on ? 1 : 0.55);
                    tools[i].forEach((tool, j) => planeText(c, tool, -SL / 2 + 0.45, -SL / 2 + 1.25 + j * 0.5, 0.3, 500));
                });
            }
        },
    };
}

/* centro de la escena: en pantallas anchas se corre a la derecha de la ficha; en angostas sube por encima;
   en un celular acostado va a la derecha de la ficha, que ocupa el 40% izquierdo */
const playCenter = (R: Rend, fy: number): P2 => (R.W > 900 ? [R.W * 0.6, R.H * fy] : R.W > R.H * 1.4 && R.H < 560 ? [R.W * 0.68, R.H * Math.min(fy, 0.6)] : [R.W * 0.5, R.H * (fy - 0.3)]);

/* ---------- EXPERIMENTO 1 · GRAVEDAD: piezas que caen y se apilan ---------- */
interface Brick {
    gx: number;
    gy: number;
    z: number;
    v: number;
    rest: number;
    imp: number;
    m: number;
    r: number;
}
const G_CELLS = 5;
function gravityExp() {
    const bricks: Brick[] = [];
    const params = { g: 34, bounce: 0.32 };
    const heights = () => {
        const hm = new Map<string, number>();
        bricks.forEach((b) => hm.set(`${b.gx},${b.gy}`, (hm.get(`${b.gx},${b.gy}`) ?? 0) + 1));
        return hm;
    };
    const drop = () => {
        if (bricks.length >= 70) bricks.shift();
        const hm = heights();
        const gx = Math.floor(Math.random() * G_CELLS);
        const gy = Math.floor(Math.random() * G_CELLS);
        const n = hm.get(`${gx},${gy}`) ?? 0;
        bricks.push({ gx, gy, z: 9 + n * 0.62, v: 0, rest: n * 0.62, imp: 0, m: Math.floor(Math.random() * 4), r: (Math.random() - 0.5) * 0.6 });
    };
    const reset = () => {
        bricks.length = 0;
        for (let i = 0; i < 8; i++) drop();
    };
    reset();
    return {
        params,
        drop,
        reset,
        step(dt: number) {
            for (const b of bricks) {
                b.v -= params.g * dt;
                b.z += b.v * dt;
                if (b.z < b.rest) {
                    if (b.v < -1.4) {
                        b.imp = Math.min(1, -b.v / 13);
                        b.v = -b.v * params.bounce;
                    } else b.v = 0;
                    b.z = b.rest;
                }
                b.imp *= Math.exp(-dt * 9);
                b.r *= Math.exp(-dt * (b.z > b.rest + 0.01 ? 0.4 : 12));
            }
        },
        draw(R: Rend, light: boolean, yaw: number, my: number) {
            const M = matsFor(light);
            const S = Math.max(16, Math.min(R.W / 9.5, R.H / 8, (R.W > 900 ? R.W * 0.62 : R.W) / 8.5));
            const [cx, cy] = playCenter(R, 0.66);
            R.cam.set(yaw, 36 - my * 4, S, cx, cy);
            const P = G_CELLS * 1.1 + 0.6;
            shadowRect(R, 0.16, 0.16, 0, P, P, S * 0.5, M.sha * 0.7, M.shc);
            box(R, 0, 0, 0, P, P, 0.3, M.plate);
            const pos = (g: number) => (g - (G_CELLS - 1) / 2) * 1.1;
            const cells: P2[] = [];
            for (let i = 0; i < G_CELLS; i++) for (let j = 0; j < G_CELLS; j++) cells.push([pos(i), pos(j)]);
            cells.sort((a, b) => R.cam.p(a[0], a[1], 0)[2] - R.cam.p(b[0], b[1], 0)[2]);
            for (const [x, y] of cells) cyl(R, x, y, 0.3, 0.3, 0.12, M.plate);
            const MATS = [BLUE_M, SKY_M, M.body, M.alt];
            const order = [...bricks].sort((a, b) => R.cam.p(pos(a.gx), pos(a.gy), a.z)[2] - R.cam.p(pos(b.gx), pos(b.gy), b.z)[2]);
            for (const b of order) {
                const x = pos(b.gx);
                const y = pos(b.gy);
                const h = 0.6 * (1 - 0.22 * b.imp);
                const z = 0.3 + b.z;
                if (b.z - b.rest > 0.05) shadowRect(R, x + 0.05, y + 0.05, 0.3 + b.rest, 1, 1, (b.z - b.rest) * S * 0.25, (M.sha * 0.8) / (1 + (b.z - b.rest) * 0.6), M.shc);
                box(R, x, y, z, 1.02, 1.02, h, MATS[b.m], 1, b.r);
                studs(R, x, y, z + h, 1.02, 1.02, 2, 2, b.m === 0 ? WHITE_M : MATS[b.m], 1, b.r);
            }
        },
    };
}

/* ---------- EXPERIMENTO 2 · ESLABONES: el logo extruido en tiempo real ---------- */
function linksExp() {
    const sep = new Spring(0, 90, 9);
    const depth = { value: 0.55 };
    const paths = LOGO_PATHS.map((d) => new Path2D(d));
    /* centro de cada eslabón (en coordenadas del logo) para ordenar el dibujo */
    const CENTERS: P2[] = [
        [0, -1.08],
        [0, 1.08],
    ];
    const DIRS: P2[] = [
        [0.55, -0.55],
        [0.55, 0.55],
    ];
    return {
        sep,
        depth,
        draw(R: Rend, light: boolean, yaw: number, t: number, rm: boolean) {
            const M = matsFor(light);
            const S = Math.max(18, Math.min(R.W / 9, R.H / 9.5, (R.W > 900 ? R.W * 0.62 : R.W) / 8));
            const bob = rm ? 0 : Math.sin(t * 1.3) * 0.12;
            const [cx, cy] = playCenter(R, 0.6);
            R.cam.set(yaw, 42, S, cx, cy);
            shadowRect(R, 0.2, 0.2, 0, 4.6, 6.4, S * 0.7, M.sha * 0.6, M.shc);
            const order = [0, 1].sort((a, b) => {
                const pa = CENTERS[a];
                const pb = CENTERS[b];
                return R.cam.p(pa[0] + DIRS[a][0] * sep.x, pa[1] + DIRS[a][1] * sep.x, 0)[2] - R.cam.p(pb[0] + DIRS[b][0] * sep.x, pb[1] + DIRS[b][1] * sep.x, 0)[2];
            });
            const steps = Math.max(2, Math.round(depth.value * S));
            const base = 0.4 + bob;
            for (const i of order) {
                const ox = DIRS[i][0] * sep.x;
                const oy = DIRS[i][1] * sep.x;
                const z0 = base + (i === 0 ? sep.x * 0.25 : 0);
                const side = i === 0 ? (light ? "#0F1D31" : "#2C5FB8") : light ? "#3A6FC4" : "#7FAEEB";
                const top = i === 0 ? (light ? "#12223A" : "#4B92F4") : light ? "#4B92F4" : "#E7F3F7";
                /* extrusión: la misma forma apilada píxel a píxel y la tapa encima */
                for (let s = 0; s <= steps; s++) {
                    const z = z0 + (depth.value * s) / steps;
                    onPlane(R, z, (c) => {
                        c.translate(ox, oy);
                        c.fillStyle = s === steps ? top : side;
                        c.fill(paths[i], "evenodd");
                        if (s === steps) {
                            c.strokeStyle = "rgba(255,255,255,0.35)";
                            c.lineWidth = 0.02;
                            c.stroke(paths[i]);
                        }
                    });
                }
            }
        },
    };
}

/* ---------- EXPERIMENTO 3 · ESCRIBÍ Y CONSTRUÍ: un ladrillo por letra ---------- */
const W_MAX = 16;
const W_ROW = 8;
function wallExp() {
    const slots = Array.from({ length: W_MAX }, () => ({ ...part(6), ch: "" }));
    return {
        set(text: string) {
            const chars = [...text.toUpperCase()].slice(0, W_MAX);
            slots.forEach((s, i) => {
                const ch = chars[i] ?? "";
                if (ch) s.ch = ch;
                setPart(s, !!ch, 6);
            });
        },
        bodies: slots.flatMap((s) => [s.z, s.v]) as Body[],
        draw(R: Rend, light: boolean, yaw: number, my: number) {
            const M = matsFor(light);
            const S = Math.max(14, Math.min(R.W / 13, R.H / 8.5, (R.W > 900 ? R.W * 0.62 : R.W) / 12));
            const [cx, cy] = playCenter(R, 0.62);
            R.cam.set(yaw, 38 - my * 4, S, cx, cy);
            const PW = W_ROW * 1.25 + 0.6;
            const PD = 2 * 1.25 + 0.6;
            shadowRect(R, 0.16, 0.16, 0, PW, PD, S * 0.5, M.sha * 0.7, M.shc);
            box(R, 0, 0, 0, PW, PD, 0.28, M.plate);
            const MATS = [M.body, SKY_M, BLUE_M, M.alt];
            const items = slots.map((s, i) => {
                const col = i % W_ROW;
                const row = Math.floor(i / W_ROW);
                return { s, i, x: (col - (W_ROW - 1) / 2) * 1.25, y: (row - 0.5) * 1.25 };
            });
            items.sort((a, b) => R.cam.p(a.x, a.y, 0)[2] - R.cam.p(b.x, b.y, 0)[2]);
            for (const { s, i, x, y } of items) {
                const v = clamp(s.v.x);
                if (v < 0.01) continue;
                const z = 0.28 + s.z.x;
                const h = 0.8 * (1 - 0.2 * s.z.imp);
                const m = MATS[i % MATS.length];
                if (s.z.x > 0.05) shadowRect(R, x + 0.05, y + 0.05, 0.28, 1.15, 1.15, s.z.x * S * 0.25, (M.sha * v) / (1 + s.z.x * 0.6), M.shc);
                box(R, x, y, z, 1.15, 1.15, h, m, v);
                onPlane(R, z + h, (c) => {
                    c.globalAlpha = v;
                    c.fillStyle = m === BLUE_M || m === SLATE_M || m === NAVY_M ? "#E7F3F7" : "#0A1421";
                    planeText(c, s.ch, x, y + 0.04, 0.8, 600, "center");
                });
            }
        },
    };
}

/* ---------- selección: qué caja queda bajo el puntero ---------- */
interface HitBox {
    x: number;
    y: number;
    z: number;
    w: number;
    d: number;
    h: number;
}
const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const hullOf = (src: P2[]): P2[] => {
    const p = [...src].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const lo: P2[] = [];
    const hi: P2[] = [];
    for (const q of p) {
        while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
        lo.push(q);
    }
    for (let i = p.length - 1; i >= 0; i--) {
        while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], p[i]) <= 0) hi.pop();
        hi.push(p[i]);
    }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
};
const inPoly = (pts: P2[], x: number, y: number) => {
    let ins = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
};
/* devuelve el índice de la caja más cercana a la cámara que contiene el punto (o -1) */
function pick(R: Rend, boxes: HitBox[], px: number, py: number) {
    let best = -1;
    let bd = -Infinity;
    boxes.forEach((b, i) => {
        const c: P2[] = [];
        for (const [x, y] of rectPts(b.x, b.y, b.w, b.d))
            for (const z of [b.z, b.z + b.h]) {
                const q = R.cam.p(x, y, z);
                c.push([q[0], q[1]]);
            }
        if (!inPoly(hullOf(c), px, py)) return;
        const d = R.cam.p(b.x, b.y, b.z + b.h / 2)[2];
        if (d > bd) {
            bd = d;
            best = i;
        }
    });
    return best;
}
/* una dirección en pantalla (px) pasada al plano del piso */
const screenToWorld = (R: Rend, dx: number, dy: number): P2 => {
    const xr = dx / R.cam.S;
    const yr = dy / (R.cam.S * Math.max(0.2, R.cam.sp));
    return [xr * R.cam.cy + yr * R.cam.sy, -xr * R.cam.sy + yr * R.cam.cy];
};
type Hud = (a: number, b: number, status: string) => void;
const readBest = (k: string) => {
    try {
        return Number(window.localStorage.getItem(`dd_lab_${k}`)) || 0;
    } catch {
        return 0;
    }
};
const saveBest = (k: string, v: number) => {
    try {
        window.localStorage.setItem(`dd_lab_${k}`, String(v));
    } catch {
        /* sin almacenamiento: el récord dura lo que dura la visita */
    }
};

/* ---------- EXPERIMENTO 5 · TORRE: soltá el bloque justo encima del anterior ---------- */
const T_LH = 0.5;
const T_RANGE = 4.2;
interface TLayer {
    x: number;
    y: number;
    w: number;
    d: number;
    m: number;
}
interface TChip extends TLayer {
    z: number;
    v: number;
    vx: number;
    vy: number;
    r: number;
    vr: number;
}
function towerExp() {
    const layers: TLayer[] = [];
    const chips: TChip[] = [];
    let cur: (TLayer & { axis: 0 | 1; dir: number; pos: number }) | null = null;
    let over = false;
    let streak = 0;
    let best = readBest("tower");
    const camZ = new Spring(0, 26, 10);
    const squash = new Spring(0, 260, 12);
    const ring = { age: 9, x: 0, y: 0, w: 0, d: 0, z: 0 };
    let onHud: Hud = () => {};
    const score = () => layers.length - 1;
    const hud = (st: string) => onHud(score(), best, st);
    const spawn = () => {
        const top = layers[layers.length - 1];
        const axis = (layers.length % 2) as 0 | 1;
        cur = { ...top, m: layers.length % 4, axis, dir: 1, pos: -T_RANGE };
    };
    const reset = () => {
        layers.length = 0;
        chips.length = 0;
        layers.push({ x: 0, y: 0, w: 3, d: 3, m: 0 });
        over = false;
        streak = 0;
        spawn();
        hud("towerReady");
    };
    reset();
    const place = () => {
        if (over) return reset();
        if (!cur) return;
        const top = layers[layers.length - 1];
        const ax = cur.axis;
        const size = ax === 0 ? cur.w : cur.d;
        const tc = ax === 0 ? top.x : top.y;
        let delta = cur.pos;
        const z = layers.length * T_LH;
        let perfect = false;
        if (Math.abs(delta) < 0.09) {
            delta = 0;
            perfect = true;
        }
        const ov = size - Math.abs(delta);
        if (ov <= 0.02) {
            chips.push({ ...cur, x: ax === 0 ? top.x + delta : top.x, y: ax === 1 ? top.y + delta : top.y, z, v: 0, vx: ax === 0 ? Math.sign(delta) * 1.2 : 0, vy: ax === 1 ? Math.sign(delta) * 1.2 : 0, r: 0, vr: (Math.random() - 0.5) * 3 });
            cur = null;
            over = true;
            if (score() > best) {
                best = score();
                saveBest("tower", best);
            }
            hud("towerOver");
            return;
        }
        const n: TLayer = { ...top, m: cur.m };
        if (perfect) {
            streak++;
            /* tres exactos seguidos devuelven un poco de superficie */
            const grow = streak >= 3 ? 0.14 : 0;
            if (ax === 0) n.w = Math.min(3, top.w + grow);
            else n.d = Math.min(3, top.d + grow);
            Object.assign(ring, { age: 0, x: n.x, y: n.y, w: n.w, d: n.d, z: z + T_LH });
        } else {
            streak = 0;
            const s = Math.sign(delta);
            const nc = tc + delta / 2;
            const cc = tc + delta / 2 + (s * size) / 2;
            const cut = Math.abs(delta);
            if (ax === 0) {
                n.x = nc;
                n.w = ov;
                chips.push({ ...n, x: cc, w: cut, z, v: 0, vx: s * 1.4, vy: 0, r: 0, vr: s * (1 + Math.random() * 2) });
            } else {
                n.y = nc;
                n.d = ov;
                chips.push({ ...n, y: cc, d: cut, z, v: 0, vx: 0, vy: s * 1.4, r: 0, vr: s * (1 + Math.random() * 2) });
            }
        }
        layers.push(n);
        squash.v = -4;
        if (score() > best) {
            best = score();
            saveBest("tower", best);
        }
        spawn();
        hud(perfect && streak > 1 ? "towerPerfect" : "towerPlay");
    };
    return {
        place,
        reset,
        set onHud(f: Hud) {
            onHud = f;
        },
        sync: () => hud(over ? "towerOver" : score() ? "towerPlay" : "towerReady"),
        get streak() {
            return streak;
        },
        step(dt: number) {
            camZ.t = layers.length * T_LH;
            camZ.step(dt);
            squash.step(dt);
            ring.age += dt;
            if (cur) {
                const sp = 2.4 + Math.min(score(), 30) * 0.11;
                cur.pos += cur.dir * sp * dt;
                if (cur.pos > T_RANGE) {
                    cur.pos = T_RANGE;
                    cur.dir = -1;
                } else if (cur.pos < -T_RANGE) {
                    cur.pos = -T_RANGE;
                    cur.dir = 1;
                }
            }
            for (let i = chips.length - 1; i >= 0; i--) {
                const c = chips[i];
                c.v -= 30 * dt;
                c.z += c.v * dt;
                c.x += c.vx * dt;
                c.y += c.vy * dt;
                c.r += c.vr * dt;
                if (c.z < camZ.x - 16) chips.splice(i, 1);
            }
        },
        snap() {
            camZ.t = layers.length * T_LH;
            camZ.snap();
        },
        draw(R: Rend, light: boolean, yaw: number, my: number) {
            const M = matsFor(light);
            const S = Math.max(16, Math.min(R.W / 12, R.H / 13, (R.W > 900 ? R.W * 0.62 : R.W) / 11));
            const [cx, cy] = playCenter(R, R.W > 900 ? 0.6 : 0.6);
            R.cam.set(yaw, 34 - my * 4, S, cx, cy);
            R.cam.oy += camZ.x * S * R.cam.cp;
            const MATS = [BLUE_M, SKY_M, M.body, M.alt];
            const zTop = layers.length * T_LH;
            /* los pisos de abajo se funden con el fondo: la torre nunca baja por detrás de la ficha */
            const bg = light ? hex("#F4F9FB") : PAL.navy;
            const fade = (m: Mat, z: number) => {
                const k = smooth(clamp((zTop - z - 2.2) / 2.6));
                return k < 0.001 ? m : mkMat(mix(m.top, bg, k), mix(m.side, bg, k), mix(m.dark, bg, k), mix(m.hi, bg, k));
            };
            /* pedestal */
            if (zTop < 5.5) {
                shadowRect(R, 0.2, 0.2, -2.6, 3.4, 3.4, S * 0.6, M.sha * 0.7 * (1 - smooth(clamp((zTop - 1) / 4))), M.shc);
                box(R, 0, 0, -2.6, 3, 3, 2.6, fade(M.plate, 0));
            }
            const top = layers[layers.length - 1];
            const chipBehind = (c: TChip) => R.cam.p(c.x, c.y, c.z)[2] < R.cam.p(top.x, top.y, c.z)[2];
            for (const c of chips) if (chipBehind(c)) box(R, c.x, c.y, c.z, c.w, c.d, T_LH, MATS[c.m], 1, c.r);
            const from = Math.max(0, Math.floor((zTop - 5) / T_LH));
            for (let i = from; i < layers.length; i++) {
                const l = layers[i];
                const last = i === layers.length - 1;
                const h = last ? T_LH * (1 + 0.16 * clamp(squash.x, -1, 1)) : T_LH;
                box(R, l.x, l.y, i * T_LH, l.w, l.d, h, fade(MATS[l.m], i * T_LH));
                if (last && !cur) studs(R, l.x, l.y, i * T_LH + h, l.w, l.d, Math.max(1, Math.round(l.w / 0.75)), Math.max(1, Math.round(l.d / 0.75)), l.m === 0 ? WHITE_M : MATS[l.m]);
            }
            if (cur) {
                const x = cur.axis === 0 ? top.x + cur.pos : top.x;
                const y = cur.axis === 1 ? top.y + cur.pos : top.y;
                /* guía: dónde caería sobre la cara superior */
                onPlane(R, zTop, (c) => {
                    c.fillStyle = light ? "rgba(10,20,33,0.08)" : "rgba(231,243,247,0.08)";
                    c.fillRect(x - cur!.w / 2, y - cur!.d / 2, cur!.w, cur!.d);
                });
                box(R, x, y, zTop, cur.w, cur.d, T_LH, MATS[cur.m]);
            }
            if (ring.age < 0.7) {
                const k = ring.age / 0.7;
                onPlane(R, ring.z, (c) => {
                    c.strokeStyle = `rgba(75,146,244,${(1 - k).toFixed(3)})`;
                    c.lineWidth = 0.05;
                    const g = 0.1 + k * 0.9;
                    c.strokeRect(ring.x - ring.w / 2 - g, ring.y - ring.d / 2 - g, ring.w + g * 2, ring.d + g * 2);
                });
            }
            for (const c of chips) if (!chipBehind(c)) box(R, c.x, c.y, c.z, c.w, c.d, T_LH, MATS[c.m], 1, c.r);
        },
    };
}

/* ---------- EXPERIMENTO 6 · ONDAS: un campo de columnas que se comporta como agua ---------- */
const RN = 13;
function rippleExp() {
    const u = new Float32Array(RN * RN);
    const v = new Float32Array(RN * RN);
    const a = new Float32Array(RN * RN);
    const params = { c: 36, damp: 1.2, rain: true };
    let rainT = 0.4;
    const pos = (g: number) => (g - (RN - 1) / 2) * 1.02;
    const hit = (i: number, f = 1.5) => {
        const gx = i % RN;
        const gy = Math.floor(i / RN);
        v[i] += f * 9;
        for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            const x = gx + dx;
            const y = gy + dy;
            if (x >= 0 && y >= 0 && x < RN && y < RN) v[y * RN + x] += f * 4;
        }
    };
    const calm = () => {
        u.fill(0);
        v.fill(0);
    };
    const hits = (): HitBox[] => {
        const out: HitBox[] = [];
        for (let j = 0; j < RN; j++) for (let i = 0; i < RN; i++) out.push({ x: pos(i), y: pos(j), z: 0, w: 0.94, d: 0.94, h: Math.max(0.06, 0.55 + u[j * RN + i] * 0.55) });
        return out;
    };
    return {
        params,
        hit,
        calm,
        hits,
        step(dt: number) {
            const at = (x: number, y: number, own: number) => (x < 0 || y < 0 || x >= RN || y >= RN ? own : u[y * RN + x]);
            for (let y = 0; y < RN; y++)
                for (let x = 0; x < RN; x++) {
                    const i = y * RN + x;
                    const lap = at(x + 1, y, u[i]) + at(x - 1, y, u[i]) + at(x, y + 1, u[i]) + at(x, y - 1, u[i]) - 4 * u[i];
                    a[i] = params.c * lap - params.damp * v[i] - 1.5 * u[i];
                }
            for (let i = 0; i < u.length; i++) {
                v[i] += a[i] * dt;
                u[i] += v[i] * dt;
            }
            if (params.rain) {
                rainT -= dt;
                if (rainT < 0) {
                    hit(Math.floor(Math.random() * u.length), 0.7 + Math.random() * 0.6);
                    rainT = 0.7 + Math.random() * 1.3;
                }
            }
        },
        draw(R: Rend, light: boolean, yaw: number, my: number) {
            const M = matsFor(light);
            const S = Math.max(12, Math.min(R.W / 22, R.H / 17, (R.W > 900 ? R.W * 0.56 : R.W) / 20));
            const [cx, cy] = playCenter(R, 0.62);
            R.cam.set(yaw, 36 - my * 4, S, cx, cy);
            const P = RN * 1.02 + 0.5;
            shadowRect(R, 0.2, 0.2, -0.3, P, P, S * 0.7, M.sha * 0.7, M.shc);
            box(R, 0, 0, -0.3, P, P, 0.3, M.plate);
            const cells: { x: number; y: number; i: number }[] = [];
            for (let j = 0; j < RN; j++) for (let i = 0; i < RN; i++) cells.push({ x: pos(i), y: pos(j), i: j * RN + i });
            cells.sort((p, q) => R.cam.p(p.x, p.y, 0)[2] - R.cam.p(q.x, q.y, 0)[2]);
            for (const c of cells) {
                const val = u[c.i];
                const h = clamp(0.55 + val * 0.55, 0.06, 3);
                /* agua quieta en un solo tono; la cresta pasa a celeste, azul y, en lo más alto, al color de las piezas */
                const m = val > 0.75 ? M.body : val > 0.34 ? BLUE_M : val > 0.12 ? SKY_M : M.alt;
                box(R, c.x, c.y, 0, 0.94, 0.94, h, m);
            }
        },
    };
}

/* ---------- EXPERIMENTO 7 · LABERINTO: inclinar la placa y llevar la bola a la salida ---------- */
const MZ = 6;
const MG = MZ * 2 + 1;
const BALL = 0.3;
function mazeExp() {
    const walls = new Uint8Array(MG * MG);
    const ball = { x: 0, y: 0, vx: 0, vy: 0 };
    const goal: P2 = [0, 0];
    const tilt = { x: new Spring(0, 60, 14), y: new Spring(0, 60, 14) };
    let level = 1;
    let time = 0;
    let won = 0;
    let lastHud = -1;
    let onHud: Hud = () => {};
    const pos = (g: number) => g - (MG - 1) / 2;
    const cell = (w: number) => Math.round(w + (MG - 1) / 2);
    const gen = () => {
        walls.fill(1);
        const seen = new Uint8Array(MZ * MZ);
        const stack: P2[] = [[0, 0]];
        seen[0] = 1;
        walls[MG + 1] = 0;
        while (stack.length) {
            const [cx, cy] = stack[stack.length - 1];
            const nb = (
                [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ] as P2[]
            ).filter(([dx, dy]) => {
                const x = cx + dx;
                const y = cy + dy;
                return x >= 0 && y >= 0 && x < MZ && y < MZ && !seen[y * MZ + x];
            });
            if (!nb.length) {
                stack.pop();
                continue;
            }
            const [dx, dy] = nb[Math.floor(Math.random() * nb.length)];
            const nx = cx + dx;
            const ny = cy + dy;
            seen[ny * MZ + nx] = 1;
            walls[(cy * 2 + 1 + dy) * MG + (cx * 2 + 1 + dx)] = 0;
            walls[(ny * 2 + 1) * MG + (nx * 2 + 1)] = 0;
            stack.push([nx, ny]);
        }
        ball.x = pos(1);
        ball.y = pos(1);
        ball.vx = ball.vy = 0;
        goal[0] = pos(MG - 2);
        goal[1] = pos(MG - 2);
        time = 0;
        won = 0;
        lastHud = -1;
    };
    gen();
    const hud = () => onHud(level, Math.round(time * 10) / 10, won ? "mazeWin" : "mazePlay");
    const isWall = (gx: number, gy: number) => gx < 0 || gy < 0 || gx >= MG || gy >= MG || walls[gy * MG + gx] === 1;
    const collide = () => {
        const gx = cell(ball.x);
        const gy = cell(ball.y);
        for (let y = gy - 1; y <= gy + 1; y++)
            for (let x = gx - 1; x <= gx + 1; x++) {
                if (!isWall(x, y)) continue;
                const wx = pos(x);
                const wy = pos(y);
                const qx = clamp(ball.x, wx - 0.5, wx + 0.5);
                const qy = clamp(ball.y, wy - 0.5, wy + 0.5);
                const dx = ball.x - qx;
                const dy = ball.y - qy;
                const d = Math.hypot(dx, dy);
                if (d < BALL && d > 1e-6) {
                    const nx = dx / d;
                    const ny = dy / d;
                    ball.x += nx * (BALL - d);
                    ball.y += ny * (BALL - d);
                    const vn = ball.vx * nx + ball.vy * ny;
                    if (vn < 0) {
                        ball.vx -= 1.4 * vn * nx;
                        ball.vy -= 1.4 * vn * ny;
                    }
                }
            }
    };
    return {
        tilt,
        set onHud(f: Hud) {
            onHud = f;
        },
        sync: hud,
        next() {
            level++;
            gen();
            hud();
        },
        step(dt: number) {
            tilt.x.step(dt);
            tilt.y.step(dt);
            if (won) {
                won += dt;
                if (won > 1.4) {
                    level++;
                    gen();
                    hud();
                }
                return;
            }
            time += dt;
            ball.vx += tilt.x.x * 16 * dt;
            ball.vy += tilt.y.x * 16 * dt;
            const f = Math.exp(-dt * 1.1);
            ball.vx *= f;
            ball.vy *= f;
            const sp = Math.hypot(ball.vx, ball.vy);
            if (sp > 7) {
                ball.vx *= 7 / sp;
                ball.vy *= 7 / sp;
            }
            ball.x += ball.vx * dt;
            ball.y += ball.vy * dt;
            collide();
            if (Math.hypot(ball.x - goal[0], ball.y - goal[1]) < 0.35) {
                won = 0.001;
                hud();
            }
            const tenth = Math.floor(time * 10);
            if (tenth !== lastHud) {
                lastHud = tenth;
                hud();
            }
        },
        draw(R: Rend, light: boolean, yaw: number, t: number) {
            const M = matsFor(light);
            const S = Math.max(11, Math.min(R.H / 18, (R.W > 900 ? R.W * 0.54 : R.W * 0.94) / 19));
            const [cx, cy] = playCenter(R, 0.62);
            /* la cámara acompaña la inclinación unos grados */
            R.cam.set(yaw + tilt.x.x * 3 - tilt.y.x * 3, 42 + (tilt.x.x + tilt.y.x) * 2.5, S, cx, cy);
            const P = MG + 0.4;
            shadowRect(R, 0.2, 0.2, -0.35, P, P, S * 0.7, M.sha * 0.7, M.shc);
            box(R, 0, 0, -0.35, P, P, 0.35, M.plate);
            /* salida: placa azul que late */
            const pulse = 0.5 + 0.5 * Math.sin(t * 4);
            onPlane(R, 0.002, (c) => {
                c.fillStyle = `rgba(75,146,244,${(0.55 + pulse * 0.35).toFixed(3)})`;
                c.fillRect(goal[0] - 0.42, goal[1] - 0.42, 0.84, 0.84);
                c.strokeStyle = "rgba(145,190,246,0.9)";
                c.lineWidth = 0.03;
                const g = 0.42 + pulse * 0.12;
                c.strokeRect(goal[0] - g, goal[1] - g, g * 2, g * 2);
            });
            const items: { d: number; f: () => void }[] = [];
            for (let y = 0; y < MG; y++)
                for (let x = 0; x < MG; x++) {
                    if (!walls[y * MG + x]) continue;
                    const wx = pos(x);
                    const wy = pos(y);
                    const edge = x === 0 || y === 0 || x === MG - 1 || y === MG - 1;
                    items.push({ d: R.cam.p(wx, wy, 0.3)[2], f: () => box(R, wx, wy, 0, 1.002, 1.002, edge ? 0.75 : 0.6, edge ? M.body : M.alt) });
                }
            const lift = won ? Math.sin(Math.min(1, won / 0.5) * Math.PI) * 0.8 : 0;
            items.push({
                d: R.cam.p(ball.x, ball.y, BALL)[2],
                f: () => {
                    shadowRect(R, ball.x + 0.04, ball.y + 0.04, 0, BALL * 1.5, BALL * 1.5, S * 0.12 * (1 + lift * 2), M.sha * 1.2, M.shc);
                    const [sx, sy] = R.cam.p(ball.x, ball.y, BALL + lift);
                    const r = BALL * S;
                    const g = R.ctx.createRadialGradient(sx - r * 0.35, sy - r * 0.4, r * 0.1, sx, sy, r);
                    g.addColorStop(0, "#FFFFFF");
                    g.addColorStop(0.45, "#91BEF6");
                    g.addColorStop(1, "#17408C");
                    R.ctx.beginPath();
                    R.ctx.arc(sx, sy, r, 0, TAU);
                    R.ctx.fillStyle = g;
                    R.ctx.fill();
                },
            });
            items.sort((p, q) => p.d - q.d).forEach((it) => it.f());
        },
    };
}

/* ---------- EXPERIMENTO 8 · SECUENCIA: memoria con cuatro bloques ---------- */
type AudioWin = Window & { webkitAudioContext?: typeof AudioContext };
type AudioNav = Navigator & { audioSession?: { type: string } };
const TONES = [329.63, 392, 523.25, 659.25];
const SIMON_POS: P2[] = [
    [-1.05, -1.05],
    [1.05, -1.05],
    [-1.05, 1.05],
    [1.05, 1.05],
];
function simonExp() {
    const lift = SIMON_POS.map(() => new Spring(0, 240, 13));
    const lit = [0, 0, 0, 0];
    const seq: number[] = [];
    let idx = 0;
    let state: "simonIdle" | "simonWatch" | "simonTurn" | "simonFail" | "wait" = "simonIdle";
    let timer = 0;
    let showI = 0;
    let on = false;
    let shake = 0;
    let best = readBest("simon");
    let onHud: Hud = () => {};
    const opts = { sound: true };
    let ac: AudioContext | null = null;
    const level = () => (state === "simonTurn" || state === "simonWatch" ? seq.length : Math.max(0, seq.length - (state === "simonFail" ? 1 : 0)));
    const hud = () => onHud(level(), best, state === "wait" ? "simonTurn" : state);
    /* en mobile el audio solo arranca dentro de un toque: se crea y se despierta acá, nunca desde el loop */
    const unlock = () => {
        try {
            if (!ac) {
                const Ctx = window.AudioContext ?? (window as AudioWin).webkitAudioContext;
                if (!Ctx) return;
                /* iOS: que suene aunque el interruptor de silencio esté activado */
                const session = (navigator as AudioNav).audioSession;
                if (session) session.type = "playback";
                ac = new Ctx();
            }
            if (ac.state !== "running") void ac.resume();
            /* iOS viejo: un buffer mudo dentro del gesto termina de habilitar la salida */
            const src = ac.createBufferSource();
            src.buffer = ac.createBuffer(1, 1, 22050);
            src.connect(ac.destination);
            src.start(0);
        } catch {
            /* sin audio: el juego sigue igual */
        }
    };
    const tone = (i: number, fail = false) => {
        if (!opts.sound || !ac) return;
        try {
            if (ac.state !== "running") void ac.resume();
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = fail ? "sawtooth" : "triangle";
            o.frequency.value = fail ? 110 : TONES[i];
            const n = ac.currentTime;
            g.gain.setValueAtTime(0, n);
            g.gain.linearRampToValueAtTime(fail ? 0.1 : 0.16, n + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, n + (fail ? 0.6 : 0.4));
            o.connect(g).connect(ac.destination);
            o.start(n);
            o.stop(n + 0.65);
        } catch {
            /* sin audio: el juego sigue igual */
        }
    };
    const flash = (i: number) => {
        lit[i] = 1;
        lift[i].v -= 5;
        tone(i);
    };
    const start = () => {
        unlock();
        seq.length = 0;
        seq.push(Math.floor(Math.random() * 4));
        state = "simonWatch";
        showI = 0;
        on = false;
        timer = 0.6;
        hud();
    };
    const press = (i: number) => {
        unlock();
        if (state === "simonIdle" || state === "simonFail") return start();
        if (state !== "simonTurn") return;
        flash(i);
        if (seq[idx] === i) {
            idx++;
            if (idx === seq.length) {
                if (seq.length > best) {
                    best = seq.length;
                    saveBest("simon", best);
                }
                state = "wait";
                timer = 0.8;
                hud();
            }
        } else {
            state = "simonFail";
            shake = 1;
            tone(0, true);
            hud();
        }
    };
    return {
        opts,
        unlock,
        press,
        start,
        set onHud(f: Hud) {
            onHud = f;
        },
        sync: hud,
        hits: (): HitBox[] => SIMON_POS.map(([x, y], i) => ({ x, y, z: 0, w: 1.9, d: 1.9, h: 0.7 + Math.max(0, lift[i].x) })),
        step(dt: number) {
            lift.forEach((s) => s.step(dt));
            for (let i = 0; i < 4; i++) lit[i] *= Math.exp(-dt * 4.5);
            shake *= Math.exp(-dt * 5);
            if (state === "simonIdle" || state === "simonTurn") return;
            timer -= dt;
            if (timer > 0) return;
            const dur = Math.max(0.28, 0.55 - seq.length * 0.02);
            if (state === "simonWatch") {
                if (!on && showI < seq.length) {
                    flash(seq[showI]);
                    on = true;
                    timer = dur;
                } else if (on) {
                    on = false;
                    showI++;
                    timer = 0.16;
                } else {
                    state = "simonTurn";
                    idx = 0;
                    hud();
                }
            } else if (state === "wait") {
                seq.push(Math.floor(Math.random() * 4));
                state = "simonWatch";
                showI = 0;
                on = false;
                timer = 0.35;
                hud();
            }
        },
        draw(R: Rend, light: boolean, yaw: number, my: number, t: number) {
            const M = matsFor(light);
            const S = Math.max(16, Math.min(R.W / 10, R.H / 9, (R.W > 900 ? R.W * 0.62 : R.W) / 8.5));
            const [cx, cy] = playCenter(R, 0.62);
            R.cam.set(yaw + Math.sin(t * 60) * shake * 2.5, 40 - my * 4, S, cx, cy);
            shadowRect(R, 0.2, 0.2, -0.4, 4.7, 4.7, S * 0.6, M.sha * 0.7, M.shc);
            box(R, 0, 0, -0.4, 4.5, 4.5, 0.4, M.plate);
            const MATS = [BLUE_M, SKY_M, M.body, M.alt];
            const order = [0, 1, 2, 3].sort((a, b) => R.cam.p(SIMON_POS[a][0], SIMON_POS[a][1], 0)[2] - R.cam.p(SIMON_POS[b][0], SIMON_POS[b][1], 0)[2]);
            const waiting = state === "simonTurn";
            for (const i of order) {
                const [x, y] = SIMON_POS[i];
                const base = MATS[i];
                const k = lit[i];
                const m = mkMat(mix(base.top, PAL.pure, k * 0.85), mix(base.side, PAL.sky, k * 0.6), base.dark, base.hi);
                const h = 0.7 + Math.max(-0.25, lift[i].x) + (waiting ? Math.sin(t * 3 + i) * 0.03 : 0);
                box(R, x, y, 0, 1.9, 1.9, h, m);
                onPlane(R, h, (c) => {
                    const dark = base === BLUE_M || base === SLATE_M || base === NAVY_M;
                    c.fillStyle = k > 0.5 ? "#0A1421" : dark ? "rgba(231,243,247,0.9)" : "rgba(10,20,33,0.75)";
                    planeText(c, String(i + 1), x, y, 0.62, 600, "center");
                });
            }
        },
    };
}

/* trazado del logo (dos eslabones) */
const LOGO_PATHS: string[] = [
    "M0.37 -2.86L0.49 -2.97L0.62 -3.05L0.77 -3.11L0.92 -3.15L1.08 -3.16L1.24 -3.15L1.39 -3.11L1.53 -3.05L1.67 -2.97L1.79 -2.86L1.89 -2.75L1.97 -2.61L2.03 -2.47L2.07 -2.31L2.08 -2.16L2.07 -2.00L2.03 -1.85L1.97 -1.70L1.89 -1.57L1.79 -1.45L-0.37 0.71L-0.49 0.81L-0.62 0.89L-0.77 0.95L-0.92 0.99L-1.08 1.00L-1.24 0.99L-1.39 0.95L-1.53 0.89L-1.67 0.81L-1.79 0.71L-1.89 0.59L-1.97 0.45L-2.03 0.31L-2.07 0.16L-2.08 0.00L-2.07 -0.16L-2.03 -0.31L-1.97 -0.45L-1.89 -0.59L-1.79 -0.71ZM-0.65 -0.43L-0.56 -0.32L-0.50 -0.20L-0.47 -0.07L-0.47 0.07L-0.50 0.20L-0.56 0.32L-0.65 0.43L-0.75 0.52L-0.88 0.57L-1.01 0.60L-1.15 0.60L-1.28 0.57L-1.40 0.52L-1.51 0.43L-1.59 0.32L-1.65 0.20L-1.68 0.07L-1.68 -0.07L-1.65 -0.20L-1.59 -0.32L-1.51 -0.43L-1.40 -0.52L-1.28 -0.57L-1.15 -0.60L-1.01 -0.60L-0.88 -0.57L-0.75 -0.52ZM1.51 -2.59L1.59 -2.48L1.65 -2.36L1.68 -2.23L1.68 -2.09L1.65 -1.96L1.59 -1.83L1.51 -1.73L1.40 -1.64L1.28 -1.58L1.15 -1.55L1.01 -1.55L0.88 -1.58L0.75 -1.64L0.65 -1.73L0.56 -1.83L0.50 -1.96L0.47 -2.09L0.47 -2.23L0.50 -2.36L0.56 -2.48L0.65 -2.59L0.75 -2.67L0.88 -2.73L1.01 -2.76L1.15 -2.76L1.28 -2.73L1.40 -2.67ZM0.93 -1.17L0.81 -1.19L0.69 -1.24L0.57 -1.29L0.47 -1.37L0.37 -1.45L0.29 -1.55L0.22 -1.65L0.16 -1.77L0.12 -1.89L0.09 -2.01L-0.93 -0.99L-0.81 -0.96L-0.69 -0.92L-0.57 -0.86L-0.47 -0.79L-0.37 -0.71L-0.29 -0.61L-0.22 -0.50L-0.16 -0.39L-0.12 -0.27L-0.09 -0.14Z",
    "M1.79 1.45L1.89 1.57L1.97 1.70L2.03 1.85L2.07 2.00L2.08 2.16L2.07 2.31L2.03 2.47L1.97 2.61L1.89 2.75L1.79 2.86L1.67 2.97L1.53 3.05L1.39 3.11L1.24 3.15L1.08 3.16L0.92 3.15L0.77 3.11L0.62 3.05L0.49 2.97L0.37 2.86L-1.79 0.71L-1.89 0.59L-1.97 0.45L-2.03 0.31L-2.07 0.16L-2.08 0.00L-2.07 -0.16L-2.03 -0.31L-1.97 -0.45L-1.89 -0.59L-1.79 -0.71L-1.67 -0.81L-1.53 -0.89L-1.39 -0.95L-1.24 -0.99L-1.08 -1.00L-0.92 -0.99L-0.77 -0.95L-0.62 -0.89L-0.49 -0.81L-0.37 -0.71ZM-0.65 0.43L-0.75 0.52L-0.88 0.57L-1.01 0.60L-1.15 0.60L-1.28 0.57L-1.40 0.52L-1.51 0.43L-1.59 0.32L-1.65 0.20L-1.68 0.07L-1.68 -0.07L-1.65 -0.20L-1.59 -0.32L-1.51 -0.43L-1.40 -0.52L-1.28 -0.57L-1.15 -0.60L-1.01 -0.60L-0.88 -0.57L-0.75 -0.52L-0.65 -0.43L-0.56 -0.32L-0.50 -0.20L-0.47 -0.07L-0.47 0.07L-0.50 0.20L-0.56 0.32ZM1.51 2.59L1.40 2.67L1.28 2.73L1.15 2.76L1.01 2.76L0.88 2.73L0.75 2.67L0.65 2.59L0.56 2.48L0.50 2.36L0.47 2.23L0.47 2.09L0.50 1.96L0.56 1.83L0.65 1.73L0.75 1.64L0.88 1.58L1.01 1.55L1.15 1.55L1.28 1.58L1.40 1.64L1.51 1.73L1.59 1.83L1.65 1.96L1.68 2.09L1.68 2.23L1.65 2.36L1.59 2.48ZM0.09 2.01L0.12 1.89L0.16 1.77L0.22 1.65L0.29 1.55L0.37 1.45L0.47 1.37L0.57 1.29L0.69 1.24L0.81 1.19L0.93 1.17L-0.09 0.14L-0.12 0.27L-0.16 0.39L-0.22 0.50L-0.29 0.61L-0.37 0.71L-0.47 0.79L-0.57 0.86L-0.69 0.92L-0.81 0.96L-0.93 0.99Z",
];

/* =====================================================================
   COMPONENTE
   ===================================================================== */
const Lab = () => {
    const { theme } = UseTheme();
    const { texts, language } = UseLanguage();
    const c = landingOf(texts, language).lab;
    const isDark = theme === "dark";
    const themeRef = useRef(isDark);
    themeRef.current = isDark;
    const textRef = useRef(c);
    textRef.current = c;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const heroRef = useRef<HTMLElement>(null);
    const heroCv = useRef<HTMLCanvasElement>(null);
    const stackRef = useRef<HTMLElement>(null);
    const stackCv = useRef<HTMLCanvasElement>(null);

    /* experimento abierto (null = ninguno) */
    const [open, setOpen] = useState<number | null>(null);
    const [closing, setClosing] = useState(false);
    const [gravity, setGravity] = useState(34);
    const [bounce, setBounce] = useState(0.32);
    const [depth, setDepth] = useState(0.55);
    const [split, setSplit] = useState(false);
    const [word, setWord] = useState("DeepDev");
    const [wave, setWave] = useState(36);
    const [calmness, setCalmness] = useState(1.2);
    const [rain, setRain] = useState(true);
    const [sound, setSound] = useState(true);
    /* marcador de los juegos: dos números y un estado */
    const [hud, setHud] = useState({ a: 0, b: 0, status: "" });
    const playCv = useRef<HTMLCanvasElement>(null);
    const closeBtn = useRef<HTMLButtonElement>(null);
    const lastFocus = useRef<HTMLElement | null>(null);
    const expRef = useRef<{
        g: ReturnType<typeof gravityExp>;
        l: ReturnType<typeof linksExp>;
        w: ReturnType<typeof wallExp>;
        t: ReturnType<typeof towerExp>;
        r: ReturnType<typeof rippleExp>;
        m: ReturnType<typeof mazeExp>;
        s: ReturnType<typeof simonExp>;
    } | null>(null);
    if (!expRef.current) expRef.current = { g: gravityExp(), l: linksExp(), w: wallExp(), t: towerExp(), r: rippleExp(), m: mazeExp(), s: simonExp() };

    const openExp = (i: number) => {
        lastFocus.current = document.activeElement as HTMLElement;
        setClosing(false);
        setOpen(i);
    };
    const closeExp = () => {
        setClosing(true);
        window.setTimeout(() => {
            setOpen(null);
            setClosing(false);
            lastFocus.current?.focus();
        }, 520);
    };

    /* parámetros de los experimentos → motor */
    useEffect(() => {
        const e = expRef.current;
        if (!e) return;
        e.g.params.g = gravity;
        e.g.params.bounce = bounce;
        e.l.depth.value = depth;
        e.l.sep.t = split ? 1 : 0;
        e.w.set(word);
        e.r.params.c = wave;
        e.r.params.damp = calmness;
        e.r.params.rain = rain;
        e.s.opts.sound = sound;
    }, [gravity, bounce, depth, split, word, wave, calmness, rain, sound]);

    /* ---------- página: portada y stack ---------- */
    useEffect(() => {
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        const wave = waveScene();
        const stack = stackScene();
        const mk = (cv: HTMLCanvasElement | null): Rend | null => {
            const ctx = cv?.getContext("2d");
            return ctx ? { ctx, cam: new Cam(), dpr: 1, W: 1, H: 1 } : null;
        };
        const RH = mk(heroCv.current);
        const RS = mk(stackCv.current);
        const pairs: [HTMLCanvasElement | null, Rend | null][] = [
            [heroCv.current, RH],
            [stackCv.current, RS],
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
        const vis = { hero: false, stack: false };
        const io = new IntersectionObserver(
            (es) =>
                es.forEach((e) => {
                    if (e.target === heroRef.current) vis.hero = e.isIntersecting;
                    if (e.target === stackRef.current) vis.stack = e.isIntersecting;
                }),
            { rootMargin: "10% 0px" }
        );
        if (heroRef.current) io.observe(heroRef.current);
        if (stackRef.current) io.observe(stackRef.current);
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
        const pokeS = () => stack.poke();
        stackCv.current?.addEventListener("click", pokeS);
        const rel = (cv: HTMLCanvasElement, el: Element | null) => {
            if (!el) return null;
            const a = cv.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return { top: r.top - a.top, bottom: r.bottom - a.top, left: r.left - a.left, right: r.right - a.left };
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
            const tx = textRef.current;
            mx.t = hasPointer ? px : Math.sin(t * 0.4) * 0.35;
            my.t = hasPointer ? py : Math.cos(t * 0.3) * 0.2;
            let scroll = 0;
            const hs = heroRef.current;
            if (hs) {
                const r = hs.getBoundingClientRect();
                scroll = clamp(-r.top / Math.max(1, r.height));
                wave.targets(r.bottom > 0);
            }
            const ss = stackRef.current;
            let sp = 0;
            let k = 0;
            if (ss) {
                const r = ss.getBoundingClientRect();
                sp = clamp(-r.top / Math.max(1, r.height - vh));
                k = Math.min(3, Math.floor(sp * 4));
                ss.querySelectorAll<HTMLElement>(".lab-stack__layer").forEach((el) => {
                    const on = Number(el.dataset.i) === k;
                    if (el.classList.contains("is-active") !== on) el.classList.toggle("is-active", on);
                });
                ss.querySelectorAll<HTMLElement>(".lab-stack__timeline li").forEach((el, i) => {
                    if (el.classList.contains("is-on") !== i <= k) el.classList.toggle("is-on", i <= k);
                    const b = el.querySelector<HTMLElement>("b");
                    if (b) b.style.transform = `scaleX(${clamp(sp * 4 - i).toFixed(3)})`;
                });
                const ix = ss.querySelector(".lab-stack__index b");
                if (ix && ix.textContent !== pad(k + 1)) ix.textContent = pad(k + 1);
                stack.targets(r.top < vh && r.bottom > 0, sp, k);
            }
            if (rm) [mx, my, ...wave.bodies, ...stack.bodies].forEach((b) => b.snap());
            else {
                acc += dt;
                while (acc > STEP) {
                    mx.step(STEP);
                    my.step(STEP);
                    wave.bodies.forEach((b) => b.step(STEP));
                    if (vis.stack) stack.bodies.forEach((b) => b.step(STEP));
                    acc -= STEP;
                }
            }
            if (RH && vis.hero && heroCv.current && hs) {
                RH.ctx.setTransform(RH.dpr, 0, 0, RH.dpr, 0, 0);
                RH.ctx.clearRect(0, 0, RH.W, RH.H);
                const tt = rel(heroCv.current, hs.querySelector(".lab-hero__title"));
                const ft = rel(heroCv.current, hs.querySelector(".lab-hero__foot"));
                const top = tt ? tt.bottom + 8 : 0;
                const bottom = ft ? ft.top - 8 : RH.H;
                wave.draw(RH, { x: 0, y: top, w: RH.W, h: Math.max(120, bottom - top) }, t, light, rm, mx.x, my.x, scroll);
            }
            if (RS && vis.stack && stackCv.current && ss) {
                RS.ctx.setTransform(RS.dpr, 0, 0, RS.dpr, 0, 0);
                RS.ctx.clearRect(0, 0, RS.W, RS.H);
                const tt = rel(stackCv.current, ss.querySelector(".lab-stack__title"));
                const st = rel(stackCv.current, ss.querySelector(".lab-stack__layer.is-active"));
                const tl = rel(stackCv.current, ss.querySelector(".lab-stack__timeline"));
                const top = tt ? tt.bottom + 6 : 0;
                let bottom = tl ? tl.top - 14 : RS.H;
                let limit = Infinity;
                if (st && st.right < RS.W / 2) limit = RS.W / 2 - st.right - 24;
                else if (st) bottom = Math.min(bottom, st.top - 10);
                stack.draw(
                    RS,
                    { x: 0, y: top, w: RS.W, h: Math.max(120, bottom - top) },
                    Math.max(80, limit),
                    t,
                    light,
                    rm,
                    mx.x,
                    my.x,
                    tx.stack.layers.map((l) => l.tools),
                    tx.stack.layers.map((l) => l.name)
                );
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener("pointermove", onMove);
            stackCv.current?.removeEventListener("click", pokeS);
        };
    }, []);

    /* ---------- experimento abierto: su propio loop, solo mientras está abierto ---------- */
    useEffect(() => {
        if (open === null) return;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeExp();
        };
        window.addEventListener("keydown", onKey);
        const game = open >= 4;
        window.setTimeout(() => (game ? playCv.current : closeBtn.current)?.focus(), 60);
        const cv = playCv.current;
        const ctx = cv?.getContext("2d");
        const e = expRef.current;
        if (!cv || !ctx || !e || open === 3) {
            return () => {
                document.body.style.overflow = "";
                window.removeEventListener("keydown", onKey);
            };
        }
        /* los juegos avisan su marcador al panel */
        const games = { 4: e.t, 6: e.m, 7: e.s } as const;
        const g = games[open as 4 | 6 | 7];
        if (g) {
            g.onHud = (a, b, status) => setHud((h) => (h.a === a && h.b === b && h.status === status ? h : { a, b, status }));
            g.sync();
        }
        /* teclado de los juegos: espacio suelta, flechas inclinan, 1–4 tocan */
        const keys = new Set<string>();
        const typing = (ev: KeyboardEvent) => {
            const el = ev.target as HTMLElement | null;
            return !!el && (el.tagName === "INPUT" || el.tagName === "BUTTON" || el.tagName === "A");
        };
        const gameKey = (ev: KeyboardEvent) => {
            if (typing(ev)) return;
            if (open === 4 && (ev.key === " " || ev.key === "Enter")) {
                ev.preventDefault();
                if (!ev.repeat) e.t.place();
            }
            if (open === 6 && ev.key.startsWith("Arrow")) {
                ev.preventDefault();
                keys.add(ev.key);
            }
            if (open === 7 && "1234".includes(ev.key) && ev.key.length === 1 && !ev.repeat) e.s.press(Number(ev.key) - 1);
        };
        const gameKeyUp = (ev: KeyboardEvent) => keys.delete(ev.key);
        window.addEventListener("keydown", gameKey);
        window.addEventListener("keyup", gameKeyUp);
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const R: Rend = { ctx, cam: new Cam(), dpr: 1, W: 1, H: 1 };
        const resize = () => {
            const r = cv.getBoundingClientRect();
            R.dpr = Math.min(window.devicePixelRatio || 1, 2);
            R.W = Math.max(1, r.width);
            R.H = Math.max(1, r.height);
            cv.width = Math.round(R.W * R.dpr);
            cv.height = Math.round(R.H * R.dpr);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(cv);
        /* arrastrar para girar la cámara */
        const yaw = new Spring(open === 1 ? 30 : open === 2 ? 22 : open === 6 ? 45 : open === 7 ? 45 : 40, 40, 12);
        const my = new Spring(0, 30, 10);
        let drag: { x: number; yaw: number } | null = null;
        let moved = false;
        /* laberinto: mantener apretado inclina la placa hacia el puntero */
        let steer: P2 | null = null;
        const local = (ev: PointerEvent): P2 => {
            const r = cv.getBoundingClientRect();
            return [ev.clientX - r.left, ev.clientY - r.top];
        };
        const down = (ev: PointerEvent) => {
            cv.setPointerCapture(ev.pointerId);
            if (open === 6) {
                steer = local(ev);
                return;
            }
            drag = { x: ev.clientX, yaw: yaw.t };
            moved = false;
        };
        const move = (ev: PointerEvent) => {
            if (steer) {
                steer = local(ev);
                return;
            }
            if (!drag) {
                if (ev.pointerType === "mouse") my.t = (ev.clientY / window.innerHeight - 0.5) * 2;
                return;
            }
            const dx = ev.clientX - drag.x;
            if (Math.abs(dx) > 6) moved = true;
            if (moved) yaw.t = drag.yaw + dx * 0.35;
        };
        const up = (ev: PointerEvent) => {
            steer = null;
            if (drag && !moved) {
                const [px, py] = local(ev);
                if (open === 0) e.g.drop();
                if (open === 4) e.t.place();
                if (open === 5) {
                    const i = pick(R, e.r.hits(), px, py);
                    if (i >= 0) e.r.hit(i);
                }
                if (open === 7) {
                    const i = pick(R, e.s.hits(), px, py);
                    if (i >= 0) e.s.press(i);
                }
            }
            drag = null;
        };
        /* iOS reconoce el toque como gesto en touchend: ahí también se despierta el audio de la secuencia */
        const wake = () => {
            if (open === 7) e.s.unlock();
        };
        cv.addEventListener("touchend", wake, { passive: true });
        cv.addEventListener("pointerdown", down);
        cv.addEventListener("pointermove", move);
        cv.addEventListener("pointerup", up);
        cv.addEventListener("pointercancel", up);
        let raf = 0;
        let last = performance.now();
        const t0 = last;
        let acc = 0;
        const STEP = 1 / 240;
        const loop = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const t = (now - t0) / 1000;
            const light = !themeRef.current;
            /* sin arrastrar, la cámara gira sola muy despacio */
            if (!drag && !rm && open === 1) yaw.t += dt * 12;
            /* inclinación del laberinto: puntero o flechas, siempre en el sentido de la pantalla */
            if (open === 6) {
                let sx = 0;
                let sy = 0;
                if (steer) {
                    const b = R.cam.p(0, 0, 0);
                    sx = steer[0] - b[0];
                    sy = steer[1] - b[1];
                } else {
                    sx = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
                    sy = (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);
                }
                const [wx, wy] = screenToWorld(R, sx, sy);
                const len = Math.hypot(wx, wy);
                const k = len > 1e-6 ? Math.min(1, steer ? (Math.hypot(sx, sy) / 140) : 1) / len : 0;
                e.m.tilt.x.t = wx * k;
                e.m.tilt.y.t = wy * k;
            }
            acc += dt;
            while (acc > STEP) {
                yaw.step(STEP);
                my.step(STEP);
                if (open === 0) e.g.step(STEP);
                if (open === 1) e.l.sep.step(STEP);
                if (open === 2) e.w.bodies.forEach((b) => b.step(STEP));
                if (open === 4) e.t.step(STEP);
                if (open === 5) e.r.step(STEP);
                if (open === 6) e.m.step(STEP);
                if (open === 7) e.s.step(STEP);
                acc -= STEP;
            }
            if (rm) {
                e.l.sep.snap();
                e.w.bodies.forEach((b) => b.snap());
            }
            ctx.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
            ctx.clearRect(0, 0, R.W, R.H);
            if (open === 0) e.g.draw(R, light, yaw.x, my.x);
            if (open === 1) e.l.draw(R, light, yaw.x, t, rm);
            if (open === 2) e.w.draw(R, light, yaw.x, my.x);
            if (open === 4) e.t.draw(R, light, yaw.x, my.x);
            if (open === 5) e.r.draw(R, light, yaw.x, my.x);
            if (open === 6) e.m.draw(R, light, yaw.x, t);
            if (open === 7) e.s.draw(R, light, yaw.x, my.x, t);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            cv.removeEventListener("touchend", wake);
            cv.removeEventListener("pointerdown", down);
            cv.removeEventListener("pointermove", move);
            cv.removeEventListener("pointerup", up);
            cv.removeEventListener("pointercancel", up);
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("keydown", gameKey);
            window.removeEventListener("keyup", gameKeyUp);
            if (g) g.onHud = () => {};
        };
        // closeExp solo cambia estado; no hace falta reiniciar el loop por él
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    /* ---------- piezas de interfaz ---------- */
    const line = (label: string) => (
        <span className="lab-line__txt" aria-hidden="true">
            {[...label].map((ch, i) => (
                <span key={i} style={{ "--i": i } as CSSProperties}>
                    {ch === " " ? " " : ch}
                </span>
            ))}
        </span>
    );
    const arrow = (
        <svg className="lab-line__arrow" viewBox="0 0 26 26" aria-hidden="true">
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
    const masked = (text: string, inView = false) => {
        const ws = text.split(" ");
        return ws.map((w, i) => (
            <span className="lab-mask" key={`${language}-${i}`} aria-hidden="true">
                <motion.span
                    className={i === ws.length - 1 ? "is-accent" : undefined}
                    initial={{ y: "112%" }}
                    {...(inView ? { whileInView: { y: "0%" }, viewport: { once: true, margin: "-60px" } } : { animate: { y: "0%" } })}
                    transition={{ duration: 1.15, ease: EASE, delay: (inView ? 0 : 0.15) + i * 0.065 }}
                >
                    {w}
                </motion.span>
            </span>
        ));
    };
    /* control deslizante con su valor */
    const range = (label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, fmt: (v: number) => string) => (
        <label className="lab-range">
            <span className="lab-range__head">
                <span>{label}</span>
                <b>{fmt(value)}</b>
            </span>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(ev) => onChange(Number(ev.target.value))} />
        </label>
    );
    /* marcador de los juegos: dos números grandes y el estado debajo */
    const score = (la: string, a: string, lb: string, b: string) => (
        <div className="lab-score" aria-live="polite">
            <p>
                <b>{a}</b>
                <span>{la}</span>
            </p>
            <p>
                <b>{b}</b>
                <span>{lb}</span>
            </p>
            {hud.status && c.controls.status[hud.status as keyof typeof c.controls.status] && (
                <p className="lab-score__status" key={hud.status}>
                    {c.controls.status[hud.status as keyof typeof c.controls.status]}
                </p>
            )}
        </div>
    );
    const exp = open !== null ? c.experiments[open] : null;
    const BTN_CLASSES = ["lab-demo lab-demo--sweep", "lab-demo lab-demo--wave", "lab-demo lab-demo--draw", "lab-demo lab-demo--fill"];

    return (
        <MotionConfig reducedMotion="user">
            <main className={`lab ${isDark ? "theme-dark" : "theme-light"}`}>
                {/* ---------- portada ---------- */}
                <section className="lab-hero" ref={heroRef}>
                    <canvas ref={heroCv} className="lab-hero__canvas" role="img" aria-label={c.aria.hero} />
                    <div className="lab-wrap lab-hero__inner">
                        <motion.p className="lab-kicker" {...reveal()}>
                            <i aria-hidden="true" />
                            DeepDev {c.kicker}
                        </motion.p>
                        <h1 className="lab-hero__title" aria-label={c.title}>
                            {masked(c.title)}
                        </h1>
                        <div className="lab-hero__foot">
                            <motion.p className="lab-body" {...reveal(0.25)}>
                                {c.text}
                            </motion.p>
                            <motion.p className="lab-label" {...reveal(0.35)}>
                                {c.hint}
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* ---------- experimentos ---------- */}
                <section className="lab-exps">
                    <div className="lab-wrap">
                        <motion.p className="lab-kicker" {...reveal()}>
                            <span>01</span>
                            {c.kicker}
                        </motion.p>
                        <ol className="lab-exps__list">
                            {c.experiments.map((x, i) => (
                                <motion.li key={i} {...reveal(i * 0.06)}>
                                    <button type="button" className="lab-exp" onClick={() => openExp(i)} aria-label={`${c.open}: ${x.name}`}>
                                        <span className="lab-exp__n">{pad(i + 1)}</span>
                                        <span className="lab-exp__name">{x.name}</span>
                                        <span className="lab-exp__text">{x.text}</span>
                                        <span className="lab-exp__tech">{x.tech.join(" · ")}</span>
                                        <span className="lab-exp__go" aria-hidden="true">
                                            {c.open}
                                            <svg viewBox="0 0 26 26">
                                                <path d="M4 13h18M15 6l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </button>
                                </motion.li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ---------- stack: torre de capas ---------- */}
                <section className="lab-stack" ref={stackRef}>
                    <div className="lab-stack__sticky">
                        <h2 className="lab-stack__title">{c.stack.title}</h2>
                        <canvas ref={stackCv} className="lab-stack__canvas" role="img" aria-label={c.aria.stack} />
                        <div className="lab-stack__hud">
                            <p className="lab-kicker">
                                <span>02</span>
                                {c.stack.kicker}
                            </p>
                            <p className="lab-stack__index" aria-hidden="true">
                                <b>01</b>
                                <span>/{pad(c.stack.layers.length)}</span>
                            </p>
                            <div className="lab-stack__layers">
                                {c.stack.layers.map((l, i) => (
                                    <div className={`lab-stack__layer${i === 0 ? " is-active" : ""}`} data-i={i} key={`${language}-${i}`}>
                                        <h3>{l.name}</h3>
                                        <p>{l.text}</p>
                                        <ul>
                                            {l.tools.map((tool) => (
                                                <li key={tool}>{tool}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <ol className="lab-stack__timeline">
                                {c.stack.layers.map((l, i) => (
                                    <li key={i} className={i === 0 ? "is-on" : ""}>
                                        <i aria-hidden="true">
                                            <b />
                                        </i>
                                        <span>{l.name}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                {/* ---------- cierre ---------- */}
                <section className="lab-cta">
                    <div className="lab-wrap lab-cta__inner">
                        <h2 className="lab-cta__title" aria-label={c.cta.title}>
                            {masked(c.cta.title, true)}
                        </h2>
                        <motion.div {...reveal(0.12)}>
                            <Link to="/contact" className="lab-line lab-line--primary lab-line--xl" aria-label={c.cta.button}>
                                {line(c.cta.button)}
                                {arrow}
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* ---------- experimento a pantalla completa ---------- */}
                {exp && open !== null && (
                    <div className={`lab-play${closing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="lab-play-title">
                        <div className="lab-play__stage">
                            {open === 3 ? (
                                <div className="lab-play__demos">
                                    {c.controls.samples.map((s, i) => (
                                        <button type="button" key={i} className={BTN_CLASSES[i]} aria-label={s}>
                                            {line(s)}
                                            {i !== 1 && arrow}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <canvas ref={playCv} className="lab-play__canvas" role="img" tabIndex={open >= 4 ? 0 : -1} aria-label={`${c.aria.experiment}: ${exp.name}`} />
                            )}
                        </div>
                        <div className="lab-play__panel">
                            <p className="lab-kicker">
                                <span>{pad(open + 1)}</span>
                                {c.kicker}
                            </p>
                            <h2 id="lab-play-title" className="lab-play__title">
                                {exp.name}
                            </h2>
                            <p className="lab-play__text">{exp.text}</p>
                            <p className="lab-play__hint">{exp.hint}</p>
                            <div className="lab-play__controls">
                                {open === 0 && (
                                    <>
                                        {range(c.controls.gravity, gravity, 6, 80, 1, setGravity, (v) => `${(v / 3.4).toFixed(1)} g`)}
                                        {range(c.controls.bounce, bounce, 0, 0.85, 0.01, setBounce, (v) => `${Math.round(v * 100)}%`)}
                                        <div className="lab-play__actions">
                                            <button type="button" className="lab-line" onClick={() => expRef.current?.g.drop()} aria-label={c.controls.drop}>
                                                {line(c.controls.drop)}
                                            </button>
                                            <button type="button" className="lab-line" onClick={() => expRef.current?.g.reset()} aria-label={c.reset}>
                                                {line(c.reset)}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {open === 1 && (
                                    <>
                                        {range(c.controls.depth, depth, 0.1, 1.4, 0.01, setDepth, (v) => v.toFixed(2))}
                                        <div className="lab-play__actions">
                                            <button type="button" className="lab-line" onClick={() => setSplit((s) => !s)} aria-label={split ? c.controls.join : c.controls.split}>
                                                {line(split ? c.controls.join : c.controls.split)}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {open === 2 && (
                                    <label className="lab-type">
                                        <span className="lab-range__head">
                                            <span>{c.controls.placeholder}</span>
                                            <b>
                                                {[...word].length}/{W_MAX}
                                            </b>
                                        </span>
                                        <input type="text" value={word} maxLength={W_MAX} placeholder={c.controls.placeholder} onChange={(ev) => setWord(ev.target.value.slice(0, W_MAX))} autoComplete="off" spellCheck={false} />
                                    </label>
                                )}
                                {open === 4 && (
                                    <>
                                        {score(c.controls.height, pad(hud.a), c.controls.best, pad(hud.b))}
                                        <div className="lab-play__actions">
                                            <button type="button" className="lab-line" onClick={() => expRef.current?.t.place()} aria-label={c.controls.place}>
                                                {line(c.controls.place)}
                                            </button>
                                            <button type="button" className="lab-line" onClick={() => expRef.current?.t.reset()} aria-label={c.reset}>
                                                {line(c.reset)}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {open === 5 && (
                                    <>
                                        {range(c.controls.speed, wave, 10, 90, 1, setWave, (v) => `${Math.round((v / 36) * 100)}%`)}
                                        {range(c.controls.damping, calmness, 0.2, 5, 0.1, setCalmness, (v) => v.toFixed(1))}
                                        <div className="lab-play__actions">
                                            <button type="button" className="lab-line" onClick={() => setRain((r) => !r)} aria-label={rain ? c.controls.rainOn : c.controls.rainOff}>
                                                {line(rain ? c.controls.rainOn : c.controls.rainOff)}
                                            </button>
                                            <button type="button" className="lab-line" onClick={() => expRef.current?.r.calm()} aria-label={c.controls.calm}>
                                                {line(c.controls.calm)}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {open === 6 && (
                                    <>
                                        {score(c.controls.level, pad(hud.a), c.controls.time, `${hud.b.toFixed(1)} s`)}
                                        <div className="lab-play__actions">
                                            <button type="button" className="lab-line" onClick={() => expRef.current?.m.next()} aria-label={c.controls.newMaze}>
                                                {line(c.controls.newMaze)}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {open === 7 && (
                                    <>
                                        {score(c.controls.level, pad(hud.a), c.controls.best, pad(hud.b))}
                                        <div className="lab-play__actions">
                                            <button type="button" className="lab-line" onClick={() => expRef.current?.s.start()} aria-label={c.controls.start}>
                                                {line(c.controls.start)}
                                            </button>
                                            <button type="button" className="lab-line" onClick={() => {
                                                expRef.current?.s.unlock();
                                                setSound((v) => !v);
                                            }} aria-label={sound ? c.controls.soundOn : c.controls.soundOff}>
                                                {line(sound ? c.controls.soundOn : c.controls.soundOff)}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <p className="lab-play__tech">
                                <span>{c.madeWith}</span>
                                {exp.tech.join(" · ")}
                            </p>
                        </div>
                        <button ref={closeBtn} type="button" className="lab-line lab-play__close" onClick={closeExp} aria-label={c.close}>
                            {line(c.close)}
                            <svg className="lab-play__x" viewBox="0 0 26 26" aria-hidden="true">
                                <path d="M6 6l14 14M20 6L6 20" />
                            </svg>
                        </button>
                    </div>
                )}
            </main>
        </MotionConfig>
    );
};

export default Lab;