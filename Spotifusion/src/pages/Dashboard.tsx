import React, { useEffect, useState } from "react";
import { getPlaylists } from "../app/api/SpotifyApi";
import type { Playlist } from "../app/api/SpotifyApi";

interface DashboardProps {
  token: string;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    if (token) {
      getPlaylists(token).then(setPlaylists);
    }
  }, [token]);

  return (
    <div>
      <h1>Mes playlists</h1>
      <h1>{token}</h1>
      <ul>
        {playlists.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
