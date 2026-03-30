---
outline: deep
editLink: true
---

# Varlock Setup

[Varlock](https://varlock.dev/) is a tool for **AI-safe .env files** that provides:
- **Schemas** - Declarative configuration that serves as single source of truth
- **Validation** - Catch misconfiguration errors early with clear messages
- **Type-safety** - Auto-generated TypeScript types from your schema
- **Secret management** - Securely fetch secrets from password managers via `exec()` commands
- **Runtime protection** - Redact sensitive values from logs, detect leaks

## Quick Start

### Nuxt / Frontend

```bash
# Validate environment variables
bun env:check
```

### Python / Backend

```bash
# Install varlock (one-time setup)
curl -sSfL https://varlock.dev/install.sh | sh

# Validate environment (includes varlock scan)
make check

# Start dev server with env validation
make dev
```

## Secrets

We use [pass-cli](https://protonpass.github.io/pass-cli/) to inject secrets from **Proton Pass**.

Because some Linux distros have a conflicting `pass-cli` command, we created `scripts/get-secret.sh` which expects the binary at `$HOME/.local/bin/pass-cli`. For other locations, create `scripts/.env.get-secret`:

```bash
PASS_CLI_PATH=/custom/path/to/pass-cli
```

### Usage in Schema

In your `.env.schema`, use `exec()` to fetch secrets:

```bash
# @sensitive @type=string
MY_SECRET=exec(`./scripts/get-secret.sh pass://Vault/Item/Field`)
```

---

## Nuxt / Frontend

### Validation

Run `bun env:check` to validate environment variables. This command:
1. Logs into `pass-cli`
2. Sources `.env`
3. Runs `varlock load` to validate against schema

### Vite Plugin

The project uses `@varlock/vite-integration` for seamless integration:

```typescript
// nuxt.config.ts
import { varlockVitePlugin } from '@varlock/vite-integration';

export default defineNuxtConfig({
  vite: {
    plugins: [varlockVitePlugin({ ssrInjectMode: "resolved-env" })],
  }
});
```

### Build vs Runtime

For production Docker builds, we separate **buildtime** and **runtime** variables using different schemas:

| Schema | Purpose |
|--------|---------|
| `.env.schema` | Main schema, imports buildtime/runtime conditionally |
| `.env.buildtime.schema` | Variables needed at build time |
| `.env.runtime.schema` | Variables needed at runtime |

Control validation with `APP_MODE`:

| APP_MODE | Validates |
|----------|-----------|
| `dev` | All variables (buildtime + runtime) |
| `build` | Buildtime variables only |
| `prod` | Runtime variables only |

Example from `.env.schema`:

```bash
APP_MODE=dev

# Calculate which schema to validate
IS_RUNTIME=not(eq($APP_MODE, build))
IS_BUILDTIME=not(eq($APP_MODE, prod))
```

### Docker Integration

The Dockerfile uses varlock as entrypoint for runtime validation:

```dockerfile
# Runtime stage
ENV APP_MODE=prod
COPY --from=ghcr.io/dmno-dev/varlock:latest /usr/local/bin/varlock /usr/local/bin/varlock
ENTRYPOINT ["varlock", "run", "--", "node", "./server/index.mjs"]
```

This ensures env vars are validated before the app starts.

### Type Generation

Varlock auto-generates TypeScript types in `env.d.ts`:

```typescript
// Auto-generated - do not edit
type CoercedEnvSchema = {
  API_URL: string;
  LOG_LEVEL: string;
  // ...
};
```
The generated types can then be access via
```typescript
import { ENV } from 'varlock/env';

console.log(import.meta.env.SOMEVAR); // 🆗 still works
console.log(ENV.SOMEVAR);             // ✨ recommended
```

See also [Accessing environment variables](https://varlock.dev/integrations/vite/#accessing-environment-variables)

---

## Python / Backend

### Installation

Install the varlock standalone binary (required for Python projects):

```bash
# Homebrew
brew install dmno-dev/tap/varlock

# Or via cURL
curl -sSfL https://varlock.dev/install.sh | sh
```

See [Varlock standalone installation](https://varlock.dev/getting-started/installation/#as-a-standalone-binary) for more options.

### Makefile Integration

Varlock is integrated via Makefile:

```makefile
# Run validation and leak scanning
check:
    @varlock scan

# Start dev server with env injection
dev:
    @varlock run -- uv run fastapi dev ./src/app.py --port 8000
```

- `make check` - Runs `varlock scan` to validate and detect secret leaks
- `make dev` - Wraps the server with `varlock run` for env injection

### Schema Example

```bash
# .env.schema
# @env-spec
# @defaultRequired=infer
# @defaultSensitive=false

# @type=enum(development, staging, production)
ENVIRONMENT=development

# @type=url @required
API_URL=

# @sensitive @type=string
AZURE_CLIENT_SECRET=exec(`./scripts/get-secret.sh pass://Vault/Secret`)
```

---

## Further Reading

- [Varlock Documentation](https://varlock.dev/)
- [Getting Started](https://varlock.dev/getting-started/introduction)
- [Item Decorators Reference](https://varlock.dev/reference/item-decorators)
- [Docker Guide](https://varlock.dev/guides/docker/)
- [Python Integration](https://varlock.dev/integrations/other-languages/)
