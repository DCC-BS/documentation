import { type Ref, ref, watch } from "vue";

export interface UseCookieOptions {
    /**
     * Fallback value (and type) used when the cookie is absent.
     */
    default?: unknown;
    /**
     * Lifetime in seconds. Takes precedence over `expires`.
     */
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
}

function escapeName(name: string): string {
    return name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1");
}

function readCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${escapeName(name)}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(
    name: string,
    value: string,
    options: UseCookieOptions,
): void {
    if (typeof document === "undefined") return;
    const parts = [`${name}=${encodeURIComponent(value)}`];
    if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
    if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
    parts.push(`Path=${options.path ?? "/"}`);
    if (options.domain) parts.push(`Domain=${options.domain}`);
    if (options.secure) parts.push("Secure");
    if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
    document.cookie = parts.join("; ");
}

function serialize(value: unknown): string {
    return typeof value === "string" ? value : JSON.stringify(value);
}

function deserialize(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

/**
 * Read and write a browser cookie through a reactive `Ref`.
 *
 * Assigning to `.value` persists the cookie, setting it to `null`/`undefined`
 * deletes it. Strings are stored verbatim, everything else is JSON-encoded.
 *
 * @example
 * const version = useCookie<string | undefined>("disclaimerAccepted");
 * version.value; // read
 * version.value = "1.0.0"; // write
 */
export function useCookie<T>(
    name: string,
    options: UseCookieOptions = {},
): Ref<T> {
    const read = (): T => {
        const raw = readCookie(name);
        if (raw === null) {
            return (options.default ?? null) as unknown as T;
        }
        return deserialize(raw) as unknown as T;
    };

    const cookie = ref(read()) as Ref<T>;

    watch(
        cookie,
        (value) => {
            if (value == null) {
                writeCookie(name, "", {
                    ...options,
                    maxAge: 0,
                    expires: undefined,
                });
                return;
            }
            writeCookie(name, serialize(value), options);
        },
        { flush: "post" },
    );

    return cookie;
}
