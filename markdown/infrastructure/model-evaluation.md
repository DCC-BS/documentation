---
outline: deep
editLink: true
---

# How we evaluate AI models

This page describes how the DCC checks a model before it goes into production, and how we check again after a change. It adds the method to the short list of criteria on [Models & APIs](/infrastructure/models.md#how-we-select-models). Every number comes from DCC repositories and evaluation reports and is dated. The method differs by what is being tested, so each kind of test below has its own section.


## Process

The steps below are how the individual tests fit together. The sources do not define one fixed pipeline.

1. **Screen.** Check the candidate against the criteria on the models page: fit on the KDKP hardware, modalities, token efficiency, context size, speed, benchmark scores, censorship and bias. Public leaderboards (Artificial Analysis, OpenRouter) are inputs, not the decision.
2. **Load test on our hardware.** Measure throughput and latency of the real deployment (below).
3. **Quality on our tasks.** Run the model through the applications that will use it, with checks that look at the result (below).
4. **Gate for changed weights.** A quantised checkpoint is only published when it scores the same as its source model (below).
5. **Roll out through the clusters** (dev, test, uat, prod).

Example of a failed step: Qwen 3.5 27B is switched off because it generates too many reasoning tokens (models page).

## Constraints

Three constraints apply to every candidate.

- **On-prem only.** Production calls only models hosted on the KDKP, through OpenAI-compatible endpoints. That includes embeddings and rerankers. Cloud models appear only as judges in evaluation runs, on public benchmark data and on reports we generated, never on internal data.
- **Language.** German with Swiss conventions (no ß). Searches in German, English, French and Italian.
- **Cluster rules.** Non-root, no RWX storage, emptyDir at most 250Mi, traffic through the proxy.

The requirements for the deep research agent add more, and they apply to it alone:

- Open-weight models of about 30B parameters must call tools and return structured output reliably. Target: at least 90 percent of runs end with a report.
- Per-role models with a thinking switch. The main model thinks for planning, research and writing. Routing and summaries run without thinking or on the small Qwen 3.5 4B.
- A standard research run should use 200k to 1M tokens (requirement E1, a target and not a measurement). Measured: about 60k tokens for the focus engine and 133k to 169k for the research pipeline.
- Long runs wait for the night window (20:00 to 05:00) because GPU capacity during office hours is short.

## Load tests

The repository `vllm-benchmark` drives [guidellm](https://github.com/vllm-project/guidellm) against an endpoint. Eight scenarios:

| Workload | Size | Profiles |
|---|---|---|
| chat | about 512 tokens in, 256 out | rate sweep (10 rates), concurrent streams 10, 50, 100, 300 |
| rag | about 4096 in, 512 out | same |
| translation | about 1024 in, 1024 out | same |
| vision | 896x896 JPEG, about 128 in, 256 out | same |

A run stops early when more than 5 percent of requests fail after 30 requests. Warmup (10 percent) and cooldown (5 percent) are left out of the numbers. The script waits for the health route between scenarios, so one overloaded stage does not ruin the next.

## Quality on our own tasks

These tests come from the deep research evaluation (7 to 13 October 2026). Public benchmarks say little about German administration, so we use two kinds of test.

**Public benchmark, for comparison.** DeepResearch Bench, 20 of its 50 English tasks, picked for closeness to administrative work. Two judges: RACE scores report quality against a reference report (50 means on par), FACT checks whether the cited sources support the claims. Differences under about 1.5 RACE points count as noise. Without any search, Gemma 4 31B scores 43.9 on RACE. This is the floor that any research setup must beat.

**German administrative set, for the real question.** 13 tasks (19 in version 0.3) on law, Grosser Rat, web content, strategies and statistics. Every report must follow one contract: structure, Swiss spelling, sources with URL, SG and SR numbers, Geschäftsnummern, Stand. A judge model scores each rubric criterion from 0 to 3. Results from October 2026: 66.6 percent for the research agent with the focus engine, 58.9 percent for a plain agent loop with the same tools.


**Noise.** One run of a language model varies. With 13 tasks and one run each, differences of about 4 points are noise. The 66.6 percent above averages three repeats.

**Judges.** The benchmark judges are cloud models used through OpenRouter on public data. The judge spend of the main evaluation phase (7 to 9 October) was 41.61 US dollars. The later tuning runs v4 (2.42 US dollars) and v5 (2.56 US dollars) came on top. A cloud judge fits the on-prem rule only because it never sees internal data.


### Pass thresholds (proposed protocol)

The protocol document of the deep research evaluation proposes these gates. They are targets for that setup, not guarantees.

| Check | Gate |
|---|---|
| RACE, 30 English tasks | at least 43.0 and at least 3 points above Gemma without search |
| FACT citation accuracy | at least 60 percent, and at least 20 supported citations per task |
| Tokens per standard run | median between 200k and 1M, p90 at most 1.5M |
| Runtime | quick at most 5 min, standard at most 20 min, deep at most 120 min |
| Completion rate | at least 90 percent of runs end with a report |


## Quality inside Open WebUI

After a model change or an Open WebUI upgrade we replay realistic requests against a running Open WebUI and check the end state, not the wording. The repository `kdkp-open-web-ui` has two suites:

- `benchmarks/skills`: 60 scenarios, three runs each, against Gemma 4 31B. They test skill discovery, tool search, authoring of skills and document creation. A scenario passes when the last tool call succeeded and the returned file has the right content. The run of 2026-10-16 gave 176 of 180.
- `benchmarks/office_edit`: 15 scenarios for editing Word, PowerPoint and Excel files.

The skills suite also runs with a scripted stand-in for the model, in an "ideal", a "lazy" and a "sloppy" mode. These runs prove that the checks reject wrong paths and accept recovered ones. They say nothing about the model.

Measured settings decide configuration. Example: Tool Search saved 24,000 characters per turn, but Gemma guessed parameter names and failed the first call in every task (first call right: 6 of 6 with search off, 0 of 6 on). We kept it off.

## Quantised checkpoints

For models we quantise ourselves, a gate decides whether the checkpoint is published (repository `model-quantization`). It runs the quantised and the original model on the same machine, on vLLM, on an MTEB task (retrieval nDCG@10 for embeddings, reranking MAP for rerankers) in several languages. The verdict is per language, with a tolerance of 0.01. A checkpoint that fails is not uploaded. Published leaderboard numbers are only a sanity check.

## Where to find the data

- Load tests: [vllm-benchmark](https://github.com/DCC-BS/vllm-benchmark).
- Deep research engine, presets and a summary of the evaluation: [bebbi-deep-research](https://github.com/DCC-BS/bebbi-deep-research), `docs/evaluation.md`.
- The full evaluation report and raw results are in the private repository `deep-research-evaluation`. The skills and office benchmarks are in `kdkp-open-web-ui` (internal, FD-ITBS). The quantisation gate is in the private repository `model-quantization`.
