---
outline: deep
---

# useDriverFactory

The `useDriverFactory` composable creates preconfigured [driver.js](https://driverjs.com) `Driver` instances. It centralizes tour styling and behavior — i18n labels, Lucide footer-button icons, and a stable `data-testid` for E2E selectors — so individual tours only need to supply their `steps`.

It is the low-level primitive that [`useOnboardingBuilder`](useOnboardingBuilder.md) builds on top of; use `useDriverFactory` directly when you need a single, unphased driver.js tour, and `useOnboardingBuilder` when you need multi-phase tours with `onEnter`/`onExit` hooks.

## Features

- **Preconfigured Driver**: Progress indicator and next/prev/done button labels are wired to i18n out of the box.
- **Lucide Footer Icons**: Injects Lucide `arrow-big-left` / `arrow-big-right` / `check` icons into the driver.js popover's navigation buttons.
- **E2E-Friendly**: Stamps `data-testid="tour-skip"` on the close (skip) button.
- **Config Merging**: Any `additionalOptions` you pass are spread over the defaults, so you can override or extend them (including `steps`).

## Return Shape

`useDriverFactory()` returns:

| Method         | Type                                                                 | Description                                                                 |
| -------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `createDriver` | `(steps: DriveStep[], additionalOptions?: Config) => Driver`        | Builds a driver.js `Driver` instance from the given steps and optional config. |

## Usage

### Basic Tour

```vue
<script lang="ts" setup>
const { createDriver } = useDriverFactory();

const driver = createDriver([
  {
    element: '#step-1',
    popover: {
      title: 'Step 1',
      description: 'This is the first step',
    },
  },
  {
    element: '#step-2',
    popover: {
      title: 'Step 2',
      description: 'This is the second step',
    },
  },
]);

onMounted(() => {
  driver.drive();
});
</script>
```

### With Additional driver.js Config

```ts
const { createDriver } = useDriverFactory();

const driver = createDriver(steps, {
  allowClose: false,
  onDeselected: () => {
    console.log('user clicked away');
  },
});
```

::: tip
`additionalOptions` is spread **after** the factory's defaults, so it can override `showProgress`, button text, `popoverClass`, or any other driver.js `Config` option.
:::

## i18n

The driver instance is preconfigured with translation keys under `common-ui.tour.*`: `progress`, `next`, `prev`, `finish`. See the [Internationalization](../#internationalization) section for details.

## Relation to useOnboardingBuilder

[`useOnboardingBuilder`](useOnboardingBuilder.md) calls `useDriverFactory` internally (`buildDriver` → `createDriver`) to produce the `Driver` it hands to the [`Onboarding`](../components/onboarding.md) component. Reach for `useDriverFactory` directly only if you don't need the builder's phase/hook machinery.
