---
---
skillName: dcc-ui
skillDescription: "Nuxt module of the Kanton Basel-Stadt design system for DCC Basel-Stadt apps: NavigationBar, DataBsFooter, SplitContainer/SplitView, FirstRunOrchestrator, Disclaimer/DisclaimerButton/DisclaimerPage, Changelogs/ChangelogsButton, Onboarding/OnboardingRestartButton, AppSwitcher, SettingsButton, SystemStatus, UndoRedoButtons, the useUserFeedback and useOnboardingBuilder composables, and the BS color palette. Use when building a DCC Basel-Stadt/Basel-Stadt Vue/nuxt frontend or wiring up the common-ui.bs.js module."
---
# User Interface Overview

A comprehensive Nuxt module providing reusable UI components, composables, and utilities built with the official [Kanton Basel-Stadt design system](https://github.com/kanton-basel-stadt/designsystem). This package streamlines development of Basel-Stadt applications by offering a consistent, accessible, and well-documented component library.

See also [GitHub Repository](https://github.com/DCC-BS/common-ui.bs.js).

## Quick Setup

**This package can only be used as a Nuxt module.**

::: tip REMARK
It can be possible to get the components working in a non-Nuxt Vue application, but this is not officially supported and may require additional configuration.

See [Nuxt UI Installation for Vue](https://ui.nuxt.com/docs/getting-started/installation/vue) for how to set up Nuxt UI in a Vue application.

All component can be imported with `import { ComponentName } from '@dcc-bs/common-ui.bs.js/components'` and the composables with `import { composableFunction } from '@dcc-bs/common-ui.bs.js/composables'`.
:::

1. Install the module to your Nuxt application with your preferred package manager:

```sh
# bun
bun add @dcc-bs/common-ui.bs.js

# npm
npm install @dcc-bs/common-ui.bs.js

# pnpm
pnpm add @dcc-bs/common-ui.bs.js

# yarn
yarn add @dcc-bs/common-ui.bs.js
```

2. Add the module to your `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  modules: [
    '@dcc-bs/common-ui.bs.js'
  ]
})
```

3. Add the CSS imports to your main css file:
```css
@import "tailwindcss";
@import "@nuxt/ui";
@import "@dcc-bs/common-ui.bs.js";
```

4. Add the `FirstRunOrchestrator` to your `app.vue` to enable the first-run flow (Disclaimer → Changelogs → Onboarding):

```vue
<script lang="ts" setup>
const builder = useOnboardingBuilder()
    .addPhases<"Phase1" | "Phase2">([
        {
            name: "Phase1",
            onEnter: async () => { /* ... */ },
            onExit: async () => { /* ... */ },
        },
        {
            name: "Phase2",
            onEnter: async () => { /* ... */ },
            onExit: async () => { /* ... */ },
        },
    ])
    .switchPhase("Phase1")
    .addSteps([
        { popover: { title: "Step 1", description: "This is step 1" } },
        { popover: { title: "Step 2", description: "This is step 2" } },
    ])
    .switchPhase("Phase2")
    .addSteps([
        { popover: { title: "Step 3", description: "This is step 3" } },
    ]);
</script>

<template>
    <UApp>
        <FirstRunOrchestrator
            :onboarding-builder="builder"
            :disclaimer="{
                appName: 'My App',
                confirmationText: 'I have read and understood...',
            }"
        />
        <NuxtPage />
    </UApp>
</template>
```

That's it! You can now use common-ui.bs.js in your Nuxt app ✨

## FirstRunOrchestrator

The `FirstRunOrchestrator` component coordinates the three first-run flows — **Disclaimer**, **Changelogs**, and **Onboarding** — ensuring they run in priority order without overlapping. It manages all completion state via cookies, so individual flow components no longer handle persistence themselves.

### How It Works

1. **Disclaimer** (highest priority): Blocks until the user accepts the terms.
2. **Changelogs**: After the disclaimer is accepted, if there are new changelog entries since the user's last visit, the changelog modal is shown.
3. **Onboarding** (lowest priority): After changelogs are dismissed, the guided tour starts (if a builder is provided).

Each flow emits a `finished` event when complete. The orchestrator records the completion cookie, which reactively advances to the next pending flow.

### Props

| Prop                | Type                            | Required | Description                                                                 |
| ------------------- | ------------------------------- | -------- | --------------------------------------------------------------------------- |
| `onboardingBuilder` | `OnboardingStepBuilder<Phases>` | No       | The onboarding tour builder. If omitted, the Onboarding flow is skipped.    |
| `disclaimer`        | `Partial<DisclaimerConfig>`     | No       | Overrides for the runtime config disclaimer defaults (`appName`, `version`, `contentHtml`, `postfixHtml`, `confirmationText`). |

### Completion Cookies

The orchestrator owns all cookie writes. Individual flow components (Disclaimer, Changelogs, Onboarding) only emit `finished` events and do not write cookies themselves.

| Cookie                  | Type      | Default | Purpose                                                             |
| ----------------------- | --------- | ------- | ------------------------------------------------------------------- |
| `disclaimer-accepted`   | `string`  | `""`    | Set to the disclaimer version when the user accepts.                |
| `changelogs-last-read`  | `string`  | `""`    | Set to the latest release version when the user dismisses changelogs. |
| `tour-completed`        | `boolean` | `false` | Set to `true` when the user completes or skips the onboarding tour. |

::: tip
The `ChangelogsButton` and `DisclaimerButton` components can reset these cookies to re-trigger their respective flows on demand.
:::

::: info Cookie Security in Production
In production, all first-run cookies are set with `sameSite: "none"`, `secure: true`, and `partitioned: true`. This means your application **must be served over HTTPS** for the cookies to be stored. In development (`import.meta.dev`), cookies use `sameSite: "lax"` and are not secure or partitioned, so local HTTP workflows are unaffected.
:::

## Module Features

When using this Nuxt module:
- All components are automatically available globally without imports
- First-run orchestration (Disclaimer → Changelogs → Onboarding) via the `FirstRunOrchestrator`
- Internationalization (i18n) integration is automatically configured
- Design system assets are automatically included
- Kanton Basel-Stadt color palette is integrated with Tailwind CSS

## Runtime Configuration

The module exposes runtime configuration options that allow you to disable certain features at runtime. These are available under `runtimeConfig.public.commonUi` in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disableChangelog: false,
        disableDisclaimer: false,
        disableOnboarding: false,
        disclaimer: {
          appName: "",
          version: "1.0.0",
        },
      },
    },
  },
})
```

| Option               | Type      | Default | Description                                                                          |
| -------------------- | --------- | ------- | ------------------------------------------------------------------------------------ |
| `disableChangelog`   | `boolean` | `false` | When set to `true`, the `Changelogs` component will not fetch or display changelogs. |
| `disableDisclaimer`  | `boolean` | `false` | When set to `true`, the `Disclaimer` component modal will not be displayed.          |
| `disableOnboarding`  | `boolean` | `false` | When set to `true`, the `Onboarding` component will not start the guided tour.       |
| `disclaimer.appName` | `string`  | `""`    | Default application name used in the disclaimer flow.                                |
| `disclaimer.version` | `string`  | `"1.0.0"` | Disclaimer version. Changing this forces users to re-accept the disclaimer.        |

::: tip
These options can also be set via environment variables such as `NUXT_PUBLIC_COMMON_UI_DISABLE_CHANGELOG`, `NUXT_PUBLIC_COMMON_UI_DISABLE_DISCLAIMER`, and `NUXT_PUBLIC_COMMON_UI_DISABLE_ONBOARDING`.
:::

## Internationalization

All components are fully localized using [@nuxtjs/i18n](https://i18n.nuxtjs.org/). The library provides default translations, but you can override any of them in your application's i18n configuration.

### Available Translation Keys

You can customize the following translation keys in your application:

```json
{
    "common-ui": {
        "undo": "Undo",
        "redo": "Redo",
        "undo_tooltip": "Undo the last action",
        "redo_tooltip": "Redo the last undone action",
        "changelogs": {
            "title": "What's New",
            "close": "Close"
        },
        "health_status": {
            "offline_title": "System disruption",
            "offline_description": "Some services are unavailable, features may be limited"
        },
        "tour": {
            "skip": "Skip",
            "next": "Next",
            "prev": "Back",
            "finish": "Finish",
            "restart": "Help",
            "progress": "Step {{current}} of {{total}}"
        }
    },
    "disclaimer": {
        "confirmation_text": "I have read and understood...",
        "content": "<h2>Disclaimer and Important Usage..."
    }
}
```

To override these translations, add them to your application's i18n configuration files (e.g., `locales/en.json`, `locales/de.json`, etc.).

## Components
For components see the [Components](./components/) section.

## Composables
For composables see the [Composables](./composables/) section.

## Design System

This library uses the official [Kanton Basel-Stadt design system](https://github.com/kanton-basel-stadt/designsystem) colors, providing a consistent visual identity across all Basel-Stadt applications.

### Available Color Palettes

- **Green**: Primary brand colors (green-50 to green-900)
- **Blue**: Secondary colors (blue-50 to blue-900)  
- **Purple**: Accent colors (purple-50 to purple-900)
- **Red**: Error and warning states (red-50 to red-900)
- **Gray**: Neutral colors (gray-20 to gray-900)
- **Teal**: Supporting colors (teal-50 to teal-900)
- **Yellow**: Highlight colors (yellow-50 to yellow-900)
- **Brown**: Earth tone colors (brown-50 to brown-900)

The color system is fully integrated with Tailwind CSS and can be used with standard Tailwind color classes like `bg-green-500`, `text-blue-600`, etc.

## Additional Resources

- **GitHub Repository**: [DCC-BS/common-ui.bs.js](https://github.com/DCC-BS/common-ui.bs.js)
- **NPM Package**: [@dcc-bs/common-ui.bs.js](https://www.npmjs.com/package/@dcc-bs/common-ui.bs.js)
- **Design System**: [Kanton Basel-Stadt Designsystem](https://github.com/kanton-basel-stadt/designsystem)
- **License**: MIT