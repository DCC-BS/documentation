---
outline: deep
editLink: true
---

# Health Check Layer

The health check layer provides Kubernetes-ready health monitoring endpoints for containerized Nuxt applications. It implements standard health check patterns that enable container orchestration platforms to monitor application health and manage pod lifecycle.

## Overview

The health check layer provides three standard endpoints:

- 🟢 **Liveness Probe** (`/health/liveness`) - Is the application running?
- 🔵 **Readiness Probe** (`/health/readiness`) - Can the application serve traffic?
- 🟡 **Startup Probe** (`/health/startup`) - Has the application started successfully?

These endpoints are designed for Kubernetes health checks but work with any container orchestration platform (Docker Swarm, ECS, etc.).

## Quick Start

### Installation

Add the layer to your `nuxt.config.ts`:

```/dev/null/nuxt.config.ts#L1-7
export default defineNuxtConfig({
  extends: [
    ['github:DCC-BS/nuxt-layers/health_check', { install: true }]
  ]
})
```

That's it! The health check endpoints are immediately available at:

- `GET /health/liveness`
- `GET /health/readiness`
- `GET /health/startup`

### Test the Endpoints

```/dev/null/terminal.sh#L1-11
# Start your Nuxt app
npm run dev

# Test liveness endpoint
curl http://localhost:3000/health/liveness

# Test readiness endpoint
curl http://localhost:3000/health/readiness

# Test startup endpoint
curl http://localhost:3000/health/startup
```

## Health Check Endpoints

### Liveness Probe

**Endpoint**: `GET /health/liveness`

**Purpose**: Determines if the application is running and responsive.

**When to Use**: 
- Kubernetes liveness probes
- Detecting deadlocks or hung processes
- Automatic pod restarts when unhealthy

**Response**:

```/dev/null/response.json#L1-4
{
  "status": "ok",
  "timestamp": 1234567890
}
```

**HTTP Status Codes**:
- `200 OK` - Application is alive
- `503 Service Unavailable` - Application is not responding (should trigger restart)

**Kubernetes Configuration**:

```/dev/null/deployment.yaml#L1-10
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
  successThreshold: 1
```

### Readiness Probe

**Endpoint**: `GET /health/readiness`

**Purpose**: Determines if the application can handle incoming requests.

**When to Use**:
- Kubernetes readiness probes
- Load balancer health checks
- Determining if pod should receive traffic
- Rolling deployment coordination

**Response**:

```/dev/null/response.json#L1-5
{
  "status": "ready",
  "timestamp": 1234567890,
  "checks": {}
}
```

**HTTP Status Codes**:
- `200 OK` - Application is ready to serve traffic
- `503 Service Unavailable` - Application is not ready (remove from load balancer)

**Kubernetes Configuration**:

```/dev/null/deployment.yaml#L1-10
readinessProbe:
  httpGet:
    path: /health/readiness
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
  successThreshold: 1
```

### Startup Probe

**Endpoint**: `GET /health/startup`

**Purpose**: Indicates that the application has completed its initialization.

**When to Use**:
- Kubernetes startup probes
- Applications with long startup times
- Preventing premature liveness/readiness checks
- Initial health verification

**Response**:

```/dev/null/response.json#L1-4
{
  "status": "started",
  "timestamp": 1234567890
}
```

**HTTP Status Codes**:
- `200 OK` - Application has started successfully
- `503 Service Unavailable` - Application is still starting

**Kubernetes Configuration**:

```/dev/null/deployment.yaml#L1-10
startupProbe:
  httpGet:
    path: /health/startup
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 30
  successThreshold: 1
```

## Kubernetes Integration

### Complete Deployment Example

```/dev/null/deployment.yaml#L1-60
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nuxt-app
  labels:
    app: nuxt-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nuxt-app
  template:
    metadata:
      labels:
        app: nuxt-app
    spec:
      containers:
      - name: nuxt-app
        image: your-registry/nuxt-app:latest
        ports:
        - containerPort: 3000
          name: http
        
        # Startup probe - runs first
        startupProbe:
          httpGet:
            path: /health/startup
            port: 3000
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 30  # 30 * 5s = 150s max startup time
          successThreshold: 1
        
        # Liveness probe - restarts pod if fails
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3  # Restart after 3 failures
          successThreshold: 1
        
        # Readiness probe - removes from service if fails
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3  # Remove from service after 3 failures
          successThreshold: 1
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Probe Execution Order

1. **Startup probe** runs first and disables liveness/readiness probes
2. Once startup succeeds, **liveness** and **readiness** probes begin
3. **Liveness** probe continues checking if app is alive
4. **Readiness** probe continues checking if app can serve traffic

```/dev/null/flow.txt#L1-15
Application Start
    ↓
