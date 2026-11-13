// ─────────────────────────────────────────────────────────────────────
// Tours 360 — tipos, URLs de Cloudinary, corte en mosaicos y subida.
// Lo usan el dashboard (TourAdmin) y el visor público (TourViewer).
// ─────────────────────────────────────────────────────────────────────
import axios from "axios";
import type { MarkerConfig } from "@photo-sphere-viewer/markers-plugin";

export const tourApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    timeout: 20000,
});

// ─── Tipos ───────────────────────────────────────────────────────────
export interface TourView { yaw: number; pitch: number; zoom: number }

export interface TourHotspot {
    id: string;
    type: "link" | "info";
    yaw: number;
    pitch: number;
    target: string;
    title: string;
    text: string;
    url: string;
}

export interface TourLevel { width: number; cols: number; rows: number }

// Zona difuminada: círculo sobre la esfera (radio en radianes)
export interface TourBlur { id: string; yaw: number; pitch: number; radius: number }

export interface TourScene {
    id: string;
    name: string;
    floor: string;
    width: number;
    levels: TourLevel[];
    version: number;
    initialView: TourView;
    hotspots: TourHotspot[];
    blurs?: TourBlur[];
}

export interface TourFloor { id: string; name: string }

export interface TourSettings {
    autorotate: boolean;
    autorotateSpeed: number;
    autorotateDelay: number;
    gallery: boolean;
    accent: string;
    nadirVersion: number;   // 0 = sin logo en el piso
    nadirSize: number;      // radio del logo en grados
}

export interface TourData {
    id: string;
    title: string;
    slug: string;
    published?: boolean;
    startScene: string | null;
    floors: TourFloor[];
    scenes: TourScene[];
    settings: TourSettings;
    assetBase: string;
    updatedAt?: string;
}

// ─── URLs ────────────────────────────────────────────────────────────
// tours/<tourId>/<sceneId>/<archivo>.jpg — la versión rompe la caché del CDN
export const sceneAsset = (assetBase: string, tourId: string, scene: Pick<TourScene, "id" | "version">, file: string) =>
    `${assetBase}/v${scene.version || 1}/tours/${tourId}/${scene.id}/${file}.jpg`;

export const buildPanorama = (tour: Pick<TourData, "assetBase" | "id">, scene: TourScene) => ({
    baseUrl: sceneAsset(tour.assetBase, tour.id, scene, "base"),
    levels: scene.levels,
    tileUrl: (col: number, row: number, level: number) =>
        sceneAsset(tour.assetBase, tour.id, scene, `l${level}_${col}_${row}`),
});

// ─── Logo en el piso (nadir) ─────────────────────────────────────────
export const nadirUrl = (tour: Pick<TourData, "assetBase" | "id" | "settings">) =>
    `${tour.assetBase}/v${tour.settings.nadirVersion}/tours/${tour.id}/brand/nadir.png`;

// Cuadrado apoyado en el piso, centrado bajo la cámara. El logo es redondo,
// así que el cuadrado se calcula para que el círculo tenga el radio pedido.
export function nadirMarker(tour: Pick<TourData, "assetBase" | "id" | "settings">): MarkerConfig | null {
    const { nadirVersion, nadirSize } = tour.settings;
    if (!nadirVersion || !tour.assetBase) return null;
    const r = (Math.min(35, Math.max(5, nadirSize || 18)) * Math.PI) / 180;
    const pitch = -Math.PI / 2 + Math.atan(Math.SQRT2 * Math.tan(r));
    const q = Math.PI / 4;
    return {
        id: "__nadir",
        imageLayer: nadirUrl(tour),
        position: [
            { yaw: q * 7, pitch },
            { yaw: q, pitch },
            { yaw: q * 3, pitch },
            { yaw: q * 5, pitch },
        ],
    };
}

// Polígono que dibuja un círculo real sobre la esfera (para marcar zonas)
export function sphereCircle(yaw: number, pitch: number, radius: number, steps = 40): Array<[number, number]> {
    const pts: Array<[number, number]> = [];
    const sinP = Math.sin(pitch);
    const cosP = Math.cos(pitch);
    for (let i = 0; i < steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const lat = Math.asin(sinP * Math.cos(radius) + cosP * Math.sin(radius) * Math.cos(theta));
        const lon = yaw + Math.atan2(Math.sin(theta) * Math.sin(radius) * cosP, Math.cos(radius) - sinP * Math.sin(lat));
        pts.push([lon, Math.max(-Math.PI / 2 + 1e-4, Math.min(Math.PI / 2 - 1e-4, lat))]);
    }
    return pts;
}

