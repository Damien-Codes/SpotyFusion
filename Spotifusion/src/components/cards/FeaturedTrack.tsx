import type { RecentlyPlayedTrack } from "../../app/api/SpotifyApi";
import { MusicIcon, ClockIcon } from "../icons/Icons";
import { getTimeAgo } from "../../utils/timeAgo";
import "./Cards.css";

interface FeaturedTrackProps {
  track: RecentlyPlayedTrack;
}

export function FeaturedTrack({ track }: FeaturedTrackProps) {
  const imageUrl = track.track.album?.images?.[0]?.url;

  return (
    <div className="featured-track">
      <div className={`featured-image ${!imageUrl ? "placeholder" : ""}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={track.track.name} />
        ) : (
          <MusicIcon />
        )}
      </div>
      <div className="featured-info">
        <span className="track-name">{track.track.name}</span>
        <span className="track-artist">{track.track.artists[0]?.name}</span>
        <div className="featured-time">
          <ClockIcon />
          {getTimeAgo(track.playedAt)}
        </div>
      </div>
    </div>
  );
}
