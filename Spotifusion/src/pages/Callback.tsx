import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForTokens, isAuthenticated } from "../service/spotifyAuth";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      // If already authenticated, go to dashboard
      if (isAuthenticated()) {
        navigate("/dashboard");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const authError = params.get("error");

      if (authError) {
        setError(`Spotify auth error: ${authError}`);
        setIsLoading(false);
        return;
      }

      if (!code) {
        setError("No authorization code found in URL");
        setIsLoading(false);
        return;
      }

      try {
        await exchangeCodeForTokens(code);
        console.log("Successfully exchanged code for tokens");
        navigate("/dashboard");
      } catch (err) {
        console.error("Token exchange failed:", err);
        setError(err instanceof Error ? err.message : "Token exchange failed");
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [navigate]);

  if (error) {
    return (
      <div>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Return to Login</button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Authentification Spotify en cours...</div>;
  }

  return null;
};

export default Callback;
