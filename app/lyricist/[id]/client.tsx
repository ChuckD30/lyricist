"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Pause, Play, Plus, Trash2, Loader2, Pencil } from "lucide-react"
import { AudioPlayer } from "@/components/audio-player"
import { SpotifyPlayer } from "@/components/spotify-player"
import { SpotifySearch } from "@/components/spotify-search"
import { addSong, updateSong, updateSegment, updateLyricist, deleteLyricist } from "@/app/actions"

export default function LyricistClient({ lyricist }: { lyricist: any }) {
    // We can use the prop directly, but if we want optimistic updates we might want state.
    // However, since we use revalidatePath, the prop will update on refresh.
    // But for immediate feedback without full page reload (if using router.refresh()), state is good.
    // For now, let's rely on the prop updating (Next.js Server Actions behavior).
    // Actually, revalidatePath refreshes the server component, which passes new props.

    const songs = lyricist.songs
    const [isAddSongOpen, setIsAddSongOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [isEditSongOpen, setIsEditSongOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingSong, setEditingSong] = useState<any>(null)
    const [editingSegment, setEditingSegment] = useState<any>(null)

    const [isEditLyricistOpen, setIsEditLyricistOpen] = useState(false)
    const [isDeleteLyricistOpen, setIsDeleteLyricistOpen] = useState(false)
    const [editLyricistName, setEditLyricistName] = useState(lyricist.name)
    const [editLyricistDescription, setEditLyricistDescription] = useState(lyricist.description || "")
    const [isUpdatingLyricist, setIsUpdatingLyricist] = useState(false)
    const [isDeletingLyricist, setIsDeletingLyricist] = useState(false)

    const handleUpdateLyricist = async () => {
        setIsUpdatingLyricist(true)
        try {
            const formData = new FormData()
            formData.append("name", editLyricistName)
            formData.append("description", editLyricistDescription)

            await updateLyricist(lyricist.id, formData)
            setIsEditLyricistOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsUpdatingLyricist(false)
        }
    }

    const handleDeleteLyricist = async () => {
        setIsDeletingLyricist(true)
        try {
            await deleteLyricist(lyricist.id)
        } catch (error) {
            console.error(error)
            setIsDeletingLyricist(false)
        }
    }

    // Sync local state with props when they update (e.g. after editing a segment)
    useEffect(() => {
        if (!currentSong) return

        const updatedSong = songs.find((s: any) => s.id === currentSong.id)
        if (updatedSong && updatedSong !== currentSong) {
            setCurrentSong(updatedSong)
            if (currentSegment) {
                const updatedSegment = updatedSong.segments.find((s: any) => s.id === currentSegment.id)
                if (updatedSegment && updatedSegment !== currentSegment) {
                    setCurrentSegment(updatedSegment)
                }
            }
        }
    }, [songs, currentSong, currentSegment])

    // Player state
    const [currentSong, setCurrentSong] = useState<any>(null)
    const [currentSegment, setCurrentSegment] = useState<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    // Form state
    const [newSongTitle, setNewSongTitle] = useState("")
    const [newSongArtist, setNewSongArtist] = useState("")
    const [newSongUrl, setNewSongUrl] = useState("")
    const [newSongSpotifyId, setNewSongSpotifyId] = useState("")
    const [newSongCoverUrl, setNewSongCoverUrl] = useState("")
    const [newSegmentText, setNewSegmentText] = useState("")
    const [newSegmentStart, setNewSegmentStart] = useState("")
    const [newSegmentEnd, setNewSegmentEnd] = useState("")

    // Edit form state
    const [editSongTitle, setEditSongTitle] = useState("")
    const [editSongArtist, setEditSongArtist] = useState("")
    const [editSongUrl, setEditSongUrl] = useState("")
    const [editSongCoverUrl, setEditSongCoverUrl] = useState("")
    const [editSegmentText, setEditSegmentText] = useState("")
    const [editSegmentStart, setEditSegmentStart] = useState("")
    const [editSegmentEnd, setEditSegmentEnd] = useState("")

    const handlePlay = (song: any, segment: any) => {
        if (currentSong?.id === song.id && currentSegment?.id === segment.id) {
            setIsPlaying(!isPlaying)
        } else {
            setCurrentSong(song)
            setCurrentSegment(segment)
            setIsPlaying(true)
        }
    }

    const handleSpotifySelect = (track: any) => {
        setNewSongTitle(track.name)
        setNewSongArtist(track.artists.map((a: any) => a.name).join(", "))
        setNewSongUrl(track.preview_url || "")
        setNewSongSpotifyId(track.id)
        setNewSongCoverUrl(track.album.images[0]?.url || "")
    }

    const handleAddSong = async () => {
        setIsAdding(true)
        try {
            const songData = {
                title: newSongTitle,
                artist: newSongArtist,
                audioUrl: newSongUrl,
                spotifyId: newSongSpotifyId,
                coverUrl: newSongCoverUrl,
                segments: [
                    {
                        text: newSegmentText,
                        startTime: Number(newSegmentStart),
                        endTime: Number(newSegmentEnd),
                    },
                ],
            }

            await addSong(lyricist.id, songData)

            setIsAddSongOpen(false)

            // Reset form
            setNewSongTitle("")
            setNewSongArtist("")
            setNewSongUrl("")
            setNewSegmentText("")
            setNewSegmentStart("")
            setNewSegmentEnd("")
            setNewSongSpotifyId("")
            setNewSongCoverUrl("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsAdding(false)
        }
    }

    const handleEditClick = (song: any) => {
        setEditingSong(song)
        setEditSongTitle(song.title)
        setEditSongArtist(song.artist)
        setEditSongUrl(song.audioUrl)
        setEditSongCoverUrl(song.coverUrl || "")

        // Get first segment for editing
        if (song.segments.length > 0) {
            const segment = song.segments[0]
            setEditingSegment(segment)
            setEditSegmentText(segment.text)
            setEditSegmentStart(segment.startTime.toString())
            setEditSegmentEnd(segment.endTime.toString())
        }

        setIsEditSongOpen(true)
    }

    const handleUpdateSong = async () => {
        if (!editingSong) return

        setIsEditing(true)
        try {
            // Update song details
            await updateSong(editingSong.id, lyricist.id, {
                title: editSongTitle,
                artist: editSongArtist,
                audioUrl: editSongUrl,
                coverUrl: editSongCoverUrl,
            })

            // Update segment if exists
            if (editingSegment) {
                await updateSegment(editingSegment.id, lyricist.id, {
                    text: editSegmentText,
                    startTime: Number(editSegmentStart),
                    endTime: Number(editSegmentEnd),
                })
            }

            setIsEditSongOpen(false)
            setEditingSong(null)
            setEditingSegment(null)
        } catch (error) {
            console.error(error)
        } finally {
            setIsEditing(false)
        }
    }

    return (
        <main className="container mx-auto p-8 max-w-4xl pb-32">
            <div className="mb-8 flex justify-between items-center">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditLyricistOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Lyricist
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteLyricistOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">{lyricist.name}</h1>
                    <p className="text-muted-foreground mt-2">
                        {lyricist.description}
                    </p>
                </div>
                <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Song
                        </Button>
                    </DialogTrigger>
                    {/* ... Add Song Dialog Content ... */}
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Song</DialogTitle>
                            <DialogDescription>
                                Search for a song on Spotify or enter details manually.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <SpotifySearch onSelect={handleSpotifySelect} />

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or enter details
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={newSongTitle}
                                    onChange={(e) => setNewSongTitle(e.target.value)}
                                    placeholder="Song Title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="artist">Artist</Label>
                                <Input
                                    id="artist"
                                    value={newSongArtist}
                                    onChange={(e) => setNewSongArtist(e.target.value)}
                                    placeholder="Artist Name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Audio URL</Label>
                                <Input
                                    id="url"
                                    value={newSongUrl}
                                    onChange={(e) => setNewSongUrl(e.target.value)}
                                    placeholder="https://example.com/song.mp3"
                                />
                            </div>
                            <div className="border-t pt-4 mt-2">
                                <h4 className="text-sm font-medium mb-3">Lyric Segment</h4>
                                <div className="grid gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="segment-text">Lyrics</Label>
                                        <Textarea
                                            id="segment-text"
                                            value={newSegmentText}
                                            onChange={(e) => setNewSegmentText(e.target.value)}
                                            placeholder="The lyrics to match..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="start">Start (sec)</Label>
                                            <Input
                                                id="start"
                                                type="number"
                                                value={newSegmentStart}
                                                onChange={(e) => setNewSegmentStart(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end">End (sec)</Label>
                                            <Input
                                                id="end"
                                                type="number"
                                                value={newSegmentEnd}
                                                onChange={(e) => setNewSegmentEnd(e.target.value)}
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddSong} disabled={isAdding}>
                                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Song
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* ... Songs Grid ... */}
            <div className="grid gap-4">
                {songs.map((song: any) => (
                    <Card key={song.id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    {song.coverUrl && (
                                        <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-semibold">{song.title}</h3>
                                        <p className="text-muted-foreground">{song.artist}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditClick(song)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                            <div className="mt-4 space-y-2">
                                {song.segments.map((segment: any) => (
                                    <div
                                        key={segment.id}
                                        className="bg-muted/50 p-3 rounded-md text-sm italic border-l-4 border-primary flex justify-between items-center group"
                                    >
                                        <div>
                                            "{segment.text}"
                                            <div className="text-xs text-muted-foreground mt-1 not-italic">
                                                {segment.startTime}s - {segment.endTime}s
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handlePlay(song, segment)}
                                        >
                                            {currentSegment?.id === segment.id && isPlaying ? (
                                                <Pause className="h-4 w-4" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {songs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                        No songs yet. Add one to get started!
                    </div>
                )}
            </div>

            {/* Edit Song Dialog */}
            <Dialog open={isEditSongOpen} onOpenChange={setIsEditSongOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Song</DialogTitle>
                        <DialogDescription>
                            Update song details and lyric segment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editSongTitle}
                                onChange={(e) => setEditSongTitle(e.target.value)}
                                placeholder="Song Title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-artist">Artist</Label>
                            <Input
                                id="edit-artist"
                                value={editSongArtist}
                                onChange={(e) => setEditSongArtist(e.target.value)}
                                placeholder="Artist Name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-url">Audio URL</Label>
                            <Input
                                id="edit-url"
                                value={editSongUrl}
                                onChange={(e) => setEditSongUrl(e.target.value)}
                                placeholder="https://example.com/song.mp3"
                            />
                        </div>
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-3">Lyric Segment</h4>
                            <div className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-segment-text">Lyrics</Label>
                                    <Textarea
                                        id="edit-segment-text"
                                        value={editSegmentText}
                                        onChange={(e) => setEditSegmentText(e.target.value)}
                                        placeholder="The lyrics to match..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-start">Start (sec)</Label>
                                        <Input
                                            id="edit-start"
                                            type="number"
                                            value={editSegmentStart}
                                            onChange={(e) => setEditSegmentStart(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-end">End (sec)</Label>
                                        <Input
                                            id="edit-end"
                                            type="number"
                                            value={editSegmentEnd}
                                            onChange={(e) => setEditSegmentEnd(e.target.value)}
                                            placeholder="10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdateSong} disabled={isEditing}>
                            {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Lyricist Dialog */}
            <Dialog open={isEditLyricistOpen} onOpenChange={setIsEditLyricistOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Lyricist</DialogTitle>
                        <DialogDescription>Update the name and description of this collection.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="lyricist-name">Name</Label>
                            <Input
                                id="lyricist-name"
                                value={editLyricistName}
                                onChange={(e) => setEditLyricistName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lyricist-desc">Description</Label>
                            <Textarea
                                id="lyricist-desc"
                                value={editLyricistDescription}
                                onChange={(e) => setEditLyricistDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdateLyricist} disabled={isUpdatingLyricist}>
                            {isUpdatingLyricist && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Lyricist Confirmation */}
            <Dialog open={isDeleteLyricistOpen} onOpenChange={setIsDeleteLyricistOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Lyricist</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{lyricist.name}"? This action cannot be undone and will delete all songs in this collection.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteLyricistOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteLyricist} disabled={isDeletingLyricist}>
                            {isDeletingLyricist && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {currentSong && currentSegment && (
                <>
                    {currentSong.spotifyId ? (
                        <SpotifyPlayer
                            trackUri={`spotify:track:${currentSong.spotifyId}`}
                            startTime={currentSegment.startTime}
                            endTime={currentSegment.endTime}
                            isPlaying={isPlaying}
                            onPlayPause={() => setIsPlaying(!isPlaying)}
                            onEnded={() => setIsPlaying(false)}
                        />
                    ) : (
                        <AudioPlayer
                            url={currentSong.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
                            startTime={currentSegment.startTime}
                            endTime={currentSegment.endTime}
                            isPlaying={isPlaying}
                            onPlayPause={() => setIsPlaying(!isPlaying)}
                            onEnded={() => setIsPlaying(false)}
                        />
                    )}
                </>
            )}
        </main>
    )
}
