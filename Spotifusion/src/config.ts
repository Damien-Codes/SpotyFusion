export const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
export const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
export const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative"
].join(" ");
