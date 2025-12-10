import { useEffect, useState } from "react";
import { searchSpotify } from "../app/api/SpotifyApi";
import { SPOTIFY_GENRES } from "../constant/Spotifygenres";
import "../assets/BlindTestMenu.css";

interface BlindTestMenuProps {
  token: string;
}

type Seed = {
  id: string;
  label: string;
  type: "genre" | "artist" | "track";
};

const PlayListMenu = ({ token }: BlindTestMenuProps) => {
  const [danceability, setDanceability] = useState("");
  const [energy, setEnergy] = useState("");
  const [valence, setValence] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [suggestions, setSuggestions] = useState<Seed[]>([]);


  // Suggestions auto-complétion (genres locaux + Spotify search)
  useEffect(() => {
    if (!inputValue) {
      setSuggestions([]);
      return;
    }
    // Suggestions locales genres
    const genreSuggestions: Seed[] = SPOTIFY_GENRES.filter((g) =>
      g.toLowerCase().includes(inputValue.toLowerCase())
    )
      .filter((g) => !seeds.some((s) => s.id === g))
      .map((g) => ({ id: g, label: g, type: "genre" }));

    // Suggestions Spotify Search (artistes et pistes)
    if (token) {
      searchSpotify(token, inputValue).then((results) => {
        const apiSuggestions: Seed[] = results
          .filter((r) => !seeds.some((s) => s.id === r.id))
          .map((r) => ({
            id: r.id,
            label: r.name,
            type: r.type,
          }));
        setSuggestions([...genreSuggestions, ...apiSuggestions].slice(0, 5));
      });
    } else {
      setSuggestions(genreSuggestions.slice(0, 5));
    }
  }, [inputValue, seeds, token]);

  const addSeed = (seed: Seed) => {
    if (seeds.length >= 5) return;
    setSeeds([...seeds, seed]);
    setInputValue("");
    setSuggestions([]);
  };

  return (
    <div className="blind-test-content">
      <h1>Générateur de Playlist</h1>
      <p>Créez des playlists personnalisées basées sur vos préférences musicales</p>

      {/* Contrôles audio */}
      <div>
        <p>Caractéristiques audio</p>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => setDanceability(e.target.value)}
        />
        <label>Danceability</label>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => setEnergy(e.target.value)}
        />
        <label>Energy</label>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => setValence(e.target.value)}
        />
        <label>Valence</label>
      </div>

      {/* Input tags / seeds */}
      <div>
        <p>Semences (max 5)</p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ajouter un genre, artiste ou piste"
        />

        {suggestions.length > 0 && (
          <ul className="autocomplete">
            {suggestions.map((s) => (
              <li key={s.id} onClick={() => addSeed(s)}>
                {s.type === "genre" && "🎵"}
                {s.type === "artist" && "👤"}
                {s.type === "track" && "🎧"} {s.label}
              </li>
            ))}
          </ul>
        )}

        <ul>
          {seeds.map((s, index) => (
            <li key={index}>
              {s.type === "genre" && "🎵"}
              {s.type === "artist" && "👤"}
              {s.type === "track" && "🎧"} {s.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayListMenu;
