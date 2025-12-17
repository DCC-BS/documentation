---
outline: deep
---

<script setup lang="ts">
import NavigationBarExample from '../../components/NavigationBarExample.vue'
</script>

# NavigationBar

The `NavigationBar` component provides a responsive navigation bar with language switching, disclaimer button, and customizable content areas. It integrates seamlessly with Nuxt i18n for internationalization and provides a consistent navigation experience across your application.

## Features

- **Language Switcher**: Built-in language selection dropdown
- **Disclaimer Access**: Integrated disclaimer button for easy access to terms
- **Customizable Slots**: Flexible content areas for center and right sections
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **i18n Integration**: Automatic integration with Nuxt i18n module
- **Kanton Basel-Stadt Branding**: Uses official design system styling
- **Accessibility**: Fully keyboard accessible with ARIA support

## Props

This component has no props - it uses slots for customization.

## Slots

| Slot | Description |
|------|-------------|
| `center` | Content for the center section of the navigation bar |
| `right` | Additional content for the right section (appears before language switcher) |

## Requirements

This component requires:
- **Nuxt i18n module** configured in your project
- **Translation key** `navigation.app` for the application name
- The `Disclaimer` component if you want to use the built-in disclaimer button

## Usage

### Basic Implementation

Simple navigation bar with just the default elements:

```vue
<template>
  <NavigationBar />
</template>
```

This will display:
- App name on the left (from `navigation.app` translation)
- Disclaimer button
- Language switcher

### With Center Content

Add custom content in the center:

```vue
<template>
  <NavigationBar>
    <template #center>
      <div class="text-sm font-medium">
        Dashboard
      </div>
    </template>
  </NavigationBar>
</template>
```

### With Right Content

Add additional actions or information on the right:

```vue
<template>
  <NavigationBar>
    <template #right>
      <UButton variant="ghost" icon="i-lucide-bell" size="sm">
        Notifications
      </UButton>
    </template>
  </NavigationBar>
</template>
```

### With Both Slots

Combine center and right content:

```vue
<template>
  <NavigationBar>
    <template #center>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-home" />
        <span>Home</span>
      </div>
    </template>
    
    <template #right>
      <UButton variant="ghost" icon="i-lucide-settings">
        Settings
      </UButton>
      <UButton variant="ghost" icon="i-lucide-user">
        Profile
      </UButton>
    </template>
  </NavigationBar>
</template>
```

### With Navigation Menu

Create a navigation menu in the center:

```vue
<script setup lang="ts">
const route = useRoute();

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'i-lucide-home' },
  { label: 'Projects', path: '/projects', icon: 'i-lucide-folder' },
  { label: 'Reports', path: '/reports', icon: 'i-lucide-bar-chart' },
];
</script>

<template>
  <NavigationBar>
    <template #center>
      <nav class="flex gap-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
          :class="{ 'bg-blue-100': route.path === item.path }"
        >
          <UIcon :name="item.icon" />
          {{ item.label }}
        </NuxtLink>
      </nav>
    </template>
  </NavigationBar>
</template>
```

### With User Information

Display user info in the right section:

```vue
<script setup lang="ts">
const user = ref({
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '/avatars/john.jpg',
});
</script>

<template>
  <NavigationBar>
    <template #right>
      <div class="flex items-center gap-2">
        <img 
          :src="user.avatar" 
          :alt="user.name"
          class="w-8 h-8 rounded-full"
        />
        <span class="text-sm font-medium">{{ user.name }}</span>
      </div>
    </template>
  </NavigationBar>
</template>
```

### With Status Indicator

Add online status indicator:

```vue
<template>
  <NavigationBar>
    <template #right>
      <OnlineStatus :show-text="true" />
    </template>
  </NavigationBar>
</template>
```

## i18n Configuration

Set up the required translation keys in your i18n configuration:

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
  }
}
```

## Layout Integration

### Default Layout

Use in your default layout for consistent navigation:

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <NavigationBar>
      <template #center>
        <nav><!-- Your nav items --></nav>
      </template>
      <template #right>
        <OnlineStatus />
      </template>
    </NavigationBar>
    
    <main class="container mx-auto p-4">
      <slot />
    </main>
  </div>
</template>
```

### With Fixed Position

Make the navigation bar sticky:

