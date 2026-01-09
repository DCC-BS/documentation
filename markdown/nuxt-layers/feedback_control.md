---
outline: deep
editLink: true
---

# Feedback Control Layer

The feedback control layer provides a comprehensive, user-friendly feedback collection system for DCC-BS Nuxt applications. It enables users to submit feedback directly from your application, with support for ratings, file attachments, and seamless integration with GitHub issues.

## Overview

The feedback control layer includes:

1. **`FeedbackControl` Component** - A ready-to-use Vue component for feedback collection
2. **API Integration** - Automatically creates GitHub issues from user feedback
3. **File Upload Support** - Allows users to attach files (screenshots, logs, etc.)
4. **Rating System** - Emoji-based rating for quick sentiment analysis
5. **Form Validation** - Built-in validation using Zod schemas
6. **Internationalization** - Full i18n support for multi-language applications
7. **Responsive Design** - Mobile-friendly interface with smooth animations

## How It Works

The feedback control layer provides a floating feedback button that opens a comprehensive feedback form. When users submit feedback:

1. **User opens feedback** → Clicks the floating button
2. **Fills in the form** → Selects rating, writes message, provides email, adds attachments
3. **Form validation** → Client-side validation ensures data integrity
4. **Submission to API** → Form data sent to `/api/feedback` endpoint
5. **GitHub integration** → Feedback is automatically converted to a GitHub issue
6. **Success feedback** → User sees confirmation with animation
7. **Form reset** → Form resets after 3 seconds, ready for next feedback

### Architecture

```
Your Nuxt App
    ↓
  FeedbackControl Component
    ↓
  /api/feedback endpoint
    ↓
  GitHub API
    ↓
  GitHub Issue created
```

## Quick Start

### 1. Add Feedback Control Layer to Your Project

In your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/feedback-control', { install: true }]
  ]
})
```

### 2. Configure GitHub Integration

Set the required environment variables in your `.env` file:

```bash
FEEDBACK_REPO=Feedback # Repository name where the issue will be created
FEEDBACK_REPO_OWNER=DCC-BS # Repository owner name where the issue will be created
FEEDBACK_PROJECT=Test # Project name used in the title of the issue
GITHUB_TOKEN=your_github_token # GitHub token with read & wirte access to issues and content
```

Those variables are only used during runtime, they do not need to be set during build time.

### 3. Use Feedback Control in Your App

Add the `FeedbackControl` component to your layout or a specific page:

```vue
<script setup lang="ts">
// No setup needed - just use the component
</script>

<template>
  <div>
    <!-- Your application content -->
    
    <!-- Feedback button appears automatically -->
    <FeedbackControl />
  </div>
</template>
```

## Configuration

The feedback control layer requires several environment variables to function correctly.

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `FEEDBACK_REPO` | Yes | Name of the GitHub repository for feedback issues | `Feedback` |
| `FEEDBACK_REPO_OWNER` | Yes | GitHub organization or username that owns the repository | `DCC-BS` |
| `FEEDBACK_PROJECT` | Yes | GitHub project name for organization | `Test` |
| `GITHUB_TOKEN` | Yes | Personal access token with `content` and `issues` read & write permissions | `ghp_xxxxxxxxxxxx` |

### GitHub Token Setup

To create a GitHub token for the feedback control:

1. Go to **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Give it a descriptive name (e.g., "Feedback Control")
4. Select only repositories and add you repository
5. Select the following permissions:
   - ✅ `contents` (read and write content)
   - ✅ `issues` (read and write issues)
5. Click **Generate token**
6. Copy the token immediately (you won't see it again)

### Component Props

The `FeedbackControl` component accepts the following optional prop:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultMail` | `string` | `""` | Pre-fill the email address field |

**Example:**

```vue
<template>
  <FeedbackControl defaultMail="user@example.com" />
</template>
```

## Component Features

### Rating System

The feedback control includes a 5-level emoji-based rating system:

| Emoji |
 Value | Description |
|-------|-------|-------------|
| 😕 | `poor` | Very unsatisfied |
| 😐 | `okay` | Somewhat satisfied |
| 🙂 | `good` | Satisfied |
| 😀 | `great` | Very satisfied |
| 🤩 | `excellent` | Extremely satisfied |

Users click on the emoji to select their rating, providing quick sentiment analysis for your team.

### Form Fields

The feedback form includes:

1. **Rating Selection** (Required)
   - Five emoji buttons for quick rating selection
   - Visual feedback when selected (highlighted border and background)

2. **Message** (Required)
   - Multi-line text area for detailed feedback
   - Placeholder text guides users
   - Minimum validation to ensure meaningful feedback

