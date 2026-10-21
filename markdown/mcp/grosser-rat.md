---
outline: deep
editLink: true
---

# Grosser Rat MCP

Searches the parliament of Basel-Stadt: every business item (Geschäft), motion (Vorstoss), report of the Regierungsrat (Ratschlag) and transcript (Protokoll) of the [Grosser Rat](https://grosserrat.bs.ch) since 1973.

| | |
|---|---|
| Endpoint | `https://mcp-grosserrat.statistik.bs.ch/mcp` |
| Corpus status | [/health](https://mcp-grosserrat.statistik.bs.ch/health) |
| Code | `grossrat-bs-mcp`, not public yet |
| Image | `ghcr.io/dcc-bs/grossrat-bs-mcp` |
| Data source | Open data of the Grosser Rat, converted to text and indexed |

::: info Source not public yet
The repository is still private. This page describes what the running server reports about itself: its MCP `instructions`, tool list and `/health` (version 0.1.0, October 2026). Check the live server for the current state.
:::

## The corpus

| | |
|---|---|
| Documents | about 54,000, about 795 million characters |
| Business items | about 21,200 |
| Period | 22 March 1973 to today |
| Language | German |
| Most common document types | GR Beschluss, Schreiben des RR, Beschluss, texts of Interpellationen, Schriftliche Anfragen, Anzüge and Motionen, Ratschläge |

`get_corpus_stats` returns the current numbers and `list_facets` the document types, parties, business types and statuses in their exact spelling.

The databases sit inside the image, about 3.3 GB compressed and 10 GB unpacked. The container needs no volume and no model server, because the embedding model runs on the CPU. The image is built and pushed from the machine that holds the data, not by CI, so a new image version also brings new data.

## Two ways in: search and graph

**Search** answers "where does it say that?". It is hybrid. A BM25 full-text index and passage vectors each find candidates, and the two rankings are fused.

* BM25 matches words. Longer words are searched as prefixes, so "Velo" finds "Veloweg" and "Befragung" finds "Jugendbefragung".
* The vectors match meaning, so "Wechseljahre" finds "Menopause". About 770,000 passages are embedded with [granite-embedding-311m-multilingual-r2](https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2) (ONNX, HNSW index), covering 99.8 % of the documents.
* Each hit says how it was found (`found_by`). If `snippet_matched` is false, the snippet does not contain the search words, because the hit matched by meaning.

**The graph** answers "who?" and "which committees?". It links persons, committees (Gremien), parties, organisations, topics, sessions and business items. Every edge names its source: `ogd` for the open data, `llm` with the verbatim quote for what a model extracted, `classifier` for estimated topics. A member who submitted 1,386 business items is fully listed by `explore_entity` and barely found by text search.

## Tools

| Tool | What it does |
|---|---|
| `search_documents` | Passages from all documents, each with a citation link. Filters: `partei`, `urheber`, `geschaeftsart`, `dokumentart`, `status`, `since`, `until`. At most 50 hits per call. `mode='lexical'` lists every word match instead of the best-ranked candidates |
| `find_geschaefte` | Complete list of business items for a research question. Takes 3 to 10 phrasings, reads every hit to the end and returns each item once. `group_by` (`urheber`, `partei`, `geschaeftsart`, `status`, `jahr`) counts instead of listing |
| `get_geschaeft` | Full dossier of a business item by signature, for example `17.5209`: master data, all documents, assignments, topic and the path through the council |
| `get_document` | Text of a document by `dok_laufnr`, one page or windows of 20,000 characters |
| `cite_document` | The PDF link that opens at a given page and phrase |
| `search_entities` | Finds graph entries by name and returns their `node_id`. Several names per call |
| `explore_entity` | Everything attached to one or more entries, grouped by relation (for example `AUTHORED_BY`, `MEMBER_OF`) and paged per relation |
| `connect_entities` | Shortest chain between two entries, up to `max_tiefe` steps |
| `list_facets` | Allowed filter values with counts |
| `get_corpus_stats` | Size and period of the corpus |
| `search`, `fetch` | The search and fetch pair that ChatGPT connectors expect. Same data as `search_documents` and `get_document` |

The server also offers the prompt `recherche` ("Vollständige Recherche"). Given a question, it walks the model through a complete survey: several phrasings, every list read to the end, results checked.

## Using it well

The server's instructions tell the model these rules. They matter for anyone writing prompts or presets against it.

* **Lists need `find_geschaefte`.** "Which open motions concern X" is not answered by the first page of `search_documents`. Lower-ranked items and items worded differently get lost.
* **A list is complete only when `next_offset` is `null`.**
* **Counting goes through `group_by`.** "Who submitted most" or "how did it develop over the years" needs no listing.
* **Transcripts need a filter.** A full transcript (Vollprotokoll) has about 600,000 characters, so BM25 ranks it below one-page motions. To find what was said in the council, search with `dokumentart='Vollprotokoll'`.
* **Copy filter values from `list_facets`.** Guessed spellings match nothing.
* **Parties of former members.** The open data often lacks a party for them. `explore_entity` with `predicate='MEMBER_OF'` shows their parliamentary groups with dates. A group can unite several parties, for example "CVP/EVP", and the answer should say so.
* **Cite the signature and the URL.** Every hit carries `dok_laufnr` (internal), `signatur_ges` (the council's business number, for example "17.5209") and a `citation_url` that opens the official PDF at the right page. Cite the last two.

## Endpoints

| Path | Answer |
|---|---|
| `/mcp` | MCP streamable HTTP |
| `/healthz` | `{"status":"ok"}` for the container healthcheck |
| `/health` | Version, number of documents, search mode and vector coverage |

Opening the index and loading the embedding model takes time after a start. The compose healthcheck therefore allows 60 seconds before it counts failures.

## Open issues

The deep research evaluation of October 2026 produced a list of requested changes, kept in `docs/grossrat-mcp-changes.md` of [bebbi-deep-research](https://github.com/DCC-BS/bebbi-deep-research). The main ones:

* No tool returns legislature periods, so "in der laufenden Legislatur" needs the dates from the user.
* `find_geschaefte` returns 100 items by default, over 8,000 characters. Clients should send a `limit`.
* `search_documents` hits had empty `urheber` and `partei`.

The citation tests of Bebbi Bot added more, tracked in [Feedback#367](https://github.com/DCC-BS/Feedback/issues/367):

* `find_geschaefte` items have no `url`; clients build `https://grosserrat.bs.ch/?gnr=<signatur>` themselves. Every citable item should carry `url` and a `citation_label` such as `GR 23.5544 · Motion …`.
* Persons, committees and counts (`search_entities`, `explore_entity`, `group_by`) have no public URL, so answers based on them have no source.
* The instructions are 3,520 characters and ask to "cite the signature and this URL". Bebbi Bot replaces them with a shorter text without a citation rule. Grosser Rat answers with `[n]` markers went from 36 % to 66–84 % of the answers that had sources.
