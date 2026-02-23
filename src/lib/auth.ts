import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { verifyPassword, createGoogleUser } from "@/lib/users"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for production deployment
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  basePath: '/api/auth',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        //Just check is uer exists
        const user = await verifyPassword(
          credentials.email as string,
          credentials.password as string
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        }

        return null
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          const googleUser = await createGoogleUser({
            email: profile.email!,
            name: profile.name!,
            picture: profile.picture,
          })
          
          // Check if the Google user is banned
          if (googleUser.status === 'banned') {
            return false;
          }
          
          // Update user object with data from database
          user.id = googleUser.id
          user.role = googleUser.role  // This is important!
          user.name = googleUser.name
          user.image = googleUser.image
          
          return true
        } catch (error) {
          console.error("Error creating Google user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // First sign-in: user object is present — seed the token directly from
      // the authorize() / signIn() result, no extra DB call needed.
      if (user) {
        token.id = user.id!
        token.role = user.role!
        // Persist the OAuth provider so we can surface it in the session
        if (account?.provider) {
          token.provider = account.provider as 'credentials' | 'google'
        }
        return token
      }

      // Subsequent requests: token already exists.
      // Sync role from DB, but only once every 5 minutes to avoid hammering
      // the database on every request.
      const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
      const lastSync = (token.lastRoleSync as number) ?? 0
      const now = Date.now()

      if (token.id && now - lastSync > SYNC_INTERVAL_MS) {
        try {
          const { findUserById } = await import("@/lib/users")
          const dbUser = await findUserById(token.id as string)
          if (dbUser) {
            token.role = dbUser.role
            token.name = dbUser.name
            token.email = dbUser.email
            token.picture = dbUser.image
          }
          token.lastRoleSync = now
        } catch (error) {
          console.error("Error syncing user data in JWT callback:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.provider) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(session.user as any).provider = token.provider
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // Add debug logging
  debug: process.env.NODE_ENV === "development",
})
