---
outline: deep
---

# Onboarding

The `Onboarding` component provides an interactive guided tour for new users, powered by [driver.js](https://driverjs.com/). It is a **renderless** component — it renders nothing in the DOM but drives an overlay that highlights elements and walks users through your application's features.

Tours are configured declaratively with the [`useOnboardingBuilder`](#the-useonboardingbuilder-composable) composable, which supports phased step groups with `onEnter`/`onExit` lifecycle hooks. Persistence, locale-aware restarts, and auto-start after the disclaimer modal are handled automatically.

## Features

- **Renderless**: Owns no DOM beyond a hidden sentinel; all UI is driven by driver.js
- **Phased Tours**: Group steps into named phases with enter/exit callbacks
- **Cookie Persistence**: First-time users skip the tour automatically once completed
- **Locale-Aware**: Recreates the driver when the active locale changes so labels stay translated
- **Auto-Start**: Waits for the `Disclaimer` modal to be dismissed before starting, so the modal remains clickable
- **Programmatic Control**: Exposes `start()` and `destroy()` methods via template ref
- **Localized Labels**: Buttons and progress text are translated via i18n
- **Custom Icons**: Lucide icons are injected into the navigation buttons
- **Test-Friendly**: The skip button is stamped with `data-testid="tour-skip"` for E2E selectors

## Props

| Prop      | Type                                | Required | Description                                                |
| --------- | ----------------------------------- | -------- | ---------------------------------------------------------- |
| `builder` | `OnboardingStepBuilder<Phases>`     | Yes      | The step builder created via `useOnboardingBuilder().addPhases(...)` |

## Exposed Methods

The component exposes the following methods via a template ref:

| Method    | Signature       | Description                                                          |
| --------- | --------------- | ------------------------------------------------------------------- |
| `start`   | `() => void`    | Destroys any active driver, rebuilds it from the builder, and starts the tour. |
| `destroy` | `() => void`    | Tears down the active driver without recording completion (useful for re-running the tour during development). |

## Persistence

The component uses a cookie named `tour-completed` (default `false`) to remember that a user has finished the tour. Completion is recorded in the driver.js `onDestroyStarted` hook, which fires when the user explicitly closes or completes the tour — **not** when `destroy()` is called programmatically. This means calling `start()` in your own code (e.g., a "Replay tour" button) will not permanently mark the tour as completed.

Because the cookie is SSR-readable, first-time visitors skip the tour on the server render and avoid a hydration flash.

## Usage

### Basic Implementation

The tour is defined in three steps: declare phases, switch to a phase, and add steps to it.

```vue
<script lang="ts" setup>
import Onboarding from "@dcc-bs/common-ui.bs.js/components/Onboarding.vue";
import { useOnboardingBuilder } from "@dcc-bs/common-ui.bs.js/composables";

const onboarding = ref<InstanceType<typeof Onboarding>>();

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

onMounted(() => {
    onboarding.value?.start();
});
</script>

<template>
    <Onboarding ref="onboarding" :builder="builder" />
</template>
```

### Replay Tour on Demand

Because the cookie is only set when the user closes or finishes the tour, you can wire a "Replay tour" button to `start()`:

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

On mount, the component calls `beginTourWhenReady()`, which:

1. **Returns immediately** if the `tour-completed` cookie is `true`.
2. **Starts the tour immediately** if no element matching `.disclaimer-modal` is present in the DOM.
3. **Observes the DOM** otherwise, and starts the tour as soon as the disclaimer modal is removed from the document.

This coordination is necessary because driver.js sets `pointer-events: none` on every descendant except the highlighted element while active. Starting the tour while the disclaimer modal is open would render the modal unclickable.

::: tip
If your application does not use the `Disclaimer` component, the tour starts on the next tick after mount with no delay.
:::

## Locale Awareness

The component watches the active i18n locale. When the locale changes, the active driver is destroyed and rebuilt with translated button labels, progress text, and step content. If the tour was in progress, you may want to call `start()` again after a locale switch to re-display the popover:

```ts
const { locale } = useI18n();
watch(locale, () => {
    nextTick(() => onboarding.value?.start());
});
```

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
| `common-ui.tour.progress`    | Progress text template <span v-pre>`{{current}}` and `{{total}}`</span> are interpolated by driver.js |

## Styling

The driver.js popover is themed via the `tm-tour-popover` class:

- Max width capped at `450px`
- Navigation buttons use `--ui-primary` background and white text
- The finish (done) button uses `--ui-success`

Because driver.js renders the popover outside this component's DOM, these styles are applied globally. To customize the look further, target the `.driver-popover.tm-tour-popover` selector in your application's CSS.

## How It Works

1. **Build**: You construct a builder with `useOnboardingBuilder()` and pass it to the component via the `builder` prop.
2. **Mount**: The component checks the `tour-completed` cookie. If `true`, it does nothing.
3. **Readiness**: If a `Disclaimer` modal is present, a `MutationObserver` waits for it to be removed.
4. **Start**: A driver.js instance is built from the builder and `drive()` is called.
5. **Navigation**: As the user moves between steps, the builder-injected `onNextClick`/`onPrevClick` hooks fire the appropriate phase `onEnter`/`onExit` callbacks before advancing. Any custom hooks you supplied on individual steps or via the driver config are merged and run alongside the builder's hooks. When the user completes the tour from the final step, the last active phase's `onExit` callback is also invoked.
6. **Completion**: When the user closes or finishes the tour, `onDestroyStarted` sets `tour-completed` to `true` and the driver is destroyed.
7. **Cleanup**: On unmount, the observer is disconnected and any active driver is destroyed.

## Cookie Reference

| Name              | Type      | Default | Purpose                                                          |
| ----------------- | --------- | ------- | ---------------------------------------------------------------- |
| `tour-completed`  | `boolean` | `false` | Set to `true` when the user completes or skips the tour. SSR-readable. |
