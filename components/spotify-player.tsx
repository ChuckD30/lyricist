"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

interface SpotifyPlayerProps {
    trackUri: string
    startTime: number
    endTime: number
    isPlaying: boolean
    onPlayPause: () => void
    onEnded: () => void
}

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void
        Spotify: any
    }
}

export function SpotifyPlayer({
    trackUri,
    startTime,
    endTime,
    isPlaying,
    onPlayPause,
    onEnded,
}: SpotifyPlayerProps) {
    const { data: session } = useSession()
    const [player, setPlayer] = useState<any>(null)
    const [deviceId, setDeviceId] = useState<string>("")
    const [isReady, setIsReady] = useState(false)
    const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Load Spotify Web Playback SDK
    useEffect(() => {
        if (!session?.accessToken) return

        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        script.async = true
        document.body.appendChild(script)

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: "Lyricist Web Player",
                getOAuthToken: (cb: (token: string) => void) => {
                    cb(session.accessToken as string)
                },
                volume: 0.5,
            })

            spotifyPlayer.addListener("ready", ({ device_id }: any) => {
                console.log("Ready with Device ID", device_id)
                setDeviceId(device_id)
                setIsReady(true)
            })

            spotifyPlayer.addListener("not_ready", ({ device_id }: any) => {
                console.log("Device ID has gone offline", device_id)
                setIsReady(false)
            })

            spotifyPlayer.addListener("player_state_changed", (state: any) => {
                if (!state) return
                console.log("Player state changed", state)
            })

            spotifyPlayer.connect()
            setPlayer(spotifyPlayer)
        }

        return () => {
            if (player) {
                player.disconnect()
            }
        }
    }, [session])

    // Handle playback control
    useEffect(() => {
        if (!player || !deviceId || !isReady || !trackUri) return

        const playSegment = async () => {
            try {
                // Transfer playback to this device and start playing
                await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        uris: [trackUri],
                        position_ms: startTime * 1000,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                })

                // Monitor position and stop at end time
                if (monitorIntervalRef.current) {
                    clearInterval(monitorIntervalRef.current)
                }

                monitorIntervalRef.current = setInterval(async () => {
                    const state = await player.getCurrentState()
                    if (state && state.position >= endTime * 1000) {
                        player.pause()
                        onEnded()
                        if (monitorIntervalRef.current) {
                            clearInterval(monitorIntervalRef.current)
                        }
                    }
                }, 100)
            } catch (error) {
                console.error("Error playing segment:", error)
            }
        }

        if (isPlaying) {
            playSegment()
        } else {
            player.pause()
            if (monitorIntervalRef.current) {
                clearInterval(monitorIntervalRef.current)
            }
        }

        return () => {
            if (monitorIntervalRef.current) {
                clearInterval(monitorIntervalRef.current)
            }
        }
    }, [isPlaying, trackUri, startTime, endTime, player, deviceId, isReady, session])

    if (!session) {
        return null
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
            <div className="container mx-auto max-w-4xl">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {isReady ? "Spotify Player Ready" : "Connecting to Spotify..."}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Segment: {startTime}s - {endTime}s
                    </div>
                </div>
            </div>
        </div>
    )
}
