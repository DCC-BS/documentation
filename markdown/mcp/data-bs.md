---
outline: deep
editLink: true
---

# Data.bs.ch MCP

Finds and queries datasets of the open government data (OGD) portal [data.bs.ch](https://data.bs.ch).

| | |
|---|---|
| Endpoint | `https://mcp.data.bs.ch/mcp` |
| API reference | [mcp.data.bs.ch/docs](https://mcp.data.bs.ch/docs) |
| Code | [DCC-BS/mcp-data-bs](https://github.com/DCC-BS/mcp-data-bs) |
| Image | `ghcr.io/dcc-bs/mcp-data-bs` |
| Data source | Explore API v2.1 of the portal, `https://<domain>/api/explore/v2.1` |

data.bs.ch runs on Huwise, formerly Opendatasoft. Every portal on that platform has the same API path, so the server is not tied to Basel-Stadt. `DATA_PORTAL_DOMAIN` picks the portal, and the DCC deployment sets it to `data.bs.ch`.

## Tools

| Tool | What it does |
|---|---|
| `get_datasets` | Searches the catalog. `semantic` mode (default) ranks by meaning through Huwise's `vector_similarity` endpoint and finds synonyms and other languages. `lexical` mode matches the exact words. `refine` filters by facet, `next_offset` pages |
| `get_dataset` | Metadata of one dataset: title, URL, modified date, publisher and the fields with name, type, label, unit and whether they can be sorted or faceted |
| `get_records` | Rows of a dataset with ODSQL `select`, `where`, `group_by`, `order_by` and `limit`. The result carries `dataset_id`, `url`, `title` and `modified`, so it can be cited on its own |
| `get_facets` | Valid filter values for the catalog: publisher, keyword, theme, features, modified, language |
| `export_dataset_url` | Download link for an export, optionally filtered. Formats: `csv`, `json`, `geojson`, `xlsx`, `shp`, `parquet`, `gpx`, `kml`, `rdfxml`, `jsonld`, `turtle` |

A typical call sequence:

```text
get_datasets(search="Luftqualität Messwerte")
get_dataset(dataset_id="100113")
get_records(dataset_id="100113", where="pm25 > 10", order_by="time DESC", limit=100)
export_dataset_url(dataset_id="100113", format="csv", where="sensornr=240")
```

## Things a model gets wrong

These came up in the deep research evaluation, and the tools and the agent's hints were adjusted for them.

* **Field names.** Models guess field names from the dataset title. `get_dataset` lists the real ones, so call it before `get_records`. A wrong name comes back as the portal's ODSQL error, which the model can act on.
* **Year fields are often text.** `where jahr >= 2016` fails with a type error on many datasets. Use `group_by=jahr`, `order_by="jahr desc"` and `limit`, or `where jahr in ("2015","2024")`.
* **Big results.** `get_records` caps its output at about 12,000 characters. When it cuts rows it sets `truncated: true` and a `hint` that suggests `select`, `group_by`, a smaller `limit` or `next_offset`.

`get_records` looks up the title and modified date in the catalog and keeps them in memory for one hour, so a records call costs at most one extra request.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `DATA_PORTAL_DOMAIN` | none, required | Portal domain, for example `data.bs.ch` |
| `MCP_ALLOWED_HOSTS` | unset, protection off | Allowed `Host` headers, see [Hosting](/mcp/hosting.md#allowed-hosts) |
| `PORT` | `8000` | HTTP port in the container |

The server reads the environment first, then a `.env` next to `main.py`.

## Connecting a client

Hosted, for Open WebUI, ChatGPT and other HTTP clients: add `https://mcp.data.bs.ch/mcp` as an MCP tool server. No key is needed.

Locally over stdio, for example in the Antigravity CLI:

```bash
agy mcp add --env DATA_PORTAL_DOMAIN=data.bs.ch databs -- \
  uvx --from git+https://github.com/DCC-BS/mcp-data-bs data-bs-mcp
```

Or in `claude_desktop_config.json` and `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "data-bs": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/DCC-BS/mcp-data-bs", "data-bs-mcp"],
      "env": { "DATA_PORTAL_DOMAIN": "data.bs.ch" }
    }
  }
}
```
