---
outline: deep
---

<script setup lang="ts">
import OnlineStatusExample from '../../components/OnlineStatusExample.vue'
</script>

# OnlineStatus

The `OnlineStatus` component displays a real-time health status indicator that checks whether the application is online. It automatically polls the server every 30 seconds to verify connectivity and displays a visual indicator with tooltip information.

## Features

- **Automatic Health Checks**: Configurable polling to verify server connectivity
- **Visual Indicator**: Color-coded status display (green for online, red for offline)
- **Tooltip Information**: Detailed status on hover
- **Optional Text Label**: Show/hide status text alongside indicator
- **Smooth Transitions**: Animated color changes between states
- **i18n Integration**: Multilingual support for status messages
- **Lightweight**: Minimal performance impact
- **Customizable Polling**: Adjust check frequency to your needs

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `showText` | `boolean` | No | `false` | Whether to display text along with the status indicator |
| `pollInterval` | `number` | No | `30000` | The interval in milliseconds for checking online status (minimum: 1000ms) |

## Usage

### Basic Implementation

Simple status indicator without text:

```vue
<template>
  <OnlineStatus />
</template>
```

### With Text Label

Display status text alongside the indicator:

```vue
<template>
  <OnlineStatus :show-text="true" />
</template>
```

### Custom Poll Interval

Check connectivity more or less frequently:

```vue
<template>
  <!-- Check every 60 seconds -->
  <OnlineStatus :poll-interval="60000" />
  
  <!-- Check every 10 seconds -->
  <OnlineStatus :poll-interval="10000" />
</template>
```

### All Options Combined

```vue
<template>
  <OnlineStatus 
    :show-text="true" 
    :poll-interval="45000"
  />
</template>
```

## Integration Examples

### In Navigation Bar

Perfect for displaying in your application header:

```vue
<template>
  <NavigationBar>
    <template #right>
      <OnlineStatus :show-text="true" />
    </template>
  </NavigationBar>
</template>
```

### In Footer

Display in footer for persistent status visibility:

```vue
<template>
  <footer class="flex justify-between items-center p-4">
    <div>© 2024 My Application</div>
    <OnlineStatus :show-text="true" />
  </footer>
</template>
```

### In Dashboard

Show status in dashboard layout:

```vue
<template>
  <div class="dashboard">
    <header class="flex justify-between items-center">
      <h1>Dashboard</h1>
      <OnlineStatus />
    </header>
    
    <main>
      <!-- Dashboard content -->
    </main>
  </div>
</template>
```

### In Status Bar

Create a dedicated status bar:

```vue
<template>
  <div class="status-bar flex items-center gap-4 p-2 bg-gray-50">
    <OnlineStatus :show-text="true" />
    <span class="text-sm text-gray-600">
      Last updated: {{ lastUpdate }}
    </span>
  </div>
</template>
```

### With Conditional Rendering

Show/hide based on application state:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const showStatus = ref(true);
</script>

<template>
  <div>
    <OnlineStatus 
      v-if="showStatus"
      :show-text="true"
      :poll-interval="30000"
    />
  </div>
