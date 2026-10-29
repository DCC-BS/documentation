---
outline: deep
editLink: true
---

# Repository and releases

Everything we add to Open WebUI lives in one repository, `FD-ITBS/kdkp-open-web-ui`. It builds two images and holds the tests and benchmarks that check them. The Kubernetes side lives in `kdkp-kiw-k8s-config` (see [Deployment](/apps/bebbi-bot/index.md#deployment)).

| Image | Built from | Runs as |
|---|---|---|
| `ghcr.io/fd-itbs/open-webui:<version>-slim-…` | `image/`, `governance_ui/` | The Open WebUI pods |
| `ghcr.io/fd-itbs/open-webui-seeder:…` | `seeder/` | The seeder Job, the janitor CronJob and the reindex CronJob |

## Folder structure

The repository is split by where the code ends up. A folder maps to one image, or to tests and tools that never ship.

```text
kdkp-open-web-ui/
├── image/                     Open WebUI image
│   ├── Dockerfile             built with the repository root as context
│   ├── build/                 build time only: Pyodide wheel overlay and code interpreter prompt
│   ├── static/kdkp/           icons served under /static (the WAF blocks inline data URIs)
│   └── site-packages/         copied as is into the image's site-packages
│       ├── sitecustomize.py   installs every hook from one table
│       ├── *.py               one module per hook (MCP citations, RAG citations, Docling loader, ...)
│       ├── kdkp_office/       Markdown to Word, PowerPoint, PDF in the canton's layout
│       ├── kdkp_metrics.py    tool call metrics
│       ├── dcc_mcp_instructions/  our own instruction text per MCP server
│       └── bebbi_bot_governance/  API and policy of the governance page
├── governance_ui/             governance page (Nuxt), compiled into the image
├── seeder/                    seeder image
│   ├── seed.py, janitor.py, reindex.py   entry points
│   ├── kdkp_seeder/           their code: API client, seeding, reindex, janitor/ (one module per step)
│   └── content/               everything that gets seeded, one file per resource
├── assets/                    root certificates and icons, used by both images
├── tests/                     unit tests mirroring image/, seeder/, benchmarks/ and scripts/
│   └── e2e/                   end-to-end suites against a running stack
├── benchmarks/                measurements against a real model or under load
├── scripts/                   sync and check of the deep research pipe
└── docs/                      one page per hook or feature, upgrade dossiers in docs/upgrades/
```

Some details that matter when you work in it:

* **`image/site-packages/` mirrors the image.** The folder has the same layout as the image's `site-packages`, so a hook imports another hook by the same name in the tests and in production. `pyproject.toml` puts the folder on the test path.
* **Tests mirror the code.** `tests/image/` tests the hooks, `tests/seeder/` the seeder and janitor (with `content/` for the seeded tools and functions), `tests/benchmarks/` the scoring code of the benchmarks. The tests stub Open WebUI modules, so `uv run pytest` runs without an Open WebUI install.
* **The seeder image needs two folders from outside `seeder/`.** The Docker build gets `assets/` and `image/site-packages/bebbi_bot_governance/` as extra build contexts. The janitor shares the governance policy (deadlines, intervals) with the governance page, so both read it from one module.
* **Seeded plugins only import inside Open WebUI.** Type checking with ty covers the shipped code in `image/` and `seeder/kdkp_seeder/`, not the plugins under `seeder/content/`.

### Tests and benchmarks

| Folder | Runs against | Purpose |
|---|---|---|
| `tests/image/`, `tests/seeder/`, `tests/scripts/`, `tests/benchmarks/` | Nothing, stubs only | Unit tests, part of every CI run |
| `tests/e2e/seeder/` | Our image with Postgres, S3 and a model stub | Seeds twice, checks every live resource against the files, runs the janitor, checks that every hook installed |
| `tests/e2e/mcp_citations/` | Our image, the MCP servers, Gemma | Citation badges for MCP results, in a real browser |
| `tests/e2e/rag_citations/` | Our image, Gemma, embedding, reranker, a fake web | Citations for knowledge bases, files, web search and sub-agents, plus retrieval recall |
| `benchmarks/office_edit/`, `benchmarks/skills/` | A running Open WebUI with Gemma | Office tools and skills, scored on the files that come back |
| `benchmarks/repetition/`, `benchmarks/foreign_script/` | A vLLM server | Model behaviour: endless loops, foreign characters in German text |
| `benchmarks/rag_chunking/`, `benchmarks/word_artifacts/` | Open WebUI code, the embedding model | Chunking of tables, leftover Markdown in Word files |
| `benchmarks/resources/`, `benchmarks/embedding_queue/`, `benchmarks/vllm_queueing/` | The image, the embedding server, vLLM | Cost per tool call, queueing under load |

[Testing Bebbi Bot](/evaluation/bebbi-bot.md) in the evaluation section explains what each suite checks and which decisions came out of it.

## Local development

Tooling follows the [DCC Python standards](/coding/python.md): mise pins the tools and runs the tasks, uv manages the environment, ruff lints and formats, ty checks types, and pre-commit runs the hooks on every commit.

```bash
mise install                # uv, the virtual environment and the pre-commit hooks
mise run check              # lock check, ruff format and fix, ty
mise run test:unit          # pytest
mise run ci                 # what CI runs, without changing files
mise run docker:build       # the Open WebUI image as open-webui:local
mise run docker:build-seeder
mise run docker:seed        # seed a running Open WebUI (OWUI_BASE_URL, OWUI_API_KEY)
```

The end-to-end suites and most benchmarks need a model. They use the local stack of [deep-research-evaluation](https://github.com/DCC-BS/deep-research-evaluation): Gemma 4 31B NVFP4 and the Qwen3 embedding on vLLM, on a workstation with two RTX 4090. It mirrors production closely enough for relative comparisons. Production runs other quantizations on H100 cards, so absolute numbers do not carry over.

## CI

Four GitHub workflows. All of them run `mise run ci` first.

| Workflow | When | What |
|---|---|---|
| `ci.yml` | Every pull request and push to `main` | Lock, format, lint, types, unit tests. Also checks that the deep research pipe matches its pinned upstream commit |
| `image-e2e.yml` | Pull requests that touch `image/`, `seeder/`, `governance_ui/` or the seeder e2e stack, and before every image push | Builds the image, starts it in strict mode with Postgres, S3 and a model stub, checks that every startup hook logged `installed`, loads the deep research functions inside the image, then seeds and runs the janitor against it |
| `build-seeder.yml` | Every merge to `main` that touches `seeder/`, or by hand | Builds and pushes the seeder image |
| `build-and-push.yml` | By hand, with an Open WebUI release tag such as `v0.12.4` | Builds and pushes the Open WebUI image, and the seeder with it |

The workflows install mise with its official installer instead of a marketplace action, because the enterprise policy only allows actions from FD-ITBS and an allowlist.

## Releases

Every build gets a tag that is never pushed twice:

| Image | Tag used in the cluster | Moving tags |
|---|---|---|
| Open WebUI | `<version>-slim-<build time>-<short commit>`, for example `v0.12.4-slim-202610261430-53160ab` | `<version>-slim`, `latest-slim` |
| Seeder | `<build time>-<short commit>`, for example `202610261430-53160ab` | `sha-<short commit>`, `latest` |

The build time is UTC in `YYYYMMDDHHMM`, so tags sort by time. The k8s values pin the tag together with its digest (`<tag>@sha256:<digest>`), which the build prints in its run summary. Test, uat and prod therefore run exactly the image that was tested, even if a moving tag changes.

A content change goes out like this:

1. Merge the change in `kdkp-open-web-ui`. CI builds the seeder image.
2. Renovate opens a pull request in `kdkp-kiw-k8s-config` that sets `seeder.image.tag` to the new tag and digest. You can also set it by hand from the run summary.
3. The merge changes the values, ArgoCD syncs and runs the seeder Job.

A rollback is the revert of that one line.

## Upgrading Open WebUI

Open WebUI releases often, and each release can move code that one of our hooks patches. An upgrade is therefore a routine with a written record, not a version bump.

1. **Recon.** A script collects what changed between the two releases: the changelog, new and removed environment variables with their defaults, variables our values set that upstream no longer reads, new slim gates, new built-in tools, database migrations and the matching Helm chart version.
2. **Dossier.** One file per version in `docs/upgrades/` (for example `v0.12.4.md`). Every changelog entry that touches something we use is marked act, verify or not applicable, with one line of reason. Every new setting is marked with the value we set or why the default is fine.
3. **Workstreams.** The work splits into slices with their own branch: image and hooks, seeder and janitor, Helm values, Office tools and skills, deep research. Each slice works through the upstream checklist in the matching page of `docs/` and returns evidence: a test run, a log line, a diff.
4. **Verify.** Every claim in the dossier gets the command that proved it. A surface the upgrade changed that no test covers gets a new test first.
5. **Ship.** Build the image, bump both tags in the k8s repository, roll out test, then uat, then prod.

Two rules come from earlier upgrades. Open WebUI 0.12 changed the database schema and could not run old and new pods side by side, so a major upgrade stops all pods and lets one pod run the migration (the steps are in the README of the k8s app). And the janitor's model policy names every built-in tool, because Open WebUI treats an unknown tool as enabled. A test fails for each new built-in tool the policy does not name.

The repository ships the routine as a Claude Code skill (`.claude/skills/owui-upgrade/`), with the dossier template and the recon script.
