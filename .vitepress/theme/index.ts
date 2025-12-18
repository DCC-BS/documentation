import "./main.css";

import ui from "@nuxt/ui/vue-plugin";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { createI18n } from "vue-i18n";
import en from "../../i18n/en.json";
import Layout from "./Layout.vue";

export default {
    extends: DefaultTheme,
    Layout,
    async enhanceApp({ app }) {
        app.use(ui);
        app.use(
            createI18n({
                locale: "en",
                messages: {
                    en: en,
                },
            }),
        );
    },
} as Theme;
