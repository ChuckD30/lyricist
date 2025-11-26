"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createLyricist(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
        throw new Error("Name is required")
    }

    const lyricist = await prisma.lyricist.create({
        data: {
            name,
            description,
        },
    })

    redirect(`/lyricist/${lyricist.id}`)
}

export async function getLyricists() {
    return await prisma.lyricist.findMany({
        include: {
            _count: {
                select: { songs: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })
}

export async function getLyricist(id: string) {
    return await prisma.lyricist.findUnique({
        where: { id },
        include: {
            songs: {
                include: {
                    segments: true,
                },
            },
        },
    })
}

export async function addSong(lyricistId: string, songData: any) {
    await prisma.song.create({
        data: {
            title: songData.title,
            artist: songData.artist,
            audioUrl: songData.audioUrl,
            coverUrl: songData.coverUrl,
            spotifyId: songData.spotifyId,
            lyricistId: lyricistId,
            segments: {
                create: songData.segments,
            },
        },
    })

    revalidatePath(`/lyricist/${lyricistId}`)
}

export async function updateSong(songId: string, lyricistId: string, songData: any) {
    await prisma.song.update({
        where: { id: songId },
        data: {
            title: songData.title,
            artist: songData.artist,
            audioUrl: songData.audioUrl,
            coverUrl: songData.coverUrl,
        },
    })

    revalidatePath(`/lyricist/${lyricistId}`)
}

export async function updateSegment(segmentId: string, lyricistId: string, segmentData: any) {
    await prisma.segment.update({
        where: { id: segmentId },
        data: {
            text: segmentData.text,
            startTime: segmentData.startTime,
            endTime: segmentData.endTime,
        },
    })

    revalidatePath(`/lyricist/${lyricistId}`)
}
