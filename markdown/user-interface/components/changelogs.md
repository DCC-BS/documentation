---
---
outline: deep
skillParent: dcc-ui
skillName: changelogs
skillDescription: "Changelogs component renders a modal of release notes passed via the releases prop (fetched by FirstRunOrchestrator/useChangelogsPending), renders Markdown, and emits a finished event when dismissed. Includes the ChangelogsButton companion that resets the changelogs-last-read cookie to re-trigger the flow on demand. Disable via disableChangelog runtime config. Use when surfacing release notes or what's new to users."
---
# Changelogs

The `Changelogs` component displays a modal with application changelog information. It renders unread release notes passed to it via the `releases` prop and emits a `finished` event when the user dismisses the modal.

This component is designed to be used within the `FirstRunOrchestrator`, which handles fetching changelog data, tracking read state via the `changelogs-last-read` cookie, and conditionally mounting the component when new releases are available. For manual triggering (e.g., from a navigation bar), use the companion [`ChangelogsButton`](#changelogsbutton) component.

## Features

- **Markdown Rendering**: Renders changelog content with Markdown formatting
- **Responsive Design**: Modal with close button for better readability
- **Orchestrator-Driven**: Mounted only when new releases exist (via `FirstRunOrchestrator`)
- **Event-Based**: Emits a `finished` event so the parent can update tracking state
- **Configurable**: Can be globally disabled via runtime config
- **Companion Button**: `ChangelogsButton` allows users to re-view changelogs on demand

## Props

| Prop       | Type          | Required | Description                                                        |
| ---------- | ------------- | -------- | ------------------------------------------------------------------ |
| `releases` | `Changelog[]` | Yes      | Array of changelog entries to display in the modal (newest first). |

### Changelog Type

```typescript
interface Changelog {
  title: string;
  version: string;
  published_at: string;
  body: string; // Markdown content
}
```

## Events

| Event      | Payload                  | Description                                                                                          |
| ---------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `finished` | `{ completed: boolean }` | Emitted when the user closes the modal. Signals the orchestrator to update the `changelogs-last-read` cookie. |

## Configuration

The changelog feature can be disabled globally via Nuxt runtime config. When disabled, the `FirstRunOrchestrator` will not include the Changelogs flow.

::: tip
Set `disableChangelog` to `true` to completely disable the flow. No data will be fetched and no modal will be shown.
:::

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      commonUi: {
        disableChangelog: true, // or "true"
      },
    },
  },
});
```

## Server Setup

Changelog files should be stored in your `server/assets/changelogs` directory as Markdown files.

### Changelog File Format

Each changelog file should follow this frontmatter format:

```markdown
---
title: "Version 1.1.0"
version: "1.1.0"
published_at: "2024-01-15T10:00:00Z"
---

## New Features

- Added new changelog component
- Improved performance
- Enhanced user experience

## Bug Fixes

- Fixed memory leak issue
- Resolved navigation bug

## Breaking Changes

- Updated API endpoint structure
```

### File Naming Convention

Name your changelog files consistently, for example:
- `changelog-1.0.0.md`
- `changelog-1.1.0.md`
- `changelog-2.0.0.md`

## Usage

### With FirstRunOrchestrator

The `Changelogs` component is designed to be rendered by the `FirstRunOrchestrator`, which manages the fetching, cookie tracking, and conditional display logic. You typically do not mount `Changelogs` directly.

```vue
<template>
  <UApp>
    <FirstRunOrchestrator
      :disclaimer="{
        appName: 'My App',
        confirmationText: 'I have read and understood...',
      }"
    />
    <NuxtPage />
  </UApp>
</template>
```

The orchestrator automatically:

1. Fetches changelog data via the `/api/changelogs` endpoint
2. Compares available versions against the `changelogs-last-read` cookie
3. Mounts the `Changelogs` component when new releases exist
4. Updates the cookie when the user dismisses the modal

### Manual Trigger with ChangelogsButton

To allow users to view changelogs on demand (e.g., from a navigation bar), use the `ChangelogsButton` component:

```vue
<template>
  <NavigationBar>
    <template #rightPostItems>
      <OnlineStatus />
    </template>
  </NavigationBar>
</template>
```

::: info
`ChangelogsButton` is built into the default `NavigationBar` right section — no manual placement is needed unless you override the `right` slot.
:::

## ChangelogsButton

The `ChangelogsButton` component provides a button that allows users to re-view the changelogs at any time. It resets the `changelogs-last-read` cookie to `"0.0.0"`, which causes the `FirstRunOrchestrator` to re-evaluate pending changelogs and surface them again without a page reload.

### Features

- **Responsive**: Icon-only with tooltip on mobile, icon + label on desktop
- **Cookie-Based**: Uses `useCookie` to reset the `changelogs-last-read` value
- **i18n Integrated**: Uses the `common-ui.changelogs.title` translation key for the label and tooltip
- **Ghost Variant**: Minimal styling with `i-lucide-history` icon

### Props

This component has no props.

### Behavior

When clicked, the button sets the `changelogs-last-read` cookie to `"0.0.0"`. The orchestrator's `useChangelogsPending` composable watches this cookie and re-evaluates, surfacing the Changelogs flow without requiring a page reload.

## How It Works

1. **Orchestrator Mount**: The `FirstRunOrchestrator` is placed in `app.vue` or a layout, running on every page.
2. **Pending Check**: The `useChangelogsPending` composable fetches from `/api/changelogs?lastRead=<cookie>` and determines if new releases exist.
3. **Priority Resolution**: The orchestrator resolves flows by priority (Disclaimer > Changelogs > Onboarding). Changelogs only appears after the Disclaimer is accepted (if enabled).
4. **Modal Display**: When Changelogs is the active flow, the `Changelogs` component is mounted and opens immediately, displaying all unread release notes.
5. **Completion**: When the user closes the modal, the `finished` event fires. The orchestrator writes the latest release version to the `changelogs-last-read` cookie, which reactively unmounts the component.

## API Endpoint

The component expects a GET endpoint at `/api/changelogs` that accepts an optional `lastRead` query parameter (the last read version string) and returns an array of changelog objects:

```typescript
interface Changelog {
  title: string;
  version: string;
  published_at: string;
  body: string; // Markdown content
}
```

Example server response:

```json
[
  {
    "title": "Version 1.1.0",
    "version": "1.1.0",
    "published_at": "2024-01-15T10:00:00Z",
    "body": "## New Features\n- Feature 1\n- Feature 2"
  },
  {
    "title": "Version 1.0.0",
    "version": "1.0.0",
    "published_at": "2024-01-01T10:00:00Z",
    "body": "## Initial Release\n- First version"
  }
]
```

## Version Sorting

Changelogs are automatically sorted by version number (newest first) using semantic versioning comparison. The component intelligently handles version formats like:
- `1.0.0`
- `1.2.3`
- `2.0.0-beta.1`

## Cookie Reference

| Name                   | Type     | Default | Purpose                                                                                                                    |
| ---------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `changelogs-last-read` | `string` | `""`    | Tracks the last viewed changelog version. Set to the newest release version when the user dismisses the modal. Reset to `"0.0.0"` by `ChangelogsButton` to re-trigger the flow. |

## Best Practices

1. **Keep It Concise**: Write clear, concise changelog entries
2. **Categorize Changes**: Use sections like "New Features", "Bug Fixes", "Breaking Changes"
3. **Semantic Versioning**: Follow semantic versioning (MAJOR.MINOR.PATCH)
4. **Regular Updates**: Update changelogs with each significant release
5. **User-Friendly Language**: Write for your users, not just developers