---
outline: deep
skillParent: dcc-ui
skillName: disclaimer
skillDescription: "Modal Disclaimer Vue component that gatekeeps app access until the user accepts terms; emits a finished event and is designed to be orchestrated by FirstRunOrchestrator. Version and completion are tracked via cookies. Can be disabled via runtime config. Use when adding a one-time terms/usage-guidelines acceptance gate (not the re-open DisclaimerButton or full-page DisclaimerPage)."
---
<script setup lang="ts">
import { ref } from 'vue';
import DisclaimerExample from '../../../components/DisclaimerExample.vue';

const confirmationText = ref(
    "I have read and understood the instructions and confirm that I will use Test App exclusively in compliance with the stated guidelines.",
);
const appName = ref("Test App");

const contentHtml = ref(`<p>
    By using <strong>Test App</strong>, you acknowledge that you have read and understood the following instructions:
</p>
<ul>
    <li>This application is for authorized use only</li>
    <li>Your data will be processed according to our privacy policy</li>
    <li>You must comply with all applicable laws and regulations</li>
</ul>`);

const postfixHtml = ref(`<p>
    Thank you for your cooperation.
</p>`);
</script>

# Disclaimer

The `Disclaimer` component displays a modal disclaimer that users must accept before using the application. It is designed to be used within the `FirstRunOrchestrator` component, which manages when to show the disclaimer based on cookie state, runtime configuration, and the priority of other first-run flows (changelogs, onboarding).

## Features

- **Modal Display**: Full-screen modal that blocks app access until accepted
- **HTML Content Support**: Rich text formatting with custom HTML
- **Customizable Confirmation**: Configurable acceptance checkbox and text
- **Accessibility**: Keyboard accessible with proper focus management
- **Responsive Design**: Works seamlessly on all device sizes
- **Event-Driven**: Emits a `finished` event when the user accepts, allowing the parent (e.g., `FirstRunOrchestrator`) to manage completion state
- **Runtime Configuration**: Version, app name, and disabling are configurable via runtime config

## Props

| Prop                | Type     | Required | Description                                                           |
| ------------------- | -------- | -------- | --------------------------------------------------------------------- |
| `appName`           | `string` | Yes      | The name of your application, will be used for the default `contentHtml` and `confirmationText` when these props are not set.                                          |
| `confirmationText`  | `string` | No       | Text users must confirm by checking the box. When not set, the translation key `disclaimer.confirmation_text` will be used with `{appName}` as a placeholder.                           |
| `contentHtml`       | `string` | No       | Main HTML content for the disclaimer body. When not set, the translation key `disclaimer.content` will be used.                             |
| `postfixHtml`       | `string` | No       | HTML content displayed after main content (e.g., contact info)        |

## Events

| Event      | Payload                     | Description                                                                                          |
| ---------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `finished` | `{ completed: boolean }`    | Emitted when the user checks the confirmation checkbox. The orchestrator listens for this event to set the completion cookie and unmount the component. |

## Configuration

The Disclaimer is configured through Nuxt's runtime config and can be disabled entirely or have its defaults set without passing props. This is useful for environments where the disclaimer is not needed (e.g., internal tools, testing).

### Runtime Config

Set the `disclaimer` options and `disableDisclaimer` flag in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disableDisclaimer: false,
        disclaimer: {
          appName: "My App",
          version: "1.0.0",
        },
      },
    },
  },
});
```

| Option                        | Type                 | Default     | Description                                                                 |
| ----------------------------- | -------------------- | ----------- | --------------------------------------------------------------------------- |
| `disableDisclaimer`           | `boolean` \| `string` | `false`     | When `true` (or `"true"`), the disclaimer flow is skipped entirely by the orchestrator. |
| `disclaimer.appName`          | `string`             | `""`        | Default application name passed to the Disclaimer component.               |
| `disclaimer.version`          | `string`             | `"1.0.0"`   | Version identifier — changing this re-shows the disclaimer to all users.    |

::: tip
You can also set `disableDisclaimer` to the string `"true"` (e.g., via environment variables) and it will be treated the same as the boolean `true`.
:::

## Usage

### With FirstRunOrchestrator (Recommended)

The `Disclaimer` component is designed to be orchestrated by `FirstRunOrchestrator`, which manages the sequencing of first-run flows (disclaimer → changelogs → onboarding) and handles completion state via cookies. Place the orchestrator once in `app.vue` so it is available on every page:

```vue
<script lang="ts" setup>
const builder = useOnboardingBuilder()
    .addPhases<"Phase1">([
        {
            name: "Phase1",
            onEnter: async () => {},
            onExit: async () => {},
        },
    ])
    .switchPhase("Phase1")
    .addSteps([
        { popover: { title: "Step 1", description: "This is step 1" } },
    ]);
