---
outline: deep
editLink: true
description: DCC-BS standard for managing runtime versions and tasks with mise.
---

# Tooling with mise

All DCC-BS projects use [mise](https://mise.jdx.dev/) (formerly rtx) as the single
manager for **runtime versions** and as the **entry point for tasks**. Every
repository ships a `mise.toml` at its root that pins the exact toolchain and
declares the standard tasks, so that `mise run <task>` works the same way across
every project.

Install mise once on your machine: follow the
[official guide](https://mise.jdx.dev/getting-started.html). After that, entering
any project directory automatically activates the pinned versions.

## Why mise

- **One source of truth for versions** — `bun`, `node`, `python`, and `uv` are
  pinned in `mise.toml`. No more `.nvmrc`, `.python-version`, or "works on my
  machine" drift.
- **One entry point for tasks** — `mise run install`, `mise run dev`,
  `mise run check`, … replace project-specific `Makefile`s and ad-hoc npm
  scripts. CI calls the same commands.
- **Hooks** — `postinstall` and `enter` hooks run setup and checks automatically
  when you `cd` into a project.

When you first enter a project, run `mise trust` once to approve its
`mise.toml`.

## Tools

The tools below are pinned in each project's `mise.toml` — check the file in the
repo you are working on for the exact versions. Only the tools relevant to a
project are listed.

| Tool | Used by |
|------|---------|
| `bun` | JS / Nuxt projects |
| `node` | JS / Nuxt projects |
| `uv` | Python projects |
| `python` | Python projects |
| `usage` | all (mise task CLI) |
| `npm:varlock` | apps that load secrets via varlock |
| `pass-cli` | apps that load secrets via varlock (plugin) |

Projects that load secrets via varlock also declare the pass-cli plugin:

```toml
[plugins]
pass-cli = "https://github.com/DCC-BS/mise-proton-pass-cli"
```

## Standard task names

Every project exposes the same task names through `mise run`, so you never have
to guess. Run `mise tasks` in any project to see what is available.

### JavaScript / Nuxt apps

`install`, `dev`, `build`, `preview`, `tsc`, `lint`, `check`, `test:unit`,
`test:watch`, `test:coverage`, `test:e2e`, `test:e2e:ui`, `docker:up`,
`docker:down`.

Apps that use varlock also expose `env-check` (alias `env`) and `dummy`
(no-auth / mock-data dev mode).

### Python backends

`install`, `dev`, `run`, `check`, `ci-check`, `test:unit`, `ci`, `docker:up`,
`docker:down`, `docker:logs`. Projects with extra needs add `integration`,
`build`, or `env-example`.

### Libraries (`.bs.js` modules, `backend-common`)

A reduced set: `install`, `dev`, `build`/`prepack`, `check`, `lint`, `test:unit`,
`release`. Libraries do **not** use varlock/pass-cli, so they have no hooks.

## Secrets hooks

Projects that use varlock ship a `.mise-tasks/` directory with two file-based
tasks:

- `pass-login` — logs in to Proton Pass CLI (skips if already logged in).
- `enter-checks` — warns if you are not logged in when you enter the project.

These back the `enter` and `env-check` hooks:

```toml
[hooks]
postinstall = { task = "install" }
enter = { task = "enter-checks" }
```

See the [Varlock setup guide](./varlock) for the secrets workflow.

## Example: a Python backend `mise.toml`

```toml
[tools]
"npm:varlock" = "<version>"
pass-cli = "latest"
python = "3.13"
usage = "<version>"
uv = "<version>"

[plugins]
pass-cli = "https://github.com/DCC-BS/mise-proton-pass-cli"

[hooks]
postinstall = { task = "install" }
enter = { task = "enter-checks" }

[tasks.install]
description = "Create the virtual environment and install the pre-commit hooks"
alias = "i"
run = ["uv sync", "uv run pre-commit install"]

[tasks.dev]
description = "Run the FastAPI dev server with auto-reload"
alias = "d"
depends = ["env-check"]
run = "uv run fastapi dev ./src/my_backend/app.py --port 8000"

[tasks.check]
description = "Verify lockfile, format code, lint, and type-check"
alias = "c"
run = [
    "uv lock --locked",
    "uv run ruff format",
    "uv run ruff check --fix",
    "uv run ty check",
]
```

## Monorepos

For a monorepo of independent packages (e.g. `nuxt-layers`), a single root
`mise.toml` pins `bun` + `node` so every sub-package inherits the same
toolchain. Per-package `package.json` and `biome.json` stay in place.

## CI workflows

The shared [ci-workflows](https://github.com/DCC-BS/ci-workflows) repository
provides reusable GitHub Actions that are mise-based (v2): the pipeline is
language-agnostic and driven entirely by the project's `mise.toml`.

- **Setup** — the `setup-mise` composite action installs mise via
  `jdx/mise-action` (with caching), then runs `mise trust` and `mise install` to
  provision exactly the tools pinned in the project's `mise.toml`. This is the
  single setup step for every workflow.
- **One pipeline for everything** — [`ci.yml`](https://github.com/DCC-BS/ci-workflows/blob/main/.github/workflows/ci.yml)
  detects which standard tasks exist (`mise tasks ls --json`) and runs
  `build` → `ci-check` → `test:unit` → `test:e2e`, skipping any step whose task
  is not defined. Frontends and backends use the same workflow.
- **No version matrix** — tool versions come from the project's `mise.toml`, so
  CI always tests with the same toolchain as local development. There are no
  `node-version`/`python-version` inputs to maintain.
- **Secrets in CI** — the pipeline sets `APP_MODE=ci` so secret-dependent steps
  (e.g. `varlock scan` inside `check`) run without a `pass-cli` login.
- **Playwright** — browser install is **not** handled by the workflow; the
  project's `test:e2e` task is expected to install its own browsers (e.g. via a
  `depends` entry on `playwright:install-browser`).

```yaml
jobs:
  ci:
    uses: DCC-BS/ci-workflows/.github/workflows/ci.yml@v2
```

Absent tasks are skipped automatically — there is nothing to configure beyond
shipping a `mise.toml` with the standard task names.

## Docker images

The [dcc-docker-images](https://github.com/DCC-BS/dcc-docker-images) repository
provides shared Docker tooling so apps don't duplicate build logic. mise is the
bridge between development and production images:

- **Base image** — only the `mise` base image (`ghcr.io/dcc-bs/dcc-docker-images/mise:13-slim`,
  built on `debian:13-slim`) is pre-built and shared. It carries the mise
  binary, mise env vars, apt packages, and the `assemble-runtime` script.
- **Templates** — the `fastapi/` and `nuxt/` Dockerfiles are templates copied
  into each app repo. They are thin: `COPY . .`, `mise trust -a && mise install`
  (the `postinstall` hook runs the `install` task), the build tasks, then
  `assemble-runtime python` or `assemble-runtime node`.
- **Single source of versions** — the toolchain in the image is installed by
  `mise install` from the app's `mise.toml`, exactly as on a dev machine. The
  python version is not hardcoded anywhere: it comes from `requires-python` in
  `pyproject.toml` (installed by uv), the node version from `mise.toml`.
- **Minimal runtime** — `assemble-runtime` strips the mise-managed toolchain
  into a lean `/runtime` (python/node + varlock only), dropping headers,
  npm/corepack, man pages, and other build-only bits. The final stage is a bare
  `debian:13-slim` that copies `/app` and `/runtime` — it does not contain mise
  at all.
- **Build vs. runtime modes** — the build stage sets `APP_MODE=build` and
  `DOCKER_BUILD=1` (e.g. `install` runs `uv sync --locked --no-dev`), the
  runtime stage sets `APP_MODE=prod`. Apps start via varlock
  (`varlock run -- …`), reusing the varlock binary/package assembled into
  `/runtime`.

## System packages (`bootstrap.packages`)

mise can ensure **machine-global system packages** are installed via the
`[bootstrap.packages]` section, applied with `mise bootstrap`. These are kept
separate from `[tools]`: they are not version-pinned per-project, do not get
shims, and are installed by the platform's package manager (e.g. `apt`).

```toml
[bootstrap.packages]
"apt:libcairo2" = "latest"
"apt:libcups2t64" = "latest"
"apt:fonts-liberation" = "latest"
```

Entries are keyed `"manager:package"` — the manager prefix is required — and the
value is a version (`"latest"` or a native pin). Entries are **OS-filtered**
(`apt:` lines are ignored on macOS), **declarative/additive**, and mise **never
installs system packages implicitly** — only `mise bootstrap` does.

Useful commands:

```bash
mise bootstrap packages status            # requested vs installed
mise bootstrap packages status --missing  # exit 1 if out of sync (CI check)
mise bootstrap packages apply             # install whatever is missing
mise bootstrap packages apply --yes       # skip the confirmation prompt
mise bootstrap packages apply --dry-run   # preview without installing
```

Linux package managers require root; mise elevates with `sudo` (prompts for a
password, or errors with the exact command in non-interactive shells). In
containers you are typically already root, so `mise bootstrap packages apply --yes`
runs without prompts.

## Playwright browser setup

JavaScript/Nuxt projects that run Playwright E2E tests need both the **Playwright
browser binaries** and the **OS-level libraries** they depend on. In this repo
both are wired through mise:

- **Browser binaries** — installed by the `playwright:install-browser` task
  (run from the `install` task). It calls `bunx playwright install chromium`,
  which is a no-op when the matching revision already exists in
  `~/.cache/ms-playwright/`:

  ```bash
  mise run playwright:install-browser
  ```

  Pass `--with-deps` to also install the OS libraries via the system package
  manager (useful for bootstrapping a fresh machine):

  ```bash
  mise run playwright:install-browser --with-deps
  ```

- **OS-level libraries** — declared declaratively as `[bootstrap.packages]` with
  the `apt:` prefix, mirroring the chromium + tools lists Playwright ships for
  Ubuntu (e.g. `libasound2t64`, `libatk1.0-0t64`, `libnss3`, `libgtk-3-0t64`,
  `fonts-liberation`, `xvfb`). Apply them with:

  ```bash
  mise bootstrap packages apply
  ```

  This replaces ad-hoc `bunx playwright install --with-deps` calls and is
  idempotent — already-installed packages are skipped.

To see the exact package list a given Playwright version needs, run:

```bash
bunx playwright install-deps chromium --dry-run
```