export const publicTourUrl = (slug: string) => `${window.location.origin}/tour/${slug}`;

// Versión para pegar en un componente React/TSX (style como objeto, allowFullScreen)
export const embedCodeTsx = (slug: string, title: string) =>
    [
        "<iframe",
        `    src="${publicTourUrl(slug)}"`,
        `    title={${JSON.stringify(`Tour virtual 360 · ${title}`)}}`,
        `    width="100%"`,
        `    height={600}`,
        `    style={{ border: 0 }}`,
        `    allow="fullscreen; accelerometer; gyroscope"`,
        `    allowFullScreen`,
        `    loading="lazy"`,
        "/>",
    ].join("\n");

export const embedCode = (slug: string) =>
    `<iframe src="${publicTourUrl(slug)}" width="100%" height="600" style="border:0" allow="fullscreen; accelerometer; gyroscope" allowfullscreen loading="lazy"></iframe>`;

// ─── Utilidades ──────────────────────────────────────────────────────
export const escapeHtml = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const safeHttpsUrl = (v: string) => (/^https:\/\/[^\s"'<>]+$/i.test(v) ? v : "");

export const newId = (len = 10) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

export const DEFAULT_VIEW: TourView = { yaw: 0, pitch: 0, zoom: 50 };

// ─── Corte en mosaicos (en el navegador) ─────────────────────────────
// Una foto del X4 tiene 11904×5952 (72 MP). Cloudinary gratis acepta hasta
// 25 MP, y Render gratis no tiene RAM para procesarla, así que se corta acá:
//   · base.jpg   2048×1024  (carga primero, borrosa)
//   · thumb.jpg   480×240   (galería)
//   · l0_c_r     nivel 4096×2048 → 8×4 mosaicos de 512
//   · l1_c_r     nivel 8192×4096 → 16×8 mosaicos de 512 (si la foto da)
export const TILE = 512;
const JPG_QUALITY = 0.86;

export interface TiledFile { name: string; blob: Blob }
export interface TiledScene { width: number; levels: TourLevel[]; files: TiledFile[] }

type Source = ImageBitmap | HTMLCanvasElement;

const makeCanvas = (w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return { c, ctx };
};

const toJpg = (c: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) =>
        c.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", JPG_QUALITY)
    );

// Achica por mitades hasta quedar cerca del destino: mucha más nitidez
// que un único drawImage de 12000 a 2000 px.
function scaleTo(src: Source, srcW: number, srcH: number, targetW: number): HTMLCanvasElement {
    let cur: Source = src;
    let w = srcW;
    let h = srcH;
    while (w / 2 >= targetW) {
        const { c, ctx } = makeCanvas(Math.round(w / 2), Math.round(h / 2));
        ctx.drawImage(cur, 0, 0, c.width, c.height);
        if (cur instanceof HTMLCanvasElement && cur !== src) cur.width = 0;   // libera memoria
        cur = c;
        w = c.width;
        h = c.height;
    }
    const targetH = Math.round(targetW / 2);
    const { c, ctx } = makeCanvas(targetW, targetH);
    ctx.drawImage(cur, 0, 0, targetW, targetH);
    if (cur instanceof HTMLCanvasElement && cur !== src) cur.width = 0;
    return c;
}

const nextFrame = () => new Promise((r) => setTimeout(r, 0));

// ─── Difuminado (antes de cortar: lo original nunca sale del navegador) ──
interface BlurPatch { canvas: HTMLCanvasElement; x: number; y: number }

const angularDistance = (y1: number, p1: number, y2: number, p2: number) => {
    const a = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((y2 - y1) / 2) ** 2;
    return 2 * Math.asin(Math.min(1, Math.sqrt(a)));
};

// Desenfoque fuerte reduciendo y volviendo a ampliar (funciona en todos los navegadores)
function softBlur(src: HTMLCanvasElement, factor: number) {
    const w = Math.max(2, Math.round(src.width / factor));
    const h = Math.max(2, Math.round(src.height / factor));
    const small = makeCanvas(w, h);
    small.ctx.drawImage(src, 0, 0, w, h);
    const tiny = makeCanvas(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)));
    tiny.ctx.drawImage(small.c, 0, 0, tiny.c.width, tiny.c.height);
    small.ctx.clearRect(0, 0, w, h);
    small.ctx.drawImage(tiny.c, 0, 0, w, h);
    const out = makeCanvas(src.width, src.height);
    out.ctx.drawImage(small.c, 0, 0, src.width, src.height);
    small.c.width = 0;
    tiny.c.width = 0;
    return out;
}

