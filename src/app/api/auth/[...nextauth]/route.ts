import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "username", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const client = await db.connect();
        try {
          const result = await client.query(
            "SELECT * FROM users WHERE username = $1",
            [credentials.username],
          );
          const user = result.rows[0];

          if (
            user &&
            (await bcrypt.compare(credentials.password, user.password))
          ) {
            return { id: user.id, name: user.username, email: user.email };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        } finally {
          client.release();
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error -- The user object is extended in the jwt callback
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
