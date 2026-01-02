---
outline: deep
editLink: true
---

# Backend Communication Layer

The backend communication layer provides powerful utilities for building type-safe, configurable API handlers in your Nuxt server routes. It simplifies communication between your Nuxt application and backend APIs with a fluent builder interface.

## Overview

The backend communication layer offers:

- 🔧 **Fluent Builder API** - Chain methods to configure your handlers
- 🔒 **Type Safety** - Full TypeScript support for requests and responses
- 🔄 **Request/Response Transformation** - Pre and post-processing of data
- 🎯 **Flexible Fetch Options** - Extend and customize HTTP requests
- ⚡ **Error Handling** - Built-in error transformation and handling
- 🔌 **Integration Ready** - Works seamlessly with auth layers

## Quick Start

### Installation

Add the layer to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/backend_communication', { install: true }]
  ]
})
```

### Basic Usage

Create a simple pass-through API handler:

```typescript
// server/api/users.get.ts
import { backendHandlerBuilder } from '#backend_communication'

export default backendHandlerBuilder()
  .build('/users')
```

This creates a GET handler that forwards requests to `${API_URL}/users`.

## Configuration

The layer requires the following environment variable:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `API_URL` | Yes | Base URL of your backend API | `https://api.example.com` |

```bash
# .env
API_URL=https://api.example.com
```

## Builder API

The `backendHandlerBuilder()` provides a chainable interface for configuring handlers.

### Methods

#### `withMethod(method: string)`

Set the HTTP method for the request.

```typescript
export default backendHandlerBuilder()
  .withMethod('POST')
  .build('/users')
```

**Default**: Inherits from the incoming request method

#### `preMap(fn: (event) => Promise<any>)`

Transform the request body before sending to the backend.

```typescript
export default backendHandlerBuilder()
  .withMethod('POST')
  .preMap(async (event) => {
    const body = await readBody(event)
    return {
      ...body,
      timestamp: Date.now(),
      source: 'nuxt-app'
    }
  })
  .build('/users')
```

**Use cases:**
- Add timestamps or metadata
- Validate request data
- Transform data structure
- Filter sensitive fields

#### `postMap(fn: (response) => Promise<any>)`

Transform the response from the backend before returning to client.

```typescript
export default backendHandlerBuilder()
  .postMap(async (response) => {
    return {
      data: response.items,
      count: response.items.length,
      processedAt: new Date().toISOString()
    }
  })
  .build('/users')
```

**Use cases:**
- Normalize response format
- Add computed fields
- Filter sensitive data
- Transform data structure

#### `extendFetchOptions(fn: (options, event) => Promise<FetchOptions>)`

Extend or modify fetch options before making the request.

```typescript
export default backendHandlerBuilder()
  .extendFetchOptions(async (options, event) => {
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-API-Key': process.env.API_KEY,
        'X-Request-ID': generateRequestId()
      },
      timeout: 5000
    }
  })
  .build('/users')
```

**Use cases:**
- Add authentication headers (done automatically by auth layers)
- Add custom headers
- Set timeouts
- Configure retries
- Add query parameters

#### `build(path: string)`

Build and return the configured handler. Must be called last.

```typescript
export default backendHandlerBuilder()
  .withMethod('GET')
  .build('/users')
```

**Parameters:**
- `path` - The backend API endpoint path (relative to `API_URL`)

## Common Patterns

### Pass-Through Handler

The simplest pattern - forward requests directly:

```typescript
// server/api/data.get.ts
export default backendHandlerBuilder()
  .build('/data')
```

Request to `/api/data` → Forwards to `${API_URL}/data`

### POST with Body Transformation

Transform the request before sending:

```typescript
// server/api/users.post.ts
export default backendHandlerBuilder()
  .withMethod('POST')
  .preMap(async (event) => {
    const body = await readBody(event)
    return {
      firstName: body.first_name,
      lastName: body.last_name,
      email: body.email.toLowerCase(),
      createdAt: new Date().toISOString()
    }
  })
  .build('/users')
```

### Response Normalization

Standardize response format:

```typescript
// server/api/users.get.ts
export default backendHandlerBuilder()
  .postMap(async (response) => {
    return {
      success: true,
      data: response,
      meta: {
        timestamp: Date.now(),
        version: '1.0'
      }
    }
  })
  .build('/users')
```

### Custom Headers and Timeout

Add custom headers and configure timeout:

```typescript
// server/api/external.get.ts
export default backendHandlerBuilder()
  .extendFetchOptions(async (options) => {
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-API-Key': process.env.EXTERNAL_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 seconds
    }
  })
  .build('/external/data')
```

### Combined Transformations

Use multiple transformations together:

```typescript
// server/api/orders.post.ts
export default backendHandlerBuilder()
  .withMethod('POST')
  .preMap(async (event) => {
    const body = await readBody(event)
    // Validate and transform request
    return {
      ...body,
      orderId: generateOrderId(),
      timestamp: Date.now()
    }
  })
  .extendFetchOptions(async (options) => {
    // Add custom headers
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-Idempotency-Key': generateIdempotencyKey()
      }
    }
  })
  .postMap(async (response) => {
    // Transform response
    return {
      success: true,
      order: response,
      confirmationUrl: generateConfirmationUrl(response.id)
    }
  })
  .build('/orders')
```

## Integration with Auth Layer

When used with the [auth layer](./auth.md), the authentication implementation automatically extends the backend handler to add authentication headers.

### Azure Auth Integration

With `azure-auth`, the `authHandler` automatically adds the Bearer token:

```typescript
// server/api/protected.get.ts
import { authHandler } from '#auth'

export default authHandler.build('/protected-data')
```

This is equivalent to:

```typescript
export default backendHandlerBuilder()
  .extendFetchOptions(async (options, event) => {
    const token = await getTokenFromSession(event)
    return {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    }
  })
  .build('/protected-data')
```

### No Auth Integration

With `no-auth`, the `authHandler` is a simple pass-through:

```typescript
// Same code works without authentication in dev mode
export default authHandler.build('/data')
```

## Error Handling

The builder includes built-in error handling that transforms backend errors into proper HTTP responses.

### Default Error Handling

```typescript
// Automatically handles:
// - Network errors
// - HTTP error status codes
// - Timeout errors
// - Invalid responses

export default backendHandlerBuilder()
  .build('/users')
```

### Custom Error Handling

Add custom error handling with `postMap`:

```typescript
export default backendHandlerBuilder()
  .postMap(async (response) => {
    return response
  })
  .build('/users')
  .catch((error) => {
    // Custom error transformation
    throw createError({
      statusCode: error.statusCode || 500,
      message: 'Failed to fetch users',
      data: { originalError: error.message }
    })
  })
```

## Advanced Usage

### Dynamic Path Construction

Build paths dynamically based on request:

```typescript
// server/api/users/[id].get.ts
import { backendHandlerBuilder } from '#backend_communication'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const handler = backendHandlerBuilder()
    .build(`/users/${id}`)
  
  return handler(event)
})
```

### Conditional Transformations

Apply transformations based on conditions:

```typescript
export default backendHandlerBuilder()
  .preMap(async (event) => {
    const body = await readBody(event)
    const query = getQuery(event)
    
    // Different transformation based on query param
    if (query.format === 'minimal') {
      return { id: body.id, name: body.name }
    }
    
    return body
  })
  .build('/users')
```

### Request Validation

Validate requests before forwarding:

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().min(18)
})

export default backendHandlerBuilder()
  .withMethod('POST')
  .preMap(async (event) => {
    const body = await readBody(event)
    
    // Validate with Zod
    const validated = userSchema.parse(body)
    
    return validated
  })
  .build('/users')
```

### Response Caching

Add caching to responses:

```typescript
const cache = new Map()

export default backendHandlerBuilder()
  .postMap(async (response) => {
    const cacheKey = JSON.stringify(response)
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })
    return response
  })
  .build('/users')
```

### Retry Logic

Implement retry logic with extended fetch options:

```typescript
export default backendHandlerBuilder()
  .extendFetchOptions(async (options) => {
    return {
      ...options,
      retry: 3,
      retryDelay: 1000,
      onRetry: ({ attempt, error }) => {
        console.log(`Retry attempt ${attempt}: ${error.message}`)
      }
    }
  })
  .build('/users')
```

## Type Safety

The builder supports TypeScript generics for type-safe transformations:

```typescript
interface User {
  id: number
  name: string
  email: string
}

interface UserResponse {
  users: User[]
  total: number
}

export default backendHandlerBuilder()
  .postMap(async (response: UserResponse) => {
    return {
      data: response.users,
      count: response.total,
      hasMore: response.total > response.users.length
    }
  })
  .build('/users')