function buildBlurPatches(bmp: ImageBitmap, W: number, H: number, blurs: TourBlur[]): BlurPatch[] {
    const patches: BlurPatch[] = [];
    const xOf = (yaw: number) => ((((yaw / (Math.PI * 2)) + 0.5) % 1) + 1) % 1 * W;
    const yOf = (pitch: number) => (0.5 - pitch / Math.PI) * H;
    const margin = Math.round(W / 120);
    const factor = Math.max(24, Math.round(W / 160));   // ~74 px en una foto de 72 MP: irreconocible

    for (const b of blurs) {
        const r = Math.min(0.8, Math.max(0.02, b.radius));
        const top = b.pitch + r;
        const bottom = b.pitch - r;
        let x0: number;
        let x1: number;
        if (top >= Math.PI / 2 || bottom <= -Math.PI / 2) {
            x0 = 0;                                   // toca un polo: todo el ancho
            x1 = W;
        } else {
            const dYaw = Math.asin(Math.min(1, Math.sin(r) / Math.cos(b.pitch)));
            const cx = xOf(b.yaw);
            const half = (dYaw / (Math.PI * 2)) * W;
            x0 = Math.floor(cx - half) - margin;
            x1 = Math.ceil(cx + half) + margin;
        }
        const y0 = Math.max(0, Math.floor(yOf(Math.min(Math.PI / 2, top))) - margin);
        const y1 = Math.min(H, Math.ceil(yOf(Math.max(-Math.PI / 2, bottom))) + margin);
        const pw = x1 - x0;
        const ph = y1 - y0;
        if (pw <= 0 || ph <= 0) continue;

        // Recorte de la foto (con vuelta en los bordes izquierdo/derecho)
        const crop = makeCanvas(pw, ph);
        for (const shift of [-W, 0, W]) {
            const sx = Math.max(0, x0 + shift);
            const ex = Math.min(W, x1 + shift);
            if (ex > sx) crop.ctx.drawImage(bmp, sx, y0, ex - sx, ph, sx - shift - x0, 0, ex - sx, ph);
        }
        const blurred = softBlur(crop.c, factor);
        crop.c.width = 0;

        // Máscara del círculo, calculada a baja resolución y suavizada al ampliar
        const ms = 8;
        const mw = Math.max(1, Math.ceil(pw / ms));
        const mh = Math.max(1, Math.ceil(ph / ms));
        const mask = makeCanvas(mw, mh);
        const img = mask.ctx.createImageData(mw, mh);
        for (let my = 0; my < mh; my++) {
            const pitch = Math.PI / 2 - ((y0 + (my + 0.5) * ms) / H) * Math.PI;
            for (let mx = 0; mx < mw; mx++) {
                const yaw = (((x0 + (mx + 0.5) * ms) / W) - 0.5) * Math.PI * 2;
                const d = angularDistance(yaw, pitch, b.yaw, b.pitch);
                // Borde suave: el último 15% del radio se funde
                const alpha = d <= r * 0.85 ? 255 : d >= r ? 0 : Math.round(255 * (1 - (d - r * 0.85) / (r * 0.15)));
                img.data[(my * mw + mx) * 4 + 3] = alpha;
            }
        }
        mask.ctx.putImageData(img, 0, 0);
        blurred.ctx.globalCompositeOperation = "destination-in";
        blurred.ctx.drawImage(mask.c, 0, 0, pw, ph);
        blurred.ctx.globalCompositeOperation = "source-over";
        mask.c.width = 0;

        patches.push({ canvas: blurred.c, x: x0, y: y0 });
    }
    return patches;
}

