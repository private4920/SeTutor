(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/hooks/useAuthenticatedFetch.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAuthHeaders",
    ()=>createAuthHeaders,
    "getIdToken",
    ()=>getIdToken,
    "useAuthenticatedFetch",
    ()=>useAuthenticatedFetch
]);
/**
 * Hook for making authenticated API requests with Firebase JWT tokens
 * 
 * This hook provides a fetch wrapper that automatically includes the
 * Firebase ID token in the Authorization header for secure API calls.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/config.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useAuthenticatedFetch() {
    _s();
    const authenticatedFetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAuthenticatedFetch.useCallback[authenticatedFetch]": async (url, options = {})=>{
            const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('User is not authenticated');
            }
            // Get fresh ID token (Firebase handles caching and refresh)
            const idToken = await currentUser.getIdToken();
            // Merge headers with Authorization
            const headers = new Headers(options.headers);
            headers.set('Authorization', `Bearer ${idToken}`);
            return fetch(url, {
                ...options,
                headers
            });
        }
    }["useAuthenticatedFetch.useCallback[authenticatedFetch]"], []);
    return {
        authenticatedFetch
    };
}
_s(useAuthenticatedFetch, "gBfVDWCGyLEiybEdSbfnuLUMxYA=");
async function getIdToken() {
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
    const currentUser = auth.currentUser;
    if (!currentUser) {
        return null;
    }
    return currentUser.getIdToken();
}
async function createAuthHeaders(additionalHeaders) {
    const headers = new Headers(additionalHeaders);
    const token = await getIdToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_hooks_useAuthenticatedFetch_ts_2ae01f27._.js.map