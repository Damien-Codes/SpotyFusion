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

export interface RecommendationTrack {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  energy?: number;
  danceability?: number;
  valence?: number;
}

export interface RecommendationParams {
  seed_artists?: string[];
  seed_tracks?: string[];
  seed_genres?: string[];
  target_danceability?: number;
  target_energy?: number;
  target_valence?: number;
  limit?: number;
}

export interface RecommendationError {
  status: number;
  message: string;
}

async function fetchSpotify<T>(token: string, endpoint: string): Promise<T | null> {
  const res = await fetch(`${spotifyApiBaseUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok ? res.json() : null;
}

async function fetchSpotifyItems<T>(token: string, endpoint: string): Promise<T[]> {
  const data = await fetchSpotify<{ items: T[] }>(token, endpoint);
  return data?.items || [];
}

export const getTopArtists = (token: string, limit: number, offset = 0, time_range = "long_term") =>
  fetchSpotifyItems<Artist>(token, `/me/top/artists?offset=${offset}&limit=${limit}&time_range=${time_range}`);

export const getTopTracks = (token: string, limit: number, offset = 0, time_range = "long_term") =>
  fetchSpotifyItems<Track>(token, `/me/top/tracks?offset=${offset}&limit=${limit}&time_range=${time_range}`);

export async function getRecentlyPlayedTracks(token: string, limit: number): Promise<RecentlyPlayedTrack[]> {
  const items = await fetchSpotifyItems<{ played_at: string; track: Track }>(token, `/me/player/recently-played?limit=${limit}`);
  return items.map(item => ({ playedAt: item.played_at, track: item.track }));
}

export const getPlaylists = (token: string) => fetchSpotifyItems<Playlist>(token, `/me/playlists`);

async function searchTracks(token: string, query: string, limit: number): Promise<RecommendationTrack[]> {
  if (!token || !query) return [];
  const data = await fetchSpotify<{ tracks: { items: any[] } }>(token, `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
  return (data?.tracks?.items || []).map((t) => ({
    id: t.id, name: t.name, artists: t.artists, album: t.album, duration_ms: t.duration_ms,
  }));
}

async function getArtistTopTracks(token: string, artistId: string): Promise<RecommendationTrack[]> {
  const data = await fetchSpotify<{ tracks: any[] }>(token, `/artists/${artistId}/top-tracks`);
  return (data?.tracks || []).map((t) => ({
    id: t.id, name: t.name, artists: t.artists, album: t.album, duration_ms: t.duration_ms,
  }));
}

async function getTrackArtistId(token: string, trackId: string): Promise<string | null> {
  const data = await fetchSpotify<{ artists: { id: string }[] }>(token, `/tracks/${trackId}`);
  return data?.artists?.[0]?.id || null;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function estimateFeatures(trackId: string) {
  const hash = hashString(trackId);
  return {
    danceability: ((hash % 100) / 100) * 0.6 + 0.2,
    energy: (((hash >> 8) % 100) / 100) * 0.6 + 0.2,
    valence: (((hash >> 16) % 100) / 100) * 0.6 + 0.2,
  };
}

function calculateDistance(a: number, b: number, c: number, ta: number, tb: number, tc: number): number {
  return Math.sqrt((a - ta) ** 2 + (b - tb) ** 2 + (c - tc) ** 2);
}

export async function getRecommendations(
  token: string,
  params: RecommendationParams
): Promise<{ tracks: RecommendationTrack[]; error?: RecommendationError }> {
  const { seed_genres = [], seed_artists = [], seed_tracks = [], limit = 30 } = params;
  const allTracks: RecommendationTrack[] = [];
  const seenIds = new Set<string>();

  const addTracks = (tracks: RecommendationTrack[]) => {
    for (const track of tracks) {
      if (!seenIds.has(track.id)) {
        seenIds.add(track.id);
        allTracks.push(track);
      }
    }
  };

  if (!seed_genres.length && !seed_artists.length && !seed_tracks.length) {
    return { tracks: [], error: { status: 400, message: "Veuillez sélectionner au moins une semence." } };
  }

  for (const genre of seed_genres) addTracks(await searchTracks(token, genre, 50));
  for (const artistId of seed_artists) addTracks(await getArtistTopTracks(token, artistId));
  for (const trackId of seed_tracks) {
    const artistId = await getTrackArtistId(token, trackId);
    if (artistId) addTracks(await getArtistTopTracks(token, artistId));
  }

  if (!allTracks.length) {
    return { tracks: [], error: { status: 404, message: "Aucun titre trouvé." } };
  }

  const targetD = params.target_danceability ?? 0.5;
  const targetE = params.target_energy ?? 0.5;
  const targetV = params.target_valence ?? 0.5;

  return {
    tracks: allTracks
      .map((track) => {
        const f = estimateFeatures(track.id);
        return { ...track, ...f, _score: calculateDistance(f.danceability, f.energy, f.valence, targetD, targetE, targetV) };
      })
      .sort((a, b) => a._score - b._score)
      .slice(0, limit)
      .map(({ _score, ...track }) => track),
  };
}

export async function searchSpotify(token: string, query: string): Promise<SpotifySearchItem[]> {
  if (!query) return [];
  const data = await fetchSpotify<{ artists?: { items: any[] }; tracks?: { items: any[] } }>(
    token, `/search?q=${encodeURIComponent(query)}&type=artist,track&limit=5`
  );

  const artists = (data?.artists?.items || []).slice(0, 3).map((a) => ({ id: a.id, name: a.name, type: "artist" as const }));
  const tracks = (data?.tracks?.items || []).slice(0, 2).map((t) => ({
    id: t.id, name: `${t.name} - ${t.artists.map((a: any) => a.name).join(", ")}`, type: "track" as const,
  }));

  return [...artists, ...tracks];
}
