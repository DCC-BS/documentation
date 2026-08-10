---
outline: deep
---

# Settings Button

The `SettingsButton` component provides a cog-trigger dropdown menu for settings and options. It wraps a Nuxt UI `UDropdownMenu` with a configurable trigger button — either an icon-only button with a tooltip, or an icon-plus-label button — and supports passing menu entries via the `items` prop.

## Features

- **Cog Trigger by Default**: Renders with the `i-lucide-settings` icon out of the box
- **Idiomatic Nuxt UI Items**: Pass menu entries through the `items` prop using `DropdownMenuItem[]`
- **Flexible Trigger Modes**: Icon-only with tooltip when no `label` is provided, or icon plus visible text when `label` is set
- **Configurable Alignment**: Control the dropdown popover alignment (`start`, `center`, or `end`)
- **Customizable Icon and Label**: Override the trigger icon, accessible label, and tooltip text
- **Ghost Variant**: Uses `color="neutral"` and `variant="ghost"` for a subtle, unobtrusive appearance

## Props

| Prop           | Type                           | Required | Default               | Description                                                              |
| -------------- | ------------------------------ | -------- | --------------------- | ------------------------------------------------------------------------ |
| `items`        | `DropdownMenuItem[]`           | No       | —                     | Dropdown menu entries passed to the underlying `UDropdownMenu`.          |
| `triggerIcon`  | `string`                       | No       | `"i-lucide-settings"` | Nuxt Icon name for the trigger button.                                   |
| `triggerLabel` | `string`                       | No       | `"Settings"`          | Accessible label and tooltip text for the trigger button.                |
| `label`        | `string`                       | No       | —                     | Optional visible label next to the icon. When set, no tooltip is shown. |
| `align`        | `"start" \| "center" \| "end"` | No       | `"end"`               | Dropdown popover alignment relative to the trigger button.               |

## Usage

### Basic Implementation

Pass menu entries via the `items` prop. The button renders as an icon-only trigger wrapped in a tooltip:

```vue
<script setup lang="ts">
import type { DropdownMenuItem } from "#ui/types";

const settingsItems = [
    { label: "Settings", icon: "i-lucide-settings" },
    { label: "Security", icon: "i-lucide-shield-check" },
] as DropdownMenuItem[];
</script>

<template>
    <SettingsButton :items="settingsItems" />
</template>
```

### In NavigationBar

Place the `SettingsButton` in the `NavigationBar` right slot:

```vue
<script setup lang="ts">
import type { DropdownMenuItem } from "#ui/types";

const settingsItems = [
    {
        label: "Test Settings",
        icon: "i-lucide-shield-check",
    },
] as DropdownMenuItem[];
</script>

<template>
    <NavigationBar>
        <template #rightPostItems>
            <SettingsButton :items="settingsItems" />
        </template>
    </NavigationBar>
</template>
```

### With a Visible Label

Set the `label` prop to display a text label next to the icon. When a label is provided, the tooltip is replaced by the visible text:

```vue
<template>
    <SettingsButton :items="settingsItems" label="Settings" />
</template>
```

### Custom Trigger Icon

Override the default cog icon with any Nuxt Icon name:

```vue
<template>
    <SettingsButton :items="settingsItems" trigger-icon="i-lucide-sliders-horizontal" />
</template>
```

### Custom Alignment

Control where the dropdown popover appears relative to the trigger button:

```vue
<template>
    <SettingsButton :items="settingsItems" align="start" />
</template>
```

## How It Works

1. **Trigger Rendering**: When the `label` prop is **not** set, the component wraps the icon-only `UButton` in a `UTooltip` using `triggerLabel` as the tooltip text. When `label` **is** set, the button displays the label directly and no tooltip is shown.
2. **Dropdown Menu**: The trigger is wrapped in a `UDropdownMenu` bound to the `items` prop. The popover content width is fixed at `w-48` (12rem) via the Nuxt UI `ui.content` override.
3. **Alignment**: The `align` prop maps to the `content.align` option of `UDropdownMenu`, controlling the popover's horizontal position relative to the trigger.

## Items

The `items` prop accepts an array of [`DropdownMenuItem`](https://ui.nuxt.com/components/dropdown-menu) objects from Nuxt UI. Each item supports properties such as:

| Property   | Type                       | Description                              |
| ---------- | -------------------------- | ---------------------------------------- |
| `label`    | `string`                   | Display text for the menu item.          |
| `icon`     | `string`                   | Nuxt Icon name for the item.             |
| `to`       | `string`                   | Router path or URL for navigation.       |
| `onSelect` | `(e: Event) => void`       | Callback invoked when item is selected.  |
| `disabled` | `boolean`                  | Whether the item is disabled.            |

::: tip
See the [Nuxt UI Dropdown Menu documentation](https://ui.nuxt.com/components/dropdown-menu) for the full set of available item options, including dividers, labels, and keyboard navigation.
:::