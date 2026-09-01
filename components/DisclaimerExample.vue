<script setup lang="ts">
import {
    Disclaimer,
} from "@dcc-bs/common-ui.bs.js/components";
import { computed, onMounted, ref } from "vue";
import { useCookie } from "../.vitepress/shims/nuxt-imports";
import UiContainer from "./UiContainer.vue";

const props = defineProps<{
    confirmationText: string;
    appName: string;
    contentHtml?: string;
    postfixHtml?: string;
}>();

const isDisclaimerOpen = ref(false);

const disclaimerAcceptedVersion = useCookie<string | undefined>(
    "disclaimer-accepted",
);

onMounted(() => {
    disclaimerAcceptedVersion.value = "1.0.0";
});

function showDisclaimer() {
    disclaimerAcceptedVersion.value = undefined;
    isDisclaimerOpen.value = true;
}

const scriptClose = "</" + "script>";
const code = computed(
    () => `<script setup lang="ts">
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
</template>`,
);
</script>

<template>
    <UiContainer :code="code">
        <template #element>
            <Disclaimer v-if="isDisclaimerOpen" :confirmation-text="props.confirmationText" :app-name="props.appName"
                :content-html="props.contentHtml" :postfix-html="props.postfixHtml" @finished="isDisclaimerOpen = false"></Disclaimer>

            <button type="button" @click="showDisclaimer">
                Show Disclaimer
            </button>
        </template>
    </UiContainer>
</template>
