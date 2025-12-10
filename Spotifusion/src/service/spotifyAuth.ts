import { clientId, redirectUri } from "../config";

const ACCESS_TOKEN_KEY = "spotify_access_token";
const REFRESH_TOKEN_KEY = "spotify_refresh_token";
const TOKEN_EXPIRY_KEY = "spotify_token_expiry";
const CODE_VERIFIER_KEY = "spotify_code_verifier";

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

export function generateCodeVerifier(length = 128): string {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let verifier = "";
    for (let i = 0; i < length; i++) {
        verifier += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return verifier;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(digest);
}

export function storeCodeVerifier(verifier: string): void {
    localStorage.setItem(CODE_VERIFIER_KEY, verifier);
}

export function getStoredCodeVerifier(): string | null {
    return localStorage.getItem(CODE_VERIFIER_KEY);
}

function storeTokens(tokenResponse: TokenResponse): void {
    const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

export function getStoredAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    const bufferTime = 5 * 60 * 1000;
    return Date.now() > parseInt(expiryTime) - bufferTime;
}

export function isAuthenticated(): boolean {
    return getStoredRefreshToken() !== null;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    const codeVerifier = getStoredCodeVerifier();

    if (!codeVerifier) {
        throw new Error("No code verifier found in storage");
    }

    const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    const tokenData: TokenResponse = await response.json();
    storeTokens(tokenData);
    localStorage.removeItem(CODE_VERIFIER_KEY);

    return tokenData;
}

export async function refreshAccessToken(): Promise<string> {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 401) {
            clearTokens();
        }
        throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
    }

    const tokenData: TokenResponse = await response.json();
    storeTokens(tokenData);

    return tokenData.access_token;
}

export async function getValidAccessToken(): Promise<string> {
    if (!isAuthenticated()) {
        throw new Error("User not authenticated");
    }

    if (isTokenExpired()) {
        return await refreshAccessToken();
    }

    const token = getStoredAccessToken();
    if (!token) {
        throw new Error("No access token found");
    }

    return token;
}

export function clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(CODE_VERIFIER_KEY);
}

export function logout(): void {
    clearTokens();
    window.location.href = "/";
}
