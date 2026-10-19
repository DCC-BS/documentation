<script setup lang="ts">
/**
 * Lightbox for diagrams and images in the docs.
 *
 * Every Mermaid diagram and every image in the page content becomes clickable. A click (or Enter
 * or Space when focused) opens a modal dialog with the diagram at full size: zoom with the mouse
 * wheel, a pinch, a double click or the + and - keys; pan by dragging or with the arrow keys;
 * 0 fits the diagram to the screen again. Esc or a click on the backdrop closes it.
 *
 * The dialog shows a copy of the rendered SVG, so it uses the theme (light or dark) that was
 * active when it was opened.
 */
import { useRoute } from "vitepress";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const TARGETS = ".vp-doc .mermaid, .vp-doc img:not(a img)";
const MIN_SCALE = 0.1;
const MAX_SCALE = 12;
/** Small diagrams are enlarged to fill the screen, but not beyond this factor. */
const MAX_FIT_SCALE = 2.5;
const PADDING = 32;

const dialog = ref<HTMLDialogElement | null>(null);
const viewport = ref<HTMLDivElement | null>(null);
const stage = ref<HTMLDivElement | null>(null);
const label = ref("Diagram");
const scale = ref(1);
const x = ref(0);
const y = ref(0);

let contentWidth = 0;
let contentHeight = 0;
let opener: HTMLElement | null = null;
const pointers = new Map<number, { x: number; y: number }>();
let lastPinchDistance = 0;
let moved = false;

const route = useRoute();

/** Marks diagrams and images as buttons so keyboard and screen reader users can open them. */
function decorateTargets() {
    for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
        if (el.dataset.zoomable) continue;
        el.dataset.zoomable = "true";
        el.tabIndex = 0;
        el.setAttribute("role", "button");
        const name = el instanceof HTMLImageElement && el.alt ? el.alt : "diagram";
        el.setAttribute("aria-label", `Open ${name} enlarged`);
    }
}

function findTarget(event: Event): HTMLElement | null {
    const target = event.target as Element | null;
    return target?.closest?.<HTMLElement>(TARGETS) ?? null;
}

function onDocumentClick(event: MouseEvent) {
    const target = findTarget(event);
    if (!target) return;
    event.preventDefault();
    open(target);
}

function onDocumentKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = findTarget(event);
    if (!target || target !== event.target) return;
    event.preventDefault();
    open(target);
}

function open(source: HTMLElement) {
    if (!dialog.value || !stage.value) return;
    let content: HTMLElement | SVGSVGElement;

    if (source instanceof HTMLImageElement) {
        const img = new Image();
        img.src = source.currentSrc || source.src;
        img.alt = source.alt;
        img.draggable = false;
        contentWidth = source.naturalWidth || source.width;
        contentHeight = source.naturalHeight || source.height;
        label.value = source.alt || "Image";
        content = img;
    } else {
        const svg = source.querySelector("svg");
        if (!svg) return; // Mermaid has not rendered yet
        const clone = svg.cloneNode(true) as SVGSVGElement;
        const box = svg.viewBox?.baseVal;
        const rect = svg.getBoundingClientRect();
        contentWidth = box?.width || rect.width;
        contentHeight = box?.height || rect.height;
        // Mermaid caps the diagram with an inline max-width and width="100%". In the dialog
        // the SVG gets its natural size and the stage transform does the scaling.
        clone.removeAttribute("style");
        clone.setAttribute("width", String(contentWidth));
        clone.setAttribute("height", String(contentHeight));
        clone.removeAttribute("id");
        label.value = "Diagram";
        content = clone;
    }

    content.style.width = `${contentWidth}px`;
    content.style.height = `${contentHeight}px`;
    content.style.maxWidth = "none";
    content.style.display = "block";
    stage.value.replaceChildren(content);
    stage.value.style.width = `${contentWidth}px`;
    stage.value.style.height = `${contentHeight}px`;

    opener = source;
    dialog.value.showModal();
    fit();
}

function close() {
    dialog.value?.close();
}

