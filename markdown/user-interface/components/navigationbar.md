---
outline: deep
skillParent: dcc-ui
skillName: navigation-bar
skillDescription: "NavigationBar is a responsive top nav bar with left/center/right slots plus rightPreItems/rightPostItems, including built-in DisclaimerButton, ChangelogsButton, OnboardingRestartButton, and LanguageSelect with i18n app-name branding. Use when building the app header/top navigation."
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

The `NavigationBar` component provides a flexible, responsive navigation bar with customizable content areas. It includes built-in support for language switching, disclaimer button, changelogs access, onboarding restart, and multiple slot areas for complete customization of the navigation layout.

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
- **Disclaimer Button**: Integrated disclaimer access
- **Changelogs Button**: Built-in access to changelogs on demand
- **Onboarding Restart**: Built-in button to restart the onboarding tour
- **Default Branding**: App name displayed by default on the left
- **Nested Slot Support**: Fine-grained control over right section items
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **i18n Integration**: Automatic integration with Vue i18n
- **Accessibility**: Fully keyboard accessible with proper structure

## Props

This component has no props - it uses slots for all customization.

## Slots

| Slot             | Description                                                                 | Default Content                                                                   |
| ---------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `left`           | Content for the left section of the navigation bar                          | App name from `navigation.app` translation                                        |
| `center`         | Content for the center section                                              | Empty                                                                             |
| `right`          | Complete override of the right section                                      | DisclaimerButton + ChangelogsButton + OnboardingRestartButton + LanguageSelect + nested slots |
| `rightPreItems`  | Items to appear before the disclaimer button (within default right section) | Empty                                                                             |
| `rightPostItems` | Items to appear after the language select (within default right section)    | Empty                                                                             |

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
- Disclaimer button on the right
- Changelogs button on the right
- Onboarding restart button on the right
- Language switcher on the right

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

Add items before the disclaimer button:

```vue
<template>
    <NavigationBar>
        <template #rightPreItems>
            <button class="px-3 py-2 hover:bg-gray-100 rounded">
                <UIcon name="i-lucide-bell" />
            </button>
        </template>
    </NavigationBar>
</template>
```

### With Right Post Items

Add items after the language select:

```vue
<template>
    <NavigationBar>
        <template #rightPostItems>
            <OnlineStatus />
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
    <NavigationBar>
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
            <OnlineStatus />
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

**Note:** When you override the `right` slot, the `rightPreItems` and `rightPostItems` slots are not rendered, and you lose the default DisclaimerButton, ChangelogsButton, OnboardingRestartButton, and LanguageSelect components unless you add them manually.

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
                <OnlineStatus />
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
<div class="flex justify-between gap-2 p-2 w-full z-50">
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
      <DisclaimerButton variant="ghost" />
      <ChangelogsButton />
      <OnboardingRestartButton />
      <LanguageSelect />
      <slot name="rightPostItems" />
    </div>
  </slot>
</div>
```

## Slot Behavior

### Default Left Content

If you don't provide a `left` slot, the component displays:

```vue
<div class="text-xl font-bold mt-4 ml-4">
  {{ t("navigation.app") }}
</div>
```

### Default Right Content

The default `right` slot includes:

1. Content from `rightPreItems` slot
2. DisclaimerButton with `ghost` variant
3. ChangelogsButton
4. OnboardingRestartButton
5. LanguageSelect component
6. Content from `rightPostItems` slot

### Nested Slots vs Complete Override

- **Use `rightPreItems` and `rightPostItems`**: When you want to keep the DisclaimerButton, ChangelogsButton, OnboardingRestartButton, and LanguageSelect
- **Use `right` slot**: When you want complete control over the entire right section

## Styling

The component uses utility classes for layout:

- `flex justify-between`: Distributes space between sections
- `gap-2`: Spacing between elements
- `p-2`: Padding around the entire bar
- `w-full`: Full width
- `z-50`: High z-index for layering

## Migration Guide

If you're migrating from an older version with only `center` and `right` slots:

**Old:**

```vue
<NavigationBar>
  <template #right>
    <OnlineStatus />
  </template>
</NavigationBar>
```

**New:**

```vue
<NavigationBar>
  <template #rightPostItems>
    <OnlineStatus />
  </template>
</NavigationBar>
```

This allows you to keep the default DisclaimerButton, ChangelogsButton, OnboardingRestartButton, and LanguageSelect while adding your custom content.