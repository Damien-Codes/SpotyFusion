import type { Artist } from "../../app/api/SpotifyApi";
import { UserIcon } from "../icons/Icons";
import "./Cards.css";

interface ArtistCardProps {
  artist: Artist;
  rank: number;
}

export function ArtistCard({ artist, rank }: ArtistCardProps) {
  const imageUrl = artist.images?.[0]?.url;

  return (
    <div className="artist-card">
      <div className={`artist-image ${!imageUrl ? "placeholder" : ""}`}>
        {imageUrl ? <img src={imageUrl} alt={artist.name} /> : <UserIcon />}
      </div>
      <span className="artist-name">
        #{rank}. {artist.name}
      </span>
    </div>
  );
}
