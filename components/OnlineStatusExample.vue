<script setup lang="ts">
import { ref } from "vue";
import UiContainer from "./UiContainer.vue";
import { OnlineStatus } from "@dcc-bs/common-ui.bs.js/components";

const showText = ref(true);
const pollInterval = ref(500);
const isOnline = ref(true);

function isOnlineCheck() {
    return Promise.resolve(isOnline.value);
}

const code = `<template>
  <div>
    <OnlineStatus :show-text="true" :poll-interval="30000" />
  </div>
</template>`;
</script>

<template>
    <UiContainer :code="code">
        <template #element>
            <div class="flex flex-col gap-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-sm text-blue-800">
                        <strong>Info:</strong> The OnlineStatus component
                        displays a real-time health status indicator that checks
                        whether the application is online. It automatically
                        polls the server to verify connectivity.
                    </p>
                </div>
                <div class="flex flex-col gap-3 p-4 border rounded-lg">
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
                    <div class="flex items-center gap-2">
                        <input
                            id="is-online"
                            v-model="isOnline"
                            type="checkbox"
                            class="w-4 h-4"
                        />
                        <label for="is-online" class="text-sm font-medium">
                            Simulate Online Status
                        </label>
                    </div>
                </div>
                <div class="border rounded-lg p-6 flex flex-col gap-4">
                    <OnlineStatus
                        :show-text="showText"
                        :isOnlineCheckFunction="isOnlineCheck"
                        :poll-interval="pollInterval"
                    />
                </div>
            </div>
        </template>
    </UiContainer>
</template>
