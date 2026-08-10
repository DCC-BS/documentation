---
outline: deep
---

# First Run Orchestrator

The `FirstRunOrchestrator` component coordinates the three "first-run" flows of an application — [Disclaimer](./disclaimer.md), [Changelogs](./changelogs.md), and [Onboarding](./onboarding.md) — and renders them one at a time, in a well-defined priority order. It is the single owner of completion state for all three flows; child flows only emit a `finished` event and the orchestrator records progress in cookies.

Place the orchestrator once, high in your component tree (typically `app.vue` or a default layout), so it is mounted on every page and the flows are guaranteed to surface on the very first render.

## Why an orchestrator?

Before this component existed, each flow (`Disclaimer`, `Changelogs`, `Onboarding`) owned its own mount condition, its own localStorage key, and its own version-check logic. Running them concurrently caused real problems:

- the **Disclaimer** modal had to be visible and clickable while the **Onboarding** overlay was active — but `driver.js` sets `pointer-events: none` on every descendant except the highlighted element, making the modal unclickable;
- the **Changelogs** modal would compete with the **Disclaimer** for the same z-layer;
- each flow read a different storage key (`disclaimerAccepted`, `changelogs-last-read`, `tour-completed`) and used a different read mechanism (`localStorage` vs. cookie), so SSR/hydration behavior was inconsistent.

The orchestrator solves all of this by:

1. treating the three flows as a prioritized queue;
2. rendering **at most one** flow at any time;
3. owning every completion cookie write, so children stay stateless from a persistence perspective;
4. resolving all flows through cookies (SSR-readable), so first-time users skip already-completed flows on the server render.

## Priority order

Flows are evaluated in **descending priority**. The first `pending` flow wins, with one caveat: if any higher-priority flow is still **loading** (`pending === undefined`), the orchestrator renders nothing and waits. This prevents a resolving flow from yanking focus away from one that is already on screen.

| Priority (high → low) | Flow        | Trigger                                                          |
| --------------------- | ----------- | ---------------------------------------------------------------- |
| 1                     | Disclaimer  | Stored `disclaimer-accepted` cookie ≠ configured `version`        |
| 2                     | Changelogs  | Server returns releases newer than `changelogs-last-read` cookie |
| 3                     | Onboarding  | `onboardingBuilder` prop provided AND `tour-completed` ≠ `true`  |

A flow that has been disabled via runtime config is treated as `pending === false` and skipped.

## Features

- **Single source of truth**: owns all completion cookies for the three flows
- **Priority queue**: disclaimer → changelogs → onboarding, never two at once
- **Loading-aware**: waits for async flows (changelogs fetch) before committing to a lower-priority flow
- **Cookie-backed**: SSR-readable state means no hydration flash for first-time users
- **App-owned tour content**: the consumer builds the onboarding tour; the orchestrator only decides *when* to mount it
- **Runtime-configurable**: disable any flow individually via `runtimeConfig.public.commonUi`
- **Re-armable from anywhere**: helper buttons (`ChangelogsButton`, `OnboardingRestartButton`, `DisclaimerButton`) reset the relevant cookie and the orchestrator re-evaluates reactively

## Props

| Prop               | Type                              | Required | Description                                                                                                                                  |
| ------------------ | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `onboardingBuilder`| `OnboardingStepBuilder<Phases>`   | No       | Tour builder created via `useOnboardingBuilder()`. If omitted, the Onboarding flow never becomes pending. The consumer owns construction.    |
| `disclaimer`       | `Partial<DisclaimerConfig>`       | No       | Per-instance overrides for the `runtimeConfig.public.commonUi.disclaimer` defaults (e.g. `appName`, `version`, `contentHtml`, `confirmationText`). |

::: tip
The orchestrator merges `runtimeConfig.public.commonUi.disclaimer` with the `disclaimer` prop, with the **prop taking precedence**. This lets you set a sensible default in `nuxt.config.ts` and override per-app in `app.vue`.
:::

## Events

Each child flow emits a `finished` event back to the orchestrator. You do not normally need to listen to this event yourself — the orchestrator handles it internally — but the contract is documented here for completeness.

| Event      | Payload                        | Description                                                              |
| ---------- | ------------------------------ | ------------------------------------------------------------------------ |
| `finished` | `FirstRunFinishedPayload`      | Emitted by the active child flow when the user completes it. Currently `{ completed: boolean }`. |

On receipt, the orchestrator writes the appropriate cookie:

| Flow id      | Cookie written                                  |
| ------------ | ----------------------------------------------- |
| `disclaimer` | `disclaimer-accepted` ← configured `version`    |
| `changelogs` | `changelogs-last-read` ← newest release version |
| `onboarding` | `tour-completed` ← `true`                       |

The cookie write flips the flow's `pending` flag reactively, which makes the `activeFlow` recomputation swap or unmount the child automatically.

## Runtime configuration

The orchestrator reads from `runtimeConfig.public.commonUi`. Three individual disable flags plus a `disclaimer` block are supported:

```typescript
// nuxt.config.ts
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
          // contentHtml, postfixHtml, confirmationText are also accepted here
        },
      },
    },
  },
});
```

| Option                | Type                | Default     | Description                                                                                  |
| --------------------- | ------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `disableChangelog`    | `boolean \| string` | `false`     | When truthy, the Changelogs flow is treated as not-pending.                                  |
| `disableDisclaimer`   | `boolean \| string` | `false`     | When truthy, the Disclaimer flow is treated as not-pending.                                  |
| `disableOnboarding`   | `boolean \| string` | `false`     | When truthy, the Onboarding flow is treated as not-pending.                                  |
| `disclaimer.appName`  | `string`            | `""`        | Application name passed through to the `Disclaimer` flow.                                    |
| `disclaimer.version`  | `string`            | `"1.0.0"`   | Version compared against the `disclaimer-accepted` cookie. Bump this to re-trigger the flow. |

