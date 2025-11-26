export interface LyricSegment {
    id: string;
    text: string;
    startTime: number; // in seconds
    endTime: number; // in seconds
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
    audioUrl: string;
    spotifyId?: string;
    imageUrl?: string;
    segments: LyricSegment[];
}

export interface Lyricist {
    id: string;
    name: string;
    description?: string;
    songs: Song[];
    createdAt: Date;
}