3. **Email** (Optional)
   - Email input for follow-up contact
   - Email format validation
   - Optional: users can leave blank for anonymous feedback

4. **File Attachments** (Optional)
   - Upload up to 2 files
   - Maximum file size: 75MB per file
   - Drag-and-drop support
   - File type validation

### Validation

The feedback control uses Zod for comprehensive form validation:

- **Rating**: Must be selected (one of the 5 values)
- **Message**: Required, trimmed to ensure non-empty content
- **Email**: Valid email format if provided
- **Attachments**: 
  - Maximum 2 files
  - Maximum 75MB per file
  - File size validation before upload

## API Endpoint

The feedback control layer creates a server API endpoint at `/api/feedback` that processes form submissions.

### Request Format

**POST** `/api/feedback`

```typescript
interface FeedbackBody {
  rating: 'poor' | 'okay' | 'good' | 'great' | 'excellent';
  message: string;
  email?: string;
  attachments: FeedbackAttachment[];
}

interface FeedbackAttachment {
  base64: string;
  fileName: string;
}
```

### GitHub Issue Format

The API creates a GitHub issue with the following structure:

**Title:**
```
[Rating] Feedback from user@example.com
```

**Body:**
```markdown
## Feedback Details

- **Rating**: 😊 good
- **Email**: user@example.com

## Message

This is the feedback message provided by the user.

## Attachments

- [screenshot.png](https://github.com/DCC-BS/Feedback/assets/...)
```

## Styling and Customization

The feedback control uses Nuxt UI components for consistent styling:

### Built-in Styles

The component uses these Nuxt UI components:
- `UButton` - Submit button and close button
- `UPopover` - Dropdown container
- `UTextarea` - Message input
- `UInput` - Email input
- `UAlert` - Error messages
- `UFileUpload` - File upload component

### Custom Styling

You can customize the appearance using CSS overrides:

```vue
<template>
  <div>
    <FeedbackControl />
  </div>
</template>

<style>
/* Customize feedback button */
#feedback-control button {
  /* Your custom styles */
}

/* Customize form container */
#feedback-control .p-2 {
  /* Your custom styles */
}
</style>
```

### Position Customization

The feedback button is positioned at `bottom-4 right-4` (16px from bottom and right). You can modify this by:

1. Forking the layer
2. Editing the position classes in `feedback-control/app/components/feedback-control.vue`
3. Or using CSS to override the position:

```css
#feedback-control {
  bottom: 32px !important;
  right: 32px !important;
}
```

## Internationalization

The feedback control layer includes full i18n support with translations for all user-facing text.

### Available Translations

The component includes translations for:

- Button labels
- Form field labels
- Placeholder text
- Help text
- Error messages
- Success messages
- Accessibility labels (aria-labels)

### Adding Custom Translations

To add or customize translations, create an i18n configuration file:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' }
    ],
    defaultLocale: 'en'
  }
})
```

Add translations for the feedback namespace:

```json
// locales/en.json
{
  "feedback": {
    "button": "Feedback",
    "title": "Submit Feedback",
    "rating_label": "How was your experience?",
    "ratings": {
      "poor": "Poor",
      "okay": "Okay",
      "good": "Good",
      "great": "Great",
      "excellent": "Excellent"
    },
    "message_label": "Your feedback",
    "message_placeholder": "Tell us what you think...",
    "email_label": "Email (optional)",
    "email_placeholder": "your@email.com",
    "email_help": "Leave blank for anonymous feedback",
    "attachments_label": "Attachments",
    "attachments_help": "Add up to {maxFiles} files, max {maxSize} each",
    "submit": "Submit Feedback",
    "submitting": "Submitting...",
    "success_title": "Thank you!",
    "success_message": "Your feedback has been submitted successfully.",
    "close": "Close",
    "aria_label": "Open feedback form"
  }
}
```

## Examples

### Basic Usage

```vue
<template>
  <div>
    <h1>My Application</h1>
    <p>Welcome to the app!</p>
    
    <!-- Feedback control appears automatically -->
    <FeedbackControl />
  </div>
</template>
```

### Pre-fill Email

```vue
<script setup lang="ts">
import { useAppAuth } from '#layers/auth/app/composables/useAuth';

const { data } = useAppAuth();
const userEmail = computed(() => data?.user?.email || '');
</script>

<template>
  <div>
    <!-- Pre-fill with authenticated user's email -->
    <FeedbackControl :defaultMail="userEmail" />
  </div>
</template>
```

## Related Documentation

- [Authentication Layer](./auth.md) - For integrating with user authentication
- [Logger Layer](./logger.md) - For logging feedback submissions
- [Backend Communication](./backend_communication.md) - For API integration patterns
- [Nuxt Layers Overview](./index.md) - Main documentation
