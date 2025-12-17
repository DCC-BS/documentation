---
outline: deep
---

<script setup lang="ts">
import DisclaimerPageExample from '../../components/DisclaimerPageExample.vue'
</script>

# DisclaimerPage

The `DisclaimerPage` component provides a full-page disclaimer view that users see before accessing the application. It displays disclaimer content, terms of service, or usage guidelines in a dedicated page format with an acceptance mechanism.

## Features

- **Full-Page Layout**: Dedicated page for displaying disclaimer content
- **HTML Content Support**: Accepts HTML content for rich text formatting
- **Customizable Text**: Configurable confirmation text and app name
- **Version Tracking**: Supports disclaimer versioning for updates
- **Acceptance Mechanism**: Built-in checkbox confirmation system
- **Responsive Design**: Works seamlessly on all device sizes
- **localStorage Integration**: Tracks user acceptance persistently

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `appName` | `string` | Yes | - | The name of your application |
| `confirmationText` | `string` | Yes | - | The text users must confirm they have read |
| `disclaimerVersion` | `string` | Yes | - | Version identifier for the disclaimer (e.g., "1.0.0") |
| `contentHtml` | `string` | No | `""` | HTML content for the main disclaimer body |
| `postfixHtml` | `string` | No | `""` | HTML content displayed after the main content |

## Usage

### Basic Implementation

Use as a standalone page component:

```vue
<template>
  <DisclaimerPage
    app-name="My Application"
    confirmation-text="I have read and understood the terms and conditions."
    disclaimer-version="1.0.0"
  />
</template>
```

### With Custom Content

Add detailed HTML content for the disclaimer:

```vue
<script setup lang="ts">
const contentHtml = `
  <p>By using <strong>My Application</strong>, you acknowledge:</p>
  <ul>
    <li>This application is provided as-is</li>
    <li>You will use it in compliance with all applicable laws</li>
    <li>Your data will be handled according to our privacy policy</li>
  </ul>
`;

const postfixHtml = `
  <p>For questions, contact: <a href="mailto:support@example.com">support@example.com</a></p>
`;
</script>

<template>
  <DisclaimerPage
    app-name="My Application"
    confirmation-text="I accept the terms and conditions."
    disclaimer-version="1.0.0"
    :content-html="contentHtml"
    :postfix-html="postfixHtml"
  />
</template>
```

### As a Route Page

Create a dedicated disclaimer page in your Nuxt application:

```vue
<!-- pages/disclaimer.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'empty', // Use a minimal layout
});

const contentHtml = `
  <h2>Terms of Service</h2>
  <p>Welcome to our application. Please read these terms carefully.</p>
  <!-- More content -->
`;
</script>

<template>
  <DisclaimerPage
    app-name="My Application"
    confirmation-text="I agree to the terms of service."
    disclaimer-version="1.0.0"
    :content-html="contentHtml"
  />
</template>
```

### With Middleware Guard

Protect your application routes with a middleware that checks disclaimer acceptance:

```typescript
// middleware/disclaimer.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
  
  if (!disclaimerAccepted && to.path !== '/disclaimer') {
    return navigateTo('/disclaimer');
  }
});
```

### Multilingual Support

Use with i18n for multiple languages:

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const contentHtml = computed(() => t('disclaimer.content'));
const confirmationText = computed(() => t('disclaimer.confirmation'));
</script>

<template>
  <DisclaimerPage
    :app-name="t('app.name')"
    :confirmation-text="confirmationText"
    :content-html="contentHtml"
    disclaimer-version="1.0.0"
  />
</template>
```

## Versioning

The `disclaimerVersion` prop allows you to track different versions of your disclaimer. When you update your disclaimer terms, increment the version:

```vue
<template>
  <!-- Old version -->
  <DisclaimerPage
    app-name="My App"
    disclaimer-version="1.0.0"
    ...
  />
  
  <!-- Updated version - users will need to accept again -->
  <DisclaimerPage
    app-name="My App"
    disclaimer-version="2.0.0"
    ...
  />
