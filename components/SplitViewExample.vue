<script setup lang="ts">
import { SplitView } from "@dcc-bs/common-ui.bs.js/components";
import { ref } from "vue";

const isHorizontal = ref(false);
const aPaneContent = ref("This is Pane A. Drag the resizer to adjust the split.");
const bPaneContent = ref("This is Pane B. The split view supports both horizontal and vertical orientations.");
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
                <strong>Info:</strong> The SplitView component allows you to create a resizable split view layout.
                It supports both horizontal and vertical orientations. Drag the resizer to adjust the split.
            </p>
        </div>

        <div class="flex flex-col gap-2 mb-4">
            <div class="flex items-center gap-2">
                <input
                    id="is-horizontal"
                    v-model="isHorizontal"
                    type="checkbox"
                    class="w-4 h-4"
                />
                <label for="is-horizontal" class="text-sm font-medium">
                    Horizontal Split (unchecked = vertical)
                </label>
            </div>

            <label class="text-sm font-medium">Pane A Content:</label>
            <textarea
                v-model="aPaneContent"
                class="border rounded px-3 py-2"
                rows="3"
                placeholder="Pane A content..."
            />

            <label class="text-sm font-medium">Pane B Content:</label>
            <textarea
                v-model="bPaneContent"
                class="border rounded px-3 py-2"
                rows="3"
                placeholder="Pane B content..."
            />
        </div>

        <div class="border rounded-lg overflow-hidden" style="height: 400px;">
            <SplitView :is-horizontal="isHorizontal">
                <template #a>
                    <div class="p-4 bg-blue-50 h-full overflow-auto">
                        <h3 class="text-lg font-semibold mb-2">Pane A</h3>
                        <p>{{ aPaneContent }}</p>
                    </div>
                </template>
                <template #b>
                    <div class="p-4 bg-green-50 h-full overflow-auto">
                        <h3 class="text-lg font-semibold mb-2">Pane B</h3>
                        <p>{{ bPaneContent }}</p>
                    </div>
                </template>
            </SplitView>
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

textarea {
    font-family: inherit;
}
</style>
