import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
    }

    // 1. Den User mit allen neuen Feldern, Posts und Freundschaften holen
    const user = await db.user.findUnique({
      where: { id: targetUserId },
      include: {
        // Posts für die linke Spalte (Historie)
        posts: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        // Wir holen alle Freundschaften, um die Liste rechts zu füllen
        sentRequests: {
          where: { status: "ACCEPTED" },
          include: { receiver: { select: { id: true, name: true, image: true, isOnline: true } } }
        },
        receivedRequests: {
          where: { status: "ACCEPTED" },
          include: { sender: { select: { id: true, name: true, image: true, isOnline: true } } }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
    }

    // 2. Freunde aus beiden Richtungen (Sender/Receiver) zusammenführen
    const friendsList = [
      ...user.sentRequests.map(f => f.receiver),
      ...user.receivedRequests.map(f => f.sender)
    ];

    // 3. Freundschafts-Status für den Betrachter prüfen
    let friendshipStatus = "NONE";
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
      if (friendship) friendshipStatus = friendship.status;
    }

    // 4. Sauberes Response-Objekt zusammenbauen
    const responseData = {
      id: user.id,
      name: user.name,
      image: user.image,
      // Alle 4 Slots mitschicken
      image1: user.image1,
      image2: user.image2,
      image3: user.image3,
      image4: user.image4, 
      song1: user.song1,
      song2: user.song2,
      song3: user.song3,
      song4: user.song4,
      createdAt: user.createdAt,
      friendshipStatus,
      posts: user.posts, // Geht in die linke Spalte
      friends: friendsList // Geht in die rechte Spalte
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }
}