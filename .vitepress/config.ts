import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import llmstxt from "vitepress-plugin-llms";
import { withMermaid } from "vitepress-plugin-mermaid";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"
import type { Plugin } from "vitepress";

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
            copyright: "Copyright © 2025 DCC",
        },

        search: {
            provider: "local",
        },

        sidebar: [
            {
                text: "Dev Setup",
                items: [{ text: "Dev Setup", link: "/dev-setup" }],
            },
            {
                text: "Docker",
                link: "/docker/index.md",
            },
            {
                text: "Coding",
                link: "/coding/index.md",
                items: [
                    { text: "Python", link: "/coding/python" },
                    { text: "Nuxt / Vue", link: "/coding/nuxt" },
                ],
            },
            {
                text: "Git / GitHub / CI/CD",
                link: "/git",
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
                        ],
                    },
                    {
                        text: "Components",
                        link: "/user-interface/components/index.md",
                        items: [
                            {
                                text: "Changelogs",
                                link: "/user-interface/components/changelogs.md",
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
                                text: "Navigation Bar",
                                link: "/user-interface/components/navigationbar.md",
                            },
                            {
                                text: "Online Status",
                                link: "/user-interface/components/onlinestatus.md",
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
                                text: "Undo Redo Buttons",
                                link: "/user-interface/components/undoredobuttons.md",
                            },
                        ],
                    },
                ],
            },
            {
                text: "Backend Commond Code",
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
                        text: "Kubernetes Probes",
                        link: "/backend-common/probes.md",
                    },
                    {
                        text: "LLM Interaction",
                        link: "/backend-common/llm.md",
                    }
                ],
            },
            {
                text: "How Tos",
                items: [
                    {
                        text: "How to write changelogs",
                        link: "howto/changelogs",
                    },
                    {
                        text: "How to Encrypt Environment Files",
                        link: "howto/encrypt-env-files",
                    }
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
                scanPackages: ['@dcc-bs/common-ui.bs.js/components']
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
            },
        },
        ssr: {
            noExternal: ["@nuxt/ui", "@dcc-bs/common-ui.bs.js"],
        },
    },
    lastUpdated: true,
});
