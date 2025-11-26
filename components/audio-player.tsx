"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"

interface AudioPlayerProps {
    url: string
    startTime: number
    endTime: number
    isPlaying: boolean
    onPlayPause: () => void
    onEnded: () => void
}

export function AudioPlayer({
    url,
    startTime,
    endTime,
    isPlaying,
    onPlayPause,
    onEnded,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [currentTime, setCurrentTime] = useState(startTime)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)

    // Handle play/pause and time updates
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            if (audio.paused) {
                audio.currentTime = currentTime >= endTime ? startTime : currentTime
                audio.play().catch((e) => console.error("Playback failed:", e))
            }
        } else {
            audio.pause()
        }
    }, [isPlaying, url]) // Re-run if URL changes

    // Enforce segment boundaries
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime)
            if (audio.currentTime >= endTime) {
                audio.pause()
                audio.currentTime = startTime
                onEnded()
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate)
        return () => audio.removeEventListener("timeupdate", handleTimeUpdate)
    }, [endTime, startTime, onEnded])

    // Handle URL changes
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        // Reset when URL changes
        audio.currentTime = startTime
        setCurrentTime(startTime)
    }, [url, startTime])

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0]
        if (audioRef.current) {
            audioRef.current.volume = newVolume
            setVolume(newVolume)
        }
    }

    const handleSeek = (value: number[]) => {
        const newTime = value[0]
        if (audioRef.current) {
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
            <audio ref={audioRef} src={url} />
            <div className="container mx-auto max-w-4xl flex items-center gap-4">
                <Button size="icon" onClick={onPlayPause}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(endTime)}</span>
                    </div>
                    <Slider
                        value={[currentTime]}
                        min={startTime}
                        max={endTime}
                        step={0.1}
                        onValueChange={handleSeek}
                    />
                </div>

                <div className="flex items-center gap-2 w-32">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                    />
                </div>
            </div>
        </div>
    )
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
}
