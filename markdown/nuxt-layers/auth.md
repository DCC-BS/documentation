---
outline: deep
editLink: true
---

# Authentication Layer

The authentication layer provides a flexible, plug-and-play authentication system for DCC-BS Nuxt applications. It enables switching between different authentication implementations (Azure AD, no-auth) using environment variables, without changing your application code.

## Overview

The authentication system is designed with three layers:

1. **`auth`** - Base layer that defines the authentication interface and types
2. **`azure-auth`** - Production implementation using Microsoft Azure AD
3. **`no-auth`** - Development/testing implementation that bypasses authentication

## How It Works

The base `auth` layer dynamically loads an authentication implementation based on the `AUTH_LAYER_URI` environment variable. This allows you to:

- Switch from Azure AD to no-auth for local development
- Test without authentication dependencies
- Use different auth providers per environment (dev, staging, prod)
- Keep your application code authentication-agnostic

### Architecture

```
Your Nuxt App
    ↓
  extends: ['github:DCC-BS/nuxt-layers/auth']
    ↓
  AUTH_LAYER_URI environment variable
    ↓
  ┌─────────────────┬─────────────────┐
  ↓                 ↓                 ↓
azure-auth      no-auth        (future: other-auth)
```

## Quick Start

### 1. Add Auth Layer to Your Project

In your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/auth', { install: true }]
  ]
})
```

### 2. Configure Authentication Implementation

Set the `AUTH_LAYER_URI` environment variable to choose your implementation:

**For production (Azure AD):**
```bash
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/azure-auth
```

**For development (no authentication):**
```bash
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/no-auth
```

### 3. Use Authentication in Your App

The auth layer provides type-safe authentication utilities:

```typescript
// In a component or composable
const { data, signOut, isAuthEnabled } = useAppAuth();

// In server routes
export default authHandler.build('/api/protected-endpoint');
```

## Base Auth Layer (`auth`)

The base authentication layer defines the contract that all implementations must follow.

### Type Definitions

**User Type:**

```typescript
interface User {
  name: string
  email: string
  // Additional user properties from auth provider
  [key: string]: unknown
}
```

**AuthData Type:**

```typescript
interface AuthData {
  user: User;
}
```

### Exports

- **Types**: `User`, `AuthData` - Shared type definitions
- **`authHandler`**: Server utility for creating authenticated API handlers
- **Dynamic loading**: Automatically extends the implementation specified in `AUTH_LAYER_URI`

### Configuration

The layer reads the following environment variable:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_LAYER_URI` | Yes | URI to the authentication implementation layer |

**Example:**

```bash
# Use Azure AD authentication
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/azure-auth

# Use no authentication
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/no-auth

# Use local layer (for development)
AUTH_LAYER_URI=./layers/custom-auth
```

## Azure Auth Implementation (`azure-auth`)

Production-ready authentication using Microsoft Azure Active Directory (Azure AD / Entra ID).

### Features

- ✅ OAuth 2.0 / OpenID Connect flow
- ✅ Automatic token refresh and management
- ✅ User profile integration with Azure AD
- ✅ Bearer token injection for backend API calls
- ✅ Secure session management

### Prerequisites

Before using Azure Auth, you need:

1. An Azure AD application registration
2. Configured redirect URIs in Azure portal
3. Client ID and tenant ID from Azure

### Configuration

Set these environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AUTH_LAYER_URI` | Yes | Points to azure-auth layer | `github:DCC-BS/nuxt-layers/azure-auth` |
| `AZURE_AD_CLIENT_ID` | Yes | Azure AD application client ID | `12345678-1234-...` |
| `AZURE_AD_TENANT_ID` | Yes | Azure AD tenant ID | `87654321-4321-...` |
| `AZURE_AD_REDIRECT_URI` | Yes | OAuth redirect URI | `https://app.example.com/auth/callback` |
| `API_URL` | Yes | Backend API base URL | `https://api.example.com` |

### Azure AD Setup

1. **Create an App Registration** in Azure Portal:
   - Go to Azure Active Directory → App registrations
   - Click "New registration"
   - Set a name for your application
   - Choose "Accounts in this organizational directory only"

2. **Configure Authentication**:
   - Add platform: Web
   - Add redirect URI: `https://your-app.com/auth/callback`
   - Enable ID tokens and access tokens

3. **Note the Application Details**:
   - Copy the "Application (client) ID" → `AZURE_AD_CLIENT_ID`
   - Copy the "Directory (tenant) ID" → `AZURE_AD_TENANT_ID`

4. **Configure API Permissions** (if accessing Azure APIs):
   - Add required Microsoft Graph permissions
   - Grant admin consent if required

### How It Works

1. **User visits protected route** → Redirected to Azure AD login
2. **User authenticates** → Azure AD redirects back with authorization code
3. **Token exchange** → Backend exchanges code for access & ID tokens
4. **Session created** → User info stored in session
5. **API calls** → `authHandler` automatically adds Bearer token to requests

### Using authHandler

The `authHandler` provided by azure-auth automatically includes the Azure AD access token in backend API requests:

```typescript
// server/api/users/index.get.ts
export default authHandler.build('/users')
```

This handler will:
- Extract the user's access token from their session
- Add `Authorization: Bearer <token>` header to the backend request
- Forward the request to `${API_URL}/users`
- Return the response to the client

### Custom Handler with Azure Auth

You can extend the authHandler for custom logic:

::: info
see also [Backend Communication](./backend_communication)
:::

