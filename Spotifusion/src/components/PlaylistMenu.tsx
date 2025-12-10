import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { getPlaylists } from "../app/api/SpotifyApi";
import type { Playlist } from "../app/api/SpotifyApi";
import "../assets/BlindTestMenu.css";

interface BlindTestMenuProps {
  token: string;
}

const PlayListMenu = ({ token }: BlindTestMenuProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      getPlaylists(token).then(setPlaylists);
    }
  }, [token]);


  const [danceability, setdanceability] = useState("");
  const [energy, setenergy] = useState("");
  const [valence, setvalence] = useState("");
  

  return (
    <div className="blind-test-content">
      <h1>Générateur de ¨Playlist</h1>
      <p>Créez des playliste personalisées basées sur vos préférence musicales</p>
      <div>
        <input type="range" 
          min="0" 
          max="1"
          step="0.1"
          onChange={(e) => setdanceability(e.target.value)}
        />
        <label>danceability</label> 
        <input type="range" 
          min="0" 
          max="1"
          step="0.1"
          onChange={(e) => setenergy(e.target.value)} 
        />
        <label>Energy</label>
        <input type="range" 
          min="0" 
          max="1"
          step="0.1"
          onChange={(e) => setvalence(e.target.value)} 
        />
        <label>Valence</label>

      </div>

      

      

      <button className="start-test-btn">
        <Play fill="currentColor" />
        Commencer la play
      </button>
    </div>
  );
};

export default PlayListMenu;
