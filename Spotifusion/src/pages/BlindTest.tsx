import React, { useEffect, useState } from "react";
import { getPlaylists } from "../app/api/SpotifyApi";
import type { Playlist } from "../app/api/SpotifyApi";
import SideBar from "../components/SideBar/SideBar";

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
      <SideBar onSelect={() => {}} />
    </div>
  );
};

export default Dashboard;
