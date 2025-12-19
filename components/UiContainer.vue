<script setup lang="ts">
import { codeToHtml } from "shiki";
import { nextTick, onMounted, ref } from "vue";

const props = defineProps<{
    code?: string;
}>();

const showCode = ref(false);
const elementRef = ref<HTMLElement | null>(null);
const capturedCode = ref("");

onMounted(async () => {
    await nextTick();
    if (elementRef.value && !props.code && !slots.code) {
        // Capture the HTML content from the element slot
        capturedCode.value = formatHTML(elementRef.value.innerHTML);
    }
    displayCode.value = await codeToHtml(props.code || capturedCode.value, {
        lang: "vue",
        themes: {
            light: "github-light",
            dark: "github-dark",
        },
        defaultColor: false,
    });
});

function formatHTML(html: string): string {
    // Remove leading/trailing whitespace
    html = html.trim();

    // Basic formatting: add indentation
    let formatted = "";
    let indent = 0;
    const lines = html.split(/>\s*</);

    lines.forEach((line, index) => {
        if (index > 0) line = "<" + line;
        if (index < lines.length - 1) line = line + ">";

        // Decrease indent for closing tags
        if (line.match(/^<\/\w/)) indent = Math.max(0, indent - 1);

        // Add the line with current indentation
        if (line.trim()) {
            formatted += "  ".repeat(indent) + line.trim() + "\n";
        }

        // Increase indent for opening tags (but not self-closing or closing tags)
        if (line.match(/^<\w[^>]*[^/]>$/)) indent++;
    });

    return formatted.trim();
}

const displayCode = ref<string>("");

const slots = defineSlots<{
    element?: any;
    code?: any;
}>();
</script>

<template>
    <div class="ui-container not-prose">
        <!-- Preview Section -->
        <div ref="elementRef" class="preview-section">
            <slot name="element">
                <!-- Element preview goes here -->
            </slot>
        </div>

        <!-- Code Toggle Button -->
        <div class="toggle-section">
            <button @click="showCode = !showCode" class="toggle-button">
                <svg v-if="!showCode" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{{ showCode ? "Hide Code" : "Show Code" }}</span>
            </button>
        </div>

        <!-- Code Section -->
        <transition name="slide">
            <div v-show="showCode" class="code-section">
                <div class="vp-code-group" v-html="displayCode"></div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.ui-container {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
    margin: 1.5rem 0;
    background: var(--vp-c-bg);
}

.preview-section {
    padding: 1.5rem;
    background-color: var(--vp-c-bg-soft);
    border-bottom: 1px solid var(--vp-c-divider);
}

.toggle-section {
    padding: 0.5rem 1rem;
    background-color: var(--vp-c-bg-soft);
    border-bottom: 1px solid var(--vp-c-divider);
}

.toggle-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--vp-c-text-2);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
}

.toggle-button:hover {
    color: var(--vp-c-text-1);
}

.icon {
    width: 1rem;
    height: 1rem;
}

.code-section {
    overflow: hidden;
    padding: 1rem;
    background: var(--vp-code-block-bg);
}

/* Remove margins from slotted code blocks */
.code-section :deep(div[class*="language-"]) {
    margin: 0 !important;
    border-radius: 0 !important;
}

.code-section :deep(pre) {
    margin: 0 !important;
}

/* Fallback plain code styling */
.vp-code-group {
    overflow-x: auto;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
    max-height: 600px;
}

.slide-enter-from,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
}
</style>
