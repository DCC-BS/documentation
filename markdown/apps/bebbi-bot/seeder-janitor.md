---
outline: deep
editLink: true
---

# Seeder and janitor

Open WebUI stores its models, tools, functions, skills, prompts and most admin settings in the database and has no way to load them from files. Without extra work, the configuration of Bebbi Bot would exist only in a database that someone edited through the admin UI.

Two small programs close that gap. Both ship in one image, `ghcr.io/fd-itbs/open-webui-seeder`, built from the `seeder/` folder of the `kdkp-open-web-ui` repository.

| Program | Runs as | When | Job |
|---|---|---|---|
| Seeder (`seed.py`) | ArgoCD PostSync Job `openweb-ui-seeder` | After every ArgoCD sync | Push the content in git into Open WebUI |
| Janitor (`janitor.py`) | CronJob `openweb-ui-janitor` | Daily at 03:00 Europe/Zurich | Delete leftovers and enforce the model policy |

## Seeder

### What it manages

Everything lives under `seeder/content/`. One file is one resource.

| Folder | Format | Becomes |
|---|---|---|
| `models/` | JSON | Models in the model picker |
| `tools/` | Python | Tools, see [Tools](/apps/bebbi-bot/tools.md) |
| `functions/` | Python | Filters, pipes and actions |
| `skills/` | Markdown | Skills the model can load |
| `prompts/` | Markdown | Slash-command prompts such as `/email` |
| `tool-servers/` | JSON | External MCP or OpenAPI servers |
| `configs/` | JSON | Admin settings (Admin Panel → Settings) |

Python files carry their metadata in a leading docstring (`title`, `description`, `version`). Markdown files carry it in YAML frontmatter. A function can declare `global: true` to run on every chat, and `valves:` to set its admin settings. Files with another extension, such as `.disabled`, are skipped.

### Rules the seeder follows

* **Create or update, never duplicate.** Each push is idempotent. The id comes from the file name, so renaming a file creates a new resource and leaves the old one behind.
* **Unchanged means untouched.** The seeder compares the file with the live object and writes only when they differ. Open WebUI 0.12 keeps a version history for models, tools, functions and skills, and an unchanged sync adds no history row.
* **Git wins for what a file declares.** In `configs/`, the seeder reads the live settings, overlays only the keys the file names, and writes back if something changed. A key in git is owned by git: an admin who changes it in the UI loses the change at the next sync. Keys the files do not mention stay as the admin set them.
* **Seeded content is public.** Open WebUI has no implicit "visible to everyone". The seeder gives every tool, skill, prompt and model a read grant for all logged-in users, on create and on every update. Without the grant, a resource created by the admin's API key is invisible to everyone else.
* **No deletes.** Removing a file does not remove the resource. Delete it in the admin UI.
* **No secrets in the content folder.** The files are plain text in git and in the image.

Some settings exist because Open WebUI's defaults do not fit us:

* German prompts for chat titles, follow-up questions and tags. The small task model produced English titles and switched to Chinese in follow-ups when given Open WebUI's English template. The templates also cut each message to a fixed length, so a chat with scraped web pages fits into the task model's 32k context.
* The model picker order, because an environment variable stops working as soon as anyone saves the setting in the UI.
* No thumbs-up rating, no arena models, no tool search, no realtime voice.
* Context compaction on, so long chats are summarized instead of failing.

### Rolling out a change

1. Change a file under `seeder/content/` and merge to `main`. CI runs the lint and tests and pushes the image tagged `sha-<short commit>`.
2. In `kdkp-kiw-k8s-config`, set `seeder.image.tag` in `apps/ki-app-openweb-ui/values.yaml` to that tag.
3. ArgoCD syncs because the tag changed and runs the Job. Pushing the same tag again does not trigger a sync.

The Job needs an admin API key. Normal users cannot create keys here, so an admin creates one once (Settings → Account → API keys) and stores it SOPS-encrypted as `secrets.openwebuiAdminApiKey`. Until the key exists, the Job logs a notice and exits successfully, so deployments do not block.

The Job removes itself five minutes after it finishes.

### Local run

```bash
docker build --build-context assets=assets -t open-webui-seeder seeder/
docker run --rm -e OWUI_BASE_URL=http://host.docker.internal:8080 \
  -e OWUI_API_KEY=sk-... open-webui-seeder
```

The folder `seeder/e2e/` holds a Docker Compose stack and a script that seeds twice and checks every live resource against the files. Run it before an Open WebUI upgrade.

## Janitor

Open WebUI never cleans up after itself. Deleting a chat leaves its uploaded files, deleting a user leaves most of what the user owned, and web searches leave vector collections nobody reads again. The janitor deals with this once a day. It logs every change, and it changes nothing while `janitor.dryRun` is `true` in the values.

### Steps

1. **Model policy.** See below.
2. **Data of deleted users.** Open WebUI deletes only their chats, groups, API key and login. The janitor deletes channels, models, prompts, tools, skills, notes, folders, knowledge bases and files through the API, and the remaining rows (tags, feedback, API keys, memberships) with SQL. Groups and functions stay, because deleting a function can break every chat. Anything declared in `seeder/content/` stays too.
3. **Dangling files.** A file is dangling if its id appears nowhere in the database, in any table or JSON column, and it is older than 24 hours. The scan errs on the side of keeping, since a false "dangling" loses data. Deletion goes through the file API, which removes the row, the S3 object and the vector collection together. At most 10000 files per run.
4. **Memories of deleted users.**
5. **Orphaned embeddings.** Collections in pgvector whose owner is gone. Collections without an owner row, such as web search results, are checked twice, five minutes apart, and deleted only if both checks agree.
6. **Orphaned S3 objects.** Objects named like an upload whose file row no longer exists. Other keys in the bucket are never touched.
7. **Report.** What deleted users still own, so someone can decide.

### Model policy

Staff with the right permission can build their own models in Workspace → Models. The janitor holds every model the seeder does not declare to a fixed policy and switches off the rest:

| Setting | Allowed | Switched off |
|---|---|---|
| Capabilities | Vision, file upload, file context, code interpreter, citations, memory, usage, status updates, built-in tools | Web search, image generation, terminal |
| Default features | None | All |
| Built-in tools | Time, files, tasks, sub-agents, user input, knowledge, code interpreter, memory | Chats, web search, image generation, notes, channels, automations, calendar, notifications, skills |

The point is control over data flow. A user model cannot gain web search, where queries leave the canton's infrastructure, and cannot write skills. Allowed settings stay as the user chose them. Sharing, parameters and everything else on the model are left alone. Each change is saved with the commit message `janitor: model policy (...)`, which shows in the model's version history.

Open WebUI treats a missing key as enabled, so a new built-in tool is on for every model until the janitor learns its name. An upgrade therefore includes a test that fails for each built-in tool the policy does not name.

### Settings

All in `values.yaml` under `janitor:`.

| Value | Default | Meaning |
|---|---|---|
| `schedule` | `0 3 * * *` | Cron schedule, time zone `Europe/Zurich` |
| `dryRun` | `false` | Log only, change nothing |
| `minAgeHours` | `24` | Files younger than this are never deleted |
| `maxDelete` | `10000` | Upper bound on file deletions per run |
| `vectorRecheckSeconds` | `300` | Pause between the two checks of ownerless collections |
| `keepRuns` | `5` | Finished runs kept, with their logs |

Turn `dryRun` on for a new stage, read the logs of the first runs, then turn it off.
