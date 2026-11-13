// ─────────────────────────────────────────────────────────────────────
// TourViewer — visor público del tour (/tour/:slug), pensado también
// para incrustarse con iframe en la web del cliente.
// Con la prop `data` funciona como vista previa dentro del dashboard.
// ─────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { Viewer, type PluginConstructor } from "@photo-sphere-viewer/core";
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import { VirtualTourPlugin, type VirtualTourLink, type VirtualTourNode } from "@photo-sphere-viewer/virtual-tour-plugin";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";
import {
    DEFAULT_VIEW,
    buildPanorama,
    escapeHtml,
    nadirMarker,
    safeHttpsUrl,
    sceneAsset,
    tourApi,
    type TourData,
    type TourScene,
} from "./tourShared";
import "./tourViewer.css";

interface Props {
    data?: TourData;
    onClose?: () => void;
}

const ARROW_UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
const STAIRS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4v-4h4v-4h4V8h4"/></svg>';
const INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11v6M12 7.5v.01"/></svg>';

const TourViewer = ({ data, onClose }: Props) => {
    const { slug } = useParams<{ slug: string }>();
    const [tour, setTour] = useState<TourData | null>(data ?? null);
    const [failed, setFailed] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [rotating, setRotating] = useState(false);
    const [railOpen, setRailOpen] = useState(true);
    const [isFull, setIsFull] = useState(false);

    const rootRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const tourPluginRef = useRef<VirtualTourPlugin | null>(null);
    const rotateRef = useRef<AutorotatePlugin | null>(null);

    // ── Datos ────────────────────────────────────────────────────────
    useEffect(() => {
        if (data) {
            setTour(data);
            return;
        }
        if (!slug) {
            setFailed(true);
            return;
        }
        let alive = true;
        tourApi
            .get<{ tour: TourData }>(`/api/tours/${encodeURIComponent(slug)}`)
            .then(({ data: res }) => alive && setTour(res.tour))
            .catch(() => alive && setFailed(true));
        return () => {
            alive = false;
        };
    }, [data, slug]);

    useEffect(() => {
        if (tour && !data) document.title = tour.title;
    }, [tour, data]);

    // ── Visor ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!tour || !boxRef.current || !tour.scenes.length) return;

        const floorIndex = (floorId: string) => Math.max(0, tour.floors.findIndex((f) => f.id === floorId));
        const byId = new Map(tour.scenes.map((s) => [s.id, s]));
        const start = byId.get(tour.startScene || "") || tour.scenes[0];
        const nadir = nadirMarker(tour);   // logo en el piso, igual en todas las escenas

        const nodes: VirtualTourNode[] = tour.scenes.map((s) => ({
            id: s.id,
            // PSV mete el nombre en el HTML del tooltip sin escapar: se escapa acá
            name: escapeHtml(s.name),
            panorama: buildPanorama(tour, s),
            thumbnail: sceneAsset(tour.assetBase, tour.id, s, "thumb"),
            showInGallery: false,
            data: { initialView: s.initialView || DEFAULT_VIEW },
            links: s.hotspots
                .filter((h) => h.type === "link" && byId.has(h.target))
                .map((h) => ({
                    nodeId: h.target,
                    position: { yaw: h.yaw, pitch: h.pitch },
                    data: { floorDelta: floorIndex(byId.get(h.target)!.floor) - floorIndex(s.floor) },
                })),
            markers: [
                ...(nadir ? [nadir] : []),
                ...s.hotspots
                .filter((h) => h.type === "info")
                .map((h) => {
                    const url = safeHttpsUrl(h.url);
                    const title = escapeHtml(h.title || "Info");
                    return {
                        id: h.id,
                        position: { yaw: h.yaw, pitch: h.pitch },
                        html: `<span class="tv-info"><span class="tv-info__dot">${INFO}</span></span>`,
                        size: { width: 36, height: 36 },
                        anchor: "center center",
                        tooltip: { content: title, position: "top center" },
                        content: `<article class="tv-panel">
                                    <h3>${title}</h3>
                                    ${h.text ? `<p>${escapeHtml(h.text).replace(/\n/g, "<br>")}</p>` : ""}
                                    ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Ver más →</a>` : ""}
                                  </article>`,
                    };
                }),
            ],
        }));

        // El nombre del destino va dentro del propio paso (no en el tooltip de PSV,
        // que queda colgado en pantalla al cambiar de escena)
        const arrowElement = (link: VirtualTourLink) => {
            const el = document.createElement("span");
            const delta = (link.data?.floorDelta as number) || 0;
            const target = byId.get(link.nodeId);
            const floor = delta && target ? tour.floors.find((f) => f.id === target.floor) : null;
            const label = escapeHtml(target?.name || "") + (floor ? `<em>${escapeHtml(floor.name)}</em>` : "");
            el.className = `tv-link${delta ? " tv-link--floor" : ""}`;
            el.innerHTML = `<span class="tv-link__ring">${delta ? STAIRS : ARROW_UP}</span><span class="tv-link__label">${label}</span>`;
            if (delta < 0) el.classList.add("is-down");
            return el;
        };

        const s = tour.settings;
        const viewer = new Viewer({
            container: boxRef.current,
            adapter: EquirectangularTilesAdapter,
            navbar: false,
            loadingTxt: "",
            defaultZoomLvl: start.initialView?.zoom ?? 50,
            mousewheelCtrlKey: false,
            plugins: [
                MarkersPlugin,
                [VirtualTourPlugin, {
                    positionMode: "manual",
                    renderMode: "2d",
                    nodes,
                    startNodeId: start.id,
                    preload: true,
                    showLinkTooltip: false,
                    arrowStyle: { element: arrowElement, size: { width: 56, height: 56 } },
                    // Al entrar a cada escena se usa su vista inicial
                    transitionOptions: (toNode: VirtualTourNode) => {
                        const v = (toNode.data?.initialView as TourScene["initialView"]) || DEFAULT_VIEW;
                        return {
                            showLoader: true,
                            effect: "fade",
                            speed: 900,
                            rotation: false,
                            rotateTo: { yaw: v.yaw, pitch: v.pitch },
                            zoomTo: v.zoom,
                        };
                    },
                }],
                ...(s.autorotate
                    ? [[AutorotatePlugin, {
                        autostartDelay: s.autorotateDelay,
                        autostartOnIdle: true,
                        autorotateSpeed: `${s.autorotateSpeed}rpm`,
                        autorotatePitch: 0,
                    }] as [PluginConstructor, unknown]]
                    : []),
            ],
        });

        const vt = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPlugin;
        const ar = s.autorotate ? (viewer.getPlugin(AutorotatePlugin) as AutorotatePlugin) : null;

        vt.addEventListener("node-changed", ({ node }) => setCurrentId(node.id));
        viewer.addEventListener("panorama-loaded", () => setLoading(false));
        ar?.addEventListener("autorotate", ({ autorotateEnabled }) => setRotating(autorotateEnabled));

        viewerRef.current = viewer;
        tourPluginRef.current = vt;
        rotateRef.current = ar;

        return () => {
            viewer.destroy();
            viewerRef.current = null;
            tourPluginRef.current = null;
            rotateRef.current = null;
        };
    }, [tour]);

    // ── Pantalla completa (del contenedor entero, para no perder la UI) ──
    const canFull = typeof document !== "undefined" && !!document.fullscreenEnabled;
    useEffect(() => {
        const onChange = () => setIsFull(document.fullscreenElement === rootRef.current);
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);
    const toggleFull = () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else rootRef.current?.requestFullscreen().catch(() => {});
    };

    // ── Derivados ────────────────────────────────────────────────────
    const current = useMemo(() => tour?.scenes.find((s) => s.id === currentId) || null, [tour, currentId]);
    const currentFloor = current?.floor || tour?.floors[0]?.id || "";
    const floorScenes = useMemo(
        () => (tour ? tour.scenes.filter((s) => s.floor === currentFloor) : []),
        [tour, currentFloor]
    );
    const floorsWithScenes = useMemo(
        () => (tour ? tour.floors.filter((f) => tour.scenes.some((s) => s.floor === f.id)) : []),
        [tour]
    );

    const goTo = (id: string) => {
        if (id !== currentId) tourPluginRef.current?.setCurrentNode(id);
    };

    const goToFloor = (floorId: string) => {
        if (!tour || floorId === currentFloor) return;
        const first = tour.scenes.find((s) => s.id === tour.startScene && s.floor === floorId)
            || tour.scenes.find((s) => s.floor === floorId);
        if (first) goTo(first.id);
    };

    const accentStyle = { "--tv-accent": tour?.settings.accent || "#d4ff3f" } as CSSProperties;

    // ── Render ───────────────────────────────────────────────────────
    if (failed) {
        return (
            <div className="tv-root tv-root--message">
                <p className="tv-kicker">Tour 360</p>
                <h1 className="tv-message">Este recorrido no está disponible.</h1>
            </div>
        );
    }

    return (
        <div ref={rootRef} className={`tv-root ${data ? "tv-root--preview" : ""}`} style={accentStyle}>
            <div ref={boxRef} className="tv-stage" />

            {/* Carga */}
            <div className={`tv-loader ${loading ? "" : "is-hidden"}`} aria-hidden={!loading}>
                <p className="tv-kicker">Tour 360</p>
                <p className="tv-loader__title">{tour?.title || ""}</p>
                <span className="tv-loader__line" />
            </div>

            {/* Título */}
            <header className="tv-head">
                <p className="tv-kicker">{tour?.title}</p>
                <h1 className="tv-scene" key={current?.id}>
                    <span>{current?.name || ""}</span>
                </h1>
            </header>

            {/* Plantas */}
            {floorsWithScenes.length > 1 && (
                <nav className="tv-floors" aria-label="Plantas">
                    {floorsWithScenes.map((f) => (
                        <button
                            key={f.id}
                            className={f.id === currentFloor ? "is-active" : ""}
                            onClick={() => goToFloor(f.id)}
                            aria-current={f.id === currentFloor}
                        >
                            {f.name}
                        </button>
                    ))}
                </nav>
            )}

            {/* Controles */}
            <div className="tv-controls">
                <button onClick={() => viewerRef.current?.zoomIn()} aria-label="Acercar">+</button>
                <button onClick={() => viewerRef.current?.zoomOut()} aria-label="Alejar">−</button>
                {tour?.settings.autorotate && (
                    <button
                        className={rotating ? "is-active" : ""}
                        onClick={() => rotateRef.current?.toggle()}
                        aria-label={rotating ? "Pausar giro" : "Girar"}
                        aria-pressed={rotating}
                    >
                        {rotating ? "❚❚" : "↻"}
                    </button>
                )}
                {tour?.settings.gallery && (
                    <button className={railOpen ? "is-active" : ""} onClick={() => setRailOpen((o) => !o)} aria-label="Escenas" aria-pressed={railOpen}>
                        ▦
                    </button>
                )}
                {canFull && !data && (
                    <button onClick={toggleFull} aria-label={isFull ? "Salir de pantalla completa" : "Pantalla completa"}>
                        {isFull ? "⤡" : "⤢"}
                    </button>
                )}
                {onClose && (
                    <button onClick={onClose} aria-label="Cerrar vista previa">×</button>
                )}
            </div>

            {/* Galería de la planta actual */}
            {tour?.settings.gallery && floorScenes.length > 1 && (
                <nav className={`tv-rail ${railOpen ? "" : "is-closed"}`} aria-label="Escenas">
                    <ol>
                        {floorScenes.map((s, i) => (
                            <li key={s.id}>
                                <button className={s.id === currentId ? "is-active" : ""} onClick={() => goTo(s.id)}>
                                    <img src={sceneAsset(tour.assetBase, tour.id, s, "thumb")} alt="" loading="lazy" />
                                    <span className="tv-rail__num">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="tv-rail__name">{s.name}</span>
                                </button>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}
        </div>
    );
};

export default TourViewer;