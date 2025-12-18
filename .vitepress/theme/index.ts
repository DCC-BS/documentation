import ui from "@nuxt/ui/vue-plugin";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { createI18n } from "vue-i18n";
import Layout from "./Layout.vue";
import en from "../../i18n/en.json";

// Import custom CSS AFTER DefaultTheme to ensure proper cascade order
import "@dcc-bs/common-ui.bs.js/runtime/assets/kantonbs/colors.css";
import "./main.css";
// import "@nuxt/ui/runtime/index.css";

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
                    de: {
                        welcome: "Willkommen zur DCC Dokumentation",
                    },
                },
            }),
        );
    },
} as Theme;
