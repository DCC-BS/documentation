---
outline: deep
editLink: true
---

# Custom image

Bebbi Bot runs `ghcr.io/fd-itbs/open-webui`, built from the `image/` folder of the `kdkp-open-web-ui` repository on top of upstream's slim image (`ghcr.io/open-webui/open-webui:<version>-slim`). A GitHub workflow builds it by hand with the upstream release tag, for example `v0.12.4`. The same run builds the [seeder image](/apps/bebbi-bot/seeder-janitor.md). Tags and rollout are on [Repository and releases](/apps/bebbi-bot/repository.md#releases).

We never edit Open WebUI's source files. The image adds files and hooks. A hook is a Python module that runs when a given Open WebUI module is imported, and wraps or replaces a function in it. All hooks live in `image/site-packages/` and register from one table in `sitecustomize.py`. The only other build step adds Python packages for the in-browser code interpreter.

This keeps upgrades checkable. A hook that logs `FAILED` points at the exact thing that moved upstream.

## How the hooks work

Python runs `sitecustomize.py` in every process of the image, before Open WebUI is importable. It imports no Open WebUI module itself. It registers each hook to run when the module it patches is first imported. A plain `python3 -c ...` in the container therefore never loads Open WebUI's configuration.

| Hook | Patches | Switch, default |
|---|---|---|
| Entra group sync | Login callback | `DCC_ENABLE_ENTRA_TRANSITIVE_GROUP_SYNC`, off |
| Pyodide prompt | Code interpreter prompt | Always on |
| Docling async loader | Document loader | `DCC_ENABLE_DOCLING_ASYNC`, on |
| Deep research delivery | Adds one API route | On when `DCC_DEEP_RESEARCH_DELIVERY_SECRET` is set |
| CSP report | Adds one API route | `DCC_ENABLE_CSP_REPORTS`, off |
| MCP citations | Citation sources from tool results | `DCC_ENABLE_MCP_CITATIONS`, on |
| MCP instructions | Instructions MCP servers send | `DCC_ENABLE_MCP_INSTRUCTIONS`, on |
| MCP HTTP retry | MCP HTTP client | `DCC_ENABLE_MCP_HTTP_RETRY`, on |
| RAG citations | Citation sources for files and knowledge | `DCC_ENABLE_RAG_CITATIONS`, on |
| Sub-agent sources | Sub-agent results | `DCC_ENABLE_RAG_CITATIONS`, on |
| Knowledge tool candidates | Retrieval for the knowledge tool | `DCC_ENABLE_KNOWLEDGE_TOOL_CANDIDATES`, on |
| Governance | Adds the governance page and its API | `BEBBI_BOT_ENABLE_GOVERNANCE`, on |
| Governance org capture | Login callback | `BEBBI_BOT_ENABLE_GOVERNANCE`, on |

Each hook logs one line at startup, `[PostImport] hook ... installed` or `... FAILED: <reason>`. Most hooks check the shape of the upstream code first and refuse to patch when it changed. In production a failed hook leaves Open WebUI running without that one feature. With `DCC_HOOKS_STRICT=True` a failed hook stops the server instead. The image end-to-end check in CI runs in strict mode, so a hook that no longer fits fails the build.

Two hooks can wrap the same function. The table fixes the order: the RAG citation hook wraps what the MCP citation hook installed, and a unit test checks that order.

## Slim base

The standard Open WebUI image is about 4.6 GB, mostly torch and bundled embedding, reranking and Whisper models. Our pods mount a per-pod volume over the data directory, because the cluster has no shared read-write storage. The mount hides the baked-in models, so each pod would download them again. The slim image is about 830 MB and downloads nothing.

We use none of what the standard image adds. Embeddings, reranking, document extraction and web loading all run as external services. The deployment must therefore provide what slim refuses to do locally:

| Need | How we provide it |
|---|---|
| Database and vector store | PostgreSQL, `VECTOR_DB=pgvector` |
| Embeddings | Qwen3-Embedding-4B on the KDKP, OpenAI-compatible API |
| Reranking | Qwen3-Reranker-4B on the KDKP |
| PDF and Office text extraction | Docling on the KDKP |
| Speech to text | Whisper on the KDKP |
| Web loading | Firecrawl |
| File storage | S3 |

