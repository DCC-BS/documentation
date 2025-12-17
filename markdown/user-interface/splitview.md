---
outline: deep
---

<script setup lang="ts">
import { ref } from 'vue';
import UiContainer from '../../components/UiContainer.vue';
import { SplitView } from "@dcc-bs/common-ui.bs.js/components";

const isHorizontal = ref(false);
const aPaneContent = ref("This is Pane A. Drag the resizer to adjust the split.");
const bPaneContent = ref("This is Pane B. The split view supports both horizontal and vertical orientations.");

const code = `<template>
  <SplitView>
    <template #a>
      <div>Left Pane Content</div>
    </template>
    <template #b>
      <div>Right Pane Content</div>
    </template>
  </SplitView>
</template>`;
</script>

# SplitView

The `SplitView` component allows you to create a resizable split view layout with two panes separated by a draggable resizer. It supports both horizontal and vertical orientations, giving users full control over the layout proportions.

## Preview

<UiContainer :code="code">
    <template #element>
        <div class="flex flex-col gap-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800">
                    <strong>Info:</strong> The SplitView component allows you to create a resizable split view layout. It supports both horizontal and vertical orientations. Drag the resizer to adjust the split.
                </p>
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <input
                        id="is-horizontal"
                        v-model="isHorizontal"
                        type="checkbox"
                        class="w-4 h-4"
                    />
                    <label for="is-horizontal" class="text-sm font-medium">
                        Horizontal Split (unchecked = vertical)
                    </label>
                </div>

                <label class="text-sm font-medium">Pane A Content:</label>
                <textarea
                    v-model="aPaneContent"
                    class="border rounded px-3 py-2"
                    rows="3"
                    placeholder="Pane A content..."
                />

                <label class="text-sm font-medium">Pane B Content:</label>
                <textarea
                    v-model="bPaneContent"
                    class="border rounded px-3 py-2"
                    rows="3"
                    placeholder="Pane B content..."
                />
            </div>

            <div class="border rounded-lg overflow-hidden" style="height: 400px;">
                <SplitView :is-horizontal="isHorizontal">
                    <template #a>
                        <div class="p-4 bg-blue-50 h-full overflow-auto">
                            <h3 class="text-lg font-semibold mb-2">Pane A</h3>
                            <p>{{ aPaneContent }}</p>
                        </div>
                    </template>
                    <template #b>
                        <div class="p-4 bg-green-50 h-full overflow-auto">
                            <h3 class="text-lg font-semibold mb-2">Pane B</h3>
                            <p>{{ bPaneContent }}</p>
                        </div>
                    </template>
                </SplitView>
            </div>
        </div>
    </template>
</UiContainer>

## Features

- **Resizable Panes**: Users can drag the resizer to adjust pane sizes
- **Dual Orientation**: Supports both horizontal and vertical splits
- **Smooth Resizing**: Fluid drag interaction with visual feedback
- **Customizable Styling**: Style each pane and resizer independently
- **Flexible Content**: Accepts any content in either pane
- **Keyboard Accessible**: Resizer can be controlled with keyboard
- **Touch Support**: Works on touch devices

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `aPaneStyle` | `string` | No | `""` | Custom CSS classes for the first pane (pane A) |
| `bPaneStyle` | `string` | No | `""` | Custom CSS classes for the second pane (pane B) |
| `splitViewStyle` | `string` | No | `""` | Custom CSS classes for the split view container |
| `resizerStyle` | `string` | No | `""` | Custom CSS classes for the resizer element |
| `resizerInnerStyle` | `string` | No | `""` | Custom CSS classes for the inner resizer element |
| `isHorizontal` | `boolean` | No | `false` | Determines the orientation (false = vertical, true = horizontal) |

## Slots

| Slot | Description |
|------|-------------|
| `a` | Content for the first pane (left pane in vertical mode, top pane in horizontal mode) |
| `b` | Content for the second pane (right pane in vertical mode, bottom pane in horizontal mode) |