</template>
```

## i18n Configuration

The component requires the following translation keys:

```json
{
  "en": {
    "common-ui": {
      "health_status": {
        "online_title": "Online",
        "online_description": "Application is connected to the server",
        "offline_title": "Offline",
        "offline_description": "Unable to connect to the server"
      }
    }
  },
  "de": {
    "common-ui": {
      "health_status": {
        "online_title": "Online",
        "online_description": "Anwendung ist mit dem Server verbunden",
        "offline_title": "Offline",
        "offline_description": "Verbindung zum Server nicht möglich"
      }
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

## Interactive Example

Try adjusting the settings and see the component in action:

<OnlineStatusExample />

## How It Works

1. **Initial Check**: Component checks server connectivity on mount
2. **Periodic Polling**: Sends health check requests at specified intervals
3. **Status Update**: Updates visual indicator based on response
4. **Error Handling**: Handles network failures gracefully
5. **User Feedback**: Shows current status via color and tooltip

### Status Indication

- **Online (Green)**: Server responds successfully
- **Offline (Red)**: Server request fails or times out

## Polling Behavior

### Default Interval

The default polling interval is 30 seconds (30000ms), which provides a good balance between:
- Timely status updates
- Minimal server load
- Battery efficiency on mobile devices

### Custom Intervals

Choose your interval based on your needs:

```vue
<template>
  <!-- Conservative: Check every 2 minutes -->
  <OnlineStatus :poll-interval="120000" />
  
  <!-- Balanced: Check every 30 seconds (default) -->
  <OnlineStatus :poll-interval="30000" />
  
  <!-- Aggressive: Check every 5 seconds -->
  <OnlineStatus :poll-interval="5000" />
</template>
```

### Performance Considerations

- **Shorter intervals**: More real-time status, higher server load
- **Longer intervals**: Less server load, less timely updates
- **Minimum interval**: 1000ms (1 second) - anything less is not recommended

## Styling

The component uses Tailwind CSS with smooth transitions:

### Default Appearance

- **Online**: Green circle (or with "Online" text)
- **Offline**: Red circle (or with "Offline" text)
- **Transition**: Smooth color change between states

### Custom Styling

Wrap the component to customize appearance:

```vue
<template>
  <div class="custom-status">
    <OnlineStatus :show-text="true" />
  </div>
</template>

<style scoped>
.custom-status {
  padding: 0.5rem;
  border: 1px solid currentColor;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
}
</style>
```

## Accessibility

- **Tooltip**: Descriptive status information on hover
- **ARIA Labels**: Proper labeling for screen readers
- **Color + Text**: When `showText` is true, doesn't rely solely on color
- **Semantic HTML**: Uses appropriate elements
- **Keyboard Accessible**: Can be focused and read by screen readers

## Best Practices

1. **Choose Appropriate Interval**: Balance between updates and server load
2. **Show Text on Important Pages**: Use `showText` on critical interfaces
3. **Consistent Placement**: Keep status indicator in same location
4. **Mobile Consideration**: Longer intervals on mobile to save battery
5. **Error Handling**: Have fallback UI if component fails
6. **Server Health Endpoint**: Ensure reliable health check endpoint
7. **Network Resilience**: Component handles network issues gracefully

## Use Cases

- **SPA Applications**: Monitor real-time connectivity in single-page apps
- **Real-time Dashboards**: Show connection status in data dashboards
- **Admin Panels**: Critical for admin interfaces requiring server connection
- **Collaboration Tools**: Essential for real-time collaboration features
- **API-Heavy Apps**: Applications that depend heavily on API connectivity
- **Progressive Web Apps**: PWAs that work offline and online
- **Monitoring Interfaces**: System monitoring and management tools

## Advanced Usage

### Conditional Actions Based on Status

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';

const isOnline = ref(true);

watch(isOnline, (newStatus) => {
  if (!newStatus) {
    // Handle offline state
    showNotification('Connection lost');
  } else {
    // Handle online state
    showNotification('Connection restored');
  }
});
</script>

<template>
  <div>
    <OnlineStatus :show-text="true" />
    
    <div v-if="!isOnline" class="offline-banner">
      You are currently offline. Some features may be unavailable.
    </div>
  </div>
</template>
```

### Multiple Status Indicators

```vue
<template>
  <div class="flex gap-4">
    <!-- Main server -->
    <OnlineStatus :show-text="true" />
    
    <!-- API status -->
    <div class="flex items-center gap-2">
      <span class="text-sm">API:</span>
      <OnlineStatus />
    </div>
    
    <!-- Database status -->
    <div class="flex items-center gap-2">
      <span class="text-sm">DB:</span>
      <OnlineStatus />
    </div>
  </div>
</template>
```

## Related Components

- [NavigationBar](./navigationbar.md) - Navigation component where status is often displayed
- [DataBsFooter](./databsfooter.md) - Footer component for status display
- [DataBsBanner](./databsbanner.md) - Banner component

## Browser Support

Works in all modern browsers that support:
- Vue 3
- Nuxt 3
- Fetch API
- Modern JavaScript (ES6+)
- CSS Transitions
- Nuxt i18n

## Troubleshooting

**Status always shows offline:**
- Verify health endpoint exists and is accessible
- Check network connectivity
- Verify CORS settings if applicable
- Check browser console for errors

**Status not updating:**
- Verify polling interval is set correctly
- Check that component is mounted
- Ensure health endpoint is responding
- Check for JavaScript errors in console

**Tooltip not showing:**
- Verify i18n translations are loaded
- Check that translation keys exist
- Ensure Nuxt UI tooltip is configured

**Performance issues:**
- Increase poll interval to reduce frequency
- Check server response times
- Monitor network tab for excessive requests
- Consider caching strategies

## Performance Optimization

### Adjust Based on Context

```vue
<template>
  <div>
    <!-- Critical page: check frequently -->
    <OnlineStatus 
      v-if="isCriticalPage"
      :poll-interval="5000"
    />
    
    <!-- Normal page: standard interval -->
    <OnlineStatus 
      v-else
      :poll-interval="30000"
    />
  </div>
</template>
```

### Pause When Inactive

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isActive = ref(true);
const pollInterval = computed(() => isActive.value ? 30000 : 120000);

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

function handleVisibilityChange() {
  isActive.value = !document.hidden;
}
</script>

<template>
  <OnlineStatus :poll-interval="pollInterval" />
</template>
```
