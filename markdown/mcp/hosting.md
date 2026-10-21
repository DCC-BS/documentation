---
outline: deep
editLink: true
---

# Hosting and Facade

The three MCP servers run together in a Docker Compose stack managed in [DCC-BS/dcc-mcp-facade](https://github.com/DCC-BS/dcc-mcp-facade).

## Architecture

Request flow:

```
client ──HTTPS──> nginx (TLS termination)
                       │ proxy_pass (preserves Host header)
                       ▼
                   Traefik (in-cluster reverse proxy)
                       │ routes by Host header
          ┌────────────┼──────────────────────────┐
          ▼            ▼                          ▼
   mcp.data.bs.ch  mcp-grosserrat.statistik.bs.ch  mcp.statistik.bs.ch
   ogd container   grossrat container              statistik container
   (mcp-data-bs)   (grossrat-bs-mcp)               (mcp-statistikportal)
```

- **nginx** is external to the compose project: it terminates TLS for each domain and forwards traffic to the Traefik container over the shared Docker bridge network (`mcp`).
- **Traefik** (pinned to `v3.6.1+` for Docker v29+ API compatibility) routes incoming requests strictly by their `Host` header to the respective service container. Any unrouted host receives a `404`.

## Services

| Service | Container | Image | Role |
|---|---|---|---|
| `ogd` | `mcp-ogd` | `ghcr.io/dcc-bs/mcp-data-bs:latest` | MCP server for data.bs.ch |
| `grossrat` | `mcp-grossrat` | `ghcr.io/dcc-bs/grossrat-bs-mcp:latest` | MCP server for the Grosser Rat Basel-Stadt |
| `statistik` | `mcp-statistik` | `ghcr.io/dcc-bs/mcp-statistikportal:latest` | MCP server for statistik.bs.ch |
| `reverse-proxy` | `mcp-reverse-proxy` | `traefik:v3.6.1` | Hostname-based reverse proxy |

## Configuration & Environment

Configuration is controlled via `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `DOCKER_SOCKET` | Docker daemon socket for Traefik's Docker provider | `/var/run/docker.sock` (rootful) or `/run/user/<UID>/docker.sock` (rootless) |
| `TRAEFIK_PORT` | Published host port for the Traefik proxy | `8001` (default) |

### Allowed Hosts (`MCP_ALLOWED_HOSTS`)

The MCP HTTP servers include DNS-rebinding protection by default. Because nginx forwards a **bare** `Host` header (e.g., `Host: mcp.data.bs.ch` without a port), `MCP_ALLOWED_HOSTS` in the container configuration must be an **exact match**:

```yaml
MCP_ALLOWED_HOSTS: "mcp.data.bs.ch"
```

::: warning Do not use wildcards behind nginx
Do not configure `mcp.data.bs.ch:*`. That pattern matches only `Host` headers containing a port number; a bare host from nginx will fail with `421 Invalid Host header`.
:::

## Operations

Start the stack:

```bash
docker compose up -d
```

Verify status and healthchecks:

```bash
docker compose ps
docker compose logs reverse-proxy
```

To update the `grossrat` server with a newer data release:

```bash
docker compose pull grossrat && docker compose up -d grossrat
```

### 503 bursts

All three hosts answer `503 Service Unavailable` in bursts of seconds to minutes, often at the same time. The responses come from the Airlock/Apache front (`Server: Apache`, cookie `AL_SESS-S`), not from the containers.

In Bebbi Bot a 503 at connection time leaves the chat without the server's tools. A 503 during a tool call cancels the chat. Bebbi Bot now retries 502/503/504 for about 15 seconds, which covers short bursts only. Investigation: [dcc-mcp-facade#5](https://github.com/DCC-BS/dcc-mcp-facade/issues/5).

## Local Testing

Test endpoints locally by providing the target `Host` header directly to Traefik's port:

```bash
# Health checks
curl -H "Host: mcp.data.bs.ch" http://localhost:8001/healthz
curl -H "Host: mcp-grosserrat.statistik.bs.ch" http://localhost:8001/healthz
curl -H "Host: mcp.statistik.bs.ch" http://localhost:8001/healthz

# Test MCP initialize
curl -N \
  -H "Host: mcp.data.bs.ch" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}' \
  http://localhost:8001/mcp
```
