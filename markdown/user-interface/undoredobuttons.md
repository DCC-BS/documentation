---
outline: deep
---

<script setup lang="ts">
import { ref } from 'vue';
import UiContainer from '../../components/UiContainer.vue';
import { UndoRedoButtons } from "@dcc-bs/common-ui.bs.js/components";

const canUndo = ref(false);
const canRedo = ref(false);
const history = ref<string[]>(["Initial state"]);
const currentIndex = ref(0);

function addAction(action: string) {
    history.value = history.value.slice(0, currentIndex.value + 1);
    history.value.push(action);
    currentIndex.value = history.value.length - 1;
    updateButtons();
}

function handleUndo() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        updateButtons();
    }
}

function handleRedo() {
    if (currentIndex.value < history.value.length - 1) {
        currentIndex.value++;
        updateButtons();
    }
}

function updateButtons() {
    canUndo.value = currentIndex.value > 0;
    canRedo.value = currentIndex.value < history.value.length - 1;
}

function resetHistory() {
    history.value = ["Initial state"];
    currentIndex.value = 0;
    updateButtons();
}

const code = `<template>
  <UndoRedoButtons 
    :can-undo="canUndo" 
    :can-redo="canRedo"
    @undo="handleUndo"
    @redo="handleRedo"
  />
</template>`;
</script>

# UndoRedoButtons

The `UndoRedoButtons` component provides undo and redo functionality with keyboard shortcuts and tooltips. The buttons are automatically disabled when undo/redo actions are not available, providing a consistent user experience across applications.

## Preview

<UiContainer :code="code">
    <template #element>
        <div class="flex flex-col gap-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800">
                    <strong>Info:</strong> The UndoRedoButtons component provides undo and redo functionality with keyboard shortcuts (Ctrl+Z for undo, Ctrl+Y or Ctrl+Shift+Z for redo) and tooltips. The buttons are automatically disabled when actions are not available.
                </p>
            </div>

            <div class="flex flex-col gap-3">
                <h4 class="text-lg font-semibold">Test the Undo/Redo functionality:</h4>
                <div class="flex gap-2">
                    <UButton
                        variant="solid"
                        icon="i-lucide-plus"
                        @click="addAction('Action ' + history.length)"
                    >
                        Add Action
                    </UButton>
                    <UButton
                        variant="outline"
                        icon="i-lucide-refresh-cw"
                        @click="resetHistory"
                    >
                        Reset History
                    </UButton>
                </div>

                <div class="border rounded-lg p-4 bg-gray-50">
                    <h4 class="font-semibold mb-2">History:</h4>
                    <ul class="space-y-1">
                        <li
                            v-for="(item, index) in history"
                            :key="index"
                            :class="[
                                'text-sm',
                                index === currentIndex
                                    ? 'font-bold text-blue-600'
                                    : 'text-gray-500',
                            ]"
                        >
                            {{ index === currentIndex ? '→ ' : '  ' }}{{ item }}
                            {{ index === currentIndex ? ' (Current)' : '' }}
                        </li>
                    </ul>
                </div>
            </div>

            <div class="border rounded-lg p-6 bg-white">
                <h4 class="text-lg font-semibold mb-4">Undo/Redo Controls:</h4>
                <UndoRedoButtons
                    :can-undo="canUndo"
                    :can-redo="canRedo"
                    @undo="handleUndo"
                    @redo="handleRedo"
                />
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-sm text-yellow-800">
                    <strong>Tip:</strong> Try using keyboard shortcuts:
                    <code class="bg-yellow-100 px-2 py-1 rounded">Ctrl+Z</code> for undo and
                    <code class="bg-yellow-100 px-2 py-1 rounded">Ctrl+Y</code> or
                    <code class="bg-yellow-100 px-2 py-1 rounded">Ctrl+Shift+Z</code> for redo.
                </p>
            </div>
        </div>
    </template>
</UiContainer>

## Features