</script>

<template>
    <UApp>
        <FirstRunOrchestrator
            :onboarding-builder="builder"
            :disclaimer="{
                appName: 'Test App',
                confirmationText:
                    'I have read and understood the instructions and confirm that I will use Test App exclusively in compliance with the stated guidelines.',
            }"
        />
        <NuxtPage />
    </UApp>
</template>
```

The `disclaimer` prop on `FirstRunOrchestrator` provides overrides for the runtime config defaults. The orchestrator compares the `disclaimer-accepted` cookie against the configured version to determine whether the disclaimer should be shown.

### Using Default Translations

If `confirmationText` and `contentHtml` are not provided, the component will automatically use the translation keys from your i18n configuration:

```vue
<template>
    <!-- Uses translations: disclaimer.confirmation_text and disclaimer.content -->
    <Disclaimer app-name="My Application" />
</template>
```

The default translations used are:
- **`disclaimer.confirmation_text`**: Contains the confirmation text with `{appName}` as a placeholder
- **`disclaimer.content`**: Contains the full HTML disclaimer content

You can customize these translations in your application's i18n files (e.g., `locales/en.json`, `locales/de.json`). See the [Internationalization section](../#internationalization) for the default translation keys.

## Interactive Example

Customize the disclaimer content and see changes in real-time, try to leave properties empty to see default behavior:

<div class="flex flex-col gap-2 mb-6 p-4 rounded-lg border">
  <label class="text-sm font-semibold">App Name:</label>
  <input v-model="appName" placeholder="App Name" class="border rounded px-3 py-2" />
  
  <label class="text-sm font-semibold">Confirmation Text:</label>
  <textarea
    v-model="confirmationText"
    placeholder="Type to confirm..."
    rows="3"
    class="border rounded px-3 py-2"
  />
  
  <label class="text-sm font-semibold">Content HTML:</label>
  <textarea
    v-model="contentHtml"
    placeholder="Content HTML"
    rows="6"
    class="border rounded px-3 py-2 font-mono text-sm"
  />
  
  <label class="text-sm font-semibold">Postfix HTML:</label>
  <textarea
    v-model="postfixHtml"
    placeholder="Postfix HTML"
    rows="3"
    class="border rounded px-3 py-2 font-mono text-sm"
  />
</div>

<DisclaimerExample :appName="appName" :confirmationText="confirmationText" :contentHtml="contentHtml" :postfixHtml="postfixHtml" />

## Version Management

The disclaimer version is configured via runtime config (`disclaimer.version`). When the version changes, users will need to accept the disclaimer again.

### Initial Version

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disclaimer: {
          appName: "My App",
          version: "1.0.0",
        },
      },
    },
  },
});
```

### Updating the Disclaimer

When you update your terms, increment the version in your runtime config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disclaimer: {
          appName: "My App",
          version: "2.0.0", // Users will need to accept again
        },
      },
    },
  },
});
```

### Versioning Strategy

- **Major (1.0.0 → 2.0.0)**: Significant legal changes requiring user re-acceptance
- **Minor (1.0.0 → 1.1.0)**: Additional terms or clarifications
- **Patch (1.0.0 → 1.0.1)**: Minor wording improvements or typo fixes

## How It Works

When used with `FirstRunOrchestrator`:

1. **Orchestrator Check**: The `FirstRunOrchestrator` reads `disableDisclaimer` from runtime config; if enabled, the disclaimer flow is skipped
2. **Version Check**: The orchestrator compares the `disclaimer-accepted` cookie with the configured `disclaimer.version`
3. **Display Logic**:
    - Shows the disclaimer if no version is stored (first visit) or the stored version differs from the current version
    - Skips the disclaimer if the user has accepted the current version
4. **User Acceptance**:
    - User must check the confirmation checkbox
    - The component emits the `finished` event
    - The orchestrator sets the `disclaimer-accepted` cookie to the current version
    - The disclaimer is unmounted and the next pending flow (if any) is shown

## Cookie Structure

```typescript
// Cookie name: 'disclaimer-accepted'
// Value: Version string (e.g., "1.0.0")

const disclaimerAccepted = useCookie<string>("disclaimer-accepted");
disclaimerAccepted.value; // "1.0.0"
```