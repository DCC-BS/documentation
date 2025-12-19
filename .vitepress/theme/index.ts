import "./main.css";

import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { createI18n } from "vue-i18n";
import en from "../../i18n/en.json";
import Layout from "./Layout.vue";
import ui from '@nuxt/ui/vue-plugin'

const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: { en },
})

export default {
    extends: DefaultTheme,
    Layout,
    async enhanceApp({ app }) {
        app.use(i18n);
        app.use(ui);
    },
} as Theme;
