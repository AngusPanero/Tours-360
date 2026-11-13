// ─────────────────────────────────────────────────────────────────────
// TourAdmin — pestaña del dashboard para armar tours 360.
// Lista de tours → editor: plantas, escenas, pasos entre escenas,
// puntos de info, vista inicial, ajustes y publicación.
// ─────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type MutableRefObject } from "react";
import axios from "axios";
import { Viewer } from "@photo-sphere-viewer/core";
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
import { MarkersPlugin, type MarkerConfig } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import TourViewer from "./TourViewer";
import { UseTheme } from "../contexts/ThemeContext";
import {
    DEFAULT_VIEW,
    buildPanorama,
    embedCode,
    embedCodeTsx,
    escapeHtml,
    makeNadirPng,
    makePreviewUrl,
    nadirMarker,
    nadirUrl,
    newId,
    publicTourUrl,
    sceneAsset,
    sphereCircle,
    tileEquirect,
    tourApi,
    uploadNadir,
    uploadSceneFiles,
    type TourBlur,
    type TourData,
    type TourHotspot,
    type TourScene,
} from "./tourShared";
import "./tourAdmin.css";

// ─── Tipos locales ───────────────────────────────────────────────────
type Mode = "nav" | "link" | "info" | "move";

interface TourListItem {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    scenesCount: number;
    updatedAt: string;
    cover: { id: string; version: number } | null;
}

interface BlurJob {
    file: File;
    initial: TourBlur[];
    resolve: (blurs: TourBlur[] | null) => void;
}

interface UploadJob {
    key: string;
    name: string;
    phase: "tiling" | "uploading" | "done" | "error";
    progress: number;
    error?: string;
}

const errorText = (e: unknown, fallback: string) => {
    if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        if (status === 401 || status === 403) return "Tu sesión de admin venció. Volvé a iniciar sesión.";
        if (e.response?.data?.code === "tour/slug-taken") return "Ese enlace ya lo usa otro tour.";
        if (e.response?.data?.code === "tour/stale") return "El tour cambió en otra pestaña. Recargá la página antes de seguir.";
        if (status === 415) return "Pedido inválido.";
        if (!e.response) return "No hay conexión con el servidor.";
    }
    if (e instanceof Error && e.message && !axios.isAxiosError(e)) return e.message;
    return fallback;
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

const copy = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

// ═════════════════════════════════════════════════════════════════════
//  Contenedor
// ═════════════════════════════════════════════════════════════════════
const TourAdmin = () => {
    const { theme } = UseTheme();
    const [openId, setOpenId] = useState<string | null>(null);
    return (
        <section className={`ta-root ${theme === "light" ? "theme-light" : "theme-dark"}`}>
            {openId ? <TourEditor id={openId} onBack={() => setOpenId(null)} /> : <TourList onOpen={setOpenId} />}
        </section>
    );
};

export default TourAdmin;

