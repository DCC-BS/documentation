// Stub for @nuxt/ui composables to prevent import errors in VitePress
// These are minimal implementations that prevent build errors but don't provide actual functionality

export interface Toast {
    id?: string | number;
    title?: string;
    description?: string;
    icon?: string;
    avatar?: { src: string; alt?: string };
    closeButton?: { icon?: string; color?: string; variant?: string };
    color?: string;
    timeout?: number;
    callback?: () => void;
}

export function useToast() {
    return {
        add: (toast: Toast) => {
            console.warn('Toast functionality not available in VitePress build:', toast);
        },
        remove: (id: string | number) => {
            console.warn('Toast remove not available in VitePress build:', id);
        },
        clear: () => {
            console.warn('Toast clear not available in VitePress build');
        }
    };
}

export const toastMaxInjectionKey = Symbol('toastMax');