```typescript
// server/api/custom.post.ts

export default authHandler
  .withMethod('POST')
  .postMap(async (response) => {
    // Transform response
    return {
      data: response,
      processedAt: new Date().toISOString()
    }
  })
  .build('/api/custom-endpoint')
```

### User Composable

Access the authenticated user in your Vue components:

```vue
<script setup>
const { data } = useAppAuth();

</script>

<template>
  <div v-if="data">
    <p>Welcome, {{ data.user.name }}!</p>
    <p>Email: {{ data.user.email }}</p>
  </div>
  <div v-else>
    <p>Please log in</p>
  </div>
</template>
```

### Security Considerations

- Tokens are stored securely in server-side sessions
- Access tokens are never exposed to the client
- Token refresh is handled automatically
- HTTPS is required for production deployments

## No Auth Implementation (`no-auth`)

A stub implementation that bypasses authentication, useful for development and testing.

### Features

- ✅ No authentication required
- ✅ Mock user data for testing
- ✅ Simple `authHandler` without auth headers
- ✅ Perfect for local development

### When to Use

Use `no-auth` when:

- 🛠️ Developing locally without Azure AD access
- 🧪 Running automated tests that don't need real authentication
- 📄 Building public-facing pages that don't require login
- 🐛 Debugging application logic without auth complexity

### Configuration

Simply set the environment variable:

```bash
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/no-auth
```

No additional configuration is needed. The `API_URL` is still required for backend communication.

### How It Works

The no-auth layer:

1. **Skips authentication checks** - All requests are treated as authenticated
2. **Provides empty user** - Returns a user object whete all fields are empty strings
3. **useAppAuth().isAuthEnabled returns false** - Indicates no authentication is active
4. **Simple authHandler** - Forwards requests without authentication headers
5. **No token management** - No OAuth flow or token refresh

### Mock User Data

The no-auth implementation provides a empty user:

```typescript
{
  name: "",
  email: "",
  image: "",
}
```

Check if authentication is enabled:

```vue
<script setup lang="ts">
const { data, isAuthEnabled } = useAppAuth();
</script>

<template>
  <div v-if="isAuthEnabled">
    <p>Authenticated User: {{ data.user.name }}</p>
  </div>
</template>
```

### Using authHandler (No Auth)

The `authHandler` in no-auth mode works the same way, but doesn't add authentication headers:

```typescript
// server/api/data.get.ts
export default authHandler.build('/data')
```

This forwards requests to the backend without the `Authorization` header. Your backend should be configured to accept unauthenticated requests in development mode.

### Development Workflow

A typical development setup:

```bash
# .env.development
API_URL=http://localhost:8000
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/no-auth
```

```bash
# .env.production
API_URL=https://api.example.com
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/azure-auth
AZURE_AD_CLIENT_ID=...
AZURE_AD_TENANT_ID=...
AZURE_AD_REDIRECT_URI=https://app.example.com/auth/callback
```

### Limitations

- ⚠️ **Backend must allow unauthenticated requests** - Or you'll get 401 errors

## Switching Between Implementations

The power of this layer system is seamless switching:

### Per Environment

Use different `.env` files:

```bash
# .env.local
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/no-auth

# .env.production
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/azure-auth
```

### Per Developer

Each developer can use their own `.env.local`:

```bash
# Alice's .env.local (has Azure access)
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/azure-auth
AZURE_AD_CLIENT_ID=...

# Bob's .env.local (no Azure access)
AUTH_LAYER_URI=github:DCC-BS/nuxt-layers/no-auth
```

## Advanced Usage

### Creating Custom Auth Implementations

Create a layer
```sh
bun create nuxt -- --template layer nuxt-layer 
```
Edit `.nuxt.config.ts`
```ts{3}
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/auth', { install: true }]
  ],
  devtools: { enabled: true },
});
```
run 
```sh
bun i
bun dev:prepare
```

Remove the generate code in the `app/` directory and implement your own authentication logic:

add `app/composables/useAuth.ts`
```ts
import type { AuthData } from "#layers/auth/app/types/authData";
import type { UseAppAuthReturns } from "#layers/auth/app/types/composableTypes";

export function useAppAuth(): UseAppAuthReturns {
    const data = computed<AuthData>(() => {
        return {
            user: {
                image: // your Implementation,
                name: // your Implementation,
                email: // your Implementation,
            },
        };
    });

    async function signOut(): Promise<void> {
        // your Implementation
    }

    async function signIn(): Promise<void> {
        // your Implementation
    }

    return {
        signIn,
        signOut,
        data,
        isAuthEnabled: computed(() => !!nuxtData.value),
    };
}
````

add `server/utils/authHandler.ts`
```ts
export const authHandler = backendHandlerBuilder().extendFetchOptions(
    async (options) => {
        // your Implementation to get auth context
        const { apiAccessToken } = await getAuthContext(options.event);

        return {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${apiAccessToken}`,
            },
        };
    },
);
````

implement middlewares, endpoints, etc. as needed.

Example structure:

```
my-custom-auth/
├── .playground/
│   └──nuxt.config.ts
├── app/
│   └── composables/
│       └── useAppAuth.ts
├── server/
│   └── utils/
│       └── authHandler.ts
├── package.json
├── ...
└── nuxt.config.ts
```

Now you can use your custom auth layer by setting the environment variable in a nuxt application whch uses the Auth layer:

```bash
AUTH_LAYER_URI=github:your-github-username/your-custom-auth
```

## Related Documentation

- [Backend Communication Layer](./backend_communication.md) - Used by auth implementations
- [Health Check Layer](./health_check.md) - Monitoring endpoints
- [Nuxt Layers Overview](./index.md) - Main documentation