function onClose() {
    stage.value?.replaceChildren();
    pointers.clear();
    opener?.focus({ preventScroll: true });
    opener = null;
}

function fit() {
    const vp = viewport.value;
    if (!vp || !contentWidth || !contentHeight) return;
    const width = vp.clientWidth;
    const height = vp.clientHeight;
    const s = Math.min(
        (width - PADDING * 2) / contentWidth,
        (height - PADDING * 2) / contentHeight,
        MAX_FIT_SCALE,
    );
    scale.value = Math.max(s, MIN_SCALE);
    x.value = (width - contentWidth * scale.value) / 2;
    y.value = (height - contentHeight * scale.value) / 2;
}

/** Zooms by `factor`, keeping the point (px, py) of the viewport in place. */
function zoomAt(factor: number, px?: number, py?: number) {
    const vp = viewport.value;
    if (!vp) return;
    const cx = px ?? vp.clientWidth / 2;
    const cy = py ?? vp.clientHeight / 2;
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * factor));
    const ratio = next / scale.value;
    x.value = cx - (cx - x.value) * ratio;
    y.value = cy - (cy - y.value) * ratio;
    scale.value = next;
}

function localPoint(event: { clientX: number; clientY: number }) {
    const rect = viewport.value?.getBoundingClientRect();
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
}

function onWheel(event: WheelEvent) {
    event.preventDefault();
    const p = localPoint(event);
    // Trackpads send small deltas (and ctrlKey for pinch), mouse wheels large ones.
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    zoomAt(Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.002)), p.x, p.y);
}

function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    viewport.value?.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, localPoint(event));
    moved = false;
    if (pointers.size === 2) lastPinchDistance = pinchDistance();
}

function onPointerMove(event: PointerEvent) {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const current = localPoint(event);
    pointers.set(event.pointerId, current);

    if (pointers.size === 1) {
        const dx = current.x - previous.x;
        const dy = current.y - previous.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        x.value += dx;
        y.value += dy;
    } else if (pointers.size === 2) {
        moved = true;
        const distance = pinchDistance();
        const [a, b] = [...pointers.values()];
        if (lastPinchDistance > 0) {
            zoomAt(distance / lastPinchDistance, (a.x + b.x) / 2, (a.y + b.y) / 2);
        }
        lastPinchDistance = distance;
    }
}

function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) lastPinchDistance = 0;
}

function pinchDistance() {
    const [a, b] = [...pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
}

function onDoubleClick(event: MouseEvent) {
    if (moved) return;
    const p = localPoint(event);
    zoomAt(2, p.x, p.y);
}

function onDialogKeydown(event: KeyboardEvent) {
    const step = 60;
    const actions: Record<string, () => void> = {
        "+": () => zoomAt(1.25),
        "=": () => zoomAt(1.25),
        "-": () => zoomAt(0.8),
        "0": fit,
        ArrowLeft: () => (x.value += step),
        ArrowRight: () => (x.value -= step),
        ArrowUp: () => (y.value += step),
        ArrowDown: () => (y.value -= step),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
}

/** Light dismiss for browsers without `closedby="any"` (Safari): a click on the backdrop. */
function onDialogClick(event: MouseEvent) {
    if ("closedBy" in HTMLDialogElement.prototype) return;
    if (event.target !== dialog.value) return;
    const rect = dialog.value.getBoundingClientRect();
    const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.bottom &&
        rect.left <= event.clientX &&
        event.clientX <= rect.right;
    if (!inside) close();
}

function onResize() {
    if (dialog.value?.open) fit();
}

onMounted(() => {
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown);
    window.addEventListener("resize", onResize);
    decorateTargets();
});

onBeforeUnmount(() => {
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onDocumentKeydown);
    window.removeEventListener("resize", onResize);
});

watch(
    () => route.path,
    async () => {
        await nextTick();
        decorateTargets();
    },
);
</script>

