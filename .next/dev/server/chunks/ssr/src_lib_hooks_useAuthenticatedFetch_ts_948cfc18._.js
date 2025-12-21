module.exports = [
"[project]/src/lib/hooks/useAuthenticatedFetch.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/config.ts [app-ssr] (ecmascript)");
;
;
function useAuthenticatedFetch() {
    const authenticatedFetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (url, options = {})=>{
        const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
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
    }, []);
    return {
        authenticatedFetch
    };
}
async function getIdToken() {
    const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
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
}),
];

//# sourceMappingURL=src_lib_hooks_useAuthenticatedFetch_ts_948cfc18._.js.map