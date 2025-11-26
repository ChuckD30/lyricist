import { getLyricist } from "@/app/actions"
import { notFound } from "next/navigation"
import LyricistClient from "./client"

export default async function LyricistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const lyricist = await getLyricist(id)

    if (!lyricist) {
        notFound()
    }

    return <LyricistClient lyricist={lyricist} />
}
