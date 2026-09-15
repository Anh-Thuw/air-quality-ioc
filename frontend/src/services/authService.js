// Service goi API dang nhap va quan ly token - luu token vao localStorage
// Dat vao: frontend/src/services/authService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
const TOKEN_KEY = "admin_token";

export async function login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Dang nhap that bai");

    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
    return !!getToken();
}

// Goi API can token - tu dong gan header Authorization
export async function authFetch(path, options = {}) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Loi khi goi API");
    return data;
}