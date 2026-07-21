---
outline: deep
---

# useOnboardingBuilder

The `useOnboardingBuilder` composable provides a fluent, type-safe builder API for constructing multi-phase onboarding tours on top of [driver.js](https://driverjs.com). It lets you declare named phases with `onEnter`/`onExit` lifecycle hooks and attach steps to each phase; the builder transparently wires phase transitions into driver.js navigation so that moving between steps across phases runs the correct hooks.

The resulting builder is consumed by the [`Onboarding`](../components/onboarding.md) component via its `builder` prop.

## Features

- **Phased Tours**: Split a tour into named phases, each with its own `onEnter`/`onExit` async hooks.
- **Fluent API**: Chain `addPhases` → `switchPhase` → `addSteps` to describe the whole tour declaratively.
- **Type-Safe Phase Names**: Phase names are inferred from a generic you pass to `addPhases`, so `switchPhase` only accepts valid names.
- **Lazy Titles & Descriptions**: Step `popover.title` and `popover.description` accept either a string or a function (`tOrFunc<string>`), evaluated at build time.
- **Automatic Hook Wiring**: When the user navigates across a phase boundary — including the final step of the tour — the previous phase's `onExit` and the next phase's `onEnter` are invoked automatically. Any navigation hooks you provide on steps or in the driver config are merged with the builder's handlers, never overwritten.
- **driver.js Integration**: Produces a configured `Driver` instance via `buildDriver`, including i18n labels and Lucide footer-button icons.

## Return Shape

`useOnboardingBuilder(config?)` returns:

| Method        | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| `addPhases`   | Registers the available phases and returns an `OnboardingStepBuilder<Phases>`.    |

The returned builder (`OnboardingStepBuilder<Phases>`) exposes:

| Member         | Type                                                        | Description                                                                                  |
| -------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `addSteps`     | `(steps: OnboardingStep[]) => OnboardingStepBuilder<Phases>`| Appends steps to the currently active phase. Throws if the array is empty.                   |
| `switchPhase`  | `(phase: Phases) => OnboardingStepBuilder<Phases>`          | Switches the active phase. Throws if the phase is unknown or already active.                 |
| `currentPhase` | `OnboardingPhase<Phases> \| undefined`                      | The phase that is currently active (read-only).                                              |
| `buildDriver`  | `(config?: Config) => Driver`                               | Builds a driver.js `Driver` instance from the accumulated steps and merges any extra config. |

## Types

### `OnboardingPhase<Phases>`

```ts
type OnboardingPhase<Phases> = {
  name: Phases;
  onEnter?: () => Promise<void>;
  onExit?: () => Promise<void>;
};
```

### `OnboardingStep`

A step is a driver.js `DriveStep` with the `popover` type extended so that `title` and `description` accept either a string or a function (`tOrFunc<string>`). All other `DriveStep` and `Popover` properties (including `element`, `onNextClick`, `onPrevClick`, etc.) are preserved:

```ts
type StepPopoverOverride = Omit<Popover, 'title' | 'description'> & {
  title?: tOrFunc<string>;
  description?: tOrFunc<string>;
};

type OnboardingStep = Omit<DriveStep, 'popover'> & {
  popover?: StepPopoverOverride;
};

type tOrFunc<T> = T | (() => T);
```

## Usage

### Basic Phased Tour

```vue
<script lang="ts" setup>
import Onboarding from '@dcc-bs/common-ui.bs.js/components/Onboarding.vue';

const onboarding = ref<InstanceType<typeof Onboarding>>();

const builder = useOnboardingBuilder()
  .addPhases<'Phase1' | 'Phase2'>([
    {
      name: 'Phase1',
      onEnter: async () => {
        console.log('enter phase 1');
      },
      onExit: async () => {
        console.log('exit phase 1');
      },
    },
    {
      name: 'Phase2',
      onEnter: async () => {
        console.log('enter phase 2');
      },
      onExit: async () => {
        console.log('exit phase 2');
      },
    },
  ])
  .switchPhase('Phase1')
  .addSteps([
    {
      popover: {
        title: 'Step 1',
        description: 'This is step 1',
      },
    },
    {
      popover: {
        title: 'Step 2',
        description: 'This is step 2',
      },
    },
  ])
  .switchPhase('Phase2')
  .addSteps([
    {
      popover: {
        title: 'Step 3',
        description: 'This is step 3',
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

### Lazy Title and Description

Step text can be supplied as a function so it is evaluated when the driver is built (for example, to read fresh reactive state):

```ts
const builder = useOnboardingBuilder()
  .addPhases<'intro'>([{ name: 'intro' }])
  .switchPhase('intro')
  .addSteps([
    {
      popover: {
        title: () => `Welcome, ${userName.value}`,
        description: () => t('tour.intro.description'),
      },
    },
  ]);
```

### Passing Additional driver.js Config

`useOnboardingBuilder` accepts an optional driver.js `Config` that is merged into every driver it builds. Use it for global hooks or overrides:

```ts
const builder = useOnboardingBuilder({
  allowClose: false,
  onDeselected: () => {
    console.log('user clicked away');
  },
}).addPhases<'tour'>([{ name: 'tour' }])
  .switchPhase('tour')
  .addSteps([/* ... */]);
```

::: tip
Hooks you provide at the driver-config level (such as `onDeselected`, `onHighlightStarted`) are merged with the builder's own hooks via `extendDriverHook`, so they run before the builder's phase-transition logic. Similarly, step-level `onNextClick`/`onPrevClick` hooks are preserved and executed before the builder's navigation handlers.
:::

## How Phase Transitions Work

The builder is a small state machine (`Initial` → `PhaseSwitched` → `StepsAdded`). The state determines how hooks are attached when you call `addSteps` and `switchPhase`:

1. **Initial `switchPhase` before any steps** — the phase's `onEnter` is hooked into driver.js' `onHighlightStarted` callback and runs only on the very first step of the tour.
2. **`switchPhase` after steps exist** — the `onNextClick` handler of the last step in the outgoing phase is wired to:
   - `await currentPhase.onExit?.()`
   - `await newPhase.onEnter?.()`
   - `driver.moveNext()`
3. **`addSteps` immediately after a `switchPhase`** — the `onPrevClick` handler of the first new step is wired to navigate back into the previous phase:
   - `await currentPhase.onExit?.()`
   - `await oldPhase.onEnter?.()`
   - `driver.movePrevious()`
4. **Last step of the tour** — the `onNextClick` handler of the very last step is wired to invoke the current phase's `onExit` before advancing, ensuring the final phase's teardown always runs.

::: tip
The builder merges user-provided hooks with its own navigation handlers via `extendDriverHook`, so any `onNextClick`/`onPrevClick`/`onHighlightStarted` hooks you define on a step or in the driver config are preserved and run **before** the builder's phase-transition logic. You can safely combine custom step-level hooks with the fluent builder API.
:::

## Errors

The builder throws synchronously when used incorrectly:

| Condition                                      | Message                                  |
| ---------------------------------------------- | ---------------------------------------- |
| `addSteps` called with an empty array          | `steps cannot be empty`                  |
| `switchPhase` called with an unknown name      | `Phase "<name>" not found`               |
| `switchPhase` called with the already-active phase | `Phase "<name>" is already the current phase` |

## Consuming the Builder

The builder is designed to be handed to the `Onboarding` component, which calls `buildDriver`, persists completion in a cookie, and manages the driver lifecycle:

```vue
<template>
  <Onboarding ref="onboarding" :builder="builder" />
</template>
```

For the full component behavior (cookie persistence, auto-start after the disclaimer modal, exposed `start`/`destroy` methods), see the [Onboarding component page](../components/onboarding.md).

## i18n

The driver instance built by this composable is preconfigured with translation keys under `common-ui.tour.*`. See the [Internationalization](../#internationalization) section for the available keys (`skip`, `next`, `prev`, `finish`, `progress`).