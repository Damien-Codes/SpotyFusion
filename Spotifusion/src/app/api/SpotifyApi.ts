export const spotifyApiBaseUrl = "https://api.spotify.com/v1";

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  name: string;
  images?: Image[];
}

export interface Album {
  name: string;
  images: Image[];
}

export interface Track {
  name: string;
  artists: Artist[];
  album?: Album;
}

// Raw API response interface (what Spotify returns)
interface SpotifyRecentlyPlayedItem {
  played_at: string;
  track: Track;
}

// Our app's interface (camelCase)
export interface RecentlyPlayedTrack {
  playedAt: string;
  track: Track;
}

async function _spotifyRequestItems(token: string, apiRoute: string) {
  console.log(spotifyApiBaseUrl + apiRoute);
  return (await (await fetch(spotifyApiBaseUrl + apiRoute, { headers: { Authorization: `Bearer ${token}` } })).json()).items;
}

export async function getTopArtists(token: string, limit: number, offset: number = 0, time_range: string = "long_term"): Promise<Artist[]> {
  return await _spotifyRequestItems(token, `/me/top/artists?offset=${offset}&limit=${limit}&time_range=${time_range}`);
}

export async function getTopTracks(token: string, limit: number, offset: number = 0, time_range: string = "long_term"): Promise<Track[]> {
  return await _spotifyRequestItems(token, `/me/top/tracks?offset=${offset}&limit=${limit}&time_range=${time_range}`);
}

export async function getRecentlyPlayedTracks(token: string, limit: number): Promise<RecentlyPlayedTrack[]> {
  const items: SpotifyRecentlyPlayedItem[] = await _spotifyRequestItems(token, `/me/player/recently-played?limit=${limit}`);

  // Map snake_case from Spotify API to camelCase
  return items.map(item => ({
    playedAt: item.played_at,
    track: item.track
  }));
}