The server runs as an unprivileged user. It owns only the data volume and the static folder Open WebUI writes at startup. The application code and our hooks stay owned by root, so the server process cannot change them. Python bytecode is compiled at build time for the same reason.

## Root certificates and proxy

The IT BS root certificates are installed in the image, so Open WebUI trusts the internal endpoints: `*.bs.ch`, the S3 service and the KDKP gateway. The image also sets the corporate proxy and the list of hosts that bypass it.

## Python packages in the browser

Open WebUI runs the code interpreter in the browser, with Pyodide. The slim image ships none of Pyodide's wheel files and would make every browser load each package from a public CDN at runtime.

The image bundles the wheels itself, 61 packages and about 48 MiB. A manifest (`image/build/pyodide/pyodide-packages.json`) lists each package with its version, hash and tier. The build downloads each wheel, checks its hash against the lock file and fails on any mismatch.

* Tier 1 packages load at startup: `openpyxl`, `pypdf`, `xlsxwriter`, `tabulate`, `xlrd` and their dependencies. A model can `import openpyxl` without installing anything.
* Tier 2 packages ship as files and load on demand: `python-docx`, `python-pptx`, `fpdf2`, `seaborn` and others. The frontend installs some of them by itself when it sees the import.
* The manifest also lists what upstream's standard image bundles (`numpy`, `pandas`, `matplotlib`, `scipy` and others), so slim serves the same set locally.

A hook rewrites the system prompt of the code interpreter. Upstream's prompt says the model cannot install packages and does not say which ones exist. Ours lists the available libraries and how to import each, so the model uses them directly.

## Office templates

The package `kdkp_office` turns Markdown into Word, PowerPoint and PDF files in the layout of the Canton of Basel-Stadt. It uses the canton's Word template (logo, numbered headings, table style, page footer) and PowerPoint template (title, content and section layouts). PDF output converts the Word file with headless LibreOffice. The image installs LibreOffice for that, and for page previews and Excel formula recalculation in the edit tools.