## Usage

### Basic Implementation (Vertical Split)

Create a simple vertical split view:

```vue
<template>
  <SplitView>
    <template #a>
      <div>Left Pane Content</div>
    </template>
    <template #b>
      <div>Right Pane Content</div>
    </template>
  </SplitView>
</template>
```

### Horizontal Split

Create a horizontal split (top/bottom):

```vue
<template>
  <SplitView :is-horizontal="true">
    <template #a>
      <div>Top Pane Content</div>
    </template>
    <template #b>
      <div>Bottom Pane Content</div>
    </template>
  </SplitView>
</template>
```

### With Custom Styling

Apply custom styles to panes and resizer:

```vue
<template>
  <SplitView
    a-pane-style="bg-blue-50 p-4"
    b-pane-style="bg-green-50 p-4"
    resizer-style="bg-gray-300"
  >
    <template #a>
      <div>Styled Left Pane</div>
    </template>
    <template #b>
      <div>Styled Right Pane</div>
    </template>
  </SplitView>
</template>
```

### Code Editor Layout

Perfect for code editor with preview:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const code = ref(`<template>
  <div>Hello World</div>
</template>`);
</script>

<template>
  <SplitView a-pane-style="bg-gray-900">
    <template #a>
      <div class="p-4">
        <h3 class="text-white mb-2">Code Editor</h3>
        <textarea 
          v-model="code"
          class="w-full h-full bg-gray-800 text-white p-2 font-mono"
        />
      </div>
    </template>
    <template #b>
      <div class="p-4">
        <h3 class="mb-2">Preview</h3>
        <div class="border rounded p-4">
          <!-- Rendered preview -->
        </div>
      </div>
    </template>
  </SplitView>
</template>
```

### File Browser and Content

Classic two-pane file browser layout:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const files = ref([
  { name: 'document.pdf', size: '2.4 MB' },
  { name: 'image.jpg', size: '1.8 MB' },
  { name: 'report.docx', size: '856 KB' },
]);

const selectedFile = ref(null);
</script>

<template>
  <SplitView a-pane-style="bg-gray-50">
    <template #a>
      <div class="p-4">
        <h3 class="font-bold mb-4">Files</h3>
        <ul class="space-y-2">
          <li 
            v-for="file in files" 
            :key="file.name"
            class="p-2 hover:bg-gray-200 cursor-pointer rounded"
            @click="selectedFile = file"
          >
            <div class="font-medium">{{ file.name }}</div>
            <div class="text-sm text-gray-600">{{ file.size }}</div>
          </li>
        </ul>
      </div>
    </template>
    <template #b>
      <div class="p-4">
        <h3 class="font-bold mb-4">Details</h3>
        <div v-if="selectedFile">
          <p>Selected: {{ selectedFile.name }}</p>
          <p>Size: {{ selectedFile.size }}</p>
        </div>
        <div v-else class="text-gray-500">
          Select a file to view details
        </div>
      </div>
    </template>
  </SplitView>
</template>
```

### Dashboard with Sidebar

Dashboard layout with resizable sidebar:

```vue
<template>
  <SplitView a-pane-style="bg-gray-800 text-white">
    <template #a>
      <nav class="p-4">
        <h2 class="text-xl font-bold mb-4">Menu</h2>
        <ul class="space-y-2">
          <li><a href="#" class="block p-2 hover:bg-gray-700 rounded">Dashboard</a></li>
          <li><a href="#" class="block p-2 hover:bg-gray-700 rounded">Projects</a></li>
          <li><a href="#" class="block p-2 hover:bg-gray-700 rounded">Settings</a></li>
        </ul>
      </nav>
    </template>
    <template #b>
      <main class="p-6">
        <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
        <p>Main content area</p>
      </main>
    </template>
  </SplitView>
</template>
```

## Orientation Modes

### Vertical Split (Default)

