import React from "react";
import { Music } from "lucide-react";
import LoginButton from "../components/LoginButton";
import "../../style/login.css";

const Login: React.FC = () => {
  return (
    <div className="login-page">
      <div className="background" />

      <div className="login-card">
        <div className="logo">
          <Music size={40} color="white" strokeWidth={2} />
        </div>

        <h1 className="title">SpotyFusion</h1>
        <p className="subtitle">
          Enrichissez votre expérience Spotify avec des statistiques détaillées,
          des blind tests et un générateur de playlists intelligent
        </p>

        <LoginButton />

        <p className="redirect">
          Vous serez redirigé vers Spotify pour autoriser l'accès.
        </p>
      </div>
    </div>
  );
};

export default Login;
