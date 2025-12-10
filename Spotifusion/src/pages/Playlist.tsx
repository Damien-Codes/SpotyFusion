import React from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar/SideBar";
import PlaylisteMenu from "../components/PlaylistMenu";
import "./Dashboard.css";

const Playlist: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("spotify_token") || "";

  const handleSideBarSelect = (item: string) => {
    if (item === "Statistiques") {
      navigate("/dashboard");
    }

    else if (item === "Blind Test") {
      navigate("/blindtest");
    }
  };

  return (
    <div className="dashboard">
      <SideBar onSelect={handleSideBarSelect} />
      <div className="dashboard-content">
        <PlaylisteMenu token={token} />
      </div>
    </div>
  );
};

export default Playlist;
