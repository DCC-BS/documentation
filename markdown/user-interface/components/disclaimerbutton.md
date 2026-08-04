---
outline: deep
skillParent: dcc-ui
skillName: disclaimer-button
skillDescription: "DisclaimerButton is a button (variant outline or ghost) that resets the disclaimer-accepted cookie to re-trigger the disclaimer flow via the FirstRunOrchestrator. Use when users need to re-view terms after acceptance, e.g. in the DataBsFooter or NavigationBar. NOT the initial modal gate (disclaimer) or full page (disclaimer-page)."
---
<script setup lang="ts">
import UiContainer from '../../../components/UiContainer.vue';
import { DisclaimerButton } from "@dcc-bs/common-ui.bs.js/components";

const code = `<template>
    <div class="flex gap-5 justify-center">
        <div>
            <div><strong>Outline Variant:</strong></div>
            <DisclaimerButton variant="outline" />
        </div>
        <div>
            <div><strong>Ghost Variant:</strong></div>
            <DisclaimerButton variant="ghost" />
        </div>
    </div>
</template>`;
</script>

# DisclaimerButton

The `DisclaimerButton` component provides a button that allows users to view the disclaimer again after they have already accepted it. Clicking the button resets the `disclaimer-accepted` cookie to an empty string, which causes the `FirstRunOrchestrator` to re-arm the disclaimer flow and show the modal again.

::: info
The button only has an effect when a `FirstRunOrchestrator` is mounted in your application. The orchestrator watches the cookie and mounts the `Disclaimer` component when the stored version no longer matches the configured version.
:::

## Preview

<UiContainer :code="code">
    <template #element>
        <div class="flex flex-col gap-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800">
                    <strong>Info:</strong> This button resets the <code>disclaimer-accepted</code> cookie so the <code>FirstRunOrchestrator</code> re-shows the disclaimer modal.
                </p>
            </div>
            <div class="flex gap-5 justify-center">
                <div>
                    <div><strong>Outline Variant:</strong></div>
                    <DisclaimerButton variant="outline" />
                </div>
                <div>
                    <div><strong>Ghost Variant:</strong></div>
                    <DisclaimerButton variant="ghost" />
                </div>
            </div>
        </div>
    </template>
</UiContainer>

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `"outline" \| "ghost"` | No | `"outline"` | Button variant style. |

## Usage

### Basic Implementation

Simply add the button wherever you want users to be able to review the disclaimer:

```vue
<template>
  <div>
    <DisclaimerButton />
  </div>
</template>
```

### With Custom Variant

Choose a different button style variant:

```vue
<template>
  <div>
    <!-- Ghost variant (minimal styling) -->
    <DisclaimerButton variant="ghost" />
    
    <!-- Outline variant (default) -->
    <DisclaimerButton variant="outline" />
  </div>
</template>
```

### In DataBsFooter

The `DataBsFooter` component includes a `DisclaimerButton` (ghost variant) by default in its center slot, alongside `ChangelogsButton`:

```vue
<template>
    <DataBsFooter />
</template>
```

::: tip
If you override the `center` slot of `DataBsFooter`, you will need to add `<DisclaimerButton />` manually to retain the button.
:::

### In Navigation Bar

You can also place the button in the navigation bar (ghost variant is commonly used in navigation):

```vue
<template>
  <NavigationBar>
    <template #rightPreItems>
      <DisclaimerButton variant="ghost" />
    </template>
  </NavigationBar>
</template>
```

::: warning
The `NavigationBar` no longer includes `DisclaimerButton` in its default right slot. You must add it manually (e.g., via the `rightPreItems` slot) if you want it in the navigation bar.
:::

## How It Works

1. **Cookie Reset**: When clicked, the button sets the `disclaimer-accepted` cookie to an empty string.
2. **Orchestrator Detection**: The `FirstRunOrchestrator` watches this cookie and detects that it no longer matches the configured disclaimer version.
3. **Modal Re-display**: The orchestrator mounts the `Disclaimer` component, showing the modal again.
4. **Re-acceptance**: Once the user accepts the disclaimer again, the orchestrator writes the current version back to the cookie and unmounts the modal.

## Cookie Reference

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `disclaimer-accepted` | `string` | `""` | Stores the accepted disclaimer version. The `FirstRunOrchestrator` compares this against the configured version to determine whether to show the disclaimer modal. |

## Disabling the Disclaimer

The disclaimer system can be disabled globally via the `disableDisclaimer` runtime config option. When enabled, the `FirstRunOrchestrator` will not show the disclaimer modal even when the `DisclaimerButton` is clicked and the cookie is reset.

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disableDisclaimer: true
      }
    }
  }
})
```

::: tip
You can also set this via the environment variable `NUXT_PUBLIC_COMMON_UI_DISABLE_DISCLAIMER=true`.
:::