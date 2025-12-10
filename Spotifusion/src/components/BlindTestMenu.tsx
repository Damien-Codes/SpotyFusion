import React, { useEffect, useState } from "react";
import { getPlaylists } from "../app/api/SpotifyApi";
import type { Playlist } from "../app/api/SpotifyApi";
import "../assets/BlindTestMenu.css";

interface BlindTestMenuProps {
  token: string;
}

const BlindTestMenu: React.FC<BlindTestMenuProps> = ({ token }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      getPlaylists(token).then(setPlaylists);
      console.log("Token reçu :", token);
    } else {
      console.log("Token non reçu :");
    }
  }, [token]);

  const handleCardClick = (playlistId: string) => {
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null); // Réinitialise la sélection
    } else {
      // Si une autre carte est sélectionnée, on la sélectionne
      setSelectedPlaylistId(playlistId);
    }
  };

  return (
    <div className="content">
      <h1>Blind Test Musical</h1>
      <p>Testez vos connaissances musicales en devinant les morceaux</p>

      <div className="playlists">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div
              className="playlist"
              key={playlist.id}
              onClick={() => handleCardClick(playlist.id)}
              style={{
                position: "relative",
                cursor: "pointer",
              }}
            >
              {/* Affichage de l'image de la playlist */}
              {playlist.images[0]?.url ? (
                <img src={playlist.images[0].url} alt={playlist.name} />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
              <span>{playlist.name}</span>

              {/* Logo (coche) affiché en bas à gauche de la carte si sélectionnée */}
              {selectedPlaylistId === playlist.id && (
                <div className="check-logo"></div>
              )}
            </div>
          ))
        ) : (
          <p>Aucune playlist disponible</p>
        )}
      </div>

      <button className="start-test">Commencer le Blind Test</button>
    </div>
  );
};

export default BlindTestMenu;