Startup Probe (running)
    ├─ Success → Enable other probes
    └─ Failure → Kill and restart pod
    ↓
Liveness Probe (running)
    ├─ Success → Continue
    └─ Failure → Restart pod
    ↓
Readiness Probe (running)
    ├─ Success → Add to service endpoints
    └─ Failure → Remove from service endpoints
    ↓
Application Running
```

## Docker Compose Integration

Health checks work with Docker Compose too:

```/dev/null/docker-compose.yml#L1-20
version: '3.8'

services:
  nuxt-app:
    build: .
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health/liveness"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - API_URL=https://api.example.com
    deploy:
      replicas: 2
```

## Advanced Configuration

### Custom Health Checks

While the layer provides basic health checks out of the box, you can extend them with custom logic:

```/dev/null/server/api/health/custom.get.ts#L1-30
export default defineEventHandler(async (event) => {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    externalApi: await checkExternalApi()
  }
  
  const allHealthy = Object.values(checks).every(c => c.healthy)
  
  if (!allHealthy) {
    throw createError({
      statusCode: 503,
      message: 'Service Unavailable',
      data: checks
    })
  }
  
  return {
    status: 'ok',
    timestamp: Date.now(),
    checks
  }
})

async function checkDatabase() {
  try {
    // Check database connection
    return { healthy: true, latency: 10 }
  } catch (error) {
    return { healthy: false, error: error.message }
  }
}
```

### Enhanced Readiness Probe

Override the default readiness check to include dependency checks:

```/dev/null/server/api/health/readiness.get.ts#L1-45
export default defineEventHandler(async (event) => {
  const checks = {
    database: false,
    redis: false,
    apiBackend: false
  }
  
  try {
    // Check database
    checks.database = await checkDatabaseConnection()
    
    // Check Redis cache
    checks.redis = await checkRedisConnection()
    
    // Check backend API
    checks.apiBackend = await checkBackendAPI()
    
    const allReady = Object.values(checks).every(Boolean)
    
    if (!allReady) {
      throw createError({
        statusCode: 503,
        message: 'Not Ready',
        data: checks
      })
    }
    
    return {
      status: 'ready',
      timestamp: Date.now(),
      checks
    }
  } catch (error) {
    throw createError({
      statusCode: 503,
      message: 'Health check failed',
      data: {
        error: error.message,
        checks
      }
    })
  }
})
```

## Monitoring and Observability

### Prometheus Metrics

Combine health checks with Prometheus metrics:

```/dev/null/server/api/metrics.get.ts#L1-20
import { register } from 'prom-client'

