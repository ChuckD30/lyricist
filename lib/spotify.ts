"use server"

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn("Missing Spotify credentials");
        return null;
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    if (data.access_token) {
        accessToken = data.access_token;
        tokenExpiresAt = Date.now() + data.expires_in * 1000;
        return accessToken;
    }

    return null;
}

export async function searchTracks(query: string) {
    const token = await getAccessToken();

    if (!token) {
        // Mock data if no credentials
        return [
            {
                id: "mock-1",
                name: "Stronger (Mock)",
                artists: [{ name: "Kanye West" }],
                album: {
                    images: [{ url: "https://i.scdn.co/image/ab67616d0000b27397508a4b75676336d5231f61" }],
                },
                preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            },
        ];
    }

    const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();
    return data.tracks?.items || [];
}
