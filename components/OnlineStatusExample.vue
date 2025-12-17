<script setup lang="ts">
import { OnlineStatus } from "@dcc-bs/common-ui.bs.js/components";
import { ref } from "vue";

const showText = ref(true);
const pollInterval = ref(30000);
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
                <strong>Info:</strong> The OnlineStatus component displays a
                real-time health status indicator that checks whether the
                application is online. It automatically polls the server to
                verify connectivity.
            </p>
        </div>

        <div class="flex flex-col gap-2 mb-4">
            <div class="flex items-center gap-2">
                <input
                    id="show-text"
                    v-model="showText"
                    type="checkbox"
                    class="w-4 h-4"
                />
                <label for="show-text" class="text-sm font-medium">
                    Show Status Text
                </label>
            </div>

            <label class="text-sm font-medium"
                >Poll Interval (milliseconds):</label
            >
            <input
                v-model.number="pollInterval"
                type="number"
                class="border rounded px-3 py-2"
                placeholder="30000"
                min="1000"
                step="1000"
            />
            <p class="text-xs text-gray-600">
                Default: 30000ms (30 seconds). Minimum: 1000ms (1 second).
            </p>
        </div>

        <div class="border rounded-lg p-6 bg-white flex flex-col gap-4">
            <h3 class="text-lg font-semibold">Default (indicator only):</h3>
            <OnlineStatus />

            <h3 class="text-lg font-semibold">With text:</h3>
            <OnlineStatus :show-text="showText" />

            <h3 class="text-lg font-semibold">Custom poll interval:</h3>
            <OnlineStatus :show-text="showText" :poll-interval="pollInterval" />
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

input[type="text"],
input[type="number"] {
    font-family: inherit;
}
</style>
