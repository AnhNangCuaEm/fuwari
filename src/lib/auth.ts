import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { verifyPassword, createGoogleUser } from "@/lib/users"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for production deployment
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
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id!
        token.role = user.role!
      }
      
      // For Google OAuth or when token needs refresh, get the latest user data from database
      if ((account?.provider === "google" || trigger === "update") && token.id) {
        try {
          const { findUserById } = await import("@/lib/users")
          const dbUser = await findUserById(token.id as string)
          if (dbUser) {
            token.role = dbUser.role // Always sync role from database
            token.name = dbUser.name
            token.email = dbUser.email
            token.picture = dbUser.image
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
})
