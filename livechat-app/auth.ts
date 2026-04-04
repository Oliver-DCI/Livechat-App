import NextAuth, { type DefaultSession, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Optional: Erweitere den Session-Typ für TS-Support ohne 'any'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isAdmin: boolean;
    } & DefaultSession["user"]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        // WICHTIG: Falls user null ist oder kein Passwort hat
        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        // Wir geben das Objekt zurück und stellen sicher, 
        // dass die ID als String vorliegt (wichtig bei MongoDB)
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
        } as User; // Hier zwingen wir TS, das als validen User zu akzeptieren
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Beim ersten Login 'user' Daten ins Token schreiben
      if (user) {
        // Wir holen die Rollen-Daten frisch aus der DB
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true, isAdmin: true }
        });
        
        if (dbUser) {
          token.id = user.id;
          token.role = dbUser.role;
          token.isAdmin = dbUser.isAdmin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Daten vom Token in die Session schieben
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await db.user.update({
          where: { id: user.id },
          data: { isOnline: true, lastSeen: new Date() },
        });
      }
    },
  },
  session: { strategy: "jwt" },
});