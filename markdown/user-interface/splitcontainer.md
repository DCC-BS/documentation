---
outline: deep
---

<script setup lang="ts">
import SplitContainerExample from '../../components/SplitContainerExample.vue'
</script>

# SplitContainer

The `SplitContainer` component provides a card-like container with a header and two side-by-side content areas separated by a border. It's responsive and automatically stacks vertically on mobile devices, making it perfect for displaying paired content or comparison views.

## Features

- **Three-Section Layout**: Header plus two content panes
- **Responsive Design**: Side-by-side on desktop, stacked on mobile
- **Card-Style Container**: Professional appearance with borders and shadows
- **Flexible Content**: Accepts any content via slots
- **Semantic Structure**: Proper HTML hierarchy
- **Design System Integration**: Uses Kanton Basel-Stadt styling
- **Accessibility**: Semantic HTML and proper landmarks

## Props

This component has no props - it uses slots for all content.

## Slots

| Slot | Description |
|------|-------------|
| `header` | Content for the header section at the top |
| `left` | Content for the left pane (or top pane on mobile) |
| `right` | Content for the right pane (or bottom pane on mobile) |

## Usage

### Basic Implementation

Create a simple split container with header and two content areas:

```vue
<template>
  <SplitContainer>
    <template #header>
      <h2>My Split Container</h2>
    </template>
    <template #left>
      <p>Left pane content</p>
    </template>
    <template #right>
      <p>Right pane content</p>
    </template>
  </SplitContainer>
</template>
```

### Comparison View

Perfect for showing before/after or comparison content:

```vue
<template>
  <SplitContainer>
    <template #header>
      <h2>Feature Comparison</h2>
    </template>
    <template #left>
      <div class="p-4">
        <h3 class="font-bold mb-2">Basic Plan</h3>
        <ul>
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
      </div>
    </template>
    <template #right>
      <div class="p-4">
        <h3 class="font-bold mb-2">Premium Plan</h3>
        <ul>
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
          <li>Feature 4</li>
          <li>Feature 5</li>
        </ul>
      </div>
    </template>
  </SplitContainer>
</template>
```

### Input and Output Display

Show input and corresponding output:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const inputText = ref('Hello, world!');
const output = computed(() => inputText.value.toUpperCase());
</script>

<template>
  <SplitContainer>
    <template #header>
      <h2>Text Transformer</h2>
    </template>
    <template #left>
      <div class="p-4">
        <label class="block mb-2 font-semibold">Input:</label>
        <textarea 
          v-model="inputText"
          class="w-full p-2 border rounded"
          rows="5"
        />
      </div>
    </template>
    <template #right>
      <div class="p-4">
        <label class="block mb-2 font-semibold">Output:</label>
        <div class="p-2 bg-gray-50 rounded min-h-[120px]">
          {{ output }}
        </div>
      </div>
    </template>
  </SplitContainer>
</template>
```

### Code and Preview

Display code alongside its rendered preview:

```vue
<template>
  <SplitContainer>
    <template #header>
      <h2>Component Preview</h2>
    </template>
    <template #left>
      <div class="p-4">
        <h3 class="font-semibold mb-2">Code:</h3>
        <pre class="bg-gray-900 text-white p-4 rounded overflow-auto">
          <code>&lt;UButton variant="solid"&gt;
  Click Me
&lt;/UButton&gt;</code>
        </pre>
      </div>
    </template>
    <template #right>
      <div class="p-4">
        <h3 class="font-semibold mb-2">Preview:</h3>
        <div class="border-2 border-dashed rounded p-8 flex items-center justify-center">
          <UButton variant="solid">Click Me</UButton>
        </div>
      </div>
    </template>
  </SplitContainer>
</template>
```

### Data Visualization

Display data and its visualization:

```vue
<script setup lang="ts">
const data = [
  { label: 'Q1', value: 150 },
  { label: 'Q2', value: 230 },
  { label: 'Q3', value: 180 },
  { label: 'Q4', value: 290 },
];
</script>

<template>
  <SplitContainer>
    <template #header>
      <h2>Quarterly Sales</h2>
    </template>
    <template #left>
      <div class="p-4">
        <h3 class="font-semibold mb-3">Data Table:</h3>
        <table class="w-full">
          <thead>
            <tr>
              <th class="text-left">Quarter</th>
              <th class="text-right">Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data" :key="item.label">
              <td>{{ item.label }}</td>
              <td class="text-right">{{ item.value }}k</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template #right>
      <div class="p-4">
        <h3 class="font-semibold mb-3">Chart:</h3>
        <div class="h-48 flex items-end gap-2">
          <div 
            v-for="item in data" 
            :key="item.label"
            class="flex-1 bg-blue-500 flex flex-col items-center justify-end"
            :style="{ height: `${(item.value / 300) * 100}%` }"
          >
            <span class="text-xs text-white mb-1">{{ item.value }}k</span>
          </div>
        </div>
      </div>
    </template>
  </SplitContainer>
</template>
```

### Settings and Preview

Configuration on left, preview on right:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const fontSize = ref(16);
const fontWeight = ref('normal');
const textAlign = ref('left');
</script>

<template>
  <SplitContainer>
    <template #header>
      <h2>Text Style Editor</h2>
    </template>
    <template #left>
      <div class="p-4 space-y-4">
        <div>
          <label class="block mb-1">Font Size:</label>
          <input 
            v-model.number="fontSize"
            type="range"
            min="12"
            max="48"
            class="w-full"
          />
          <span class="text-sm">{{ fontSize }}px</span>
        </div>
        <div>
          <label class="block mb-1">Font Weight:</label>
          <select v-model="fontWeight" class="w-full p-2 border rounded">
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Lighter</option>
          </select>
        </div>
        <div>
          <label class="block mb-1">Text Align:</label>
          <select v-model="textAlign" class="w-full p-2 border rounded">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </template>
    <template #right>
      <div class="p-4">
        <h3 class="font-semibold mb-3">Preview:</h3>
        <div 
          class="border rounded p-4"
          :style="{
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
            textAlign: textAlign
          }"
        >
          The quick brown fox jumps over the lazy dog.
        </div>
      </div>
    </template>
  </SplitContainer>
</template>
```