</template>
```

When the version changes, users who previously accepted will need to accept the new version.

## HTML Content Guidelines

When providing HTML content, follow these guidelines:

1. **Keep It Clean**: Use semantic HTML elements
2. **Accessibility**: Include proper heading hierarchy (h2, h3, etc.)
3. **Links**: Use absolute URLs for external links
4. **Styling**: Rely on the component's built-in styles
5. **Security**: Sanitize user-generated content (though this is typically static)

Example of well-structured content:

```typescript
const contentHtml = `
  <h2>Data Usage Policy</h2>
  <p>This application collects and processes data as follows:</p>
  
  <h3>Data Collection</h3>
  <ul>
    <li>Usage statistics</li>
    <li>Error reports</li>
  </ul>
  
  <h3>Data Storage</h3>
  <p>Data is stored securely on our servers located in Switzerland.</p>
  
  <h3>Your Rights</h3>
  <p>You have the right to request data deletion at any time.</p>
`;
```

## How It Works

1. **Page Load**: Component checks localStorage for acceptance of current version
2. **Display**: Shows full disclaimer content with acceptance checkbox
3. **User Interaction**: User reads content and checks the confirmation box
4. **Validation**: Accept button is only enabled when checkbox is checked
5. **Acceptance**: On acceptance, version is stored in localStorage
6. **Redirect**: Application can then allow user to proceed (handled by your routing logic)

## Interactive Example

Customize the content and see the changes in real-time:

<DisclaimerPageExample />

## Styling

The component uses the Kanton Basel-Stadt design system. The layout is automatically responsive:

- **Desktop**: Full-width centered layout with optimal reading width
- **Tablet**: Adjusted spacing for medium screens
- **Mobile**: Single-column layout with touch-friendly controls

## Accessibility

- **Keyboard Navigation**: Full keyboard support (Tab, Space, Enter)
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators for all interactive elements
- **Contrast**: Meets WCAG AA standards for text contrast
- **Semantic HTML**: Uses proper heading hierarchy and list structures

## Best Practices

1. **Clear Language**: Use simple, clear language in your disclaimer
2. **Structured Content**: Break content into logical sections with headings
3. **Version Management**: Update version numbers when content changes significantly
4. **Legal Review**: Have legal counsel review disclaimer content
5. **User Testing**: Test readability and usability with real users
6. **Mobile Testing**: Ensure disclaimer is readable on small screens
7. **Accessibility Testing**: Test with screen readers and keyboard navigation

## Use Cases

- **First-Time User Onboarding**: Show terms before allowing app access
- **Legal Compliance**: Display required terms and conditions
- **AI/ML Applications**: Explain AI usage and limitations
- **Data Processing**: Inform users about data collection and usage
- **Beta Testing**: Display warnings and limitations for beta software
- **Research Applications**: Show consent forms for research participation

## Related Components

- [Disclaimer](./disclaimer.md) - Modal version of the disclaimer
- [DisclaimerButton](./disclaimerbutton.md) - Button to re-trigger disclaimer
- [DisclaimerView](./disclaimerview.md) - Reusable disclaimer content component
- [NavigationBar](./navigationbar.md) - Navigation with disclaimer access

## Browser Support

Works in all modern browsers that support:
- localStorage API
- Modern JavaScript (ES6+)
- CSS Grid and Flexbox
- Vue 3
- Nuxt 3

## Troubleshooting

**Disclaimer keeps reappearing:**
- Check that the version string matches exactly
- Verify localStorage is not being cleared
- Check browser privacy settings

**Styling issues:**
- Ensure CSS imports are correct in your main CSS file
- Check for CSS conflicts with global styles
- Verify Tailwind CSS is properly configured

**Content not displaying:**
- Verify HTML content is properly escaped
- Check browser console for errors
- Ensure props are being passed correctly