// Dibuja los parches sobre un destino que muestra la región (sx, sy) de la foto escalada por 1/k
function drawPatches(ctx: CanvasRenderingContext2D, patches: BlurPatch[], W: number, sx: number, sy: number, k: number, dw: number, dh: number) {
    for (const p of patches) {
        for (const shift of [-W, 0, W]) {
            const px = p.x + shift;
            const dx = (px - sx) / k;
            const dy = (p.y - sy) / k;
            const w = p.canvas.width / k;
            const h = p.canvas.height / k;
            if (dx > dw || dy > dh || dx + w < 0 || dy + h < 0) continue;
            ctx.drawImage(p.canvas, dx, dy, w, h);
        }
    }
}

// Vista previa liviana (4096 px) para marcar zonas antes de subir
export async function makePreviewUrl(file: File): Promise<string> {
    if (!/^image\/jpe?g$/i.test(file.type)) throw new Error("La foto tiene que ser JPG.");
    const bmp = await createImageBitmap(file);
    try {
        if (Math.abs(bmp.width / bmp.height - 2) > 0.02) throw new Error("No es una foto 360: tiene que medir el doble de ancho que de alto (2:1).");
        const target = Math.min(4096, bmp.width);
        const c = scaleTo(bmp, bmp.width, bmp.height, target);
        const blob = await toJpg(c);
        c.width = 0;
        return URL.createObjectURL(blob);
    } finally {
        bmp.close();
    }
}

export async function tileEquirect(file: File, onProgress?: (p: number) => void, blurs: TourBlur[] = []): Promise<TiledScene> {
    if (!/^image\/jpe?g$/i.test(file.type)) throw new Error("La foto tiene que ser JPG.");

    const bmp = await createImageBitmap(file);
    const W = bmp.width;
    const H = bmp.height;
    try {
        if (Math.abs(W / H - 2) > 0.02) throw new Error("No es una foto 360: tiene que medir el doble de ancho que de alto (2:1).");
        if (W < 4096) throw new Error("La foto es muy chica: necesita al menos 4096 px de ancho.");

        const levels: TourLevel[] = [{ width: 4096, cols: 8, rows: 4 }];
        if (W >= 8192) levels.push({ width: 8192, cols: 16, rows: 8 });

        const total = levels.reduce((n, l) => n + l.cols * l.rows, 0) + 2;
        let done = 0;
        const tick = () => onProgress?.(++done / total);
        const files: TiledFile[] = [];

        // Zonas a difuminar (se aplican a todo lo que se genera)
        const patches = blurs.length ? buildBlurPatches(bmp, W, H, blurs) : [];

        // Nivel 0 desde un lienzo de 4096 (mosaicos copiados 1:1)
        const level0 = scaleTo(bmp, W, H, 4096);
        if (patches.length) drawPatches(level0.getContext("2d")!, patches, W, 0, 0, W / 4096, 4096, 2048);
        const tile = makeCanvas(TILE, TILE);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 8; col++) {
                tile.ctx.clearRect(0, 0, TILE, TILE);
                tile.ctx.drawImage(level0, col * TILE, row * TILE, TILE, TILE, 0, 0, TILE, TILE);
                files.push({ name: `l0_${col}_${row}`, blob: await toJpg(tile.c) });
                tick();
            }
            await nextFrame();
        }

        // Base y miniatura
        const base = scaleTo(level0, 4096, 2048, 2048);
        files.push({ name: "base", blob: await toJpg(base) });
        tick();
        const thumb = scaleTo(base, 2048, 1024, 480);
        files.push({ name: "thumb", blob: await toJpg(thumb) });
        tick();
        level0.width = 0;
        base.width = 0;
        thumb.width = 0;

        // Nivel 1 directo desde la foto original (reducción de ~1,45×)
        if (levels.length > 1) {
            const k = W / 8192;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 16; col++) {
                    tile.ctx.clearRect(0, 0, TILE, TILE);
                    tile.ctx.drawImage(bmp, col * TILE * k, row * TILE * k, TILE * k, TILE * k, 0, 0, TILE, TILE);
                    if (patches.length) drawPatches(tile.ctx, patches, W, col * TILE * k, row * TILE * k, k, TILE, TILE);
                    files.push({ name: `l1_${col}_${row}`, blob: await toJpg(tile.c) });
                    tick();
                }
                await nextFrame();
            }
        }
        tile.c.width = 0;
        patches.forEach((p) => (p.canvas.width = 0));

        return { width: W, levels, files };
    } finally {
        bmp.close();
    }
}

