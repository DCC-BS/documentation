import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import ui from "@nuxt/ui/vue-plugin";
import { createI18n } from "vue-i18n";

// Import custom CSS AFTER DefaultTheme to ensure proper cascade order
import "@dcc-bs/common-ui.bs.js/runtime/assets/kantonbs/colors.css";
import "./main.css";
// import "@nuxt/ui/runtime/index.css";

export default {
    extends: DefaultTheme,
    Layout,
    async enhanceApp({ app }) {
        app.use(ui);
        app.use(createI18n({}));
    },
} as Theme;