```

## Performance Considerations

### Minimize Transformations

Only transform data when necessary:

```typescript
// ❌ Unnecessary transformation
export default backendHandlerBuilder()
  .postMap(async (response) => response) // No-op
  .build('/users')

// ✅ Direct pass-through
export default backendHandlerBuilder()
  .build('/users')
```

### Async Operations

Use async operations efficiently:

```typescript
export default backendHandlerBuilder()
  .preMap(async (event) => {
    const [body, session] = await Promise.all([
      readBody(event),
      getSession(event)
    ])
    return { ...body, userId: session.user.id }
  })
  .build('/users')
```

### Streaming Large Responses

For large responses, avoid transformations that load entire response:

```typescript
// For large files/data, use direct pass-through
export default backendHandlerBuilder()
  .build('/large-file')
```

## Testing

### Unit Testing Handlers

```typescript
import { describe, it, expect } from 'vitest'
import { backendHandlerBuilder } from '#backend_communication'

describe('User Handler', () => {
  it('transforms request body', async () => {
    const handler = backendHandlerBuilder()
      .preMap(async (event) => {
        const body = await readBody(event)
        return { ...body, processed: true }
      })
      .build('/users')
    
    // Test handler with mock event
    const mockEvent = createMockEvent({ body: { name: 'Test' } })
    const result = await handler(mockEvent)
    
    expect(result.processed).toBe(true)
  })
})
```

### Integration Testing

```typescript
import { setup, $fetch } from '@nuxt/test-utils'

describe('API Integration', async () => {
  await setup()
  
  it('forwards request to backend', async () => {
    const response = await $fetch('/api/users')
    expect(response).toBeDefined()
  })
})
```

## Troubleshooting

### "API_URL is not defined"

Make sure you've set the environment variable:

```bash
# .env
API_URL=https://api.example.com
```

### CORS Errors

The handler runs server-side, so CORS shouldn't be an issue. If you see CORS errors:
- Check your backend CORS configuration
- Verify the backend URL is correct
- Ensure you're not making client-side fetch calls

### Request Body is Empty

Make sure to use `preMap` to read the body:

```typescript
// ❌ Wrong
export default backendHandlerBuilder()
  .build('/users')

// ✅ Correct for POST/PUT
export default backendHandlerBuilder()
  .withMethod('POST')
  .preMap(async (event) => readBody(event))
  .build('/users')
```

### Timeout Errors

Increase timeout in fetch options:

```typescript
export default backendHandlerBuilder()
  .extendFetchOptions(async (options) => ({
    ...options,
    timeout: 30000 // 30 seconds
  }))
  .build('/slow-endpoint')
```

## Best Practices

### 1. Use Descriptive File Names

```
server/api/
  ├── users/
  │   ├── index.get.ts      # GET /api/users
  │   ├── index.post.ts     # POST /api/users
  │   └── [id].get.ts       # GET /api/users/:id
  └── orders/
      └── index.get.ts      # GET /api/orders
```

### 2. Keep Transformations Simple

```typescript
// ✅ Good - single responsibility
export default backendHandlerBuilder()
  .preMap(async (event) => addTimestamp(await readBody(event)))
  .build('/users')

// ❌ Bad - too much logic
export default backendHandlerBuilder()
  .preMap(async (event) => {
    // 50 lines of complex logic
  })
  .build('/users')
```

### 3. Reuse Common Transformations

```typescript
// utils/transformations.ts
export const addTimestamp = (body) => ({
  ...body,
  timestamp: Date.now()
})

export const normalizeResponse = (response) => ({
  success: true,
  data: response
})

// server/api/users.post.ts
export default backendHandlerBuilder()
  .preMap(async (event) => addTimestamp(await readBody(event)))
  .postMap(normalizeResponse)
  .build('/users')
```

### 4. Document Your Handlers

```typescript
/**
 * Creates a new user
 * 
 * Transforms request to add timestamp and source
 * Returns normalized response with user data
 */
export default backendHandlerBuilder()
  .withMethod('POST')
  .preMap(async (event) => {
    const body = await readBody(event)
    return { ...body, timestamp: Date.now() }
  })
  .build('/users')
```

## Related Documentation

- [Auth Layer](./auth.md) - Authentication integration
- [Health Check Layer](./health_check.md) - Monitoring endpoints
- [Nuxt Layers Overview](./index.md) - Main documentation