- **Keyboard Shortcuts**: Built-in support for Ctrl+Z (undo) and Ctrl+Y/Ctrl+Shift+Z (redo)
- **Tooltips**: Helpful tooltips showing keyboard shortcuts
- **Auto-disable**: Buttons automatically disable when actions aren't available
- **Icon-based**: Clear visual indicators using standard icons
- **Accessibility**: Fully keyboard accessible with proper ARIA labels
- **Event-driven**: Simple event-based API for integration
- **i18n Support**: Internationalization for button labels and tooltips

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `canUndo` | `boolean` | Yes | - | Whether undo action is available |
| `canRedo` | `boolean` | Yes | - | Whether redo action is available |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@undo` | None | Emitted when the undo button is clicked or Ctrl+Z is pressed |
| `@redo` | None | Emitted when the redo button is clicked or Ctrl+Y/Ctrl+Shift+Z is pressed |

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

### With History Management

Implement a complete history system:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const history = ref(['Initial state']);
const currentIndex = ref(0);

const canUndo = computed(() => currentIndex.value > 0);
const canRedo = computed(() => currentIndex.value < history.value.length - 1);

function addToHistory(state: string) {
  history.value = history.value.slice(0, currentIndex.value + 1);
  history.value.push(state);
  currentIndex.value = history.value.length - 1;
}

function undo() {
  if (canUndo.value) {
    currentIndex.value--;
    applyState(history.value[currentIndex.value]);
  }
}

function redo() {
  if (canRedo.value) {
    currentIndex.value++;
    applyState(history.value[currentIndex.value]);
  }
}

function applyState(state: string) {
  console.log('Applying state:', state);
}
</script>

<template>
  <UndoRedoButtons 
    :can-undo="canUndo" 
    :can-redo="canRedo"
    @undo="undo"
    @redo="redo"
  />
</template>
```

### In a Toolbar

Add to a toolbar with other actions:

```vue
<template>
  <div class="toolbar flex items-center gap-2 p-2 border-b">
    <UButton variant="ghost" icon="i-lucide-save">
      Save
    </UButton>
    
    <div class="border-l h-6 mx-2"></div>
    
    <UndoRedoButtons 
      :can-undo="canUndo" 
      :can-redo="canRedo"
      @undo="handleUndo"
      @redo="handleRedo"
    />
    
    <div class="border-l h-6 mx-2"></div>
    
    <UButton variant="ghost" icon="i-lucide-settings">
      Settings
    </UButton>
  </div>
</template>
```

### Text Editor

Implement undo/redo for a text editor:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const content = ref('');
const contentHistory = ref(['']);
const historyIndex = ref(0);

function updateContent(newContent: string) {
  contentHistory.value = contentHistory.value.slice(0, historyIndex.value + 1);
  contentHistory.value.push(newContent);
  historyIndex.value++;
  content.value = newContent;
}

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < contentHistory.value.length - 1);

function undo() {
  if (canUndo.value) {
    historyIndex.value--;
    content.value = contentHistory.value[historyIndex.value];
  }
}

function redo() {
  if (canRedo.value) {
    historyIndex.value++;
    content.value = contentHistory.value[historyIndex.value];
  }
}
</script>

<template>
  <div class="editor">
    <div class="toolbar mb-2">
      <UndoRedoButtons 
        :can-undo="canUndo" 
        :can-redo="canRedo"
        @undo="undo"
        @redo="redo"
      />
    </div>
    
    <textarea 
      v-model="content"
      @input="updateContent($event.target.value)"
      class="w-full h-64 p-4 border rounded"
    />
  </div>
</template>
```

## Keyboard Shortcuts

The component automatically listens for keyboard shortcuts:

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl+Z` | Undo | Windows/Linux |
| `⌘+Z` | Undo | macOS |
| `Ctrl+Y` | Redo | Windows/Linux |
| `⌘+Y` | Redo | macOS |
| `Ctrl+Shift+Z` | Redo (alternative) | Windows/Linux/macOS |

### Keyboard Shortcut Behavior

