---
outline: deep
editLink: true
skillName: docker-images
skillDescription: "DCC-BS shared Docker tooling (dcc-docker-images): the pre-built mise base image (ghcr.io/dcc-bs/dcc-docker-images/mise), the assemble-runtime script, and the fastapi/nuxt Dockerfile templates. Use when writing or reviewing a Dockerfile for a DCC-BS app, or when the base image or templates need to be updated."
---

# Shared Docker Images

DCC-BS keeps its Docker logic in **one place** so apps don't duplicate it. The
[`dcc-docker-images`](https://github.com/DCC-BS/dcc-docker-images) repository
ships a pre-built **mise base image** plus two **Dockerfile templates** that
every app copies in and builds with its own source as the build context.

## Layout

```
dcc-docker-images/
├── mise/          # PRE-BUILT base image (dcc-mise) — build once, share
├── fastapi/       # TEMPLATE — copy into FastAPI/uv apps, build in the app repo
├── nuxt/          # TEMPLATE — copy into Nuxt/node apps, build in the app repo
└── README.md
```

## How it works

Only the **mise base image** is pre-built and shared. The `fastapi/` and `nuxt/`
Dockerfiles are **templates**: they `COPY` app files, so they must be built
inside each app repo with the app as the build context.

The base image carries everything common:

- Debian slim, plus apt packages (`sudo`, `curl`, `git`, `ca-certificates`,
  `build-essential`)
- mise installed to `/mise/bin/mise`, with data/config/cache/state dirs under
  `/mise` and shims on `PATH`
- `/usr/local/bin/assemble-runtime` — a shared script that strips the
  mise-managed python/node + varlock into a minimal `/runtime`, dropping
  headers, Tcl/Tk, terminfo, npm/corepack, man pages, and pip/idle launchers.

Each app's Dockerfile is then thin: it only holds the app-specific steps
(`COPY . .`, build commands, entrypoint). The runtime-assembly logic lives in
exactly one place — the base image — instead of being copy-pasted into every app.

## The base image

`ghcr.io/dcc-bs/dcc-docker-images/mise` is published to GHCR by the
`.github/workflows/docker-publish.yml` workflow (manual `workflow_dispatch`),
tagged with the Debian release and `latest`.

The tag matches the Debian release. When you bump it, rebuild and re-tag so apps
pick up the new `assemble-runtime` script and toolchain.

## Using a template in an app

1. Copy the template into the app repo:
   ```sh
   cp dcc-docker-images/fastapi/Dockerfile /path/to/app/Dockerfile
   ```
2. Build in the app repo (the app is the build context):
   ```sh
   cd /path/to/app
   docker build -t my-app .
   ```

The python/node version is **not** hardcoded anywhere in the templates — it
comes from the app's own `pyproject.toml` (`requires-python`) or `mise.toml`.
Change it there and both build and runtime follow automatically.

## The `assemble-runtime` script

Run inside the build stage **after** `mise install` has populated
`/mise/installs`:

```sh
assemble-runtime python   # FastAPI/uv apps (standalone varlock binary)
assemble-runtime node     # Nuxt/node apps (npm varlock package)
```

It writes a minimal runtime to `/runtime` and, for Python, repoints the app's
venv at the relocated interpreter so the python version lives in exactly one
place (`pyproject.toml` / `mise.toml`), never hardcoded in the script.

## Version pinning

The base image tag matches the Debian release. When you bump the base image,
rebuild it and re-tag so apps pick up the new `assemble-runtime` script and
toolchain.

## Publish

The `.github/workflows/docker-publish.yml` workflow builds and pushes the mise
base image to `ghcr.io/dcc-bs/dcc-docker-images/mise` on manual dispatch. The
`fastapi`/`nuxt` templates are not published — they are copied into each app and
built there.

## See also

- [Docker Standards](/coding/docker) — the general containerization standards
- [Tooling with mise](/dev-setup/mise) — the mise toolchain the base image ships
- [Varlock Setup](/dev-setup/varlock) — the secrets workflow the runtime uses
