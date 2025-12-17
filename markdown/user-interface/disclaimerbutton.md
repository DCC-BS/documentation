---
outline: deep
---

<script setup lang="ts">
import DisclaimerButtonExample from '../../components/DisclaimerButtonExample.vue'
</script>

# DisclaimerButton

The `DisclaimerButton` component provides a button that allows users to view the disclaimer again after they have already accepted it. This is useful for applications that require users to review terms and conditions or usage guidelines at any time.

## Features

- **Re-trigger Disclaimer**: Allows users to view the disclaimer modal again
- **Consistent UI**: Matches the application's design system
- **Accessibility**: Fully keyboard accessible with proper ARIA labels
- **i18n Support**: Integrates with internationalization for button text
- **State Management**: Works seamlessly with localStorage-based disclaimer tracking

## Props

This component has no props - it's a simple trigger button that works with the global disclaimer state.

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

### In Navigation Bar

Commonly placed in the navigation bar for easy access:

```vue
<template>
  <NavigationBar>
    <template #right>
      <DisclaimerButton />
    </template>
  </NavigationBar>
</template>
```

### In Settings Page

Perfect for settings or help sections:

```vue
<template>
  <div class="settings-page">
    <h2>Settings</h2>
    
    <section>
      <h3>Legal</h3>
      <DisclaimerButton />
    </section>
  </div>
</template>
```

### With Other Actions

Combine with other action buttons:

```vue
<template>
  <div class="flex gap-2">
    <UButton>Help</UButton>
    <DisclaimerButton />
    <UButton>About</UButton>
  </div>
</template>
```

## How It Works

1. **Button Click**: When clicked, the button resets the disclaimer acceptance state
2. **Modal Trigger**: This causes the main `Disclaimer` component to display the modal
3. **User Action**: The user can review the disclaimer and accept it again
4. **State Update**: The acceptance is stored back in localStorage

## Requirements

This component requires:
- The main `Disclaimer` component to be present in your application
- Nuxt i18n module configured
- Translation keys for button text (typically provided by the common-ui.bs.js module)

## Working with Disclaimer Component

The `DisclaimerButton` should be used alongside the main `Disclaimer` component:

```vue
<template>
  <div>
    <!-- Main disclaimer modal -->
    <Disclaimer
      app-name="My Application"
      confirmation-text="I accept the terms..."
      disclaimer-version="1.0.0"
    />
    
    <!-- Navigation with disclaimer button -->
    <NavigationBar>
      <template #right>
        <DisclaimerButton />
      </template>
    </NavigationBar>
    
    <!-- Your app content -->
    <main>
      <slot />
    </main>
  </div>
</template>
```

## Styling

The button uses the default button styling from your design system. You can customize it by wrapping it in a container with custom classes:

```vue
<template>
  <div class="custom-disclaimer-button">
    <DisclaimerButton />
  </div>
</template>

<style scoped>
.custom-disclaimer-button button {
  /* Your custom styles */
}
</style>
```

## Interactive Example

Try clicking the button below to see the disclaimer modal appear:

<DisclaimerButtonExample />

## Use Cases

- **Legal Compliance**: Allow users to review terms at any time
- **Settings Menu**: Provide easy access to disclaimers from settings
- **Help Section**: Include in help or FAQ sections
- **Footer Links**: Add to footer for accessibility
- **Testing**: Useful during development and testing

## Best Practices

1. **Visible Placement**: Place the button where users can easily find it (navigation, settings, footer)
2. **Clear Labeling**: Use clear button text that indicates its purpose
3. **Consistent Location**: Keep the button in the same location across pages
4. **Accessibility**: Ensure the button is keyboard accessible
5. **Testing**: Test that the button correctly triggers the disclaimer modal

## Accessibility

- **Keyboard Navigation**: Fully accessible via keyboard (Tab, Enter)
- **Screen Readers**: Proper ARIA labels for assistive technology
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Uses proper button element

## Browser Support

Works in all modern browsers that support:
- localStorage API
- Modern JavaScript (ES6+)
- Vue 3
- Nuxt 3

## Related Components

- [Disclaimer](./disclaimer.md) - Main disclaimer modal component
- [DisclaimerPage](./disclaimerpage.md) - Full-page disclaimer view
- [DisclaimerView](./disclaimerview.md) - Disclaimer content component
- [NavigationBar](./navigationbar.md) - Navigation component with built-in disclaimer button