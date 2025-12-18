<script setup lang="ts">
import { Changelogs } from "@dcc-bs/common-ui.bs.js/components";
import { ref } from "vue";

function clearChangelogCache() {
    localStorage.removeItem("changelogs-last-read");
    location.reload();
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
                <strong>Note:</strong> The Changelogs component requires a server endpoint at <code>/changelogs</code>
                that returns changelog data. Clear the cache to see the modal again.
            </p>
        </div>

        <UButton
            variant="solid"
            icon="i-lucide-refresh-cw"
            @click="clearChangelogCache"
        >
            Clear Changelog Cache & Reload
        </UButton>

        <Changelogs />
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
