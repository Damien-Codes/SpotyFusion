import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getTopArtists, getTopTracks, getRecentlyPlayedTracks } from "../app/api/SpotifyApi";
import type { Artist, RecentlyPlayedTrack, Track } from "../app/api/SpotifyApi";
import { getValidAccessToken, isAuthenticated } from "../service/spotifyAuth";
import { Carousel } from "../components/Carousel";
import { ArtistCard, TrackCard, RecentTrackItem, FeaturedTrack } from "../components/cards";
import { TIME_RANGE_LABELS } from "../constants/timeRange";
import type { TimeRange } from "../constants/timeRange";
import SideBar from "../components/SideBar/SideBar";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState<RecentlyPlayedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("long_term");

  const fetchData = useCallback(async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/");
        return;
      }

      setIsLoading(true);
      const token = await getValidAccessToken();
      localStorage.setItem("spotify_token", token);

      const [artists, tracks, recentTracks] = await Promise.all([
        getTopArtists(token, 10, 0, timeRange),
        getTopTracks(token, 10, 0, timeRange),
        getRecentlyPlayedTracks(token, 5),
      ]);

      setTopArtists(artists || []);
      setTopTracks(tracks || []);
      setRecentlyPlayedTracks(recentTracks || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch Spotify data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setIsLoading(false);

      if (err instanceof Error && err.message.includes("not authenticated")) {
        navigate("/");
      }
    }
  }, [navigate, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleTimeRangeChange = (range: TimeRange) => setTimeRange(range);

  const handleSideBarSelect = (item: string) => {
    if (item === "Blind Test") {
      navigate("/blindtest");
    }
    else if (item === "Générateur\nde Playlists") {
      navigate("/playlist");
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <SideBar onSelect={handleSideBarSelect} />
        <div className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner" />
            <span className="loading-text">Chargement de vos données...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <SideBar onSelect={handleSideBarSelect} />
        <div className="dashboard-content">
          <div className="error-container">
            <h2>Erreur</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/")}>Retour à la connexion</button>
          </div>
        </div>
      </div>
    );
  }

  const featuredTrack = recentlyPlayedTracks[0];
  const otherRecentTracks = recentlyPlayedTracks.slice(1);

  return (
    <div className="dashboard">
      <SideBar onSelect={handleSideBarSelect} />
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Vos Statistiques</h1>
            <p>Découvrez vos artistes et morceaux préférés</p>
          </div>
        </header>

        <nav className="time-range-selector">
          {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`time-range-btn ${timeRange === range ? "active" : ""}`}
              onClick={() => handleTimeRangeChange(range)}
            >
              {TIME_RANGE_LABELS[range]}
            </button>
          ))}
        </nav>

        <section>
          <h2 className="section-title">Top 10 Artistes</h2>
          <Carousel>
            {topArtists.map((artist, index) => (
              <ArtistCard key={`artist-${index}-${artist.name}`} artist={artist} rank={index + 1} />
            ))}
          </Carousel>
        </section>

        <section>
          <h2 className="section-title">Top 10 Morceaux</h2>
          <Carousel>
            {topTracks.map((track, index) => (
              <TrackCard key={`track-${index}-${track.name}`} track={track} rank={index + 1} />
            ))}
          </Carousel>
        </section>

        <section className="recently-played-section">
          <h2 className="section-title">5 Derniers Titres Écoutés</h2>
          <div className="recently-played-container">
            {featuredTrack && <FeaturedTrack track={featuredTrack} />}
            <div className="recent-tracks-list">
              {otherRecentTracks.map((item, index) => (
                <RecentTrackItem key={`recent-${index}-${item.track.name}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
