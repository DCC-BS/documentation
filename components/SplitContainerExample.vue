<script setup lang="ts">
import { SplitContainer } from "@dcc-bs/common-ui.bs.js/components";
import { ref } from "vue";

const headerText = ref("Split Container Header");
const leftContent = ref("This is the left pane content. You can put any content here.");
const rightContent = ref("This is the right pane content. It displays side-by-side on desktop and stacks on mobile.");
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
                <strong>Info:</strong> The SplitContainer component provides a card-like container
                with a header and two side-by-side content areas separated by a border.
                It's responsive and stacks vertically on mobile devices.
            </p>
        </div>

        <div class="flex flex-col gap-2 mb-4">
            <label class="text-sm font-medium">Header Text:</label>
            <input
                v-model="headerText"
                class="border rounded px-3 py-2"
                placeholder="Header text"
            />

            <label class="text-sm font-medium">Left Content:</label>
            <textarea
                v-model="leftContent"
                class="border rounded px-3 py-2"
                rows="3"
                placeholder="Left pane content..."
            />

            <label class="text-sm font-medium">Right Content:</label>
            <textarea
                v-model="rightContent"
                class="border rounded px-3 py-2"
                rows="3"
                placeholder="Right pane content..."
            />
        </div>

        <SplitContainer>
            <template #header>
                <h2 class="text-xl font-bold">{{ headerText }}</h2>
            </template>
            <template #left>
                <div class="p-4">
                    <p>{{ leftContent }}</p>
                </div>
            </template>
            <template #right>
                <div class="p-4">
                    <p>{{ rightContent }}</p>
                </div>
            </template>
        </SplitContainer>
    </div>
</template>

<style scoped>
code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
}

input,
textarea {
    font-family: inherit;
}
</style>
