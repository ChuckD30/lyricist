"use client"

import { useState } from "react"
import { searchTracks } from "@/lib/spotify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Music, Plus } from "lucide-react"

interface SpotifySearchProps {
    onSelect: (track: any) => void
}

export function SpotifySearch({ onSelect }: SpotifySearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = async () => {
        if (!query.trim()) return

        setIsLoading(true)
        try {
            const tracks = await searchTracks(query)
            setResults(tracks)
        } catch (error) {
            console.error("Search failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search for a song..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {results.map((track) => (
                    <div
                        key={track.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            {track.album.images[0] ? (
                                <img
                                    src={track.album.images[0].url}
                                    alt={track.name}
                                    className="h-10 w-10 rounded object-cover"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                    <Music className="h-5 w-5 text-muted-foreground" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-medium truncate">{track.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {track.artists.map((a: any) => a.name).join(", ")}
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onSelect(track)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {results.length === 0 && query && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-4">No results found.</p>
                )}
            </div>
        </div>
    )
}
