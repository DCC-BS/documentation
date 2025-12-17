---
outline: deep
---

<script setup lang="ts">
import DisclaimerViewExample from '../../components/DisclaimerViewExample.vue'
</script>

# DisclaimerView

The `DisclaimerView` component displays disclaimer content in a reusable view format. It's the core content component used by both `DisclaimerPage` and the `Disclaimer` modal, providing a consistent presentation of disclaimer information across different contexts.

## Features

- **Reusable Content Component**: Can be embedded in modals, pages, or other components
- **HTML Content Support**: Accepts rich HTML content for flexible formatting
- **Customizable Confirmation**: Configurable confirmation checkbox and text
- **Version Display**: Shows disclaimer version information
- **Structured Layout**: Well-organized layout with content sections
- **Responsive Design**: Adapts to different container sizes
- **Accessibility**: Built with accessibility best practices

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `appName` | `string` | Yes | - | The name of your application |
| `confirmationText` | `string` | Yes | - | Text for the confirmation checkbox |
| `disclaimerVersion` | `string` | Yes | - | Version identifier for the disclaimer |
| `contentHtml` | `string` | No | `""` | Main HTML content for the disclaimer body |
| `postfixHtml` | `string` | No | `""` | HTML content displayed after main content |

## Usage

### Basic Implementation

Use the component to display disclaimer content:

```vue
<template>
  <DisclaimerView
    app-name="My Application"
    confirmation-text="I accept the terms and conditions."
    disclaimer-version="1.0.0"
  />
</template>
```

### With Custom Content

Add detailed HTML content:

```vue
<script setup lang="ts">
const contentHtml = `
  <p>By using <strong>My Application</strong>, you acknowledge:</p>
  <ul>
    <li>This application is for authorized use only</li>
    <li>Your data will be processed according to our privacy policy</li>
    <li>You will comply with all applicable laws and regulations</li>
  </ul>
`;

const postfixHtml = `
  <p>For questions or concerns, please contact our support team.</p>
  <p>Last updated: January 2024</p>
`;
</script>

<template>
  <DisclaimerView
    app-name="My Application"
    confirmation-text="I have read and agree to these terms."
    disclaimer-version="1.0.0"
    :content-html="contentHtml"
    :postfix-html="postfixHtml"
  />
</template>
```

### In a Custom Modal

Embed the view in your own modal component:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(true);
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'max-w-4xl' }">
    <div class="p-6">
      <DisclaimerView
        app-name="My Application"
        confirmation-text="I accept"
        disclaimer-version="1.0.0"
        content-html="<p>Your disclaimer content here</p>"
      />
    </div>
  </UModal>
</template>
```

### In a Card Layout

Use within a card component:

```vue
<template>
  <UCard>
    <template #header>
      <h2>Terms and Conditions</h2>
    </template>
    
    <DisclaimerView
      app-name="My Application"
      confirmation-text="I agree to the terms"
      disclaimer-version="1.0.0"
      content-html="<p>Card content here</p>"
    />
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline">Cancel</UButton>
        <UButton>Accept</UButton>
      </div>
    </template>
  </UCard>
</template>
```

### With Dynamic Content

Load content dynamically from API or composables:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const contentHtml = ref('');
const postfixHtml = ref('');

onMounted(async () => {
  // Fetch disclaimer content from API
  const response = await fetch('/api/disclaimer');
  const data = await response.json();
  
  contentHtml.value = data.content;
  postfixHtml.value = data.postfix;
});
</script>

<template>
  <DisclaimerView
    app-name="My Application"
    confirmation-text="I accept"
    disclaimer-version="1.0.0"
    :content-html="contentHtml"
    :postfix-html="postfixHtml"
  />
</template>
```

## Content Structure

The component organizes content in a clear, hierarchical structure:

1. **Header**: App name and version
2. **Main Content**: Primary disclaimer text (from `contentHtml`)
3. **Postfix Content**: Additional information (from `postfixHtml`)
4. **Confirmation**: Checkbox with confirmation text

### Recommended Content Structure

```typescript
const contentHtml = `
  <h2>Introduction</h2>
  <p>Welcome paragraph explaining the purpose...</p>
  
  <h2>Terms of Use</h2>
  <ul>
    <li>First term</li>
    <li>Second term</li>
  </ul>
  
  <h2>Data Privacy</h2>
  <p>Information about data handling...</p>
  
  <h2>Limitations</h2>
  <p>Liability limitations and disclaimers...</p>
`;

const postfixHtml = `
  <h3>Contact Information</h3>
  <p>Email: support@example.com</p>
  <p>Phone: +41 XX XXX XX XX</p>
  
  <h3>Effective Date</h3>
  <p>These terms are effective as of January 1, 2024</p>
`;
```

## HTML Content Guidelines

### Supported HTML Elements

