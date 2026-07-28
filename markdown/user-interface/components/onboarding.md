---
outline: deep
---

# Onboarding

The `Onboarding` component provides an interactive guided tour for new users, powered by [driver.js](https://driverjs.com/). It is a **renderless** component — it renders nothing in the DOM but drives an overlay that highlights elements and walks users through your application's features.

Tours are configured declaratively with the [`useOnboardingBuilder`](#the-useonboardingbuilder-composable) composable, which supports phased step groups with `onEnter`/`onExit` lifecycle hooks. The component auto-starts on mount and emits a `finished` event when the user closes or completes the tour. In typical usage, the component is mounted by the `FirstRunOrchestrator`, which sequences it after the Disclaimer and Changelogs flows and persists completion via the `tour-completed` cookie.

## Features

- **Renderless**: Owns no DOM beyond a hidden sentinel; all UI is driven by driver.js
- **Phased Tours**: Group steps into named phases with enter/exit callbacks
- **Event-Based Completion**: Emits a `finished` event when the user closes or completes the tour, allowing the parent (e.g., `FirstRunOrchestrator`) to record completion
- **Locale-Aware**: Recreates the driver when the active locale changes so labels stay translated
- **Auto-Start**: Starts the tour automatically on mount
- **Programmatic Control**: Exposes `start()` and `destroy()` methods via template ref
- **Localized Labels**: Buttons and progress text are translated via i18n
- **Custom Icons**: Lucide icons are injected into the navigation buttons
- **Test-Friendly**: The skip button is stamped with `data-testid="tour-skip"` for E2E selectors

## Props

| Prop      | Type                                | Required | Description                                                |
| --------- | ----------------------------------- | -------- | ---------------------------------------------------------- |
| `builder` | `OnboardingStepBuilder<Phases>`     | Yes      | The step builder created via `useOnboardingBuilder().addPhases(...)` |

## Events

| Event      | Payload                  | Description                                                                                                                    |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `finished` | `{ completed: boolean }` | Emitted when the user closes or completes the tour (fires from the driver.js `onDestroyStarted` hook). The parent component should use this to record completion (e.g., set the `tour-completed` cookie). |

## Exposed Methods

The component exposes the following methods via a template ref:

| Method    | Signature       | Description                                                          |
| --------- | --------------- | ------------------------------------------------------------------- |
| `start`   | `() => void`    | Destroys any active driver, rebuilds it from the builder, and starts the tour. |
| `destroy` | `() => void`    | Tears down the active driver. Does **not** emit `finished` — useful for re-running the tour during development. |

## Persistence

Persistence is managed by the parent component — typically the `FirstRunOrchestrator` — which listens for the `finished` event and writes the `tour-completed` cookie. This means calling `start()` in your own code (e.g., a "Replay tour" button) will not permanently mark the tour as completed; only the orchestrator does that.

Because the cookie is SSR-readable, first-time visitors skip the tour on the server render and avoid a hydration flash.

## Usage

### With the FirstRunOrchestrator (Recommended)

The recommended way to use the `Onboarding` component is through the `FirstRunOrchestrator`, which is placed once in `app.vue` or your default layout. The builder is app-owned (each app defines its own tour); the orchestrator owns when to mount it.

```vue
<script lang="ts" setup>
const builder = useOnboardingBuilder()
    .addPhases<"Phase1" | "Phase2">([
        {
            name: "Phase1",
            onEnter: async () => {
                console.log("enter phase 1");
            },
            onExit: async () => {
                console.log("exit phase 1");
            },
        },
        {
            name: "Phase2",
            onEnter: async () => {
                console.log("enter phase 2");
            },
            onExit: async () => {
                console.log("exit phase 2");
            },
        },
    ])
    .switchPhase("Phase1")
    .addSteps([
        {
            popover: {
                title: "Step 1",
                description: "This is step 1",
            },
        },
        {
            popover: {
                title: "Step 2",
                description: "This is step 2",
            },
        },
    ])
    .switchPhase("Phase2")
    .addSteps([
        {
            popover: {
                title: "Step 3",
                description: "This is step 3",
            },
        },
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

::: tip
The `FirstRunOrchestrator` receives the builder via its `onboarding-builder` prop and manages the `tour-completed` cookie. If the builder is omitted, the onboarding flow is skipped entirely.
:::

### Replay Tour on Demand

The `OnboardingRestartButton` component provides a pre-built button that resets the `tour-completed` cookie and re-triggers the tour via the orchestrator. It is included by default in the `NavigationBar`.

```vue
<template>
    <OnboardingRestartButton />
</template>
```

Alternatively, if you are mounting the `Onboarding` component directly, you can wire a custom button to the `start()` method via a template ref:

```vue
<template>
    <Onboarding ref="onboarding" :builder="builder" />
    <UButton @click="onboarding?.start()">Replay Tour</UButton>
</template>
```

### Targeting Elements

Each step accepts an `element` selector (any value driver.js understands — a CSS selector string, an `HTMLElement`, or a function returning one). When omitted, the step renders as a centered popover without highlighting an element, which is useful for introductory or summary screens.

```ts
.addSteps([
    {
        popover: {
            title: "Welcome",
            description: "Let's take a quick tour of the app.",
        },
    },
    {
        element: "#sidebar",
        popover: { title: "Sidebar", description: "Navigate between sections here." },
    },
])
```

### Lazy Titles and Descriptions

Step `title` and `description` may be provided either as a string or as a function that returns a string (`tOrFunc<string>`). Functions are evaluated when the driver is built, which lets you resolve translations or computed values lazily.

In addition to lazy title and description, the step popover accepts all other driver.js `Popover` properties (such as `onNextClick`, `onPrevClick`, positioning options, etc.). Any navigation hooks you provide are **merged** with the builder's phase-transition hooks rather than overridden — see [Optional Driver Config](#optional-driver-config) below.

```ts
.addSteps([
    {
        element: "#dashboard",
        popover: {
            title: () => t("tour.dashboard.title"),
            description: () => t("tour.dashboard.description"),
        },
    },
])
```

## The `useOnboardingBuilder` Composable

The composable is the only supported way to construct a builder for the `Onboarding` component. It produces a fluent, type-safe builder with the following API:

```ts
const builder = useOnboardingBuilder(config?)
    .addPhases<Phases>(phases)   // returns OnboardingStepBuilder<Phases>
    .switchPhase(phase)          // returns OnboardingStepBuilder<Phases>
    .addSteps(steps)             // returns OnboardingStepBuilder<Phases>
    .buildDriver(config?);       // returns driver.js Driver
```

| Member         | Signature                                                  | Description                                                                |
| -------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| `addPhases`    | `<Phases>(phases: OnboardingPhase<Phases>[]) => Builder`   | Registers all phases and returns a fresh builder typed by the phase union. |
| `switchPhase`  | `(phase: Phases) => Builder`                               | Selects the active phase. Throws if the phase is unknown or already active. |
| `addSteps`     | `(steps: OnboardingStep[]) => Builder`                     | Appends steps to the active phase. Throws if the array is empty.          |
| `currentPhase` | `OnboardingPhase<Phases> \| undefined`                     | The phase that subsequent `addSteps` calls belong to.                      |
| `buildDriver`  | `(config?: Config) => Driver`                              | Builds a driver.js instance from the accumulated steps and config.         |

### Phase Lifecycle Hooks

Each phase accepts optional `onEnter` and `onExit` async callbacks. The builder wires them transparently into the driver.js popover navigation buttons so that:

- **`onExit` of the current phase + `onEnter` of the next phase** fire when the user advances from the last step of one phase into the next.
- **`onExit` of the current phase + `onEnter` of the previous phase** fire when the user navigates backward from the first step of a phase into the previous one.
- **`onEnter` of the initial phase** fires once, when the first step is highlighted.
- **`onExit` of the final phase** fires when the user completes the tour from the last step.

```ts
type OnboardingPhase<Phases> = {
    name: Phases;
    onEnter?: () => Promise<void>;
    onExit?: () => Promise<void>;
};
```

::: tip
Hooks are awaited before the driver advances, so you can perform async setup — for example, navigating to a route, fetching data, or waiting for an element to mount — before the next popover appears.
:::

### Optional Driver Config

You can pass a driver.js [`Config`](https://driverjs.com/docs/configuration) object either to `useOnboardingBuilder(config)` (applied to the underlying driver) or to `buildDriver(config)`. Per-call config is merged with and takes precedence over the composable-level config.

```ts
const builder = useOnboardingBuilder({
    allowClose: false,
    smoothScroll: true,
});
```

::: tip
The builder reserves several configuration slots for itself: button text, progress text, the `onPopoverRender` hook (used to inject Lucide icons), and certain `onNextClick`/`onPrevClick`/`onHighlightStarted` hooks (used to drive phase transitions). Custom hooks you provide via the config or on individual step popovers are **merged**, not overridden — your hook runs first, then the builder's internal phase-transition hook executes.
:::

## Auto-Start Behavior

On mount, the component immediately builds a driver.js instance from the builder and calls `drive()`. When managed by the `FirstRunOrchestrator`, the component is only mounted after the Disclaimer and Changelogs flows are complete, so there is no need for the component to observe the DOM for blocking modals.

::: tip
If you mount the `Onboarding` component directly (without the orchestrator), ensure no blocking modals are open at mount time — driver.js sets `pointer-events: none` on all descendants except the highlighted element.
:::

## Locale Awareness

The component watches the active i18n locale. When the locale changes, the active driver is destroyed and rebuilt with translated button labels, progress text, and step content. If the tour was in progress, you may want to call `start()` again after a locale switch to re-display the popover:

```ts
const { locale } = useI18n();
watch(locale, () => {
    nextTick(() => onboarding.value?.start());
});
```

## Runtime Configuration

The onboarding flow can be disabled globally via the `disableOnboarding` runtime config option:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disableOnboarding: true,
      },
    },
  },
});
```

When set to `true`, the `FirstRunOrchestrator` will never mount the `Onboarding` component.

::: tip
You can also set this via the environment variable `NUXT_PUBLIC_COMMON_UI_DISABLE_ONBOARDING=true`.
:::

## i18n Configuration

Button labels and progress text are read from the `common-ui.tour` namespace. Defaults are provided for `en` and `de`; override them in your application's i18n files to add languages or change wording.

```json
{
    "common-ui": {
        "tour": {
            "skip": "Skip",
            "next": "Next",
            "prev": "Back",
            "finish": "Finish",
            "restart": "Restart tour",
            "progress": "Step \\{\\{current\\}\\} of \\{\\{total\\}\\}"
        }
    }
}
```

| Key                          | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `common-ui.tour.skip`        | Tooltip/aria label for the close button            |
| `common-ui.tour.next`        | Label for the "Next" navigation button             |
| `common-ui.tour.prev`        | Label for the "Back" navigation button             |
| `common-ui.tour.finish`      | Label for the "Next" button on the final step      |
| `common-ui.tour.restart`     | Label for the `OnboardingRestartButton` component  |
| `common-ui.tour.progress`    | Progress text template <span v-pre>`{{current}}` and `{{total}}`</span> are interpolated by driver.js |

## Styling

The driver.js popover is themed via the `tm-tour-popover` class:

- Max width capped at `450px`
- Navigation buttons use `--ui-primary` background and white text
- The finish (done) button uses `--ui-success`

Because driver.js renders the popover outside this component's DOM, these styles are applied globally. To customize the look further, target the `.driver-popover.tm-tour-popover` selector in your application's CSS.

## How It Works

1. **Build**: You construct a builder with `useOnboardingBuilder()` and pass it to the `FirstRunOrchestrator` via the `onboarding-builder` prop.
2. **Sequencing**: The orchestrator checks the `tour-completed` cookie and the pending state of higher-priority flows (Disclaimer, Changelogs). If the cookie is `true` or a higher-priority flow is pending/loading, the `Onboarding` component is not mounted.
3. **Start**: When onboarding becomes the active flow, the orchestrator mounts the `Onboarding` component, which immediately builds a driver.js instance and calls `drive()`.
4. **Navigation**: As the user moves between steps, the builder-injected `onNextClick`/`onPrevClick` hooks fire the appropriate phase `onEnter`/`onExit` callbacks before advancing. Any custom hooks you supplied on individual steps or via the driver config are merged and run alongside the builder's hooks. When the user completes the tour from the final step, the last active phase's `onExit` callback is also invoked.
5. **Completion**: When the user closes or finishes the tour, `onDestroyStarted` emits the `finished` event. The orchestrator receives it and sets `tour-completed` to `true`.
6. **Cleanup**: On unmount, any active driver is destroyed.

## Cookie Reference

| Name              | Type      | Default | Purpose                                                          |
| ----------------- | --------- | ------- | ---------------------------------------------------------------- |
| `tour-completed`  | `boolean` | `false` | Set to `true` when the user completes or skips the tour. Written by the `FirstRunOrchestrator`. SSR-readable. |