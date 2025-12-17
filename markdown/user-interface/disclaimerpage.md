---
outline: deep
---

<script setup lang="ts">
import { DisclaimerPage } from '@dcc-bs/common-ui.bs.js/components';
import UiContainer from '../../components/UiContainer.vue';

const code = `<template>
    <DisclaimerPage
        contentHtml="<h2>Disclaimer</h2><p>This is the main disclaimer content. Please read and accept the terms to proceed.</p>"
    />
</template>`
</script>

# DisclaimerPage

The `DisclaimerPage` component provides a full-page disclaimer view that users see before accessing the application. It displays disclaimer content, terms of service, or usage guidelines in a dedicated page format with an acceptance mechanism.

## Preview

<UiContainer :code="code">
    <template #element>
        <DisclaimerPage
            contentHtml="<h2>Disclaimer</h2> <p>This is the main disclaimer content. Please read and accept the terms to proceed.</p>" />
    </template>
</UiContainer>


## Props

| Prop                | Type     | Required | Description                                                           |
| ------------------- | -------- | -------- | --------------------------------------------------------------------- |
| `contentHtml`       | `string` | No       | Main HTML content for the disclaimer body                             |
| `postfixHtml`       | `string` | No       | HTML content displayed after main content (e.g., contact info)        |

## Usage

Use as a standalone page component:

```vue
<template>
  <DisclaimerPage
    app-name="My Application"
    confirmation-text="I have read and understood the terms and conditions."
  />
</template>
```

## Related Components

- [Disclaimer](./disclaimer.md) - Modal version of the disclaimer
- [DisclaimerButton](./disclaimerbutton.md) - Button to re-trigger disclaimer
- [DisclaimerView](./disclaimerview.md) - Reusable disclaimer content component
- [NavigationBar](./navigationbar.md) - Navigation with disclaimer access
