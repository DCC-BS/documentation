---
outline: deep
editLink: true
---

# Seeder, janitor and reindex

Open WebUI stores its models, tools, functions, skills, prompts and most admin settings in the database and has no way to load them from files. Without extra work, the configuration of Bebbi Bot would exist only in a database that someone edited through the admin UI. Open WebUI also never cleans up after itself, and its own reindex of knowledge bases loses the page numbers of PDFs.

Three programs close those gaps. All three ship in one image, `ghcr.io/fd-itbs/open-webui-seeder`, built from the `seeder/` folder of the `kdkp-open-web-ui` repository. Each has a small entry point (`seed.py`, `janitor.py`, `reindex.py`), and their code lives in the package `seeder/kdkp_seeder/`.

| Program | Runs as | When | Job |
|---|---|---|---|
| Seeder | ArgoCD PostSync Job `openweb-ui-seeder` | After every ArgoCD sync | Push the content in git into Open WebUI |
| Janitor | CronJob `openweb-ui-janitor` | Daily at 03:00 Europe/Zurich | Enforce the model policy, delete leftovers and old chats, send governance mails |
| Reindex | CronJob `openweb-ui-reindex`, suspended | Only when started by hand | Rebuild all knowledge bases from the original files |

```text
seeder/
├── seed.py, janitor.py, reindex.py
├── kdkp_seeder/
│   ├── owui_api.py        API client with retries, shared by all three
│   ├── seeding.py         the seeder
│   ├── reindex.py         the reindex
│   └── janitor/           one module per janitor step, order in run.py
│       ├── models.py      model policy
│       ├── users.py       data of deleted users
│       ├── retention.py   chat retention
│       ├── governance.py  governance reminders and report
│       ├── files.py, vectors.py, s3.py   leftovers
│       ├── audit.py       audit log
│       ├── mail.py, mail_texts.py        mail relay and every mail text
│       └── config.py      settings from the environment
└── content/               what gets seeded
```

## Seeder

### What it manages

Everything lives under `seeder/content/`. One file is one resource.

| Folder or file | Format | Becomes |
|---|---|---|
| `models/` | JSON | Models in the model picker, and the hidden base models |
| `tools/` | Python | Tools, see [Tools](/apps/bebbi-bot/tools.md) |
| `functions/` | Python | Filters, pipes and actions |
| `skills/` | Markdown | Skills the model can load |
| `prompts/` | Markdown | Slash-command prompts such as `/email` |
| `tool-servers/` | JSON | External MCP or OpenAPI servers |
| `configs/` | JSON | Admin settings (Admin Panel → Settings), one file per settings namespace |
| `groups/permissions.json` | JSON | Extra rights for named groups |
| `ui/visibility.json` | JSON | Controls hidden from users in the interface |
| `removed.json` | JSON | Resources the seeder deletes |

Python files carry their metadata in a leading docstring (`title`, `description`, `version`). Markdown files carry it in YAML frontmatter. A function can declare `global: true` to run on every chat, and `valves:` to set its admin settings. Files with another extension, such as the `*.disabled` examples, are skipped.

The id comes from the file name. Tools and functions get `[a-z0-9_]`, because Open WebUI requires a valid Python identifier. Skills get `[a-z0-9-]`. Prompts use their `command`, models and tool servers the id in the file.

### Rules the seeder follows

* **Create or update, never duplicate.** Each push is idempotent. A renamed file creates a new resource and leaves the old one behind.
* **Unchanged means untouched.** The seeder compares the file with the live object and writes only when they differ. Open WebUI keeps a version history for models, tools, functions and skills, and an unchanged sync adds no history row and bumps no timestamp.
* **Git wins for what a file declares.** In `configs/`, the seeder reads the live settings, overlays only the keys the file names, and writes back if something changed. A key in git is owned by git: an admin who changes it in the UI loses the change at the next sync. Keys the files do not mention stay as the admin set them. The same holds for tool servers, group rights and hidden controls.
* **Seeded content is public.** Open WebUI has no implicit "visible to everyone". The seeder gives every tool, skill, prompt and model a read grant for all logged-in users. Without it, a resource created by the admin's API key works for that admin and silently for nobody else. Since Open WebUI 0.12.4, saving a resource no longer changes its grants, so the seeder writes them through the dedicated access endpoints and only when the public grant is missing. Extra grants added in the UI survive.
* **Tool servers are a decision per server.** They are exempt from the public grant. Each file states its own access grants, and an empty list means admins only.
* **Deletes only on request.** Removing a file does not remove the resource. To delete a retired resource, list it in `removed.json`. The seeder deletes each listed resource that still exists. An entry for a resource that is still declared is an error and fails a unit test, so a name cannot be retired and re-added at the same time.
* **Retries only where safe.** The API client repeats a request after a timeout, a dropped connection or a 502, 503 or 504, at most twice. It repeats only requests that do the same when sent twice: reads, updates and whole-config writes. A create is sent once.
* **No secrets in the content folder.** The files are plain text in git and in the image.

