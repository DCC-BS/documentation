---
outline: deep
editLink: true
---

# Medienmitteilungen MCP

Finds and reads the press releases (Medienmitteilungen) of the canton of Basel-Stadt on [www.bs.ch/medien/medienmitteilungen](https://www.bs.ch/medien/medienmitteilungen). There are about 18,000 of them, going back to 1994.

| | |
|---|---|
| Endpoint | Not hosted yet. The planned hostname is `mcp-medienmitteilungen.statistik.bs.ch` |
| Code | [DCC-BS/mcp-medienmitteilungen](https://github.com/DCC-BS/mcp-medienmitteilungen) |
| Image | `ghcr.io/dcc-bs/mcp-medienmitteilungen` |
| Data source | Public JSON endpoints of the www.bs.ch Nuxt/Drupal platform: `/api/search/press-releases` and `/api/graphql/query/routeNodePressRelease` |

::: info Not in the facade yet
Version 0.1.0 is not yet part of the [dcc-mcp-facade](/mcp/hosting.md) stack and Bebbi Bot does not connect to it. Until it is hosted, run it locally over stdio (see [Connecting a client](#connecting-a-client)) or use the agent skill.
:::

The server keeps no index or database of its own. Search, filtering and the full text all come from the endpoints that the www.bs.ch frontend uses. The search there is lexical only. The repository's `docs/api-analyse.md` sketches a second stage with its own harvest, hybrid search and an entity graph, along the lines of the [Grosser Rat MCP](/mcp/grosser-rat.md).

## Tools

| Tool | What it does |
|---|---|
| `search_press_releases` | Full-text search with optional filters `organization`, `date_from` and `date_to` (`YYYY-MM-DD`), `limit` (default 10, max 50), `page` (zero-based) and `lang` (`de`, `en`, `fr`, `it`). Without `search` it lists the newest releases. Hits have `id`, `title`, `lead`, `organization`, `date`, `url` and `citation_label`, and the answer has `next_page` |
| `get_press_release` | One press release by URL, path (`/medienmitteilungen/...`) or node id (`43943` or `entity:node/43943:de`). Returns title, lead, `published` (ISO 8601), sender organization, `is_call_for_witnesses`, the body as plain text, `attachments` (PDFs), `links` and media `contacts` |
| `get_organizations` | The sender departments, offices and authorities with `id`, `name`, `count` and a `url` to the press release list filtered on them, largest first. `search` filters by name |

A typical call sequence:

```text
search_press_releases(search="Mindestlohn")
search_press_releases(search="Veloring", organization="Verkehr", date_from="2025-01-01")
get_press_release(press_release=43943)
get_organizations(search="Gesundheit")
```

## How it works

* **Organization names instead of ids.** The search endpoint only takes numeric Drupal taxonomy ids (`310` is the Bau- und Verkehrsdepartement, several are joined with `:`). The server keeps the list of about 60 senders in memory for an hour and resolves names and parts of names such as `"Verkehr"` or `"Grosser Rat"`, with or without umlauts. An unknown name fails with a `ToolError` that lists valid senders.
* **Search hits only carry the lead.** The article text is in the paragraphs of the GraphQL answer, so read a hit with `get_press_release` before quoting it.
* **Node ids are followed.** A search hit's id resolves through a redirect route to the canonical `/medienmitteilungen/...` path, so `get_press_release` takes ids as well as URLs.
* **No persisted-query hash.** The frontend sends a `__gqlh` hash to the GraphQL endpoint. The server leaves it out, so a rebuild of www.bs.ch does not break it.
* **Results fit into the context.** The body is cut at 12,000 characters with `truncated: true` and a `hint` to open the URL.

Every press release and every sender carries a `url` and a `citation_label` (`www.bs.ch · <title>`, `www.bs.ch · Medienmitteilungen: <sender>`), following the [shared design](/mcp/index.md#shared-design).

## Configuration

All settings are optional.

| Variable | Default | Meaning |
|---|---|---|
| `BS_DOMAIN` | `www.bs.ch` | Portal that serves `/api/*` |
| `BS_API_URL` | `https://<domain>` | Where the server fetches from. Links in results stay `https://<domain>` |
| `ORG_CACHE_TTL` | `3600` | Seconds the list of senders stays in memory |
| `MCP_ALLOWED_HOSTS` | unset, protection off | Allowed `Host` headers, see [Hosting](/mcp/hosting.md#allowed-hosts) |
| `PORT` | `8000` | HTTP port in the container |

The server reads the environment first, then a `.env` next to `main.py`.

## Connecting a client

Locally over stdio, in `claude_desktop_config.json` or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "medienmitteilungen-bs": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/DCC-BS/mcp-medienmitteilungen", "medienmitteilungen-bs-mcp"]
    }
  }
}
```

As a container, with the MCP endpoint at `/mcp`, `GET /healthz`, Swagger UI at `/docs` and the OpenAPI description at `/openapi.json`:

```bash
docker build -t mcp-medienmitteilungen .
docker run --rm -p 8000:8000 mcp-medienmitteilungen
```

The repository's `compose.yml` runs the published image on its own. The agent skill `skills/medienmitteilungen-bs/SKILL.md` calls the same endpoints with plain HTTP, without a server.