## Interactive Example

Try customizing the content and see the component in action:

<SplitContainerExample />

## Responsive Behavior

The component automatically adapts to screen size:

- **Desktop (≥768px)**: Two columns side-by-side
- **Mobile (<768px)**: Single column, stacked vertically (left on top, right below)

### Breakpoint Details

- Uses Tailwind's `md:` breakpoint (768px)
- No configuration needed - responsive by default
- Content flows naturally on smaller screens
- Maintains readability on all devices

## Layout Structure

```
┌─────────────────────────────────┐
│         Header Slot             │
├────────────────┬────────────────┤
│                │                │
│   Left Slot    │   Right Slot   │
│                │                │
└────────────────┴────────────────┘
```

On mobile:

```
┌─────────────────────────────────┐
│         Header Slot             │
├─────────────────────────────────┤
│          Left Slot              │
├─────────────────────────────────┤
│         Right Slot              │
└─────────────────────────────────┘
```

## Styling

The component uses these design elements:

- **Border**: Clean border around container
- **Shadow**: Subtle shadow for depth
- **Padding**: Appropriate spacing in all sections
- **Separator**: Vertical border between panes on desktop
- **Rounded Corners**: Modern card appearance
- **Background**: White/light background

### Custom Styling

Add custom classes to slot content:

```vue
<template>
  <SplitContainer>
    <template #header>
      <div class="bg-blue-100 p-4 rounded-t">
        <h2>Custom Header</h2>
      </div>
    </template>
    <template #left>
      <div class="bg-gray-50 p-6">
        <p>Custom left content</p>
      </div>
    </template>
    <template #right>
      <div class="bg-green-50 p-6">
        <p>Custom right content</p>
      </div>
    </template>
  </SplitContainer>
</template>
```

## Accessibility

- **Semantic HTML**: Uses appropriate container elements
- **Heading Structure**: Header slot typically contains headings
- **Keyboard Navigation**: All content is keyboard accessible
- **Screen Reader Friendly**: Logical reading order
- **ARIA Landmarks**: Consider adding landmarks for complex content

### Accessibility Example

```vue
<template>
  <SplitContainer>
    <template #header>
      <h2 id="container-title">Accessible Container</h2>
    </template>
    <template #left>
      <section aria-labelledby="left-heading">
        <h3 id="left-heading">Left Section</h3>
        <p>Content...</p>
      </section>
    </template>
    <template #right>
      <section aria-labelledby="right-heading">
        <h3 id="right-heading">Right Section</h3>
        <p>Content...</p>
      </section>
    </template>
  </SplitContainer>
</template>
```

## Best Practices

1. **Header Content**: Use clear, descriptive headers
2. **Balanced Content**: Try to keep panes roughly equal in size
3. **Padding**: Add padding to slot content for better spacing
4. **Scrollable Content**: Use `overflow-auto` for long content
5. **Mobile Testing**: Always test on mobile devices
6. **Semantic Markup**: Use appropriate HTML elements in slots
7. **Consistent Heights**: Consider min-height for visual balance

## Use Cases

- **Comparison Views**: Side-by-side comparisons
- **Before/After**: Show changes or transformations
- **Input/Output**: Forms with live preview
- **Code/Preview**: Code examples with rendered output
- **Data/Visualization**: Tables with charts
- **Settings/Preview**: Configuration with live preview
- **Documentation**: Examples with explanations
- **Translations**: Original and translated text
- **Diff Views**: Code or text differences

## Comparison with SplitView

| Feature | SplitContainer | SplitView |
|---------|----------------|-----------|
| Layout | Fixed card layout | Resizable split |
| Header | Has header slot | No header |
| Resizing | Not resizable | User can resize |
| Mobile | Auto-stacks | Orientation-based |
| Best For | Content display | Interactive layouts |

Choose **SplitContainer** when:
- You need a header section
- Content should not be resizable
- You want a card-like appearance
- Mobile stacking is desired

Choose **SplitView** when:
- Users need to adjust pane sizes
- No header is needed
- More interactive control is required

## Related Components

- [SplitView](./splitview.md) - Resizable split view layout
- [UCard](https://ui.nuxt.com/components/card) - Nuxt UI card component
- [DataBsBanner](./databsbanner.md) - Banner component
- [DataBsFooter](./databsfooter.md) - Footer component

## Browser Support

Works in all modern browsers that support:
- Vue 3
- Nuxt 3
- CSS Grid and Flexbox
- Tailwind CSS
- Modern JavaScript (ES6+)

## Troubleshooting

**Content overflowing:**
- Add `overflow-auto` or `overflow-hidden` to slot content
- Set max-height on content containers
- Use `break-words` for long text

**Uneven pane heights:**
- Use `h-full` on slot content containers
- Set explicit heights when needed
- Consider `min-h-[...]` utilities

**Mobile layout issues:**
- Test on actual mobile devices
- Check responsive breakpoints
- Verify content width constraints

**Styling conflicts:**
- Use scoped styles for custom CSS
- Check for global style overrides
- Verify Tailwind CSS is configured correctly