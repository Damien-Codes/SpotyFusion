// src/components/LoginButton.tsx
import React from "react";
import { clientId, redirectUri, scopes } from "../config";

// --- Génère un code verifier (128 caractères aléatoires)
function generateCodeVerifier(length = 128) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let verifier = "";
  for (let i = 0; i < length; i++) {
    verifier += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return verifier;
}

// --- Encode en base64 URL Safe
function base64UrlEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// --- SHA256 du verifier pour obtenir le challenge
async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

const LoginButton: React.FC = () => {
  const handleLogin = async () => {
    // 1. Générer le code_verifier
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    // 2. Générer le code_challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // 3. URL d'autorisation Spotify (PKCE)
    const url =
      "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: scopes,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
      }).toString();

    // 4. Redirection vers Spotify
    window.location.href = url;
  };

  return (
    <button className="spotify-button" onClick={handleLogin}>
      Se connecter avec Spotify
    </button>
  );
};

export default LoginButton;
