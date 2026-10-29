---
outline: deep
editLink: true
---

# Tools and workspace content

This page lists what the [seeder](/apps/bebbi-bot/seeder-janitor.md) puts into Bebbi Bot on top of stock Open WebUI. The source of every item is a file under `seeder/content/` in the `kdkp-open-web-ui` repository.

| Folder | Content |
|---|---|
| `tools/` | Office create and edit tools, web search with review |
| `functions/` | Filters (`context_usage`, `office_edit_hint`, `subagent_hint`, `citation_cleanup`), the deep research pipe and its Word action |
| `skills/` | `dokumente-erstellen`, `dokumente-bearbeiten` |
| `prompts/` | `/einfach`, `/email`, `/checkliste` |
| `tool-servers/` | Five MCP servers |
| `models/` | The four chat models, Deep Research, two hidden base models |

## Tools, functions and skills in Open WebUI

Open WebUI separates two kinds of Python plugin. The [official overview](https://docs.openwebui.com/features/extensibility/plugin/) has the details.

* A [tool](https://docs.openwebui.com/features/extensibility/plugin/tools/) is a Python class whose methods the language model can call. The method signature and docstring become the tool description the model reads. Examples here: `create_docx`, `search_web`.
* A [function](https://docs.openwebui.com/features/extensibility/plugin/functions/) extends Open WebUI itself. It is one of three types. A [pipe](https://docs.openwebui.com/features/extensibility/plugin/functions/pipe/) adds a model, a [filter](https://docs.openwebui.com/features/extensibility/plugin/functions/filter) changes the request before it reaches the model (inlet) and the response after it (outlet), and an [action](https://docs.openwebui.com/features/extensibility/plugin/functions/action) adds a button under a message.

Two other concepts show up below. A skill is a Markdown document of instructions that the model loads when a task needs it, instead of carrying it in every request. A tool server is an external MCP or OpenAPI service whose tools Open WebUI offers to the model.

Both tools and functions can declare valves, which are settings an admin edits in the UI and the seeder can pin from git.

The seeded tools are attached to the chat models through `meta.toolIds`, so users get them without switching anything on. The MCP servers are not attached. A user switches one on in the chat when they need it.

## Office files

The most used addition. Gemma 4 can write Markdown, but cantonal staff need Word, Excel, PowerPoint and PDF files in the canton's layout, and often need an existing file changed instead of rewritten.

### Creating files

| Tool | Input | Output |
|---|---|---|
| `create_docx` | Markdown and a title | Word file with the canton's template: numbered headings, table style, footer with page numbers |
| `create_pptx` | Markdown, one `##` heading per slide | PowerPoint deck from the canton's template layouts |
| `create_pdf` | Markdown and a title | PDF, rendered from the Word layout |
| `create_xlsx` | Rows and optional headers | Excel table with filters, frozen header row and sized columns |

The layout comes from the `kdkp_office` package in the [custom image](/apps/bebbi-bot/image.md#office-templates). The file is attached to the reply as a download.

The Excel tool compensates for a habit of the model. Gemma 4 sends numbers as strings in almost every call. The tool turns `"1'250"`, `"1.234,56"` and `"15 %"` into real numbers with a number format, and Swiss and ISO dates into dates. It leaves postcodes, IDs, phone numbers and values with leading zeros as text, because they cannot be told from numbers by their value.

The Word renderer also cleans up what the model sends. Gemma writes arrows and symbols as LaTeX (`$\rightarrow$`) and sometimes puts spaces inside the `**` markers of bold text (`** Frist **`), which Markdown leaves as stars. The renderer turns LaTeX symbols into plain characters (→, ≥, ×) and such markers into bold text. A benchmark (`benchmarks/word_artifacts`) counts what is left in the Word text, so a renderer change can be scored on the same model output before and after.

### Editing files

A user attaches a Word, PowerPoint or Excel file and asks for a change. The model must not rebuild the file from its extracted text, which would lose the layout. The edit tools change only the affected spots and return a copy.

| File | Tools | What the user gets |
|---|---|---|
| Word | `read_docx`, `edit_docx`, `render_docx` | Changes as real tracked changes, with optional Word comments |
| PowerPoint | `read_pptx`, `edit_pptx`, `render_pptx` | Edited text. PowerPoint has no tracked changes, so the model names the changes in its answer |
| Excel | `read_xlsx`, `edit_xlsx` | Edited cell values and formulas, with the results of formulas calculated and reported |

The design borrows from coding agents:

* **Read before edit.** `read_*` returns the file as text with numbered paragraphs and a version. `edit_*` refuses an edit without the current version, so paragraph numbers always refer to the file being edited.
* **Rewrite by paragraph number.** The model sends the new wording of a whole paragraph. The tool compares old and new word by word and changes only what differs, so unchanged words keep their formatting and the model never has to copy text exactly.
* **All or nothing.** If one edit fails, nothing is written and the model gets the failing edits back.
* **Self-check.** For Word, rejecting all tracked changes must give back the original text. Every saved file must reopen and hold the written content.
* **One copy per upload and chat.** The first edit creates the copy, later edits overwrite it. This keeps the S3 bucket from filling up with intermediate versions.
* **Render.** `render_docx` and `render_pptx` return page and slide images that the model can look at, produced with headless LibreOffice.

The tools refuse files they would damage, for example workbooks with charts, pivot tables or macros, because the library that saves them would drop those parts. They also refuse input above fixed size limits, and they wait only a bounded time for a free parsing or LibreOffice slot before they answer "busy". Each tool description lists its limits, and the model reads those descriptions.

### Supporting content

* The filter `office_edit_hint` is a global inlet filter. When a .docx, .pptx or .xlsx is attached and the matching edit tool is active, it adds a short note to the request that only the model sees: file name, available tools, and that a change request means returning the changed file. Without it, Gemma 4 often treated the attachment as a source to quote and answered in the chat. In the benchmark, three scenarios failed in every run before the filter.
* The skills `dokumente-erstellen` and `dokumente-bearbeiten` explain which route to take, which formats suit which purpose and which Python libraries the code interpreter has. The models do not attach them. They see the list of skills and load one when needed. Since Open WebUI 0.12.3 an attached skill goes with its full text into every message, which would cost about 3,000 tokens per turn. In the benchmark, attached and listed-only scored the same, because the tool descriptions and the system prompt carry the same rules.
* Two benchmark suites (`benchmarks/office_edit`, `benchmarks/skills`) replay realistic requests against a running Open WebUI and check the traces and the returned files. Run them after changing a tool, a prompt, the model or Open WebUI. See [Testing Bebbi Bot](/evaluation/bebbi-bot.md).

Every Office tool reports its calls to Prometheus: duration, wait for a slot, and the outcome (`ok`, `refused_limit`, `busy`, `error`, `cancelled`). The metrics feed an error-rate alert, so a broken tool shows up before users report it.

## Web search

`search_web` replaces Open WebUI's built-in web search on the **Web Suche** models, for two reasons.

1. **The user reviews the query.** Before anything leaves the infrastructure, a dialog shows the search query the model wrote. The user can edit it, remove sensitive details, or cancel. An empty query counts as a refusal, and the model is told to answer from its own knowledge. The banner of Bebbi Bot warns that personal data must not be entered when web search is on, and this dialog is the safeguard.
2. **The model reads pages, not snippets.** The tool takes the top three results and scrapes them through Firecrawl (in the same namespace), strips images and link URLs, and cuts each page at 20,000 characters. A cut page is flagged to both the user and the model.

The search itself runs on Serper. Open WebUI's own web search stays off on every model, so this tool is the only route, and the janitor keeps user-built models from switching Open WebUI's search on.

When the model searches twice in one answer, the tool numbers the results of the second search after those of the first, and a page found again keeps its number. Before, each search started at 1, and the `[1]` of a second search opened a page of the first.

## Context usage

`context_usage` is a global filter. It adds a line under each answer with the tokens used and how full the context window is, for example when a long chat approaches the 256k limit of Gemma 4. Window sizes per model are valves of the function. Context compaction summarizes a chat once it passes 160,000 tokens.

## MCP tool servers

Open WebUI connects to MCP servers over streamable HTTP and offers their tools in the chat. Five are seeded from `tool-servers/`. The name and description are what users see when they switch a server on.

| Name in the chat | Server | Run by | Who sees it |
|---|---|---|---|
| OpenCaseLaw | Swiss federal and cantonal law and court decisions | External | Everyone |
| Alva | Topics, services, forms and fees on bs.ch, and waste collection zones by street | External (Liip, the MCP server of BaselCityGPT) | Everyone |
| Statistikportal BS | [Statistik.bs MCP](/mcp/statistik-bs.md): indicators, yearbook tables and publications | DCC | Admins for now |
| OGD Datenportal | [Data.bs.ch MCP](/mcp/data-bs.md): open government data, ODSQL queries, download links | DCC | Admins for now |
| Grosser Rat Geschäfte | [Grosser Rat MCP](/mcp/grosser-rat.md): business items, motions, minutes since 1973 | DCC | Admins for now |

The three DCC servers are seeded without access grants until they leave the test phase.

OpenCaseLaw offers 42 tools. The connection passes 10 of them (`function_name_filter_list`):

* `search_decisions`, `get_decision`, `get_erwaegung`, `get_regeste`, `find_leading_cases`, `cite`
* `search_laws`, `get_law`, `search_legislation`, `get_legislation`

Every search tool comes with its get tool. Left out: the tools that send a draft to the server's own external LLM judge (`attest_response`, `check_claim_support`), generation of mock decisions and exam questions, duplicates, scholarship, commentaries, legislative materials, statistics. Tool definitions went from about 57,000 to 21,000 characters per request.

### Citations from MCP results

Open WebUI only turns the results of its own retrieval tools into citation sources. For MCP results the [custom image](/apps/bebbi-bot/image.md#mcp-citations-instructions-and-retries) adds this:

* **Citation badges.** Each result item with a public URL becomes a source: a Geschäft, decision, article, dataset, indicator or bs.ch page. The model cites it as `[n]` and the chat shows a badge that opens the source. The label comes from the server's `citation_label`, or from rules in the image where a server has none yet.
* **Own instructions.** A server's `instructions` land in every system message. Open Case Law sends 25,794 characters of house rules, including a mandatory Markdown link for every decision. The image replaces the instructions of all five servers with short German texts of about 1,100 to 1,700 characters: which tool for what, cite with `[n]`, `[1]` also for a single source, no number where there is no source.
* **Cleanup.** The global filter `citation_cleanup` removes every `[n]` without a source after an answer: a count in brackets, an internal document number, a list position past the last source. Where the model wrote a source's label in brackets instead of its number, the filter puts the number in.

For MCP results, about 75 to 100 % of answers that have sources cite with `[n]`, depending on the server. An end-to-end suite (115 scenarios over all tools of the four citation servers) checks this before a change goes live.

### Large result sets

A question such as "all motions on climate since 2023" returns hundreds of Grosser Rat items. Read into one context, the model saw a fraction of them and answered from that. The better way is to spread the work over sub-agents, one per year or subtopic. Gemma 4 did not do that by itself: with the rule in the system prompt, in the MCP instructions or in the tool result, it delegated in 0 to 1 of 10 runs.

The global inlet filter `subagent_hint` puts a short "Arbeitsweise" note in front of the user's message when the chat has MCP servers switched on: if the request asks for an overview of many entries or several years, distribute the research with sub-agents. The model decides whether it applies. With the note it delegated in 10 of 10 runs, and simple questions kept their usual tool calls. Only the request to the model changes. The chat stores the message as the user wrote it.

For implementation details and endpoints of the DCC servers, see the [MCP section](/mcp/index.md).

## Built-in tools

Open WebUI ships tools that the model can call without any setup. Our chat models switch these on and describe them in the system prompt, so the model uses them unprompted:

| Built-in tool | Use |
|---|---|
| Time | "Next Friday", deadlines, ages |
| Knowledge | Search attached knowledge bases again, open a file |
| Sub-agents | Hand a self-contained part of the work to a fresh agent with its own context |
| Code interpreter | Numbers, tables and charts in Python instead of mental arithmetic |
| Tasks | A task list the user sees while the model works through it |
| User input | Ask a clarifying question instead of guessing |
| Memory | Facts the user asked the model to remember |
| Skills | Load a skill from the list when a task needs it |

Switched off on our models: Open WebUI's own web search, image generation, notes, chats, files, channels, calendar and automations. Tool search is off for the whole instance.

The code interpreter runs in the browser, and the [image](/apps/bebbi-bot/image.md#python-packages-in-the-browser) bundles its libraries. It is on by default in every chat, because Open WebUI only offers it while the chat's code interpreter switch is on. The model's Python runs in the user's browser (Pyodide), also in the web search models.

## Prompts

Three slash commands are available to everyone:

| Command | Result |
|---|---|
| `/einfach` | Rewrites a text in plain language, about CEFR level B1 |
| `/email` | Drafts a polite email in German |
| `/checkliste` | Turns a process description into a checklist |

## How to add something

1. Create the file in the matching folder of `seeder/content/`. The `*.disabled` examples show the format.
2. For a tool, add its id to `meta.toolIds` of the models that should use it. The id is the file name in lowercase with underscores.
3. Add unit tests under `tests/seeder/content/`. The test helper loads a tool the way Open WebUI does.
4. Run `mise run ci` and merge to `main`. Renovate then proposes the new seeder image in the k8s repository. See [Rolling out a change](/apps/bebbi-bot/seeder-janitor.md#rolling-out-a-change).

To retire something, delete its file and list it in `seeder/content/removed.json`.

Python plugins run inside Open WebUI with full access to its internals, so only admins can create them. Some of our tools import Open WebUI modules directly, for example to store files. After an Open WebUI upgrade, check those imports against the upgrade checklist. A renamed import fails when the tool runs, not when it loads, and the model then reports that the file could not be opened.