export default defineEventHandler(async (event) => {
  // Prometheus metrics endpoint
  setHeader(event, 'Content-Type', register.contentType)
  return register.metrics()
})
```

### Logging Health Check Failures

Add logging to track health check failures:

```/dev/null/server/api/health/liveness.get.ts#L1-25
export default defineEventHandler(async (event) => {
  try {
    // Perform health checks
    const isHealthy = await checkApplicationHealth()
    
    if (!isHealthy) {
      console.error('[Health Check] Liveness probe failed', {
        timestamp: new Date().toISOString(),
        reason: 'Application unhealthy'
      })
      
      throw createError({
        statusCode: 503,
        message: 'Unhealthy'
      })
    }
    
    return {
      status: 'ok',
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('[Health Check] Error during liveness probe', error)
    throw error
  }
})
```

## Best Practices

### 1. Keep Health Checks Lightweight

Health checks should be fast and not resource-intensive:

```/dev/null/example.ts#L1-15
// ✅ Good - quick check
export default defineEventHandler(() => ({
  status: 'ok',
  timestamp: Date.now()
}))

// ❌ Bad - expensive operation
export default defineEventHandler(async () => {
  // Don't do this in health checks
  await scanEntireDatabase()
  await processAllQueues()
  return { status: 'ok' }
})
```

### 2. Use Appropriate Timeouts

Set timeouts that match your application's behavior:

```/dev/null/deployment.yaml#L1-12
# Fast-responding app
readinessProbe:
  timeoutSeconds: 1
  periodSeconds: 5

# Slower app or dependency checks
readinessProbe:
  timeoutSeconds: 5
  periodSeconds: 10
```

### 3. Configure Failure Thresholds

Allow for transient failures:

```/dev/null/deployment.yaml#L1-11
livenessProbe:
  # Don't restart on first failure
  failureThreshold: 3  # Fail 3 times before restart
  
readinessProbe:
  # Quick response to unavailability
  failureThreshold: 2  # Remove from service after 2 failures
  # But require stability before adding back
  successThreshold: 2  # Must succeed 2 times to be ready
```

### 4. Set Appropriate Initial Delays

Give your app time to start:

```/dev/null/deployment.yaml#L1-15
startupProbe:
  # No delay - check immediately
  initialDelaySeconds: 0
  
livenessProbe:
  # Wait for app to fully start
  initialDelaySeconds: 30
  
readinessProbe:
  # Check sooner if app starts quickly
  initialDelaySeconds: 10
```

### 5. Differentiate Liveness vs Readiness

- **Liveness**: Can the app recover on its own?
  - ✅ If no → Return unhealthy (trigger restart)
  - ❌ If yes → Return healthy (let it recover)

- **Readiness**: Can the app serve requests right now?
  - ✅ If yes → Return ready
  - ❌ If no → Return not ready (temporary)

```/dev/null/example.ts#L1-30
// Liveness - check for fatal conditions
export default defineEventHandler(async () => {
  // Fatal: app is deadlocked
  if (isDeadlocked()) {
    return { statusCode: 503, status: 'unhealthy' }
  }
  
  // Not fatal: temporary issue
  if (databaseTemporarilyUnavailable()) {
    return { status: 'ok' } // Still alive, just not ready
  }
  
  return { status: 'ok' }
})

// Readiness - check if can serve traffic
export default defineEventHandler(async () => {
  // Not ready: dependencies unavailable
  if (await !canConnectToDatabase()) {
    return { statusCode: 503, status: 'not ready' }
  }
  
  if (await !canConnectToCache()) {
    return { statusCode: 503, status: 'not ready' }
  }
  
  return { status: 'ready' }
})
```

## Troubleshooting

### Health Checks Always Fail

**Symptom**: All health check requests return 503 or timeout

**Solutions**:
1. Verify the app is actually running: `curl http://localhost:3000`
2. Check if port 3000 is exposed in Docker
3. Verify health check paths are correct
4. Check application logs for errors
5. Increase timeout values

### Pods Keep Restarting

**Symptom**: Kubernetes continuously restarts pods

**Cause**: Liveness probe is failing

**Solutions**:
1. Increase `initialDelaySeconds` - app may need more startup time
2. Increase `timeoutSeconds` - health check may be timing out
3. Increase `failureThreshold` - allow more failures
4. Check if liveness probe is too strict
5. Review application logs during restart

### Pods Not Receiving Traffic

**Symptom**: Pods are running but no traffic reaches them

**Cause**: Readiness probe is failing

**Solutions**:
1. Check readiness endpoint returns 200
2. Verify dependencies are available (database, cache, etc.)
3. Check if readiness logic is too strict
4. Review readiness probe configuration
5. Test endpoint manually: `kubectl port-forward pod-name 3000:3000`

### Slow Rolling Updates

**Symptom**: Deployments take a long time

**Cause**: Health check configuration

**Solutions**:
1. Reduce `periodSeconds` for faster checks
2. Reduce `successThreshold` for readiness
3. Reduce `initialDelaySeconds` if app starts quickly
4. Use startup probe to separate startup from readiness

## Testing

### Local Testing

```/dev/null/test.sh#L1-15
#!/bin/bash

# Test all health endpoints
echo "Testing liveness..."
curl -f http://localhost:3000/health/liveness || echo "FAILED"

echo "Testing readiness..."
curl -f http://localhost:3000/health/readiness || echo "FAILED"

echo "Testing startup..."
curl -f http://localhost:3000/health/startup || echo "FAILED"

echo "All tests complete"
```

### Integration Tests

```/dev/null/test.ts#L1-20
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Health Checks', async () => {
  await setup()
  
  it('liveness probe returns ok', async () => {
    const response = await $fetch('/health/liveness')
    expect(response.status).toBe('ok')
  })
  
  it('readiness probe returns ready', async () => {
    const response = await $fetch('/health/readiness')
    expect(response.status).toBe('ready')
  })
  
  it('startup probe returns started', async () => {
    const response = await $fetch('/health/startup')
    expect(response.status).toBe('started')
  })
})
```

## Related Documentation

- [Backend Communication Layer](./backend_communication.md) - API communication utilities
- [Auth Layer](./auth.md) - Authentication integration
- [Nuxt Layers Overview](./index.md) - Main documentation

## External Resources

- [Kubernetes Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Health Check Patterns](https://microservices.io/patterns/observability/health-check-api.html)

---

**Repository**: [DCC-BS/nuxt-layers](https://github.com/DCC-BS/nuxt-layers)  
**Maintained by**: Data Competence Center Basel-Stadt  
**License**: MIT
