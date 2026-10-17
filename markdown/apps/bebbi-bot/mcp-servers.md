---
outline: deep
editLink: true
---

# MCP servers for Basel-Stadt data

The DCC runs three [MCP](https://modelcontextprotocol.io/) servers that give AI assistants access to public data of the canton Basel-Stadt. Each one wraps a public data source and returns results that carry a URL, a title and a date (Stand), so an answer can cite its source.

| Server | Data source | Endpoint | Code |
|---|---|---|---|
| Grossrat-MCP | Grosser Rat Basel-Stadt: business items, documents, transcripts since 1973 | `https://mcp-grosserrat.statistik.bs.ch/mcp` | TODO: repository `grossrat-bs-mcp` (image `ghcr.io/dcc-bs/grossrat-bs-mcp`) is not visible in the DCC-BS organisation; add the link or mark it private |
| OGD MCP | Open data portal [data.bs.ch](https://data.bs.ch) | `https://mcp.data.bs.ch/mcp` | [mcp-data-bs](https://github.com/DCC-BS/mcp-data-bs) |
| Statistik Portal MCP | Indikatorenportal [statistik.bs.ch](https://statistik.bs.ch) | `https://mcp.statistik.bs.ch/mcp` | [mcp-statistikportal](https://github.com/DCC-BS/mcp-statistikportal) |

All three speak streamable HTTP on the path `/mcp`. The OGD and Statistik servers need no authentication (their READMEs say so). The `dcc-mcp-facade` repository routes the three hostnames to the right container: nginx terminates TLS, Traefik routes by hostname. See its [README](https://github.com/DCC-BS/dcc-mcp-facade).

> [!WARNING]
> TODO: confirm whether the endpoints are reachable from outside the cantonal network and whether the Grossrat server needs authentication. The sources I could read do not say.

## Where they are used

- The [deep research agent](/apps/bebbi-bot/deep-research.md) calls them in its presets: `grossrat` uses the Grossrat server, `statistik` uses the Statistik and OGD servers, and the legal and administration presets use parts of them.
- They are **not** seeded into Bebbi Bot as tool servers. Only OpenCaseLaw is (see [Tools and workspace content](/apps/bebbi-bot/tools.md#opencaselaw)). Anyone can add an endpoint by hand in Open WebUI under Settings, Tools.
- Other MCP clients (Claude Desktop, Cursor, ChatGPT connectors) can use the same endpoints. The two open-source servers also run locally over stdio with `uvx`.

> [!WARNING]
> TODO: state whether the three servers are meant to be offered to all Bebbi Bot users (as a tool-server file in `seeder/content/tool-servers/`) or stay deep-research only.

## Grossrat-MCP

**Purpose.** Search the business of the Grosser Rat Basel-Stadt: motions, Regierungsrat answers, Ratschläge, minutes. Every business item (Geschäft) and every document has a public URL on grosserrat.bs.ch, so answers cite the original.

**Data source.** The server's own index of all Geschäfte, documents and transcripts since 1973, with full texts.

> [!WARNING]
> TODO: name the upstream source of the data (Parlamentsdienst export, open data set, scraper?) and how often the index refreshes. The server code is not in the repositories I could read.

**Tools** (names and descriptions from the research agent's configuration, `config/presets.yaml`, section `mcp_servers.grossrat`):

| Tool | What it does |
|---|---|
| `find_geschaefte` | Lists business items for a question. Takes several German phrasings; filters `since` / `until` (YYYY-MM-DD), `geschaeftsart`, `status`. Returns number, title, type, status and URL, no texts |
| `get_geschaeft` | Dossier of one item by number, for example `23.5544`: status, documents with date and URL, assignments with deadlines, council decisions |
| `search_documents` | Full-text search for passages in all documents. Returns snippets with a citation link and `dok_laufnr` |
| `get_document` | Text of one document by `dok_laufnr`, 20,000 characters per window, continue with `offset` |
| `list_facets` | Allowed values for the filters `partei`, `geschaeftsart`, `status`, `dokumentart` |

The server may offer more tools. The research agent uses these five only.

**Examples.**

- "Welche Vorstösse zur Hitzeminderung gab es seit 2020?" The model calls `find_geschaefte` with phrasings such as "Hitzeminderung" and "Stadtklima", `since=2020-01-01`, then `get_geschaeft` for the important items.
- "Was antwortete der Regierungsrat auf die Motion 23.5544?" `get_geschaeft` lists the documents, `get_document` reads the answer.

**Known limits** (from the evaluation of 2026-10-09, from `docs/grossrat-mcp-changes.md` of the bebbi-deep-research repository):

- No tool returns the legislature periods, so "in der laufenden Legislatur" needs the dates from the user.
- `find_geschaefte` returned 100 items by default (over 8,000 characters). Clients should send `limit`.
- `search_documents` hits had empty `urheber` and `partei`.

> [!WARNING]
> TODO: check whether these limits are fixed. The note dates from 2026-10-13.

## OGD MCP (data.bs.ch)

**Purpose.** Find and query datasets of the open data portal of Basel-Stadt.

**Data source.** The Explore 2.1 API of the portal (Huwise, formerly Opendatasoft), `https://<domain>/api/explore/v2.1`. The server reads the portal domain from `DATA_PORTAL_DOMAIN`, so the same code serves any portal on that platform. Our deployment points at `data.bs.ch`.

**Tools** (from the README and `main.py` of `mcp-data-bs`):

| Tool | What it does |
|---|---|
| `get_datasets` | Searches the catalog. `semantic` mode (default) ranks by meaning and also matches synonyms and other languages, `lexical` mode matches exact terms. Facet filters through `refine`, paging through `next_offset` |
| `get_dataset` | Metadata of one dataset: title, URL, description, modified date, record count and fields with name, type, label, unit |
| `get_records` | Rows of a dataset with ODSQL `select`, `where`, `group_by`, `order_by`, `limit`. The result carries `dataset_id`, `url`, `title` and `modified`, so it is citable on its own. Output is capped at about 12,000 characters, with `truncated` and a `hint` when rows were cut |
| `get_facets` | Valid filter values: publisher, keyword, theme, features, modified, language |
| `export_dataset_url` | Download URL for an export in `csv`, `json`, `geojson`, `xlsx`, `shp`, `parquet`, `gpx`, `kml`, `rdfxml`, `jsonld` or `turtle`, optionally filtered |

Call `get_dataset` before `get_records`: it shows the real field names and types. Year fields are often text, so a filter like `jahr >= '2016'` fails; use `group_by` or `order_by` instead. API errors reach the model with the portal's message.

**Examples.**

```text
get_datasets(search="Luftqualität Messwerte")
get_dataset(dataset_id="100113")
get_records(dataset_id="100113", where="pm25 > 10", order_by="time DESC", limit=100)
export_dataset_url(dataset_id="100113", format="csv")
```

Without a server, the repository also ships an agent skill (`skills/data-bs/SKILL.md`) that teaches the same REST calls.

## Statistik Portal MCP (statistik.bs.ch)

**Purpose.** Look up statistical indicators of the Statistisches Amt and read their time series.

**Data source.** The public JSON endpoints of the [Indikatorenportal](https://statistik.bs.ch). The server keeps the indicator index (about 1,080 indicators shown in the portal) in memory for one hour (`INDEX_CACHE_TTL`). About 2,500 indicator files exist; the ones outside the index can only be read by id.

**Tools** (from `mcp-statistikportal`):

| Tool | What it does |
|---|---|
| `search_indicators` | Ranked search over the index. German terms only. Tolerates umlaut spellings (`ä`, `ae`, `a`), plural endings and compounds. Filters `thema`, `unterthema`, `kennzahlenset`, `raeumliche_gliederung`. Hits show `id`, `title`, `unit`, `aktualisierungsdatum`, `portal_url` |
| `get_indicator` | Metadata of one indicator: unit, reading aid (`lesehilfe`), explanations |
| `get_indicator_data` | Values of one indicator by id: headers, rows (newest kept, `max_rows`), unit, source, `latest` period, notes on series breaks |
| `get_facets` | Valid filter values with counts for `search_indicators` |
| `search_portal` | Optional. Full-text search over all portal content (articles, reports, tables, maps, datasets). Only registered when `MEILISEARCH_URL` and `MEILISEARCH_KEY` are set |

**Examples.**

```text
search_indicators(search="Arbeitslosenquote")
search_indicators(search="Leerwohnungen", raeumliche_gliederung="Wohnviertel")
get_indicator_data(indicator_id=5813, max_rows=24)
```

> [!WARNING]
> TODO: the evaluation notes of 2026-10-13 say the production container could not reach statistik.bs.ch and the server was switched off in the research agent. Confirm the current state before publishing.

## Connecting a client

For the open-source servers, the READMEs give these routes.

- **Open WebUI:** Settings, Tools, add the endpoint URL from the table above.
- **Local, over stdio:** `uvx --from git+https://github.com/DCC-BS/mcp-data-bs data-bs-mcp` (with `DATA_PORTAL_DOMAIN=data.bs.ch`) and `uvx --from git+https://github.com/DCC-BS/mcp-statistikportal statistik-bs-mcp`.
- **API reference:** the HTTP servers serve an OpenAPI description at `/openapi.json` and Swagger UI at `/docs`.

Set `MCP_ALLOWED_HOSTS` when you host a server under your own hostname. Without it the server accepts any `Host` header; with an unlisted host it answers `421`.
