import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

// Wir sagen TypeScript: "Hey, das User-Objekt hat jetzt zusätzlich 'role'"
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole; // Hier definieren wir das Feld
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
  }
}