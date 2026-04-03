import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // 1. Auth-Check (In v5 ist session.user.id durch deine Callbacks verfügbar)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { receiverId } = await req.json();
    const currentUserId = session.user.id;

    // 2. Selbst-Anfrage verhindern
    if (currentUserId === receiverId) {
      return NextResponse.json({ error: "Du kannst dir selbst keine Anfrage schicken" }, { status: 400 });
    }

    // 3. Bestehende Verbindung prüfen (KORRIGIERTE LOGIK)
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          // Fall 1: Ich habe schon angefragt
          { senderId: currentUserId, receiverId: receiverId },
          // Fall 2: Die andere Person hat mich schon angefragt (Hier war dein Fehler)
          { senderId: receiverId, receiverId: currentUserId }
        ]
      }
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: "Anfrage existiert bereits oder ihr seid schon Freunde" }, 
        { status: 400 }
      );
    }

    // 4. Eintrag erstellen
    const request = await db.friendship.create({
      data: {
        senderId: currentUserId,
        receiverId: receiverId,
        status: "PENDING"
      }
    });

    return NextResponse.json(request);
  } catch (error) {
    // Gutes Logging für das Debugging in der Konsole
    console.error("[FRIEND_REQUEST_POST]", error);
    return NextResponse.json({ error: "Interner Server-Fehler" }, { status: 500 });
  }
}