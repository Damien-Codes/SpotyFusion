import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { getPlaylists, getPlaylistTracks } from "../app/api/SpotifyApi";
import type { Playlist, PlaylistTrack } from "../app/api/SpotifyApi";
import QuizGame from "./QuizGame";
import QuizResults from "./QuizResults";
import "../assets/BlindTestMenu.css";

interface BlindTestMenuProps {
  token: string;
}

type GameState = "menu" | "playing" | "results";

const BlindTestMenu = ({ token }: BlindTestMenuProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [playedTracks, setPlayedTracks] = useState<PlaylistTrack[]>([]);

  useEffect(() => {
    if (token) {
      getPlaylists(token).then(setPlaylists);
    }
  }, [token]);

  const handleCardClick = (playlist: Playlist) => {
    setSelectedPlaylist(selectedPlaylist?.id === playlist.id ? null : playlist);
  };

  const handleStartQuiz = async () => {
    if (!selectedPlaylist || !token) return;

    setIsLoading(true);
    try {
      const playlistTracks = await getPlaylistTracks(token, selectedPlaylist.id);
      
      if (playlistTracks.length < 4) {
        alert("Cette playlist doit contenir au moins 4 morceaux pour jouer.");
        setIsLoading(false);
        return;
      }

      setTracks(playlistTracks);
      setGameState("playing");
    } catch (error) {
      console.error("Erreur lors du chargement des morceaux:", error);
      alert("Erreur lors du chargement de la playlist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameEnd = (score: number, played: PlaylistTrack[]) => {
    setFinalScore(score);
    setPlayedTracks(played);
    setGameState("results");
  };

  const handleReplay = async () => {
    if (!selectedPlaylist || !token) return;
    
    setIsLoading(true);
    try {
      const playlistTracks = await getPlaylistTracks(token, selectedPlaylist.id);
      setTracks(playlistTracks);
      setPlayedTracks([]);
      setFinalScore(0);
      setGameState("playing");
    } catch (error) {
      console.error("Erreur lors du rechargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseQuiz = () => {
    setGameState("menu");
    setTracks([]);
    setPlayedTracks([]);
    setFinalScore(0);
  };

  if (gameState === "playing" && selectedPlaylist && tracks.length > 0) {
    return (
      <QuizGame
        playlist={selectedPlaylist}
        tracks={tracks}
        onClose={handleCloseQuiz}
        onGameEnd={handleGameEnd}
      />
    );
  }

  if (gameState === "results" && selectedPlaylist) {
    return (
      <QuizResults
        playlist={selectedPlaylist}
        score={finalScore}
        playedTracks={playedTracks}
        onReplay={handleReplay}
      />
    );
  }

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
                onClick={() => handleCardClick(playlist)}
              >
                <div className="playlist-image-container">
                  {playlist.images[0]?.url ? (
                    <img src={playlist.images[0].url} alt={playlist.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                  {selectedPlaylist?.id === playlist.id && (
                    <div className="check-logo" />
                  )}
                </div>
                <span>{playlist.name}</span>
              </div>
            ))
          ) : (
            <p>Aucune playlist disponible</p>
          )}
        </div>
      </div>

      <button 
        className="start-test-btn" 
        onClick={handleStartQuiz}
        disabled={!selectedPlaylist || isLoading}
      >
        <Play fill="currentColor" />
        {isLoading ? "Chargement..." : "Commencer le Blind Test"}
      </button>
    </div>
  );
};

export default BlindTestMenu;
