export interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
}

export async function getPlaylists(token: string): Promise<Playlist[]> {
  const res = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.items;
}
