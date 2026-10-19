---
outline: deep
editLink: true
---

# Statistik.bs MCP

Gives models the indicators, time series and web tables of the Statistisches Amt Basel-Stadt on [statistik.bs.ch](https://statistik.bs.ch).

| | |
|---|---|
| Endpoint | `https://mcp.statistik.bs.ch/mcp` |
| API reference | [mcp.statistik.bs.ch/docs](https://mcp.statistik.bs.ch/docs) |
| Code | [DCC-BS/mcp-statistikportal](https://github.com/DCC-BS/mcp-statistikportal) |
| Image | `ghcr.io/dcc-bs/mcp-statistikportal` |
| Data source | Public JSON endpoints of the statistikportal Nuxt app (see [llms.txt](https://statistik.bs.ch/llms.txt)) and its Meilisearch index |

The portal has two kinds of content that the server covers:

* About 1,080 **indicators** in the Indikatorenportal. Each has metadata (reading aid, explanations, sources) and a time series.
* About 220 **web tables** (Webtabellen), the Excel tables of the statistical yearbook, often with several sheets.

The data.bs.ch portal holds many of the same numbers as raw datasets. Use the [Data.bs.ch MCP](/mcp/data-bs.md) for those. statistik.bs.ch adds the explanations, the official selection of indicators and the yearbook tables.

## Tools

| Tool | What it does |
|---|---|
| `search_indicators` | Ranked search over the indicator index: title, then subtitle, subtopic, topic or set, then reading aid. Filters `thema`, `unterthema`, `kennzahlenset`, `raeumliche_gliederung` |
| `get_indicator` | Metadata of one indicator: unit, reading aid (`lesehilfe`), explanations, sources (`quellenangabe`), links, spatial units, last update. HTML becomes plain text |
| `get_indicator_data` | The time series as `headers` and `rows` with numbers parsed, plus `unit`, `source`, `notes` on definitions and series breaks, and `latest`, the newest period with values |
| `get_facets` | Valid values with counts for `thema`, `unterthema`, `kennzahlenset`, `raeumliche_gliederung` and `darstellungsart` |
| `get_table` | One web table by file name, table code or download URL. Returns the sheet list, one sheet as `columns` and `rows`, footnotes, the Steckbrief (contact, reference period, source), the Excel `download_url` and a `csv_url` |
| `search_portal` | Full-text search over all portal content: articles, web tables, maps, dashboards, OGD datasets and indicators. Only registered when `MEILISEARCH_URL` and `MEILISEARCH_KEY` are set. It is on in production |

Examples:

```text
search_indicators(search="Arbeitslosenquote")
search_indicators(search="Leerwohnungen", raeumliche_gliederung="Wohnviertel")
get_indicator_data(indicator_id=5813, max_rows=24)
get_table(table="t03.4.04", max_rows=12, from_end=True)
get_table(table="t10.1.04", sheet="Jul")
```

Every result that can be cited has `title`, `portal_url` and `aktualisierungsdatum` (the Stand). For web tables, `source` and `aktualisierungsdatum` come from the Steckbrief.

## How the search works

The server downloads the indicator index, keeps it in memory for an hour (`INDEX_CACHE_TTL`) and ranks it itself.

* **Use German terms.** Umlauts may be written `ä`, `ae` or `a`.
* Plural and case endings and compounds are tolerated: `Leerwohnungen` finds `Leerwohnungsquote`.
* Ties go to an exact title, then the shorter title, then the newer update.
* `match` tells the model how good the hits are: `all_terms`, `partial` (with `matched_terms` and a `hint`) or `none`.

The index holds only the indicators shown in the Indikatorenportal. About 2,500 indicator files exist. The others can be read by id with `get_indicator` and `get_indicator_data`, but nothing lists them. `search_portal` finds content outside the index.

## Shaping data for a model

The portal delivers every value as a string, and web tables keep the layout of the yearbook with multi-row headers and group rows. The server reshapes both before the model sees them.

* `get_indicator_data` parses numbers and derives `unit` from the subtitle ("in %" becomes `%`, "Anzahl Personen" becomes `Personen`, `null` if unclear). Up to 600 characters of explanations and reading aid go along as `notes`, so definitions and series breaks reach the model.
* `get_table` joins multi-row headers into one column name ("Schweizer Bevölkerung – Männlich") and turns group rows such as `Total` into a `Gruppe` column. Numbers are rounded to six significant digits. Placeholders like `…` stay text.
* Long series keep the newest rows. Output stops at `max_rows` (default 200) and at about 12,000 characters, with `truncated: true` and a `hint`. `get_table` pages with `offset` or `from_end=True`.
* Invalid input fails with a `ToolError` that names the fix: an unknown sheet lists the valid sheets, a bad indicator id points to `search_indicators`.

## Configuration

All settings are optional.

| Variable | Default | Meaning |
|---|---|---|
| `STATISTIK_PORTAL_DOMAIN` | `statistik.bs.ch` | Portal that serves `/api/*`, for example a test host |
| `STATISTIK_PORTAL_API_URL` | `https://<domain>` | Where the server fetches from. Links in results stay `https://<domain>` |
| `INDEX_CACHE_TTL` | `3600` | Seconds the indicator index stays in memory |
| `MEILISEARCH_URL` | none | Enables `search_portal`, together with the key |
| `MEILISEARCH_KEY` | none | A search-only key for the `product` index |
| `MCP_ALLOWED_HOSTS` | unset, protection off | Allowed `Host` headers, see [Hosting](/mcp/hosting.md#allowed-hosts) |

In the facade deployment, `STATISTIK_PORTAL_API_URL` is `http://statistik.bs.ch`, because from inside that network the portal only answers on port 80. Links in tool results still use https.

## Connecting a client

Hosted: add `https://mcp.statistik.bs.ch/mcp` as an MCP tool server. No key is needed.

Locally over stdio, in `claude_desktop_config.json` or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "statistik-bs": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/DCC-BS/mcp-statistikportal", "statistik-bs-mcp"]
    }
  }
}
```

The repository's `docs/api-analyse.md` lists gaps in the portal API that the server works around.
