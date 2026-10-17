---
outline: deep
editLink: true
---

# Custom image

Bebbi Bot runs `ghcr.io/fd-itbs/open-webui:<version>-slim`. The `kdkp-open-web-ui` repository builds it on top of upstream's slim image (`ghcr.io/open-webui/open-webui:<version>-slim`) by manual dispatch of a GitHub workflow with the release tag, for example `v0.12.3`. The same run also builds the [seeder image](/apps/bebbi-bot/seeder-janitor.md).

We add files and hooks, and apply one build-time patch. A Python hook runs when an Open WebUI module is imported and changes behavior without editing that module. The patch fails the build when upstream changed the code it targets. That keeps upgrades checkable: a failing build points at the exact thing that moved.

## Slim base

The standard Open WebUI image is about 4.6 GB, mostly torch and bundled embedding, reranking and Whisper models. Our pods mount a per-pod volume over the data directory, which hides the baked-in models, so each pod would download them again. The slim image is about 830 MB and downloads nothing.

We use none of what the standard image adds. Embeddings, reranking, document extraction and web loading all run as external services. The deployment must therefore provide what slim refuses to do locally:

| Need | How we provide it |
|---|---|
| Database and vector store | PostgreSQL, `VECTOR_DB=pgvector` |
| Embeddings | External OpenAI-compatible endpoint on the KDKP |
| Reranking | External reranker |
| PDF and Office text extraction | Docling |
| Speech to text | External Whisper endpoint |
| Web loading | Firecrawl |
| File storage | S3 |

## Root certificates

The IT BS root certificates are installed in the image, so Open WebUI trusts the internal endpoints (`*.bs.ch`, the S3 service and the KDKP gateway).

## Python packages in the browser

Open WebUI runs the code interpreter in the browser, with Pyodide. The slim image ships none of Pyodide's wheel files and would load every package from a public CDN at runtime, which the pods cannot reach.

The image bundles the wheels itself, about 61 packages and 48 MiB. A manifest (`pyodide/pyodide-packages.json`) lists each package with its version, hash and tier:

* Tier 1 packages load at startup: `openpyxl`, `pypdf`, `xlsxwriter`, `tabulate`, `xlrd` and their dependencies. A model can `import openpyxl` without installing anything.
* Tier 2 packages ship as files and load on demand: `python-docx`, `python-pptx`, `fpdf2`, `seaborn` and others.

A build step also rewrites the system prompt for the code interpreter. Upstream's prompt tells the model it cannot install packages and does not say which ones exist. The generated prompt lists the available libraries, so the model uses them directly.

## Office templates

The package `kdkp_office` turns Markdown into Word, PowerPoint and PDF files in the layout of the Canton of Basel-Stadt. It uses the canton's Word template (logo, numbered headings, table style, page footer) and PowerPoint template (title, content and section layouts). PDF output converts the Word file with headless LibreOffice, which the image also installs for rendering page previews and recalculating Excel formulas.

The [create and edit tools](/apps/bebbi-bot/tools.md#office-files) import this package.

## Login: nested Entra groups

Microsoft's token for a user does not list nested group memberships when the tenant allows delegated permissions only. A hook, installed through Python's `sitecustomize` mechanism, intercepts the login callback. It reads the groups assigned to Open WebUI's enterprise application, asks Microsoft Graph which of them the user belongs to (including through nesting), and hands that list to Open WebUI's normal group handling.

Only groups assigned to the enterprise application are synced, and no extra Graph permissions or admin consent are needed. Assignments are cached for five minutes, so changes in the Azure portal show up without a restart. The feature is switched on with `DCC_ENABLE_ENTRA_TRANSITIVE_GROUP_SYNC`.

## Other changes

* **Model picker for knowledge admins.** Users who may create models in the workspace could not choose the hidden base models, because the dropdown listed them for global admins only. A build-time patch of the compiled frontend lifts that restriction. The chat model picker is unaffected, so normal users still do not see the base models.
* **Async Docling loader.** Open WebUI sends a document to Docling in one HTTP request and waits. The Airlock WAF and the Tyk gateway between them cut connections after 300 seconds, so long conversions failed with a 504. A hook swaps the loader for Docling's task API: submit the file, then poll for the result. Every request is short. The total wait is capped at 30 minutes by default.
* **Delivery route for deep research.** One extra API route that lets the research service write a finished report into a user's chat at night. See [Deep research](/apps/bebbi-bot/deep-research.md#delivering-the-report).
* **Proxy settings.** The image sets the corporate proxy and the list of hosts that bypass it.

## Upgrading Open WebUI

Every upgrade follows the same workflow. Each change above has an upstream checklist in the repository's README, and the repository keeps one dossier per version in `docs/upgrades/`. In short: build the new image, run the unit tests and the end-to-end check of the seeder against a local Open WebUI, then bump the image tag in the k8s repository.
