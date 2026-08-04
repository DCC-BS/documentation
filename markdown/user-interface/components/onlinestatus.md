---
---
outline: deep
skillParent: dcc-ui
skillName: system-status
skillDescription: "SystemStatus is an offline-only alert indicator that polls a server health endpoint at a configurable pollInterval, displaying a warning icon with tooltip only when connectivity is lost. Includes optional custom isOnlineCheckFunction prop. Use when showing live server connectivity status."
---

# SystemStatus

The `SystemStatus` component monitors application connectivity by polling the server at configurable intervals. Unlike an always-visible status indicator, `SystemStatus` only renders when the server is **offline** — showing a warning icon and text to alert users of connectivity issues. When the application is online, the component renders nothing, keeping the UI uncluttered.

## Features

- **Automatic Health Checks**: Configurable polling to verify server connectivity
- **Offline-Only Display**: Renders only when the server is unreachable, keeping the UI clean when everything is working
- **Visual Alert**: Warning icon (`i-lucide-triangle-alert`) with red text for offline state
- **Tooltip Information**: Detailed status information on hover
- **i18n Integration**: Multilingual support for status messages
- **Memory Safe**: Polling interval is properly cleaned up on component unmount
- **Customizable Polling**: Adjust check frequency to your needs
- **Custom Health Check**: Provide your own function to determine online status

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pollInterval` | `number` | No | `30000` | The interval in milliseconds for checking online status |
| `isOnlineCheckFunction` | `() => Promise<boolean>` | No | `checkIsOnline()` | Custom function to check online status. By default, uses the built-in `checkIsOnline` utility |

## Usage

### Basic Implementation

```vue
<template>
  <SystemStatus />
</template>
```

### Custom Poll Interval

Check connectivity at a different frequency:

```vue
<template>
  <!-- Check every 60 seconds -->
  <SystemStatus :poll-interval="60000" />
</template>
```

### Custom Online Check Function

Provide your own function to determine online status:

```vue
<script setup lang="ts">
async function customOnlineCheck() {
  try {
    const response = await fetch('/api/custom-health');
    return response.ok;
  } catch {
    return false;
  }
}
</script>

<template>
  <SystemStatus 
    :is-online-check-function="customOnlineCheck"
  /> 
</template>
```

### Status Behavior

- **Online**: No indicator is shown — the application is functioning normally
- **Offline (Red)**: Warning icon with text is displayed, along with a tooltip describing the issue

## i18n Configuration

The component requires the following translation keys:

```json
{
    "common-ui": {
        "health_status": {
            "offline_title": "System disruption",
            "offline_description": "Some services are unavailable, features may be limited"
        }
    }
}
```

## Health Check Endpoint

The component checks connectivity by sending requests to your application's health endpoint. Ensure your server has a health check endpoint configured.

### Example Server Setup (Nuxt)

```typescript
// server/api/health.get.ts
export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});
```