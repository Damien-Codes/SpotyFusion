import React from "react";
import { clientId, redirectUri, scopes } from "../config";

function generateCodeVerifier(length = 128) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let verifier = "";
  for (let i = 0; i < length; i++) {
    verifier += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return verifier;
}

function base64UrlEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

async function handleLogin() {
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

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

    window.location.href = url;
  };

const LoginButton: React.FC = () => {
  return (
    <button onClick={handleLogin}>
      Se connecter avec Spotify
    </button>
  );
};

export default LoginButton;
