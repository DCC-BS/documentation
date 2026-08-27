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

## Canonical tool versions

The versions below are the current canonical pins (frozen on the text-mate
projects). They appear in every `mise.toml`; only the tools relevant to a
project are listed.

| Tool | Pin | Used by |
|------|-----|---------|
| `bun` | `1.3.0` | JS / Nuxt projects |
| `node` | `24.9.0` | JS / Nuxt projects |
| `uv` | `0.11.31` | Python projects |
| `python` | `3.13` | Python projects |
| `usage` | `3.5.6` | all (mise task CLI) |
| `npm:varlock` | `1.13.0` | apps that load secrets via varlock |
| `pass-cli` | `latest` (plugin) | apps that load secrets via varlock |

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
"npm:varlock" = "1.13.0"
pass-cli = "latest"
python = "3.13"
usage = "3.5.6"
uv = "0.11.31"

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
