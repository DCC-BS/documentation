---
outline: deep
---
# Onboarding Restart Button

The `OnboardingRestartButton` component provides a button that allows users to replay the onboarding tour on demand. It resets the tour completion state so the [`FirstRunOrchestrator`](./onboarding.md) re-arms the onboarding flow — without requiring a page reload.

## Features

- **One-Click Restart**: Instantly re-triggers the guided tour
- **Orchestrator Integration**: Works seamlessly with the `FirstRunOrchestrator` cookie-based flow management
- **Responsive Design**: Adapts to mobile and desktop screen sizes
- **i18n Support**: Button label is fully localized
- **No Reload Required**: The tour starts reactively when the completion cookie flips

## Props

This component has no props.

## Usage

### Basic Implementation

Simply place the component wherever you want users to be able to restart the tour:

```vue
<template>
    <OnboardingRestartButton />
</template>
```

### In NavigationBar

The `OnboardingRestartButton` is included by default in the `NavigationBar` component's right section, alongside the `SystemStatus`, `LanguageSelect`, and optionally `AppSwitcher`:

```vue
<template>
    <NavigationBar>
        <template #rightPostItems>
            <SettingsButton :items="settingsItems" />
        </template>
    </NavigationBar>
</template>
```

The default right section renders in this order:

1. `rightPreItems` slot
2. `SystemStatus`
3. `LanguageSelect`
4. **`OnboardingRestartButton`**
5. `AppSwitcher` (only if `otherApps` prop is provided)
6. `rightPostItems` slot

### Standalone Placement

You can also place the button on a dedicated page or settings panel:

```vue
<script lang="ts" setup>
import OnboardingRestartButton from "@dcc-bs/common-ui.bs.js/components/OnboardingRestartButton.vue";
</script>

<template>
    <div class="p-8 flex flex-col gap-4 items-start">
        <h1 class="text-2xl font-bold">Onboarding</h1>
        <p class="text-neutral-600">
            Restart the guided tour at any time using the button below.
        </p>
        <OnboardingRestartButton />
    </div>
</template>
```

## How It Works

1. **Cookie Reset**: When clicked, the component sets the `tour-completed` cookie to `false`.
2. **Reactive Detection**: The `FirstRunOrchestrator` watches this cookie and recomputes the onboarding flow's pending state.
3. **Flow Activation**: Because the onboarding flow is now pending (and no higher-priority flow like Disclaimer or Changelogs is pending), the orchestrator mounts the `Onboarding` component.
4. **Tour Starts**: The `Onboarding` component auto-starts the tour on mount.

::: tip
Unlike calling `start()` directly on the `Onboarding` component, this button goes through the orchestrator — ensuring the proper first-run flow lifecycle is respected.
:::

## Internationalization

The button label uses the `common-ui.tour.restart` translation key.

| Locale | Key                     | Value             |
| ------ | ----------------------- | ----------------- |
| en     | `common-ui.tour.restart` | `Help`           |
| de     | `common-ui.tour.restart` | `Hilfe`          |

You can override this translation in your application's i18n configuration files.

## Related Components

- [Onboarding](./onboarding.md) — The renderless tour driver component
- [NavigationBar](./navigationbar.md) — Includes the `OnboardingRestartButton` by default
- [DisclaimerButton](./disclaimerbutton.md) — Similar pattern for re-triggering the disclaimer flow (now part of `DataBsFooter`)
- [Changelogs](./changelogs.md) — Similar pattern for re-triggering the changelogs flow (now part of `DataBsFooter`)
