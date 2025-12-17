---
outline: deep
---

<script setup lang="ts">
import UndoRedoButtonsExample from '../../components/UndoRedoButtonsExample.vue'
</script>

# UndoRedoButtons

The `UndoRedoButtons` component provides undo and redo functionality with keyboard shortcuts and tooltips. The buttons are automatically disabled when undo/redo actions are not available, providing a consistent user experience across applications.

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
  // Implement undo logic
  console.log('Undo action');
}

function handleRedo() {
  // Implement redo logic
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

function addToHistory(state) {
  // Remove any future history after current index
  history.value = history.value.slice(0, currentIndex.value + 1);
  // Add new state
  history.value.push(state);
  currentIndex.value = history.value.length - 1;
}

function undo() {
  if (canUndo.value) {
    currentIndex.value--;
    // Apply the state at currentIndex
    applyState(history.value[currentIndex.value]);
  }
}

function redo() {
  if (canRedo.value) {
    currentIndex.value++;
    // Apply the state at currentIndex
    applyState(history.value[currentIndex.value]);
  }
}

function applyState(state) {
  // Your logic to apply the state
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

### Form Editing

Use with form state management:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';

const formData = ref({ name: '', email: '' });
const formHistory = ref([{ ...formData.value }]);
const historyIndex = ref(0);

// Track changes
watch(formData, (newData) => {
  // Only add to history on intentional changes
  if (!isUndoRedoAction.value) {
    formHistory.value = formHistory.value.slice(0, historyIndex.value + 1);
    formHistory.value.push({ ...newData });
    historyIndex.value++;
  }
}, { deep: true });

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < formHistory.value.length - 1);

const isUndoRedoAction = ref(false);

function undo() {
  if (canUndo.value) {
    isUndoRedoAction.value = true;
    historyIndex.value--;
    formData.value = { ...formHistory.value[historyIndex.value] };
    nextTick(() => {
      isUndoRedoAction.value = false;
    });
  }
}

function redo() {
  if (canRedo.value) {
    isUndoRedoAction.value = true;
    historyIndex.value++;
    formData.value = { ...formHistory.value[historyIndex.value] };
    nextTick(() => {
      isUndoRedoAction.value = false;
    });
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <UndoRedoButtons 
        :can-undo="canUndo" 
        :can-redo="canRedo"
        @undo="undo"
        @redo="redo"
      />
    </div>
    
    <form class="space-y-4">
      <input v-model="formData.name" placeholder="Name" />
      <input v-model="formData.email" placeholder="Email" />
    </form>
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

function updateContent(newContent) {
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
    <div class="toolbar">
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
      class="w-full h-64 p-4 border"
    />
  </div>
</template>
```

### Canvas/Drawing Application

Use with canvas operations:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const canvasStates = ref([]);
const currentStateIndex = ref(-1);

function saveCanvasState(imageData) {
  // Remove any states after current index
  canvasStates.value = canvasStates.value.slice(0, currentStateIndex.value + 1);
  canvasStates.value.push(imageData);
  currentStateIndex.value++;
}

const canUndo = computed(() => currentStateIndex.value > 0);
const canRedo = computed(() => currentStateIndex.value < canvasStates.value.length - 1);

function undo() {
  if (canUndo.value) {
    currentStateIndex.value--;
    restoreCanvasState(canvasStates.value[currentStateIndex.value]);
  }
}

function redo() {
  if (canRedo.value) {
    currentStateIndex.value++;
    restoreCanvasState(canvasStates.value[currentStateIndex.value]);
  }
}

function restoreCanvasState(state) {
  // Restore canvas to saved state
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(state, 0, 0);
}
</script>

<template>
  <div>
    <div class="toolbar">
      <UndoRedoButtons 
        :can-undo="canUndo" 
        :can-redo="canRedo"
        @undo="undo"
        @redo="redo"
      />
    </div>
    
    <canvas ref="canvasRef" width="800" height="600"></canvas>
  </div>
</template>
```

## Interactive Example

Try the interactive example to see how the component works:

<UndoRedoButtonsExample />

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

## Styling

The component uses Nuxt UI button styling:

- **Default**: Ghost variant for minimal appearance
- **Icons**: Standard undo/redo icons
- **Size**: Small size for toolbar integration
- **Spacing**: Grouped together with minimal gap

### Custom Styling

Wrap the component to add custom styling:

```vue
<template>
  <div class="custom-undo-redo">
    <UndoRedoButtons 
      :can-undo="canUndo" 
      :can-redo="canRedo"
      @undo="undo"
      @redo="redo"
    />
  </div>
</template>

<style scoped>
.custom-undo-redo {
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 0.5rem;
}
</style>
```

## Accessibility

- **Keyboard Navigation**: Full Tab key support to navigate between buttons
- **Keyboard Shortcuts**: Standard shortcuts for undo/redo
- **ARIA Labels**: Proper labels for screen readers
- **Tooltips**: Show keyboard shortcuts on hover
- **Disabled State**: Properly announced to screen readers
- **Focus Indicators**: Clear visual focus states

## Best Practices

1. **State Management**: Maintain a clear history of states
2. **Memory Management**: Limit history size for large applications
3. **Deep Cloning**: Clone objects deeply to avoid reference issues
4. **Action Granularity**: Group related changes into single history entries
5. **User Feedback**: Provide visual feedback when undo/redo happens
6. **Persistence**: Consider persisting history for critical applications
7. **Clear Communication**: Show current state in UI after undo/redo
8. **Testing**: Test edge cases (empty history, single item, etc.)

## History Management Patterns

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
  
  // Limit history size
  if (history.states.length > MAX_HISTORY_SIZE) {
    history.states.shift();
  } else {
    history.currentIndex++;
  }
}
```

### Command Pattern

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class CommandHistory {
  private commands: Command[] = [];
  private currentIndex = -1;

  execute(command: Command) {
    command.execute();
    this.commands = this.commands.slice(0, this.currentIndex + 1);
    this.commands.push(command);
    this.currentIndex++;
  }

  undo() {
    if (this.canUndo()) {
      this.commands[this.currentIndex].undo();
      this.currentIndex--;
    }
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      this.commands[this.currentIndex].execute();
    }
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
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
- **Spreadsheets**: Cell editing and formula changes
- **Diagram Editors**: Flow chart and diagram tools
- **Photo Editors**: Image manipulation
- **Configuration Panels**: Settings management

## Related Components

- [NavigationBar](./navigationbar.md) - Navigation component
- [SplitView](./splitview.md) - Split view for editor layouts
- [SplitContainer](./splitcontainer.md) - Container for split content

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

**Events not firing:**
- Check event handler binding
- Verify component is properly imported
- Check Vue devtools for event emissions
- Ensure no errors in event handlers

## Performance Optimization

### Debounce History Updates

```vue
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';

const addToHistory = useDebounceFn((state) => {
  // Add to history
  history.value.push(state);
}, 500);
</script>
```

### Use Diffs Instead of Full States

```typescript
interface StateDiff {
  path: string;
  oldValue: any;
  newValue: any;
}

// Store only what changed
function createDiff(oldState, newState): StateDiff[] {
  // Calculate differences
  return differences;
}

// Apply diff to restore state
function applyDiff(state, diff: StateDiff[]) {
  // Apply changes
  return newState;
}
```
