---
outline: deep
editLink: true
---

# Logger Layer

The logger layer provides a universal, type-safe logging interface for DCC-BS Nuxt applications. It enables switching between different logging implementations using environment variables, without changing your application code.

## Overview

The logging system is designed with a similar pattern to the authentication layer:

1. **`logger`** - Base layer that defines the logging interface and types
2. **`pino-logger`** - Implementation using Pino (low overhead)

## How It Works

The base `logger` layer dynamically loads a logging implementation based on the `LOGGER_LAYER_URI` environment variable. This allows you to:

- Switch between different logging implementations for development and production
- Use the same logging interface throughout your application
- Configure log levels and behavior per environment
- Keep your application code logging-implementation-agnostic

### Architecture

```
Your Nuxt App
    ↓
  extends: ['github:DCC-BS/nuxt-layers/logger']
    ↓
  LOGGER_LAYER_URI environment variable
    ↓
  ┌──────────────────┐
  ↓                  ↓
pino-logger    (future: other)
```

## Quick Start

### 1. Add Logger Layer to Your Project

In your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/logger', { install: true }]
  ]
})
```

### 2. Configure Logger Implementation

Set the `LOGGER_LAYER_URI` environment variable to choose your implementation:

**For production (Pino):**
```bash
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/pino-logger
```

### 3. Use Logger in Your App

The logger layer provides a type-safe logging utility:

```typescript
// In a component
const logger = useLogger();

logger.info('Application started');
logger.warn('This is a warning');
logger.error('An error occurred', { details: 'additional context' });
```

## Base Logger Layer (`logger`)

The base logger layer defines the contract that all implementations must follow.

### Type Definitions

**LogLevel Type:**

```typescript
type LogLevel = 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
```

**BaseLogger Interface:**

```typescript
interface BaseLogger {
  /**
   * Set this property to the desired logging level.
   * Available levels: 'silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'
   */
  level: LogLevel;

  // Logging methods
  silent: LogFn;
  fatal: LogFn;
  error: LogFn;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
  trace: LogFn;
}
```

### Exports

- **Types**: `BaseLogger`, `LogLevel` - Shared type definitions
- **`useLogger`**: Client composable for accessing the logger
- **`getEventLogger`**: Server utility for accessing the logger in event handlers
- **Dynamic loading**: Automatically extends the implementation specified in `LOGGER_LAYER_URI`

### Configuration

The layer reads the following environment variable:

| Variable | Required | Description |
|----------|----------|-------------|
| `LOGGER_LAYER_URI` | Yes | URI to the logging implementation layer |

**Example:**

```bash
# Use Pino logger
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/pino-logger

# Use local layer (for development)
LOGGER_LAYER_URI=./layers/custom-logger
```

### App Configuration

Configure the logger behavior in your `app.config.ts`:

```typescript
export default defineAppConfig({
  logger: {
    loglevel: "info" as LogLevel,
    meta: [] as unknown[],
    includeStackTrace: false,
    stackTraceLimit: 5,
    logAllRequests: false,
  },
});
```

::: info Configuration Options
- `loglevel`: Minimum log level to display (e.g., `'info'`, `'debug'`).
- `includeStackTrace`: Whether to include stack traces in error logs.
- `stackTraceLimit`: Number of stack frames to include.
- `logAllRequests`: If `true`, logs all HTTP requests. If `false`, logs only failed requests (4xx/5xx).
:::

## Pino Logger Implementation (`pino-logger`)

Production-ready logging using Pino, providing low-overhead JSON logging for both browser and server environments.

### Features

- ✅ Universal logging interface (works in browser and server)
- ✅ Standardized log levels (`fatal` to `trace`)
- ✅ JSON output for production (easier parsing)
- ✅ Pretty printing for development via `pino-pretty`
- ✅ Automatic request/response logging middleware
- ✅ Configurable log levels and transports

### Configuration

Set these environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `LOGGER_LAYER_URI` | Yes | Points to pino-logger layer | `github:DCC-BS/nuxt-layers/pino-logger` |

### Client-Side Usage

Use the logger in your Vue components:

```vue
<script setup lang="ts">
const logger = useLogger();

