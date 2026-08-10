import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid({
    srcDir: "markdown",
    base: process.env.NODE_ENV === "production" ? "/documentation/" : "/",
    title: "DCC Dev Guidelines",
    description: "Guidelines for the DCC Developers",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: "/imgs/logo.png",
        editLink: {
            pattern:
                "https://github.com/dcc-bs/documentation/edit/main/markdown/:path",
        },
        nav: [
            { text: "Home", link: "/" },
            { text: "Team", link: "/team" },
        ],
        footer: {
            message:
                "Developed with ❤️ by the DCC. Documentation released under the MIT License.",
        },

        search: {
            provider: "local",
        },

        sidebar: [
            {
                text: "AI Web Applications",
                link: "/apps/index.md",
                items: [
                    { text: "TextMate", link: "/apps/textmate.md" },
                    { text: "BS-Übersetzer", link: "/apps/bs-uebersetzer.md" },
                    { text: "Transcribo", link: "/apps/transcribo.md" },
                ],
            },
            {
                text: "Setup & Tooling",
                items: [
                    { text: "Dev Setup", link: "/dev-setup" },
                    { text: "Tooling (mise)", link: "/dev-setup/mise" },
                    { text: "Envroment variables", link: "/dev-setup/varlock" },
                    { text: "AI Assisted Coding", link: "/dev-setup/ai-coding" },
                    { text: "Development Workflow", link: "/dev-setup/development-workflow" },
                ],
            },
            {
                text: "Coding",
                link: "/coding/index.md",
                items: [
                    { text: "Docker", link: "/coding/docker.md" },
                    { text: "Python", link: "/coding/python" },
                    { text: "Nuxt / Vue", link: "/coding/nuxt" },
                ],
            },
            {
                text: "User Interfaces",
                link: "/user-interface/index.md",
                items: [
                    {
                        text: "Composables",
                        link: "/user-interface/composables",
                        items: [
                            {
                                text: "useUserFeedback",
                                link: "/user-interface/composables/useUserFeedback.md",
                            },
                            {
                                text: "useDriverFactory",
                                link: "/user-interface/composables/useDriverFactory.md",
                            },
                            {
                                text: "useOnboardingBuilder",
                                link: "/user-interface/composables/useOnboardingBuilder.md",
                            },
                        ],
                    },
                    {
                        text: "Components",
                        link: "/user-interface/components/index.md",
                        items: [
                            {
                                text: "App Switcher",
                                link: "/user-interface/components/app-switcher.md",
                            },
                            {
                                text: "Changelogs",
                                link: "/user-interface/components/changelogs.md",
                            },
                            {
                                text: "Changelogs Button",
                                link: "/user-interface/components/changelogsbutton.md",
                            },
                            {
                                text: "Data Bs Footer",
                                link: "/user-interface/components/databsfooter.md",
                            },
                            {
                                text: "Disclaimer",
                                link: "/user-interface/components/disclaimer.md",
                            },
                            {
                                text: "Disclaimer Button",
                                link: "/user-interface/components/disclaimerbutton.md",
                            },
                            {
                                text: "Disclaimer Page",
                                link: "/user-interface/components/disclaimerpage.md",
                            },
                            {
                                text: "First Run Orchestrator",
                                link: "/user-interface/components/first-run-orchestrator.md",
                            },
                            {
                                text: "Navigation Bar",
                                link: "/user-interface/components/navigationbar.md",
                            },
                            {
                                text: "Onboarding",
                                link: "/user-interface/components/onboarding.md",
                            },
                            {
                                text: "Onboarding Restart Button",
                                link: "/user-interface/components/onboardingrestartbutton.md",
                            },
                            {
                                text: "Settings Button",
                                link: "/user-interface/components/settings-button.md",
                            },
                            {
                                text: "Split Container",
                                link: "/user-interface/components/splitcontainer.md",
                            },
                            {
                                text: "Split View",
                                link: "/user-interface/components/splitview.md",
                            },
                            {
                                text: "System Status",
                                link: "/user-interface/components/systemstatus.md",
                            },
                            {
                                text: "Undo Redo Buttons",
                                link: "/user-interface/components/undoredobuttons.md",
                            },
                        ],
                    },
                ],
            },
            {
                text: "Nuxt Layers",
                link: "/nuxt-layers/index.md",
                items: [
                    {
                        text: "Logger",
                        link: "/nuxt-layers/logger",
                    },
                    {
                        text: "Auth",
                        link: "/nuxt-layers/auth",
                    },
                    {
                        text: "Backend Communication",
                        link: "/nuxt-layers/backend_communication",
                    },
                    {
                        text: "Feedback Control",
                        link: "/nuxt-layers/feedback_control",
                    },
                    {
                        text: "Health Check",
                        link: "/nuxt-layers/health_check",
                    },
                    {
                        text: "Feedback Control",
                        link: "/nuxt-layers/feedback_control",
                    },
                ],
            },
            {
                text: "Backend Common Code",
                link: "/backend-common/index.md",
                items: [
                    {
                        text: "Configuration",
                        link: "/backend-common/config.md",
                    },
                    {
                        text: "Logger",
                        link: "/backend-common/logger.md",
                    },
                    {
                        text: "Logging Middleware",
                        link: "/backend-common/logging_middleware.md",
                    },
                    {
                        text: "Error Handler",
                        link: "/backend-common/error_handler.md",
                    },
                    {
                        text: "Kubernetes Probes",
                        link: "/backend-common/probes.md",
                    },
                    {
                        text: "Usage Tracking",
                        link: "/backend-common/usage_tracking.md",
                    },
                    {
                        text: "LLM Agent",
                        link: "/backend-common/llm_agent.md",
                    },
                ],
            },
            {
                text: "How Tos",
                items: [
                    {
                        text: "How to write changelogs",
                        link: "howto/changelogs",
                    },
                ],
            },
            {
                text: "Docling",
                link: "/docling/index.md",
                items: [
                    {
                        text: "DCC Docling Serve",
                        link: "/docling/serve",
                    },
                    {
                        text: "PP-Doc-Layout Plugin",
                        link: "/docling/pp-doc-layout",
                    },
                    {
                        text: "GLM-OCR Plugin",
                        link: "/docling/glm-ocr",
                    },
                ],
            },
            {
                text: "AI Infrastructure",
                link: "/infrastructure/index.md",
                items: [
                    {
                        text: "Overview",
                        link: "/infrastructure/index.md",
                    },
                    {
                        text: "GPU Compute Cluster",
                        link: "/infrastructure/hardware.md",
                    },
                    {
                        text: "Inference Software Stack",
                        link: "/infrastructure/software.md",
                    },
                    {
                        text: "Models & APIs",
                        link: "/infrastructure/models.md",
                    },
                ],
            },
            {
                text: "Team",
                link: "/team",
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/dcc-bs" }],
    },
    vite: {
        plugins: [
            llmstxt(),
            ui({
                autoImport: {
                    dts: "../.vitepress/auto-imports.d.ts",
                },
                components: {
                    dts: "../.vitepress/components.d.ts",
                },
                router: false,
                scanPackages: ["@dcc-bs/common-ui.bs.js/components"],
            }),
            tailwindcss(),
            VueI18nPlugin({
                include: path.resolve(__dirname, "i18n/**"),
                ssr: true,
            }) as Plugin,
        ],
        resolve: {
            alias: {
                "#imports": path.resolve(
                    path.dirname(fileURLToPath(import.meta.url)),
                    "shims/nuxt-imports.ts",
                ),
                "#app": path.resolve(
                    path.dirname(fileURLToPath(import.meta.url)),
                    "shims/nuxt-imports.ts",
                ),
            },
        },
        ssr: {
            noExternal: ["@nuxt/ui", "@dcc-bs/common-ui.bs.js"],
        },
    },
    lastUpdated: true,
});