// ─── Subida directa a Cloudinary (firmada por el back) ──────────────
interface SignResponse {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signatures: Record<string, string>;
}

const CONCURRENCY = 6;
const RETRIES = 2;

// Logo del piso: recorte circular, con o sin fondo, a PNG de 1024
export async function makeNadirPng(file: File, background: string | null): Promise<Blob> {
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) throw new Error("El logo tiene que ser PNG, JPG o WebP.");
    if (file.size > 8 * 1024 * 1024) throw new Error("El logo pesa demasiado (máximo 8 MB).");
    const bmp = await createImageBitmap(file);
    try {
        const S = 1024;
        const { c, ctx } = makeCanvas(S, S);
        ctx.beginPath();
        ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        if (background) {
            // Fondo de color y logo entero adentro, con aire
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, S, S);
            const box = S * 0.62;
            const k = Math.min(box / bmp.width, box / bmp.height);
            const w = bmp.width * k;
            const h = bmp.height * k;
            ctx.drawImage(bmp, (S - w) / 2, (S - h) / 2, w, h);
        } else {
            // Sin fondo: el logo cubre el círculo
            const k = Math.max(S / bmp.width, S / bmp.height);
            const w = bmp.width * k;
            const h = bmp.height * k;
            ctx.drawImage(bmp, (S - w) / 2, (S - h) / 2, w, h);
        }
        return await new Promise<Blob>((resolve, reject) =>
            c.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/png")
        );
    } finally {
        bmp.close();
    }
}

export async function uploadNadir(tourId: string, blob: Blob) {
    const { data } = await tourApi.post<SignResponse>(`/api/admin/tours/${tourId}/upload-signatures`, { kind: "nadir" });
    const fd = new FormData();
    fd.append("file", blob, "nadir.png");
    fd.append("api_key", data.apiKey);
    fd.append("timestamp", String(data.timestamp));
    fd.append("public_id", `tours/${tourId}/brand/nadir`);
    fd.append("allowed_formats", "png");
    fd.append("overwrite", "true");
    fd.append("invalidate", "true");
    fd.append("signature", data.signatures.nadir);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`, { method: "POST", body: fd });
    if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || `Cloudinary ${res.status}`);
    }
}

export async function uploadSceneFiles(
    tourId: string,
    sceneId: string,
    files: TiledFile[],
    onProgress?: (p: number) => void
) {
    const { data } = await tourApi.post<SignResponse>(`/api/admin/tours/${tourId}/upload-signatures`, {
        sceneId,
        names: files.map((f) => f.name),
    });

    const endpoint = `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`;
    let done = 0;
    let cursor = 0;

    const uploadOne = async (f: TiledFile) => {
        for (let attempt = 0; ; attempt++) {
            const fd = new FormData();
            fd.append("file", f.blob, `${f.name}.jpg`);
            fd.append("api_key", data.apiKey);
            fd.append("timestamp", String(data.timestamp));
            fd.append("public_id", `tours/${tourId}/${sceneId}/${f.name}`);
            fd.append("allowed_formats", "jpg");
            fd.append("overwrite", "true");
            fd.append("invalidate", "true");
            fd.append("signature", data.signatures[f.name]);
            try {
                const res = await fetch(endpoint, { method: "POST", body: fd });
                if (res.ok) return;
                if (res.status < 500 || attempt >= RETRIES) {
                    const err = await res.json().catch(() => null);
                    throw new Error(err?.error?.message || `Cloudinary ${res.status}`);
                }
            } catch (e) {
                if (attempt >= RETRIES) throw e;
            }
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
    };

    const worker = async () => {
        while (cursor < files.length) {
            const f = files[cursor++];
            await uploadOne(f);
            onProgress?.(++done / files.length);
        }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));
}