The component supports standard HTML elements:
- Paragraphs: `<p>`
- Headings: `<h2>`, `<h3>`, `<h4>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Emphasis: `<strong>`, `<em>`, `<b>`, `<i>`
- Links: `<a href="...">`
- Line breaks: `<br>`
- Divisions: `<div>`, `<span>`

### Best Practices

1. **Semantic HTML**: Use appropriate heading levels (start with h2)
2. **Readability**: Break content into logical sections
3. **Lists**: Use lists for multiple related items
4. **Links**: Include descriptive link text
5. **Whitespace**: Use paragraphs to separate ideas

Example:

```html
<h2>Your Rights</h2>
<p>As a user of this application, you have the following rights:</p>
<ul>
  <li>Right to access your data</li>
  <li>Right to request data deletion</li>
  <li>Right to data portability</li>
</ul>

<h2>Questions?</h2>
<p>
  If you have questions about these terms, please 
  <a href="/contact">contact our support team</a>.
</p>
```

## Interactive Example

Customize all aspects of the component and see changes in real-time:

<DisclaimerViewExample />

## Events

The component itself doesn't emit events directly. For handling user acceptance, wrap it with your own logic:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const accepted = ref(false);

function handleAccept() {
  if (accepted.value) {
    console.log('User accepted the disclaimer');
    // Handle acceptance logic
  }
}
</script>

<template>
  <div>
    <DisclaimerView
      app-name="My App"
      confirmation-text="I accept"
      disclaimer-version="1.0.0"
    />
    
    <UButton @click="handleAccept" :disabled="!accepted">
      Continue
    </UButton>
  </div>
</template>
```

## Styling

The component uses the Kanton Basel-Stadt design system with responsive styling:

### Layout
- Automatic text wrapping for readability
- Optimal line length for content
- Consistent spacing between sections
- Mobile-friendly touch targets

### Typography
- Clear heading hierarchy
- Readable body text size
- Proper line height for readability
- Consistent font family from design system

## Accessibility

- **Semantic HTML**: Uses proper HTML5 semantic elements
- **Heading Hierarchy**: Logical heading structure (h2 → h3 → h4)
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper labels and ARIA attributes
- **Color Contrast**: Meets WCAG AA standards
- **Focus Indicators**: Clear visual focus states

## Use Cases

- **Modal Content**: Primary use in disclaimer modals
- **Page Content**: Full-page disclaimer displays
- **Settings Panel**: Display terms in settings/preferences
- **Onboarding Flow**: Show terms during user onboarding
- **Legal Pages**: Display on dedicated legal/terms pages
- **Admin Interface**: Show agreements in admin panels
- **Print-Friendly**: Can be styled for printing

## Integration with Other Components

### With Disclaimer Modal

```vue
<template>
  <UModal v-model="showDisclaimer">
    <DisclaimerView
      app-name="My App"
      confirmation-text="I accept"
      disclaimer-version="1.0.0"
      :content-html="content"
    />
  </UModal>
</template>
```

### With DisclaimerPage

The `DisclaimerPage` component uses `DisclaimerView` internally:

```vue
<template>
  <!-- DisclaimerPage wraps DisclaimerView with page layout -->
  <DisclaimerPage
    app-name="My App"
    confirmation-text="I accept"
    disclaimer-version="1.0.0"
  />
</template>
```

### With Custom Layout

```vue
<template>
  <div class="custom-layout">
    <header>
      <h1>Legal Notice</h1>
    </header>
    
    <main>
      <DisclaimerView
        app-name="My App"
        confirmation-text="I acknowledge"
        disclaimer-version="1.0.0"
        :content-html="content"
      />
    </main>
    
    <footer>
      <p>© 2024 My Organization</p>
    </footer>
  </div>
</template>
```

## Versioning Strategy

Track changes to your disclaimer with semantic versioning:

- **Major (1.0.0 → 2.0.0)**: Significant legal changes requiring re-acceptance
- **Minor (1.0.0 → 1.1.0)**: Additional terms or clarifications
- **Patch (1.0.0 → 1.0.1)**: Typo fixes or minor wording improvements

```vue
<template>
  <!-- Initial version -->
  <DisclaimerView disclaimer-version="1.0.0" ... />
  
  <!-- Added new terms -->
  <DisclaimerView disclaimer-version="1.1.0" ... />
  
  <!-- Major legal update -->
  <DisclaimerView disclaimer-version="2.0.0" ... />
</template>
```

## Related Components

- [Disclaimer](./disclaimer.md) - Modal wrapper for DisclaimerView
- [DisclaimerPage](./disclaimerpage.md) - Full-page wrapper for DisclaimerView
- [DisclaimerButton](./disclaimerbutton.md) - Button to trigger disclaimer display
- [NavigationBar](./navigationbar.md) - Navigation with disclaimer access

## Browser Support

Works in all modern browsers that support:
- Vue 3
- Nuxt 3
- Modern JavaScript (ES6+)
- CSS Flexbox and Grid
- localStorage (for parent components)

## Troubleshooting

**Content not rendering:**
- Verify HTML strings are properly escaped
- Check for unclosed HTML tags
- Ensure content is passed as string, not object

**Styling issues:**
- Import required CSS from common-ui.bs.js
- Check for CSS conflicts with global styles
- Verify Tailwind CSS configuration

**Checkbox not working:**
- Ensure parent component handles checkbox state
- Check event handlers are properly bound
- Verify v-model bindings if used

**Layout problems:**
- Check container width constraints
- Verify responsive breakpoints
- Test on different screen sizes