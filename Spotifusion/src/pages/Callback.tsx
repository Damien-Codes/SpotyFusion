// src/pages/Callback.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clientId, redirectUri } from "../config";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false)

  useEffect(()=> {
     navigate("/dashboard");
  }, [isLogin])

  useEffect(() => {
    // if (localStorage.getItem("spotify_token"))
    // {
    //     //console.log("cest bon");
    //     navigate("/dashboard");
    //     return;
    // }
    async function handleAuth() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      console.log(code);
      const error = params.get("error");
      if (error) {
        console.error("Spotify auth error:", error);
        return;
      }
      if (!code) {
        console.error("No code in URL");
        return;
      }

      const codeVerifier = localStorage.getItem("spotify_code_verifier");
      console.log(codeVerifier);
      if (!codeVerifier) {
        console.error("No code_verifier stored");
        return;
      }

      const body = new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      });

      try {
        const resp = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        const data = await resp.json();
console.log(data);
        if (data.access_token) {
        setIsLogin(true)
          localStorage.setItem("spotify_token", data.access_token);
          console.log("cest bon");
          // Optionnel : stocker refresh_token si renvoyé
          navigate("/dashboard");
        } else {
          console.error("No access_token in response", data);
        }
      } catch (err) {
        console.error("Token request failed", err);
      }
    }

    handleAuth();
  }, []);

  return <div>Authentification Spotify en cours...</div>;
};

export default Callback;
