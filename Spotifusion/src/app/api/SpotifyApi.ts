export const spotifyApiBaseUrl = "https://api.spotify.com/v1";

export interface Artist {
  name: string;
}

export interface Track {
  name: string;
  artists: Artist[];
}

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
  return await _spotifyRequestItems(token, `/me/player/recently-played?limit=${limit}`);
}