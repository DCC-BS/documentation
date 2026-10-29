# Testing Bebbi Bot

[Bebbi Bot](/apps/bebbi-bot/index.md) is our chat assistant, built on Open WebUI. A new model, a new Open WebUI version or a changed tool can break it in ways a general test never shows: a file that comes back without its table, a citation that opens the wrong law, an answer that slides into Chinese in the middle of a German word. So Bebbi Bot has its own test suites. They belong to round 3 (tests in our apps) and round 4 (load tests) of [How we test](/evaluation/how-we-test).

The suites live in the `kdkp-open-web-ui` repository of IT BS, which isn't public. This page describes what each one checks and which decisions came out of it. Unlike the model evaluation, these suites run on public or made-up material: Basel-Stadt and federal laws, synthetic administrative documents, public open data. The [Bebbi Bot pages](/apps/bebbi-bot/knowledge.md#measurements) show some of the numbers.

## Where the suites live

| Folder | Kind | Needs |
|---|---|---|
| `tests/` (without `e2e/`) | Unit tests | Nothing. They run on every change |
| `tests/e2e/` | End-to-end suites in a real browser | Our image and a model |
| `benchmarks/` | Measurements of quality or cost | A model, Open WebUI or the built image, depending on the suite |

The end-to-end suites and most benchmarks run on a local copy of the production stack: Gemma 4 31B and the Qwen3 embedding on vLLM, on a workstation with two RTX 4090 cards ([deep-research-evaluation](https://github.com/DCC-BS/deep-research-evaluation)). It uses a different compression of the model than production, so we compare settings with each other, not absolute numbers with production.

Model choices vary between runs. Every suite runs each case several times, usually three, and reports how often it passed.

## Answers and files

### Office files

`benchmarks/office_edit` has fifteen requests as staff would make them, five each for Word, PowerPoint and Excel, each on an uploaded file. Fix three spelling mistakes in a leaflet. Change a deadline from 10 to 30 days. Rename an office on every slide without producing "Basel-Stadt Basel-Stadt". Find the wrong SUM range in a budget.

The check uses the file that comes back, not what the model said. For Word: the changes are tracked, rejecting all of them gives back the original, the footer is untouched. For PowerPoint: same slide count, other slides unchanged. For Excel: the formulas calculate to the right numbers.

`benchmarks/skills` has 128 scenarios for the skills system and the Office tools: does the model load the right skill and leave the others closed, does a fact at character 36,000 of a long skill get found, do 20 different Excel requests produce cells that are numbers and not text. A script that plays a sloppy model checks that the scoring itself catches wrong paths.

`benchmarks/word_artifacts` counts LaTeX and stray `**` markers left in generated Word files, so a renderer change can be scored on the same model output before and after.

What came out: a filter that tells the model when an attached file is meant to be edited (three scenarios failed in every run before it), and the decision not to attach skills to every message. Attached and listed-only scored the same, and listing saves about 3,000 tokens per turn.

### Citations

`tests/e2e/mcp_citations` asks Bebbi Bot 115 questions over every tool of the MCP servers for Open Case Law, the Grosser Rat, the Statistikportal and data.bs.ch, in a real browser. It checks that the needed tools are called, that answers with sources cite with `[n]`, and that every number opens the right source.

`tests/e2e/rag_citations` does the same for knowledge bases, attached files, web search and sub-agents. The corpus is nine Basel-Stadt staff and data protection laws, picked because neighbouring laws use similar words. Each of the 30 questions names the exact text that holds each fact, and a fact counts as right only when its `[n]` opens a source with that text. The same folder measures retrieval recall without the model, with the real queries Gemma wrote.

What came out: one citation badge per passage instead of per file, sources that survive sub-agents, a German template for search queries, smaller chunks with more of them per query, and the reranker with its prompt template. For questions on a knowledge base attached in the chat, recall on the law corpus went from 61 % to 100 %. [Knowledge bases and citations](/apps/bebbi-bot/knowledge.md) has the details.

### Tables in documents

`benchmarks/rag_chunking` splits real Docling output of synthetic documents with tables, using Open WebUI's own code, and asks 31 questions plus 3 that the corpus cannot answer. It measures whether the returned chunks hold the row, the value and the column header, how many chunks start with table rows but no header, and how much unrelated text comes back.

## Model behaviour

These suites look at the model itself, through vLLM, without Open WebUI.

### Endless loops

`benchmarks/repetition` measures how often Gemma 4 falls into an endless loop (` la la la` until the token limit) and whether vLLM's repetition detection stops it without cutting output the user asked for. The quality cases are the hard part: an empty Markdown table with 220 rows, a Python list of 120 zeros, an Excel file with 80 empty rows, a copied 24-column table.

A strict setting cut legitimate tables at about 48 rows. The setting we use stops only a run of the same one or two tokens repeated 500 times. It cut none of the quality cases in about 100 runs and stopped the loops it was built for. It can't stop a loop of whole sentences. For those only the output limit of 32,768 tokens remains.

### Foreign characters

Users reported single foreign characters in German sentences: «Verwaltungsmوظitende», «kontinuier적인». `benchmarks/foreign_script` measures this in two ways. A sampled run sends hundreds of chats and counts answers with a foreign script, about 1 in 250, too rare to compare settings. A teacher-forced run scores a fixed set of German answers under each configuration and adds up the probability of drawing a foreign token at every position. That number repeats within a few percent, so settings can be compared.

What came out: the model does this by itself, and the Hugging Face reference implementation agrees with vLLM. 4-bit compression makes it about 2.5 times more likely, a longer system prompt about 1.5 times. The 8-bit version on uat is as good as the uncompressed model. No sampling setting removes it. This feeds into the choice of compression in the [selection standard](/evaluation/selection-standard#language-models).

## Load and cost

### What our additions cost

`benchmarks/resources` measures every tool and hook we add to Open WebUI, inside the built image with the pod's CPU and memory limits: wall time, CPU time, peak memory, and how long it blocks the event loop that serves every user of the pod. Each component runs with realistic input, with the worst input a model or an upload can produce, and at 1, 4 and 8 parallel calls. A linearity check runs the worst input at 100 kB and at 1 MB. The time should grow about tenfold, and a component that grows much faster fails.

Each component has a budget file. The tests fail when a change makes a component slower, larger or blocking beyond its budget, or when it lacks a required limit such as an input cap or a timeout. A capacity model turns the measurements and the pod sizes into the number of parallel calls a pod can take.

### Queueing at the model

`benchmarks/vllm_queueing` reproduces a uat symptom: minutes before the first token, while the GPU memory was far from full. A few huge prompts (40,000 to 126,000 tokens) arrive among many short chats. The benchmark measures time to first token per request class and compares vLLM settings with the same arrival plan. Limiting how much of a long prompt vLLM processes per step cut the wait for short chats from 13 to 18 seconds to 3 to 5 seconds, and made long prompts 30 to 60 % slower.

`benchmarks/embedding_queue` measures how long a user's search waits while knowledge base files are being embedded. With Open WebUI's default (all batches of a file at once) a search waited up to 17 seconds behind six files. With at most two requests in flight per file, under 4 seconds, at the same total time for the upload.

## When we run what

| Change | Suites |
|---|---|
| Any change in the repository | Unit tests |
| Image or seeder change | Image end-to-end check in CI: every hook installed, seeding, janitor |
| Open WebUI upgrade | All of the above, plus Office, skills and both citation suites |
| New chat model or new compression | Office, skills, citations, repetition, foreign characters, vLLM queueing |
| Office tool or skill change | Office, skills, Word artifacts, resource budgets |
| Retrieval setting or embedding model | RAG citations with recall, table chunking, embedding queue |

An Open WebUI upgrade also gets a written record, one per version, with every upstream change that touches our code and the evidence that each was checked. See [Upgrading Open WebUI](/apps/bebbi-bot/repository.md#upgrading-open-webui).

## What these suites can't show you

- The local stack runs a different compression of the model than production, on other cards. Absolute numbers don't carry over.
- The corpora are small: nine laws, 44 federal documents, a handful of synthetic Office files. They show the direction of a change, not how well Bebbi Bot answers across all the canton's documents.
- The MCP suites depend on the live servers. On days when a server showed a maintenance page, those runs could not take place.
- Load at peak is still partly estimated. The tool metrics that would measure it in production are new.
