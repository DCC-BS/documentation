---
outline: deep
editLink: true
---

# AI Web Applications

The DCC builds a set of AI-powered web applications for the Canton of Basel-Stadt administration. This section gives a high-level, non-technical overview of each app: what it does, which interfaces it relies on, and how it is made available to cantonal users.

All apps except Bebbi Bot share the same architectural pattern. Bebbi Bot runs the open-source Open WebUI instead of our own frontend and backend, and [its section](/apps/bebbi-bot/index.md) describes what we add to it. The other apps use:

- **Frontend**: [Nuxt](https://nuxt.com/) (Vue.js), using the shared [Nuxt Layers](/nuxt-layers/index.md) and [User Interface](/user-interface/index.md) components
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python), using the shared [Backend Common](/backend-common/index.md) package
- **AI inference**: models hosted on the [Kantonale Daten- und KI-Plattform (KDKP)](/infrastructure/index.md) — the canton's on-premise, sovereign AI infrastructure
- **Feedback**: in-app feedback widget that files a [GitHub issue](/nuxt-layers/feedback_control.md) directly, no separate feedback backend

For technical setup, environment variables, and deployment details, see the respective app repositories on GitHub. This section intentionally stays at the feature/interface level.

## Apps

| App | Description | Auth | PWA | MS Teams | App Store |
|---|---|---|---|---|---|
| [TextMate](/apps/textmate.md) | AI writing assistant: rewriting, proofreading, document advisor | Azure AD (Entra ID) | Installable icon only | ✅ | ✅ |
| [BS-Übersetzer](/apps/bs-uebersetzer.md) | AI translation for text, documents & speech | No auth (Azure AD capable) | Full PWA | ❌ | ✅ |
| [Transcribo](/apps/transcribo.md) | Audio/video transcription & summarization | No auth | Full PWA | ❌ | ✅ |
| [Bebbi Bot](/apps/bebbi-bot/index.md) | General AI assistant, our [Open WebUI](https://docs.openwebui.com/) deployment: chat, Office file creation and editing, knowledge bases with cited passages, web search, cantonal data through MCP, deep research | Microsoft Entra ID | – | – | – |

::: tip App Store
"App Store" refers to the **IT BS Unternehmensportal App Store**, the internal catalog through which cantonal employees install apps on their managed iPhones.
:::
