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

interface SpotifyRecentlyPlayedItem {
  played_at: string;
  track: Track;
}

export interface RecentlyPlayedTrack {
  playedAt: string;
  track: Track;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
}

export type SpotifySearchItem = {
  id: string;
  name: string;
  type: "artist" | "track";
};

async function _spotifyRequestItems(token: string, apiRoute: string) {
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

  return items.map(item => ({
    playedAt: item.played_at,
    track: item.track
  }));
}

export async function getPlaylists(token: string): Promise<Playlist[]> {
  return await _spotifyRequestItems(token, `/me/playlists`);
}

export const searchSpotify = async (
  token: string,
  query: string
): Promise<SpotifySearchItem[]> => {
  if (!query) return [];

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist,track&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();

  // Filtrage des résultats pour ne garder que 3 artistes et 2 musiques
  const artists =
    data.artists?.items
      .map((a: any) => ({
        id: a.id,
        name: a.name,
        type: "artist" as const,
      }))
      .slice(0, 3) ?? []; // Limite à 3 artistes

  const tracks =
    data.tracks?.items
      .map((t: any) => ({
        id: t.id,
        name: t.name + " - " + t.artists.map((a: any) => a.name).join(", "),
        type: "track" as const,
      }))
      .slice(0, 2) ?? []; // Limite à 2 titres de musique

  return [...artists, ...tracks]; // Combine les deux listes
};