```
┌─────────┬─────────┐
│         │         │
│ Pane A  │ Pane B  │
│  (a)    │  (b)    │
│         │         │
└─────────┴─────────┘
```

- `isHorizontal="false"` (default)
- Panes are side-by-side (left/right)
- Resizer is vertical
- Drag left/right to resize

### Horizontal Split

```
┌───────────────────┐
│     Pane A (a)    │
├───────────────────┤
│     Pane B (b)    │
└───────────────────┘
```

- `isHorizontal="true"`
- Panes are stacked (top/bottom)
- Resizer is horizontal
- Drag up/down to resize

## Resizer Behavior

The resizer between panes:
- **Visual Indicator**: Shows where to drag
- **Hover State**: Changes appearance on hover
- **Active State**: Visual feedback during dragging
- **Cursor**: Changes to indicate resize direction
- **Smooth Dragging**: Responsive to mouse/touch movement
- **Keyboard Support**: Can be controlled with arrow keys

## Best Practices

1. **Set Container Height**: Ensure parent container has explicit height
2. **Overflow Handling**: Use `overflow-auto` for scrollable content
3. **Content Padding**: Add padding to pane content for readability
4. **Responsive Design**: Consider mobile layouts (may need different approach)
5. **Initial Proportions**: Default split is usually 50/50
6. **Performance**: Optimize content rendering during resize

## Use Cases

- **Code Editors**: Code on left, preview on right
- **File Browsers**: Directory tree and file content
- **Email Clients**: Message list and message content
- **Admin Panels**: Sidebar navigation and main content
- **Documentation**: Table of contents and content
- **Data Analysis**: Data table and visualization
- **Design Tools**: Layers panel and canvas
- **Chat Applications**: Contact list and conversation
- **IDE Layouts**: Multiple code panes
- **Comparison Views**: Side-by-side comparisons

## Comparison with SplitContainer

| Feature | SplitView | SplitContainer |
|---------|-----------|----------------|
| Resizing | User resizable | Fixed layout |
| Header | No header | Has header slot |
| Orientation | Vertical/Horizontal | Vertical only |
| Mobile | Same layout | Auto-stacks |
| Use Case | Interactive apps | Content display |

Choose **SplitView** when:
- Users need to adjust pane sizes
- Building interactive tools/editors
- Layout needs to be flexible
- Desktop-focused application

Choose **SplitContainer** when:
- Fixed layout is preferred
- Need a header section
- Mobile-friendly stacking is required
- Simple content display

## Related Components

- [SplitContainer](./splitcontainer.md) - Fixed split layout with header
- [UCard](https://ui.nuxt.com/components/card) - Nuxt UI card component

## Accessibility

- **Keyboard Navigation**: Resizer is keyboard accessible
- **Focus Indicators**: Clear focus states on resizer
- **ARIA Labels**: Proper labeling for assistive technology
- **Semantic Structure**: Logical content organization
- **Screen Reader**: Announces resize actions

### Keyboard Controls

When resizer is focused:
- **Arrow Keys**: Adjust split position
- **Tab**: Navigate to/from resizer
- **Enter/Space**: Activate resizer for keyboard control

## Browser Support

Works in all modern browsers that support:
- Vue 3
- Nuxt 3
- Mouse and Touch Events
- CSS Flexbox
- Modern JavaScript (ES6+)

## Troubleshooting

**Resizer not working:**
- Ensure parent has explicit height (e.g., `h-screen`, `h-[600px]`)
- Check that content doesn't overflow and block resizer
- Verify z-index of resizer is appropriate

**Content not visible:**
- Check pane overflow settings
- Ensure content has proper dimensions
- Verify no CSS conflicts with layout

**Performance issues during resize:**
- Optimize content rendering
- Consider debouncing expensive operations
- Reduce complexity of pane content
- Use `will-change` CSS property if needed

**Mobile touch issues:**
- Test on actual touch devices
- Ensure touch events are not blocked
- Consider providing alternative layout for mobile