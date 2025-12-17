<script setup lang="ts">
import { NavigationBar } from "@dcc-bs/common-ui.bs.js/components";
import { ref } from "vue";

const showCenterContent = ref(true);
const showRightContent = ref(true);
const centerText = ref("Navigation Center Content");
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
                <strong>Info:</strong> The NavigationBar component provides a responsive navigation bar
                with language switching, disclaimer button, and customizable content areas.
                It integrates with Nuxt i18n for internationalization.
            </p>
        </div>

        <div class="flex flex-col gap-2 mb-4">
            <div class="flex items-center gap-2">
                <input
                    id="show-center"
                    v-model="showCenterContent"
                    type="checkbox"
                    class="w-4 h-4"
                />
                <label for="show-center" class="text-sm font-medium">
                    Show Center Content
                </label>
            </div>

            <div class="flex items-center gap-2">
                <input
                    id="show-right"
                    v-model="showRightContent"
                    type="checkbox"
                    class="w-4 h-4"
                />
                <label for="show-right" class="text-sm font-medium">
                    Show Right Content
                </label>
            </div>

            <label class="text-sm font-medium">Center Text:</label>
            <input
                v-model="centerText"
                class="border rounded px-3 py-2"
                placeholder="Center content text"
            />
        </div>

        <div class="border rounded-lg overflow-hidden">
            <NavigationBar>
                <template v-if="showCenterContent" #center>
                    <div class="text-sm font-medium">
                        {{ centerText }}
                    </div>
                </template>
                <template v-if="showRightContent" #right>
                    <UButton variant="ghost" icon="i-lucide-settings" size="sm">
                        Settings
                    </UButton>
                </template>
            </NavigationBar>
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

input[type="text"] {
    font-family: inherit;
}
</style>
