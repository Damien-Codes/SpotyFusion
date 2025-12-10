import React from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar/SideBar";
import BlindTestMenu from "../components/BlindTestMenu";
import "./Dashboard.css";

const BlindTest: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("spotify_token") || "";

  const handleSideBarSelect = (item: string) => {
    if (item === "Statistiques") {
      navigate("/dashboard");
    }
  };

  return (
    <div className="dashboard">
      <SideBar onSelect={handleSideBarSelect} />
      <div className="dashboard-content">
        <BlindTestMenu token={token} />
      </div>
    </div>
  );
};

export default BlindTest;
