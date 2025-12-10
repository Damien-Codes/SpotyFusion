import React, { useEffect, useState } from "react";
import { getPlaylists } from "../app/api/SpotifyApi";
import type { Playlist } from "../app/api/SpotifyApi";
import SideBar from "../components/SideBar/SideBar";
import BlindTestMenu from "../components/BlindTestMenu";
//import Sidebar from "../components/Sidebar";

const Page: React.FC = () => {
  const token = localStorage.getItem("spotify_token") || "";

  return (
    <div style={{ display: "flex" }}>
      {/* La barre latérale */}
      <SideBar onSelect={() => {}} />

      <div>
        <BlindTestMenu token={token} />
      </div>
    </div>
  );
};

export default Page;
