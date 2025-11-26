"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"

export function Navbar() {
    const { data: session } = useSession()

    return (
        <header className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-2xl font-bold tracking-tight hover:text-primary transition-colors">
                    Lyricist
                </Link>
                {session ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{session.user?.name}</span>
                        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => signIn("spotify")}>Sign In</Button>
                )}
            </div>
        </header>
    )
}
