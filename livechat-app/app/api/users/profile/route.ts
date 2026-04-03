import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth"; // Wichtig für die Session-Prüfung

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
    }

    // 1. Den User aus der DB holen
    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        image: true,
        image1: true,
        image2: true,
        image3: true,
        song1: true,
        song2: true,
        song3: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
    }

    // 2. Standard-Status: Falls nicht eingeloggt oder keine Beziehung
    let friendshipStatus = "NONE";

    // 3. Freundschafts-Status zwischen Betrachter und Profil-Besitzer prüfen
    if (session?.user?.id) {
      const currentUserId = session.user.id;

      const friendship = await db.friendship.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: currentUserId }
          ]
        }
      });

      if (friendship) {
        friendshipStatus = friendship.status; // "PENDING" oder "ACCEPTED"
      }
    }

    // 4. Daten zusammenführen
    return NextResponse.json({
      ...user,
      friendshipStatus // Das Frontend braucht dieses Feld!
    });

  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }
}