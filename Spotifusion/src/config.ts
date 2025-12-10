export const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
export const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
export const redirectUri = import.meta.env.VITE_REDIRECT_URI;

export const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-top-read",
  "user-read-recently-played"
].join(" ");
