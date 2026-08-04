---
outline: deep
skillParent: dcc-ui
skillName: navigation-bar
skillDescription: "NavigationBar is a responsive top nav bar with left/center/right slots plus rightPreItems/rightPostItems, including built-in SystemStatus, LanguageSelect, OnboardingRestartButton, and conditional AppSwitcher with i18n app-name branding. Use when building the app header/top navigation."
---
<script setup lang="ts">
import UiContainer from "../../../components/UiContainer.vue";
import { NavigationBar } from "@dcc-bs/common-ui.bs.js/components";

const exampleCode = `<template>
    <NavigationBar>
        <template #left>
            <div class="text-xl font-bold">
                MyApp
            </div>
        </template>
        <template #center>
            <span>Center Content</span>
        </template>
        <template #right>
            <span>Custom Right</span>
        </template>
    </NavigationBar>
</template>`;
</script>

# NavigationBar

The `NavigationBar` component provides a flexible, responsive navigation bar with customizable content areas. It includes built-in support for language switching, system status indicator, onboarding restart, and optional app switcher, with multiple slot areas for complete customization of the navigation layout.

<UiContainer :code="exampleCode">
    <template #element>
        <NavigationBar>
            <template #left>
                <div class="text-xl font-bold">
                    MyApp
                </div>
            </template>
            <template #center>
                <span>Center Content</span>
            </template>
            <template #right>
                <span>Custom Right</span>
            </template>
        </NavigationBar>
    </template>
</UiContainer>

## Features

- **Flexible Slot System**: Multiple slots for left, center, and right sections
- **Language Switcher**: Built-in language selection component
- **System Status**: Built-in system status indicator (shows only when offline)
- **Onboarding Restart**: Built-in button to restart the onboarding tour
- **App Switcher**: Optional app switcher when `otherApps` prop is provided
- **Default Branding**: App name displayed by default on the left
- **Nested Slot Support**: Fine-grained control over right section items
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **i18n Integration**: Automatic integration with Vue i18n
- **Accessibility**: Fully keyboard accessible with proper structure

## Props

| Prop        | Type                | Required | Default | Description                                                        |
| ----------- | ------------------- | -------- | ------- | ------------------------------------------------------------------ |
| `otherApps` | `AppSwitcherApp[]`  | No       | —       | Array of apps for the built-in AppSwitcher. If omitted, the AppSwitcher is not rendered. |

### AppSwitcherApp Type

```typescript
interface AppSwitcherApp {
    name: string;
    /** Router path (internal SPA nav) or absolute URL (full app switch). */
    to: string;
    /** Nuxt Icon name, e.g. "i-lucide-mail". Takes precedence over `image`. */
    icon?: string;
    /** URL or public/ path to a raster image. Used only when `icon` is unset. */
    image?: string;
    /** Optional alt text for the image; defaults to `name`. */
    alt?: string;
}
```

## Slots

| Slot             | Description                                                                 | Default Content                                                                   |
| ---------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `left`           | Content for the left section of the navigation bar                          | App name from `navigation.app` translation                                        |
| `center`         | Content for the center section                                              | Empty                                                                             |
| `right`          | Complete override of the right section                                      | SystemStatus + LanguageSelect + OnboardingRestartButton + AppSwitcher (conditional) + nested slots |
| `rightPreItems`  | Items to appear before the system status (within default right section)     | Empty                                                                             |
| `rightPostItems` | Items to appear after the app switcher (within default right section)       | Empty                                                                             |

## Usage

### Basic Implementation

Simple navigation bar with default elements:

```vue
<template>
    <NavigationBar />
</template>
```

This displays:

- App name on the left (from `navigation.app` translation)
- System status indicator on the right (visible only when offline)
- Language switcher on the right
- Onboarding restart button on the right

### With App Switcher

Pass the `otherApps` prop to render a built-in AppSwitcher in the right section:

```vue
<script setup lang="ts">
const apps = [
    { name: "Mail", to: "https://mail.example.com", icon: "i-lucide-mail" },
    { name: "Calendar", to: "https://calendar.example.com", icon: "i-lucide-calendar" },
    { name: "Drive", to: "https://drive.example.com" },
];
</script>

<template>
    <NavigationBar :other-apps="apps" />
</template>
```

### With Custom Left Content

Replace the default app name with custom branding:

```vue
<template>
    <NavigationBar>
        <template #left>
            <div class="flex items-center gap-3 ml-4">
                <img src="/logo.svg" alt="Logo" class="h-8 w-8" />
                <span class="text-xl font-bold">My App</span>
            </div>
        </template>
    </NavigationBar>
</template>
```

### With Center Content

Add navigation links in the center:

```vue
<template>
    <NavigationBar>
        <template #center>
            <nav class="flex items-center gap-4">
                <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
                <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
                <NuxtLink to="/contact" class="hover:underline">Contact</NuxtLink>
            </nav>
        </template>
    </NavigationBar>
</template>
```

