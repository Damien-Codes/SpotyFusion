import type { RecentlyPlayedTrack } from "../../service/SpotifyApi";
import { MusicIcon, ClockIcon } from "../icons/Icons";
import { getTimeAgo } from "../../utils/timeAgo";
import "./Cards.css";

interface RecentTrackItemProps {
  item: RecentlyPlayedTrack;
}

export function RecentTrackItem({ item }: RecentTrackItemProps) {
  const imageUrl = item.track.album?.images?.[0]?.url;

  return (
    <div className="recent-track-item">
      <div className={`recent-track-image ${!imageUrl ? "placeholder" : ""}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={item.track.name} />
        ) : (
          <MusicIcon />
        )}
      </div>
      <div className="recent-track-info">
        <span className="track-name">{item.track.name}</span>
        <span className="track-artist">{item.track.artists[0]?.name}</span>
      </div>
      <div className="recent-track-time">
        <ClockIcon />
        {getTimeAgo(item.playedAt)}
      </div>
    </div>
  );
}
