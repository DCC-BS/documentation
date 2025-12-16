import llmstxt from "vitepress-plugin-llms";
import { withMermaid } from "vitepress-plugin-mermaid";
import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

// https://vitepress.dev/reference/site-config
export default withMermaid({
    srcDir: "markdown",
    base: process.env.NODE_ENV === "production" ? "/documentation/" : "/",
    title: "DCC Dev Guidelines",
    description: "Guidelines for the DCC Developers",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: "imgs/logo.png",
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
                items: [{ text: "Docker", link: "/docker" }],
            },
            {
                text: "Coding",
                items: [
                    { text: "Coding", link: "/general" },
                    { text: "Python", link: "/python" },
                    { text: "Nuxt / Vue", link: "/nuxt" },
                ],
            },
            {
                text: "Git / GitHub / CI/CD",
                items: [{ text: "Git / GitHub / CI/CD", link: "/git" }],
            },
            {
                text: "User Interfaces",
                items: [
                    {
                        text: "Disclaimer",
                        link: "/user-interface/disclaimer.md",
                    },
                    {
                        text: "Data Bs Banner",
                        link: "/user-interface/databsbanner.md",
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
                text: "Team",
                items: [{ text: "Team", link: "/team" }],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/dcc-bs" }],
    },
    vite: {
        plugins: [
            llmstxt(),
            ui({
                autoImport: {
                    dts: "../auto-imports.d.ts",
                },
                components: {
                    dts: "../components.d.ts",
                },
            }),
            tailwindcss(),
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
