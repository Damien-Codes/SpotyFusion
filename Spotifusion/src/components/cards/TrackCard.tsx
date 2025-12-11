import type { Track } from "../../app/api/SpotifyApi";
import { MusicIcon } from "../icons/Icons";
import "./Cards.css";

interface TrackCardProps {
  track: Track;
  rank: number;
}

export function TrackCard({ track, rank }: TrackCardProps) {
  const imageUrl = track.album?.images?.[0]?.url;

  return (
    <div className="track-card">
      <div className={`track-image ${!imageUrl ? "placeholder" : ""}`}>
        {imageUrl ? <img src={imageUrl} alt={track.name} /> : <MusicIcon />}
      </div>
      <div className="track-info">
        <span className="track-name">
          #{rank}. {track.name}
        </span>
        <span className="track-artist">{track.artists[0]?.name}</span>
      </div>
    </div>
  );
}
