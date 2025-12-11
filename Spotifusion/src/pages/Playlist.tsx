import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/sidebar/SideBar";
import PlaylistMenu from "../components/PlaylistMenu";
import { getValidAccessToken, isAuthenticated } from "../service/spotifyAuth";
import "./Dashboard.css";

const Playlist: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initToken = async () => {
      if (!isAuthenticated()) {
        navigate("/");
        return;
      }

      try {
        const validToken = await getValidAccessToken();
        localStorage.setItem("spotify_token", validToken);
        setToken(validToken);
      } catch (err) {
        console.error("Failed to get valid token:", err);
        navigate("/");
      }
      setIsLoading(false);
    };

    initToken();
  }, [navigate]);

  const handleSideBarSelect = (item: string) => {
    if (item === "Statistiques") {
      navigate("/dashboard");
    } else if (item === "Blind Test") {
      navigate("/blindtest");
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <SideBar onSelect={handleSideBarSelect} />
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner" />
            <span className="loading-text">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <SideBar onSelect={handleSideBarSelect} />
      <div className="dashboard-content">
        <PlaylistMenu token={token} />
      </div>
    </div>
  );
};

export default Playlist;
