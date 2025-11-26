import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
        user: {
            name?: string | null
            email?: string | null
            image?: string | null
        } & DefaultSession["user"]
    }
}
