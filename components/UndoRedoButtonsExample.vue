<script setup lang="ts">
import { UndoRedoButtons } from "@dcc-bs/common-ui.bs.js/components";
import { ref } from "vue";

const canUndo = ref(false);
const canRedo = ref(false);
const history = ref<string[]>(["Initial state"]);
const currentIndex = ref(0);

function addAction(action: string) {
    // Remove any future history after current index
    history.value = history.value.slice(0, currentIndex.value + 1);
    // Add new action
    history.value.push(action);
    currentIndex.value = history.value.length - 1;
    updateButtons();
}

function handleUndo() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        updateButtons();
    }
}

function handleRedo() {
    if (currentIndex.value < history.value.length - 1) {
        currentIndex.value++;
        updateButtons();
    }
}

function updateButtons() {
    canUndo.value = currentIndex.value > 0;
    canRedo.value = currentIndex.value < history.value.length - 1;
}

function resetHistory() {
    history.value = ["Initial state"];
    currentIndex.value = 0;
    updateButtons();
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
                <strong>Info:</strong> The UndoRedoButtons component provides undo and redo functionality
                with keyboard shortcuts (Ctrl+Z for undo, Ctrl+Y or Ctrl+Shift+Z for redo) and tooltips.
                The buttons are automatically disabled when undo/redo actions are not available.
            </p>
        </div>

        <div class="flex flex-col gap-2 mb-4">
            <h3 class="text-lg font-semibold">Test the Undo/Redo functionality:</h3>
            <div class="flex gap-2">
                <UButton
                    variant="solid"
                    icon="i-lucide-plus"
                    @click="addAction('Action ' + history.length)"
                >
                    Add Action
                </UButton>
                <UButton
                    variant="outline"
                    icon="i-lucide-refresh-cw"
                    @click="resetHistory"
                >
                    Reset History
                </UButton>
            </div>

            <div class="border rounded-lg p-4 bg-gray-50">
                <h4 class="font-semibold mb-2">History:</h4>
                <ul class="space-y-1">
                    <li
                        v-for="(item, index) in history"
                        :key="index"
                        :class="[
                            'text-sm',
                            index === currentIndex
                                ? 'font-bold text-blue-600'
                                : 'text-gray-500',
                        ]"
                    >
                        {{ index === currentIndex ? '→ ' : '  ' }}{{ item }}
                        {{ index === currentIndex ? ' (Current)' : '' }}
                    </li>
                </ul>
            </div>
        </div>

        <div class="border rounded-lg p-6 bg-white">
            <h3 class="text-lg font-semibold mb-4">Undo/Redo Controls:</h3>
            <UndoRedoButtons
                :can-undo="canUndo"
                :can-redo="canRedo"
                @undo="handleUndo"
                @redo="handleRedo"
            />
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
                <strong>Tip:</strong> Try using keyboard shortcuts:
                <code class="bg-yellow-100 px-2 py-1 rounded">Ctrl+Z</code> for undo and
                <code class="bg-yellow-100 px-2 py-1 rounded">Ctrl+Y</code> or
                <code class="bg-yellow-100 px-2 py-1 rounded">Ctrl+Shift+Z</code> for redo.
            </p>
        </div>
    </div>
</template>

<style scoped>
code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
}
</style>
