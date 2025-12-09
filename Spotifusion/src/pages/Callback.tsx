import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clientId, redirectUri } from "../config";

async function handleAuth() {
  const params = new URLSearchParams(window.location.search);

  const code = params.get("code");
  const error = params.get("error");

  if (error) { console.error("Spotify auth error:", error); return; }
  if (!code) { console.error("No code in URL");             return; }

  const codeVerifier = localStorage.getItem("spotify_code_verifier");
  if (!codeVerifier) { console.error("No code_verifier stored"); return; }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  });

  try {
    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }).then(async (res) => {
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("spotify_token", data.access_token);
      } else {
        console.error("No access_token in response", data);
      }
    });
  } catch (err) {
    console.error("Token request failed", err);
  }
}

const Callback: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => { 
    if (localStorage.getItem("spotify_token") == null) handleAuth();
    navigate("/dashboard"); 
});
  return <div>Authentification Spotify en cours...</div>;
};

export default Callback;