The [create and edit tools](/apps/bebbi-bot/tools.md#office-files) import this package. The seeder ships the tools, the image ships the package, so a tool can only use what the running image has.

## Login: nested Entra groups

Microsoft's token for a user does not list nested group memberships when the tenant allows delegated permissions only. The hook intercepts the login callback. It reads the groups assigned to Open WebUI's enterprise application, asks Microsoft Graph which of them the user belongs to (including through nesting), and hands that list to Open WebUI's normal group handling.

Only groups assigned to the enterprise application are synced, and no extra Graph permissions or admin consent are needed. Assignments are cached for five minutes, so changes in the Azure portal show up without a restart.

The governance manager adds a second step to the same callback: it reads the user's Departement and Dienststelle from Graph and stores them on the server. It does not use the profile fields users can edit themselves.

## Docling conversions

Open WebUI sends a document to Docling in one HTTP request and waits. The Airlock WAF and the Tyk gateway between them cut connections after 300 seconds, so long conversions failed with a 504. The hook swaps the loader for Docling's task API: submit the file, then poll for the result. Every request is short.

The loader waits at most 30 minutes per document. One pod runs at most 8 conversions at a time, because each waiting conversion holds a worker thread. A further upload waits 30 seconds for a free slot and then fails with "too many conversions in progress", and the user uploads it again.

Docling exports pictures as placeholders. See [Images in documents](/apps/bebbi-bot/index.md#images-in-documents).

## MCP: citations, instructions and retries

Three hooks on Open WebUI's MCP handling. See [Tools](/apps/bebbi-bot/tools.md#citations-from-mcp-results) for what users see.

* **Citation sources from MCP results.** Open WebUI makes citation sources only from its own retrieval tools. The hook adds the tools of the configured MCP servers (`DCC_MCP_CITATION_SERVERS`, by default all five). Each result item with a public URL becomes one source, with a label the model can repeat: `GR 23.5544 · Motion …`, `BGE 142 III 442`, `Art. 271 OR`, `data.bs · Leerstehende Wohnungen`, or the page title on bs.ch for Alva. The source tag in the model's context carries a short excerpt. Without it, the model rarely wrote `[n]`. A result without a public URL gives no source, instead of upstream's fallback badge with raw JSON. At most 30 sources per call.
* **Own instructions.** Replaces the `instructions` an MCP server sends with a text from `image/site-packages/dcc_mcp_instructions/<server id>.md`. Open WebUI appends them in full to every system message, and the servers' own texts asked for Markdown links instead of citation markers. An empty file drops a server's text, a missing file keeps it.
* **Retries.** The front of the `*.bs.ch` MCP hosts answers `503` in bursts. Without retries, a 503 during a tool call cancelled the whole chat and left an empty answer. The MCP HTTP client now retries 502, 503, 504 and connection errors up to five times, over about 15 seconds.

The labels for the DCC servers are a workaround until each server sends its own `citation_label`. The hook already prefers the server's label over its own rules, so each rule goes once its server follows the convention.

## Knowledge bases: citations and retrieval

Three hooks change how Open WebUI cites and searches knowledge bases and files. [Knowledge bases and citations](/apps/bebbi-bot/knowledge.md) explains the effect and the measurements behind them.

* **One source per passage.** Upstream numbers sources by file name, so every retrieved chunk of a file shares one badge, and the badge opens all of them. The hook makes each chunk its own source, labelled with the file and where the chunk sits: `Personalgesetz.pdf · S. 4` or `SG_162.100.md · § 28–29`. A chunk found twice keeps one number.
* **Sub-agent sources.** A sub-agent's answer reached the parent chat without its sources, and its `[n]` pointed to the parent's sources or nowhere. The hook carries the sub-agent's sources into the parent answer.
* **Knowledge up front.** Under native function calling, Open WebUI leaves knowledge search to the model. Gemma searched once and rarely again. The hook retrieves the model's attached knowledge before the model runs, as Open WebUI's chat path already does, and keeps the knowledge tool for further searches (`DCC_ENABLE_KNOWLEDGE_PREFETCH`).
* **Reranker candidates.** The knowledge tool asked the retrieval for 5 results, so the reranker saw only 5 candidates. The hook lets it rerank from the full candidate set first.

## Governance page

The [governance manager](/apps/bebbi-bot/governance.md) is a page inside Open WebUI. Its frontend is a Nuxt app in `governance_ui/`, compiled during the image build and served by Open WebUI. Its API, policy and database tables live in `image/site-packages/bebbi_bot_governance/`. The tables carry the prefix `bebbi_bot_`, so the janitor's scans and Open WebUI's migrations leave them alone.

## Other changes

* **Delivery route for deep research.** One extra API route that lets the research service write a finished report into a user's chat at night. See [Deep research](/apps/bebbi-bot/deep-research.md#delivering-the-report).
* **CSP reports.** A Content Security Policy tells the browser which hosts a page may load from. If model output ever rendered an image tag that points to another host, the browser would refuse to load it, so no data leaves through the URL. Open WebUI sets the header but has no route for the browser's violation reports. The hook adds `POST /api/v1/dcc/csp-report`. It keeps only the directive, the blocked origin and the page path, and logs each new pair once. The policy runs in report-only mode on test. After a week of normal use without unexpected reports it moves to uat, then gets enforced.
* **Tool metrics.** The package `kdkp_metrics` lets our tools report calls, duration, time spent waiting for a slot and outcome (`ok`, `refused_limit`, `busy`, `error`, `cancelled`) through Open WebUI's OpenTelemetry setup. The collector exposes them to Prometheus as `openwebui_kdkp_tool_*`. Labels never carry a user, file or chat id.
* **Static icons.** Icons for functions are files under `/static/kdkp/`. The frontend sends every action icon of the chosen model with each chat request, and the WAF blocked requests that carried an inline SVG.

## Checks

| Check | What it catches |
|---|---|
| Unit tests in `tests/image/` | Each hook against copies of the upstream functions and real captured responses, for example MCP results of the four citation servers |
| `image-e2e.yml` | Builds the image, starts it in strict mode with Postgres, S3 and a model stub, and fails if a startup hook did not install. Then loads the deep research functions inside the image and imports everything they import, seeds, and runs the janitor |
| Upgrade dossier | Each page in `docs/` of the repository has an upstream checklist: the functions and signatures a hook relies on. An upgrade works through all of them. See [Upgrading Open WebUI](/apps/bebbi-bot/repository.md#upgrading-open-webui) |