onMounted(() => {
  logger.trace('Component mounted');
  logger.info('Application ready');

  // Log with metadata
  logger.warn('Deprecated feature used', { feature: 'oldAPI' });
  logger.error('Failed to load data', { error: 'Network timeout' });
});
</script>

<template>
  <div>
    <!-- Your component template -->
  </div>
</template>
```

### Server-Side Usage

On the server side, use the `getEventLogger(event)` function.

```typescript
export default eventHandler(async (event) => {
  const logger = getEventLogger(event);

  logger.info('Handling request');

  try {
    const data = await fetchData();
    logger.info('Data fetched successfully', { itemCount: data.length });
    return data;
  } catch (error) {
    logger.error('Request failed', {
      error: error.message,
      path: event.path,
      method: event.method
    });
    throw error;
  }
});
```

### Request Logging Middleware

The Pino logger includes automatic request/response logging middleware. Its behavior is controlled by the `logAllRequests` configuration in `app.config.ts`.

- **If `logAllRequests` is `true`**: Logs all incoming requests at `info` level.
- **If `logAllRequests` is `false`** (default): Logs only failed requests (status code >= 400) at `error` level.

## Switching Between Implementations

The power of this layer system is seamless switching:

### Per Environment

Use different `.env` files:

```bash
# .env.local (Development)
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/pino-logger

# .env.production (Production)
LOGGER_LAYER_URI=your_custom_logger_layer
```

### Per Developer

Each developer can use their own `.env.local`:

```bash
# Alice's .env.local (detailed logging)
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/pino-logger
```

## Advanced Usage

### Creating Custom Logger Implementations

Create a layer

```sh
bun create nuxt -- --template layer nuxt-layer
```

Edit `nuxt.config.ts`

```ts{3}
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/logger', { install: true }]
  ],
  devtools: { enabled: true },
});
```

Run

```sh
bun i
bun dev:prepare
```

Remove the generated code in the `app/` directory and implement your own logging logic:

Add `app/composables/useLogger.ts`

```ts
import { useNuxtApp } from "#app";
import type { BaseLogger } from "#layers/logger/shared/types/logger";

export function useLogger(): BaseLogger {
  // Your implementation
  const logger: BaseLogger = {
    level: 'info',
    info: (msg: string, ...args: unknown[]) => {
      console.log(`[INFO] ${msg}`, ...args);
    },
    error: (msg: string, ...args: unknown[]) => {
      console.error(`[ERROR] ${msg}`, ...args);
    },
    // ... implement other methods (fatal, warn, debug, trace, silent)
  };

  return logger;
}
```

Add `app/plugins/loggerPlugin.client.ts`

```ts
export default defineNuxtPlugin((nuxtApp) => {
  const logger = useLogger();
  nuxtApp.provide('logger', logger);
});
```

Add `server/plugins/loggerPlugin.server.ts`

```ts
export default defineNuxtPlugin((nuxtApp) => {
  const logger = useLogger();

  // Add logger to event context
  nuxtApp.hooks.hook('request', (event) => {
    event.context.logger = logger;
  });

  nuxtApp.provide('logger', logger);
});
```

Add `server/utils/eventLogger.ts`

```ts
import type { H3Event } from "h3";
import type { BaseLogger } from "#layers/logger/shared/types/logger";

export function getEventLogger(event: H3Event): BaseLogger {
  if (!event.context.logger) {
    throw new Error("Logger not found in event context");
  }
  return event.context.logger as BaseLogger;
}
```

Example structure:

```txt
my-custom-logger/
├── .playground/
│   └──nuxt.config.ts
├── app/
│   ├── composables/
│   │   └── useLogger.ts
│   └── plugins/
│       └── loggerPlugin.client.ts
├── server/
│   ├── plugins/
│   │   └── loggerPlugin.server.ts
│   └── utils/
│       └── eventLogger.ts
├── package.json
├── ...
└── nuxt.config.ts
```

Now you can use your custom logger layer by setting the environment variable in a Nuxt application which uses the Logger layer:

```bash
LOGGER_LAYER_URI=github:your-github-username/your-custom-logger
```

## Related Documentation

- [Authentication Layer](./auth.md) - Uses similar layer pattern
- [Backend Communication](./backend_communication.md) - API utilities
- [Health Check Layer](./health_check.md) - Monitoring endpoints
- [Nuxt Layers Overview](./index.md) - Main documentation