<template>
    <dialog
        ref="dialog"
        class="diagram-zoom"
        closedby="any"
        :aria-label="`${label}, enlarged`"
        @close="onClose"
        @click="onDialogClick"
        @keydown="onDialogKeydown"
    >
        <div class="diagram-zoom__toolbar" role="toolbar" aria-label="Zoom controls">
            <span class="diagram-zoom__hint">
                Scroll or pinch to zoom, drag to move, double click to zoom in
            </span>
            <button type="button" aria-label="Zoom out" title="Zoom out (-)" @click="zoomAt(0.8)">
                −
            </button>
            <span class="diagram-zoom__level" aria-live="polite">{{ Math.round(scale * 100) }}%</span>
            <button type="button" aria-label="Zoom in" title="Zoom in (+)" @click="zoomAt(1.25)">
                +
            </button>
            <button type="button" title="Fit to screen (0)" @click="fit">Fit</button>
            <button
                type="button"
                class="diagram-zoom__close"
                aria-label="Close"
                title="Close (Esc)"
                autofocus
                @click="close"
            >
                ✕
            </button>
        </div>
        <!-- biome-ignore lint/a11y/noStaticElementInteractions: viewport handles drag-to-pan and wheel-zoom gestures -->
        <div
            ref="viewport"
            class="diagram-zoom__viewport"
            tabindex="-1"
            @wheel="onWheel"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @dblclick="onDoubleClick"
        >
            <div
                ref="stage"
                class="diagram-zoom__stage"
                :style="{ transform: `translate(${x}px, ${y}px) scale(${scale})` }"
            />
        </div>
    </dialog>
</template>

<style>
/* Unscoped: the targets live in the rendered markdown, outside this component. */
.vp-doc .mermaid[data-zoomable],
.vp-doc img[data-zoomable] {
    cursor: zoom-in;
    position: relative;
    border-radius: 8px;
    transition: box-shadow 0.2s;
}

.vp-doc .mermaid[data-zoomable]:hover,
.vp-doc img[data-zoomable]:hover,
.vp-doc .mermaid[data-zoomable]:focus-visible,
.vp-doc img[data-zoomable]:focus-visible {
    box-shadow: 0 0 0 2px var(--vp-c-brand-1);
    outline: none;
}

.vp-doc .mermaid[data-zoomable]::after {
    content: "⤢ Click to enlarge";
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 12px;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
}

.vp-doc .mermaid[data-zoomable]:hover::after,
.vp-doc .mermaid[data-zoomable]:focus-visible::after {
    opacity: 1;
}

@media (hover: none) {
    /* Touch screens have no hover, so the hint stays visible. */
    .vp-doc .mermaid[data-zoomable]::after {
        opacity: 0.85;
    }
}
</style>

<style scoped>
.diagram-zoom {
    width: calc(100vw - 32px);
    height: calc(100dvh - 32px);
    max-width: none;
    max-height: none;
    margin: auto;
    padding: 0;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    overflow: hidden;
    overscroll-behavior: contain;
    flex-direction: column;
}

.diagram-zoom[open] {
    display: flex;
}

.diagram-zoom::backdrop {
    background: rgb(0 0 0 / 0.6);
    backdrop-filter: blur(2px);
    overflow: hidden;
    overscroll-behavior: contain;
}

.diagram-zoom__toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
}

.diagram-zoom__hint {
    flex: 1;
    font-size: 13px;
    color: var(--vp-c-text-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.diagram-zoom__toolbar button {
    min-width: 36px;
    height: 32px;
    padding: 0 10px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
}

.diagram-zoom__toolbar button:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
}

.diagram-zoom__toolbar button:focus-visible {
    outline: 2px solid var(--vp-c-brand-1);
    outline-offset: 1px;
}

.diagram-zoom__level {
    min-width: 48px;
    text-align: center;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--vp-c-text-2);
}

.diagram-zoom__close {
    margin-left: 6px;
}

.diagram-zoom__viewport {
    position: relative;
    flex: 1;
    overflow: hidden;
    cursor: grab;
    touch-action: none;
    user-select: none;
}

.diagram-zoom__viewport:active {
    cursor: grabbing;
}

.diagram-zoom__stage {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    will-change: transform;
}
</style>