- Shortcuts work globally when component is mounted
- Only trigger when respective action is available (`canUndo`/`canRedo`)
- Prevent default browser behavior for these shortcuts
- Work regardless of focus position in the document

## Button States

### Enabled State

- Buttons are clickable and visually active
- Hover effects are visible
- Cursor changes to pointer
- Keyboard shortcuts are active

### Disabled State

- Buttons appear grayed out
- Not clickable
- No hover effects
- Keyboard shortcuts are ignored
- Cursor shows "not-allowed"

## Best Practices

1. **State Management**: Maintain a clear history of states
2. **Memory Management**: Limit history size for large applications
3. **Deep Cloning**: Clone objects deeply to avoid reference issues
4. **Action Granularity**: Group related changes into single history entries
5. **User Feedback**: Provide visual feedback when undo/redo happens
6. **Clear Communication**: Show current state in UI after undo/redo
7. **Testing**: Test edge cases (empty history, single item, etc.)

## History Management Pattern

### Basic Array-based History

```typescript
interface HistoryManager<T> {
  states: T[];
  currentIndex: number;
}

function createHistory<T>(initialState: T): HistoryManager<T> {
  return {
    states: [initialState],
    currentIndex: 0
  };
}

function addState<T>(history: HistoryManager<T>, state: T) {
  history.states = history.states.slice(0, history.currentIndex + 1);
  history.states.push(state);
  history.currentIndex++;
}

function undo<T>(history: HistoryManager<T>): T | null {
  if (history.currentIndex > 0) {
    history.currentIndex--;
    return history.states[history.currentIndex];
  }
  return null;
}

function redo<T>(history: HistoryManager<T>): T | null {
  if (history.currentIndex < history.states.length - 1) {
    history.currentIndex++;
    return history.states[history.currentIndex];
  }
  return null;
}
```

### Limited History Size

```typescript
const MAX_HISTORY_SIZE = 50;

function addState<T>(history: HistoryManager<T>, state: T) {
  history.states = history.states.slice(0, history.currentIndex + 1);
  history.states.push(state);
  
  if (history.states.length > MAX_HISTORY_SIZE) {
    history.states.shift();
  } else {
    history.currentIndex++;
  }
}
```

## Use Cases

- **Text Editors**: Document editing with history
- **Form Builders**: Drag-and-drop form creation
- **Drawing Applications**: Canvas-based drawing tools
- **Code Editors**: Source code editing
- **Data Entry Forms**: Complex form editing
- **Design Tools**: UI/graphic design applications
- **Diagram Editors**: Flow chart and diagram tools
- **Photo Editors**: Image manipulation
- **Configuration Panels**: Settings management

## Related Components

- [NavigationBar](./navigationbar.md) - Navigation component
- [SplitView](./splitview.md) - Split view for editor layouts
- [SplitContainer](./splitcontainer.md) - Container for split content

## Accessibility

- **Keyboard Navigation**: Full Tab key support to navigate between buttons
- **Keyboard Shortcuts**: Standard shortcuts for undo/redo
- **ARIA Labels**: Proper labels for screen readers
- **Tooltips**: Show keyboard shortcuts on hover
- **Disabled State**: Properly announced to screen readers
- **Focus Indicators**: Clear visual focus states

## Browser Support

Works in all modern browsers that support:
- Vue 3
- Nuxt 3
- Keyboard Events API
- Modern JavaScript (ES6+)
- Nuxt UI

## Troubleshooting

**Keyboard shortcuts not working:**
- Verify component is mounted
- Check for conflicting keyboard shortcuts
- Ensure focus is within the document
- Check browser console for errors

**Buttons always disabled:**
- Verify `canUndo` and `canRedo` props are reactive
- Check that props are being updated correctly
- Ensure boolean values are being passed

**Memory issues with large history:**
- Implement history size limits
- Use command pattern for complex operations
- Consider storing diffs instead of full states
- Clear old history periodically

**Undo/redo not working correctly:**
- Ensure proper state cloning (deep copy)
- Check that history index is managed correctly
- Verify state application logic
- Test edge cases (empty history, etc.)