```vue
<template>
  <div class="sticky top-0 z-50">
    <NavigationBar>
      <template #center>
        <!-- Content -->
      </template>
    </NavigationBar>
  </div>
  
  <main>
    <!-- Page content -->
  </main>
</template>
```

## Interactive Example

Try customizing the navigation bar:

<NavigationBarExample />

## Responsive Behavior

The NavigationBar adapts to different screen sizes:

- **Desktop (≥1024px)**: Full layout with all elements visible
- **Tablet (768px-1023px)**: Adjusted spacing, may wrap content
- **Mobile (<768px)**: Compact layout, may hide some elements or use hamburger menu

## Styling

The component uses the Kanton Basel-Stadt design system:

- **Background**: Primary brand color (green)
- **Text**: White for contrast
- **Spacing**: Consistent padding and gaps
- **Height**: Optimal height for usability
- **Shadow**: Subtle shadow for depth

### Custom Styling

Override styles using CSS classes on slot content:

```vue
<template>
  <NavigationBar>
    <template #center>
      <div class="custom-nav-content">
        <!-- Your content -->
      </div>
    </template>
  </NavigationBar>
</template>

<style scoped>
.custom-nav-content {
  /* Your custom styles */
}
</style>
```

## Accessibility

- **Keyboard Navigation**: Full Tab and arrow key support
- **Screen Readers**: Proper ARIA labels and landmarks
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Uses `<nav>` element
- **Skip Links**: Consider adding skip to main content link
- **Color Contrast**: Meets WCAG AA standards

### Skip Link Example

```vue
<template>
  <div>
    <a href="#main-content" class="sr-only focus:not-sr-only">
      Skip to main content
    </a>
    
    <NavigationBar>
      <!-- Navigation content -->
    </NavigationBar>
    
    <main id="main-content">
      <slot />
    </main>
  </div>
</template>
```

## Language Switching

The built-in language switcher:
- Detects available locales from i18n configuration
- Shows current language
- Allows switching between configured languages
- Persists language preference
- Updates all translated content automatically

### Configure Available Languages

In your Nuxt i18n config:

```typescript
export default defineNuxtConfig({
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
    ],
    defaultLocale: 'de',
  },
});
```

## Disclaimer Button

The built-in disclaimer button:
- Opens the disclaimer modal when clicked
- Always accessible to users
- Integrates with `Disclaimer` component
- Uses i18n for button text

## Best Practices

1. **Consistent Placement**: Use the same navigation across all pages
2. **Clear Labels**: Use descriptive text for navigation items
3. **Active States**: Highlight the current page/section
4. **Mobile First**: Test on mobile devices regularly
5. **Performance**: Keep slot content lightweight
6. **Accessibility**: Test with keyboard and screen readers
7. **i18n**: Translate all navigation text
8. **Icons**: Use icons consistently and with labels

## Use Cases

- **Application Header**: Main navigation for web applications
- **Dashboard Navigation**: Navigation for admin dashboards
- **Portal Header**: Header for user portals
- **Documentation Sites**: Navigation for documentation
- **Content Management**: Header for CMS interfaces
- **E-commerce**: Navigation for online shops
- **Intranet**: Internal company portals

## Related Components

- [DisclaimerButton](./disclaimerbutton.md) - Built-in disclaimer trigger
- [Disclaimer](./disclaimer.md) - Disclaimer modal
- [OnlineStatus](./onlinestatus.md) - Status indicator for navigation
- [DataBsBanner](./databsbanner.md) - Banner component for top of page
- [DataBsFooter](./databsfooter.md) - Footer component

## Browser Support

Works in all modern browsers that support:
- Vue 3
- Nuxt 3
- Modern JavaScript (ES6+)
- CSS Flexbox
- Nuxt i18n

## Troubleshooting

**Language switcher not appearing:**
- Verify Nuxt i18n module is installed and configured
- Check that multiple locales are defined
- Ensure i18n is properly initialized

**App name not showing:**
- Check that `navigation.app` translation key exists
- Verify i18n translations are loaded
- Check browser console for errors

**Styling issues:**
- Import required CSS from common-ui.bs.js
- Verify Tailwind CSS is configured
- Check for CSS conflicts

**Responsive problems:**
- Test on actual devices, not just browser resize
- Check viewport meta tag is present
- Verify breakpoint configurations