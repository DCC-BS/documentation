---
outline: deep
---

<script setup lang="ts">
import { ref } from 'vue';
import UiContainer from '../../../components/UiContainer.vue';
import { UndoRedoButtons } from "@dcc-bs/common-ui.bs.js/components";

const canUndo = ref(true);
const canRedo = ref(true);

function handleUndo() {
}

function handleRedo() {
}

const code = `<script setup lang=\"ts\">
import { ref } from \"vue\";

const canUndo = ref(false);
const canRedo = ref(false);

function handleUndo() {
    console.log(\"Undo action\");
}

function handleRedo() {
    console.log(\"Redo action\");
}
<\/script>
<template>
  <UndoRedoButtons 
    :can-undo=\"canUndo\" 
    :can-redo=\"canRedo\"
    @undo=\"handleUndo\"
    @redo=\"handleRedo\"
  />
</template>`;
</script>

# UndoRedoButtons

The `UndoRedoButtons` component provides undo and redo functionality with tooltips. The buttons are automatically disabled when undo/redo actions are not available, providing a consistent user experience across applications.

::: info Keyboard Shortcuts
The tooltips mention keyboard shortcuts (Ctrl+Z for undo and Ctrl+Y for redo), but these shortcuts are not implemented by the component itself. Applications using this component need to implement their own keyboard event handlers to support these shortcuts.
:::

## Localization

The tooltip text can be customized using the following localization keys:

| Key | Default Value | Description |
|-----|---------------|-------------|
| `common-ui.undo_tooltip` | "Undo (Ctrl+Z)" | Tooltip text for the undo button |
| `common-ui.redo_tooltip` | "Redo (Ctrl+Y)" | Tooltip text for the redo button |

Override these keys in your application's localization configuration to customize the tooltip text.

## Preview

<UiContainer :code="code">
    <template #element>
        <UndoRedoButtons
            :can-undo="canUndo"
            :can-redo="canRedo"
            @undo="handleUndo"
            @redo="handleRedo"
        />
    </template>
</UiContainer>

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `canUndo` | `boolean` | Yes | - | Whether undo action is available |
| `canRedo` | `boolean` | Yes | - | Whether redo action is available |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@undo` | None | Emitted when the undo button is clicked |
| `@redo` | None | Emitted when the redo button is clicked |

## Usage

### Basic Implementation

Simple undo/redo buttons:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const canUndo = ref(false);
const canRedo = ref(false);

function handleUndo() {
  console.log('Undo action');
}

function handleRedo() {
  console.log('Redo action');
}
</script>

<template>
  <UndoRedoButtons 
    :can-undo="canUndo" 
    :can-redo="canRedo"
    @undo="handleUndo"
    @redo="handleRedo"
  />
</template>
```

The `useUserFeedback` composable provides a unified interface for displaying toast notifications and error messages to users. It integrates with Nuxt UI's toast system and supports internationalization for API errors.

#### Return Values

The composable returns an object with the following functions:

**showToast(message, type, options)**

Display a toast notification.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | `string` | Yes | The message to display |
| `type` | `FeedbackType` | No | Type of feedback - `"error"`, `"success"`, `"info"`, or `"warning"`. Default is `"error"` |
| `options` | `Partial<Toast>` | No | Additional toast options (title, duration, etc.) |

**showError(error)**

Display an error message.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `error` | `Error \| ApiError` | Yes | An Error object or ApiError object with error details |

#### Types

```typescript
type FeedbackType = "error" | "success" | "info" | "warning";

// see also https://github.com/DCC-BS/communication.bs.js
type ApiError = {
  $type: "ApiError";
  errorId: string;
  debugMessage?: string;
  status: number;
};
```

#### Requirements

This composable requires:
- Nuxt UI module configured
- Nuxt i18n module configured (for API error translations)
- Translation keys in format `api_error.{errorId}` for API errors

#### Example Usage

```vue
<script setup lang="ts">
const { showToast, showError } = useUserFeedback();


// Show a success toast
function onSaveSuccess() {
  showToast("Data saved successfully!", "success");
}

// Show an error toast with custom duration
function onValidationError() {
  showToast("Please fill in all required fields", "error", {
    duration: 5000
  });
}

// Show a warning toast
function onWarning() {
  showToast("This action cannot be undone", "warning");
}

// Show an info toast
function onInfo() {
  showToast("Your changes are being processed", "info");
}

// Custom toast options
function showCustomToast() {
  showToast("Operation completed", "success", {
    title: "Success",
    duration: 10000,
    actions: [{
      label: "Undo",
      click: () => console.log("Undo clicked")
    }]
  });
}
</script>

<template>
  <div>
    <button @click="onSaveSuccess">Save</button>
    <button @click="fetchData">Fetch Data</button>
  </div>
</template>
```

#### API Error Handling

When using `showError` with an API error that has the `$type: "ApiError"` property, the composable will automatically look up the translation key based on the `errorId`:

```ts
import { apiFetch, isApiError } from "@DCC-BS/communication.bs.js";

const { showError } = useUserFeedback();

// Handle API errors
async function fetchData() {
    const response = await apiFetch<Data>("/api/data");
    
    if(isApiError(response)) {
      showError(response);
      return;
    }
    
    // Process the successful response
}
```

Make sure to define your API error translations in your i18n configuration:

```json
{
  "api_error": {
    "not_found": "The requested resource was not found",
    "unauthorized": "You are not authorized to perform this action",
    "server_error": "An unexpected server error occurred"
  }
}
```
