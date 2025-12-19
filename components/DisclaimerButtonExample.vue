<script setup lang="ts">
import { DisclaimerButton } from "@dcc-bs/common-ui.bs.js/components";
import { useLocalStorage } from "@dcc-bs/common-ui.bs.js/composables";

const disclaimerAcceptedVersion = useLocalStorage<string | undefined>(
    "disclaimerAccepted",
    undefined,
);

function resetDisclaimer() {
    disclaimerAcceptedVersion.value = undefined;
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
                <strong>Info:</strong> This button allows users to view the disclaimer again after accepting it.
                The button triggers the same disclaimer modal shown on first visit.
            </p>
        </div>

        <div class="flex gap-2">
            <DisclaimerButton />

            <UButton variant="outline" icon="i-lucide-refresh-cw" @click="resetDisclaimer">
                Reset Disclaimer State
            </UButton>
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
