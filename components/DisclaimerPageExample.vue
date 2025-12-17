<script setup lang="ts">
import { DisclaimerPage } from "@dcc-bs/common-ui.bs.js/components";
import { ref } from "vue";

const appName = ref("Example Application");
const confirmationText = ref(
    "I have read and understood the instructions and confirm that I will use this application exclusively in compliance with the stated guidelines.",
);
const contentHtml = ref(`<p>
    By using <strong>Example Application</strong>, you acknowledge that you have read and understood the following instructions:
</p>
<ul>
    <li>This is a demonstration of the DisclaimerPage component</li>
    <li>The component displays a full-page disclaimer view</li>
    <li>Users must accept before proceeding</li>
</ul>`);
const postfixHtml = ref(`<p>
    Thank you for your cooperation.
</p>`);
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
                <strong>Info:</strong> The DisclaimerPage component provides a full-page disclaimer view.
                This is typically used as a standalone page that users see before accessing the application.
            </p>
        </div>

        <div class="flex flex-col gap-2 mb-4">
            <label class="text-sm font-medium">App Name:</label>
            <input
                v-model="appName"
                class="border rounded px-3 py-2"
                placeholder="App Name"
            />

            <label class="text-sm font-medium">Confirmation Text:</label>
            <textarea
                v-model="confirmationText"
                class="border rounded px-3 py-2"
                rows="3"
                placeholder="Confirmation text..."
            />

            <label class="text-sm font-medium">Content HTML:</label>
            <textarea
                v-model="contentHtml"
                class="border rounded px-3 py-2"
                rows="5"
                placeholder="Content HTML..."
            />

            <label class="text-sm font-medium">Postfix HTML:</label>
            <textarea
                v-model="postfixHtml"
                class="border rounded px-3 py-2"
                rows="3"
                placeholder="Postfix HTML..."
            />
        </div>

        <div class="border rounded-lg overflow-hidden">
            <DisclaimerPage
                :app-name="appName"
                :confirmation-text="confirmationText"
                :content-html="contentHtml"
                :postfix-html="postfixHtml"
                disclaimer-version="1.0.0"
            />
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

input,
textarea {
    font-family: inherit;
}
</style>
