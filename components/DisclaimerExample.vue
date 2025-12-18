<script setup lang="ts">
import { Disclaimer } from "@dcc-bs/common-ui.bs.js/components";
import { useLocalStorage } from "@dcc-bs/common-ui.bs.js/composables";
import { onMounted } from "vue";
import UiContainer from "./UiContainer.vue";

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

const code = `<script setup lang="ts">
const content = \`${props.contentHtml}\`;
const postfix = \`${props.postfixHtml}\`;
const confirmationText = "${props.confirmationText}";
<\/script>

<template>
    <Disclaimer
        app-name="${props.appName}"
        :content-html="content"
        :postfix-html="postfix"
        :confirmation-text="confirmationText"
        disclaimer-version="1.0.0"
    />
</template>`;
</script>

<template>
    <UiContainer :code="code">
        <template #element>
            <Disclaimer :confirmation-text="props.confirmationText" :app-name="props.appName"
                :content-html="props.contentHtml" :postfix-html="props.postfixHtml"></Disclaimer>
            <UButton varian="solid" icon="i-lucide-eye" @click="showDisclaimer">Show Disclaimer
            </UButton>
        </template>
    </UiContainer>
</template>
