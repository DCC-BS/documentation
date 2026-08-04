---
---
outline: deep
skillParent: dcc-ui
skillName: databs-footer
skillDescription: "DataBsFooter is a branded application footer with default DCC logo/branding, a size prop for compact mode, and left, center, and right slots. The center slot includes DisclaimerButton and ChangelogsButton by default. Use when adding a page footer."
---
<script setup lang="ts">
import UiContainer from "../../../components/UiContainer.vue";
import { DataBsFooter } from "@dcc-bs/common-ui.bs.js/components";

const exampleCode = `<template>
    <DataBsFooter>
        <template #left>
            <div class="flex items-center gap-2">
                <img src="img/logo.png" alt="Logo" width="48" />
                <div>
                    <div>Custom Organization</div>
                    <div>Custom tagline</div>
                </div>
            </div>
        </template>
        <template #center>
            <div class="text-center">
                <a href="/privacy" class="hover:underline">Privacy Policy</a>
            </div>
        </template>
        <template #right>
            <div class="text-right">
                <div>Contact: info@example.com</div>
            </div>
        </template>
    </DataBsFooter>
</template>`;
</script>

# DataBsFooter

The `DataBsFooter` component provides a branded application footer with customizable content areas. It features the Data Competence Center (DCC) branding by default, including an animated logo, and supports flexible slot-based customization for left, center, and right sections arranged in a three-column grid.

<UiContainer :code="exampleCode">
    <template #element>
        <DataBsFooter>
            <template #left>
                <div class="flex items-center gap-2">
                    <img src="/imgs/logo.png" alt="Logo" width="48" />
                    <div>
                        <div>Custom Organization</div>
                        <div>Custom tagline</div>
                    </div>
                </div>
            </template>
            <template #center>
                <div class="text-center">
                    <a href="/privacy" class="hover:underline">Privacy Policy</a>
                </div>
            </template>
            <template #right>
                <div class="text-right">
                    <div>Contact: info@example.com</div>
                </div>
            </template>
        </DataBsFooter>
    </template>
</UiContainer>

## Features

- **Default DCC Branding**: Includes Data Competence Center logo and information
- **Animated Logo**: Interactive logo with random hover animations (heartbeat or rotate)
- **Default Center Content**: Includes `DisclaimerButton` and `ChangelogsButton` by default
- **Flexible Slot System**: Three slots for left, center, and right sections
- **Size Prop**: Supports `"sm"` and `"md"` sizes for compact or standard logo display
- **Responsive Design**: Adapts to mobile and desktop screens
- **External Link**: Logo links to official DCC website
- **Accessibility**: Proper link attributes for external navigation
- **Typography**: Subtle text styling with gray color scheme

## Props

| Prop   | Type           | Required | Default | Description                                                        |
| ------ | -------------- | -------- | ------- | ------------------------------------------------------------------ |
| `size` | `"sm" \| "md"` | No       | `"md"`  | Controls the logo size. `"sm"` renders a 32px logo, `"md"` renders a 48px logo. |

## Slots

| Slot     | Description                              | Default Content                                                              |
| -------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| `left`   | Content for the left section             | DCC logo with animated hover effect and organization information             |
| `center` | Content for the center section           | `DisclaimerButton` (ghost variant) and `ChangelogsButton`                    |
| `right`  | Content for the right section            | Empty `<div>`                                                                 |

## Usage

### Basic Implementation

Display the footer with default DCC branding and default center content:

```vue
<template>
    <DataBsFooter />
</template>
```

This displays:
- Animated DCC logo linking to https://www.bs.ch/ki
- "Datenwissenschaften und KI" text
- "Developed with ♥ by DCC - Data Competence Center" tagline (hidden on mobile)
- `DisclaimerButton` and `ChangelogsButton` in the center section

### Compact Size

Use the `size` prop for a smaller logo, useful in dense layouts:

```vue
<template>
    <DataBsFooter size="sm">
        <template #right>
            <UButton icon="i-lucide-message-square">Feedback</UButton>
        </template>
    </DataBsFooter>
</template>
```

### With Custom Center Content

Override the default center content with links or additional information:

```vue
<template>
    <DataBsFooter>
        <template #center>
            <nav class="flex flex-wrap justify-center gap-4">
                <a href="/privacy" class="hover:underline">Privacy Policy</a>
                <a href="/terms" class="hover:underline">Terms of Service</a>
                <a href="/contact" class="hover:underline">Contact</a>
            </nav>
        </template>
    </DataBsFooter>
</template>
```

::: tip
Overriding the `center` slot replaces the default `DisclaimerButton` and `ChangelogsButton`. Include them manually if you want to retain access to those flows from the footer.
:::

### With Right Content

Add version information or social links:

```vue
<template>
    <DataBsFooter>
        <template #right>
            <div class="text-right space-y-1">
                <div>Version 1.2.3</div>
                <div class="flex gap-2 justify-end">
                    <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
                        <UIcon name="i-lucide-github" />
                    </a>
                    <a href="https://twitter.com/your-handle" target="_blank" rel="noopener noreferrer">
                        <UIcon name="i-lucide-twitter" />
                    </a>
                </div>
            </div>
        </template>
    </DataBsFooter>
</template>
```

### Complete Customization

Override the default branding and use all slots:


```vue
<template>
    <DataBsFooter>
        <template #left>
            <div class="flex items-center gap-3">
                <img src="/logo.svg" alt="Company Logo" width="40" />
                <div class="hidden sm:block">
                    <div class="font-semibold">My Organization</div>
                    <div>Building the future</div>
                </div>
            </div>
        </template>

        <template #center>
            <div class="flex flex-wrap gap-3 justify-center text-xs">
                <a href="/about" class="hover:underline">About</a>
                <a href="/privacy" class="hover:underline">Privacy</a>
                <a href="/terms" class="hover:underline">Terms</a>
            </div>
        </template>

        <template #right>
            <div class="text-right text-xs">
                <div>© 2024 My Organization</div>
                <div>All rights reserved</div>
            </div>
        </template>

    </DataBsFooter>
</template>
```

## Component Structure

The DataBsFooter uses a three-column grid layout:

```vue
<div class="px-6">
    <div class="grid grid-cols-3 items-center justify-between gap-4 text-xs text-gray-500">
        <!-- Left Section -->
        <slot name="left">
            <!-- Default: Animated DCC logo and branding -->
        </slot>

        <!-- Center Section -->
        <slot name="center">
            <!-- Default: DisclaimerButton + ChangelogsButton -->
        </slot>

        <!-- Right Section -->
        <slot name="right">
            <!-- Default: empty div -->
        </slot>
    </div>
</div>
```

## Responsive Behavior

On mobile devices (< 640px):
- The organization text in the default left section is hidden
- Only the logo is visible
- Content in custom slots should also consider mobile layouts