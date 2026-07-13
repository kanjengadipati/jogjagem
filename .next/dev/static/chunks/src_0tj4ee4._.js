(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ai",
    ()=>ai,
    "auth",
    ()=>auth,
    "destinations",
    ()=>destinations
]);
const API_BASE = '/api/pleco';
let accessToken = null;
if ("TURBOPACK compile-time truthy", 1) {
    accessToken = localStorage.getItem('pleco_access_token');
}
function setAccessToken(token) {
    accessToken = token;
    if (token) {
        localStorage.setItem('pleco_access_token', token);
    } else {
        localStorage.removeItem('pleco_access_token');
    }
}
function getAccessToken() {
    return accessToken;
}
async function request(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers || {}
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include'
    });
    const json = await res.json();
    if (res.status === 401 && path !== '/auth/refresh') {
        const refreshed = await tryRefresh();
        if (refreshed) {
            return request(path, options);
        }
        setAccessToken(null);
    }
    return json;
}
async function tryRefresh() {
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!res.ok) return false;
        const json = await res.json();
        if (json.status === 'success' && json.data) {
            setAccessToken(json.data.access_token);
            return true;
        }
        return false;
    } catch  {
        return false;
    }
}
const auth = {
    async register (name, email, password) {
        return request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password
            })
        });
    },
    async login (email, password) {
        const res = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });
        if (res.status === 'success' && res.data) {
            setAccessToken(res.data.access_token);
        }
        return res;
    },
    async getProfile () {
        return request('/auth/profile');
    },
    async updateProfile (name) {
        return request('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify({
                name
            })
        });
    },
    async logout () {
        const res = await request('/auth/logout', {
            method: 'POST'
        });
        setAccessToken(null);
        return res;
    },
    async refreshToken () {
        return tryRefresh();
    },
    isLoggedIn () {
        return !!accessToken;
    },
    getAccessToken
};
const destinations = {
    async getAll () {
        return request('/destinations');
    },
    async getById (id) {
        return request(`/destinations/${id}`);
    },
    async search (query) {
        return request(`/destinations/search?q=${encodeURIComponent(query)}`);
    },
    async getByCategory (category) {
        return request(`/destinations/category/${encodeURIComponent(category)}`);
    }
};
const ai = {
    async query (queryText, history = []) {
        return request('/ai/query', {
            method: 'POST',
            body: JSON.stringify({
                query: queryText,
                history
            })
        });
    },
    async imageSearch (image, mimeType) {
        return request('/ai/image-search', {
            method: 'POST',
            body: JSON.stringify({
                image,
                mimeType
            })
        });
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        isAuthenticated: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].isLoggedIn(),
        isLoading: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].isLoggedIn(),
        user: null
    });
    const refreshProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[refreshProfile]": async ()=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].isLoggedIn()) {
                setState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null
                });
                return;
            }
            try {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].getProfile();
                if (res.status === 'success' && res.data) {
                    setState({
                        isAuthenticated: true,
                        isLoading: false,
                        user: res.data
                    });
                } else {
                    setState({
                        isAuthenticated: false,
                        isLoading: false,
                        user: null
                    });
                }
            } catch  {
                setState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null
                });
            }
        }
    }["AuthProvider.useCallback[refreshProfile]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            refreshProfile();
        }
    }["AuthProvider.useEffect"], [
        refreshProfile
    ]);
    const login = async (email, password)=>{
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].login(email, password);
            if (res.status === 'success') {
                await refreshProfile();
                return {
                    success: true
                };
            }
            return {
                success: false,
                error: res.message || 'Login failed'
            };
        } catch (err) {
            return {
                success: false,
                error: err.message || 'Network error'
            };
        }
    };
    const register = async (name, email, password)=>{
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].register(name, email, password);
            if (res.status === 'success') {
                return {
                    success: true
                };
            }
            return {
                success: false,
                error: res.message || 'Registration failed'
            };
        } catch (err) {
            return {
                success: false,
                error: err.message || 'Network error'
            };
        }
    };
    const logout = async ()=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].logout();
        setState({
            isAuthenticated: false,
            isLoading: false,
            user: null
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            ...state,
            login,
            register,
            logout,
            refreshProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "22c3ctljCHGc3QrDuR/hrUyeZsc=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/AuthModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
    _s();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultMode);
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const { login, register } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    if (!isOpen) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        if (mode === 'register') {
            const result = await register(name, email, password);
            if (result.success) {
                setSuccess('Account created! You can now log in.');
                setMode('login');
                setPassword('');
            } else {
                setError(result.error || 'Registration failed');
            }
        } else {
            const result = await login(email, password);
            if (result.success) {
                onClose();
                resetForm();
            } else {
                setError(result.error || 'Login failed');
            }
        }
        setLoading(false);
    };
    const resetForm = ()=>{
        setName('');
        setEmail('');
        setPassword('');
        setError('');
        setSuccess('');
    };
    const toggleMode = ()=>{
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
        setSuccess('');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl border border-gold-100 overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-1.5 bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400"
                }, void 0, false, {
                    fileName: "[project]/src/components/AuthModal.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                onClose();
                                resetForm();
                            },
                            className: "absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AuthModal.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/AuthModal.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inline-flex items-center justify-center h-12 w-12 rounded-full bg-royal-950 text-gold-400 mb-3",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-manrope font-bold text-lg",
                                        children: "Ψ"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AuthModal.tsx",
                                        lineNumber: 84,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthModal.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-manrope text-xl font-bold text-royal-950",
                                    children: mode === 'login' ? 'Welcome Back' : 'Create Account'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthModal.tsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-stone-500 mt-1",
                                    children: mode === 'login' ? 'Sign in to access your saved destinations and trip plans' : 'Join Explore Jogja to bookmark and plan your trips'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthModal.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/AuthModal.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/components/AuthModal.tsx",
                            lineNumber: 98,
                            columnNumber: 13
                        }, this),
                        success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium",
                            children: success
                        }, void 0, false, {
                            fileName: "[project]/src/components/AuthModal.tsx",
                            lineNumber: 103,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "space-y-4",
                            children: [
                                mode === 'register' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                            className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 112,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "Full name",
                                            required: true,
                                            value: name,
                                            onChange: (e)=>setName(e.target.value),
                                            className: "w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-royal-950 placeholder-stone-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 113,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/AuthModal.tsx",
                                    lineNumber: 111,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                            className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 125,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "email",
                                            placeholder: "Email address",
                                            required: true,
                                            value: email,
                                            onChange: (e)=>setEmail(e.target.value),
                                            className: "w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-royal-950 placeholder-stone-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 126,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/AuthModal.tsx",
                                    lineNumber: 124,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                            className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "password",
                                            placeholder: "Password",
                                            required: true,
                                            minLength: 8,
                                            value: password,
                                            onChange: (e)=>setPassword(e.target.value),
                                            className: "w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-royal-950 placeholder-stone-400 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 138,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/AuthModal.tsx",
                                    lineNumber: 136,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: loading,
                                    className: "w-full rounded-xl bg-royal-950 py-3 text-sm font-semibold text-gold-300 hover:bg-royal-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2",
                                    children: [
                                        loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "h-4 w-4 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 154,
                                            columnNumber: 27
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: mode === 'login' ? 'Sign In' : 'Create Account'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 155,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/AuthModal.tsx",
                                    lineNumber: 149,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/AuthModal.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-5 text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleMode,
                                className: "text-xs text-stone-500 hover:text-gold-700 transition-colors",
                                children: mode === 'login' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        "Don't have an account? ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold text-gold-700",
                                            children: "Sign up"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 166,
                                            columnNumber: 42
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        "Already have an account? ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold text-gold-700",
                                            children: "Sign in"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthModal.tsx",
                                            lineNumber: 168,
                                            columnNumber: 44
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/src/components/AuthModal.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/AuthModal.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/AuthModal.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/AuthModal.tsx",
            lineNumber: 68,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/AuthModal.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
_s(AuthModal, "HD5dxAO9I5bH7YgCITHKJWe8SBI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = AuthModal;
var _c;
__turbopack_context__.k.register(_c, "AuthModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.js [app-client] (ecmascript) <export default as Compass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brain.js [app-client] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-in.js [app-client] (ecmascript) <export default as LogIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/AuthModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function Header({ activeTab, setActiveTab, savedCount, isOverHero = false }) {
    _s();
    const [mobileMenuOpen, setMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [authModalOpen, setAuthModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [authModalMode, setAuthModalMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('login');
    const { isAuthenticated, user, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const navItems = [
        {
            id: 'discover',
            label: 'Explore',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"]
        },
        {
            id: 'events',
            label: 'Events',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"]
        },
        {
            id: 'experiences',
            label: 'Experiences',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"]
        },
        {
            id: 'planner',
            label: 'Trip Planner',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"]
        },
        {
            id: 'ai-assistant',
            label: 'AI Assistant',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"]
        },
        {
            id: 'map',
            label: 'Interactive Map',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"]
        }
    ];
    const headerClass = isOverHero ? "absolute top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-transparent border-transparent text-white" : "sticky top-0 z-50 w-full transition-all duration-300 bg-royal-950 border-b border-royal-900 text-white shadow-md";
    const openLogin = ()=>{
        setAuthModalMode('login');
        setAuthModalOpen(true);
    };
    const openRegister = ()=>{
        setAuthModalMode('register');
        setAuthModalOpen(true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                id: "main-app-header",
                className: headerClass,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                id: "brand-logo-container",
                                className: "flex cursor-pointer items-center space-x-2.5 group",
                                onClick: ()=>setActiveTab('discover'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gold-400 transition-transform duration-300 group-hover:scale-105",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "h-7 w-7",
                                            viewBox: "0 0 24 24",
                                            fill: "currentColor",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M12 2a1 1 0 0 1 1 1v6.17a4.002 4.002 0 0 1 3.5 3.83 1 1 0 1 1-2 0 2 2 0 0 0-4 0 1 1 0 1 1-2 0 4.002 4.002 0 0 1 3.5-3.83V3a1 1 0 0 1 1-1zm0 13a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Header.tsx",
                                                    lineNumber: 48,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M6 5a1 1 0 0 1 1 1v2a5 5 0 0 0 10 0V6a1 1 0 1 1 2 0v2a7 7 0 0 1-14 0V6a1 1 0 0 1 1-1z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Header.tsx",
                                                    lineNumber: 49,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 47,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col -space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-sans text-[9px] uppercase tracking-[0.08em] text-gold-300/90 font-semibold",
                                                children: "EXPLORE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 53,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-manrope text-base font-bold tracking-widest text-white",
                                                children: "JOGJA"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 54,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 52,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Header.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                id: "desktop-navbar",
                                className: "hidden md:flex items-center space-x-6 lg:space-x-8",
                                children: [
                                    navItems.filter((item)=>item.id !== 'map').map((item)=>{
                                        const isActive = activeTab === item.id || item.id === 'events' && activeTab === 'discover-events' || item.id === 'experiences' && activeTab === 'discover-experiences';
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            id: `nav-link-${item.id}`,
                                            onClick: ()=>setActiveTab(item.id),
                                            className: `text-sm font-medium tracking-wide transition-all duration-300 border-b-2 py-1 ${isActive ? 'border-gold-400 text-gold-300 font-semibold' : 'border-transparent text-white/80 hover:text-white hover:border-white/30'}`,
                                            children: item.label
                                        }, item.id, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 66,
                                            columnNumber: 17
                                        }, this);
                                    }),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('map'),
                                        className: `text-sm font-medium tracking-wide transition-all duration-300 border-b-2 py-1 ${activeTab === 'map' ? 'border-gold-400 text-gold-300 font-semibold' : 'border-transparent text-white/80 hover:text-white hover:border-white/30'}`,
                                        children: "Interactive Map"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 81,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Header.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden md:flex items-center space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        id: "desktop-saved-icon-btn",
                                        onClick: ()=>setActiveTab('saved'),
                                        className: "relative p-1.5 rounded-full hover:bg-white/10 transition-colors text-white",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                className: `h-5 w-5 ${savedCount > 0 ? 'fill-gold-400 text-gold-400 animate-pulse' : ''}`
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 100,
                                                columnNumber: 15
                                            }, this),
                                            savedCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white",
                                                children: savedCount
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 102,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-1.5 rounded-full hover:bg-white/10 transition-colors text-white relative",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                                className: "h-5 w-5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 109,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute top-1 right-1 h-2 w-2 rounded-full bg-gold-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 110,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 108,
                                        columnNumber: 13
                                    }, this),
                                    isAuthenticated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                        className: "h-4 w-4 text-gold-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Header.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-medium text-white/90 max-w-[100px] truncate",
                                                        children: user?.name || 'User'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Header.tsx",
                                                        lineNumber: 118,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 116,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: logout,
                                                className: "p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white",
                                                title: "Logout",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Header.tsx",
                                                    lineNumber: 127,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 122,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: openLogin,
                                                className: "flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-colors text-xs font-medium",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Header.tsx",
                                                        lineNumber: 136,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Sign In"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Header.tsx",
                                                        lineNumber: 137,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 132,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: openRegister,
                                                className: "px-3 py-1.5 rounded-full bg-gold-600 text-white hover:bg-gold-500 transition-colors text-xs font-semibold",
                                                children: "Sign Up"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 139,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 131,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('map'),
                                        className: "p-1.5 rounded-full hover:bg-white/10 transition-colors text-white",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 152,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Header.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex md:hidden items-center space-x-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('saved'),
                                        className: "relative p-2 rounded-full text-white hover:bg-white/10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                className: `h-5 w-5 ${savedCount > 0 ? 'fill-gold-400 text-gold-400' : ''}`
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 162,
                                                columnNumber: 15
                                            }, this),
                                            savedCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white",
                                                children: savedCount
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 164,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 158,
                                        columnNumber: 13
                                    }, this),
                                    isAuthenticated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: logout,
                                        className: "p-2 rounded-full text-white/70 hover:bg-white/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 175,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: openLogin,
                                        className: "p-2 rounded-full text-gold-400 hover:bg-white/10",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 182,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 178,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        id: "mobile-menu-toggle",
                                        onClick: ()=>setMobileMenuOpen(!mobileMenuOpen),
                                        className: "rounded-full p-2 text-white hover:bg-white/10 focus:outline-none",
                                        children: mobileMenuOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "h-6 w-6"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 191,
                                            columnNumber: 33
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                            className: "h-6 w-6"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 191,
                                            columnNumber: 61
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 186,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Header.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Header.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    mobileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "mobile-navigation-panel",
                        className: "md:hidden border-t border-royal-900 bg-royal-950/95 backdrop-blur-lg animate-fade-in",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-1 px-3 py-4",
                            children: [
                                navItems.map((item)=>{
                                    const isActive = activeTab === item.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        id: `mobile-nav-link-${item.id}`,
                                        onClick: ()=>{
                                            setActiveTab(item.id);
                                            setMobileMenuOpen(false);
                                        },
                                        className: `flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 ${isActive ? 'bg-gold-800 text-gold-50' : 'text-white/80 hover:bg-white/5 hover:text-white'}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 217,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 216,
                                            columnNumber: 21
                                        }, this)
                                    }, item.id, false, {
                                        fileName: "[project]/src/components/Header.tsx",
                                        lineNumber: 203,
                                        columnNumber: 19
                                    }, this);
                                }),
                                !isAuthenticated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pt-2 border-t border-royal-900 mt-2 space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                openLogin();
                                                setMobileMenuOpen(false);
                                            },
                                            className: "w-full flex items-center justify-center space-x-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Header.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Sign In"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Header.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 226,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                openRegister();
                                                setMobileMenuOpen(false);
                                            },
                                            className: "w-full flex items-center justify-center space-x-2 rounded-xl bg-gold-600 px-4 py-3 text-sm font-semibold text-white hover:bg-gold-500",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Sign Up"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Header.tsx",
                                                lineNumber: 237,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Header.tsx",
                                            lineNumber: 233,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Header.tsx",
                                    lineNumber: 225,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Header.tsx",
                            lineNumber: 199,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Header.tsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Header.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: authModalOpen,
                onClose: ()=>setAuthModalOpen(false),
                defaultMode: authModalMode
            }, void 0, false, {
                fileName: "[project]/src/components/Header.tsx",
                lineNumber: 246,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Header, "z0L2xEqiIVR7bRwvuylei2L5I+E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CATEGORIES",
    ()=>CATEGORIES,
    "DESTINATIONS",
    ()=>DESTINATIONS,
    "FESTIVALS",
    ()=>FESTIVALS,
    "JOGJA_QUOTES",
    ()=>JOGJA_QUOTES,
    "SUB_REGIONS",
    ()=>SUB_REGIONS
]);
const CATEGORIES = [
    {
        id: 'hidden-gem',
        name: 'Hidden Gems',
        icon: 'Sparkles',
        description: 'Unexplored, pristine secret wonders'
    },
    {
        id: 'nature',
        name: 'Nature Escapes',
        icon: 'Leaf',
        description: 'Verdant forests, mountains, and parks'
    },
    {
        id: 'culinary',
        name: 'Culinary Legends',
        icon: 'Utensils',
        description: 'Rich sweet-savory traditional tastes'
    },
    {
        id: 'heritage',
        name: 'Heritage & Culture',
        icon: 'Castle',
        description: 'Ancient empires and royal palaces'
    },
    {
        id: 'adventure',
        name: 'Adventure',
        icon: 'Compass',
        description: 'Thrilling volcanic offroads and caves'
    },
    {
        id: 'beach',
        name: 'Beaches & Sunsets',
        icon: 'Sun',
        description: 'Vast golden sand cliffside coastlines'
    },
    {
        id: 'family',
        name: 'Family Friendly',
        icon: 'Users',
        description: 'Amusements and cultural experiences'
    },
    {
        id: 'weekend',
        name: 'Weekend Ideas',
        icon: 'CalendarDays',
        description: 'Short-trip custom curated escapes'
    }
];
const SUB_REGIONS = [
    {
        id: 'yogyakarta',
        name: 'Yogyakarta City',
        description: 'The cultural heart of the Sultanate'
    },
    {
        id: 'sleman',
        name: 'Sleman',
        description: 'The majestic highlands of Mount Merapi'
    },
    {
        id: 'bantul',
        name: 'Bantul',
        description: 'Dramatic southern beaches and pine forests'
    },
    {
        id: 'kulonprogo',
        name: 'Kulon Progo',
        description: 'Breathtaking hills, waterfalls, and tea plantations'
    },
    {
        id: 'gunungkidul',
        name: 'Gunungkidul',
        description: 'Rugged limestone cliffs, caves, and pristine white-sand beaches'
    }
];
// Reusable mock reviews
const MOCK_REVIEWS = [
    {
        id: 'r1',
        userName: 'Sophia Laurent',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
        rating: 5,
        date: '2026-06-15',
        comment: 'An absolutely magical experience. The atmosphere felt like stepping back in time. The Javanese hospitality was unparalleled.'
    },
    {
        id: 'r2',
        userName: 'Yuki Tanaka',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
        rating: 4.8,
        date: '2026-07-02',
        comment: 'Watching the sunset over these structures is a lifetime memory. Highly recommend hiring a local certified guide!'
    },
    {
        id: 'r3',
        userName: 'Budi Santoso',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
        rating: 5,
        date: '2026-07-10',
        comment: 'The architectural precision is stunning. Must visit the nearby local cafes afterwards for traditional kopi klotok!'
    }
];
const DESTINATIONS = [
    {
        id: 'prambanan',
        name: 'Prambanan Temple',
        tagline: 'The Pinnacle of Royal Hindu Architecture',
        category: 'heritage',
        location: 'Sleman, Yogyakarta',
        subRegion: 'Sleman',
        images: [
            'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=1200',
            'https://images.unsplash.com/photo-1626847037657-fd3622613ce3?q=80&w=1200',
            'https://images.unsplash.com/photo-1601999109332-542b18dbec57?q=80&w=1200'
        ],
        rating: 4.8,
        reviewCount: 3840,
        description: 'Built in the 9th century, Prambanan is the largest Hindu temple compound in Indonesia, dedicated to the Trimurti: the Creator (Brahma), the Preserver (Vishnu), and the Destroyer (Shiva). The towering spires reach 47 meters high, dominating the surrounding plains.',
        story: 'Legend tells of Roro Jonggrang, a beautiful princess who demanded Prince Bandung Bondowoso build 1,000 temples in a single night to win her hand. With the help of spirits, Bandung nearly succeeded, but Roro Jonggrang tricked the roosters into crowing early. Realizing the deception, Bandung cursed her to become the final, 1,000th stone statue—which sits in the Shiva chamber to this day.',
        ticketPrice: 'IDR 375,000 (Foreigners) / IDR 50,000 (Domestic)',
        openingHours: '06:30 AM - 05:00 PM Daily',
        facilities: [
            'Visitor Information Center',
            'Audio Guides',
            'Wheelchair Access',
            'Spacious Parking',
            'Art Souvenir Arcades',
            'Traditional Restaurants',
            'Clean Restrooms'
        ],
        travelTips: [
            'Visit in the late afternoon (around 03:30 PM) to capture the beautiful golden hour light shining through the spires.',
            'Wear modest clothing out of respect for the sacred site. Sarongs are provided at the entrance.',
            'Check out the Ramayana Ballet performance scheduled on open-air stages during dry season nights.'
        ],
        bestTime: 'May to October (Dry Season, ideal for clear sunset backdrops)',
        weather: {
            temp: '28°C',
            condition: 'Sunny',
            status: 'Perfect weather for exploring Prambanan today.'
        },
        latitude: -7.7520,
        longitude: 110.4914,
        reviews: MOCK_REVIEWS,
        partners: [
            {
                id: 'p-p1',
                name: 'The Phoenix Hotel Yogyakarta',
                category: 'hotel',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
                rating: 4.9,
                price: 'IDR 1,500,000 / night',
                distance: '14 km from Prambanan',
                description: 'A luxurious landmark colonial boutique heritage hotel with genuine royal Javanese spa therapies and a grand central courtyard pool.',
                address: 'Jl. Jend. Sudirman No.9, Yogyakarta',
                promotion: '15% Off with Royal Pass',
                phone: '+62 274 566617',
                coordinates: {
                    lat: -7.7828,
                    lng: 110.3671
                }
            },
            {
                id: 'p-p2',
                name: 'Abhayagiri Restaurant',
                category: 'restaurant',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600',
                rating: 4.8,
                price: 'IDR 150,000 - 300,000 / person',
                distance: '3.2 km from Prambanan',
                description: 'Perched high on the hills, this fine-dining restaurant offers breathtaking panoramic sunset views of Prambanan and Mount Merapi.',
                address: 'Samberwatu, Sambirejo, Prambanan',
                promotion: 'Complimentary traditional wedang drink',
                phone: '+62 274 4469277',
                coordinates: {
                    lat: -7.7654,
                    lng: 110.4995
                }
            },
            {
                id: 'p-p3',
                name: 'Suwatu by Mil&Bay',
                category: 'cafe',
                image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600',
                rating: 4.7,
                price: 'IDR 80,000 - 150,000 / person',
                distance: '4.0 km from Prambanan',
                description: 'A bohemian-inspired cliffside sanctuary decorated in premium white Javanese stone, serving artisanal single-origin coffees and local organic delicacies.',
                address: 'Sumberwatu, Sambirejo, Prambanan',
                promotion: 'Free traditional snack package',
                phone: '+62 812-2531-1881',
                coordinates: {
                    lat: -7.7670,
                    lng: 110.5011
                }
            },
            {
                id: 'p-p4',
                name: 'Pak Joko Heritage Guides',
                category: 'guide',
                image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600',
                rating: 4.9,
                price: 'IDR 250,000 / session',
                distance: 'On-Site',
                description: 'Deep historical insights. Pak Joko is a licensed Prambanan expert who translates hidden ancient relief stories from Javanese folklore.',
                address: 'Prambanan Guide Guild, Sleman',
                promotion: 'Free custom souvenir postcard',
                phone: '+62 813-9221-0022',
                coordinates: {
                    lat: -7.7525,
                    lng: 110.4910
                }
            },
            {
                id: 'p-p5',
                name: 'Silver Heritage Craft Center',
                category: 'souvenir',
                image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600',
                rating: 4.6,
                price: 'Varies',
                distance: '1.2 km from Prambanan',
                description: 'Watch local masters handcraft miniature silver Prambanan replicas, Javanese kris daggers, and elegant jewelry.',
                address: 'Jl. Raya Jogja-Solo Km 16, Prambanan',
                promotion: '10% discount on master-carved silver',
                coordinates: {
                    lat: -7.7540,
                    lng: 110.4820
                }
            }
        ],
        faqs: [
            {
                q: 'Is there a dress code?',
                a: 'Yes. Modest wear covering knees and shoulders is recommended. A complimentary traditional sarong sash is available at the entrance gate.'
            },
            {
                q: 'When does the Ramayana Ballet perform?',
                a: 'It performs on Tuesday, Thursday, and Saturday nights in the open-air theater during dry season, and in the indoor theater during rainy months.'
            }
        ]
    },
    {
        id: 'malioboro',
        name: 'Malioboro Street',
        tagline: 'The Soul and Lifeline of Yogyakarta',
        category: 'culinary',
        location: 'Yogyakarta City',
        subRegion: 'Yogyakarta',
        images: [
            'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?q=80&w=1200',
            'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?q=80&w=1200',
            'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=1200'
        ],
        rating: 4.6,
        reviewCount: 9280,
        description: 'The primary shopping street of Yogyakarta, pulsing with energy day and night. Framed by colonial-era storefronts, traditional horse carriages (Andong), motorized three-wheelers (Becak), and street musicians, Malioboro is an unforgettable sensory gateway to local Javanese life.',
        story: 'Malioboro represents the imaginary axis linking Mount Merapi in the north, the Sultan\'s Palace (Kraton) in the center, and the mystical South Sea (Parangtritis) in the south. The name itself is derived from the Sanskrit word "malyabhara," which translates to "crowned with flower garlands," referencing the historical royal procession path.',
        ticketPrice: 'Free Entry',
        openingHours: '24 Hours Daily (Best at evening 06:00 PM - 11:00 PM)',
        facilities: [
            'Pedestrian Benches',
            'Batik Stores',
            'Food Courtyards (Teras Malioboro)',
            'Street Musicians',
            'Trishaw Stands',
            'Historic Buildings',
            'Tourist Police Centers'
        ],
        travelTips: [
            'Take a slow evening walk starting from Tugu Station down to the central post office.',
            'Practice friendly, smiling negotiation when purchasing handmade batik or royal Javanese leather slippers.',
            'Try dining at an authentic open-floor bamboo mat stall (Lesehan) serving traditional Gudeg.'
        ],
        bestTime: 'Every evening after 06:00 PM, when traditional musical groups play gamelans and acoustic sets along the walkways.',
        weather: {
            temp: '27°C',
            condition: 'Clear Evening',
            status: 'Perfect cool breeze for an evening walk in Malioboro.'
        },
        latitude: -7.7928,
        longitude: 110.3658,
        reviews: MOCK_REVIEWS,
        partners: [
            {
                id: 'm-p1',
                name: 'Grand Inna Malioboro Heritage',
                category: 'hotel',
                image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600',
                rating: 4.7,
                price: 'IDR 1,100,000 / night',
                distance: '0 km (Directly on Malioboro)',
                description: 'An iconic historic heritage hotel established in 1908. Elegant colonial luxury blended with prestigious royal hospitality.',
                address: 'Jl. Malioboro No.60, Yogyakarta',
                promotion: 'Free royal high tea for two',
                phone: '+62 274 566353',
                coordinates: {
                    lat: -7.7920,
                    lng: 110.3660
                }
            },
            {
                id: 'm-p2',
                name: 'Gudeg Yu Djum Wijilan 167',
                category: 'restaurant',
                image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600',
                rating: 4.8,
                price: 'IDR 30,000 - 60,000 / person',
                distance: '1.2 km from Malioboro',
                description: 'The supreme culinary legend of Yogyakarta. Sweet-savory young jackfruit, slow-stewed on traditional clay stoves with teak leaves for 24 hours.',
                address: 'Jl. Wijilan No.167, Kraton, Yogyakarta',
                promotion: 'Get 10% off packaging for travel gifts',
                phone: '+62 811-2511-167',
                coordinates: {
                    lat: -7.8045,
                    lng: 110.3645
                }
            },
            {
                id: 'm-p3',
                name: 'Loko Cafe Malioboro',
                category: 'cafe',
                image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600',
                rating: 4.5,
                price: 'IDR 35,000 - 70,000 / person',
                distance: '0.1 km from Malioboro',
                description: 'A vibrant open-air cafe directly adjacent to Tugu Railway Station, featuring live acoustic music and exceptional single-origin Javanese espresso.',
                address: 'Jl. Pasar Kembang No.3, Yogyakarta',
                promotion: '15% Off with train tickets',
                phone: '+62 274 540801',
                coordinates: {
                    lat: -7.7895,
                    lng: 110.3640
                }
            },
            {
                id: 'm-p4',
                name: 'Pasar Beringharjo Batik Market',
                category: 'souvenir',
                image: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?q=80&w=600',
                rating: 4.7,
                price: 'Budget Friendly',
                distance: '0.5 km from Malioboro',
                description: 'The legendary central market established in 1758. Thousands of local stalls selling pure handmade batik fabrics, Javanese sandals, and organic herbal teas.',
                address: 'Jl. Pabringan No.1, Yogyakarta',
                promotion: 'Wholesale prices for handcrafted items',
                coordinates: {
                    lat: -7.7985,
                    lng: 110.3662
                }
            }
        ],
        faqs: [
            {
                q: 'Is Malioboro wheelchair accessible?',
                a: 'Yes. The sidewalks are exceptionally wide, paved with flat stone slabs and fitted with tactile guides and modern ramps.'
            },
            {
                q: 'What is the best way to get there?',
                a: 'Arriving by train at Tugu Station places you directly at the northern tip of Malioboro. Local TransJogja buses also stop frequently.'
            }
        ]
    },
    {
        id: 'parangtritis',
        name: 'Parangtritis Beach',
        tagline: 'Mystical Golden Sands of the Southern Realm',
        category: 'beach',
        location: 'Bantul, Yogyakarta',
        subRegion: 'Bantul',
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
            'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1200'
        ],
        rating: 4.7,
        reviewCount: 4230,
        description: 'Framed by dramatic black volcanic sands, towering karst cliffs, and roaring waves from the Indian Ocean, Parangtritis is Yogyakarta\'s most legendary beach. At sunset, the wet, reflective shoreline morphs into a giant natural mirror.',
        story: 'Parangtritis is deeply woven with Javanese cosmology. It is believed to be the sacred gateway to the undersea palace of Kanjeng Ratu Kidul, the mystical Queen of the Southern Seas. Out of respect for the Queen, local visitors are strongly advised to avoid wearing bright green clothing.',
        ticketPrice: 'IDR 15,000 / person',
        openingHours: '24 Hours Daily (Sunsets are spectacular from 05:00 PM - 06:15 PM)',
        facilities: [
            'Traditional Chariot Rides',
            'ATV Rentals',
            'Fresh Coconut Stalls',
            'Cliffside Gazebos',
            'Volcanic Sand Dunes (Gumuk Pasir)',
            'Lifeguard Posts',
            'Local Seafood Dining'
        ],
        travelTips: [
            'Rent a horse-drawn carriage (Andong) to gallop along the endless tideline during sunset.',
            'Head to the nearby Gumuk Pasir (sand dunes) for sandboarding, one of the only active sand deserts in Southeast Asia.',
            'Do not swim in the ocean. The undercurrents and rip tides are extremely powerful and hazardous.'
        ],
        bestTime: 'June to August, when sunsets are exceptionally crisp and clear with purple-orange sky bands.',
        weather: {
            temp: '29°C',
            condition: 'Ocean Breeze',
            status: 'Beautiful clear skies over the South Sea today.'
        },
        latitude: -8.0253,
        longitude: 110.3298,
        reviews: MOCK_REVIEWS,
        partners: [
            {
                id: 'pt-p1',
                name: 'Queen of the South Resort',
                category: 'hotel',
                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600',
                rating: 4.8,
                price: 'IDR 1,400,000 / night',
                distance: '1.5 km from beach',
                description: 'Perched high on the cliffs, offering an spectacular infinity pool that merges seamlessly with the roaring Indian Ocean. Elegant wooden Javanese villa bungalows.',
                address: 'Parangrejo, Purwosari, Bantul',
                promotion: 'Includes free cliffside sunset mocktail',
                phone: '+62 274 367136',
                coordinates: {
                    lat: -8.0260,
                    lng: 110.3340
                }
            },
            {
                id: 'pt-p2',
                name: 'Warung Seafood Depok Grill',
                category: 'restaurant',
                image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600',
                rating: 4.6,
                price: 'IDR 80,000 - 150,000 / person',
                distance: '2.0 km from beach',
                description: 'Select your live fish, prawns, and crabs fresh from the local fish auction (TPI) and have them charcoal-grilled with spicy sweet soy sauce (Kecap Manis).',
                address: 'Jl. Depok Beach, Bantul',
                promotion: 'Complimentary local organic sambal tray',
                phone: '+62 821-3344-5566',
                coordinates: {
                    lat: -8.0190,
                    lng: 110.3210
                }
            },
            {
                id: 'pt-p3',
                name: 'Parangtritis ATV & Adventure Rentals',
                category: 'rental',
                image: 'https://images.unsplash.com/photo-1531565637446-32307b194362?q=80&w=600',
                rating: 4.7,
                price: 'IDR 100,000 / 30 mins',
                distance: 'On-Site',
                description: 'Roam the unique coastal black-sand dunes of Parangtritis. Premium and well-maintained quad bikes with expert guides.',
                address: 'Main Beachfront Coast, Bantul',
                promotion: 'Get 20% off when renting 3 or more ATVs',
                phone: '+62 811-9988-7766',
                coordinates: {
                    lat: -8.0250,
                    lng: 110.3290
                }
            }
        ],
        faqs: [
            {
                q: 'Can I swim in the sea?',
                a: 'Strictly prohibited. The southern sea of Java has steep drop-offs and intense rip currents that can pull swimmers out instantly.'
            },
            {
                q: 'Is there sandboarding?',
                a: 'Yes! At the nearby Gumuk Pasir Parangkusumo, you can rent customized boards for IDR 50,000 and slide down the dramatic wind-swept sand dunes.'
            }
        ]
    },
    {
        id: 'merapi',
        name: 'Mount Merapi Lava Tour',
        tagline: 'An Unforgettable Offroad Journey on an Active Volcano',
        category: 'adventure',
        location: 'Sleman, Yogyakarta',
        subRegion: 'Sleman',
        images: [
            'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200',
            'https://images.unsplash.com/photo-1604999333679-b86d54738315?q=80&w=1200',
            'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200'
        ],
        rating: 4.8,
        reviewCount: 5120,
        description: 'Ride inside open-cabin vintage 4x4 Willys Jeeps along the trails left by Mount Merapi\'s historical eruptions. Feel the dramatic chill mountain air as you explore underground bunkers, volcanic relic museums, and giant rock boulders shaped like alien faces.',
        story: 'Mount Merapi (literally translating to "Mountain of Fire") is one of the world\'s most active volcanoes. The local Javanese hold deep reverence for the mountain spirits. Every year, the royal palace of Yogyakarta conducts "Labuhan," a sacred offering ritual on the high slopes to ensure harmony with the earth.',
        ticketPrice: 'IDR 350,000 - IDR 650,000 per Jeep (fits 4 passengers)',
        openingHours: '04:30 AM - 06:00 PM Daily (Sunrise tours leave at 04:30 AM)',
        facilities: [
            'Willys Jeep Guild',
            'Licensed Offroad Drivers',
            'Protective Helmets & Masks',
            'Merapi Relic Museum (Sisa Hartaku)',
            'Underground Kaliadem Bunker',
            'Scenic Mountain View Cafes'
        ],
        travelTips: [
            'The absolute best experience is the Sunrise Jeep Tour. Leaving at 4:30 AM allows you to witness the giant sun rising over Merapi\'s glowing crown.',
            'Bring a light windbreaker jacket as the high mountain air can be chilly in the morning.',
            'Wear the provided face mask as volcano dirt tracks can get highly dusty during offroad trails.'
        ],
        bestTime: 'Dry months from May to September. Early mornings have the highest probability of cloud-free views of the summit.',
        weather: {
            temp: '22°C',
            condition: 'Mist & Sunrise',
            status: 'Stunning cloudless view of the volcano summit this morning.'
        },
        latitude: -7.5960,
        longitude: 110.4463,
        reviews: MOCK_REVIEWS,
        partners: [
            {
                id: 'me-p1',
                name: 'Kopi Klotok Pakem',
                category: 'restaurant',
                image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600',
                rating: 4.9,
                price: 'IDR 20,000 - 45,000 / person',
                distance: '6.5 km from Tour Base',
                description: 'A national sensation. Rustic traditional Javanese village wooden home serving hot charcoal-stewed black coffee, crunchy fresh-fried bananas (Pisang Goreng), and warm lodeh vegetables.',
                address: 'Jl. Kaliurang Km 16, Pakem, Sleman',
                promotion: 'Extra freshly fried banana with every pot coffee',
                phone: '+62 811-2334-455',
                coordinates: {
                    lat: -7.6620,
                    lng: 110.4210
                }
            },
            {
                id: 'me-p2',
                name: 'Kopi Merapi Volcanic Cafe',
                category: 'cafe',
                image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600',
                rating: 4.6,
                price: 'IDR 15,000 - 35,000 / person',
                distance: '2.1 km from Tour Base',
                description: 'Built entirely from volcanic stone ruins. Enjoy robust mountain robusta and arabica coffees roasted on black sand, while sitting directly facing Merapi\'s active cone.',
                address: 'Petung, Kepuharjo, Cangkringan, Sleman',
                promotion: 'Free crispy cassava platter',
                phone: '+62 823-1122-3344',
                coordinates: {
                    lat: -7.6050,
                    lng: 110.4490
                }
            },
            {
                id: 'me-p3',
                name: 'Merapi Jeep Adventure Group 88',
                category: 'rental',
                image: 'https://images.unsplash.com/photo-1533513780520-9c19d4551250?q=80&w=600',
                rating: 4.9,
                price: 'IDR 400,000 / Jeep Package',
                distance: 'On-Site',
                description: 'Professional certified local offroaders driving vintage Willys Jeeps. Includes full safety accessories, insurance, and highly skilled photographer drivers.',
                address: 'Kaliurang Barat, Sleman',
                promotion: 'Free GoPro video recording of your tour',
                phone: '+62 812-3456-7890',
                coordinates: {
                    lat: -7.5970,
                    lng: 110.4450
                }
            }
        ],
        faqs: [
            {
                q: 'Is it safe for kids?',
                a: 'Yes. Families can choose the Short Route which is smoother. Jeeps are fitted with sturdy roll-cages and child helmets are available.'
            },
            {
                q: 'What is inside the Bunker?',
                a: 'The underground Kaliadem bunker is a steel-reinforced shelter built to withstand volcanic heat. It houses historic artifacts and displays of volcanic defense.'
            }
        ]
    },
    {
        id: 'tamansari',
        name: 'Taman Sari Water Castle',
        tagline: 'The Secret Royal Bathing Pools of the Sultanate',
        category: 'heritage',
        location: 'Yogyakarta City',
        subRegion: 'Yogyakarta',
        images: [
            'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?q=80&w=1200',
            'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=1200',
            'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=1200'
        ],
        rating: 4.6,
        reviewCount: 3120,
        description: 'Built in the mid-18th century as a private pleasure park for the first Sultan, Taman Sari is a stunning architectural mixture of Javanese and Portuguese styles. It features quiet, turquoise royal bathing pools, underground secret tunnels, and Sumur Gumuling, an elegant subterranean mosque with five intersecting staircases.',
        story: 'Sultan Hamengkubuwono I built Taman Sari as a resting palace, defense castle, and mystical meditation sanctuary. Secret chambers and underwater passageways allowed the royal family to travel undetected in times of siege. The central bathing pool was where the Sultan watched his princesses swim, selecting one by throwing a Javanese flower from his private tower.',
        ticketPrice: 'IDR 15,000 / person',
        openingHours: '09:00 AM - 03:30 PM Daily',
        facilities: [
            'English Speaking Royal Guides',
            'Turquoise Bathing Pools',
            'Underground Mosque (Sumur Gumuling)',
            'Passage Tunnels',
            'Heritage Batik Villages (Cyber Village)',
            'Craft Souvenir Galleries'
        ],
        travelTips: [
            'The castle is deeply integrated within a lively residential neighborhood called Kampung Taman. Hire a local guide to navigate the labyrinth of pastel narrow streets and find the underground entrances.',
            'Excellent photo opportunities exist at the central five-staircase subterranean mosque. Arrive early at 9 AM to avoid long photo queues.',
            'Visit the nearby Kampung Cyber, a local tech-forward neighborhood where residents specialize in traditional painting and digital art.'
        ],
        bestTime: 'Morning between 09:30 AM - 11:30 AM when the sun streams perfectly into the underground tunnels, creating mystical light shafts.',
        weather: {
            temp: '28°C',
            condition: 'Partly Cloudy',
            status: 'Warm sunshine, perfect for the beautiful outdoor pools today.'
        },
        latitude: -7.8101,
        longitude: 110.3592,
        reviews: MOCK_REVIEWS,
        partners: [
            {
                id: 'ts-p1',
                name: 'The Phoenix Hotel Yogyakarta',
                category: 'hotel',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
                rating: 4.9,
                price: 'IDR 1,500,000 / night',
                distance: '4.2 km from Taman Sari',
                description: ' Colonial elegance blended with royal Javanese architecture. Exquisite heritage experience.',
                address: 'Jl. Jend. Sudirman No.9, Yogyakarta',
                promotion: 'Get 10% off Javanese massage at Royal Spa',
                phone: '+62 274 566617',
                coordinates: {
                    lat: -7.7828,
                    lng: 110.3671
                }
            },
            {
                id: 'ts-p2',
                name: 'Sultan Agung Royal Dining',
                category: 'restaurant',
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600',
                rating: 4.8,
                price: 'IDR 120,000 - 250,000 / person',
                distance: '1.1 km from Taman Sari',
                description: 'Authentic royal recipes passed down through generations. Taste Gudeg Manggar and dynamic Javanese duck with aromatic spices.',
                address: 'Jl. Wijilan No.44, Yogyakarta',
                promotion: 'Complimentary Wedang Rondhe dessert',
                phone: '+62 811-4433-2211',
                coordinates: {
                    lat: -7.8080,
                    lng: 110.3630
                }
            },
            {
                id: 'ts-p3',
                name: 'Water Castle Cafe',
                category: 'cafe',
                image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600',
                rating: 4.6,
                price: 'IDR 30,000 - 60,000 / person',
                distance: '0.2 km from Taman Sari',
                description: 'A botanical cozy garden cafe hidden inside the royal village corridors. Known for cold-brewed coconut coffee and local banana pastries.',
                address: 'Kampung Taman No.45, Kraton, Yogyakarta',
                promotion: '10% discount on coffee with digital Royal Ticket',
                phone: '+62 856-1122-3344',
                coordinates: {
                    lat: -7.8095,
                    lng: 110.3585
                }
            }
        ],
        faqs: [
            {
                q: 'Is Sumur Gumuling open?',
                a: 'Yes. The underground circular mosque is open to visitors, though numbers inside are monitored to preserve the structural integrity of the ancient stone stairs.'
            },
            {
                q: 'Can we photograph the pools?',
                a: 'Yes! Personal photography is permitted and free. Professional commercial equipment or pre-wedding shoots require a special permit fee.'
            }
        ]
    },
    {
        id: 'goajomblang',
        name: 'Goa Jomblang Cave',
        tagline: 'The Celestial Beam of Heavenly Light',
        category: 'hidden-gem',
        location: 'Gunungkidul, Yogyakarta',
        subRegion: 'Gunungkidul',
        images: [
            'https://images.unsplash.com/photo-1604999333679-b86d54738315?q=80&w=1200',
            'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1200',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200'
        ],
        rating: 4.9,
        reviewCount: 1840,
        description: 'Goa Jomblang is a vertical collapse-sinkhole cave. You will be rappelled down 60 meters in harnesses into a mystical underground ancient forest, then walk through a dark, muddy tunnel to reach Goa Grubug, where a blinding ray of celestial light pierces the ceiling into the deep rushing underground river.',
        story: 'Formed hundreds of thousands of years ago when the ground collapsed into a vertical limestone sinkhole, Jomblang isolated a pristine prehistoric jungle. Because it was untouched, unique vegetation and mosses thrive inside. Modern locals call the blinding 12:00 PM midday sunbeam "Cahaya Surga" (The Light of Heaven).',
        ticketPrice: 'IDR 500,000 / person (Includes professional caving gears, safety guides, and traditional lunch box)',
        openingHours: '07:30 AM - 12:30 PM (Caving starts strictly at 09:30 AM to capture midday light)',
        facilities: [
            'Certified Single-Rope Technique (SRT) Guides',
            'Rappelling Harnesses & Safety Helmets',
            'Rubber Boots (all sizes)',
            'Outdoor Shower Rooms',
            'Traditional Javanese Lunch Box',
            'Resting Gazebos'
        ],
        travelTips: [
            'Advance bookings are mandatory as entry is limited to only 80 people per day to preserve the delicate underground ecosystem.',
            'Bring a complete set of dry spare clothes, a towel, and plastic bags. You will get completely covered in wet volcanic mud during the cave walk.',
            'Pack a bright headlamp or flashlight and secure your camera strap thoroughly.'
        ],
        bestTime: 'Sunny days between 11:15 AM and 12:30 PM, when the sun is positioned directly overhead to shoot the direct column of light.',
        weather: {
            temp: '27°C',
            condition: 'Sunny Outside',
            status: 'Perfect clear skies today, promising an intense beam of light!'
        },
        latitude: -8.0287,
        longitude: 110.6384,
        reviews: MOCK_REVIEWS,
        partners: [
            {
                id: 'gj-p1',
                name: 'Gunungkidul Cave Guides Guild',
                category: 'guide',
                image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600',
                rating: 4.9,
                price: 'Included in entry ticket',
                distance: 'On-Site',
                description: 'Highly trained single-rope safety experts. Licensed caving instructors dedicated to eco-tourism preservation and safe descents.',
                address: 'Pacarejo, Semanu, Gunungkidul',
                promotion: 'Free GoPro assistance for photos',
                phone: '+62 878-1122-3344',
                coordinates: {
                    lat: -8.0280,
                    lng: 110.6380
                }
            },
            {
                id: 'gj-p2',
                name: 'Jomblang Traditional Kitchen',
                category: 'restaurant',
                image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600',
                rating: 4.7,
                price: 'Included in ticket (Traditional lunch)',
                distance: '0.1 km from cave',
                description: 'Authentic local farming lunch served in woven bamboo baskets. Features volcanic-soil red rice, fried marinated tofu, free-range chicken, and fresh sambal.',
                address: 'Goa Jomblang Entrance Area, Gunungkidul',
                promotion: 'Complimentary organic ginger tea',
                coordinates: {
                    lat: -8.0290,
                    lng: 110.6390
                }
            }
        ],
        faqs: [
            {
                q: 'Do I need caving experience?',
                a: 'No. The cave guides perform the entire rappelling and pulling mechanically. You just sit comfortably in the harness and enjoy the descent.'
            },
            {
                q: 'Are there age restrictions?',
                a: 'Yes. It is recommended for ages between 10 and 60 years old in healthy physical condition.'
            }
        ]
    },
    {
        id: 'kalibiru',
        name: 'Kalibiru National Park',
        tagline: 'Highland Serenity and Panoramic Reservoir Views',
        category: 'nature',
        location: 'Kulon Progo, Yogyakarta',
        subRegion: 'Kulon Progo',
        images: [
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200'
        ],
        rating: 4.7,
        reviewCount: 2180,
        description: 'Kalibiru National Park is located in the Menoreh Hills, offering a breathtaking panoramic view of the Sermo Reservoir and lush green pine forests from sturdy tree-top wooden platforms.',
        story: 'Kalibiru was originally a dry and degraded forest area. Through the visionary collaborative reforestation efforts of local community groups starting in the early 2000s, it blossomed into a pioneering national model of community-based sustainable eco-tourism.',
        ticketPrice: 'IDR 20,000 / person',
        openingHours: '08:00 AM - 05:00 PM Daily',
        facilities: [
            'Treetop Viewing Decks',
            'Flying Fox Ziplines',
            'Trekking Trails',
            'Local Viewpoint Cafes',
            'Spacious Parking',
            'Clean Restrooms'
        ],
        travelTips: [
            'Arrive early in the morning or during the late afternoon to experience the coolest mountain air and capture perfect lighting over the reservoir.',
            'Wear comfortable hiking shoes as there is a short, scenic uphill walk from the parking area to the viewing platforms.',
            'Hire a local photographer at the platforms for a small fee to take spectacular, high-quality photos of you over the cliff.'
        ],
        bestTime: 'Dry season months of June to September for the clearest panoramic views and colorful sunset reflections on the reservoir.',
        weather: {
            temp: '24°C',
            condition: 'Clear & Cool',
            status: 'Beautiful clear skies with a cool, refreshing breeze over Kalibiru today.'
        },
        latitude: -7.8052,
        longitude: 110.1293,
        reviews: MOCK_REVIEWS,
        partners: [
            {
                id: 'kb-p1',
                name: 'Sermo Lakeside Camping',
                category: 'rental',
                image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600',
                rating: 4.7,
                price: 'IDR 150,000 / night',
                distance: '4.5 km from Kalibiru',
                description: 'Camp under the stars on the edge of the scenic Sermo Reservoir. Equipment rental and bonfire setup included.',
                address: 'Sermo Reservoir Area, Kulon Progo',
                promotion: 'Free firewood bundle with lakeside booking',
                coordinates: {
                    lat: -7.8280,
                    lng: 110.1340
                }
            }
        ],
        faqs: [
            {
                q: 'Is it safe to climb the platforms?',
                a: 'Yes. Every platform is equipped with standard safety harnesses and monitored by experienced local site rangers.'
            }
        ]
    }
];
const FESTIVALS = [
    {
        id: 'f-sekaten',
        name: 'Sekaten Festival',
        date: '7 - 15 May 2025',
        location: 'Yogyakarta',
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200',
        description: 'A week-long royal and spiritual festival celebrating the birth of Prophet Muhammad. The sacred royal gamelans are carried from the palace to the Grand Mosque.',
        highlights: [
            'Royal Gamelan Processions',
            'Traditional Javanese Night Market'
        ],
        category: 'culture'
    },
    {
        id: 'f-fky',
        name: 'Jogja Art Festival',
        date: '23 - 30 June 2025',
        location: 'Yogyakarta',
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200',
        description: 'The ultimate showcase of contemporary and traditional art, bringing Yogyakarta\'s streets to life with street carnivals and puppet plays.',
        highlights: [
            'Street Art Carnivals',
            'Wayang Kulit Puppetry Night'
        ],
        category: 'art'
    },
    {
        id: 'f-grebeg',
        name: 'Grebeg Maulud',
        date: '5 October 2025',
        location: 'Yogyakarta',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200',
        description: 'The spectacular peak of royal gratitude. The Sultan of Yogyakarta paraded colossal mountain-shaped offerings made of harvest crops.',
        highlights: [
            'Majestic Gunungan Mountains',
            'Ten Royal Regiments'
        ],
        category: 'culture'
    },
    {
        id: 'f-wonosari',
        name: 'Wonosari Night Carnival',
        date: '12 July 2025',
        location: 'Gunungkidul',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200',
        description: 'A vibrant and glowing street parade in Gunungkidul featuring traditional dances, music, and colorful illuminated cultural floats.',
        highlights: [
            'Glowing Parades',
            'Night Carnival'
        ],
        category: 'carnival'
    }
];
const JOGJA_QUOTES = [
    {
        text: "Jogja is made of comfortable homes, warm street food, and unforgettable memories.",
        author: "Anies Baswedan"
    },
    {
        text: "Every corner of Yogyakarta has its own story, whispering legends of empires past.",
        author: "Javanese Proverb"
    },
    {
        text: "You can leave Yogyakarta, but its soul will remain a part of you forever.",
        author: "Traditional Song"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Hero.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Hero
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const HERO_SLIDES = [
    {
        id: 'prambanan',
        name: 'Prambanan Temple',
        tagline: 'Witness the majestic 9th-century Hindu spires rising against the golden sky.',
        image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?q=80&w=1600'
    },
    {
        id: 'parangtritis',
        name: 'Parangtritis Beach',
        tagline: 'Where the black volcanic sand acts as a mirror for the mystical Southern Ocean sunset.',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600'
    },
    {
        id: 'merapi',
        name: 'Mount Merapi',
        tagline: 'Feel the thrill of riding vintage 4x4 Willys jeeps through fresh volcanic ash paths.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600'
    },
    {
        id: 'tamansari',
        name: 'Taman Sari Water Castle',
        tagline: 'Explore hidden underground tunnels and secret bath pools of the ancient Sultans.',
        image: 'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?q=80&w=1600'
    },
    {
        id: 'goajomblang',
        name: 'Goa Jomblang Cave',
        tagline: 'Descend into a vertical primeval forest to catch the blinding column of heavenly light.',
        image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?q=80&w=1600'
    }
];
function Hero({ onSearchSubmit, onImageSearchSubmit, onExploreDestination, onToggleSave, isSaved }) {
    _s();
    const [currentSlide, setCurrentSlide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isUploadingImage, setIsUploadingImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleImageButtonClick = ()=>{
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const handleFileChange = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }
        setIsUploadingImage(true);
        try {
            const base64Data = await new Promise((resolve, reject)=>{
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = ()=>{
                    const result = reader.result;
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = (error)=>reject(error);
            });
            const previewUrl = URL.createObjectURL(file);
            const responseData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ai"].imageSearch(base64Data, file.type);
            if (responseData.status === 'success' && responseData.data) {
                const { reply, matchedDestinationIds = [] } = responseData.data;
                onImageSearchSubmit(previewUrl, reply, matchedDestinationIds);
            } else {
                throw new Error(responseData.message || "Failed to analyze image");
            }
        } catch (err) {
            console.error(err);
            alert("Error scanning image: " + err.message);
        } finally{
            setIsUploadingImage(false);
            if (e.target) {
                e.target.value = '';
            }
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Hero.useEffect": ()=>{
            const timer = setInterval({
                "Hero.useEffect.timer": ()=>{
                    setCurrentSlide({
                        "Hero.useEffect.timer": (prev)=>(prev + 1) % HERO_SLIDES.length
                    }["Hero.useEffect.timer"]);
                }
            }["Hero.useEffect.timer"], 6000);
            return ({
                "Hero.useEffect": ()=>clearInterval(timer)
            })["Hero.useEffect"];
        }
    }["Hero.useEffect"], []);
    const slide = HERO_SLIDES[currentSlide];
    const matchedDest = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === slide.id);
    const handleSearchSubmit = (e)=>{
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearchSubmit(searchQuery);
        }
    };
    const handleVoiceSearch = ()=>{
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition is not supported in this browser. Please try Chrome or Safari.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID'; // Supports Indonesian query, since Jogja is in Indonesia
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = ()=>{
            setIsListening(true);
        };
        recognition.onerror = (event)=>{
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.onend = ()=>{
            setIsListening(false);
        };
        recognition.onresult = (event)=>{
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                setSearchQuery(transcript);
                onSearchSubmit(transcript);
            }
        };
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };
    const handleExplore = ()=>{
        if (matchedDest) {
            onExploreDestination(matchedDest);
        }
    };
    const handleSave = ()=>{
        if (matchedDest) {
            onToggleSave(matchedDest);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "hero-section-container",
        className: "relative h-screen md:h-[90vh] min-h-[560px] md:min-h-[780px] w-full overflow-hidden bg-royal-950 transition-all duration-700",
        children: [
            HERO_SLIDES.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-70 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`,
                    style: {
                        transitionProperty: 'opacity, transform'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: item.image,
                            alt: item.name,
                            className: "h-full w-full object-cover object-center filter brightness-90",
                            referrerPolicy: "no-referrer"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Hero.tsx",
                            lineNumber: 187,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/20 to-royal-950/40"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Hero.tsx",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-gradient-to-r from-royal-950/40 via-transparent to-royal-950/40"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Hero.tsx",
                            lineNumber: 195,
                            columnNumber: 11
                        }, this)
                    ]
                }, item.id, true, {
                    fileName: "[project]/src/components/Hero.tsx",
                    lineNumber: 180,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-8 sm:pb-16 md:pb-20 lg:pb-24 sm:px-6 lg:px-8 pt-20 sm:pt-40",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lg:col-span-8 space-y-5 sm:space-y-6 text-left animate-fade-in",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "inline-flex items-center space-x-2 font-sans text-[10px] uppercase tracking-[0.08em] text-gold-400 font-semibold drop-shadow-md",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "☀ GOOD MORNING, EXPLORER"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Hero.tsx",
                                            lineNumber: 206,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 205,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-display text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white drop-shadow-lg leading-[1.1]",
                                        children: [
                                            "Jogja is ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 210,
                                                columnNumber: 24
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-display italic text-gold-400 font-normal mt-1 sm:mt-2 block tracking-normal",
                                                children: "Calling You"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 211,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 209,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm sm:text-base max-w-xl font-light text-white/90 drop-shadow-md leading-relaxed",
                                        children: "Discover unforgettable places, authentic experiences, and warm Javanese hospitality."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-w-xl w-full pt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                id: "hero-conversational-search-form",
                                                onSubmit: handleSearchSubmit,
                                                className: "relative flex items-center rounded-full border border-white/20 bg-black/35 hover:bg-black/45 backdrop-blur-md p-1 shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-gold-500/50 focus-within:border-gold-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "ml-4 h-5 w-5 text-white/70 shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Hero.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Where would you like to explore today?",
                                                        value: searchQuery,
                                                        onChange: (e)=>setSearchQuery(e.target.value),
                                                        className: "w-full bg-transparent py-3 pl-3 pr-14 text-sm text-white placeholder-white/60 focus:outline-none font-sans"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Hero.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        className: "absolute right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 hover:bg-gold-600 active:scale-95 text-white transition-all shadow-md shrink-0",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/Hero.tsx",
                                                            lineNumber: 242,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Hero.tsx",
                                                        lineNumber: 238,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 222,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden md:flex mt-3.5 flex-wrap items-center gap-2 text-xs text-white/90 px-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-white/60 font-medium",
                                                        children: "Try:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/Hero.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 17
                                                    }, this),
                                                    [
                                                        {
                                                            label: 'Best sunset',
                                                            value: 'Best sunset'
                                                        },
                                                        {
                                                            label: 'Hidden waterfall',
                                                            value: 'Hidden waterfall'
                                                        },
                                                        {
                                                            label: 'Coffee with view',
                                                            value: 'Coffee with view'
                                                        },
                                                        {
                                                            label: 'Festival tonight',
                                                            value: 'Festival tonight'
                                                        }
                                                    ].map((pill)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>{
                                                                setSearchQuery(pill.value);
                                                                onSearchSubmit(pill.value);
                                                            },
                                                            className: "bg-black/30 hover:bg-black/50 border border-white/10 hover:border-gold-500/40 px-3.5 py-1 rounded-full text-[11px] font-sans text-white/90 transition-all cursor-pointer",
                                                            children: [
                                                                "'",
                                                                pill.label,
                                                                "'"
                                                            ]
                                                        }, pill.label, true, {
                                                            fileName: "[project]/src/components/Hero.tsx",
                                                            lineNumber: 255,
                                                            columnNumber: 19
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 247,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 221,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Hero.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lg:col-span-4 flex flex-col justify-end items-end w-full",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-full max-w-[340px] bg-stone-950/45 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-2xl animate-fade-in",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-1.5 mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-gold-400",
                                                    children: "✨"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 275,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] font-sans tracking-[0.08em] uppercase font-semibold text-gold-400",
                                                    children: "AI Recommendation"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 276,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Hero.tsx",
                                            lineNumber: 274,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-sm font-bold text-white leading-snug mb-2",
                                            children: "Perfect weather for outdoor adventures today!"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Hero.tsx",
                                            lineNumber: 278,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2 text-xs font-semibold text-white/90 mb-3 bg-white/5 py-1 px-3 rounded-lg w-max",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "☀"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "28°C • Sunny"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 283,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Hero.tsx",
                                            lineNumber: 281,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>onSearchSubmit('outdoor adventure'),
                                            className: "text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors flex items-center space-x-1 cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "See suggestions"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "→"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Hero.tsx",
                                            lineNumber: 285,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Hero.tsx",
                                    lineNumber: 273,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/Hero.tsx",
                                lineNumber: 272,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Hero.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden md:flex mt-12 pt-6 border-t border-white/10 items-center justify-between w-full gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-2.5 text-white/90",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gold-400 text-sm",
                                        children: "📍"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 302,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-sm font-bold tracking-tight text-white",
                                                children: slide.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 304,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-[10px] font-mono text-white/50 tracking-wider",
                                                children: "Sleman, Yogyakarta"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 305,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 303,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Hero.tsx",
                                lineNumber: 301,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-2",
                                        children: HERO_SLIDES.map((_, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setCurrentSlide(idx),
                                                className: `h-0.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-8 bg-gold-400' : 'w-4 bg-white/30 hover:bg-white/50'}`,
                                                "aria-label": `Go to slide ${idx + 1}`
                                            }, idx, false, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 315,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 313,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setCurrentSlide((prev)=>(prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length),
                                                className: "h-8 w-8 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer",
                                                "aria-label": "Previous slide",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 333,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 328,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setCurrentSlide((prev)=>(prev + 1) % HERO_SLIDES.length),
                                                className: "h-8 w-8 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer",
                                                "aria-label": "Next slide",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Hero.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Hero.tsx",
                                                lineNumber: 335,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/Hero.tsx",
                                        lineNumber: 327,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Hero.tsx",
                                lineNumber: 310,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Hero.tsx",
                        lineNumber: 298,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Hero.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Hero.tsx",
        lineNumber: 174,
        columnNumber: 5
    }, this);
}
_s(Hero, "XKGxPrAhdQTAatl6ZKdGwKqIOBE=");
_c = Hero;
var _c;
__turbopack_context__.k.register(_c, "Hero");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/CategoryLinks.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CategoryLinks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$lucide$2d$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/lucide-react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data.ts [app-client] (ecmascript)");
;
;
;
function CategoryLinks({ selectedCategory, onSelectCategory }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "category-links-section",
        className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            id: "categories-pill-row",
            className: "flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>onSelectCategory(null),
                    className: `flex-shrink-0 w-28 h-24 sm:w-32 sm:h-28 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer ${selectedCategory === null ? 'bg-[#1C1A17] border-[#1C1A17] text-white shadow-lg transform -translate-y-0.5' : 'bg-stone-50/70 border-stone-200/50 text-stone-800 hover:bg-stone-100/70'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-2.5 transition-colors ${selectedCategory === null ? 'bg-gold-500/20 text-gold-400' : 'bg-white text-gold-600 shadow-sm border border-stone-100'}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$lucide$2d$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Compass, {
                                className: "h-4.5 w-4.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/CategoryLinks.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/CategoryLinks.tsx",
                            lineNumber: 30,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] font-bold tracking-tight",
                            children: "All Journeys"
                        }, void 0, false, {
                            fileName: "[project]/src/components/CategoryLinks.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/CategoryLinks.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CATEGORIES"].map((cat)=>{
                    const Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$lucide$2d$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__[cat.icon] || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$lucide$2d$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__.Compass;
                    const isSelected = selectedCategory === cat.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: `category-btn-${cat.id}`,
                        onClick: ()=>onSelectCategory(isSelected ? null : cat.id),
                        className: `flex-shrink-0 w-28 h-24 sm:w-32 sm:h-28 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer ${isSelected ? 'bg-[#1C1A17] border-[#1C1A17] text-white shadow-lg transform -translate-y-0.5' : 'bg-stone-50/70 border-stone-200/50 text-stone-800 hover:bg-stone-100/70'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-2.5 transition-colors ${isSelected ? 'bg-gold-500/20 text-gold-400' : 'bg-white text-gold-600 shadow-sm border border-stone-100'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "h-4.5 w-4.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CategoryLinks.tsx",
                                    lineNumber: 56,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/CategoryLinks.tsx",
                                lineNumber: 53,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] font-bold tracking-tight text-center px-1 leading-tight",
                                children: cat.name
                            }, void 0, false, {
                                fileName: "[project]/src/components/CategoryLinks.tsx",
                                lineNumber: 58,
                                columnNumber: 15
                            }, this)
                        ]
                    }, cat.id, true, {
                        fileName: "[project]/src/components/CategoryLinks.tsx",
                        lineNumber: 43,
                        columnNumber: 13
                    }, this);
                })
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/CategoryLinks.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/CategoryLinks.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = CategoryLinks;
var _c;
__turbopack_context__.k.register(_c, "CategoryLinks");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/DestinationCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LANDSCAPE_IDS",
    ()=>LANDSCAPE_IDS,
    "default",
    ()=>DestinationCard,
    "isLandscape",
    ()=>isLandscape
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
;
;
const LANDSCAPE_IDS = [
    'prambanan',
    'merapi',
    'gudeg-yudjum'
];
function isLandscape(id) {
    return LANDSCAPE_IDS.includes(id);
}
// Map beautiful, contextual top badges to match mockup
const BADGE_MAP = {
    'prambanan': 'UNESCO',
    'parangtritis': 'Sunset Spot',
    'malioboro': 'Night Vibes',
    'tamansari': 'Heritage',
    'goajomblang': 'Hidden Gem',
    'merapi': 'Adventure',
    'gudeg-yudjum': 'Culinary',
    'sekaten': 'Limited',
    'artfestival': 'Popular',
    'wonosari': 'Live Tonight'
};
function DestinationCard({ destination, onExplore, onToggleSave, isSaved, className = '' }) {
    const handleToggleSave = (e)=>{
        e.stopPropagation();
        onToggleSave(destination);
    };
    const badgeText = BADGE_MAP[destination.id] || destination.category.replace('-', ' ').toUpperCase();
    const heightClass = 'h-[360px] sm:h-[400px]';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: `destination-card-${destination.id}`,
        onClick: ()=>onExplore(destination),
        className: `group relative w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer border border-gold-100/10 ${heightClass} ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: destination.images[0],
                alt: destination.name,
                className: "h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108",
                referrerPolicy: "no-referrer"
            }, void 0, false, {
                fileName: "[project]/src/components/DestinationCard.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/100"
            }, void 0, false, {
                fileName: "[project]/src/components/DestinationCard.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-[0.08em] text-white",
                children: badgeText
            }, void 0, false, {
                fileName: "[project]/src/components/DestinationCard.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                id: `card-save-btn-${destination.id}`,
                onClick: handleToggleSave,
                className: "absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transform active:scale-90 transition-all duration-300 border border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                    className: `h-4.5 w-4.5 transition-transform duration-300 ${isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-white/90 hover:scale-110'}`
                }, void 0, false, {
                    fileName: "[project]/src/components/DestinationCard.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/DestinationCard.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end text-left",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-manrope text-base sm:text-lg font-bold tracking-tight text-white leading-tight drop-shadow-sm group-hover:text-gold-300 transition-colors",
                        children: destination.name
                    }, void 0, false, {
                        fileName: "[project]/src/components/DestinationCard.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-white/70 font-light mt-1 mb-3.5 line-clamp-1",
                        children: destination.tagline
                    }, void 0, false, {
                        fileName: "[project]/src/components/DestinationCard.tsx",
                        lineNumber: 85,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-1 text-xs font-semibold text-white bg-black/35 py-1 px-2.5 rounded-full border border-white/5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                className: "h-3 w-3 fill-gold-400 text-gold-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationCard.tsx",
                                                lineNumber: 94,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: destination.rating.toFixed(1)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationCard.tsx",
                                                lineNumber: 95,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-white/55",
                                                children: [
                                                    "(",
                                                    destination.reviewCount > 1000 ? (destination.reviewCount / 1000).toFixed(1) + 'k' : destination.reviewCount,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationCard.tsx",
                                                lineNumber: 96,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationCard.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this),
                                    destination.bestTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hidden xs:block text-[9px] font-sans font-semibold tracking-[0.08em] uppercase text-gold-400 bg-gold-450/10 border border-gold-400/20 px-2 py-1 rounded-full whitespace-nowrap",
                                        children: destination.bestTime
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationCard.tsx",
                                        lineNumber: 101,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationCard.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gold-400 text-royal-950 shadow-md group-hover:bg-gold-300 group-hover:scale-105 transition-all duration-300",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "h-4 w-4 stroke-current",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    strokeWidth: "2.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M5 12h14M12 5l7 7-7 7"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationCard.tsx",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DestinationCard.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationCard.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DestinationCard.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DestinationCard.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DestinationCard.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_c = DestinationCard;
var _c;
__turbopack_context__.k.register(_c, "DestinationCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/DestinationDetail.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DestinationDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ticket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ticket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ticket.js [app-client] (ecmascript) <export default as Ticket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cloud-sun.js [app-client] (ecmascript) <export default as CloudSun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hotel.js [app-client] (ecmascript) <export default as Hotel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coffee.js [app-client] (ecmascript) <export default as Coffee>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.js [app-client] (ecmascript) <export default as Compass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$footprints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Footprints$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/footprints.js [app-client] (ecmascript) <export default as Footprints>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
;
var _s = __turbopack_context__.k.signature();
;
;
function DestinationDetail({ destination, onBack, onToggleSave, isSaved, onSelectPartnerOnMap }) {
    _s();
    const [activeImageIdx, setActiveImageIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('info');
    const [partnerFilter, setPartnerFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleShare = ()=>{
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    const filteredPartners = destination.partners.filter((p)=>{
        if (partnerFilter === 'all') return true;
        if (partnerFilter === 'restaurant' && p.category === 'restaurant') return true;
        if (partnerFilter === 'cafe' && p.category === 'cafe') return true;
        return p.category === partnerFilter;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: `destination-detail-page-${destination.id}`,
        className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between border-b border-gold-100 pb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: "detail-back-btn",
                        onClick: onBack,
                        className: "group flex items-center space-x-2 text-sm font-semibold text-royal-950 hover:text-gold-700 transition-colors cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                className: "h-4 w-4 transition-transform group-hover:-translate-x-1"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Back to Yogyakarta Discovery"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DestinationDetail.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                id: "detail-save-btn",
                                onClick: ()=>onToggleSave(destination),
                                className: `flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${isSaved ? 'bg-gold-500/20 border-gold-400 text-gold-600' : 'border-gold-100 bg-white text-royal-950/70 hover:bg-gold-50 hover:text-royal-950'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                    className: `h-5 w-5 ${isSaved ? 'fill-gold-600 text-gold-600' : ''}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                    lineNumber: 65,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                id: "detail-share-btn",
                                onClick: handleShare,
                                className: "flex h-10 w-10 items-center justify-center rounded-full border border-gold-100 bg-white text-royal-950/70 hover:bg-gold-50 hover:text-royal-950 transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                    lineNumber: 73,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this),
                            copied && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-mono text-gold-700 animate-fade-in bg-gold-50 px-2 py-1 rounded-md border border-gold-200",
                                children: "Copied Link!"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 76,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DestinationDetail.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DestinationDetail.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-7 space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative overflow-hidden rounded-3xl border border-gold-100 shadow-lg bg-royal-950 aspect-16/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: destination.images[activeImageIdx],
                                        alt: destination.name,
                                        className: "h-full w-full object-cover object-center transition-all duration-500",
                                        referrerPolicy: "no-referrer"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 89,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute bottom-4 left-4 right-4 flex justify-center space-x-2.5",
                                        children: destination.images.map((img, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setActiveImageIdx(idx),
                                                className: `relative h-14 w-20 overflow-hidden rounded-xl border-2 transition-all ${idx === activeImageIdx ? 'border-gold-400 scale-105 shadow-md' : 'border-white/40 opacity-70 hover:opacity-100'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: img,
                                                    alt: "thumbnail",
                                                    className: "h-full w-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                    lineNumber: 106,
                                                    columnNumber: 19
                                                }, this)
                                            }, idx, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 99,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 97,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded-full bg-gold-100 px-3 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.08em] text-gold-700",
                                                children: destination.category
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 115,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center space-x-1 font-mono text-xs text-royal-700/80",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                        className: "h-3.5 w-3.5 text-gold-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 119,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: destination.location
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 118,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 114,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-manrope text-3xl font-bold tracking-tight text-royal-950 sm:text-4xl leading-tight",
                                        children: destination.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-display italic text-lg text-gold-700/90 font-medium",
                                        children: [
                                            '"',
                                            destination.tagline,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-3xl bg-gold-50/40 border border-gold-100/50 p-6 sm:p-8 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-2.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                className: "h-5 w-5 text-gold-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 135,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-manrope text-lg font-bold text-royal-950",
                                                children: "The Heritage & Mythology"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 136,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 134,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-display italic text-royal-950/90 leading-relaxed text-sm bg-white/40 border-l-4 border-gold-400 pl-4 py-1",
                                        children: [
                                            '"',
                                            destination.story,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 140,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-manrope text-xl font-bold text-royal-950",
                                        children: "Overview"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 147,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-royal-700 leading-relaxed text-sm font-light",
                                        children: destination.description
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 150,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$footprints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Footprints$3e$__["Footprints"], {
                                                className: "h-5 w-5 text-gold-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 158,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-manrope text-lg font-bold text-royal-950",
                                                children: "Practical Travel Tips"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 159,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 157,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "grid grid-cols-1 gap-3 sm:grid-cols-1",
                                        children: destination.travelTips.map((tip, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "flex items-start space-x-3 text-xs text-royal-700",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100/70 text-gold-700 font-mono text-[10px] font-bold",
                                                        children: idx + 1
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 166,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "leading-relaxed",
                                                        children: tip
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 169,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 165,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 163,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 156,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DestinationDetail.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-5 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-3xl bg-royal-950 text-white p-6 border border-royal-900 shadow-xl space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cloud$2d$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CloudSun$3e$__["CloudSun"], {
                                                        className: "h-5 w-5 text-gold-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 182,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-[10px] uppercase tracking-wider text-gold-300",
                                                        children: "Live Weather Advice"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 181,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-white",
                                                children: "Yogyakarta"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 185,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 180,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-baseline space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono text-3xl font-bold text-gold-300",
                                                children: destination.weather.temp
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 189,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-gold-100/80",
                                                children: destination.weather.condition
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 190,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 188,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t border-white/10 pt-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-2 text-gold-400 text-xs mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 196,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold uppercase tracking-wider text-[9px] font-mono",
                                                        children: "Knowledgeable Local Friend"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 197,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 195,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs italic text-gold-50/90 leading-relaxed font-light",
                                                children: [
                                                    '"',
                                                    destination.weather.status,
                                                    ' The morning air brings fresh volcanic breeze. Try arriving early for stunning mountain vistas!"'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 199,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 194,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-gold-100 bg-white p-4 flex flex-col justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-2 text-gold-600 mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ticket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ticket$3e$__["Ticket"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 209,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-[9px] uppercase tracking-wider font-semibold",
                                                        children: "Admission Pass"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 210,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 208,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-bold text-royal-950 line-clamp-2",
                                                children: destination.ticketPrice
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 212,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 207,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-gold-100 bg-white p-4 flex flex-col justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-2 text-gold-600 mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 219,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-[9px] uppercase tracking-wider font-semibold",
                                                        children: "Opening Hours"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 220,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 218,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-bold text-royal-950",
                                                children: destination.openingHours
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 222,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-b border-gold-100 flex space-x-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('info'),
                                        className: `pb-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'info' ? 'border-gold-600 text-gold-800' : 'border-transparent text-royal-700/60 hover:text-royal-950'}`,
                                        children: "Logistics"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        id: "detail-partners-tab-trigger",
                                        onClick: ()=>setActiveTab('ecosystem'),
                                        className: `pb-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'ecosystem' ? 'border-gold-600 text-gold-800' : 'border-transparent text-royal-700/60 hover:text-royal-950'}`,
                                        children: [
                                            "Nearby Partners (",
                                            destination.partners.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 238,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab('reviews'),
                                        className: `pb-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'reviews' ? 'border-gold-600 text-gold-800' : 'border-transparent text-royal-700/60 hover:text-royal-950'}`,
                                        children: [
                                            "Stories (",
                                            destination.reviews.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 229,
                                columnNumber: 11
                            }, this),
                            activeTab === 'info' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4 animate-fade-in",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-gold-100 bg-white p-5 space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold text-royal-950",
                                                        children: "Best Time to Visit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 262,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-gold-700 font-mono font-medium",
                                                        children: destination.bestTime
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 263,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 261,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-t border-gold-50 pt-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold text-royal-950 block mb-2",
                                                        children: "Available Facilities"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 267,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-1.5",
                                                        children: destination.facilities.map((fac, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded-full bg-gold-50 border border-gold-100/40 px-2.5 py-1 text-[10px] text-royal-950 font-light",
                                                                children: fac
                                                            }, idx, false, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 270,
                                                                columnNumber: 23
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 268,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 266,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 260,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-gold-100 overflow-hidden bg-gold-50/20 shadow-inner p-4 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                                                className: "h-4 w-4 text-gold-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 282,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-bold text-royal-950",
                                                                children: "Contextual Tourism Route Map"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 283,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 281,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-mono text-royal-700/60",
                                                        children: "GPS Ready"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 285,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 280,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative h-44 rounded-xl bg-gold-100 border border-gold-200 flex flex-col items-center justify-center text-center p-4 shadow-sm overflow-hidden group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute inset-0 bg-[radial-gradient(#d6a147_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 289,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative z-10 flex flex-col items-center space-y-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex h-10 w-10 items-center justify-center rounded-full bg-royal-950 text-gold-300 border-2 border-gold-400 shadow-lg animate-bounce",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                    className: "h-5 w-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                    lineNumber: 294,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 293,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-manrope font-bold text-xs text-royal-950",
                                                                children: destination.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 296,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] text-royal-700 bg-white/90 border border-gold-200 px-2 py-0.5 rounded-full font-mono",
                                                                children: [
                                                                    "LAT: ",
                                                                    destination.latitude.toFixed(3),
                                                                    " • LNG: ",
                                                                    destination.longitude.toFixed(3)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 297,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 292,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute bottom-4 left-6 flex items-center space-x-1.5 bg-white/95 px-2 py-1 rounded-lg shadow-sm border border-gold-100",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "h-2 w-2 rounded-full bg-green-500 animate-pulse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 304,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-mono font-bold text-royal-950",
                                                                children: "Sultanate Core Zone"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 305,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 303,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 288,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 279,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 259,
                                columnNumber: 13
                            }, this),
                            activeTab === 'ecosystem' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4 animate-fade-in",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1.5 border-b border-gold-100/50 pb-3",
                                        children: [
                                            {
                                                id: 'all',
                                                label: 'All Partners'
                                            },
                                            {
                                                id: 'hotel',
                                                label: 'Hotels'
                                            },
                                            {
                                                id: 'restaurant',
                                                label: 'Culinary'
                                            },
                                            {
                                                id: 'guide',
                                                label: 'Guides'
                                            },
                                            {
                                                id: 'souvenir',
                                                label: 'Souvenirs'
                                            }
                                        ].map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setPartnerFilter(filter.id),
                                                className: `rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors border ${partnerFilter === filter.id ? 'bg-gold-800 text-gold-50 border-gold-800' : 'bg-white text-royal-700/80 border-gold-100 hover:bg-gold-50'}`,
                                                children: filter.label
                                            }, filter.id, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 324,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 316,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3 max-h-[350px] overflow-y-auto pr-1",
                                        children: filteredPartners.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center py-8 text-xs text-royal-700/60 font-light border border-dashed border-gold-200 rounded-2xl bg-white",
                                            children: [
                                                "No verified partner of this category nearby ",
                                                destination.name,
                                                "."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/DestinationDetail.tsx",
                                            lineNumber: 341,
                                            columnNumber: 19
                                        }, this) : filteredPartners.map((partner)=>{
                                            const isHotel = partner.category === 'hotel';
                                            const isRest = partner.category === 'restaurant' || partner.category === 'cafe';
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                id: `partner-card-${partner.id}`,
                                                className: "group flex rounded-2xl border border-gold-100 bg-white p-3.5 hover:border-gold-300 hover:shadow-md transition-all duration-300",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-royal-950 border border-gold-100",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: partner.image,
                                                            alt: partner.name,
                                                            className: "h-full w-full object-cover"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DestinationDetail.tsx",
                                                            lineNumber: 356,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 355,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "ml-3.5 flex flex-1 flex-col justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center justify-between",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "flex items-center space-x-1 text-[9px] font-sans font-semibold uppercase tracking-[0.08em] text-gold-700",
                                                                                children: [
                                                                                    isHotel ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hotel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Hotel$3e$__["Hotel"], {
                                                                                        className: "h-3 w-3"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                        lineNumber: 364,
                                                                                        columnNumber: 44
                                                                                    }, this) : isRest ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__["Coffee"], {
                                                                                        className: "h-3 w-3"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                        lineNumber: 364,
                                                                                        columnNumber: 85
                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                                                                        className: "h-3 w-3"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                        lineNumber: 364,
                                                                                        columnNumber: 118
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        children: partner.category
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                        lineNumber: 365,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                lineNumber: 363,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center space-x-1 text-[10px] font-semibold text-royal-950 font-mono",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                                        className: "h-3 w-3 fill-gold-400 text-gold-400"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                        lineNumber: 368,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        children: partner.rating.toFixed(1)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                        lineNumber: 369,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                                lineNumber: 367,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 362,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "font-manrope font-bold text-sm text-royal-950 group-hover:text-gold-700 transition-colors duration-200 leading-snug",
                                                                        children: partner.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 373,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] text-royal-700/70 font-light line-clamp-1 mt-0.5",
                                                                        children: partner.description
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 377,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 361,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between mt-2 pt-2 border-t border-gold-50",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] font-mono text-royal-950 font-semibold",
                                                                        children: partner.price
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 383,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] font-mono text-royal-700/60",
                                                                        children: partner.distance
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 384,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 382,
                                                                columnNumber: 27
                                                            }, this),
                                                            partner.promotion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-2 flex items-center space-x-1 bg-gold-50 border border-gold-200 rounded-lg px-2 py-1 text-[9px] font-mono text-gold-800 font-semibold",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                                                                        className: "h-3 w-3 text-gold-600 shrink-0 animate-pulse"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 390,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "truncate",
                                                                        children: partner.promotion
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 391,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 389,
                                                                columnNumber: 29
                                                            }, this),
                                                            partner.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-1 flex items-center space-x-1 text-[8px] font-mono text-royal-700/60",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                                        className: "h-2.5 w-2.5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 398,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: partner.phone
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                        lineNumber: 399,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                lineNumber: 397,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, partner.id, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 349,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 339,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 314,
                                columnNumber: 13
                            }, this),
                            activeTab === 'reviews' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4 animate-fade-in",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3.5",
                                    children: destination.reviews.map((review)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-2xl border border-gold-100 bg-white p-4.5 space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center space-x-2.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: review.userAvatar,
                                                                    alt: review.userName,
                                                                    className: "h-8 w-8 rounded-full object-cover border border-gold-200"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                    lineNumber: 419,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "block text-xs font-bold text-royal-950",
                                                                            children: review.userName
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                            lineNumber: 421,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "block text-[9px] font-mono text-royal-700/50",
                                                                            children: review.date
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                            lineNumber: 422,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                    lineNumber: 420,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/DestinationDetail.tsx",
                                                            lineNumber: 418,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center space-x-0.5 font-mono text-[10px] font-bold text-royal-950",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                    className: "h-3 w-3 fill-gold-400 text-gold-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                    lineNumber: 427,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: review.rating.toFixed(1)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                                    lineNumber: 428,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/DestinationDetail.tsx",
                                                            lineNumber: 426,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                    lineNumber: 417,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-royal-700 font-light leading-relaxed",
                                                    children: [
                                                        '"',
                                                        review.comment,
                                                        '"'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                                    lineNumber: 431,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, review.id, true, {
                                            fileName: "[project]/src/components/DestinationDetail.tsx",
                                            lineNumber: 416,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DestinationDetail.tsx",
                                    lineNumber: 414,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 413,
                                columnNumber: 13
                            }, this),
                            activeTab === 'faqs' && destination.faqs.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3 animate-fade-in",
                                children: destination.faqs.map((faq, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl border border-gold-100 bg-white p-4 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start space-x-2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                                        className: "h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 446,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold text-royal-950 leading-relaxed",
                                                        children: faq.q
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                                        lineNumber: 447,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 445,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-royal-700/80 font-light leading-relaxed pl-7",
                                                children: faq.a
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                                lineNumber: 449,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, idx, true, {
                                        fileName: "[project]/src/components/DestinationDetail.tsx",
                                        lineNumber: 444,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/DestinationDetail.tsx",
                                lineNumber: 442,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DestinationDetail.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DestinationDetail.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DestinationDetail.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_s(DestinationDetail, "l3Abnxo2ZAKkE67VpHmNelB6xE0=");
_c = DestinationDetail;
var _c;
__turbopack_context__.k.register(_c, "DestinationDetail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ConversationalAI.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConversationalAI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brain.js [app-client] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$corner$2d$down$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CornerDownRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/corner-down-right.js [app-client] (ecmascript) <export default as CornerDownRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DestinationCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
const QUICK_PROMPTS = [
    {
        text: "Where can I watch the best sunset near the ocean?",
        label: "Beach Sunset"
    },
    {
        text: "Show me a vertical hidden cave with a heavenly light column",
        label: "Hidden Gems"
    },
    {
        text: "Where should I eat legendary local Gudeg or traditional volcano coffee?",
        label: "Culinary & Coffee"
    },
    {
        text: "Suggest a thrilling volcano adventure with mountain views",
        label: "Volcano Jeep Tour"
    },
    {
        text: "Where should I take my family for royal culture and swimming pools?",
        label: "Royal Heritage"
    }
];
const LOADING_PHRASES = [
    "Boiling some hot local wedang uwuh ginger tea while consulting the maps...",
    "Politely asking the ancient Mount Merapi spirits for safe passage tips...",
    "Wandering the subterranean mosque of Taman Sari to retrieve local legends...",
    "Consulting the royal Javanese scrolls for Yogyakarta's finest secrets...",
    "Checking with a local becak trishaw driver for today's golden sunset spots..."
];
function ConversationalAI({ initialQuery = '', initialImageResult, onClearImageResult, onExploreDestination, onToggleSave, isSaved }) {
    _s();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadingPhraseIdx, setLoadingPhraseIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const chatEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load welcome message or initial query
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConversationalAI.useEffect": ()=>{
            if (messages.length === 0) {
                const welcomeMsg = {
                    id: 'welcome',
                    role: 'model',
                    text: 'Sugeng rawuh! Welcome to Yogyakarta, the land of ancient kings, roaring oceans, and warm hospitality. I am your local guide and advisor. Ask me anything—whether you want a scenic mountain cafe, a romantic seaside sunset, or vertical hidden cave rappelling, I will tell you where to go!'
                };
                setMessages([
                    welcomeMsg
                ]);
            }
        }
    }["ConversationalAI.useEffect"], []);
    // Handle passed-down query from Home search bar
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConversationalAI.useEffect": ()=>{
            if (initialQuery && messages.length <= 1) {
                handleSendQuery(initialQuery);
            }
        }
    }["ConversationalAI.useEffect"], [
        initialQuery
    ]);
    // Handle passed-down image scan result from Home search bar
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConversationalAI.useEffect": ()=>{
            if (initialImageResult && messages.length <= 1) {
                const userMsg = {
                    id: 'user-image-' + Math.random().toString(),
                    role: 'user',
                    text: 'Scanned Image Context',
                    imageUrl: initialImageResult.imageUrl
                };
                const matchedDests = [];
                for (const id of initialImageResult.matchedDestinationIds){
                    const found = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find({
                        "ConversationalAI.useEffect.found": (d)=>d.id === id
                    }["ConversationalAI.useEffect.found"]);
                    if (found) matchedDests.push(found);
                }
                const aiMsg = {
                    id: 'ai-image-' + Math.random().toString(),
                    role: 'model',
                    text: initialImageResult.reply,
                    matchedDestinations: matchedDests
                };
                setMessages({
                    "ConversationalAI.useEffect": (prev)=>[
                            ...prev,
                            userMsg,
                            aiMsg
                        ]
                }["ConversationalAI.useEffect"]);
                if (onClearImageResult) {
                    onClearImageResult();
                }
            }
        }
    }["ConversationalAI.useEffect"], [
        initialImageResult
    ]);
    // Loading phrase cycling effect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConversationalAI.useEffect": ()=>{
            let timer;
            if (loading) {
                timer = setInterval({
                    "ConversationalAI.useEffect": ()=>{
                        setLoadingPhraseIdx({
                            "ConversationalAI.useEffect": (prev)=>(prev + 1) % LOADING_PHRASES.length
                        }["ConversationalAI.useEffect"]);
                    }
                }["ConversationalAI.useEffect"], 2500);
            }
            return ({
                "ConversationalAI.useEffect": ()=>clearInterval(timer)
            })["ConversationalAI.useEffect"];
        }
    }["ConversationalAI.useEffect"], [
        loading
    ]);
    // Scroll to bottom
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ConversationalAI.useEffect": ()=>{
            chatEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }["ConversationalAI.useEffect"], [
        messages,
        loading
    ]);
    const handleSendQuery = async (textToSend)=>{
        if (!textToSend.trim()) return;
        const userMsg = {
            id: Math.random().toString(),
            role: 'user',
            text: textToSend
        };
        setMessages((prev)=>[
                ...prev,
                userMsg
            ]);
        setInput('');
        setLoading(true);
        setLoadingPhraseIdx(0);
        try {
            // Package previous chat messages for grounding history
            const history = messages.filter((m)=>m.id !== 'welcome').map((m)=>({
                    role: m.role,
                    text: m.text
                }));
            const responseData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ai"].query(textToSend, history);
            if (responseData.status === 'success' && responseData.data) {
                const { reply, matchedDestinationIds = [] } = responseData.data;
                // Map matched IDs back to our rich static destinations list
                const matchedDests = [];
                for (const id of matchedDestinationIds){
                    const found = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === id);
                    if (found) matchedDests.push(found);
                }
                const aiMsg = {
                    id: Math.random().toString(),
                    role: 'model',
                    text: reply,
                    matchedDestinations: matchedDests
                };
                setMessages((prev)=>[
                        ...prev,
                        aiMsg
                    ]);
            } else {
                throw new Error(responseData.message || 'API failed to respond');
            }
        } catch (err) {
            console.error(err);
            const errorMsg = {
                id: Math.random().toString(),
                role: 'model',
                text: 'Matur nuwun for your patience. I had a slight interruption crossing the volcanic lines, but I can suggest exploring Malioboro or Prambanan today. Let me know if you would like me to refresh!'
            };
            setMessages((prev)=>[
                    ...prev,
                    errorMsg
                ]);
        } finally{
            setLoading(false);
        }
    };
    const handleFormSubmit = (e)=>{
        e.preventDefault();
        handleSendQuery(input);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "conversational-ai-advisor-page",
        className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in flex flex-col h-[85vh]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-3 border-b border-gold-100 pb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-12 w-12 items-center justify-center rounded-full bg-royal-950 text-gold-300 shadow-md",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"], {
                            className: "h-6 w-6 animate-pulse"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ConversationalAI.tsx",
                            lineNumber: 197,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConversationalAI.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-manrope text-2xl font-bold text-royal-950",
                                children: "AI Local Advisor"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ConversationalAI.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-royal-700/80 font-light",
                                children: 'Ask Yogyakarta questions and let your "knowledgeable local friend" suggest authentic places.'
                            }, void 0, false, {
                                fileName: "[project]/src/components/ConversationalAI.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ConversationalAI.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConversationalAI.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "chat-messages-container",
                className: "flex-1 overflow-y-auto py-6 space-y-6 pr-2",
                children: [
                    messages.map((msg)=>{
                        const isAI = msg.role === 'model';
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex items-start ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`,
                            children: [
                                isAI && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-800 text-gold-100 mr-3 border border-gold-600",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ConversationalAI.tsx",
                                        lineNumber: 221,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                    lineNumber: 220,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-w-[85%] space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${isAI ? 'bg-white border border-gold-100/50 text-royal-950 rounded-tl-none' : 'bg-gold-800 text-gold-50 rounded-tr-none'}`,
                                            children: [
                                                msg.imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-2 max-w-xs overflow-hidden rounded-xl border border-gold-600/20 bg-black/10",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: msg.imageUrl,
                                                        alt: "Uploaded scene preview",
                                                        className: "w-full h-auto object-cover max-h-48",
                                                        referrerPolicy: "no-referrer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ConversationalAI.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 21
                                                }, this),
                                                msg.text === 'Scanned Image Context' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "italic text-xs text-gold-200/90 font-mono",
                                                    children: "Searched by this image"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                                    lineNumber: 240,
                                                    columnNumber: 21
                                                }, this) : msg.text
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/ConversationalAI.tsx",
                                            lineNumber: 227,
                                            columnNumber: 17
                                        }, this),
                                        isAI && msg.matchedDestinations && msg.matchedDestinations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3 pl-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-1.5 text-gold-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$corner$2d$down$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CornerDownRight$3e$__["CornerDownRight"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/ConversationalAI.tsx",
                                                            lineNumber: 250,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-mono text-[10px] uppercase tracking-wider font-bold",
                                                            children: "Suggested Itinerary Matches"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/ConversationalAI.tsx",
                                                            lineNumber: 251,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                                    lineNumber: 249,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                                    children: msg.matchedDestinations.map((dest)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "transform scale-95 origin-top-left hover:scale-100 transition-transform duration-300",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                destination: dest,
                                                                onExplore: onExploreDestination,
                                                                onToggleSave: onToggleSave,
                                                                isSaved: isSaved(dest.id)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/ConversationalAI.tsx",
                                                                lineNumber: 257,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, dest.id, false, {
                                                            fileName: "[project]/src/components/ConversationalAI.tsx",
                                                            lineNumber: 256,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/ConversationalAI.tsx",
                                            lineNumber: 248,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                    lineNumber: 225,
                                    columnNumber: 15
                                }, this),
                                !isAI && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-200 text-gold-800 ml-3 border border-gold-300",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ConversationalAI.tsx",
                                        lineNumber: 272,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                    lineNumber: 271,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, msg.id, true, {
                            fileName: "[project]/src/components/ConversationalAI.tsx",
                            lineNumber: 215,
                            columnNumber: 13
                        }, this);
                    }),
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-start animate-pulse",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-800 text-gold-100 mr-3 border border-gold-600",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                    className: "h-4 w-4 animate-spin text-gold-300"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                    lineNumber: 283,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ConversationalAI.tsx",
                                lineNumber: 282,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-w-[80%] rounded-2xl p-4 bg-gold-50 border border-gold-200 text-royal-950 rounded-tl-none text-xs flex items-center space-x-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono font-medium text-gold-800",
                                    children: LOADING_PHRASES[loadingPhraseIdx]
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ConversationalAI.tsx",
                                    lineNumber: 286,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ConversationalAI.tsx",
                                lineNumber: 285,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ConversationalAI.tsx",
                        lineNumber: 281,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: chatEndRef
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConversationalAI.tsx",
                        lineNumber: 290,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConversationalAI.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            messages.length <= 1 && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "suggested-chips-container",
                className: "py-3 border-t border-gold-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "block text-[10px] font-mono uppercase tracking-wider text-royal-700/60 font-bold mb-2",
                        children: "Suggested Inquiries"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConversationalAI.tsx",
                        lineNumber: 296,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: QUICK_PROMPTS.map((qp, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleSendQuery(qp.text),
                                className: "rounded-full bg-gold-50 hover:bg-gold-100 text-[11px] px-3.5 py-1.5 border border-gold-100/60 text-royal-950 font-medium transition-colors",
                                children: qp.label
                            }, idx, false, {
                                fileName: "[project]/src/components/ConversationalAI.tsx",
                                lineNumber: 299,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/ConversationalAI.tsx",
                        lineNumber: 297,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ConversationalAI.tsx",
                lineNumber: 295,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-gold-100 pt-4 bg-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleFormSubmit,
                    className: "relative flex items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Ask your local advisor friend (e.g. 'romantic dinner with sunset' or 'hidden Javanese pools')",
                            value: input,
                            onChange: (e)=>setInput(e.target.value),
                            disabled: loading,
                            className: "w-full rounded-full border border-gold-200 bg-gold-50/20 py-4 pl-6 pr-16 text-sm text-royal-950 placeholder-royal-700/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ConversationalAI.tsx",
                            lineNumber: 314,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: loading || !input.trim(),
                            className: "absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-gold-800 text-gold-100 hover:bg-gold-700 active:scale-95 disabled:bg-gold-50/50 disabled:text-royal-700/30 transition-all cursor-pointer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                className: "h-4.5 w-4.5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ConversationalAI.tsx",
                                lineNumber: 327,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ConversationalAI.tsx",
                            lineNumber: 322,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ConversationalAI.tsx",
                    lineNumber: 313,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ConversationalAI.tsx",
                lineNumber: 312,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ConversationalAI.tsx",
        lineNumber: 190,
        columnNumber: 5
    }, this);
}
_s(ConversationalAI, "QKJPzKNqY+HoSdWLfLFcBEnbf0w=");
_c = ConversationalAI;
var _c;
__turbopack_context__.k.register(_c, "ConversationalAI");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/TripPlanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TripPlanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash.js [app-client] (ecmascript) <export default as Trash>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-client] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
;
var _s = __turbopack_context__.k.signature();
;
;
function TripPlanner({ savedDestinations, onExploreDestination, onRemoveFromSaved }) {
    _s();
    const [tripPlan, setTripPlan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        id: 'my-custom-trip',
        title: 'My Royal Yogyakarta Escape',
        startDate: '2026-08-10',
        durationDays: 3,
        days: [
            {
                dayNumber: 1,
                destinations: [],
                notes: 'Cultural heritage immersion'
            },
            {
                dayNumber: 2,
                destinations: [],
                notes: 'Volcano thrills and hot coffee'
            },
            {
                dayNumber: 3,
                destinations: [],
                notes: 'Southern sunset beach mirror'
            }
        ]
    });
    const [activeDayIdx, setActiveDayIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [tripNotes, setTripNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const handleAddDestinationToDay = (dest, dayNum)=>{
        setTripPlan((prev)=>{
            const updatedDays = prev.days.map((day)=>{
                if (day.dayNumber === dayNum) {
                    // Check if already exists in this day
                    if (day.destinations.some((d)=>d.id === dest.id)) return day;
                    return {
                        ...day,
                        destinations: [
                            ...day.destinations,
                            dest
                        ]
                    };
                }
                return day;
            });
            return {
                ...prev,
                days: updatedDays
            };
        });
    };
    const handleRemoveFromDay = (destId, dayNum)=>{
        setTripPlan((prev)=>{
            const updatedDays = prev.days.map((day)=>{
                if (day.dayNumber === dayNum) {
                    return {
                        ...day,
                        destinations: day.destinations.filter((d)=>d.id !== destId)
                    };
                }
                return day;
            });
            return {
                ...prev,
                days: updatedDays
            };
        });
    };
    const handleUpdateDayNotes = (dayNum, notesText)=>{
        setTripPlan((prev)=>{
            const updatedDays = prev.days.map((day)=>{
                if (day.dayNumber === dayNum) {
                    return {
                        ...day,
                        notes: notesText
                    };
                }
                return day;
            });
            return {
                ...prev,
                days: updatedDays
            };
        });
    };
    const handleAddDay = ()=>{
        setTripPlan((prev)=>{
            const newDayNum = prev.durationDays + 1;
            const newDay = {
                dayNumber: newDayNum,
                destinations: [],
                notes: `Exploring Yogyakarta's beauties`
            };
            return {
                ...prev,
                durationDays: newDayNum,
                days: [
                    ...prev.days,
                    newDay
                ]
            };
        });
        setActiveDayIdx(tripPlan.days.length);
    };
    const activeDay = tripPlan.days[activeDayIdx];
    // Dynamic advice generator based on selected destinations in active day
    const getDailyAIAdvice = (day)=>{
        if (day.destinations.length === 0) {
            return "Monggo! Choose any destinations from your saved list on the left to start planning this day.";
        }
        const hasPrambanan = day.destinations.some((d)=>d.id === 'prambanan');
        const hasMerapi = day.destinations.some((d)=>d.id === 'merapi');
        const hasParangtritis = day.destinations.some((d)=>d.id === 'parangtritis');
        const hasJomblang = day.destinations.some((d)=>d.id === 'goajomblang');
        const hasTamanSari = day.destinations.some((d)=>d.id === 'tamansari');
        let advice = "Sugeng rawuh! ";
        if (hasMerapi && hasPrambanan) {
            advice += "Doing Merapi Lava Tour and Prambanan Temple on the same day is excellent. Start with the Sunrise Jeep Tour at 4:30 AM, then rest during midday, and visit Prambanan at 3:30 PM for the perfect golden spires!";
        } else if (hasPrambanan && hasTamanSari) {
            advice += "This is a Royal Heritage day! Explore the secret bath pools of Taman Sari in the morning (around 9:30 AM) to capture the sunbeam inside the underground mosque, then head to Prambanan for the late afternoon.";
        } else if (hasJomblang && hasParangtritis) {
            advice += "A Day of Contrasts! Descend into the vertical dark cave of Goa Jomblang at 9:30 AM to catch the blinding heavenly light, then drive south to catch the reflective sunset mirror of Parangtritis Beach.";
        } else if (hasParangtritis) {
            advice += "Remember to avoid wearing bright green out of respect for Kanjeng Ratu Kidul when visiting Parangtritis. Have a relaxing evening horse carriage ride along the coastline!";
        } else if (hasMerapi) {
            advice += "Be prepared with a light windbreaker jacket for the chilly morning mountain breeze at Merapi. Do not miss visiting Kopi Klotok Pakem for crispy fried bananas afterwards!";
        } else {
            advice += "A wonderful combination! Ensure you leave 1.5 to 2 hours between destinations to accommodate travel and enjoy Javanese roadside scenery.";
        }
        return advice;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "trip-planner-page",
        className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row md:items-center md:justify-between border-b border-gold-100 pb-5 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-12 w-12 items-center justify-center rounded-full bg-royal-950 text-gold-300 shadow-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                    className: "h-6 w-6"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/TripPlanner.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-manrope text-2xl font-bold text-royal-950",
                                        children: tripPlan.title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-royal-700/80 font-light",
                                        children: "Craft your customizable itinerary, reorder visits, and review local transportation guides."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TripPlanner.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleAddDay,
                        className: "flex items-center space-x-1.5 rounded-full bg-gold-800 text-gold-50 px-5 py-2.5 text-xs font-semibold hover:bg-gold-700 active:scale-95 transition-all shadow-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Add Itinerary Day"
                            }, void 0, false, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TripPlanner.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TripPlanner.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-5 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-3xl border border-gold-100 bg-white p-5 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-manrope text-base font-bold text-royal-950 flex items-center space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex h-6 w-6 items-center justify-center rounded-full bg-gold-100 text-xs text-gold-700 font-mono",
                                                children: savedDestinations.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 156,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Saved Discoveries"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 159,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 155,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-royal-700/70 font-light",
                                        children: "Click the plus button to allocate these authentic spots into your daily trip slots."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 162,
                                        columnNumber: 13
                                    }, this),
                                    savedDestinations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center py-10 border border-dashed border-gold-200 rounded-2xl bg-gold-50/20 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                className: "h-8 w-8 text-gold-500 mx-auto mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 168,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-xs font-medium text-royal-950",
                                                children: "No saved favorites yet"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 169,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-[10px] text-royal-700/60 font-light mt-1",
                                                children: "Explore Yogyakarta destinations and click the heart icon on cards to save them."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 170,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3 max-h-[500px] overflow-y-auto pr-1",
                                        children: savedDestinations.map((dest)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                id: `planner-saved-card-${dest.id}`,
                                                className: "flex items-center justify-between rounded-2xl border border-gold-50 bg-white p-3 hover:border-gold-300 hover:shadow-sm transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>onExploreDestination(dest),
                                                        className: "flex items-center space-x-3 cursor-pointer flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: dest.images[0],
                                                                alt: dest.name,
                                                                className: "h-12 w-12 rounded-xl object-cover border border-gold-100"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                lineNumber: 186,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "font-manrope font-bold text-xs text-royal-950 hover:text-gold-700 transition-colors",
                                                                        children: dest.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                                        lineNumber: 188,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "block text-[10px] font-mono text-royal-700/50",
                                                                        children: dest.subRegion
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                                        lineNumber: 191,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                lineNumber: 187,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 182,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-1.5 ml-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center space-x-1 border border-gold-100 rounded-full px-2 py-1 bg-gold-50/30",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] font-mono font-semibold text-royal-950",
                                                                        children: "Add to:"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                                        lineNumber: 197,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        onChange: (e)=>{
                                                                            if (e.target.value) {
                                                                                handleAddDestinationToDay(dest, parseInt(e.target.value));
                                                                                e.target.value = '';
                                                                            }
                                                                        },
                                                                        className: "text-[9px] font-mono bg-transparent text-gold-700 font-bold focus:outline-none cursor-pointer",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "",
                                                                                children: "Choose Day"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                                lineNumber: 207,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            tripPlan.days.map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: day.dayNumber,
                                                                                    children: [
                                                                                        "Day ",
                                                                                        day.dayNumber
                                                                                    ]
                                                                                }, day.dayNumber, true, {
                                                                                    fileName: "[project]/src/components/TripPlanner.tsx",
                                                                                    lineNumber: 209,
                                                                                    columnNumber: 29
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                                        lineNumber: 198,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                lineNumber: 196,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>onRemoveFromSaved(dest),
                                                                className: "rounded-full p-1.5 text-royal-700/40 hover:text-red-500 hover:bg-red-50 transition-colors",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash$3e$__["Trash"], {
                                                                    className: "h-3.5 w-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TripPlanner.tsx",
                                                                    lineNumber: 218,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                lineNumber: 214,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 195,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, dest.id, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 177,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 175,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-3xl bg-gold-50/40 border border-gold-100/40 p-5 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "font-manrope text-sm font-bold text-royal-950",
                                        children: "Transportation Guide"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 229,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 text-xs text-royal-700 font-light leading-relaxed",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "• Royal Andong (Chariots):"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 232,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Best for relaxing rides around Malioboro and central heritage quarters. Negotiate fares beforehand (usually IDR 50k-100k)."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 231,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "• TransJogja Bus:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 235,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Air-conditioned public buses connecting major hubs (Sleman, Malioboro, Prambanan) for just IDR 3,600!"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 234,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "• Car/Jeep Rentals:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 238,
                                                        columnNumber: 17
                                                    }, this),
                                                    " Highly recommended for trips to high areas (Mount Merapi) or deep coastal cliffs (Parangtritis). Available with English-speaking guides."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 237,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TripPlanner.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-7 space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex space-x-2 border-b border-gold-100 pb-3 overflow-x-auto",
                                children: tripPlan.days.map((day, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveDayIdx(idx),
                                        className: `rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 ${activeDayIdx === idx ? 'bg-gold-800 text-gold-50 shadow-sm' : 'bg-white text-royal-700/60 hover:bg-gold-50 border border-gold-100'}`,
                                        children: [
                                            "Day ",
                                            day.dayNumber
                                        ]
                                    }, day.dayNumber, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 249,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 247,
                                columnNumber: 11
                            }, this),
                            activeDay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-3xl border border-gold-100 bg-white p-6 shadow-sm space-y-6 animate-fade-in",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-sans text-[10px] uppercase tracking-[0.08em] text-gold-600 font-semibold",
                                                        children: "Scheduled Itinerary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 268,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-manrope text-lg font-bold text-royal-950",
                                                        children: [
                                                            "Day ",
                                                            activeDay.dayNumber,
                                                            " Slots"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 269,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 267,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-mono font-medium text-royal-700/60",
                                                children: [
                                                    activeDay.destinations.length,
                                                    " Allocated"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 271,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 266,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-[10px] font-sans uppercase tracking-[0.08em] text-royal-700/70 font-semibold",
                                                children: "Focus of the Day"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 278,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "e.g. Exploring ancient palaces or beach sunsets...",
                                                value: activeDay.notes || '',
                                                onChange: (e)=>handleUpdateDayNotes(activeDay.dayNumber, e.target.value),
                                                className: "w-full rounded-xl border border-gold-100 bg-gold-50/20 px-4 py-2 text-xs text-royal-950 focus:outline-none focus:border-gold-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 279,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 277,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-[10px] font-sans uppercase tracking-[0.08em] text-royal-700/70 font-semibold",
                                                children: "Planned Route Sequence"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 290,
                                                columnNumber: 17
                                            }, this),
                                            activeDay.destinations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center py-10 border border-dashed border-gold-100 rounded-2xl bg-gold-50/20 text-xs text-royal-700/60 font-light",
                                                children: [
                                                    "Add destinations from your Saved Discoveries to design Day ",
                                                    activeDay.dayNumber,
                                                    "."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 293,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-3 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-gold-100",
                                                children: activeDay.destinations.map((dest, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        id: `planner-route-card-${dest.id}`,
                                                        className: "relative flex items-center justify-between rounded-2xl border border-gold-100 bg-white p-3.5 hover:border-gold-300 transition-all shadow-sm pl-12",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "absolute left-3.5 top-1/2 -translate-y-1/2 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-royal-950 text-gold-300 font-mono text-[11px] font-bold border border-gold-400",
                                                                children: idx + 1
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                lineNumber: 305,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center space-x-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: dest.images[0],
                                                                        alt: dest.name,
                                                                        className: "h-12 w-12 rounded-xl object-cover"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                                        lineNumber: 310,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "font-manrope font-bold text-xs text-royal-950 hover:text-gold-700 transition-colors",
                                                                                onClick: ()=>onExploreDestination(dest),
                                                                                children: dest.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                                lineNumber: 312,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-[10px] font-mono text-royal-700/50",
                                                                                children: [
                                                                                    dest.subRegion,
                                                                                    " • ",
                                                                                    dest.openingHours
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                                lineNumber: 315,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                                        lineNumber: 311,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                lineNumber: 309,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleRemoveFromDay(dest.id, activeDay.dayNumber),
                                                                className: "rounded-full p-2 text-royal-700/30 hover:text-red-500 hover:bg-red-50 transition-all",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash$3e$__["Trash"], {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/TripPlanner.tsx",
                                                                    lineNumber: 323,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                                lineNumber: 319,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, dest.id, true, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 299,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 297,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 289,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-2xl bg-royal-950 text-white p-5 border border-royal-900 shadow-md",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-2 text-gold-400 mb-2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-mono text-[9px] uppercase tracking-wider font-bold",
                                                        children: "Advisor Route Insights"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 333,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs italic text-gold-100/90 leading-relaxed font-light",
                                                children: [
                                                    '"',
                                                    getDailyAIAdvice(activeDay),
                                                    '"'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/TripPlanner.tsx",
                                                lineNumber: 337,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/TripPlanner.tsx",
                                        lineNumber: 332,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/TripPlanner.tsx",
                                lineNumber: 265,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/TripPlanner.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/TripPlanner.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/TripPlanner.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s(TripPlanner, "FP8sRa70VRJIgoJ8gvwS3VilTXA=");
_c = TripPlanner;
var _c;
__turbopack_context__.k.register(_c, "TripPlanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/InteractiveMap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InteractiveMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$car$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Car$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/car.js [app-client] (ecmascript) <export default as Car>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flame.js [app-client] (ecmascript) <export default as Flame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.js [app-client] (ecmascript) <export default as Compass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/navigation.js [app-client] (ecmascript) <export default as Navigation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bus.js [app-client] (ecmascript) <export default as Bus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const TRANSPORTATION_HUBS = [
    {
        id: 't-tugu',
        name: 'Yogyakarta Tugu Railway Station',
        type: 'rail',
        lat: -7.7891,
        lng: 110.3634,
        coords: {
            x: 42,
            y: 55
        }
    },
    {
        id: 't-lempuyangan',
        name: 'Lempuyangan Railway Station',
        type: 'rail',
        lat: -7.7900,
        lng: 110.3750,
        coords: {
            x: 50,
            y: 56
        }
    },
    {
        id: 't-giwangan',
        name: 'Giwangan Central Bus Terminal',
        type: 'bus',
        lat: -7.8341,
        lng: 110.3925,
        coords: {
            x: 56,
            y: 68
        }
    }
];
const PARKING_LOTS = [
    {
        id: 'pk-malioboro',
        name: 'Abu Bakar Ali Parking Ground',
        capacity: '150 cars, 500 motorbikes',
        coords: {
            x: 42,
            y: 53
        }
    },
    {
        id: 'pk-prambanan',
        name: 'Prambanan Main Temple Park',
        capacity: '300 cars, 100 buses',
        coords: {
            x: 74,
            y: 48
        }
    },
    {
        id: 'pk-depok',
        name: 'Parangtritis Marine Center Lot',
        capacity: '200 cars',
        coords: {
            x: 34,
            y: 92
        }
    }
];
function InteractiveMap({ onExploreDestination, selectedDestination }) {
    _s();
    const [activeLayer, setActiveLayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [showTraffic, setShowTraffic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showParking, setShowParking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showWalkingRoutes, setShowWalkingRoutes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedPin, setSelectedPin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Geographic positioning conversion inside our SVG canvas:
    // Sleman (Merapi) is in the North (Top: Y=15-35)
    // City (Malioboro, Taman Sari) is in the Center (Y=50-65)
    // Bantul (Parangtritis) is in the South (Bottom: Y=80-95)
    // We specify custom SVG x,y coordinate overrides for each destination:
    const getDestMapCoords = (id)=>{
        switch(id){
            case 'merapi':
                return {
                    x: 58,
                    y: 15
                };
            case 'prambanan':
                return {
                    x: 75,
                    y: 45
                };
            case 'malioboro':
                return {
                    x: 41,
                    y: 57
                };
            case 'tamansari':
                return {
                    x: 38,
                    y: 63
                };
            case 'parangtritis':
                return {
                    x: 35,
                    y: 92
                };
            case 'goajomblang':
                return {
                    x: 80,
                    y: 78
                };
            default:
                return {
                    x: 50,
                    y: 50
                };
        }
    };
    const handlePinClick = (pin)=>{
        setSelectedPin(pin);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "interactive-tourism-map",
        className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col lg:flex-row gap-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 rounded-3xl border border-gold-100 bg-gold-50/20 overflow-hidden relative shadow-lg flex flex-col h-[70vh] min-h-[500px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-4 left-4 z-10 flex flex-wrap gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowTraffic(!showTraffic),
                                    className: `rounded-full px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors flex items-center space-x-1 border shadow-sm ${showTraffic ? 'bg-red-700 text-white border-red-700' : 'bg-white text-royal-950 border-gold-100 hover:bg-gold-50'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flame$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Flame$3e$__["Flame"], {
                                            className: `h-3 w-3 ${showTraffic ? 'animate-pulse' : ''}`
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 67,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: showTraffic ? 'Traffic Live' : 'Traffic Off'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 68,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowParking(!showParking),
                                    className: `rounded-full px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors flex items-center space-x-1 border shadow-sm ${showParking ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-royal-950 border-gold-100 hover:bg-gold-50'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$car$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Car$3e$__["Car"], {
                                            className: "h-3 w-3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 79,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: showParking ? 'Parking Pins' : 'Parking Off'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 80,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 71,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowWalkingRoutes(!showWalkingRoutes),
                                    className: `rounded-full px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors flex items-center space-x-1 border shadow-sm ${showWalkingRoutes ? 'bg-green-700 text-white border-green-700' : 'bg-white text-royal-950 border-gold-100 hover:bg-gold-50'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__["Navigation"], {
                                            className: "h-3 w-3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 91,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: showWalkingRoutes ? 'Walking Routes' : 'Routes Off'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 92,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/InteractiveMap.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-4 right-4 z-10 flex flex-col space-y-2 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-gold-100 shadow-md",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[9px] font-mono font-bold text-royal-700 uppercase tracking-wider mb-1 block text-center",
                                    children: "Layers"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this),
                                [
                                    {
                                        id: 'all',
                                        label: 'All Items'
                                    },
                                    {
                                        id: 'destinations',
                                        label: 'Destinations Only'
                                    },
                                    {
                                        id: 'transport',
                                        label: 'Transports'
                                    }
                                ].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveLayer(l.id),
                                        className: `rounded-xl px-2.5 py-1 text-[9px] font-semibold text-left transition-colors uppercase font-mono ${activeLayer === l.id ? 'bg-gold-800 text-gold-50' : 'text-royal-700 hover:bg-gold-50'}`,
                                        children: l.label
                                    }, l.id, false, {
                                        fileName: "[project]/src/components/InteractiveMap.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/InteractiveMap.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-50/40 via-gold-50/20 to-blue-100/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "absolute inset-0 w-full h-full pointer-events-none",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M 150 150 L 580 50 L 950 150",
                                            fill: "none",
                                            stroke: "#ecd7a4",
                                            strokeWidth: "2",
                                            strokeDasharray: "4,4",
                                            opacity: "0.3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                            x: "58%",
                                            y: "9%",
                                            fill: "#cb8527",
                                            className: "font-mono text-[9px] font-bold uppercase tracking-widest opacity-60",
                                            children: "Merapi Volcanic Zone"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 121,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                            x: "0",
                                            y: "85%",
                                            width: "100%",
                                            height: "15%",
                                            fill: "#cb8527",
                                            opacity: "0.05"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 124,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M 0 85% Q 500 83% 1000 85%",
                                            fill: "none",
                                            stroke: "#cb8527",
                                            strokeWidth: "1.5",
                                            strokeDasharray: "3,3",
                                            opacity: "0.4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 125,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                            x: "35%",
                                            y: "98%",
                                            fill: "#7b4019",
                                            className: "font-mono text-[9px] font-bold uppercase tracking-widest opacity-60",
                                            children: "Indian Ocean Coastlines"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 126,
                                            columnNumber: 15
                                        }, this),
                                        showWalkingRoutes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M 41% 57% Q 58% 51% 75% 45%",
                                                    fill: "none",
                                                    stroke: "#d6a147",
                                                    strokeWidth: "2.5",
                                                    strokeDasharray: "5,5",
                                                    className: "animate-pulse",
                                                    opacity: "0.6"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M 41% 57% Q 60% 67% 80% 78%",
                                                    fill: "none",
                                                    stroke: "#d6a147",
                                                    strokeWidth: "2.5",
                                                    strokeDasharray: "5,5",
                                                    opacity: "0.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 134,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M 58% 15% Q 49.5% 36% 41% 57%",
                                                    fill: "none",
                                                    stroke: "#d6a147",
                                                    strokeWidth: "2.5",
                                                    strokeDasharray: "5,5",
                                                    opacity: "0.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true),
                                        showTraffic && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M 10% 50% L 90% 50%",
                                                    fill: "none",
                                                    stroke: "#ef4444",
                                                    strokeWidth: "5",
                                                    opacity: "0.4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M 41% 30% L 41% 90%",
                                                    fill: "none",
                                                    stroke: "#22c55e",
                                                    strokeWidth: "4",
                                                    opacity: "0.4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                    x: "75%",
                                                    y: "54%",
                                                    fill: "#ef4444",
                                                    className: "font-mono text-[8px] font-bold uppercase",
                                                    children: "Heavy Traffic (Solo Rd)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                (activeLayer === 'all' || activeLayer === 'destinations') && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].map((dest)=>{
                                    const coords = getDestMapCoords(dest.id);
                                    const isSelected = selectedDestination?.id === dest.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handlePinClick({
                                                id: dest.id,
                                                name: dest.name,
                                                type: 'destination',
                                                desc: dest.tagline,
                                                data: dest
                                            }),
                                        className: "absolute group z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center",
                                        style: {
                                            left: `${coords.x}%`,
                                            top: `${coords.y}%`
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'bg-gold-700 text-gold-200 border-2 border-gold-400' : 'bg-royal-950 text-gold-300 border border-gold-500/30'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                    className: "h-5 w-5 animate-bounce"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/InteractiveMap.tsx",
                                                lineNumber: 168,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mt-1 font-manrope font-bold text-[10px] text-royal-950 bg-white/95 backdrop-blur-sm border border-gold-200 px-2 py-0.5 rounded-full shadow-sm",
                                                children: dest.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/InteractiveMap.tsx",
                                                lineNumber: 177,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, dest.id, true, {
                                        fileName: "[project]/src/components/InteractiveMap.tsx",
                                        lineNumber: 156,
                                        columnNumber: 17
                                    }, this);
                                }),
                                activeLayer === 'all' && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].flatMap((d)=>d.partners).map((partner, idx)=>{
                                    // Distribute partner pins slightly surrounding their home destination coordinate
                                    const destCoords = getDestMapCoords(partner.id.startsWith('p-p') ? 'prambanan' : partner.id.startsWith('m-p') ? 'malioboro' : partner.id.startsWith('pt-p') ? 'parangtritis' : partner.id.startsWith('me-p') ? 'merapi' : partner.id.startsWith('ts-p') ? 'tamansari' : 'goajomblang');
                                    const offsetAngle = idx * 45 * (Math.PI / 180);
                                    const radius = 5.5; // Offset distance percentages
                                    const px = destCoords.x + Math.cos(offsetAngle) * radius;
                                    const py = destCoords.y + Math.sin(offsetAngle) * radius;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handlePinClick({
                                                id: partner.id,
                                                name: partner.name,
                                                type: 'partner',
                                                desc: partner.description,
                                                data: partner
                                            }),
                                        className: "absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10",
                                        style: {
                                            left: `${px}%`,
                                            top: `${py}%`
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-royal-950 border border-gold-600 shadow-sm hover:scale-110 transition-transform",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-bold",
                                                children: "P"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/InteractiveMap.tsx",
                                                lineNumber: 207,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 206,
                                            columnNumber: 19
                                        }, this)
                                    }, partner.id, false, {
                                        fileName: "[project]/src/components/InteractiveMap.tsx",
                                        lineNumber: 194,
                                        columnNumber: 17
                                    }, this);
                                }),
                                (activeLayer === 'all' || activeLayer === 'transport') && TRANSPORTATION_HUBS.map((hub)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handlePinClick({
                                                id: hub.id,
                                                name: hub.name,
                                                type: 'transport',
                                                desc: `Central transport node connecting Yogyakarta ecosystems.`
                                            }),
                                        className: "absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10",
                                        style: {
                                            left: `${hub.coords.x}%`,
                                            top: `${hub.coords.y}%`
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white border border-slate-600 shadow-md hover:scale-110 transition-transform",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bus$3e$__["Bus"], {
                                                    className: "h-4.5 w-4.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 227,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/InteractiveMap.tsx",
                                                lineNumber: 226,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[7px] font-mono font-semibold text-slate-800 bg-white/80 px-1 rounded",
                                                children: "Hub"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/InteractiveMap.tsx",
                                                lineNumber: 229,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, hub.id, true, {
                                        fileName: "[project]/src/components/InteractiveMap.tsx",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this)),
                                showParking && PARKING_LOTS.map((pk)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handlePinClick({
                                                id: pk.id,
                                                name: pk.name,
                                                type: 'parking',
                                                desc: `Public authorized vehicle parking lot. Space: ${pk.capacity}.`
                                            }),
                                        className: "absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10",
                                        style: {
                                            left: `${pk.coords.x}%`,
                                            top: `${pk.coords.y}%`
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white border border-blue-400 shadow-md",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-bold",
                                                children: "P"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/InteractiveMap.tsx",
                                                lineNumber: 247,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 246,
                                            columnNumber: 17
                                        }, this)
                                    }, pk.id, false, {
                                        fileName: "[project]/src/components/InteractiveMap.tsx",
                                        lineNumber: 235,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/InteractiveMap.tsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/InteractiveMap.tsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full lg:w-96 rounded-3xl border border-gold-100 bg-white p-5 flex flex-col justify-between shadow-md space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-2 border-b border-gold-100 pb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                            className: "h-5 w-5 text-gold-600 animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 258,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-manrope text-base font-bold text-royal-950",
                                            children: "Map Exploration Panel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 259,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 257,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-royal-700/70 font-light mt-2",
                                    children: "Select any pin on the vector map to coordinate travel routes, check parking, or find nearby hospitality partners."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 262,
                                    columnNumber: 13
                                }, this),
                                selectedPin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-5 space-y-4 animate-fade-in",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-block rounded-full bg-gold-100 px-3 py-1 text-[9px] font-sans font-semibold uppercase tracking-[0.08em] text-gold-700 border border-gold-200",
                                            children: selectedPin.type
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 269,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "font-manrope font-bold text-base text-royal-950 leading-snug",
                                            children: selectedPin.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 273,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-royal-700 leading-relaxed font-light",
                                            children: selectedPin.desc
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 277,
                                            columnNumber: 17
                                        }, this),
                                        selectedPin.type === 'destination' && selectedPin.data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3.5 border-t border-gold-50 pt-3.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between items-center text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-royal-700/60 font-mono",
                                                            children: "Admission Fee:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 285,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-bold text-royal-950",
                                                            children: selectedPin.data.ticketPrice
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 286,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 284,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between items-center text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-royal-700/60 font-mono",
                                                            children: "Opening hours:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 290,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-bold text-royal-950",
                                                            children: selectedPin.data.openingHours
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 291,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between items-center text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-royal-700/60 font-mono",
                                                            children: "Rating:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 295,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-bold text-royal-950 flex items-center space-x-0.5 font-mono",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                    className: "h-3 w-3 fill-gold-400 text-gold-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                                    lineNumber: 297,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: selectedPin.data.rating.toFixed(1)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                                    lineNumber: 298,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 296,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 294,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>onExploreDestination(selectedPin.data),
                                                    className: "w-full rounded-xl bg-gold-800 text-gold-50 py-2.5 text-xs font-semibold hover:bg-gold-700 active:scale-95 transition-all text-center flex items-center justify-center space-x-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Explore Full Details"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 306,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                                            className: "h-3.5 w-3.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 307,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 283,
                                            columnNumber: 19
                                        }, this),
                                        selectedPin.type === 'partner' && selectedPin.data && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3 border-t border-gold-50 pt-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-3 bg-gold-50 p-3 rounded-2xl border border-gold-100",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: selectedPin.data.image,
                                                            alt: selectedPin.name,
                                                            className: "h-14 w-14 rounded-xl object-cover"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 315,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] font-mono text-gold-700 uppercase font-bold tracking-widest",
                                                                    children: selectedPin.data.category
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                                    lineNumber: 317,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "block text-xs font-bold text-royal-950 line-clamp-1",
                                                                    children: selectedPin.data.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                                    lineNumber: 318,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "block text-[10px] font-mono text-royal-950/80 font-semibold",
                                                                    children: selectedPin.data.price
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                                    lineNumber: 319,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                                            lineNumber: 316,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 314,
                                                    columnNumber: 21
                                                }, this),
                                                selectedPin.data.promotion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-gold-500/10 border border-gold-300 rounded-xl p-2.5 text-[10px] font-mono text-gold-800 font-bold",
                                                    children: [
                                                        "Exclusive Deal: ",
                                                        selectedPin.data.promotion
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                                    lineNumber: 323,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 313,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 268,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-10 text-center py-10 border border-dashed border-gold-200 rounded-2xl bg-gold-50/10 p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                            className: "h-8 w-8 text-gold-500 mx-auto mb-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 332,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block text-xs font-medium text-royal-950",
                                            children: "No Pin Selected"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 333,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "block text-[10px] text-royal-700/60 font-light mt-1",
                                            children: "Click on any of the destination, partner or transport pins on the map to display instant spatial information."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/InteractiveMap.tsx",
                                            lineNumber: 334,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 331,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/InteractiveMap.tsx",
                            lineNumber: 256,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gold-50 border border-gold-100 rounded-2xl p-4.5 text-xs text-royal-700 font-light space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "font-manrope font-bold text-xs text-royal-950",
                                    children: "Grounded Tourist GPS Note"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 342,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "leading-relaxed text-[11px]",
                                    children: "Yogyakarta's core attractions are separated in natural subregions. Always plan transport paths early! Giwangan and Tugu Station offer seamless connections."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/InteractiveMap.tsx",
                                    lineNumber: 343,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/InteractiveMap.tsx",
                            lineNumber: 341,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/InteractiveMap.tsx",
                    lineNumber: 255,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/InteractiveMap.tsx",
            lineNumber: 53,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/InteractiveMap.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_s(InteractiveMap, "sRQpembpLbXAMv8LmraEUg5e1zY=");
_c = InteractiveMap;
var _c;
__turbopack_context__.k.register(_c, "InteractiveMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/App.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Hero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Hero.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CategoryLinks$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/CategoryLinks.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DestinationCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DestinationDetail.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ConversationalAI$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ConversationalAI.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TripPlanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TripPlanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InteractiveMap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/InteractiveMap.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$quote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Quote$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/quote.js [app-client] (ecmascript) <export default as Quote>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.js [app-client] (ecmascript) <export default as Compass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/brain.js [app-client] (ecmascript) <export default as Brain>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Utensils$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/utensils.js [app-client] (ecmascript) <export default as Utensils>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$leaf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Leaf$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/leaf.js [app-client] (ecmascript) <export default as Leaf>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunset$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunset$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sunset.js [app-client] (ecmascript) <export default as Sunset>");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
function App() {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('discover');
    const [selectedDestination, setSelectedDestination] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedCategory, setSelectedCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [conversationalQuery, setConversationalQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [initialImageResult, setInitialImageResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Persistent local favorites storage
    const [savedDestinations, setSavedDestinations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "App.useState": ()=>{
            try {
                const saved = localStorage.getItem('explore_jogja_saved_v1');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Map back to current full destination data structure to prevent stale cache bugs
                    return parsed.map({
                        "App.useState": (item)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find({
                                "App.useState": (d)=>d.id === item.id
                            }["App.useState"])
                    }["App.useState"]).filter(Boolean);
                }
            } catch (e) {
                console.error("Local storage read failed:", e);
            }
            return [];
        }
    }["App.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "App.useEffect": ()=>{
            try {
                localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations));
            } catch (e) {
                console.error("Local storage write failed:", e);
            }
        }
    }["App.useEffect"], [
        savedDestinations
    ]);
    const handleToggleSave = (dest)=>{
        setSavedDestinations((prev)=>{
            const exists = prev.some((d)=>d.id === dest.id);
            if (exists) {
                return prev.filter((d)=>d.id !== dest.id);
            } else {
                return [
                    ...prev,
                    dest
                ];
            }
        });
    };
    const isSaved = (id)=>{
        return savedDestinations.some((d)=>d.id === id);
    };
    const handleHeroSearch = (query)=>{
        setConversationalQuery(query);
        setActiveTab('ai-assistant');
        setSelectedDestination(null);
    };
    const handleHeroImageSearch = (imageUrl, reply, matchedDestinationIds)=>{
        setInitialImageResult({
            imageUrl,
            reply,
            matchedDestinationIds
        });
        setActiveTab('ai-assistant');
        setSelectedDestination(null);
    };
    const handleExploreDestination = (dest)=>{
        setSelectedDestination(dest);
        // Scroll details panel smoothly to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    // Quick helper to choose random quote
    const [quoteIdx, setQuoteIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "App.useEffect": ()=>{
            setQuoteIdx(Math.floor(Math.random() * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOGJA_QUOTES"].length));
        }
    }["App.useEffect"], [
        activeTab
    ]);
    const filteredDestinations = selectedCategory ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].filter((d)=>d.category === selectedCategory) : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"];
    const defaultSortedIds = [
        'prambanan',
        'parangtritis',
        'malioboro',
        'tamansari',
        'merapi',
        'kalibiru'
    ];
    const displayDestinations = selectedCategory ? filteredDestinations : defaultSortedIds.map((id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === id)).filter((d)=>d !== undefined);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "explore-jogja-app-root",
        className: "min-h-screen bg-[#faf9f6] flex flex-col justify-between",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                activeTab: activeTab,
                setActiveTab: (tab)=>{
                    if (tab === 'events') {
                        setActiveTab('discover');
                        setSelectedDestination(null);
                        setTimeout(()=>{
                            const el = document.getElementById('upcoming-festivals-showcase');
                            if (el) {
                                const headerOffset = 80;
                                const elementPosition = el.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }, 150);
                    } else if (tab === 'experiences') {
                        setActiveTab('discover');
                        setSelectedDestination(null);
                        setTimeout(()=>{
                            const el = document.getElementById('trending-destinations-showcase');
                            if (el) {
                                const headerOffset = 80;
                                const elementPosition = el.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }, 150);
                    } else {
                        setActiveTab(tab);
                        setSelectedDestination(null); // Clear active details overlay when navigating away
                    }
                },
                savedCount: savedDestinations.length,
                isOverHero: activeTab === 'discover' && !selectedDestination
            }, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                id: "main-content-layout",
                className: "flex-1 pb-16",
                children: selectedDestination ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationDetail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    destination: selectedDestination,
                    onBack: ()=>setSelectedDestination(null),
                    onToggleSave: handleToggleSave,
                    isSaved: isSaved(selectedDestination.id)
                }, void 0, false, {
                    fileName: "[project]/src/App.tsx",
                    lineNumber: 151,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        activeTab === 'discover' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 animate-fade-in",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Hero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    onSearchSubmit: handleHeroSearch,
                                    onImageSearchSubmit: handleHeroImageSearch,
                                    onExploreDestination: handleExploreDestination,
                                    onToggleSave: handleToggleSave,
                                    isSaved: isSaved
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 163,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CategoryLinks$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    selectedCategory: selectedCategory,
                                    onSelectCategory: setSelectedCategory
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 172,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    id: "trending-destinations-showcase",
                                    className: "mx-auto max-w-7xl px-4 pt-1 pb-8 sm:px-6 lg:px-8 sm:pt-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-end justify-between mb-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-sans text-[10px] uppercase tracking-[0.08em] text-gold-600 font-semibold mb-1 block",
                                                            children: selectedCategory ? 'CURATED COLLECTION' : 'LOCAL FAVORITES'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 181,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "font-manrope text-2xl sm:text-3xl font-bold tracking-tight text-royal-950",
                                                            children: selectedCategory ? `Curated ${selectedCategory.replace('-', ' ')}` : 'Trending Destinations'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 184,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 180,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setSelectedCategory(null),
                                                    className: "text-xs sm:text-sm font-semibold text-royal-700/80 hover:text-gold-600 transition-colors flex items-center space-x-0.5 border-b border-royal-700/10 hover:border-gold-600 pb-0.5 cursor-pointer",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "See all"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 195,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: ">"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 196,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 179,
                                            columnNumber: 19
                                        }, this),
                                        displayDestinations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center py-12 border border-dashed border-gold-200 rounded-3xl bg-white p-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-sm font-medium text-royal-950",
                                                children: "No matches found for this category"
                                            }, void 0, false, {
                                                fileName: "[project]/src/App.tsx",
                                                lineNumber: 202,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 201,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6",
                                            children: displayDestinations.map((dest)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    destination: dest,
                                                    onExplore: handleExploreDestination,
                                                    onToggleSave: handleToggleSave,
                                                    isSaved: isSaved(dest.id),
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isLandscape"])(dest.id) ? 'sm:col-span-2 lg:col-span-2' : 'sm:col-span-1 lg:col-span-1'
                                                }, dest.id, false, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 207,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 205,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 178,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    id: "upcoming-festivals-showcase",
                                    className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 lg:grid-cols-12 gap-8",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "lg:col-span-7 flex flex-col",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-end justify-between mb-5 border-b border-stone-200/50 pb-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-left",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                        className: "font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950",
                                                                        children: "Upcoming Festivals"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 228,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-stone-500/80 mt-0.5",
                                                                        children: "Don't miss what's happening"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 231,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 227,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center space-x-0.5 cursor-pointer",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "See all"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 234,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "→"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 235,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 233,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/App.tsx",
                                                        lineNumber: 226,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FESTIVALS"].slice(0, 3).map((fest, idx)=>{
                                                            const badges = [
                                                                "Limited",
                                                                "Popular",
                                                                "Live Tonight"
                                                            ];
                                                            const subBadge = [
                                                                "Starts in 5 Days",
                                                                "Starts in 18 Days",
                                                                "Tonight • 7 PM"
                                                            ];
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "group relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-stone-200/10",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: fest.image,
                                                                        alt: fest.name,
                                                                        className: "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 248,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 253,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute top-3.5 left-3.5 bg-red-600 border border-red-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold text-white uppercase tracking-[0.08em]",
                                                                        children: badges[idx] || fest.category.toUpperCase()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 256,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        className: "absolute top-3.5 right-3.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                                            className: "h-3.5 w-3.5 text-white"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 262,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 261,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-left",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[9px] font-sans font-semibold text-gold-400 mb-1 tracking-[0.08em] uppercase",
                                                                                children: subBadge[idx] || "Upcoming"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/App.tsx",
                                                                                lineNumber: 268,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                className: "font-manrope text-sm font-bold tracking-tight text-white leading-tight mb-2 group-hover:text-gold-300 transition-colors",
                                                                                children: fest.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/App.tsx",
                                                                                lineNumber: 272,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-[10px] text-white/60 font-light",
                                                                                children: [
                                                                                    fest.date,
                                                                                    " • ",
                                                                                    fest.location
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/App.tsx",
                                                                                lineNumber: 276,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "absolute bottom-4 right-4 h-6.5 w-6.5 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                    className: "h-3 w-3 stroke-current",
                                                                                    viewBox: "0 0 24 24",
                                                                                    fill: "none",
                                                                                    strokeWidth: "3",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                        d: "M5 12h14M12 5l7 7-7 7"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/App.tsx",
                                                                                        lineNumber: 283,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/App.tsx",
                                                                                    lineNumber: 282,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/App.tsx",
                                                                                lineNumber: 281,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 266,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, fest.id, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 244,
                                                                columnNumber: 29
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/App.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/App.tsx",
                                                lineNumber: 225,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "lg:col-span-5 flex flex-col",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-end justify-between mb-5 border-b border-stone-200/50 pb-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-left",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                        className: "font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950",
                                                                        children: "AI Picks Just for You"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 297,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-stone-500/80 mt-0.5",
                                                                        children: "Personalized for today's vibes"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 300,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 296,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center space-x-0.5 cursor-pointer",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "See all"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 303,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "→"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 304,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 302,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/App.tsx",
                                                        lineNumber: 295,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-2 gap-4 h-full",
                                                        children: [
                                                            (()=>{
                                                                const dest = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === 'merapi') || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"][0];
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    onClick: ()=>handleExploreDestination(dest),
                                                                    className: "group relative h-full min-h-[220px] lg:min-h-0 w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-stone-200/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                            src: dest.images[0],
                                                                            alt: dest.name,
                                                                            className: "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 317,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 322,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute top-3.5 left-3.5 bg-amber-500 border border-amber-400/10 px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold text-white uppercase tracking-[0.08em]",
                                                                            children: "AI Pick Today"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 325,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            className: "absolute top-3.5 right-3.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                                                className: "h-3.5 w-3.5 text-white"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/App.tsx",
                                                                                lineNumber: 331,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 330,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-left",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                    className: "font-manrope text-sm font-bold tracking-tight text-white leading-tight mb-2.5 group-hover:text-gold-300 transition-colors",
                                                                                    children: dest.name
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/App.tsx",
                                                                                    lineNumber: 336,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center justify-between",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center space-x-1.5",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[10px] font-mono text-gold-400 font-bold",
                                                                                                    children: "★ 4.8"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/App.tsx",
                                                                                                    lineNumber: 342,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[9px] font-mono font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded",
                                                                                                    children: "Low Crowd"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/App.tsx",
                                                                                                    lineNumber: 343,
                                                                                                    columnNumber: 37
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/App.tsx",
                                                                                            lineNumber: 341,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "h-6.5 w-6.5 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center shadow-md group-hover:bg-gold-300 transition-colors",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                                className: "h-3.5 w-3.5 stroke-current",
                                                                                                viewBox: "0 0 24 24",
                                                                                                fill: "none",
                                                                                                strokeWidth: "3",
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                    d: "M5 12h14M12 5l7 7-7 7"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/App.tsx",
                                                                                                    lineNumber: 347,
                                                                                                    columnNumber: 39
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/App.tsx",
                                                                                                lineNumber: 346,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/App.tsx",
                                                                                            lineNumber: 345,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/App.tsx",
                                                                                    lineNumber: 340,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 335,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 313,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })(),
                                                            (()=>{
                                                                const dest = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === 'goajomblang') || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"][1];
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    onClick: ()=>handleExploreDestination(dest),
                                                                    className: "group relative h-full min-h-[220px] lg:min-h-0 w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-stone-200/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                            src: dest.images[0],
                                                                            alt: dest.name,
                                                                            className: "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 364,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 369,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute top-3.5 left-3.5 bg-emerald-600 border border-emerald-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold text-white uppercase tracking-[0.08em]",
                                                                            children: "Hidden Gem"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 372,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            className: "absolute top-3.5 right-3.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                                                className: "h-3.5 w-3.5 text-white"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/App.tsx",
                                                                                lineNumber: 378,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 377,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-left",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                    className: "font-manrope text-sm font-bold tracking-tight text-white leading-tight mb-2.5 group-hover:text-gold-300 transition-colors",
                                                                                    children: dest.name
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/App.tsx",
                                                                                    lineNumber: 383,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center justify-between",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center space-x-1.5",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[10px] font-mono text-gold-400 font-bold",
                                                                                                    children: "★ 4.9"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/App.tsx",
                                                                                                    lineNumber: 389,
                                                                                                    columnNumber: 37
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[9px] font-mono font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded",
                                                                                                    children: "Heavenly Light"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/App.tsx",
                                                                                                    lineNumber: 390,
                                                                                                    columnNumber: 37
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/App.tsx",
                                                                                            lineNumber: 388,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "h-6.5 w-6.5 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center shadow-md group-hover:bg-gold-300 transition-colors",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                                className: "h-3.5 w-3.5 stroke-current",
                                                                                                viewBox: "0 0 24 24",
                                                                                                fill: "none",
                                                                                                strokeWidth: "3",
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                    d: "M5 12h14M12 5l7 7-7 7"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/App.tsx",
                                                                                                    lineNumber: 394,
                                                                                                    columnNumber: 39
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/App.tsx",
                                                                                                lineNumber: 393,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/App.tsx",
                                                                                            lineNumber: 392,
                                                                                            columnNumber: 35
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/App.tsx",
                                                                                    lineNumber: 387,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 382,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 360,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/App.tsx",
                                                        lineNumber: 308,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/App.tsx",
                                                lineNumber: 294,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/App.tsx",
                                        lineNumber: 222,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 221,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    id: "ai-suggested-journey-timeline",
                                    className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 border-b border-stone-200/50 pb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-left",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950",
                                                            children: "AI Suggested Journey"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 412,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-stone-500/80 mt-0.5",
                                                            children: "One perfect day in Jogja"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 415,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 411,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setActiveTab('planner'),
                                                    className: "mt-2 sm:mt-0 text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center space-x-0.5 border-b border-gold-700/10 hover:border-gold-900 pb-0.5 cursor-pointer w-fit",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Customize with AI"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 421,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "→"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 422,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 417,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 410,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2.5 sm:space-x-3.5 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0",
                                            children: [
                                                (()=>{
                                                    const dest = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === 'prambanan') || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"][0];
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>handleExploreDestination(dest),
                                                        className: "flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#B18A5E]",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                                                            className: "h-4.5 w-4.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 439,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 438,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block",
                                                                        children: "Morning"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 441,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block",
                                                                        children: "07.00 AM"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 442,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 437,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: dest.images[0],
                                                                        className: "w-full h-full object-cover",
                                                                        referrerPolicy: "no-referrer"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 445,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 text-left",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[9px] sm:text-[10px] font-bold text-white block truncate leading-none",
                                                                            children: "Prambanan Temple"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 447,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 446,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 444,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/App.tsx",
                                                        lineNumber: 433,
                                                        columnNumber: 25
                                                    }, this);
                                                })(),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-shrink-0 text-[#A78B71]/40 font-bold text-base sm:text-lg",
                                                    children: "→"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 455,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: ()=>handleHeroSearch('kuliner tradisional gudeg yu djum'),
                                                    className: "flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#5F713D]",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Utensils$3e$__["Utensils"], {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 464,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 463,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block",
                                                                    children: "Lunch"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 466,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block",
                                                                    children: "12.00 PM"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 467,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] sm:text-[10px] text-stone-500 font-medium truncate mt-1 max-w-[85px] sm:max-w-[95px] leading-tight block",
                                                                    children: "Gudeg Yu Djum"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 468,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 462,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600",
                                                                className: "w-full h-full object-cover",
                                                                referrerPolicy: "no-referrer"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 471,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/App.tsx",
                                                            lineNumber: 470,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 458,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-shrink-0 text-[#A78B71]/40 font-bold text-base sm:text-lg",
                                                    children: "→"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 476,
                                                    columnNumber: 21
                                                }, this),
                                                (()=>{
                                                    const dest = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === 'tamansari') || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"][3];
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>handleExploreDestination(dest),
                                                        className: "flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#4F6F52]",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$leaf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Leaf$3e$__["Leaf"], {
                                                                            className: "h-4 w-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 488,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 487,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block",
                                                                        children: "Afternoon"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 490,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block",
                                                                        children: "02.30 PM"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 491,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] sm:text-[10px] text-stone-500 font-medium truncate mt-1 max-w-[85px] sm:max-w-[95px] leading-tight block",
                                                                        children: "Taman Sari"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 492,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 486,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: dest.images[0],
                                                                    className: "w-full h-full object-cover",
                                                                    referrerPolicy: "no-referrer"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 495,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 494,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/App.tsx",
                                                        lineNumber: 482,
                                                        columnNumber: 25
                                                    }, this);
                                                })(),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-shrink-0 text-[#A78B71]/40 font-bold text-base sm:text-lg",
                                                    children: "→"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 502,
                                                    columnNumber: 21
                                                }, this),
                                                (()=>{
                                                    const dest = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"].find((d)=>d.id === 'parangtritis') || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DESTINATIONS"][1];
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>handleExploreDestination(dest),
                                                        className: "flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#BC6C25]",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sunset$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sunset$3e$__["Sunset"], {
                                                                            className: "h-4.5 w-4.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/App.tsx",
                                                                            lineNumber: 514,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 513,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block",
                                                                        children: "Sunset"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 516,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block",
                                                                        children: "05.30 PM"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 517,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] sm:text-[10px] text-stone-500 font-medium truncate mt-1 max-w-[85px] sm:max-w-[95px] leading-tight block",
                                                                        children: "Parangtritis Beach"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/App.tsx",
                                                                        lineNumber: 518,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 512,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: dest.images[0],
                                                                    className: "w-full h-full object-cover",
                                                                    referrerPolicy: "no-referrer"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/App.tsx",
                                                                    lineNumber: 521,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/App.tsx",
                                                                lineNumber: 520,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/App.tsx",
                                                        lineNumber: 508,
                                                        columnNumber: 25
                                                    }, this);
                                                })()
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 427,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 409,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    id: "literary-quote-section",
                                    className: "mx-auto max-w-4xl px-4 py-8 text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative p-8 rounded-3xl bg-gold-50/30 border border-gold-100/40 shadow-inner flex flex-col items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$quote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Quote$3e$__["Quote"], {
                                                className: "h-8 w-8 text-gold-400 opacity-60 mb-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/App.tsx",
                                                lineNumber: 533,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-display text-lg italic text-royal-950/90 leading-relaxed max-w-xl",
                                                children: [
                                                    '"',
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOGJA_QUOTES"][quoteIdx].text,
                                                    '"'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/App.tsx",
                                                lineNumber: 534,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block mt-3 text-xs uppercase tracking-wider font-mono font-bold text-gold-700",
                                                children: [
                                                    "— ",
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOGJA_QUOTES"][quoteIdx].author
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/App.tsx",
                                                lineNumber: 537,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/App.tsx",
                                        lineNumber: 532,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 531,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/App.tsx",
                            lineNumber: 161,
                            columnNumber: 15
                        }, this),
                        activeTab === 'ai-assistant' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ConversationalAI$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            initialQuery: conversationalQuery,
                            initialImageResult: initialImageResult,
                            onClearImageResult: ()=>setInitialImageResult(null),
                            onExploreDestination: handleExploreDestination,
                            onToggleSave: handleToggleSave,
                            isSaved: isSaved
                        }, void 0, false, {
                            fileName: "[project]/src/App.tsx",
                            lineNumber: 547,
                            columnNumber: 15
                        }, this),
                        activeTab === 'planner' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TripPlanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            savedDestinations: savedDestinations,
                            onExploreDestination: handleExploreDestination,
                            onRemoveFromSaved: handleToggleSave
                        }, void 0, false, {
                            fileName: "[project]/src/App.tsx",
                            lineNumber: 559,
                            columnNumber: 15
                        }, this),
                        activeTab === 'map' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InteractiveMap$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            onExploreDestination: handleExploreDestination,
                            selectedDestination: selectedDestination
                        }, void 0, false, {
                            fileName: "[project]/src/App.tsx",
                            lineNumber: 568,
                            columnNumber: 15
                        }, this),
                        activeTab === 'saved' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            id: "saved-bookmarks-dashboard",
                            className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col space-y-2 mb-8 border-b border-gold-100 pb-5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                    className: "h-5 w-5 fill-gold-600 text-gold-600 animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 579,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "font-manrope text-2xl font-bold text-royal-950",
                                                    children: "Your Bookmarked Discoveries"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/App.tsx",
                                                    lineNumber: 580,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 578,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-royal-700/80 font-light",
                                            children: "Your customized offline-saved library. You can immediately allocate these favorited sights into your Trip Planner slots."
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 582,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 577,
                                    columnNumber: 17
                                }, this),
                                savedDestinations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-white p-6 max-w-md mx-auto",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                            className: "h-10 w-10 text-gold-500 mx-auto mb-3 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 589,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-manrope text-base font-bold text-royal-950",
                                            children: "No Saved Places"
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 590,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-royal-700/60 font-light mt-1 max-w-xs mx-auto",
                                            children: "Whenever you explore Yogyakarta destinations, click the heart icon to persist them securely inside this dashboard."
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 591,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 588,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
                                    children: savedDestinations.map((dest)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DestinationCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            destination: dest,
                                            onExplore: handleExploreDestination,
                                            onToggleSave: handleToggleSave,
                                            isSaved: isSaved(dest.id)
                                        }, dest.id, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 598,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 596,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/App.tsx",
                            lineNumber: 576,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                id: "editorial-luxury-footer",
                className: "bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center md:justify-start space-x-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-manrope text-gold-300 font-bold text-lg",
                                            children: "Ψ"
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 619,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-manrope font-bold text-sm tracking-[0.08em] uppercase text-white",
                                            children: "Explore Yogyakarta"
                                        }, void 0, false, {
                                            fileName: "[project]/src/App.tsx",
                                            lineNumber: 620,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 618,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-gold-100/40 font-mono tracking-widest uppercase mt-1",
                                    children: "AI Tourism Discovery & Ecosystem Gateway • Yogyakarta DIY"
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 622,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/App.tsx",
                            lineNumber: 617,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[10px] font-mono text-gold-200/40 uppercase tracking-widest space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "© 2026 Explore Jogja Platform • DIY Tourism Department Ecosystem Partner"
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 628,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Made with deep hospitality & Javanese cultural heritage"
                                }, void 0, false, {
                                    fileName: "[project]/src/App.tsx",
                                    lineNumber: 629,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/App.tsx",
                            lineNumber: 627,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/App.tsx",
                    lineNumber: 616,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 615,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-royal-950/95 backdrop-blur-md border-t border-royal-900 px-4 py-2.5 flex justify-around items-center text-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setActiveTab('discover');
                            setSelectedDestination(null);
                        },
                        className: `flex flex-col items-center justify-center space-y-0.5 ${activeTab === 'discover' ? 'text-gold-400 font-semibold' : 'text-white/60'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 645,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px]",
                                children: "Explore"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 646,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 636,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setActiveTab('ai-assistant');
                            setSelectedDestination(null);
                        },
                        className: `flex flex-col items-center justify-center space-y-0.5 ${activeTab === 'ai-assistant' ? 'text-gold-400 font-semibold' : 'text-white/60'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Brain$3e$__["Brain"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 658,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px]",
                                children: "AI Assistant"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 659,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 649,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setActiveTab('planner');
                            setSelectedDestination(null);
                        },
                        className: `flex flex-col items-center justify-center space-y-0.5 ${activeTab === 'planner' ? 'text-gold-400 font-semibold' : 'text-white/60'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 671,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px]",
                                children: "Planner"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 672,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 662,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setActiveTab('map');
                            setSelectedDestination(null);
                        },
                        className: `flex flex-col items-center justify-center space-y-0.5 ${activeTab === 'map' ? 'text-gold-400 font-semibold' : 'text-white/60'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 684,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px]",
                                children: "Map"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 685,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 675,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setActiveTab('saved');
                            setSelectedDestination(null);
                        },
                        className: `flex flex-col items-center justify-center space-y-0.5 relative ${activeTab === 'saved' ? 'text-gold-400 font-semibold' : 'text-white/60'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                className: `h-5 w-5 ${savedDestinations.length > 0 ? 'fill-gold-400 text-gold-400' : ''}`
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 697,
                                columnNumber: 11
                            }, this),
                            savedDestinations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white",
                                children: savedDestinations.length
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 699,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px]",
                                children: "Saved"
                            }, void 0, false, {
                                fileName: "[project]/src/App.tsx",
                                lineNumber: 703,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/App.tsx",
                        lineNumber: 688,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/App.tsx",
                lineNumber: 635,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/App.tsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
_s(App, "wBX0FdIsvQVYSr/A3NQ8p2ulXsQ=");
_c = App;
var _c;
__turbopack_context__.k.register(_c, "App");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$App$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/App.tsx [app-client] (ecmascript)");
'use client';
;
;
;
function HomePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$App$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 9,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0tj4ee4._.js.map