// ═════════════════════════════════════════════════════════════════════
//  Lista de tours
// ═════════════════════════════════════════════════════════════════════
function TourList({ onOpen }: { onOpen: (id: string) => void }) {
    const [tours, setTours] = useState<TourListItem[]>([]);
    const [assetBase, setAssetBase] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [flash, setFlash] = useState<{ id: string; text: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await tourApi.get<{ tours: TourListItem[]; assetBase: string }>("/api/admin/tours");
            setTours(data.tours);
            setAssetBase(data.assetBase);
        } catch (e) {
            setError(errorText(e, "No se pudieron cargar los tours."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const create = async () => {
        const t = title.trim();
        if (!t || creating) return;
        setCreating(true);
        setError("");
        try {
            const { data } = await tourApi.post<{ tour: TourData }>("/api/admin/tours", { title: t });
            setTitle("");
            onOpen(data.tour.id);
        } catch (e) {
            setError(errorText(e, "No se pudo crear el tour."));
        } finally {
            setCreating(false);
        }
    };

    const remove = async (id: string) => {
        if (confirmId !== id) {
            setConfirmId(id);
            return;
        }
        setConfirmId(null);
        try {
            await tourApi.delete(`/api/admin/tours/${id}`);
            setTours((list) => list.filter((t) => t.id !== id));
        } catch (e) {
            setError(errorText(e, "No se pudo eliminar el tour."));
        }
    };

    const doCopy = async (id: string, text: string, label: string) => {
        const ok = await copy(text);
        setFlash({ id, text: ok ? label : "No se pudo copiar" });
        window.setTimeout(() => setFlash((f) => (f?.id === id ? null : f)), 1800);
    };

    return (
        <div className="ta-list">
            <header className="ta-list__head">
                <p className="ta-eyebrow"><span>01</span> Tours virtuales</p>
                <h2 className="ta-list__title">Recorridos 360</h2>
                <form
                    className="ta-create"
                    onSubmit={(e) => {
                        e.preventDefault();
                        create();
                    }}
                >
                    <input
                        className="ta-create__input"
                        value={title}
                        maxLength={120}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nombre del nuevo tour — ej. Depto Palermo 3 amb."
                        aria-label="Nombre del nuevo tour"
                    />
                    <button className="ta-link-btn ta-link-btn--accent" type="submit" disabled={!title.trim() || creating}>
                        {creating ? "Creando…" : "Crear tour"}
                        <span className="ta-link-btn__line" />
                    </button>
                </form>
            </header>

            {error && <p className="ta-error" role="alert">{error}</p>}

            {loading ? (
                <p className="ta-muted">Cargando tours…</p>
            ) : tours.length === 0 ? (
                <p className="ta-muted ta-empty">Todavía no hay tours. Creá el primero arriba.</p>
            ) : (
                <ul className="ta-rows">
                    {tours.map((t, i) => (
                        <li key={t.id} className="ta-row">
                            <button className="ta-row__main" onClick={() => onOpen(t.id)}>
                                <span className="ta-row__index">{String(i + 1).padStart(2, "0")}</span>
                                <span className="ta-row__cover">
                                    {t.cover && assetBase ? (
                                        <img src={sceneAsset(assetBase, t.id, t.cover, "thumb")} alt="" loading="lazy" />
                                    ) : (
                                        <span className="ta-row__cover-empty" />
                                    )}
                                </span>
                                <span className="ta-row__text">
                                    <span className="ta-row__title">{t.title}</span>
                                    <span className="ta-row__meta">
                                        /tour/{t.slug} · {t.scenesCount} {t.scenesCount === 1 ? "escena" : "escenas"} · {formatDate(t.updatedAt)}
                                    </span>
                                </span>
                                <span className={`ta-status ${t.published ? "is-live" : ""}`}>
                                    {t.published ? "Publicado" : "Borrador"}
                                </span>
                            </button>
                            <div className="ta-row__actions">
                                {flash?.id === t.id ? (
                                    <span className="ta-flash">{flash.text}</span>
                                ) : (
                                    <>
                                        <button className="ta-text-btn" onClick={() => doCopy(t.id, publicTourUrl(t.slug), "Link copiado")}>Link</button>
                                        <button className="ta-text-btn" onClick={() => doCopy(t.id, embedCodeTsx(t.slug, t.title), "TSX copiado")}>Iframe TSX</button>
                                        <button className="ta-text-btn" onClick={() => doCopy(t.id, embedCode(t.slug), "HTML copiado")}>Iframe HTML</button>
                                    </>
                                )}
                                <button
                                    className={`ta-text-btn ta-text-btn--danger ${confirmId === t.id ? "is-armed" : ""}`}
                                    onClick={() => remove(t.id)}
                                    onBlur={() => setConfirmId((c) => (c === t.id ? null : c))}
                                >
                                    {confirmId === t.id ? "¿Eliminar? Confirmar" : "Eliminar"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════
//  Editor
// ═════════════════════════════════════════════════════════════════════
function TourEditor({ id, onBack }: { id: string; onBack: () => void }) {
    const [tour, setTour] = useState<TourData | null>(null);
    const [loadError, setLoadError] = useState("");
    const [sceneId, setSceneId] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>("nav");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [panel, setPanel] = useState<"scene" | "tour">("scene");
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [hint, setHint] = useState("");
    const [uploads, setUploads] = useState<UploadJob[]>([]);
    const [confirm, setConfirm] = useState<string | null>(null);
    const [preview, setPreview] = useState(false);
    const [flash, setFlash] = useState("");
    const [reviewUpload, setReviewUpload] = useState(false);
    const [blurJob, setBlurJob] = useState<BlurJob | null>(null);
    const [nadirBg, setNadirBg] = useState("#0a0a0b");
    const [nadirNoBg, setNadirNoBg] = useState(false);
    const [nadirBusy, setNadirBusy] = useState(false);
    const [nadirError, setNadirError] = useState("");

    const tourRef = useRef<TourData | null>(null);
    const editRev = useRef(0);
    const savingRef = useRef(false);
    const saveAgain = useRef(false);
    const viewerRef = useRef<Viewer | null>(null);

    // ── Carga ────────────────────────────────────────────────────────
    useEffect(() => {
        let alive = true;
        tourApi
            .get<{ tour: TourData }>(`/api/admin/tours/${id}`)
            .then(({ data }) => {
                if (!alive) return;
                tourRef.current = data.tour;
                setTour(data.tour);
                setSceneId(data.tour.startScene || data.tour.scenes[0]?.id || null);
            })
            .catch((e) => alive && setLoadError(errorText(e, "No se pudo abrir el tour.")));
        return () => {
            alive = false;
        };
    }, [id]);

    const busy = uploads.some((u) => u.phase === "tiling" || u.phase === "uploading");

    // Aviso al salir con cambios sin guardar o fotos subiendo
    useEffect(() => {
        if (!dirty && !busy) return;
        const onLeave = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", onLeave);
        return () => window.removeEventListener("beforeunload", onLeave);
    }, [dirty, busy]);

    // ── Edición ──────────────────────────────────────────────────────
    const update = useCallback((fn: (t: TourData) => TourData) => {
        if (!tourRef.current) return;
        const next = fn(tourRef.current);
        tourRef.current = next;
        editRev.current++;
        setTour(next);
        setDirty(true);
    }, []);

    const updateScene = useCallback(
        (sid: string, fn: (s: TourScene) => TourScene) =>
            update((t) => ({ ...t, scenes: t.scenes.map((s) => (s.id === sid ? fn(s) : s)) })),
        [update]
    );

    const updateHotspot = useCallback(
        (sid: string, hid: string, patch: Partial<TourHotspot>) =>
            updateScene(sid, (s) => ({ ...s, hotspots: s.hotspots.map((h) => (h.id === hid ? { ...h, ...patch } : h)) })),
        [updateScene]
    );

    // ── Guardado (en cola: nunca dos PUT a la vez) ───────────────────
    const save = useCallback(async () => {
        const t = tourRef.current;
        if (!t) return;
        if (savingRef.current) {
            saveAgain.current = true;
            return;
        }
        savingRef.current = true;
        setSaving(true);
        setSaveError("");
        const rev = editRev.current;
        try {
            const { data } = await tourApi.put<{ tour: TourData }>(`/api/admin/tours/${t.id}`, {
                title: t.title,
                slug: t.slug,
                published: t.published,
                startScene: t.startScene,
                floors: t.floors,
                scenes: t.scenes,
                settings: t.settings,
                updatedAt: t.updatedAt,
            });
            // Si no hubo cambios mientras guardaba, se toma la versión del servidor
            if (editRev.current === rev) {
                tourRef.current = data.tour;
                setTour(data.tour);
                setDirty(false);
            } else if (tourRef.current) {
                // Hubo cambios mientras guardaba: se conservan, con la versión nueva del servidor
                const merged = { ...tourRef.current, updatedAt: data.tour.updatedAt };
                tourRef.current = merged;
                setTour(merged);
            }
        } catch (e) {
            setSaveError(errorText(e, "No se pudo guardar."));
        } finally {
            savingRef.current = false;
            setSaving(false);
            if (saveAgain.current) {
                saveAgain.current = false;
                save();
            }
        }
    }, []);

    // Ctrl/Cmd + S
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                save();
            }
            if (e.key === "Escape") setMode("nav");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [save]);

    // ── Derivados ────────────────────────────────────────────────────
    const scene = useMemo(() => tour?.scenes.find((s) => s.id === sceneId) || null, [tour, sceneId]);
    const selected = useMemo(() => scene?.hotspots.find((h) => h.id === selectedId) || null, [scene, selectedId]);
    const sceneLabel = useMemo(() => {
        const map: Record<string, string> = {};
        tour?.scenes.forEach((s) => {
            const floor = tour.floors.find((f) => f.id === s.floor);
            map[s.id] = tour.floors.length > 1 && floor ? `${s.name} · ${floor.name}` : s.name;
        });
        return map;
    }, [tour]);

    const openScene = useCallback((sid: string) => {
        setSceneId(sid);
        setSelectedId(null);
        setMode("nav");
        setPanel("scene");
    }, []);

    // ── Clic en la foto ──────────────────────────────────────────────
    const onPick = useCallback(
        (yaw: number, pitch: number) => {
            const t = tourRef.current;
            const s = t?.scenes.find((x) => x.id === sceneId);
            if (!t || !s) return;

            if (mode === "move" && selectedId) {
                updateHotspot(s.id, selectedId, { yaw, pitch });
                setMode("nav");
                return;
            }
            if (mode === "link") {
                const other = t.scenes.find((x) => x.id !== s.id);
                if (!other) {
                    setHint("Subí al menos otra escena para poder unirlas.");
                    setMode("nav");
                    return;
                }
                const h: TourHotspot = { id: newId(), type: "link", yaw, pitch, target: other.id, title: "", text: "", url: "" };
                updateScene(s.id, (x) => ({ ...x, hotspots: [...x.hotspots, h] }));
                setSelectedId(h.id);
                setPanel("scene");
                setMode("nav");
                return;
            }
            if (mode === "info") {
                const h: TourHotspot = { id: newId(), type: "info", yaw, pitch, target: "", title: "", text: "", url: "" };
                updateScene(s.id, (x) => ({ ...x, hotspots: [...x.hotspots, h] }));
                setSelectedId(h.id);
                setPanel("scene");
                setMode("nav");
            }
        },
        [mode, sceneId, selectedId, updateHotspot, updateScene]
    );

    // ── Subida de fotos ──────────────────────────────────────────────
    const setJob = (key: string, patch: Partial<UploadJob>) =>
        setUploads((list) => list.map((j) => (j.key === key ? { ...j, ...patch } : j)));

    // Abre la ventana de difuminado y espera la respuesta (null = no subir)
    const askBlurs = (file: File, initial: TourBlur[]) =>
        new Promise<TourBlur[] | null>((resolve) => setBlurJob({ file, initial, resolve }));

    const handleFiles = async (
        fileList: FileList | null,
        floorId: string,
        replaceId?: string,
        opts?: { review?: boolean; initial?: TourBlur[] }
    ) => {
        const t0 = tourRef.current;
        if (!fileList?.length || !t0) return;
        const review = opts?.review ?? reviewUpload;
        const files = Array.from(fileList).slice(0, replaceId ? 1 : 30);
        const jobs: UploadJob[] = files.map((f) => ({ key: newId(), name: f.name, phase: "tiling", progress: 0 }));
        setUploads((list) => [...list.filter((j) => j.phase !== "done"), ...jobs]);

        // De a una: cada foto ocupa bastante memoria mientras se corta
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const job = jobs[i];
            const sid = replaceId || newId();
            try {
                let blurs: TourBlur[] = opts?.initial || [];
                if (review) {
                    const picked = await askBlurs(file, blurs);
                    if (picked === null) {
                        // Cancelada: no se sube nada
                        setUploads((list) => list.filter((j) => j.key !== job.key));
                        continue;
                    }
                    blurs = picked;
                }
                const tiled = await tileEquirect(file, (p) => setJob(job.key, { progress: p * 0.35 }), blurs);
                setJob(job.key, { phase: "uploading" });
                await uploadSceneFiles(t0.id, sid, tiled.files, (p) => setJob(job.key, { progress: 0.35 + p * 0.65 }));
                const version = Math.floor(Date.now() / 1000);

                if (replaceId) {
                    updateScene(sid, (s) => ({ ...s, width: tiled.width, levels: tiled.levels, version, blurs }));
                } else {
                    update((t) => {
                        const scene: TourScene = {
                            id: sid,
                            name: `Escena ${t.scenes.length + 1}`,
                            floor: floorId,
                            width: tiled.width,
                            levels: tiled.levels,
                            version,
                            initialView: { ...DEFAULT_VIEW },
                            hotspots: [],
                            blurs,
                        };
                        return { ...t, scenes: [...t.scenes, scene], startScene: t.startScene || sid };
                    });
                    setSceneId((cur) => cur || sid);
                }
                setJob(job.key, { phase: "done", progress: 1 });
                // Se guarda enseguida: si no, quedan fotos en Cloudinary sin escena
                await save();
            } catch (e) {
                setJob(job.key, { phase: "error", error: errorText(e, "No se pudo subir la foto.") });
            }
        }
    };

    // ── Logo del piso ────────────────────────────────────────────────
    const handleNadir = async (file: File | undefined) => {
        const t = tourRef.current;
        if (!file || !t) return;
        setNadirBusy(true);
        setNadirError("");
        try {
            const png = await makeNadirPng(file, nadirNoBg ? null : nadirBg);
            await uploadNadir(t.id, png);
            update((x) => ({ ...x, settings: { ...x.settings, nadirVersion: Math.floor(Date.now() / 1000) } }));
            await save();
        } catch (e) {
            setNadirError(errorText(e, "No se pudo subir el logo."));
        } finally {
            setNadirBusy(false);
        }
    };

    // ── Acciones de escena ───────────────────────────────────────────
    const deleteScene = (sid: string) => {
        if (confirm !== `scene:${sid}`) {
            setConfirm(`scene:${sid}`);
            return;
        }
        setConfirm(null);
        update((t) => {
            const scenes = t.scenes
                .filter((s) => s.id !== sid)
                // Los pasos que llevaban a esta escena se van con ella
                .map((s) => ({ ...s, hotspots: s.hotspots.filter((h) => !(h.type === "link" && h.target === sid)) }));
            return { ...t, scenes, startScene: t.startScene === sid ? scenes[0]?.id || null : t.startScene };
        });
        setSceneId((cur) => (cur === sid ? tourRef.current?.scenes[0]?.id || null : cur));
        setSelectedId(null);
    };

    const deleteHotspot = (hid: string) => {
        if (!scene) return;
        updateScene(scene.id, (s) => ({ ...s, hotspots: s.hotspots.filter((h) => h.id !== hid) }));
        setSelectedId(null);
    };

    const setInitialView = () => {
        const v = viewerRef.current;
        if (!v || !scene) return;
        const p = v.getPosition();
        updateScene(scene.id, (s) => ({ ...s, initialView: { yaw: p.yaw, pitch: p.pitch, zoom: v.getZoomLevel() } }));
        setHint("Vista inicial guardada para esta escena.");
    };

    // ── Plantas ──────────────────────────────────────────────────────
    const addFloor = () =>
        update((t) => ({ ...t, floors: [...t.floors, { id: newId(6), name: `Planta ${t.floors.length + 1}` }] }));

    const renameFloor = (fid: string, name: string) =>
        update((t) => ({ ...t, floors: t.floors.map((f) => (f.id === fid ? { ...f, name } : f)) }));

    const removeFloor = (fid: string) =>
        update((t) => ({ ...t, floors: t.floors.filter((f) => f.id !== fid) }));

    const moveFloor = (fid: string, dir: -1 | 1) =>
        update((t) => {
            const i = t.floors.findIndex((f) => f.id === fid);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= t.floors.length) return t;
            const floors = [...t.floors];
            [floors[i], floors[j]] = [floors[j], floors[i]];
            return { ...t, floors };
        });

    useEffect(() => {
        if (!hint) return;
        const id = window.setTimeout(() => setHint(""), 3200);
        return () => window.clearTimeout(id);
    }, [hint]);

    const doCopy = async (text: string, label: string) => {
        setFlash((await copy(text)) ? label : "No se pudo copiar");
        window.setTimeout(() => setFlash(""), 1800);
    };

    // ── Render ───────────────────────────────────────────────────────
    if (loadError) {
        return (
            <div className="ta-list">
                <button className="ta-back" onClick={onBack}>← Tours</button>
                <p className="ta-error" role="alert">{loadError}</p>
            </div>
        );
    }
    if (!tour) return <p className="ta-muted ta-pad">Abriendo tour…</p>;

    const status = saving ? "Guardando…" : saveError ? saveError : dirty ? "Cambios sin guardar" : "Guardado";
    const modeHint =
        mode === "link" ? "Tocá el lugar por donde se pasa a la otra escena: una puerta, un pasillo, la escalera."
        : mode === "info" ? "Tocá el punto de la foto que querés destacar."
        : mode === "move" ? "Tocá la nueva ubicación del punto."
        : "";

    return (
        <div className="ta-editor">
            {/* ── Barra superior ── */}
            <header className="ta-bar">
                <button
                    className="ta-back"
                    onClick={() => {
                        if ((dirty || busy) && !window.confirm("Hay cambios sin guardar o fotos subiendo. ¿Salir igual?")) return;
                        onBack();
                    }}
                >
                    ← Tours
                </button>
                <div className="ta-bar__title">
                    <p className="ta-eyebrow"><span>02</span> Editor</p>
                    <h2>{tour.title}</h2>
                </div>
                <span className={`ta-save-state ${saveError ? "is-error" : dirty ? "is-dirty" : ""}`} role="status">
                    {status}
                </span>
                <div className="ta-bar__actions">
                    <button className="ta-text-btn" onClick={() => setPreview(true)} disabled={!tour.scenes.length}>
                        Vista previa
                    </button>
                    <button className="ta-link-btn ta-link-btn--accent" onClick={save} disabled={saving || !dirty}>
                        Guardar <span className="ta-kbd">⌘S</span>
                        <span className="ta-link-btn__line" />
                    </button>
                </div>
            </header>

            <div className="ta-grid">
                {/* ── Plantas y escenas ── */}
                <aside className="ta-side">
                    <div className="ta-side__head">
                        <p className="ta-label">Plantas y escenas</p>
                        <button className="ta-text-btn" onClick={addFloor} disabled={tour.floors.length >= 10}>+ Planta</button>
                    </div>

                    {tour.floors.map((f, fi) => {
                        const scenes = tour.scenes.filter((s) => s.floor === f.id);
                        return (
                            <section key={f.id} className="ta-floor">
                                <div className="ta-floor__head">
                                    <span className="ta-floor__num">{String(fi + 1).padStart(2, "0")}</span>
                                    <input
                                        className="ta-floor__name"
                                        value={f.name}
                                        maxLength={40}
                                        onChange={(e) => renameFloor(f.id, e.target.value)}
                                        aria-label="Nombre de la planta"
                                    />
                                    {tour.floors.length > 1 && (
                                        <span className="ta-floor__tools">
                                            <button className="ta-icon-btn" onClick={() => moveFloor(f.id, -1)} disabled={fi === 0} aria-label="Subir planta">↑</button>
                                            <button className="ta-icon-btn" onClick={() => moveFloor(f.id, 1)} disabled={fi === tour.floors.length - 1} aria-label="Bajar planta">↓</button>
                                            {scenes.length === 0 && (
                                                <button className="ta-icon-btn" onClick={() => removeFloor(f.id)} aria-label="Quitar planta">×</button>
                                            )}
                                        </span>
                                    )}
                                </div>

                                <ul className="ta-scenes">
                                    {scenes.map((s) => (
                                        <li key={s.id}>
                                            <button
                                                className={`ta-scene ${s.id === sceneId ? "is-active" : ""}`}
                                                onClick={() => openScene(s.id)}
                                            >
                                                <img src={sceneAsset(tour.assetBase, tour.id, s, "thumb")} alt="" loading="lazy" />
                                                <span className="ta-scene__name">{s.name}</span>
                                                <span className="ta-scene__meta">
                                                    {tour.startScene === s.id ? "Inicio · " : ""}
                                                    {s.hotspots.length} {s.hotspots.length === 1 ? "punto" : "puntos"}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <label className={`ta-drop ${busy ? "is-disabled" : ""}`}>
                                    <input
                                        type="file"
                                        accept="image/jpeg"
                                        multiple
                                        disabled={busy}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            handleFiles(e.target.files, f.id);
                                            e.target.value = "";
                                        }}
                                    />
                                    <span>+ Fotos 360 en {f.name || "esta planta"}</span>
                                </label>
                            </section>
                        );
                    })}

                    <label className="ta-check ta-check--small">
                        <input type="checkbox" checked={reviewUpload} onChange={(e) => setReviewUpload(e.target.checked)} />
                        <span>Revisar cada foto antes de subir (difuminar caras, patentes…)</span>
                    </label>

                    {uploads.length > 0 && (
                        <ul className="ta-jobs" aria-live="polite">
                            {uploads.map((j) => (
                                <li key={j.key} className={`ta-job is-${j.phase}`}>
                                    <span className="ta-job__name">{j.name}</span>
                                    <span className="ta-job__phase">
                                        {j.phase === "tiling" ? "Cortando" : j.phase === "uploading" ? "Subiendo" : j.phase === "done" ? "Lista" : "Error"}
                                    </span>
                                    <span className="ta-job__bar"><span style={{ transform: `scaleX(${j.progress})` }} /></span>
                                    {j.error && <span className="ta-job__error">{j.error}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* ── Foto 360 ── */}
                <div className="ta-stage-wrap">
                    {scene ? (
                        <>
                            <EditorStage
                                tour={tour}
                                scene={scene}
                                mode={mode}
                                selectedId={selectedId}
                                sceneLabel={sceneLabel}
                                onPick={onPick}
                                onSelect={(hid) => {
                                    setSelectedId(hid);
                                    setPanel("scene");
                                }}
                                onOpenScene={openScene}
                                viewerRef={viewerRef}
                            />
                            <div className="ta-modes" role="toolbar" aria-label="Herramientas">
                                {([
                                    ["nav", "Navegar"],
                                    ["link", "+ Paso"],
                                    ["info", "+ Info"],
                                ] as const).map(([m, label]) => (
                                    <button
                                        key={m}
                                        className={`ta-mode ${mode === m ? "is-active" : ""}`}
                                        onClick={() => setMode(m)}
                                        aria-pressed={mode === m}
                                    >
                                        {label}
                                    </button>
                                ))}
                                <span className="ta-modes__sep" />
                                <button className="ta-mode" onClick={setInitialView}>Fijar vista inicial</button>
                            </div>
                            {(modeHint || hint) && <p className="ta-stage-hint">{modeHint || hint}</p>}
                        </>
                    ) : (
                        <div className="ta-stage-empty">
                            <p className="ta-eyebrow"><span>—</span> Sin escenas</p>
                            <p>Subí las fotos 360 exportadas del X4 (JPG equirectangular) desde la columna de la izquierda.</p>
                        </div>
                    )}
                </div>

                {/* ── Panel derecho ── */}
                <aside className="ta-panel">
                    <div className="ta-tabs" role="tablist">
                        <button role="tab" aria-selected={panel === "scene"} className={panel === "scene" ? "is-active" : ""} onClick={() => setPanel("scene")}>Escena</button>
                        <button role="tab" aria-selected={panel === "tour"} className={panel === "tour" ? "is-active" : ""} onClick={() => setPanel("tour")}>Tour</button>
                    </div>

                    {panel === "scene" && scene && (
                        <div className="ta-panel__body">
                            {selected && (
                                <section className="ta-block ta-block--selected">
                                    <p className="ta-label">{selected.type === "link" ? "Paso a otra escena" : "Punto de información"}</p>

                                    {selected.type === "link" ? (
                                        <>
                                            <label className="ta-field">
                                                <span>Lleva a</span>
                                                <select
                                                    value={selected.target}
                                                    onChange={(e) => updateHotspot(scene.id, selected.id, { target: e.target.value })}
                                                >
                                                    {tour.floors.map((f) => (
                                                        <optgroup key={f.id} label={f.name}>
                                                            {tour.scenes
                                                                .filter((s) => s.floor === f.id && s.id !== scene.id)
                                                                .map((s) => (
                                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                                ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </label>
                                            <button className="ta-text-btn" onClick={() => openScene(selected.target)}>Ir a esa escena →</button>
                                        </>
                                    ) : (
                                        <>
                                            <label className="ta-field">
                                                <span>Título</span>
                                                <input value={selected.title} maxLength={80} onChange={(e) => updateHotspot(scene.id, selected.id, { title: e.target.value })} />
                                            </label>
                                            <label className="ta-field">
                                                <span>Texto</span>
                                                <textarea rows={4} value={selected.text} maxLength={800} onChange={(e) => updateHotspot(scene.id, selected.id, { text: e.target.value })} />
                                            </label>
                                            <label className="ta-field">
                                                <span>Link (opcional, https)</span>
                                                <input
                                                    value={selected.url}
                                                    maxLength={300}
                                                    placeholder="https://"
                                                    onChange={(e) => updateHotspot(scene.id, selected.id, { url: e.target.value })}
                                                />
                                                {selected.url && !/^https:\/\//i.test(selected.url) && <em className="ta-field__warn">Tiene que empezar con https://</em>}
                                            </label>
                                        </>
                                    )}

                                    <div className="ta-row-btns">
                                        <button className="ta-text-btn" onClick={() => setMode("move")}>Reubicar</button>
                                        <button className="ta-text-btn ta-text-btn--danger" onClick={() => deleteHotspot(selected.id)}>Quitar punto</button>
                                    </div>
                                </section>
                            )}

                            <section className="ta-block">
                                <p className="ta-label">Escena</p>
                                <label className="ta-field">
                                    <span>Nombre</span>
                                    <input value={scene.name} maxLength={80} onChange={(e) => updateScene(scene.id, (s) => ({ ...s, name: e.target.value }))} />
                                </label>
                                <label className="ta-field">
                                    <span>Planta</span>
                                    <select value={scene.floor} onChange={(e) => updateScene(scene.id, (s) => ({ ...s, floor: e.target.value }))}>
                                        {tour.floors.map((f) => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="ta-check">
                                    <input
                                        type="checkbox"
                                        checked={tour.startScene === scene.id}
                                        onChange={() => update((t) => ({ ...t, startScene: scene.id }))}
                                        disabled={tour.startScene === scene.id}
                                    />
                                    <span>El tour arranca en esta escena</span>
                                </label>
                                <p className="ta-muted ta-small">
                                    {scene.width} px · {scene.levels.length === 2 ? "alta resolución" : "resolución estándar"}
                                    {scene.blurs?.length ? ` · ${scene.blurs.length} ${scene.blurs.length === 1 ? "zona difuminada" : "zonas difuminadas"}` : ""}
                                </p>
                                <p className="ta-muted ta-small">
                                    Para difuminar o reemplazar se vuelve a elegir el JPG original: el sistema no guarda la foto sin difuminar.
                                </p>

                                <div className="ta-row-btns">
                                    <label className={`ta-text-btn ta-file-btn ${busy ? "is-disabled" : ""}`}>
                                        <input
                                            type="file"
                                            accept="image/jpeg"
                                            disabled={busy}
                                            onChange={(e) => {
                                                handleFiles(e.target.files, scene.floor, scene.id);
                                                e.target.value = "";
                                            }}
                                        />
                                        Reemplazar foto
                                    </label>
                                    <label className={`ta-text-btn ta-file-btn ${busy ? "is-disabled" : ""}`}>
                                        <input
                                            type="file"
                                            accept="image/jpeg"
                                            disabled={busy}
                                            onChange={(e) => {
                                                handleFiles(e.target.files, scene.floor, scene.id, { review: true, initial: scene.blurs || [] });
                                                e.target.value = "";
                                            }}
                                        />
                                        Difuminar zonas
                                    </label>
                                    <button
                                        className={`ta-text-btn ta-text-btn--danger ${confirm === `scene:${scene.id}` ? "is-armed" : ""}`}
                                        onClick={() => deleteScene(scene.id)}
                                        onBlur={() => setConfirm(null)}
                                    >
                                        {confirm === `scene:${scene.id}` ? "¿Eliminar? Confirmar" : "Eliminar escena"}
                                    </button>
                                </div>
                            </section>

                            <section className="ta-block">
                                <p className="ta-label">Puntos en esta escena</p>
                                {scene.hotspots.length === 0 ? (
                                    <p className="ta-muted ta-small">Usá "+ Paso" y "+ Info" sobre la foto.</p>
                                ) : (
                                    <ul className="ta-hlist">
                                        {scene.hotspots.map((h) => (
                                            <li key={h.id}>
                                                <button className={selectedId === h.id ? "is-active" : ""} onClick={() => setSelectedId(h.id)}>
                                                    <span className={`ta-hlist__kind is-${h.type}`}>{h.type === "link" ? "Paso" : "Info"}</span>
                                                    {h.type === "link" ? sceneLabel[h.target] || "Sin destino" : h.title || "Sin título"}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className="ta-muted ta-small">Doble clic sobre un paso en la foto para ir a esa escena.</p>
                            </section>
                        </div>
                    )}

                    {panel === "scene" && !scene && <p className="ta-muted ta-pad">Elegí o subí una escena.</p>}

                    {panel === "tour" && (
                        <div className="ta-panel__body">
                            <section className="ta-block">
                                <p className="ta-label">Datos</p>
                                <label className="ta-field">
                                    <span>Título</span>
                                    <input value={tour.title} maxLength={120} onChange={(e) => update((t) => ({ ...t, title: e.target.value }))} />
                                </label>
                                <label className="ta-field">
                                    <span>Enlace</span>
                                    <span className="ta-slug">
                                        <em>/tour/</em>
                                        <input
                                            value={tour.slug}
                                            maxLength={80}
                                            onChange={(e) =>
                                                update((t) => ({ ...t, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") }))
                                            }
                                        />
                                    </span>
                                </label>
                                <label className="ta-check">
                                    <input
                                        type="checkbox"
                                        checked={!!tour.published}
                                        disabled={!tour.scenes.length}
                                        onChange={(e) => update((t) => ({ ...t, published: e.target.checked }))}
                                    />
                                    <span>Publicado (visible con el link)</span>
                                </label>
                                <div className="ta-row-btns">
                                    {flash ? (
                                        <span className="ta-flash">{flash}</span>
                                    ) : (
                                        <>
                                            <button className="ta-text-btn" onClick={() => doCopy(publicTourUrl(tour.slug), "Link copiado")}>Copiar link</button>
                                            <button className="ta-text-btn" onClick={() => doCopy(embedCodeTsx(tour.slug, tour.title), "TSX copiado")}>Iframe TSX</button>
                                            <button className="ta-text-btn" onClick={() => doCopy(embedCode(tour.slug), "HTML copiado")}>Iframe HTML</button>
                                        </>
                                    )}
                                </div>
                                {dirty && <p className="ta-muted ta-small">Guardá para que el link refleje los cambios.</p>}
                            </section>

                            <section className="ta-block">
                                <p className="ta-label">Recorrido</p>
                                <label className="ta-check">
                                    <input
                                        type="checkbox"
                                        checked={tour.settings.autorotate}
                                        onChange={(e) => update((t) => ({ ...t, settings: { ...t.settings, autorotate: e.target.checked } }))}
                                    />
                                    <span>Giro automático (modo presentación)</span>
                                </label>
                                {tour.settings.autorotate && (
                                    <>
                                        <label className="ta-field">
                                            <span>Velocidad · {tour.settings.autorotateSpeed.toFixed(1)} vueltas/min</span>
                                            <input
                                                type="range" min={0.2} max={5} step={0.1}
                                                value={tour.settings.autorotateSpeed}
                                                onChange={(e) => update((t) => ({ ...t, settings: { ...t.settings, autorotateSpeed: Number(e.target.value) } }))}
                                            />
                                        </label>
                                        <label className="ta-field">
                                            <span>Arranca tras {Math.round(tour.settings.autorotateDelay / 1000)} s sin tocar</span>
                                            <input
                                                type="range" min={1000} max={30000} step={1000}
                                                value={tour.settings.autorotateDelay}
                                                onChange={(e) => update((t) => ({ ...t, settings: { ...t.settings, autorotateDelay: Number(e.target.value) } }))}
                                            />
                                        </label>
                                    </>
                                )}
                                <label className="ta-check">
                                    <input
                                        type="checkbox"
                                        checked={tour.settings.gallery}
                                        onChange={(e) => update((t) => ({ ...t, settings: { ...t.settings, gallery: e.target.checked } }))}
                                    />
                                    <span>Galería de escenas</span>
                                </label>
                                <label className="ta-field ta-field--color">
                                    <span>Color de acento</span>
                                    <input
                                        type="color"
                                        value={tour.settings.accent}
                                        onChange={(e) => update((t) => ({ ...t, settings: { ...t.settings, accent: e.target.value } }))}
                                    />
                                    <code>{tour.settings.accent}</code>
                                </label>
                            </section>

                            <section className="ta-block">
                                <p className="ta-label">Logo en el piso</p>
                                <p className="ta-muted ta-small ta-small--top">Tapa el trípode: se dibuja bajo la cámara en todas las escenas.</p>
                                {tour.settings.nadirVersion > 0 && (
                                    <img className="ta-nadir-preview" src={nadirUrl(tour)} alt="Logo del piso" />
                                )}
                                <label className="ta-check">
                                    <input type="checkbox" checked={nadirNoBg} onChange={(e) => setNadirNoBg(e.target.checked)} />
                                    <span>Sin fondo (el logo llena el círculo)</span>
                                </label>
                                {!nadirNoBg && (
                                    <label className="ta-field ta-field--color">
                                        <span>Fondo del círculo</span>
                                        <input type="color" value={nadirBg} onChange={(e) => setNadirBg(e.target.value)} />
                                        <code>{nadirBg}</code>
                                    </label>
                                )}
                                <div className="ta-row-btns">
                                    <label className={`ta-text-btn ta-file-btn ${nadirBusy ? "is-disabled" : ""}`}>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            disabled={nadirBusy}
                                            onChange={(e) => {
                                                handleNadir(e.target.files?.[0]);
                                                e.target.value = "";
                                            }}
                                        />
                                        {nadirBusy ? "Subiendo…" : tour.settings.nadirVersion > 0 ? "Cambiar logo" : "Subir logo"}
                                    </label>
                                    {tour.settings.nadirVersion > 0 && (
                                        <button
                                            className="ta-text-btn ta-text-btn--danger"
                                            onClick={() => update((t) => ({ ...t, settings: { ...t.settings, nadirVersion: 0 } }))}
                                        >
                                            Quitar logo
                                        </button>
                                    )}
                                </div>
                                {nadirError && <p className="ta-field__warn ta-small">{nadirError}</p>}
                                {tour.settings.nadirVersion > 0 && (
                                    <label className="ta-field ta-field--spaced">
                                        <span>Tamaño · {Math.round(tour.settings.nadirSize)}°</span>
                                        <input
                                            type="range" min={5} max={35} step={1}
                                            value={tour.settings.nadirSize}
                                            onChange={(e) => update((t) => ({ ...t, settings: { ...t.settings, nadirSize: Number(e.target.value) } }))}
                                        />
                                    </label>
                                )}
                            </section>
                        </div>
                    )}
                </aside>
            </div>

            {blurJob && (
                <BlurModal
                    file={blurJob.file}
                    initial={blurJob.initial}
                    onDone={(blurs) => {
                        blurJob.resolve(blurs);
                        setBlurJob(null);
                    }}
                />
            )}

            {preview && (
                <div className="ta-preview" role="dialog" aria-modal="true" aria-label="Vista previa del tour">
                    <TourViewer data={tour} onClose={() => setPreview(false)} />
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════
//  Visor del editor (foto + puntos)
// ═════════════════════════════════════════════════════════════════════
interface StageProps {
    tour: TourData;
    scene: TourScene;
    mode: Mode;
    selectedId: string | null;
    sceneLabel: Record<string, string>;
    onPick: (yaw: number, pitch: number) => void;
    onSelect: (id: string) => void;
    onOpenScene: (id: string) => void;
    viewerRef: MutableRefObject<Viewer | null>;
}

function EditorStage({ tour, scene, mode, selectedId, sceneLabel, onPick, onSelect, onOpenScene, viewerRef }: StageProps) {
    const box = useRef<HTMLDivElement>(null);
    const markersRef = useRef<MarkersPlugin | null>(null);

    // Los listeners del visor leen siempre lo último sin recrearse
    const latest = useRef({ mode, onPick, onSelect, onOpenScene, scene });
    latest.current = { mode, onPick, onSelect, onOpenScene, scene };

    useEffect(() => {
        if (!box.current) return;
        const viewer = new Viewer({
            container: box.current,
            adapter: EquirectangularTilesAdapter,
            plugins: [MarkersPlugin],
            navbar: ["zoom", "fullscreen"],
            loadingTxt: "",
            defaultZoomLvl: 50,
            mousewheelCtrlKey: false,
        });
        const markers = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;

        viewer.addEventListener("click", ({ data }) => {
            const l = latest.current;
            if (data.rightclick || l.mode === "nav") return;
            l.onPick(data.yaw, data.pitch);
        });

        markers.addEventListener("select-marker", ({ marker, doubleClick }) => {
            const l = latest.current;
            const h = l.scene.hotspots.find((x) => x.id === marker.id);
            if (!h) return;
            if (doubleClick && h.type === "link" && h.target) l.onOpenScene(h.target);
            else l.onSelect(h.id);
        });

        viewerRef.current = viewer;
        markersRef.current = markers;
        return () => {
            viewer.destroy();
            viewerRef.current = null;
            markersRef.current = null;
        };
    }, [viewerRef]);

    // Cambio de escena o de foto
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const v = scene.initialView;
        viewer
            .setPanorama(buildPanorama(tour, scene), {
                position: { yaw: v.yaw, pitch: v.pitch },
                zoom: v.zoom,
                transition: false,
                showLoader: true,
            })
            .catch(() => {});
        // initialView no va en las dependencias: fijar la vista no tiene que recargar la foto
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene.id, scene.version, tour.id, tour.assetBase, viewerRef]);

    // Puntos
    useEffect(() => {
        const markers = markersRef.current;
        if (!markers) return;
        const configs: MarkerConfig[] = scene.hotspots.map((h) => {
            const label = h.type === "link" ? sceneLabel[h.target] || "Sin destino" : h.title || "Info";
            const icon = h.type === "link"
                ? '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
                : '<svg viewBox="0 0 24 24"><path d="M12 11v6M12 7.5v.01"/></svg>';
            return {
                id: h.id,
                position: { yaw: h.yaw, pitch: h.pitch },
                html: `<div class="ta-hs ta-hs--${h.type}${h.id === selectedId ? " is-selected" : ""}${h.type === "link" && !h.target ? " is-broken" : ""}">
                         <span class="ta-hs__dot">${icon}</span>
                         <span class="ta-hs__label">${escapeHtml(label)}</span>
                       </div>`,
                size: { width: 40, height: 40 },
                anchor: "center center",
            };
        });
        // Se actualizan solo los puntos que cambian: recrearlos todos con setMarkers
        // deja eventos de transición apuntando a marcadores destruidos (bug de PSV)
        const nextIds = new Set([...configs.map((c) => c.id), "__nadir"]);
        const stale = markers.getMarkers().map((m) => m.id).filter((mid) => !nextIds.has(mid));
        if (stale.length) markers.removeMarkers(stale, false);
        configs.forEach((c) => {
            try {
                markers.getMarker(c.id);
                markers.updateMarker(c, false);
            } catch {
                markers.addMarker(c, false);
            }
        });
        // Logo del piso (también en el editor, para ver cómo tapa el trípode)
        const nadir = nadirMarker(tour);
        const hasNadir = markers.getMarkers().some((m) => m.id === "__nadir");
        if (nadir && hasNadir) markers.updateMarker(nadir, false);
        else if (nadir) markers.addMarker(nadir, false);
        else if (hasNadir) markers.removeMarker("__nadir", false);
        markers.renderMarkers();
    }, [scene.id, scene.hotspots, selectedId, sceneLabel, tour]);

    return <div ref={box} className={`ta-stage ${mode !== "nav" ? "is-picking" : ""}`} />;
}

// ═════════════════════════════════════════════════════════════════════
//  Ventana de difuminado (antes de cortar y subir)
// ═════════════════════════════════════════════════════════════════════
interface BlurModalProps {
    file: File;
    initial: TourBlur[];
    onDone: (blurs: TourBlur[] | null) => void;
}

const BLUR_DEFAULT_RADIUS = 0.12;   // ~7° — una cara a un par de metros

function BlurModal({ file, initial, onDone }: BlurModalProps) {
    const box = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const markersRef = useRef<MarkersPlugin | null>(null);
    const [blurs, setBlurs] = useState<TourBlur[]>(initial);
    const [selected, setSelected] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);

    // Visor con una copia liviana de la foto (todo queda en el navegador)
    useEffect(() => {
        let url = "";
        let alive = true;
        makePreviewUrl(file)
            .then((u) => {
                url = u;
                if (!alive || !box.current) return;
                const viewer = new Viewer({
                    container: box.current,
                    panorama: u,
                    plugins: [MarkersPlugin],
                    navbar: ["zoom"],
                    loadingTxt: "",
                    defaultZoomLvl: 30,
                    mousewheelCtrlKey: false,
                });
                const markers = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;
                viewer.addEventListener("ready", () => setReady(true), { once: true });
                viewer.addEventListener("click", ({ data }) => {
                    if (data.rightclick) return;
                    const b: TourBlur = { id: newId(), yaw: data.yaw, pitch: data.pitch, radius: BLUR_DEFAULT_RADIUS };
                    setBlurs((list) => (list.length >= 20 ? list : [...list, b]));
                    setSelected(b.id);
                });
                markers.addEventListener("select-marker", ({ marker }) => setSelected(marker.id));
                viewerRef.current = viewer;
                markersRef.current = markers;
            })
            .catch((e) => alive && setError(e instanceof Error ? e.message : "No se pudo abrir la foto."));
        return () => {
            alive = false;
            viewerRef.current?.destroy();
            viewerRef.current = null;
            markersRef.current = null;
            if (url) URL.revokeObjectURL(url);
        };
    }, [file]);

    // Zonas dibujadas como círculos reales sobre la esfera
    useEffect(() => {
        const markers = markersRef.current;
        if (!markers) return;
        const ids = new Set(blurs.map((b) => b.id));
        const stale = markers.getMarkers().map((m) => m.id).filter((id) => !ids.has(id));
        if (stale.length) markers.removeMarkers(stale, false);
        blurs.forEach((b) => {
            const config = {
                id: b.id,
                polygon: sphereCircle(b.yaw, b.pitch, b.radius),
                svgStyle: b.id === selected
                    ? { fill: "rgba(212, 255, 63, 0.32)", stroke: "#d4ff3f", strokeWidth: "2px" }
                    : { fill: "rgba(242, 242, 239, 0.22)", stroke: "rgba(242, 242, 239, 0.9)", strokeWidth: "1.5px" },
            };
            try {
                markers.getMarker(b.id);
                markers.updateMarker(config, false);
            } catch {
                markers.addMarker(config, false);
            }
        });
        markers.renderMarkers();
    }, [blurs, selected, ready]);

    const current = blurs.find((b) => b.id === selected) || null;

    return (
        <div className="ta-blur" role="dialog" aria-modal="true" aria-label="Difuminar zonas">
            <div ref={box} className="ta-blur__stage" />

            <aside className="ta-blur__panel">
                <p className="ta-eyebrow"><span>03</span> Difuminar</p>
                <h3 className="ta-blur__title">{file.name}</h3>
                <p className="ta-muted ta-small ta-small--top">
                    Tocá sobre caras, patentes, fotos familiares o cualquier cosa que no deba verse. El difuminado se aplica en tu navegador antes de subir.
                </p>

                {error && <p className="ta-error" role="alert">{error}</p>}

                {blurs.length > 0 && (
                    <ul className="ta-hlist ta-blur__list">
                        {blurs.map((b, i) => (
                            <li key={b.id}>
                                <button className={selected === b.id ? "is-active" : ""} onClick={() => setSelected(b.id)}>
                                    <span className="ta-hlist__kind">{String(i + 1).padStart(2, "0")}</span>
                                    Zona {i + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {current && (
                    <div className="ta-blur__edit">
                        <label className="ta-field">
                            <span>Tamaño · {Math.round((current.radius * 180) / Math.PI)}°</span>
                            <input
                                type="range" min={0.02} max={0.8} step={0.01}
                                value={current.radius}
                                onChange={(e) => {
                                    const radius = Number(e.target.value);
                                    setBlurs((list) => list.map((b) => (b.id === current.id ? { ...b, radius } : b)));
                                }}
                            />
                        </label>
                        <button
                            className="ta-text-btn ta-text-btn--danger"
                            onClick={() => {
                                setBlurs((list) => list.filter((b) => b.id !== current.id));
                                setSelected(null);
                            }}
                        >
                            Quitar zona
                        </button>
                    </div>
                )}

                <div className="ta-blur__actions">
                    <button className="ta-text-btn" onClick={() => onDone(null)}>Cancelar</button>
                    <button className="ta-link-btn ta-link-btn--accent" onClick={() => onDone(blurs)} disabled={!!error}>
                        {blurs.length ? "Difuminar y subir" : "Subir sin difuminar"}
                        <span className="ta-link-btn__line" />
                    </button>
                </div>
            </aside>
        </div>
    );
}