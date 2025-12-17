/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import type { Head } from "@unhead/vue";
import { type App, computed, type Ref, ref } from "vue";

/**
 * Shim for Nuxt's useState composable
 * In VitePress context, we use a simple ref instead of server-side state
 */
export function useState<T>(key: string, init?: () => T): Ref<T> {
    // In a non-Nuxt environment, we just use a regular ref
    // This won't persist across SSR/client hydration like in Nuxt, but works for VitePress
    if (typeof window === "undefined") {
        // SSR: create a new ref
        return ref(init ? init() : undefined) as Ref<T>;
    }

    // Client-side: try to reuse state if available
    const state = (window as any).__NUXT_STATE__ || {};

    if (!(key in state)) {
        state[key] = init ? init() : undefined;
        (window as any).__NUXT_STATE__ = state;
    }

    return ref(state[key]) as Ref<T>;
}

/**
 * Shim for Nuxt's useRuntimeConfig
 */
export function useRuntimeConfig() {
    return {
        public: {},
        app: {},
    };
}

/**
 * Shim for Nuxt's useAppConfig
 */
export function useAppConfig() {
    return {
        ui: {
            primary: "green",
            gray: "cool",
            colors: [
                "red",
                "orange",
                "amber",
                "yellow",
                "lime",
                "green",
                "emerald",
                "teal",
                "cyan",
                "sky",
                "blue",
                "indigo",
                "violet",
                "purple",
                "fuchsia",
                "pink",
                "rose",
                "primary",
            ],
        },
    };
}

/**
 * Shim for Nuxt's navigateTo
 */
export function navigateTo(to: string) {
    if (typeof window !== "undefined") {
        window.location.href = to;
    }
}

/**
 * Shim for Nuxt's useRouter
 */
export function useRouter() {
    return {
        push: navigateTo,
        replace: navigateTo,
        currentRoute: computed(() => ({
            path:
                typeof window !== "undefined" ? window.location.pathname : "/",
            fullPath:
                typeof window !== "undefined" ? window.location.href : "/",
        })),
    };
}

/**
 * Shim for Nuxt's useRoute
 */
export function useRoute() {
    return computed(() => ({
        path: typeof window !== "undefined" ? window.location.pathname : "/",
        fullPath: typeof window !== "undefined" ? window.location.href : "/",
        hash: typeof window !== "undefined" ? window.location.hash : "",
        query: {},
        params: {},
        name: undefined,
        meta: {},
    }));
}

/**
 * Shim for Nuxt's useNuxtApp
 */
let _nuxtApp: any = null;

export function useNuxtApp() {
    if (!_nuxtApp) {
        _nuxtApp = {
            vueApp: null as App | null,
            provide: (name: string, value: any) => {
                if (_nuxtApp.vueApp) {
                    _nuxtApp.vueApp.provide(name, value);
                }
            },
            hook: () => {},
            hooks: {
                hookOnce: () => {},
                hook: () => {},
                callHook: () => Promise.resolve(),
            },
            payload: {
                data: {},
                state: {},
            },
        };
    }
    return _nuxtApp;
}

/**
 * Shim for Nuxt's defineNuxtPlugin
 */
export function defineNuxtPlugin(plugin: any) {
    // In VitePress, we just return the plugin setup function
    return plugin;
}

/**
 * Shim for Nuxt's useHead
 */
export function useHead(_: any) {
    // In VitePress, head management is done differently
    // This is a no-op shim
    return {};
}

/**
 * Shim for Nuxt's useColorMode
 */
export function useColorMode() {
    const preference = ref<"light" | "dark" | "system">("system");
    const value = ref<"light" | "dark">("light");

    if (typeof window !== "undefined") {
        // Check for saved preference or system preference
        const stored = localStorage.getItem("vueuse-color-scheme");
        if (stored) {
            preference.value = stored as any;
        }

        // Detect system preference
        const isDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        value.value = isDark ? "dark" : "light";

        // Watch for changes
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
                value.value = e.matches ? "dark" : "light";
            });
    }

    return {
        preference,
        value,
        unknown: ref(false),
        forced: ref(false),
    };
}

/**
 * Shim for Nuxt's useLocale
 */
export function useLocale() {
    return ref(typeof navigator !== "undefined" ? navigator.language : "en-US");
}

/**
 * Shim for Nuxt's useCookie
 */
export function useCookie<T>(name: string, _?: any): Ref<T | null> {
    const value = ref<T | null>(null);

    if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
            const [key, val] = cookie.trim().split("=");
            if (key === name) {
                try {
                    value.value = JSON.parse(decodeURIComponent(val));
                } catch {
                    value.value = decodeURIComponent(val) as T;
                }
                break;
            }
        }
    }

    return value;
}

/**
 * Shim for Nuxt's defineShortcuts
 */
export function defineShortcuts(shortcuts: any) {
    // No-op for VitePress
    return shortcuts;
}

/**
 * Shim for Nuxt's useRuntimeHook
 */
export function useRuntimeHook(
    name: string,
    callback: (...args: any[]) => any,
) {
    // No-op for VitePress
    return () => {};
}

/**
 * Shim for Nuxt's clearError
 */
export function clearError(options?: any) {
    // No-op for VitePress
}
