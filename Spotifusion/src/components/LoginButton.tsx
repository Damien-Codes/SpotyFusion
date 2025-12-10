import React from "react";
import { clientId, redirectUri, scopes } from "../config";
import { 
  generateCodeVerifier, 
  generateCodeChallenge, 
  storeCodeVerifier 
} from "../service/spotifyAuth";

async function handleLogin() {
  const codeVerifier = generateCodeVerifier();
  storeCodeVerifier(codeVerifier);
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
}

const LoginButton: React.FC = () => {
  return (
    <button onClick={handleLogin}>
      Se connecter avec Spotify
    </button>
  );
};

export default LoginButton;
