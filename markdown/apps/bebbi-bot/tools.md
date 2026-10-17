---
outline: deep
editLink: true
---

# Tools and workspace content

This page lists what the [seeder](/apps/bebbi-bot/seeder-janitor.md) puts into Bebbi Bot on top of stock Open WebUI. The source of every item is a file under `seeder/content/` in the `kdkp-open-web-ui` repository.

## Tools, functions and skills in Open WebUI

Open WebUI separates two kinds of Python plugin. The [official overview](https://docs.openwebui.com/features/extensibility/plugin/) has the details.

* A [tool](https://docs.openwebui.com/features/extensibility/plugin/tools/) is a Python class whose methods the language model can call. The method signature and docstring become the tool description the model reads. Examples here: `create_docx`, `search_web`.
* A [function](https://docs.openwebui.com/features/extensibility/plugin/functions/) extends Open WebUI itself. It is one of three types. A [pipe](https://docs.openwebui.com/features/extensibility/plugin/functions/pipe/) adds a model, a [filter](https://docs.openwebui.com/features/extensibility/plugin/functions/filter) changes the request before it reaches the model and the response after it, and an [action](https://docs.openwebui.com/features/extensibility/plugin/functions/action) adds a button under a message.

Two other concepts show up below. A skill is a Markdown document of instructions that the model loads when a task needs it, instead of carrying it in every request. A tool server is an external MCP or OpenAPI service whose tools Open WebUI offers to the model.

Both tools and functions can declare valves, which are settings an admin edits in the UI and the seeder can pin from git.

Most seeded tools are attached to the Bebbi Bot models through `meta.toolIds`, so users get them without switching anything on.

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

The tools refuse files they would damage, for example workbooks with charts, pivot tables or macros, because the library that saves them would drop those parts. Each tool description lists its limits, and the model reads those descriptions.

### Supporting content

* The filter `office_edit_hint` is a global inlet filter. When a .docx, .pptx or .xlsx is attached and the matching edit tool is active, it adds a short note to the request that only the model sees: file name, available tools, and that a change request means returning the changed file. Without it, Gemma 4 often treated the attachment as a source to quote and answered in the chat. In the benchmark, three scenarios failed in every run before the filter.
* The skills `dokumente-erstellen` and `dokumente-bearbeiten` explain which route to take, which formats suit which purpose and which Python libraries the code interpreter has. The models do not preload them. They see the list of skills and load one when needed. Attaching both to every message would cost about 3000 tokens per turn.
* Two benchmark suites in the repository (`benchmarks/skills`, `benchmarks/office_edit`) replay realistic requests against a running Open WebUI and check the traces and returned files. Run them after changing a tool, a prompt, the model or Open WebUI.

## Web search

`search_web` replaces Open WebUI's built-in web search on the **Web Suche** models, for two reasons.

1. **The user reviews the query.** Before anything leaves the infrastructure, a dialog shows the search query the model wrote. The user can edit it, remove sensitive details, or cancel. An empty query counts as a refusal, and the model is told to answer from its own knowledge. The banner of Bebbi Bot warns that personal data must not be entered when web search is on, and this dialog is the safeguard.
2. **The model reads pages, not snippets.** The tool takes the top three results and scrapes them through Firecrawl (in the same namespace), strips images and link URLs, and cuts each page at 20,000 characters. A cut page is flagged to both the user and the model.

The search itself runs on Serper. The web search toggle of Open WebUI is off on all models, so this tool is the only route, and the janitor keeps user-built models from switching the toggle on.

## Context usage

`context_usage` is a global filter. It adds a line under each answer with the tokens used and how full the context window is, for example when a long chat approaches the 256k limit of Gemma 4. Window sizes per model are valves of the function.

## OpenCaseLaw

The file `tool-servers/opencaselaw.json` connects the MCP server `mcp.opencaselaw.ch`, a directory of Swiss legislation and court decisions. Its tools are offered to all users. The [deep research agent](/apps/bebbi-bot/deep-research.md) uses the same server for its legal preset.

## Built-in tools

Open WebUI 0.12 ships tools that the model can call without any setup: time and date, memory, task lists, sub-agents, the code interpreter and `ask_user`. Our models switch these on selectively and describe them in the system prompt, so the model uses them unprompted. Examples: it asks a clarifying question through `ask_user` instead of guessing, it runs numeric work in the code interpreter instead of doing arithmetic in its head, and it calls the date tool for "next Friday".

Switched off on our models: the built-in web search and image generation, notes, channels, calendar and automations. The code interpreter runs in the browser, and the [image](/apps/bebbi-bot/image.md#python-packages-in-the-browser) bundles its libraries.

## Prompts

Three slash commands are available to everyone:

| Command | Result |
|---|---|
| `/einfach` | Rewrites a text in plain language, about CEFR level B1 |
| `/email` | Drafts a polite email in German |
| `/checkliste` | Turns a process description into a checklist |

## How to add something

1. Create the file in the matching folder of `seeder/content/` of the `kdkp-open-web-ui` repository. The `*.disabled` examples show the format.
2. For a tool, add its id to `meta.toolIds` of the models that should use it. The id is the file name in lowercase with underscores.
3. Run `mise run ci`, merge to `main`, bump `seeder.image.tag` in the k8s repository. See [Rolling out a change](/apps/bebbi-bot/seeder-janitor.md#rolling-out-a-change).

Python plugins run inside Open WebUI with full access to its internals, so only admins can create them. Some of our tools import Open WebUI modules directly, for example to store files. After an Open WebUI upgrade, check those imports against the list in the repository README. A renamed import fails when the tool runs, not when it loads, and the model then reports that the file could not be opened.