### With Right Pre Items

Add items before the system status:

```vue
<template>
    <NavigationBar>
        <template #rightPreItems>
            <AppSwitcher
                :apps="apps"
                footer-to="https://about.example.com/products/"
                footer-label="More" />
        </template>
    </NavigationBar>
</template>
```

### With Right Post Items

Add items after the app switcher:

```vue
<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types';
import { SettingsButton } from '@dcc-bs/common-ui.bs.js/components';

const settingsItems = [
    {
        label: "Test Settings",
        icon: "i-lucide-shield-check"
    }
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

### Complete Customization

Use all slots together:

```vue
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
    <NavigationBar :other-apps="apps">
        <template #left>
            <div class="flex items-center gap-2 ml-4">
                <img src="/logo.png" alt="Logo" class="h-10" />
                <span class="text-xl font-bold">{{ t("app.name") }}</span>
            </div>
        </template>

        <template #center>
            <nav class="flex gap-6">
                <NuxtLink to="/" class="font-medium">Dashboard</NuxtLink>
                <NuxtLink to="/projects" class="font-medium">Projects</NuxtLink>
            </nav>
        </template>

        <template #rightPreItems>
            <UButton variant="ghost" icon="i-lucide-bell" size="sm" />
        </template>

        <template #rightPostItems>
            <SettingsButton :items="settingsItems" />
        </template>
    </NavigationBar>
</template>
```

### Override Right Section Completely

Replace the entire right section if you don't want the default buttons:

```vue
<template>
    <NavigationBar>
        <template #right>
            <div class="flex items-center gap-4 mr-4">
                <span>Custom Right Content</span>
                <button>Login</button>
                <button>Sign Up</button>
            </div>
        </template>
    </NavigationBar>
</template>
```

**Note:** When you override the `right` slot, the `rightPreItems` and `rightPostItems` slots are not rendered, and you lose the default SystemStatus, LanguageSelect, OnboardingRestartButton, and AppSwitcher components unless you add them manually.

## i18n Configuration

Set up the required translation keys:

```json
{
    "en": {
        "navigation": {
            "app": "My Application"
        }
    },
    "de": {
        "navigation": {
            "app": "Meine Anwendung"
        }
    },
    "fr": {
        "navigation": {
            "app": "Mon Application"
        }
    }
}
```

## Layout Integration

### Default Layout

Use in your layout for consistent navigation:

```vue
<!-- layouts/default.vue -->
<template>
    <div class="min-h-screen flex flex-col">
        <NavigationBar>
            <template #center>
                <nav><!-- Your nav items --></nav>
            </template>
            <template #rightPostItems>
                <SettingsButton :items="settingsItems" />
            </template>
        </NavigationBar>

        <main class="flex-1 container mx-auto p-4">
            <slot />
        </main>
    </div>
</template>
```

### Sticky Navigation

Make the navigation bar stick to the top:

```vue
<template>
    <div>
        <div class="sticky top-0 z-50 bg-white shadow">
            <NavigationBar>
                <template #center>
                    <!-- Navigation content -->
                </template>
            </NavigationBar>
        </div>

        <main class="container mx-auto p-4">
            <slot />
        </main>
    </div>
</template>
```

## Component Structure

The NavigationBar uses a flexbox layout with three main sections:

```vue
<div class="flex justify-between gap-2 px-4 py-2 w-full z-50">
  <!-- Left Section -->
  <slot name="left">
    <!-- Default: App name -->
  </slot>

  <!-- Center Section -->
  <slot name="center" />

  <!-- Right Section -->
  <slot name="right">
    <div class="flex items-center gap-2">
      <slot name="rightPreItems" />
      <SystemStatus />
      <LanguageSelect />
      <OnboardingRestartButton />
      <AppSwitcher v-if="otherApps" :apps="otherApps" />
      <slot name="rightPostItems" />
    </div>
  </slot>
</div>
```

## Slot Behavior

### Default Left Content

If you don't provide a `left` slot, the component displays:

```vue
<div class="text-xl font-bold">
  {{ t("navigation.app") }}
</div>
```

### Default Right Content

The default `right` slot includes:

1. Content from `rightPreItems` slot
2. SystemStatus (visible only when the system is offline)
3. LanguageSelect
4. OnboardingRestartButton
5. AppSwitcher (only rendered when `otherApps` prop is provided)
6. Content from `rightPostItems` slot

### Nested Slots vs Complete Override

- **Use `rightPreItems` and `rightPostItems`**: When you want to keep the SystemStatus, LanguageSelect, OnboardingRestartButton, and AppSwitcher
- **Use `right` slot**: When you want complete control over the entire right section

## Styling

The component uses utility classes for layout:

- `flex justify-between`: Distributes space between sections
- `gap-2`: Spacing between elements
- `px-4 py-2`: Horizontal and vertical padding around the bar
- `w-full`: Full width
- `z-50`: High z-index for layering