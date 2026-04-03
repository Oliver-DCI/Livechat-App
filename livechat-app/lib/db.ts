import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Wir erstellen EINE einzige Instanz für die gesamte App
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Hier kombinieren wir deine Wünsche: Query-Logs im Dev-Modus
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// WICHTIGSTER TEIL:
// Wir exportieren 'db' auch unter dem Namen 'prisma'.
// Dadurch musst du in deinen anderen Dateien NICHTS am Code ändern, 
// außer den Pfad beim Import anzupassen.
export const prisma = db;