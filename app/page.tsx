import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

import { getLyricists } from "./actions";

// ... imports

export default async function Home() {
  const lyricists = await getLyricists();

  return (
    <main className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Lyricists</h1>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Lyricist
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {lyricists.map((lyricist) => (
          <Link key={lyricist.id} href={`/lyricist/${lyricist.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>{lyricist.name}</CardTitle>
                <CardDescription>{lyricist.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{lyricist._count.songs} songs</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {lyricists.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            No lyricists found. <Link href="/create" className="text-primary hover:underline">Create one</Link> to get started!
          </div>
        )}
      </div>
    </main>
  );
}
