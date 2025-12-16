---
outline: deep
---
<script setup lang="ts">
import { ref } from 'vue';
import DisclaimerExample from '../../components/DisclaimerExample.vue'

const confirmationText = ref(
    "I have read and understood the instructions and confirm that I will use Test App exclusively in compliance with the stated guidelines.",
);
const appName = ref("Test App");

const contentHtml = ref(`<p>
    By using <strong>Test App</strong>, you acknowledge that you have read and understood the following instructions:
</p>`);

const postfixHtml = ref(`<p>
    Thank you for your cooperation.
</p>`);
</script>

<div class="flex flex-col gap-2">
    <input v-model="appName" placeholder="App Name" />
    <textarea
      v-model="confirmationText"
      placeholder="Type to confirm..."/>
    <textarea
      v-model="contentHtml"
      placeholder="Content HTML"
      rows="4"/>
    <textarea
      v-model="postfixHtml"
      placeholder="Postfix HTML"
      rows="3"/>
</div>

```vue-vue
<script setup lang="ts">
const content = `{{ contentHtml }}`;
const postfix = `{{ postfixHtml }}`;
</script>

<template>
<Disclaimer
    confirmation-text="{{ confirmationText }}"
    app-name="{{ appName }}"
    :content-html="content"
    :postfix-html="postfix"
    disclaimer-version="1.0.0"
></Disclaimer>
</template>
```

<DisclaimerExample :appName="appName" :confirmationText="confirmationText" :contentHtml="contentHtml" :postfixHtml="postfixHtml" />
