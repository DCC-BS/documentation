<script setup lang="ts">
import {
    Disclaimer,
    DisclaimerButton,
} from "@dcc-bs/common-ui.bs.js/components";
import { computed, onMounted, ref } from "vue";
import UiContainer from "./UiContainer.vue";
import { useCookie } from "../.vitepress/shims/nuxt-imports";

const props = defineProps<{
    confirmationText: string;
    appName: string;
    contentHtml?: string;
    postfixHtml?: string;
}>();

const isDisclaimerOpen = ref(false);

const disclaimerAcceptedVersion = useCookie<string | undefined>(
    "disclaimer-accepted"
);

onMounted(() => {
    disclaimerAcceptedVersion.value = "1.0.0";
});

function showDisclaimer() {
    disclaimerAcceptedVersion.value = undefined;
}

const scriptClose = "</" + "script>";
const code = computed(() => `<script setup lang="ts">
const content = \`${props.contentHtml}\`;
const postfix = \`${props.postfixHtml}\`;
const confirmationText = "${props.confirmationText}";
${scriptClose}

<template>
    <Disclaimer
        app-name="${props.appName}"
        :content-html="content"
        :postfix-html="postfix"
        :confirmation-text="confirmationText"
        disclaimer-version="1.0.0"
    />

    <DisclaimerButton variant="ghost" />
</template>`);
</script>

<template>
    <UiContainer :code="code">
        <template #element>
            <Disclaimer v-if="isDisclaimerOpen" :confirmation-text="props.confirmationText" :app-name="props.appName"
                :content-html="props.contentHtml" :postfix-html="props.postfixHtml" @finished="isDisclaimerOpen = false"></Disclaimer>

            <button @click="isDisclaimerOpen = true">
                Show Disclaimer
            </button>
        </template>
    </UiContainer>
</template>