### Settings we own

Some settings exist because Open WebUI's defaults do not fit us.

* **Task prompts in German.** Chat titles, follow-up questions and tags. The small task model produced English titles and switched to Chinese in follow-ups when given Open WebUI's English template.
* **Task prompts fit the task model.** The templates cut each message to a fixed number of characters, so a chat with scraped web pages fits into the 32k context of the task model. The caps follow from that context window and change together with the task model.
* **Search queries for knowledge bases.** A German template that keeps the numbers, places and terms of the question and makes the question itself the first query. See [Knowledge bases and citations](/apps/bebbi-bot/knowledge.md#search-queries).
* **Chunking and retrieval.** Chunk size, overlap and the number of chunks per query, in `configs/retrieval.json`.
* **Embedding concurrency.** At most two embedding requests in flight per file, so a user's question does not wait behind a large upload.
* **Sub-agent prompt.** Upstream's default is written for coding ("files you changed"). Ours is German and asks for one task, tools instead of memory, no questions, and a `[n]` for every statement.
* **Model picker order**, because an environment variable stops working as soon as anyone saves the setting in the UI.
* **Context compaction on**, so long chats are summarized instead of failing.
* **Off:** thumbs-up ratings, arena models, tool search, realtime voice.

### Group rights

`groups/permissions.json` maps a group name to rights. The seeder merges them into the group's own rights, so rights it does not list stay as they are, and members are never touched. A missing group is created with the exact name, so the first login of a member joins it.

The knowledge admin group gets the rights to create and edit models, to choose the hidden base models as base, and to share models with users and groups. Publishing a model to everyone stays off. See [Governance manager](/apps/bebbi-bot/governance.md#knowledge-admin-role) for how someone gets the role.

### Hidden controls

Open WebUI 0.12.4 can hide single controls from users (admins still see all of them). We hide:

* Model editor entries the janitor's model policy switches off anyway. Hiding is cosmetic: the value behind a hidden control still works, so the janitor keeps enforcing it.
* Archive. Chat retention deletes archived chats like any other, so archiving would suggest a protection that does not exist.
* The speech engine choice. A user switching to the browser engine would send audio to the browser vendor instead of our Whisper.
* The two iframe sandbox switches that together let HTML previews leave the sandbox.

### Rolling out a change

1. Change a file under `seeder/content/` and merge to `main`. CI runs the lint and tests and pushes the image tagged `<build time>-<short commit>`.
2. Renovate opens a pull request in `kdkp-kiw-k8s-config` that sets `seeder.image.tag` to the new tag and digest.
3. ArgoCD syncs because the values changed and runs the Job.

The Job needs an admin API key. Normal users cannot create keys here, so an admin creates one once (Settings → Account → API keys) and stores it SOPS-encrypted as `secrets.openwebuiAdminApiKey`. Until the key exists, the Job logs a notice and exits successfully, so deployments do not block. The key's user should own the seeded skills: since 0.12, updating a skill needs its owner or a write grant when admins do not bypass access control.

### Local run

```bash
mise run docker:build-seeder
OWUI_BASE_URL=http://localhost:8080 OWUI_API_KEY=sk-... mise run docker:seed
```

`tests/e2e/seeder/` holds a Docker Compose stack (Open WebUI, Postgres with pgvector, an S3 API, a model stub, a mail catcher) and a script. `e2e.py seed` seeds twice and compares every live resource with the files. `e2e.py janitor` builds data for every deletion path, runs a dry run and a real run, and checks what went and what stayed. `e2e.py retention` checks the notice mails and the deletion two weeks later. CI runs the stack against every new image.

## Janitor

Open WebUI never cleans up after itself. Deleting a chat leaves its uploaded files, deleting a user leaves most of what the user owned, and web searches leave vector collections nobody reads again. The janitor deals with this once a day. It logs every change, and it changes nothing while `janitor.dryRun` is `true` in the values. A run holds a database lock, so a second run started by hand does nothing.

### Steps

1. **Model policy.** See below.
2. **Data of deleted users.** Open WebUI deletes only their chats, groups, API key and login. The janitor deletes channels, calendars, models, prompts, tools, skills, notes, folders, knowledge bases and files through the API, and the remaining rows (automations, tags, OAuth sessions, API keys, feedback, memberships) with SQL. Groups and functions stay, because deleting a function can break every chat. Anything declared in `seeder/content/` stays too, and so does anything a knowledge base of an existing user still uses.
3. **Chat retention.** Deletes chats unused for a year, after a notice by mail. See [Chat retention](#chat-retention).
4. **Governance.** Reminders to knowledge base owners, the duties mail for role requests and the weekly report to DCC. See [Governance manager](/apps/bebbi-bot/governance.md#reminders-and-the-report-to-dcc).
5. **Dangling files.** A file is dangling if its id appears nowhere in the database, in any table or JSON column, and it is older than 24 hours. The scan errs on the side of keeping, since a false "dangling" loses data. Deletion goes through the file API, which removes the row, the S3 object and the vector collection together. At most 10,000 files per run.
6. **Memories of deleted users.**
7. **Orphaned embeddings.** Collections and chunks in pgvector whose file, knowledge base or owner is gone. Collections without an owner row, such as web search results, are checked twice, five minutes apart, and deleted only if both checks agree.
8. **Orphaned S3 objects.** Objects named like an upload whose file row no longer exists. Other keys in the bucket are never touched.
9. **Report.** What deleted users still own, with its sharing, so someone can decide.
10. **Audit log cleanup.** Rows older than 400 days are deleted.

### Model policy

Staff with the knowledge admin role can build their own models in Workspace → Models. The janitor holds every model the seeder does not declare to a fixed policy and switches off the rest:

| Setting | Allowed | Switched off |
|---|---|---|
| Capabilities | Vision, file upload, file context, code interpreter, citations, memory, usage, status updates, built-in tools, web search switch | Image generation, terminal |
| Default features | Web search switch, code interpreter | All others |
| Built-in tools | Time, files, tasks, sub-agents, user input, knowledge, code interpreter, memory, chats, skills | Open WebUI's own web search, image generation, notes, channels, automations, calendar, notifications |

The point is control over data flow. The web search switch in a chat only runs our [search tool with the review step](/apps/bebbi-bot/tools.md#web-search). Open WebUI's own web search, which sends queries without review, stays off. Skills are allowed because creating one needs a right users do not have.

Allowed settings stay as the user chose them. Sharing, parameters and everything else on the model are left alone. Each change is saved with the commit message `janitor: model policy (...)`, which shows in the model's version history.

Open WebUI treats a missing key as enabled, so a new built-in tool is on for every model until the janitor learns its name. The janitor writes `false` explicitly for every denied key, and a unit test compares the policy against the list of built-in tools of the running Open WebUI version. It fails for each tool the policy does not name.

### Chat retention

The DSFA for the AI prototypes requires that chats are deleted a year after their last use.

1. **Notice.** Each user whose chats reach the limit within the next 14 days (plus a week) gets one mail listing those chats with their deletion dates. At most one such mail per week, at most 50 chats per mail. The others follow in the next mail, so every deleted chat was named in one.
2. **Deletion.** A chat is deleted once it is a year old and its notice is at least 14 days old. Nobody with a mail address loses a chat without a warning, also on the first run after the rollout. The chat's files follow in the dangling-file step of the same run.
3. **Feedback.** Ratings carry a copy of the rated chat, so ratings older than a year are deleted too.

"Last use" is the chat's last change: a message, a rename, a pin. Using a chat again starts the year over. Sub-agent chats are hidden from users and go with their parent chat. Knowledge bases and their files are never touched: their owners confirm every year that they are still needed.

The mail goes through the IT BS relay without login, with STARTTLS when the relay offers it. If the relay rejects an address as unknown (someone who left), the chats count as noticed and expire a notice period later. A temporary error sends nothing and retries the next day.

Retention and the governance mails each have their own dry run (`janitor.retention.dryRun`, `janitor.governance.dryRun`). Both stay in dry run until the mail relay is reachable from the cluster.

### Audit log

Every deletion of user data is written to the table `bebbi_bot_janitor_audit`, one row per deleted item: when, which step, what kind (chat, file, memory, collection, S3 object, or the table of a deleted user's resource), the id, the owner and a reason such as `unused since 03.10.2025, noticed 14+ days ago` or `owner deleted`. No titles, file names or content. The question "was my chat deleted, when, and why?" can then be answered after the job's logs are gone.

```sql
SELECT to_timestamp(at), step, kind, object_id, reason FROM bebbi_bot_janitor_audit
WHERE owner_id = '<user id>' ORDER BY at DESC;
```

SQL deletes write their audit rows in the same transaction. A dry run writes nothing.

### Database role

The janitor can connect with a role of its own (`JANITOR_DATABASE_URL`) instead of Open WebUI's. That limits what a compromised seeder image could do to the database. The role needs to read every table, because the reference scans look at every text column, and the run deletes nothing if any table is unreadable. It needs delete rights only on the tables the steps delete from. The full list of grants is in the seeder README.

### Settings

All in `values.yaml` under `janitor:`.

| Value | Default | Meaning |
|---|---|---|
| `schedule` | `0 3 * * *` | Cron schedule, time zone `Europe/Zurich` |
| `dryRun` | `false` | Log only, change nothing |
| `minAgeHours` | `24` | Files younger than this are never deleted |
| `maxDelete` | `10000` | Upper bound on deletions per run |
| `maxRunSeconds` | `10800` | Kubernetes stops a run after three hours |
| `vectorRecheckSeconds` | `300` | Pause between the two checks of ownerless collections |
| `keepRuns` | `5` | Finished runs kept, with their logs |
| `smtp.enabled` | `false` | Mail relay for notices and governance mails |
| `retention.days`, `retention.noticeDays` | `365`, `14` | Retention period and notice lead time |
| `governance.reportTo` | | Recipients of the weekly report |

Turn `dryRun` on for a new stage, read the logs of the first runs, then turn it off.

Fixed values (one notice per week, 50 chats per notice) sit in `kdkp_seeder/janitor/config.py`. Governance deadlines and intervals sit in the governance package of the image, which the page and the janitor share. Every mail text sits in `kdkp_seeder/janitor/mail_texts.py`.

## Reindex

The reindex rebuilds every file of the knowledge bases from the original: extraction with Docling, chunking and embedding with the current settings, then the file's chunks in each of its knowledge bases. Run it after a change of chunking, of the embedding model, or of the Docling version or settings. Files attached directly in chats are not touched.

### Why not Open WebUI's reindex

Open WebUI has a reindex button (Admin → Documents). It runs no loader. It re-chunks and re-embeds the text stored at upload, which is all pages joined into one string. Every chunk loses its page, so a citation opens the PDF on page 1. Measured locally: 1,143 of 1,207 chunks had a page before, 0 of 1,289 after. It also empties each knowledge base first, so searches find little until it is done, and it runs in one HTTP request that the gateway cuts after 300 seconds.

### What it does per file

1. Empty the file's own vector collection, because Open WebUI would otherwise keep the old chunks.
2. Process the file again through Open WebUI's API: Docling, chunking, embedding. If that fails, the knowledge bases keep their old chunks and the file is reported.
3. Replace the file's chunks in each knowledge base it belongs to. Only this file's chunks are missing, for the seconds this takes.

Each file is processed once, also when it is in several knowledge bases. On a local test with 44 federal PDFs, 2,359 of 2,484 chunks had a page again after the reindex. The rest came from Word files, which have no pages.

### Running it

1. In `values.yaml` under `reindex:`, set `dryRun: true` for a first look, and narrow the run with `knowledgeIds`, `fileExtensions` or `maxFiles` if needed. Sync in ArgoCD. The Job reads its settings from the CronJob when it is created.
2. In ArgoCD, open the CronJob `openweb-ui-reindex` and choose "Create Job".
3. Follow the log. It prints one line per file with position and estimated time left, then per knowledge base the chunks before and after and how many carry a page. The Job ends failed when a file failed, and the list at the end names them.
4. After an interruption, set `skipUpdatedSince` to the start of the interrupted run and create the Job again. Files done since then are skipped, failed ones are tried again.

One file costs one Docling conversion and two embedding passes. Run it in the evening or on a weekend, or slow it down with `pauseSeconds`.
