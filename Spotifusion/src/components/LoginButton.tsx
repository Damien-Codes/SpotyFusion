import React from "react";
import { clientId, redirectUri, scopes } from "../config";

const LoginButton: React.FC = () => {
  const handleLogin = () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = url;
  };

  return <button onClick={handleLogin}>Se connecter avec Spotify</button>;
};

export default LoginButton;
