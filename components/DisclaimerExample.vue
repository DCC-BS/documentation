<script setup lang="ts">
import { Disclaimer } from "@dcc-bs/common-ui.bs.js/components";
import { useLocalStorage } from "@dcc-bs/common-ui.bs.js/composables";
import { onMounted } from "vue";

const props = defineProps<{
    confirmationText: string;
    appName: string;
    contentHtml?: string;
    postfixHtml?: string;
}>();

const disclaimerAcceptedVersion = useLocalStorage<string | undefined>(
    "disclaimerAccepted",
    "1.0.0",
);

onMounted(() => {
    disclaimerAcceptedVersion.value = "1.0.0";
});

function showDisclaimer() {
    disclaimerAcceptedVersion.value = undefined;
}
</script>

<template>
    <Disclaimer
        :confirmation-text="props.confirmationText"
        :app-name="props.appName"
        :content-html="props.contentHtml"
        :postfix-html="props.postfixHtml"
    ></Disclaimer>

    <UButton varian="solid" icon="i-lucide-eye" @click="showDisclaimer"
        >Show Disclaimer
    </UButton>
</template>

<style>
.disclaimer-content * {
    color-scheme: light;
    color: black;
}

.disclaimer-content h2 {
    border: none;
    padding-top: 0px;
    margin-top: 0px;
}

.disclaimer-content .confirmation input {
    width: 25px;
    height: 25px;
    background-color: transparent;
}
</style>
