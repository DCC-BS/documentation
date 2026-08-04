---
---
outline: deep
---

# Changelogs Button

The `ChangelogsButton` component provides a button that allows users to re-trigger the changelogs flow on demand. It resets the `changelogs-last-read` cookie so that the `FirstRunOrchestrator` re-evaluates pending releases and surfaces the `Changelogs` modal without a page reload. Additionally, it fetches the newest release version on mount and displays it as a badge next to the button.

## Features

- **Re-trigger Changelogs**: Resets the last-read sentinel so all existing releases appear as new
- **Version Badge**: Fetches the newest release version from `/api/changelogs` and displays it as a badge next to the button
- **Responsive**: Renders an icon-only button (with tooltip) on mobile and an icon-plus-label button on desktop
- **Cookie-Based**: Uses the `changelogs-last-read` cookie, which the orchestrator watches reactively — no manual reload required
- **i18n Integration**: Button label uses the `common-ui.changelogs.title` translation key
- **Seamless Footer Integration**: Automatically included in the `DataBsFooter` center slot by default

## Props

This component has no props.

## Usage

### Basic Implementation

Simply place the component wherever you want users to be able to re-open the changelogs:

```vue
<template>
  <div>
    <ChangelogsButton />
  </div>
</template>
```

### Standalone Page

Use it on a dedicated changelogs page so users can revisit release notes at any time:

```vue
<script setup lang="ts">
import ChangelogsButton from "@dcc-bs/common-ui.bs.js/components/ChangelogsButton.vue";
</script>

<template>
  <div class="p-8 flex flex-col gap-4 items-start">
    <h1 class="text-2xl font-bold">Changelogs</h1>
    <p class="text-neutral-600">
      Changelogs surface automatically on return visits when new releases exist. Use the button below to re-trigger the flow on demand.
    </p>
    <ChangelogsButton />
  </div>
</template>
```

### In DataBsFooter

The `DataBsFooter` component includes `<ChangelogsButton />` in its center slot by default alongside the `DisclaimerButton` — no additional wiring is needed:

```vue
<template>
  <DataBsFooter>
    <template #right>
      <UButton icon="i-lucide-message-square">Feedback</UButton>
    </template>
  </DataBsFooter>
</template>
```

The default center slot renders (in order):

1. `DisclaimerButton` (ghost variant)
2. `ChangelogsButton`

::: tip
If you override the `center` slot entirely, you will need to add `<ChangelogsButton />` manually to retain the button.
:::

## How It Works

1. **Version Fetch**: On mount, the component fetches `/api/changelogs` to determine the newest release version. If successful, the version is shown as a `UBadge` next to the button. If the fetch fails, the badge is simply not rendered.
2. **Click**: The user clicks the button.
3. **Cookie Reset**: The component sets the `changelogs-last-read` cookie to `"0.0.0"` — a low sentinel value that causes every existing release to count as "new since last read".
4. **Reactive Detection**: The `FirstRunOrchestrator`'s `useChangelogsPending` composable watches this cookie and re-evaluates immediately.
5. **Modal Display**: The orchestrator mounts the `Changelogs` component, which opens its modal and displays all fetched releases.
6. **Completion**: When the user closes the modal, the orchestrator writes the newest release version back to the `changelogs-last-read` cookie, marking everything as read.

::: info
Because the flow is driven by a reactive cookie (not `localStorage` + reload), the changelogs modal appears instantly after clicking — no page refresh is required.
:::

## Responsive Behavior

The component renders two variants and toggles visibility via Tailwind breakpoints. Both variants display the newest version badge (when available) alongside the button:

| Breakpoint | Rendered Element | Behavior |
| ---------- | ------------------------------------------ | ----------------------------------- |
| Mobile (`< md`) | `UTooltip` wrapping an icon-only `UButton`, plus a `UBadge` | Shows the `i-lucide-history` icon with a tooltip containing the localized title, followed by a small version badge |
| Desktop (`>= md`) | `UButton` with icon and label, plus a `UBadge` | Shows the `i-lucide-history` icon followed by the localized title text, with a version badge to the right |

Both variants use `variant="ghost"` and `color="neutral"` for a subtle, unobtrusive appearance. The badge uses `color="primary"` and `variant="subtle"`.

## i18n

The button label uses the existing translation key:

```json
{
  "common-ui": {
    "changelogs": {
      "title": "What's New"
    }
  }
}
```

Override this key in your application's i18n configuration to customize the label.

## Disabling Changelogs

The changelogs feature can be disabled globally via the `disableChangelog` runtime config option. When enabled, the orchestrator will not surface the `Changelogs` flow even if the `ChangelogsButton` resets the cookie.

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disableChangelog: true,
      },
    },
  },
});
```

::: tip
You can also set this via the environment variable `NUXT_PUBLIC_COMMON_UI_DISABLE_CHANGELOG=true`.
:::

## Cookie

The component interacts with the following cookie:

| Cookie | Type | Default | Purpose |
| ---------------------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `changelogs-last-read` | `string` | `""` | Tracks the last read changelog version. The button resets this to `"0.0.0"`. |

::: warning
The `ChangelogsButton` only resets the cookie — it does not directly open a modal. The `FirstRunOrchestrator` must be mounted in your application (typically in `app.vue`) for the re-trigger to produce a visible modal.
:::