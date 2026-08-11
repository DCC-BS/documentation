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
