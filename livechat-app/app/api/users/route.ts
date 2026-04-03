import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Importiere die 'auth' Funktion aus deinem Setup
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // In v5 nutzt du einfach auth() um die Session zu bekommen
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Nicht autorisiert" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;

    // 1. Alle anderen User laden
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        name: true,
        image: true,
        isOnline: true,
      },
    });

    // 2. Bestehende Freundschaften laden
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
    });

    // 3. Status berechnen
    const usersWithStatus = allUsers.map((user) => {
      const relationship = friendships.find(
        (f) => (f.senderId === currentUserId && f.receiverId === user.id) || 
               (f.senderId === user.id && f.receiverId === currentUserId)
      );

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        isOnline: user.isOnline,
        status: relationship ? relationship.status : "NONE", 
      };
    });

    return NextResponse.json(usersWithStatus);
  } catch (error) {
    console.error("Fehler in /api/users:", error);
    return NextResponse.json({ message: "Serverfehler" }, { status: 500 });
  }
}