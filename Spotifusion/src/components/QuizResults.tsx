import { Play } from "lucide-react";
import type { PlaylistTrack, Playlist } from "../service/SpotifyApi";
import "../assets/QuizResults.css";

interface QuizResultsProps {
  playlist: Playlist;
  score: number;
  playedTracks: PlaylistTrack[];
  onReplay: () => void;
}

const QuizResults = ({
  playlist,
  score,
  playedTracks,
  onReplay,
}: QuizResultsProps) => {
  return (
    <div className="quiz-results-content">
      <div className="quiz-results-header">
        <div className="quiz-score-badge">
          <span>{score}pts</span>
        </div>
        <h2 className="quiz-results-playlist-name">{playlist.name}</h2>
      </div>

      <div className="quiz-results-tracks">
        <h3>Morceaux joués</h3>
        <div className="played-tracks-list">
          {playedTracks.map((track) => (
            <div key={track.id} className="played-track-item">
              <div className="track-album-art">
                {track.album?.images?.[0]?.url ? (
                  <img src={track.album.images[0].url} alt={track.name} />
                ) : (
                  <div className="no-album-art" />
                )}
              </div>
              <div className="track-info">
                <span className="track-name">{track.name}</span>
                <span className="track-artist">
                  {track.artists.map((a) => a.name).join(", ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="replay-btn" onClick={onReplay}>
        <Play fill="currentColor" size={18} />
        Rejouer
      </button>
    </div>
  );
};

export default QuizResults;