::: tip
The string `"true"` is accepted in addition to the boolean `true`, so these flags work cleanly when set via environment variables (e.g. `NUXT_PUBLIC_COMMON_UI_DISABLE_ONBOARDING=true`).
:::

## Cookies

The orchestrator reads and writes three cookies. They are all SSR-readable so first-time-vs-returning decisions happen on the server.

| Cookie                  | Type      | Default | Purpose                                                              |
| ----------------------- | --------- | ------- | -------------------------------------------------------------------- |
| `disclaimer-accepted`   | `string`  | `""`    | Stores the version of the disclaimer the user has accepted.          |
| `changelogs-last-read`  | `string`  | `""`    | Stores the newest changelog version the user has seen.               |
| `tour-completed`        | `boolean` | `false` | Whether the user has finished the onboarding tour at least once.     |

::: info Legacy localStorage keys
A Nuxt plugin (`migrate-first-run-keys`) is registered by the module to migrate the previous `localStorage`-based keys (`disclaimerAccepted`, etc.) to the new cookies on first load, so existing users are not re-prompted after upgrading.
:::

## Usage

### Minimal setup

If you only want the Disclaimer and Changelogs flows (no tour), drop the orchestrator in `app.vue` with no props:

```vue
<!-- app.vue -->
<template>
  <UApp>
    <FirstRunOrchestrator />
    <NuxtPage />
  </UApp>
</template>
```

### With an onboarding tour

Construct the tour **once** in `app.vue` using `useOnboardingBuilder()` so it is available on every page, then pass it to the orchestrator. The orchestrator takes care of *when* to mount the tour — you do not call `start()` yourself.

```vue
<!-- app.vue -->
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
                appName: 'Test App',
                confirmationText:
                    'I have read and understood the instructions and confirm that I will use Test App exclusively in compliance with the stated guidelines.',
            }"
        />
        <NuxtPage />
    </UApp>
</template>
```

::: tip Why construct the builder in `app.vue`?
The tour is app-owned — each app defines its own steps. Building it once in `app.vue` (rather than per-page) ensures the orchestrator can mount it on the very first render, immediately after the disclaimer and changelogs flows finish.
:::

### Overriding only part of the disclaimer config

Any key you omit from the `disclaimer` prop falls back to the `runtimeConfig.public.commonUi.disclaimer` default:

```vue
<FirstRunOrchestrator
    :disclaimer="{ appName: 'My App' }"
/>
```

## Re-arming a flow from your UI

Because the orchestrator watches its cookies reactively, you can re-trigger any flow at runtime by resetting the corresponding cookie. The module ships with helper buttons that do exactly this:

| Helper                    | Resets                | Effect                                                              |
| ------------------------- | --------------------- | ------------------------------------------------------------------- |
| `DisclaimerButton`        | `disclaimer-accepted` | Re-shows the Disclaimer modal on next evaluation.                   |
| `ChangelogsButton`        | `changelogs-last-read` ← `"0.0.0"` | Surfaces the Changelogs flow with every existing release as "new".  |
| `OnboardingRestartButton` | (re-invokes the tour) | Restarts the tour without permanently marking it completed.         |

`DisclaimerButton` and `ChangelogsButton` are wired into the [DataBsFooter](./databsfooter.md) center slot by default, and `OnboardingRestartButton` is included in the [NavigationBar](./navigationbar.md) right section, so end users always have a way back to any of the three flows.

::: info
The `ChangelogsButton` resets `changelogs-last-read` to the sentinel `"0.0.0"` so every existing release counts as newer than the stored value. The orchestrator's `useChangelogsPending` composable re-evaluates and surfaces the Changelogs flow without a page reload.
:::

## How it works

1. **Cookie reads**: On mount (and reactively thereafter), the orchestrator reads the three completion cookies.
2. **Pending computation**:
   - `disclaimerPending` = not disabled AND `disclaimer-accepted` ≠ configured `version`
   - `changelogsPending` = async result of `useChangelogsPending()` (`undefined` while loading, `true`/`false` once resolved)
   - `onboardingPending` = not disabled AND `onboardingBuilder` provided AND `tour-completed` ≠ `true`
3. **Active flow selection**: flows are sorted by priority descending; the first `pending === true` flow is rendered. If any higher-priority flow is `pending === undefined`, nothing is rendered yet.
4. **Child emits `finished`**: the orchestrator writes the matching cookie, which flips the flow's `pending` flag, which recomputes `activeFlow`, which swaps or unmounts the child — all reactively, with no manual coordination.

## Best practices

- **Mount once, high in the tree.** Use `app.vue` or a default layout. Mounting the orchestrator per-page will cause flows to re-evaluate on every navigation.
- **Don't call `onboarding.start()` yourself.** When the orchestrator owns the tour, it manages the lifecycle. Use `OnboardingRestartButton` for user-initiated replays.
- **Bump `disclaimer.version` to re-prompt.** When your legal terms change, increment the version in `runtimeConfig.public.commonUi.disclaimer.version` and every existing user will be re-shown the Disclaimer flow.
- **Keep tour construction in `app.vue`.** It needs to be available before the orchestrator decides whether the Onboarding flow is pending.
