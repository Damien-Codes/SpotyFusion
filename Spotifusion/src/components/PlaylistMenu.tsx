import { useEffect, useState } from "react";
import {
  Sparkles,
  Info,
  X,
  ChevronDown,
  Music,
  Save,
  Activity,
} from "lucide-react";
import { searchSpotify, getRecommendations } from "../service/SpotifyApi";
import type {
  RecommendationTrack,
  RecommendationError,
} from "../service/SpotifyApi";
import { SPOTIFY_GENRES } from "../constants/Spotifygenres";
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

const Slider = ({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="slider-group">
    <div className="slider-header">
      <span className="slider-label">{label}</span>
      <span className="slider-value">{value.toFixed(2)}</span>
    </div>
    <div className="slider-container">
      <input
        type="range"
        className="slider"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to right, #1db954 0%, #1db954 ${value * 100}%, #333 ${value * 100}%, #333 100%)`,
        }}
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
  const [recommendations, setRecommendations] = useState<RecommendationTrack[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RecommendationError | null>(null);

  useEffect(() => {
    if (!inputValue) return;

    const genreSuggestions: Seed[] = SPOTIFY_GENRES.filter(
      (g) =>
        g.toLowerCase().includes(inputValue.toLowerCase()) &&
        !seeds.some((s) => s.id === g),
    ).map((g) => ({ id: g, label: g, type: "genre" }));

    const fetchSuggestions = async () => {
      if (token) {
        try {
          const results = await searchSpotify(token, inputValue);
          const apiSuggestions: Seed[] = results
            .filter((r) => !seeds.some((s) => s.id === r.id))
            .map((r) => ({ id: r.id, label: r.name, type: r.type }));
          setSuggestions([...genreSuggestions, ...apiSuggestions].slice(0, 5));
        } catch {
          setSuggestions(genreSuggestions.slice(0, 5));
        }
      } else {
        setSuggestions(genreSuggestions.slice(0, 5));
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, seeds, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!val) {
      setSuggestions([]);
    }
  };

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
      setError({
        status: 400,
        message: "Veuillez sélectionner au moins une semence.",
      });
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
      <p>
        Créez des playlists personnalisées basées sur vos préférences musicales
      </p>

      <div className="generator-controls">
        <div className="control-section">
          <h2>Caractéristiques Audio</h2>
          <Slider
            label="Danceability"
            description="À quel point la musique est adaptée à la danse"
            value={danceability}
            onChange={setDanceability}
          />
          <Slider
            label="Energy"
            description="Intensité et activité de la musique"
            value={energy}
            onChange={setEnergy}
          />
          <Slider
            label="Valence (Positivité)"
            description="Humeur positive ou négative de la musique"
            value={valence}
            onChange={setValence}
          />
        </div>

        <div className="control-section">
          <h2>Semences</h2>
          <div className="seeds-search">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Rechercher artistes, pistes ou genres..."
            />
            <ChevronDown className="search-chevron" size={20} />
            {suggestions.length > 0 && (
              <ul className="autocomplete-dropdown">
                {suggestions.map((s) => (
                  <li key={s.id} onClick={() => addSeed(s)}>
                    <span className="autocomplete-icon">
                      {s.type === "genre"
                        ? "🎵"
                        : s.type === "artist"
                          ? "👤"
                          : "🎧"}
                    </span>
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
                <span
                  key={g.id}
                  className="genre-tag"
                  onClick={() => addGenreSeed(g.id, g.label)}
                >
                  {g.label}
                </span>
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
                    <button
                      onClick={() =>
                        setSeeds(seeds.filter((x) => x.id !== s.id))
                      }
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="seeds-info">
            <Info className="seeds-info-icon" size={20} />
            <p>
              Ajoutez jusqu'à 5 semences pour personnaliser vos recommandations
            </p>
          </div>
        </div>
      </div>

      <button
        className="generate-btn"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        <Sparkles size={20} />
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
              <Save size={18} />
              Sauvegarder la Playlist
            </button>
          </div>

          <div className="recommendations-list">
            {recommendations.map((track, i) => (
              <div key={track.id} className="recommendation-item">
                <span className="track-index">{i + 1}</span>
                <img
                  className="track-image"
                  src={
                    track.album?.images?.[0]?.url ||
                    "https://via.placeholder.com/56"
                  }
                  alt={track.name}
                />
                <div className="track-info">
                  <p className="track-title">{track.name}</p>
                  <p className="track-artist">
                    {track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
                <span className="track-artist-secondary">
                  {track.album?.name}
                </span>
                <span className="track-duration">
                  {formatDuration(track.duration_ms)}
                </span>
                <div className="energy-score">
                  <Activity size={20} className="energy-icon" />
                  <span className="energy-value">
                    {(track.energy ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && !isLoading && !error && (
        <div className="empty-recommendations">
          <Music
            className="empty-recommendations-icon"
            size={64}
            strokeWidth={1}
          />
          <h3>Aucune recommandation pour le moment</h3>
          <p>
            Configurez vos préférences et ajoutez des semences, puis cliquez sur
            "Générer les recommandations"
          </p>
        </div>
      )}
    </div>
  );
}
