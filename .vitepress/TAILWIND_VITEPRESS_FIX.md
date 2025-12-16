# Tailwind CSS v4 + VitePress Integration Fix

## Problem

When using Tailwind CSS v4 with VitePress, Tailwind utility classes (like `.bg-primary`, `.text-red-500`, etc.) were being overridden by VitePress's default theme styles. This happened because:

1. **CSS Specificity**: VitePress default theme styles have higher specificity than Tailwind utilities
2. **Load Order**: The CSS import order was incorrect
3. **CSS Cascade**: VitePress button and component styles were loaded after Tailwind utilities

### Example of the Issue

```html
<button class="bg-primary text-white">Click me</button>
```

The button would use VitePress's default `button` styles instead of Tailwind's `.bg-primary` class, resulting in `background-color: transparent` from VitePress CSS instead of the expected primary color.

## Solution

The fix involves three key changes:

### 1. CSS Import Order in Theme

**File: `.vitepress/theme/index.ts`**

Import the DefaultTheme **before** your custom CSS to establish the correct cascade:

```typescript
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import ui from "@nuxt/ui/vue-plugin";

// Import custom CSS AFTER DefaultTheme to ensure proper cascade order
import "./main.css";

export default {
    extends: DefaultTheme,
    Layout,
    async enhanceApp({ app }) {
        app.use(ui);
    },
} as Theme;
```

### 2. Configure Tailwind Content Scanning

**File: `.vitepress/config.ts`**

The most critical fix: Configure the Tailwind Vite plugin to scan your content files for class names:

```typescript
vite: {
    plugins: [
        llmstxt(),
        ui({
            autoImport: {
                dts: "../auto-imports.d.ts",
            },
            components: {
                dts: "../components.d.ts",
            },
        }),
        tailwindcss({
            content: [
                "./markdown/**/*.{md,vue,js,ts,jsx,tsx}",
                "./.vitepress/**/*.{vue,js,ts,jsx,tsx}",
                "./components/**/*.{vue,js,ts,jsx,tsx}",
            ],
        }),
    ],
    // ...
}
```

**Why This Is Critical:**  
Tailwind CSS v4 with the Vite plugin works differently than v3. It only generates CSS for classes it actually finds in your source files. Without the `content` configuration, Tailwind scans nothing and generates no utility classes, which is why all your Tailwind classes appeared to do nothing.

### 3. Use Tailwind v4 `important` Directive

**File: `.vitepress/theme/main.css`**

Use Tailwind CSS v4's `important` modifier to ensure all utility classes get `!important` declarations:

```css
/* Import Tailwind CSS v4 with important modifier to override VitePress default styles */
@import "tailwindcss" important;

/* Import Nuxt UI styles */
@import "@nuxt/ui";

/* Custom layer for VitePress compatibility fixes */
@layer components {
    /* Reset VitePress button styles to allow Tailwind classes to work properly */
    button.VPButton,
    a.VPButton {
        all: revert;
    }

    /* Ensure custom styled elements don't inherit VitePress defaults */
    [class*="bg-"]:not([class*="vp-"]),
    [class*="text-"]:not([class*="vp-"]),
    [class*="border-"]:not([class*="vp-"]) {
        background-image: none;
    }
}

/* Additional utility overrides if needed */
@layer utilities {
    /* Force remove background gradients from VitePress on Tailwind utility classes */
    .bg-primary,
    .bg-secondary,
    .bg-accent {
        background-image: none;
    }
}
```

### 4. Correct Vite Plugin Order

**File: `.vitepress/config.ts`**

Ensure the Tailwind plugin is loaded in the correct order:

```typescript
vite: {
    plugins: [
        llmstxt(),
        ui({
            autoImport: {
                dts: "../auto-imports.d.ts",
            },
            components: {
                dts: "../components.d.ts",
            },
        }),
        tailwindcss(), // Load Tailwind plugin last
    ],
    // ...
}
```

## How It Works

### The `important` Directive

### Content Scanning

Tailwind CSS v4 with the Vite plugin **only generates CSS for classes it finds in your files**. The `content` option tells Tailwind where to look:

```typescript
tailwindcss({
    content: [
        "./markdown/**/*.{md,vue,js,ts,jsx,tsx}",  // Scan markdown files
        "./.vitepress/**/*.{vue,js,ts,jsx,tsx}",    // Scan theme files
        "./components/**/*.{vue,js,ts,jsx,tsx}",    // Scan components
    ],
})
```

If you add Tailwind classes but they don't work, make sure the file is included in the `content` glob patterns.

### The `important` Directive

