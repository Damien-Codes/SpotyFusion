import { useEffect, useState } from "react";
import { searchSpotify, getRecommendations } from "../app/api/SpotifyApi";
import type { RecommendationTrack, RecommendationError } from "../app/api/SpotifyApi";
import { SPOTIFY_GENRES } from "../constant/Spotifygenres";
import "../assets/PlaylistMenu.css";

type Seed = { id: string; label: string; type: "genre" | "artist" | "track" };

const POPULAR_GENRES = [
  { label: "Pop", id: "pop" },
  { label: "Rock", id: "rock" },
  { label: "Hip-Hop", id: "hip-hop" },
  { label: "Electronic", id: "electronic" },
  { label: "Jazz", id: "jazz" },
  { label: "Classical", id: "classical" },
  { label: "R&B", id: "r-n-b" },
  { label: "Country", id: "country" },
];

const formatDuration = (ms: number) => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

const Slider = ({ label, description, value, onChange }: {
  label: string; description: string; value: number; onChange: (v: number) => void;
}) => (
  <div className="slider-group">
    <div className="slider-header">
      <span className="slider-label">{label}</span>
      <span className="slider-value">{value.toFixed(2)}</span>
    </div>
    <div className="slider-container">
      <input
        type="range" className="slider" min="0" max="1" step="0.01" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ background: `linear-gradient(to right, #1db954 0%, #1db954 ${value * 100}%, #333 ${value * 100}%, #333 100%)` }}
      />
    </div>
    <p className="slider-description">{description}</p>
  </div>
);

export default function PlaylistMenu({ token }: { token: string }) {
  const [danceability, setDanceability] = useState(0.5);
  const [energy, setEnergy] = useState(0.5);
  const [valence, setValence] = useState(0.5);
  const [inputValue, setInputValue] = useState("");
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [suggestions, setSuggestions] = useState<Seed[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RecommendationError | null>(null);

  useEffect(() => {
    if (!inputValue) { setSuggestions([]); return; }
    
    const genreSuggestions: Seed[] = SPOTIFY_GENRES
      .filter((g) => g.toLowerCase().includes(inputValue.toLowerCase()) && !seeds.some((s) => s.id === g))
      .map((g) => ({ id: g, label: g, type: "genre" }));

    if (token) {
      searchSpotify(token, inputValue).then((results) => {
        const apiSuggestions: Seed[] = results
          .filter((r) => !seeds.some((s) => s.id === r.id))
          .map((r) => ({ id: r.id, label: r.name, type: r.type }));
        setSuggestions([...genreSuggestions, ...apiSuggestions].slice(0, 5));
      });
    } else {
      setSuggestions(genreSuggestions.slice(0, 5));
    }
  }, [inputValue, seeds, token]);

  const addSeed = (seed: Seed) => {
    if (seeds.length < 5) {
      setSeeds([...seeds, seed]);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const addGenreSeed = (id: string, label: string) => {
    if (seeds.length < 5 && !seeds.some((s) => s.id === id)) {
      setSeeds([...seeds, { id, label, type: "genre" }]);
    }
  };

  const handleGenerate = async () => {
    if (!seeds.length) {
      setError({ status: 400, message: "Veuillez sélectionner au moins une semence." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    const result = await getRecommendations(token, {
      seed_artists: seeds.filter((s) => s.type === "artist").map((s) => s.id),
      seed_tracks: seeds.filter((s) => s.type === "track").map((s) => s.id),
      seed_genres: seeds.filter((s) => s.type === "genre").map((s) => s.id),
      target_danceability: danceability,
      target_energy: energy,
      target_valence: valence,
      limit: 30,
    });

    setError(result.error || null);
    setRecommendations(result.tracks);
    setIsLoading(false);
  };

  return (
    <div className="playlist-generator">
      <h1>Générateur de Playlists</h1>
      <p>Créez des playlists personnalisées basées sur vos préférences musicales</p>

      <div className="generator-controls">
        <div className="control-section">
          <h2>Caractéristiques Audio</h2>
          <Slider label="Danceability" description="À quel point la musique est adaptée à la danse" value={danceability} onChange={setDanceability} />
          <Slider label="Energy" description="Intensité et activité de la musique" value={energy} onChange={setEnergy} />
          <Slider label="Valence (Positivité)" description="Humeur positive ou négative de la musique" value={valence} onChange={setValence} />
        </div>

        <div className="control-section">
          <h2>Semences</h2>
          <div className="seeds-search">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Rechercher artistes, pistes ou genres..." />
            {suggestions.length > 0 && (
              <ul className="autocomplete-dropdown">
                {suggestions.map((s) => (
                  <li key={s.id} onClick={() => addSeed(s)}>
                    <span className="autocomplete-icon">{s.type === "genre" ? "🎵" : s.type === "artist" ? "👤" : "🎧"}</span>
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="genre-tags">
            <p className="genre-tags-label">Genres populaires :</p>
            <div className="genre-tags-list">
              {POPULAR_GENRES.map((g) => (
                <span key={g.id} className="genre-tag" onClick={() => addGenreSeed(g.id, g.label)}>{g.label}</span>
              ))}
            </div>
          </div>

          {seeds.length > 0 && (
            <div className="selected-seeds">
              <p className="selected-seeds-label">Semences sélectionnées :</p>
              <div className="selected-seeds-list">
                {seeds.map((s) => (
                  <span key={s.id} className="selected-seed">
                    {s.label}
                    <button onClick={() => setSeeds(seeds.filter((x) => x.id !== s.id))}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="seeds-info">
            <span className="seeds-info-icon">ℹ️</span>
            <p>Ajoutez jusqu'à 5 semences pour personnaliser vos recommandations</p>
          </div>
        </div>
      </div>

      <button className="generate-btn" onClick={handleGenerate} disabled={isLoading}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {isLoading ? "Génération en cours..." : "Générer les recommandations"}
      </button>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <h3>Erreur {error.status}</h3>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-recommendations">
          <div className="loading-spinner-small" />
          <p>Génération des recommandations...</p>
        </div>
      )}

      {recommendations.length > 0 && !isLoading && (
        <div className="recommendations-section">
          <div className="recommendations-header">
            <h2>Recommandations ({recommendations.length})</h2>
            <button className="save-playlist-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
              Sauvegarder la Playlist
            </button>
          </div>

          <div className="recommendations-list">
            {recommendations.map((track, i) => (
              <div key={track.id} className="recommendation-item">
                <span className="track-index">{i + 1}</span>
                <img className="track-image" src={track.album?.images?.[0]?.url || "https://via.placeholder.com/56"} alt={track.name} />
                <div className="track-info">
                  <p className="track-title">{track.name}</p>
                  <p className="track-artist">{track.artists.map((a) => a.name).join(", ")}</p>
                </div>
                <span className="track-artist-secondary">{track.artists[0]?.name}</span>
                <span className="track-duration">{formatDuration(track.duration_ms)}</span>
                <div className="energy-score">
                  <span className="energy-icon">⚡</span>
                  <span className="energy-value">{(track.energy ?? 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
