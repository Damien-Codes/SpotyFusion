import React, { useEffect, useState } from "react";
import { getTopArtists, getTopTracks, getRecentlyPlayedTracks } from "../app/api/SpotifyApi";
import type { Artist, RecentlyPlayedTrack, Track } from "../app/api/SpotifyApi";

interface DashboardProps {
  token: string;
}

function getTimeAgo(isoDateString: string) {
  const date = new Date(isoDateString);
  const now = new Date();
  const diffMs = now.getMilliseconds() - date.getMilliseconds();

  const absoluteDiffMs = Math.abs(diffMs);

  const seconds = Math.floor(absoluteDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  let result;
  if (years > 0) {
    result = `il y a ${years} an${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    result = `il y a ${months} mois`;
  } else if (days > 0) {
    result = `il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    result = `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    result = `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (seconds > 0) {
    result = `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
  } else {
    result = "à l'instant";
  }

  return result;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState<RecentlyPlayedTrack[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("spotify_token");
    if (token) {
      getTopArtists(token, 10).then(setTopArtists);
      getTopTracks(token, 10).then(setTopTracks);
      getRecentlyPlayedTracks(token, 5).then(setRecentlyPlayedTracks);
    }
    else{
      console.error("Unable to get spotify token!")
    }
}, [token]);

  return (
    <div>
      <h1>Vos Statistiques</h1>
      <p>Découvrez vos artistes et morceaux préférés</p>
      <div>
        <button>4 semaines</button>
        <button>6 mois</button>
        <button>Tout le temps</button>
      </div>
      <h2>Top 10 Artistes</h2>
      <ul> {topArtists.map((artist, index) => ( <li key={"top" + artist.name}>#{index + 1}. {artist.name}</li>))} </ul>
      <h2>Top 10 Morceaux</h2>
      <ul> {topTracks.map((track, index) => ( <li key={"top" + track.name}>#{index + 1}. {track.name} - <i>{track.artists[0].name}</i></li>))} </ul>
      <h2>5 Derniers Titres Écoutés</h2>
      <ul> {recentlyPlayedTracks.map((recentlyPlayedTrack) => ( <li key={"recently" + recentlyPlayedTrack.track.name}>{recentlyPlayedTrack.track.name} - <i>{recentlyPlayedTrack.track.artists[0].name}, {getTimeAgo(recentlyPlayedTrack.playedAt)}</i></li>))} </ul>
    </div>
  );
};

export default Dashboard;
