import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { getPlaylists } from "../app/api/SpotifyApi";
import type { Playlist } from "../app/api/SpotifyApi";
import "../assets/BlindTestMenu.css";

interface BlindTestMenuProps {
  token: string;
}

const BlindTestMenu = ({ token }: BlindTestMenuProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      getPlaylists(token).then(setPlaylists);
    }
  }, [token]);

  const handleCardClick = (playlistId: string) => {
    setSelectedPlaylistId(selectedPlaylistId === playlistId ? null : playlistId);
  };

  return (
    <div className="blind-test-content">
      <h1>Blind Test Musical</h1>
      <p>Testez vos connaissances musicales en devinant les morceaux</p>

      <div className="playlists-section">
        <h2>Mes playlists</h2>
        <div className="playlists">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div
                className="playlist"
                key={playlist.id}
                onClick={() => handleCardClick(playlist.id)}
              >
                {playlist.images[0]?.url ? (
                  <img src={playlist.images[0].url} alt={playlist.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <span>{playlist.name}</span>
                {selectedPlaylistId === playlist.id && (
                  <div className="check-logo" />
                )}
              </div>
            ))
          ) : (
            <p>Aucune playlist disponible</p>
          )}
        </div>
      </div>

      <button className="start-test-btn">
        <Play fill="currentColor" />
        Commencer le Blind Test
      </button>
    </div>
  );
};

export default BlindTestMenu;
