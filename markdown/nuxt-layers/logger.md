---
outline: deep
editLink: true
---

# Logger Layer

The logger layer provides a universal, type-safe logging interface for DCC-BS Nuxt applications. It enables switching between different logging implementations using environment variables, without changing your application code.

## Overview

The logging system is designed with a similar pattern to the authentication layer:

1. **`logger`** - Base layer that defines the logging interface and types
2. **`winston-logger`** - Production implementation using Winston for both client and server

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
  ┌─────────────────┬─────────────────┐
  ↓                 ↓                 ↓
winston-logger   (future: pino)  (future: other)
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

**For production (Winston):**
```bash
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/winston-logger
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
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly' | 'help' | 'data' | 'prompt' | 'input';
```

**ILogger Interface:**

```typescript
interface ILogger {
  // Standard logging methods
  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  info: LeveledLogMethod;
  debug: LeveledLogMethod;
  http: LeveledLogMethod;
  verbose: LeveledLogMethod;
  silly: LeveledLogMethod;

  // Utility methods
  log: LogMethod;
  clear(): this;
  close(): this;

  // Profiling
  startTimer(): Profiler;
  profile(id: string | number, meta?: Record<string, unknown>): this;

  // Child loggers
  child(options: object): this;

  // Level checking
  isLevelEnabled(level: string): boolean;
}
```

### Exports

- **Types**: `ILogger`, `LogLevel` - Shared type definitions
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
# Use Winston logger
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/winston-logger

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
  },
});
```

## Winston Logger Implementation (`winston-logger`)

Production-ready logging using Winston, providing robust logging capabilities for both browser and server environments.

### Features

- ✅ Universal logging interface (works in browser and server)
- ✅ Multiple log levels with priorities
- ✅ Colored console output in development
- ✅ Stack trace support for debugging
- ✅ Child loggers for contextual logging
- ✅ Performance profiling tools
- ✅ Request/response logging middleware
- ✅ Configurable log levels

### Prerequisites

No external prerequisites are required. The Winston logger works out of the box.

### Configuration

Set these environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `LOGGER_LAYER_URI` | Yes | Points to winston-logger layer | `github:DCC-BS/nuxt-layers/winston-logger` |

### App Configuration Options

Configure the Winston logger in your `app.config.ts`:

```typescript
export default defineAppConfig({
  logger: {
    loglevel: "info",           // Minimum log level to display
    includeStackTrace: true,    // Include stack traces in logs
    stackTraceLimit: 5,         // Number of stack frames to include
  },
});
```

### Log Levels

The logger supports the following log levels (in order of priority):

1. **error** (0) - Error conditions
2. **warn** (1) - Warning conditions
3. **info** (2) - Informational messages
4. **http** (3) - HTTP requests/responses
5. **verbose** (4) - Detailed information
6. **debug** (5) - Debug information
7. **silly** (6) - Very detailed information

### Client-Side Usage

Use the logger in your Vue components:

```vue
<script setup lang="ts">
const logger = useLogger();

onMounted(() => {
  logger.debug('Component mounted');
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

On the server side, you use the `getEventLogger(event)` function to access the logger. This function retrieves the logger from the H3 event context, where it's automatically injected by the logger plugin.

#### Using `getEventLogger(event)`

The `getEventLogger` function is the primary way to access the logger in server-side code:

```typescript
export default eventHandler(async (event) => {
  const logger = getEventLogger(event);

  logger.info('Handling request');

  try {
    // Your handler logic
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

#### How It Works

The `getEventLogger` function works in tandem with the server plugin:

1. **Plugin Injection**: The `loggerPlugin.server.ts` plugin runs during server initialization and hooks into every request
2. **Event Context**: For each incoming request, the plugin adds the logger instance to `event.context.logger`
3. **Retrieval**: `getEventLogger(event)` accesses `event.context.logger` and returns the logger instance
4. **Type Safety**: The function throws a descriptive error if the logger isn't found in the context

This approach ensures that:
- Each request has access to the same logger instance
- The logger is properly initialized before use
- Type safety is maintained throughout your application
- The logger can be used in any server context (routes, middleware, utilities)

#### Using in Server Middleware

You can also use `getEventLogger` in server middleware:

```typescript
// server/middleware/auth.ts
import { getEventLogger } from '#layers/logger/server/utils/eventLogger';

export default eventHandler((event) => {
  const logger = getEventLogger(event);

  const token = getCookie(event, 'auth_token');

  if (!token) {
    logger.warn('Unauthorized access attempt', {
      path: event.path,
      ip: getRequestHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
    });
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    });
  }

  logger.debug('User authenticated', { token: maskToken(token) });
});
```

### Request Logging Middleware

The Winston logger includes automatic request/response logging:

```typescript
// server/middleware/requestLogger.ts
// Automatically logs all incoming requests with:
// - HTTP method and URL
// - Response status code
// - Response time
// - Request metadata
```

### Profiling

Measure execution time for operations:

```typescript
const logger = useLogger();

// Start a timer
const profiler = logger.startTimer();

// ... perform some operation ...

// End the timer and log the duration
profiler.done({ message: 'Operation completed' });
```

Or use the profile method:

```typescript
const logger = useLogger();

logger.profile('database-query');
// ... perform database query ...
logger.profile('database-query', { message: 'Query executed' });
```

### Child Loggers

Create contextual child loggers:

```typescript
const logger = useLogger();
const dbLogger = logger.child({ component: 'database' });

dbLogger.info('Connection established');
dbLogger.error('Query failed', { query: 'SELECT * FROM users' });
```

### Stack Traces

Enable stack traces for debugging:

```typescript
export default defineAppConfig({
  logger: {
    includeStackTrace: true,   // Enable stack traces
    stackTraceLimit: 5,        // Limit stack trace depth
  },
});
```

When enabled, errors will automatically include stack traces:

```typescript
logger.error('Something went wrong');
// Output includes:
// - Error message
// - Stack trace (up to stackTraceLimit frames)
// - Metadata
```

## Switching Between Implementations

The power of this layer system is seamless switching:

### Per Environment

Use different `.env` files:

```bash
# .env.local
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/winston-logger

# .env.production
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/winston-logger
```

### Per Developer

Each developer can use their own `.env.local`:

```bash
# Alice's .env.local (detailed logging)
LOGGER_LAYER_URI=github:DCC-BS/nuxt-layers/winston-logger
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

export function useLogger(): ILogger {
  // Your implementation
  const logger: ILogger = {
    info: (message: string, ...meta: unknown[]) => {
      console.log(`[INFO] ${message}`, ...meta);
    },
    error: (message: string, ...meta: unknown[]) => {
      console.error(`[ERROR] ${message}`, ...meta);
    },
    // ... implement other methods
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

export function getEventLogger(event: H3Event): ILogger {
  if (!event.context.logger) {
    throw new Error("Logger not found in event context");
  }
  return event.context.logger as ILogger;
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
