import React, { useEffect, useState } from "react";
import { getPlaylists } from "../app/api/SpotifyApi";
import type { Playlist } from "../app/api/SpotifyApi";

interface DashboardProps {
  token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");
  if (token) {
    getPlaylists(token).then(setPlaylists);
    console.log("Token reçu :", token);
  }
  else{
    console.log("Token non reçu :");
  }
}, [token]);

  return (
    <div>
      <h1>BlindTest</h1>
      <ul>
        {playlists.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
