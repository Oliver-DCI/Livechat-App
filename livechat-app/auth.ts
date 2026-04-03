import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Eingabe-Check
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. User in DB suchen
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        // 3. Sicherheits-Check: Existiert der User und hat er ein Passwort?
        if (!user || !user.password) {
          console.log("AUTH-INFO: Login abgelehnt - User nicht gefunden.");
          return null; 
        }

        // 4. Passwort-Vergleich
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) {
          console.log("AUTH-INFO: Login abgelehnt - Passwort falsch.");
          return null;
        }

        // 5. Erfolg: Daten für Session bereitstellen
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin
        };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await db.user.update({
          where: { id: user.id },
          data: { isOnline: true },
        });
      }
    },
    async signOut(message: any) {
      const token = message.token;
      if (token?.sub) {
        await db.user.update({
          where: { id: token.sub },
          data: { isOnline: false },
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});