In Tailwind CSS v4, adding `important` to the `@import` statement generates all utility classes with `!important`:

```css
/* Without important */
.bg-red-500 {
    background-color: var(--color-red-500);
}

/* With important */
.bg-red-500 {
    background-color: var(--color-red-500) !important;
}
```

This ensures Tailwind utilities override any VitePress default styles, regardless of specificity.

### CSS Cascade Layers

The `@layer` directive organizes CSS into logical groups:

1. **`@layer components`** - For component-level overrides
2. **`@layer utilities`** - For utility-level overrides

These layers work with Tailwind's built-in layer system to maintain proper CSS cascade order.

### Selector Specificity

The `:not([class*="vp-"])` selector ensures we only override non-VitePress classes, allowing VitePress's own components to function normally.

## Testing the Fix

Create a test component or markdown file with Tailwind classes:

```vue
<template>
    <div class="p-4 bg-blue-500 text-white rounded-lg">
        <h2 class="text-2xl font-bold">Tailwind CSS is working!</h2>
        <button class="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded">
            Click me
        </button>
    </div>
</template>
```

Or in markdown with HTML:

```html
<div class="p-4 bg-blue-500 text-white rounded-lg">
    <h2 class="text-2xl font-bold">Tailwind CSS is working!</h2>
    <button class="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded">
        Click me
    </button>
</div>
```

### Build and Test

```bash
# Development server
bun run dev

# Production build
bun run build

# Preview production build
bun run preview
```

## Best Practices

### 1. Use Tailwind Classes Consistently

```html
<!-- Good: Full Tailwind styling -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Button
</button>

<!-- Avoid: Mixing with inline styles -->
<button class="bg-blue-500" style="padding: 1rem;">
    Button
</button>
```

### 2. Namespace Custom Components

If creating custom components that need VitePress styling, use the `vp-` prefix:

```html
<div class="vp-custom-component">
    <!-- Will use VitePress defaults -->
</div>
```

### 3. Use Nuxt UI Components

Since `@nuxt/ui` is already integrated, prefer using its components:

```vue
<template>
    <UButton color="primary">Click me</UButton>
    <UCard>
        <template #header>
            <h3>Card Title</h3>
        </template>
        Content here
    </UCard>
</template>
```

## Troubleshooting

### Tailwind Classes Still Not Working

1. **Check Browser DevTools**: Inspect the element and verify:
   - Tailwind classes are present in the HTML
   - CSS rules have `!important` declarations
   - No other styles are overriding with higher specificity

2. **Clear Build Cache**:
   ```bash
   rm -rf .vitepress/cache .vitepress/dist node_modules/.vite
   bun install
   bun run build
   ```

3. **Check CSS Import Order**: Ensure `./main.css` is imported **after** `DefaultTheme` in `index.ts`

### Styles Flashing on Page Load

This can happen if CSS is not being properly tree-shaken. Ensure:

1. Tailwind plugin is in the correct order in `vite.config.ts`
2. SSR configuration includes `@nuxt/ui` in `noExternal`

### Conflicts with VitePress Components

If VitePress built-in components (sidebar, navbar, etc.) look broken:

1. Check that your custom styles use the `:not([class*="vp-"])` selector
2. Ensure you're not overriding VitePress CSS variables unintentionally
3. Use scoped styles in Vue components when possible

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Important Directive](https://tailwindcss.com/docs/styling-with-utility-classes#using-important)
- [VitePress Custom Theme Guide](https://vitepress.dev/guide/extending-default-theme)
- [Nuxt UI Documentation](https://ui.nuxt.com/)

## Migration Notes

If you're upgrading from Tailwind CSS v3:

1. Replace `@tailwind` directives with `@import "tailwindcss"`
2. Add `important` modifier: `@import "tailwindcss" important`
3. Update any `tailwind.config.js` to CSS-based configuration (if needed)
4. Test all components for styling issues

## Summary

The key to making Tailwind CSS v4 work with VitePress is:

✅ **Configure content scanning** - Most critical! Tell Tailwind where to find your classes  
✅ Import DefaultTheme before custom CSS  
✅ Use `@import "tailwindcss" important` in your CSS  
✅ Add component layer overrides for VitePress compatibility  
✅ Use `:not([class*="vp-"])` selectors to avoid breaking VitePress  
✅ Keep Tailwind plugin last in Vite config  

**The #1 issue:** If Tailwind classes don't work, it's almost always because the content scanning configuration is missing or incorrect. Without it, Tailwind generates zero utility classes.

This ensures Tailwind utility classes always take precedence over VitePress default styles while keeping VitePress components functional.